import { ReviewStatus } from '../constants/statuses';

export interface CreateReviewCommentDTO {
  page_ref?: string;
  comment: string;
  disposition?: 'A' | 'B' | 'C';
}

export interface AdvanceWorkflowDTO {
  action: 'REVIEW' | 'CHECK' | 'APPROVE';
  final_status?: ReviewStatus;
  comments?: CreateReviewCommentDTO[];
  checker_id?: string;   // Reviewer sets this when submitting review
  approver_id?: string;  // Reviewer sets this when submitting review
}

export interface DocumentReviewResponse {
  id: string;
  document_id: string;
  reviewer_id?: string;
  checker_id?: string;
  approver_id?: string;
  qr_hash: string;
  sla_deadline?: string;
  reviewed_at?: string;
  checked_at?: string;
  approved_at?: string;
  final_status?: ReviewStatus;
  comment_sheet_path?: string;
  is_overdue: boolean;
  current_stage: 'REVIEW' | 'CHECK' | 'APPROVE' | 'COMPLETE';
  comments: ReviewCommentResponse[];
  created_at: string;
}

export interface ReviewCommentResponse {
  id: string;
  review_id: string;
  commenter_id: string;
  page_ref?: string;
  comment: string;
  disposition?: string;
  created_at: string;
}

export interface VerifyQRResponse {
  document_title: string;
  doc_number: string;
  revision_no: number;
  final_status: ReviewStatus;
  approved_at: string;
  reviewer_name: string;
  checker_name: string;
  approver_name: string;
  project_name: string;
}

// PLN hold-point authority codes. A single ITP row carries a different code per
// responsible party (Sub / PP / PLN) — see ItpItemResponse.sub_code etc.
export type InspectionLevel = 'H' | 'W' | 'SW' | 'R' | 'A' | 'P';
export type ItpPhase = 'SHOP' | 'FIELD' | 'COMMISSIONING';
export type ItpCategory = 'SIPIL' | 'ELEKTRIKAL' | 'MEKANIKAL' | 'INSTRUMEN_KONTROL';

export interface ItpItemResponse {
  id: string;
  document_id: string;
  seq_no: number;
  activity: string;
  acceptance_criteria: string | null;
  reference_standard: string | null;
  verifying_document: string | null;
  sub_code: InspectionLevel | null;
  pp_code: InspectionLevel | null;
  pln_code: InspectionLevel | null;
  phase: ItpPhase;
  category: ItpCategory;
  created_at: string;
  updated_at: string;
}

export interface ItpItemInput {
  seq_no: number;
  activity: string;
  acceptance_criteria?: string;
  reference_standard?: string;
  verifying_document?: string;
  sub_code?: InspectionLevel;
  pp_code?: InspectionLevel;
  pln_code?: InspectionLevel;
  phase?: ItpPhase;
  category: ItpCategory;
}
