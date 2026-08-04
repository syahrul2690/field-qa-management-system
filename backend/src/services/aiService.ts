import OpenAI from 'openai';
import { prisma } from '../config/database';
import { config } from '../config';
import { extractTextFromPdf, readPdfAsBase64 } from './pdfExtractService';
import { getKnowledgeBaseSection } from './knowledgeBaseService';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProjectSummaryResult {
  generated_at: string;
  cached: boolean;
  model_used: string;
  summary: {
    overall_status: string;
    document_progress: {
      total: number;
      by_status: Record<string, number>;
      by_section: Record<
        string,
        { total: number; completed: number; in_progress: number }
      >;
      completion_percentage: number;
    };
    review_trends: string;
    sla_compliance: {
      on_time_percentage: number;
      overdue_count: number;
      avg_review_days: number;
      details: string;
    };
    outstanding_items: Array<{
      doc_number: string;
      title: string;
      issue: string;
      priority: string;
    }>;
    risk_areas: Array<{
      area: string;
      risk_level: string;
      description: string;
    }>;
    recommendations: string[];
  };
}

export interface DocumentAnalysisResult {
  generated_at: string;
  cached: boolean;
  model_used: string;
  analysis: {
    document_summary: string;
    key_findings: Array<{
      finding: string;
      page_ref: string;
      severity: string;
    }>;
    suggested_comments: Array<{
      comment: string;
      page_ref: string;
      category: string;
    }>;
    compliance_flags: Array<{
      flag: string;
      standard: string;
      status: string;
      details: string;
    }>;
    recommended_disposition: {
      disposition: string;
      reasoning: string;
      confidence: string;
    };
  };
}

// ─── Lazy OpenRouter client ────────────────────────────────────────────────

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!config.ai.enabled || !config.ai.openRouterKey) return null;
  if (!client) {
    client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: config.ai.openRouterKey,
      defaultHeaders: {
        'HTTP-Referer': config.baseUrl,
        'X-Title': 'PLN Field QA Management System',
      },
    });
  }
  return client;
}

// ─── JSON extraction helper ───────────────────────────────────────────────
// Models like qwen3 may wrap output in ```json blocks or include thinking
// tokens. This strips all of that and returns the raw JSON object string.

function extractJson(raw: string): string {
  if (!raw) return '';

  // 1. Strip <think>...</think> blocks (qwen3 thinking tokens)
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // 3. Find the outermost JSON object (first { ... last })
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

// ─── Shared AI call helper ────────────────────────────────────────────────

async function callAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ content: string; usage: number } | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.chat.completions.create({
      model: config.ai.model,
      max_tokens: config.ai.maxTokens,
      stream: false,
      // NOTE: response_format json_object is NOT supported by all models
      // (e.g. qwen3 thinking models). We handle extraction manually instead.
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);

    const raw = (response as OpenAI.Chat.ChatCompletion).choices?.[0]?.message?.content ?? '';
    const content = extractJson(raw);
    const usage = (response as OpenAI.Chat.ChatCompletion).usage?.total_tokens ?? 0;

    console.log('[aiService] Raw response length:', raw.length, '| Extracted JSON length:', content.length);

    return { content, usage };
  } catch (err) {
    console.error('[aiService] OpenRouter API error:', err);
    return null;
  }
}

// ─── Vision AI call helper (scanned PDFs) ─────────────────────────────────

async function callAIWithPdf(
  systemPrompt: string,
  userText: string,
  pdfBase64: string,
): Promise<{ content: string; usage: number } | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.chat.completions.create({
      model: config.ai.visionModel,
      max_tokens: config.ai.maxTokens,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:application/pdf;base64,${pdfBase64}` },
            },
            { type: 'text', text: userText },
          ],
        },
      ],
    } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);

    const raw = (response as OpenAI.Chat.ChatCompletion).choices?.[0]?.message?.content ?? '';
    const content = extractJson(raw);
    const usage = (response as OpenAI.Chat.ChatCompletion).usage?.total_tokens ?? 0;

    console.log('[aiService] Vision response length:', raw.length, '| Extracted JSON length:', content.length);

    return { content, usage };
  } catch (err) {
    console.error('[aiService] Vision API error:', err);
    return null;
  }
}

// ─── Project Summary ──────────────────────────────────────────────────────

const PROJECT_SYSTEM_PROMPT = `You are a QA engineering assistant specializing in Indonesian power infrastructure construction projects (PLN standards: SPLN, SNI, IEC).

You will receive structured data about a project's documents, reviews, SLA compliance, and amendments.

Analyze the data and produce a JSON summary with this exact structure:
{
  "overall_status": "brief one-line status of the project",
  "document_progress": {
    "total": <number>,
    "by_status": { "DRAFT": <n>, "SUBMITTED": <n>, "IN_REVIEW": <n>, "APPROVED_A": <n>, "APPROVED_WITH_COMMENTS_B": <n>, "REJECTED_C": <n> },
    "by_section": {
      "FIELD_ITP": { "total": <n>, "completed": <n>, "in_progress": <n> },
      "PROCEDURE": { "total": <n>, "completed": <n>, "in_progress": <n> },
      "WORK_METHOD": { "total": <n>, "completed": <n>, "in_progress": <n> }
    },
    "completion_percentage": <number>
  },
  "review_trends": "narrative about review patterns, common issues, speed",
  "sla_compliance": {
    "on_time_percentage": <number>,
    "overdue_count": <number>,
    "avg_review_days": <number>,
    "details": "narrative about SLA adherence"
  },
  "outstanding_items": [
    { "doc_number": "...", "title": "...", "issue": "...", "priority": "HIGH|MEDIUM|LOW" }
  ],
  "risk_areas": [
    { "area": "...", "risk_level": "HIGH|MEDIUM|LOW", "description": "..." }
  ],
  "recommendations": ["actionable recommendation 1", "..."]
}

Be concise and actionable. Focus on what needs attention. Use Indonesian technical terms where appropriate.`;

export async function generateProjectSummary(
  projectId: string,
  forceRefresh = false,
): Promise<ProjectSummaryResult | null> {
  if (!getClient()) return null;

  // Check cache (1-hour TTL)
  if (!forceRefresh) {
    const cached = await prisma.aiProjectSummary.findUnique({
      where: { project_id: projectId },
    });
    if (cached && cached.expires_at > new Date()) {
      return {
        generated_at: cached.generated_at.toISOString(),
        cached: true,
        model_used: cached.model_used,
        summary: cached.summary as ProjectSummaryResult['summary'],
      };
    }
  }

  // Gather project data
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner_unit: { include: { institution: true } },
      boq_items: {
        include: {
          documents: {
            where: { is_current: true },
            include: {
              reviews: {
                orderBy: { created_at: 'desc' },
                take: 1,
                include: { comments: true },
              },
            },
          },
        },
      },
      amendments: { orderBy: { amendment_no: 'asc' } },
    },
  });

  if (!project) return null;

  // Flatten documents
  const allDocs = project.boq_items.flatMap((b) => b.documents);

  // Compute stats
  const statusCounts: Record<string, number> = {};
  const sectionStats: Record<string, { total: number; completed: number; in_progress: number }> = {
    FIELD_ITP: { total: 0, completed: 0, in_progress: 0 },
    PROCEDURE: { total: 0, completed: 0, in_progress: 0 },
    WORK_METHOD: { total: 0, completed: 0, in_progress: 0 },
  };

  for (const doc of allDocs) {
    statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;
    const sec = sectionStats[doc.section];
    if (sec) {
      sec.total++;
      if (doc.status === 'APPROVED_A') sec.completed++;
      else if (['SUBMITTED', 'IN_REVIEW'].includes(doc.status)) sec.in_progress++;
    }
  }

  // SLA data
  const activeReviews = allDocs
    .flatMap((d) => d.reviews)
    .filter((r) => r.sla_deadline);

  const now = new Date();
  const overdue = activeReviews.filter(
    (r) => r.sla_deadline && r.sla_deadline < now && !r.approved_at,
  );

  const completedReviews = activeReviews.filter((r) => r.approved_at);
  const avgDays =
    completedReviews.length > 0
      ? completedReviews.reduce((sum, r) => {
          const start = r.created_at.getTime();
          const end = (r.approved_at as Date).getTime();
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completedReviews.length
      : 0;

  const onTimeCount = completedReviews.filter(
    (r) => r.sla_deadline && (r.approved_at as Date) <= r.sla_deadline,
  ).length;

  // Outstanding items (overdue or rejected)
  const outstanding = allDocs
    .filter((d) => {
      const review = d.reviews[0];
      if (!review) return false;
      const isOverdue = review.sla_deadline && review.sla_deadline < now && !review.approved_at;
      const isRejected = d.status === 'REJECTED_C';
      return isOverdue || isRejected;
    })
    .map((d) => ({
      doc_number: d.doc_number,
      title: d.title,
      status: d.status,
      section: d.section,
      sla_deadline: d.reviews[0]?.sla_deadline?.toISOString(),
    }));

  const userPrompt = JSON.stringify(
    {
      project_name: project.name,
      project_type: project.project_type,
      urgency: project.urgency,
      duration_days: project.duration_days,
      contract_effective_date: project.contract_effective_date.toISOString(),
      total_documents: allDocs.length,
      status_counts: statusCounts,
      section_stats: sectionStats,
      overdue_count: overdue.length,
      avg_review_days: Math.round(avgDays * 10) / 10,
      on_time_percentage:
        completedReviews.length > 0
          ? Math.round((onTimeCount / completedReviews.length) * 100)
          : 100,
      outstanding_items: outstanding,
      amendment_count: project.amendments.length,
      total_boq_items: project.boq_items.length,
    },
    null,
    2,
  );

  const systemPrompt = PROJECT_SYSTEM_PROMPT + getKnowledgeBaseSection();
  const result = await callAI(systemPrompt, userPrompt);
  if (!result) return null;

  try {
    const summary = JSON.parse(result.content);
    const generatedAt = new Date();

    // Upsert cache
    await prisma.aiProjectSummary.upsert({
      where: { project_id: projectId },
      create: {
        project_id: projectId,
        summary,
        model_used: config.ai.model,
        generated_at: generatedAt,
        expires_at: new Date(generatedAt.getTime() + 60 * 60 * 1000), // 1 hour
        token_usage: result.usage,
      },
      update: {
        summary,
        model_used: config.ai.model,
        generated_at: generatedAt,
        expires_at: new Date(generatedAt.getTime() + 60 * 60 * 1000),
        token_usage: result.usage,
      },
    });

    return {
      generated_at: generatedAt.toISOString(),
      cached: false,
      model_used: config.ai.model,
      summary,
    };
  } catch (err) {
    console.error('[aiService] Failed to parse project summary response:', err);
    return null;
  }
}

// ─── Document Analysis ────────────────────────────────────────────────────

const DOCUMENT_SYSTEM_PROMPT = `You are a QA document reviewer specializing in Indonesian power infrastructure construction projects (PLN standards: SPLN, SNI, IEC).

You will receive extracted text from a construction QA document along with its metadata (section type, document title, project context).

Analyze the document and produce a JSON analysis with this exact structure:
{
  "document_summary": "2-3 paragraph summary of the document's key content and purpose",
  "key_findings": [
    { "finding": "description of finding", "page_ref": "Page X, Section Y.Z", "severity": "HIGH|MEDIUM|LOW" }
  ],
  "suggested_comments": [
    { "comment": "specific review comment to raise", "page_ref": "Page X", "category": "COMPLETENESS|ACCURACY|COMPLIANCE|FORMAT" }
  ],
  "compliance_flags": [
    { "flag": "what was checked", "standard": "SPLN/SNI/IEC reference", "status": "PASS|FAIL|NEEDS_REVIEW", "details": "explanation" }
  ],
  "recommended_disposition": {
    "disposition": "A|B|C",
    "reasoning": "detailed justification for the recommended disposition",
    "confidence": "HIGH|MEDIUM|LOW"
  }
}

Disposition meanings:
- A (APPROVED): Document fully complies, no changes needed
- B (APPROVED WITH COMMENTS): Document is acceptable but needs revisions on specific items
- C (REJECTED): Document has significant issues requiring full resubmission

For suggested_comments, be specific and actionable. Reference page numbers from the text when possible.
For compliance_flags, check against relevant Indonesian and international standards for power infrastructure projects.

Respond in English. Use Indonesian technical terms where appropriate (e.g., "surat pengantar", "metode kerja").`;

export async function analyzeDocument(
  documentId: string,
): Promise<DocumentAnalysisResult | null> {
  if (!getClient()) return null;

  // Fetch document with files and context
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      files: true,
      boq_item: {
        include: {
          project: true,
        },
      },
      itp_items: { select: { category: true } },
    },
  });

  if (!document) return null;

  // Check cache (permanent per document + revision)
  const cached = await prisma.aiDocumentAnalysis.findUnique({
    where: {
      document_id_revision_no: {
        document_id: documentId,
        revision_no: document.revision_no,
      },
    },
  });

  if (cached) {
    return {
      generated_at: cached.generated_at.toISOString(),
      cached: true,
      model_used: cached.model_used,
      analysis: cached.analysis as DocumentAnalysisResult['analysis'],
    };
  }

  // Find PDF files
  const pdfFiles = document.files.filter(
    (f) => f.mime_type === 'application/pdf' || f.file_name.toLowerCase().endsWith('.pdf'),
  );

  if (pdfFiles.length === 0) {
    return null; // No PDFs to analyze
  }

  // Extract text from all PDF files, concatenate
  const textParts: string[] = [];
  for (const file of pdfFiles) {
    const text = await extractTextFromPdf(file.file_path);
    if (text) {
      textParts.push(`--- File: ${file.file_name} ---\n${text}`);
    }
  }

  const fullText = textParts.join('\n\n');

  const metadataJson = JSON.stringify(
    {
      document_title: document.title,
      document_number: document.doc_number,
      section: document.section,
      revision_no: document.revision_no,
      project_name: document.boq_item.project.name,
      project_type: document.boq_item.project.project_type,
      boq_item: document.boq_item.title,
      boq_system_tag: document.boq_item.system_tag,
    },
    null,
    2,
  );

  // Route to the relevant ITP domain files (see knowledgeBaseService) using
  // whatever text hints the document/BOQ context and its ITP items give us.
  const kbContext = {
    text: [document.title, document.boq_item.title, document.boq_item.system_tag, document.section]
      .filter(Boolean)
      .join(' '),
    categories: [...new Set(document.itp_items.map((i) => i.category))],
  };

  const systemPrompt = DOCUMENT_SYSTEM_PROMPT + getKnowledgeBaseSection(kbContext);
  let result: Awaited<ReturnType<typeof callAI>>;
  let usedVision = false;

  if (fullText.trim()) {
    // Text-based PDF: normal analysis
    const userPrompt = metadataJson + '\n\n--- DOCUMENT TEXT ---\n\n' + fullText;
    result = await callAI(systemPrompt, userPrompt);
  } else {
    // Scanned PDF: fall back to vision model using the primary PDF file
    console.log(`[aiService] No extractable text for document ${documentId}, trying vision model`);
    const pdfBase64 = readPdfAsBase64(pdfFiles[0].file_path);
    if (!pdfBase64) {
      return null; // PDF unreadable or too large
    }
    result = await callAIWithPdf(systemPrompt, metadataJson, pdfBase64);
    usedVision = true;
  }

  if (!result) return null;

  try {
    const analysis = JSON.parse(result.content);
    const generatedAt = new Date();
    const modelUsed = usedVision ? config.ai.visionModel : config.ai.model;

    // Store in cache
    await prisma.aiDocumentAnalysis.create({
      data: {
        document_id: documentId,
        revision_no: document.revision_no,
        analysis,
        model_used: modelUsed,
        generated_at: generatedAt,
        token_usage: result.usage,
      },
    });

    return {
      generated_at: generatedAt.toISOString(),
      cached: false,
      model_used: modelUsed,
      analysis,
    };
  } catch (err) {
    console.error('[aiService] Failed to parse document analysis response:', err);
    return null;
  }
}
