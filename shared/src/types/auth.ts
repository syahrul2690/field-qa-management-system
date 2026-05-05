import { Role, InstitutionType } from '../constants/roles';
import { UserStatus } from '../constants/statuses';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role: Role;
  institution_id: string;
  unit_id: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;          // user id
  email: string;
  role: Role;
  institution_id: string;
  institution_type: InstitutionType;
  unit_id: string;
  unit_level: number;
}

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  institution_id: string;
  institution_type: InstitutionType;
  unit_id: string;
  unit_level: number;
  created_at: string;
}
