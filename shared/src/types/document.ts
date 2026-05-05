import { DocumentSection, ReviewStatus } from '../constants/statuses';

export interface CreateDocumentDTO {
  boq_item_id: string;
  section: DocumentSection;
  doc_number: string;
  title: string;
  surat_pengantar_no?: string;
}

export interface DocumentResponse {
  id: string;
  boq_item_id: string;
  section: DocumentSection;
  doc_number: string;
  title: string;
  surat_pengantar_no?: string;
  revision_no: number;
  status: ReviewStatus;
  is_current: boolean;
  uploaded_by: string;
  files: DocumentFileResponse[];
  created_at: string;
  updated_at: string;
}

export interface DocumentFileResponse {
  id: string;
  document_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}
