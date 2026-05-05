import { DocumentSection } from '../constants/statuses';

export interface BoqItemDTO {
  id: string;
  project_id: string;
  parent_item_id?: string;
  level: number;
  item_code: string;
  system_tag: string;
  title: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface BoqTreeNode extends BoqItemDTO {
  children: BoqTreeNode[];
  document_summary?: {
    [key in DocumentSection]?: {
      has_document: boolean;
      current_status?: string;
    };
  };
}

export interface ParsedBoqRow {
  level: number;
  item_code: string;
  title: string;
  description?: string;
  parent_code?: string;
  sort_order: number;
}

export interface BoqParseResult {
  success: boolean;
  rows?: ParsedBoqRow[];
  errors?: BoqParseError[];
}

export interface BoqParseError {
  row: number;
  field: string;
  message: string;
}
