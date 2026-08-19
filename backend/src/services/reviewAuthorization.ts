import { InstitutionType, Role } from '@prisma/client';

export type DelegationScope = 'OWNER_UNIT' | 'CONSULTANT_PROJECT';

/**
 * PIC_ENGINEER is the legacy owner-side role name. The current business role
 * mapping uses PIC_CONSULTANT for the project-scoped delegation step.
 */
export function getDelegationScope(
  role: Role,
  institutionType: InstitutionType,
): DelegationScope | null {
  if (role === Role.PIC_ENGINEER && institutionType === InstitutionType.OWNER) {
    return 'OWNER_UNIT';
  }

  if (role === Role.PIC_CONSULTANT && institutionType === InstitutionType.CONSULTANT) {
    return 'CONSULTANT_PROJECT';
  }

  return null;
}

export function canDelegateReviews(role: Role, institutionType: InstitutionType): boolean {
  return getDelegationScope(role, institutionType) !== null;
}
