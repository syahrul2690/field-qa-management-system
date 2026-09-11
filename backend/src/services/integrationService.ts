import { prisma } from '../config/database';
import { DocumentSection, ReviewStatus } from '@prisma/client';

const APPROVED_STATUSES: ReviewStatus[] = [
  ReviewStatus.APPROVED_A,
  ReviewStatus.APPROVED_WITH_COMMENTS_B,
];

export async function getProjects() {
  return prisma.project.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      project_type: true,
      urgency: true,
      created_at: true,
      boq_items: {
        where: { parent_item_id: null },
        orderBy: { sort_order: 'asc' },
        select: {
          id: true,
          item_code: true,
          title: true,
          level: true,
          children: {
            orderBy: { sort_order: 'asc' },
            select: {
              id: true,
              item_code: true,
              title: true,
              level: true,
              children: {
                orderBy: { sort_order: 'asc' },
                select: {
                  id: true,
                  item_code: true,
                  title: true,
                  level: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getQcReadiness(boqItemId: string) {
  const boqItem = await prisma.boqItem.findUnique({
    where: { id: boqItemId },
    select: { id: true, item_code: true, title: true },
  });

  if (!boqItem) return null;

  const sections: DocumentSection[] = [
    DocumentSection.FIELD_ITP,
    DocumentSection.PROCEDURE,
  ];

  const sectionStatuses = await Promise.all(
    sections.map(async (section) => {
      const docs = await prisma.document.findMany({
        where: {
          section,
          is_current: true,
          OR: [
            { boq_item_id: boqItemId },
            { boq_item_links: { some: { boq_item_id: boqItemId } } },
          ],
        },
        orderBy: { revision_no: 'desc' },
        select: {
          id: true,
          doc_number: true,
          revision_no: true,
          status: true,
          title: true,
        },
      });

      if (docs.length > 1) {
        return { section, status: null, ready: false, ambiguous: true, document: null };
      }
      const doc = docs[0];

      if (!doc) {
        return { section, status: null, ready: false, ambiguous: false, document: null };
      }

      const ready = APPROVED_STATUSES.includes(doc.status);
      return {
        section,
        status: doc.status,
        ready,
        ambiguous: false,
        document: {
          id: doc.id,
          doc_number: doc.doc_number,
          revision_no: doc.revision_no,
          title: doc.title,
        },
      };
    }),
  );

  const inspectionResults = await prisma.boqItemInspectionResult.findMany({
    where: { boq_item_id: boqItemId },
    orderBy: { updated_at: 'desc' },
    select: {
      id: true,
      inspection_report_id: true,
      revision_no: true,
      status: true,
      result: true,
      report_pdf_url: true,
      received_at: true,
      updated_at: true,
    },
  });
  const allReady = sectionStatuses.every((s) => s.ready);

  return {
    boq_item: boqItem,
    sections: sectionStatuses,
    ready: allReady,
    inspection_results: inspectionResults,
  };
}

export async function getDocumentWithItpItems(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      doc_number: true,
      title: true,
      section: true,
      revision_no: true,
      status: true,
      is_current: true,
      boq_item: {
        select: {
          id: true,
          item_code: true,
          title: true,
          project: {
            select: { id: true, name: true },
          },
        },
      },
      itp_items: {
        orderBy: { seq_no: 'asc' },
        select: {
          id: true,
          seq_no: true,
          activity: true,
          acceptance_criteria: true,
          reference_standard: true,
          verifying_document: true,
          sub_code: true,
          pp_code: true,
          pln_code: true,
          phase: true,
          category: true,
        },
      },
      boq_item_links: {
        select: { boq_item_id: true, boq_item: { select: { id: true, item_code: true, title: true } } },
      },
    },
  });

  if (!doc) return null;
  return {
    ...doc,
    boq_items: [doc.boq_item, ...doc.boq_item_links.map((link) => link.boq_item).filter((item) => item.id !== doc.boq_item.id)],
    itp_items: doc.itp_items.map((item) => ({ ...item, inspection_level: item.pln_code })),
  };
}

export async function writeBackInspectionResult(
  boqItemId: string,
  data: {
    inspection_report_id: string;
    revision_no?: number;
    status: string;
    result?: string;
    report_pdf_url?: string;
    payload?: unknown;
  },
) {
  const boqItem = await prisma.boqItem.findUnique({ where: { id: boqItemId }, select: { id: true } });
  if (!boqItem) return null;

  const payload = data.payload as { qaDocumentId?: string } | undefined;
  const coveredIds = new Set([boqItemId]);
  if (payload?.qaDocumentId) {
    const document = await prisma.document.findUnique({
      where: { id: payload.qaDocumentId },
      select: { boq_item_id: true, boq_item_links: { select: { boq_item_id: true } } },
    });
    if (document) {
      coveredIds.add(document.boq_item_id);
      document.boq_item_links.forEach((link) => coveredIds.add(link.boq_item_id));
    }
  }

  return prisma.$transaction(
    Array.from(coveredIds).map((coveredBoqItemId) => prisma.boqItemInspectionResult.upsert({
      where: {
        boq_item_id_inspection_report_id: {
          boq_item_id: coveredBoqItemId,
          inspection_report_id: data.inspection_report_id,
        },
      },
      create: {
        boq_item_id: coveredBoqItemId,
        inspection_report_id: data.inspection_report_id,
        revision_no: data.revision_no ?? null,
        status: data.status,
        result: data.result ?? null,
        report_pdf_url: data.report_pdf_url ?? null,
        payload: data.payload as object | undefined,
      },
      update: {
        revision_no: data.revision_no ?? null,
        status: data.status,
        result: data.result ?? null,
        report_pdf_url: data.report_pdf_url ?? null,
        payload: data.payload as object | undefined,
        received_at: new Date(),
      },
    })),
  );
}
