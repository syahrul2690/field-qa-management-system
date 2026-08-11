import { describe, it, expect } from 'vitest';
import { InstitutionType, Role } from '@prisma/client';
import {
  ScopeUser,
  buildProjectScopeWhere,
  buildBoqItemScopeWhere,
  buildDocumentScopeWhere,
  buildReviewScopeWhere,
  buildItpItemScopeWhere,
  buildCommentSheetItemScopeWhere,
  hasUnrestrictedProjectScope,
  scopeFingerprint,
} from '../services/accessScopeService';

const VENDOR_INSTITUTION = 'inst-vendor-1';

function user(overrides: Partial<ScopeUser> = {}): ScopeUser {
  return {
    id: 'user-1',
    role: Role.VENDOR,
    institution_id: VENDOR_INSTITUTION,
    institution_type: InstitutionType.VENDOR,
    unit_id: 'unit-1',
    ...overrides,
  };
}

const VENDOR_FILTER = {
  vendor_visibility: { some: { vendor_institution_id: VENDOR_INSTITUTION } },
};

describe('buildProjectScopeWhere', () => {
  it('restricts vendor institutions to their granted projects', () => {
    expect(buildProjectScopeWhere(user())).toEqual(VENDOR_FILTER);
  });

  it('does not restrict owner institutions', () => {
    expect(buildProjectScopeWhere(user({ institution_type: InstitutionType.OWNER }))).toEqual({});
  });

  it('does not restrict consultant institutions', () => {
    expect(
      buildProjectScopeWhere(user({ institution_type: InstitutionType.CONSULTANT })),
    ).toEqual({});
  });

  // The scope must key off the institution, not the person's job title.
  // An administrator employed by a vendor is still a vendor for data purposes.
  it('keeps an ADMIN inside a vendor institution restricted', () => {
    expect(buildProjectScopeWhere(user({ role: Role.ADMIN }))).toEqual(VENDOR_FILTER);
  });

  it('fails closed for an unrecognised institution type', () => {
    const rogue = user({ institution_type: 'SOMETHING_NEW' as InstitutionType });
    expect(buildProjectScopeWhere(rogue)).toEqual(VENDOR_FILTER);
  });

  describe('every role, in every institution type', () => {
    const roles = Object.values(Role);

    it.each(roles)('%s in a VENDOR institution is restricted', (role) => {
      expect(
        buildProjectScopeWhere(user({ role, institution_type: InstitutionType.VENDOR })),
      ).toEqual(VENDOR_FILTER);
    });

    it.each(roles)('%s in an OWNER institution is unrestricted', (role) => {
      expect(
        buildProjectScopeWhere(user({ role, institution_type: InstitutionType.OWNER })),
      ).toEqual({});
    });

    it.each(roles)('%s in a CONSULTANT institution is unrestricted', (role) => {
      expect(
        buildProjectScopeWhere(user({ role, institution_type: InstitutionType.CONSULTANT })),
      ).toEqual({});
    });
  });
});

describe('nested scope builders', () => {
  const vendor = user();
  const owner = user({ institution_type: InstitutionType.OWNER });

  it('walks BoqItem up to the project', () => {
    expect(buildBoqItemScopeWhere(vendor)).toEqual({ project: VENDOR_FILTER });
  });

  it('walks Document up through its boq item', () => {
    expect(buildDocumentScopeWhere(vendor)).toEqual({
      boq_item: { project: VENDOR_FILTER },
    });
  });

  it('walks DocumentReview up through its document', () => {
    expect(buildReviewScopeWhere(vendor)).toEqual({
      document: { boq_item: { project: VENDOR_FILTER } },
    });
  });

  it('walks ItpItem up through its document', () => {
    expect(buildItpItemScopeWhere(vendor)).toEqual({
      document: { boq_item: { project: VENDOR_FILTER } },
    });
  });

  it('walks CommentSheetItem up through its review', () => {
    expect(buildCommentSheetItemScopeWhere(vendor)).toEqual({
      review: { document: { boq_item: { project: VENDOR_FILTER } } },
    });
  });

  // For unrestricted users the nesting collapses to empty relation filters,
  // which Prisma treats as a no-op rather than as "relation must exist".
  it('produces empty leaf filters for unrestricted users', () => {
    expect(buildCommentSheetItemScopeWhere(owner)).toEqual({
      review: { document: { boq_item: { project: {} } } },
    });
  });
});

describe('hasUnrestrictedProjectScope', () => {
  it('is false for vendors', () => {
    expect(hasUnrestrictedProjectScope(user())).toBe(false);
  });

  it('is true for owners and consultants', () => {
    expect(hasUnrestrictedProjectScope(user({ institution_type: InstitutionType.OWNER }))).toBe(
      true,
    );
    expect(
      hasUnrestrictedProjectScope(user({ institution_type: InstitutionType.CONSULTANT })),
    ).toBe(true);
  });
});

describe('scopeFingerprint', () => {
  it('changes when the role changes', () => {
    expect(scopeFingerprint(user())).not.toEqual(scopeFingerprint(user({ role: Role.ADMIN })));
  });

  it('changes when the institution changes', () => {
    expect(scopeFingerprint(user())).not.toEqual(
      scopeFingerprint(user({ institution_id: 'inst-vendor-2' })),
    );
  });

  it('is stable for the same identity', () => {
    expect(scopeFingerprint(user())).toEqual(scopeFingerprint(user()));
  });
});
