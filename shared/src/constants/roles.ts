export enum Role {
  ADMIN = 'ADMIN',
  PIC_PROJECT = 'PIC_PROJECT',        // Owner institution
  PIC_CONSULTANT = 'PIC_CONSULTANT',  // Consultant institution coordinator — assigns review team
  VENDOR = 'VENDOR',                  // Vendor institution
  REVIEWER = 'REVIEWER',              // Consultant institution
  CHECKER = 'CHECKER',                // Consultant institution
  APPROVER = 'APPROVER',              // Consultant institution
  VIEWER = 'VIEWER',                  // Global read-only
}

export enum InstitutionType {
  OWNER = 'OWNER',
  CONSULTANT = 'CONSULTANT',
  VENDOR = 'VENDOR',
}

// Unit level within an institution hierarchy
// Owner:      0=Unit Induk, 1=Unit Pelaksana Proyek
// Consultant: 0=Kantor Induk, 1=Unit Pelaksana MK, 2=Project Site Team
// Vendor:     0=Standalone
export const UNIT_LEVEL = {
  ROOT: 0,
  CHILD: 1,
  GRANDCHILD: 2,
} as const;

// Which unit level can perform Reviewer duties per document section
export const REVIEWER_UNIT_LEVEL_BY_SECTION: Record<string, number> = {
  FIELD_ITP: UNIT_LEVEL.CHILD,
  PROCEDURE: UNIT_LEVEL.CHILD,
  WORK_METHOD: UNIT_LEVEL.GRANDCHILD,
};
