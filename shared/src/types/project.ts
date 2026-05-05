import { ProjectType, Currency } from '../constants/statuses';

export interface NominalValue {
  currency: Currency;
  amount: number;
}

export interface CreateProjectDTO {
  name: string;
  contract_signing_date: string;
  contract_effective_date: string;
  duration_days: number;
  warranty_period_days: number;
  project_type: ProjectType;
  nominal_values: NominalValue[];
  description?: string;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export interface CreateAmendmentDTO {
  amendment_reason: string;
  effective_date: string;
  duration_days?: number;
  nominal_values?: NominalValue[];
}

export interface ProjectResponse {
  id: string;
  name: string;
  contract_signing_date: string;
  contract_effective_date: string;
  duration_days: number;
  warranty_period_days: number;
  project_type: ProjectType;
  nominal_values: NominalValue[];
  description?: string;
  owner_unit_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
