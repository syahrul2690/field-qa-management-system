import fs from 'fs';
import path from 'path';
import { config } from '../config';

/**
 * Directory where the ITP knowledge base .md files live. See config.knowledgeBase.dir
 * for how this resolves differently in local dev vs. the Docker production image.
 */
const KB_DIR = config.knowledgeBase.dir;

/**
 * Step 2 of Knowledge_Base/agent.md's reading protocol — files read for every
 * task regardless of domain. These establish the QA/QC framework everything
 * else is evaluated against.
 */
const CORE_FILES = [
  'INDEX_Batch_ITP_Knowledge_Base.md',
  'README_ITP_Wiki.md',
  '01_PMBOK_2025_Project_Management_Framework.md',
  '04_Project_Quality_Plan_Field.md',
  '02_Site_Quality_Plan_Mechanical_Electrical.md',
  '03_Site_Quality_Plan_Schedule_Rev3.md',
];

/**
 * Step 3 of the protocol — the task-type decision matrix, encoded as keyword
 * triggers per domain file. The full KB is ~728KB (~180k tokens) — too large to
 * send on every call, so only files whose keywords match the document/activity
 * text (or ITP category, as a fallback) are included alongside the core files.
 */
const DOMAIN_FILES: Array<{ file: string; keywords: string[] }> = [
  { file: '05_Civil_Works_ITP_Knowledge.md', keywords: ['civil', 'sipil', 'concrete', 'foundation', 'structural steel', 'earthwork'] },
  { file: '06_Mechanical_Fire_Fighting_ITP.md', keywords: ['fire fighting', 'fire suppression', 'sprinkler', 'deluge', 'co2 system', 'hydrant'] },
  { file: '07_Mechanical_WTP_ITP.md', keywords: ['water treatment', 'wtp', 'filtration', 'chemical dosing'] },
  { file: '08_Mechanical_WWTP_ITP.md', keywords: ['wastewater', 'wwtp', 'effluent'] },
  { file: '09_Mechanical_Rotating_Equipment_ITP.md', keywords: ['pump', 'compressor', 'rotating equipment', 'alignment', 'vibration'] },
  { file: '10_Mechanical_Fabricated_Tanks_ITP.md', keywords: ['tank', 'pressure vessel', 'api 650', 'asme viii', 'hydrostatic'] },
  { file: '11_Mechanical_HVAC_ITP.md', keywords: ['hvac', 'ventilation', 'air handling', 'ductwork', 'ashrae'] },
  { file: '12_Mechanical_Overhead_Crane_ITP.md', keywords: ['crane', 'hoist', 'lifting', 'asme b30'] },
  { file: '13_Piping_Duct_ITP.md', keywords: ['piping', 'duct', 'asme b31', 'smacna', 'flushing'] },
  { file: '14_Field_Installation_Functional_ITP_Mech_Elec.md', keywords: ['commissioning', 'functional test', 'field installation', 'soft-start', 'performance verification'] },
  { file: '15_Electrical_Power_Transformer_ITP.md', keywords: ['transformer', 'bushing', 'oil quality'] },
  { file: '16_Electrical_Cable_Systems_ITP.md', keywords: ['cable', 'termination', 'insulation resistance', 'continuity'] },
  { file: '17_Electrical_Earthing_Lightning_ITP.md', keywords: ['earthing', 'grounding', 'lightning protection', 'equipotential'] },
  { file: '18_Electrical_Busduct_Switchgear_ITP.md', keywords: ['busduct', 'switchgear', 'mcc', 'dielectric', 'protection relay'] },
  { file: '19_Electrical_Battery_UPS_Generator_ITP.md', keywords: ['battery', 'ups', 'vrla', 'emergency generator', 'load bank'] },
  { file: '20_Electrical_Lighting_Communication_CCTV_ITP.md', keywords: ['lighting', 'cctv', 'communication', 'pa system', 'fiber optic', 'intercom'] },
  { file: '21_HV_Switchyard_Equipment_ITP.md', keywords: ['switchyard', 'circuit breaker', 'disconnector', 'surge arrester', 'hv equipment'] },
  { file: '22_Wartsila_Gas_Engine_Generator_ITP.md', keywords: ['wartsila', 'gas engine', 'dual-fuel', 'load rejection'] },
  { file: '23_PLTU_Lombok_FTP2_Factory_Test_Program.md', keywords: ['steam turbine', 'ftp', 'factory test', 'thermal performance'] },
  { file: '24_Riau_Peaker_Field_ITP_Comment_Sheets.md', keywords: ['comment sheet', 'contractor response', 'ccr'] },
  { file: '25_PLTMG_Ambon_Field_Electrical_ITP.md', keywords: ['pltmg', 'power barge'] },
  { file: '26_Mandatory_Spare_Parts.md', keywords: ['spare part', 'mandatory spare', 'commissioning spare'] },
];

/**
 * Fallback domain files by ItpCategory, used when no keyword in the document
 * text matches — keeps the analysis grounded even for a bare/short document.
 */
const CATEGORY_FALLBACK: Record<string, string[]> = {
  SIPIL: ['05_Civil_Works_ITP_Knowledge.md'],
  ELEKTRIKAL: ['14_Field_Installation_Functional_ITP_Mech_Elec.md'],
  MEKANIKAL: ['14_Field_Installation_Functional_ITP_Mech_Elec.md'],
  INSTRUMEN_KONTROL: [
    '14_Field_Installation_Functional_ITP_Mech_Elec.md',
    '20_Electrical_Lighting_Communication_CCTV_ITP.md',
  ],
};

export interface KnowledgeBaseContext {
  /** Free text to scan for domain keywords — e.g. document title + BOQ item title + section */
  text?: string;
  /** ITP categories associated with the document, used as a fallback when no keyword matches */
  categories?: string[];
}

function readFileSafe(file: string): string | null {
  try {
    const filePath = path.join(KB_DIR, file);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8').trim();
  } catch (err) {
    console.warn(`[knowledgeBase] Failed to read ${file}:`, err);
    return null;
  }
}

function selectDomainFiles(context?: KnowledgeBaseContext): string[] {
  const selected = new Set<string>();
  const haystack = (context?.text ?? '').toLowerCase();

  if (haystack) {
    for (const { file, keywords } of DOMAIN_FILES) {
      if (keywords.some((kw) => haystack.includes(kw))) {
        selected.add(file);
      }
    }
  }

  if (selected.size === 0) {
    for (const category of context?.categories ?? []) {
      for (const file of CATEGORY_FALLBACK[category] ?? []) {
        selected.add(file);
      }
    }
  }

  return [...selected];
}

/**
 * Loads the mandatory core files plus any domain files relevant to `context`,
 * per the reading protocol in Knowledge_Base/agent.md. Returns an empty string
 * if the KB directory is missing (fails safe — callers must not assume content).
 */
export function loadKnowledgeBase(context?: KnowledgeBaseContext): string {
  if (!fs.existsSync(KB_DIR)) {
    console.warn(`[knowledgeBase] Directory not found: ${KB_DIR}`);
    return '';
  }

  const files = [...CORE_FILES, ...selectDomainFiles(context)];
  const parts: string[] = [];

  for (const file of files) {
    const content = readFileSafe(file);
    if (content) parts.push(`### Knowledge: ${file}\n\n${content}`);
  }

  return parts.join('\n\n---\n\n');
}

/**
 * Wraps the selected knowledge base content into a prompt section.
 * Returns an empty string if there are no KB files (callers should still work,
 * just without domain grounding — but this should not happen in practice; check
 * server logs for the directory-not-found warning if it does).
 */
export function getKnowledgeBaseSection(context?: KnowledgeBaseContext): string {
  const kb = loadKnowledgeBase(context);
  if (!kb) return '';

  return `\n\n## Your Knowledge Base\n\nThe following domain knowledge has been provided to guide your analysis. Use it as the primary reference for standards, review criteria, tone, and common issues. When you cite a finding, reference the specific KB file it came from.\n\n${kb}\n\n## End of Knowledge Base\n`;
}
