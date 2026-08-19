import { describe, expect, it } from 'vitest';
import { InstitutionType, Role } from '@prisma/client';
import { canDelegateReviews, getDelegationScope } from '../services/reviewAuthorization';

describe('review delegation role mapping', () => {
  it('maps PIC Consultant to project-scoped delegation', () => {
    expect(getDelegationScope(Role.PIC_CONSULTANT, InstitutionType.CONSULTANT)).toBe('CONSULTANT_PROJECT');
    expect(canDelegateReviews(Role.PIC_CONSULTANT, InstitutionType.CONSULTANT)).toBe(true);
  });

  it('keeps legacy owner PIC Engineer delegation support', () => {
    expect(getDelegationScope(Role.PIC_ENGINEER, InstitutionType.OWNER)).toBe('OWNER_UNIT');
    expect(canDelegateReviews(Role.PIC_ENGINEER, InstitutionType.OWNER)).toBe(true);
  });

  it('rejects mismatched role and institution combinations', () => {
    expect(canDelegateReviews(Role.PIC_CONSULTANT, InstitutionType.OWNER)).toBe(false);
    expect(canDelegateReviews(Role.PIC_ENGINEER, InstitutionType.CONSULTANT)).toBe(false);
    expect(canDelegateReviews(Role.REVIEWER, InstitutionType.CONSULTANT)).toBe(false);
  });
});
