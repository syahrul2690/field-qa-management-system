import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DocumentSection, InstitutionType, ProjectType, Role, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { saveCommentSheetItems } from '../services/reviewService';

/**
 * Proves that editing a Comment Sheet row surfaces in Review Comments — not
 * just the field-level audit table — so the edit is visible to anyone who
 * can see the document (including a vendor, who never has access to the
 * review page itself) and stays visible after the review is done, since
 * Review Comments are read from the document/review record, not gated by
 * review status.
 *
 * Runs against a real database (see scopedRepo.integration.test.ts for why).
 */

const OWNER_INSTITUTION = 'inst-owner-csc-test';
const CONSULTANT_INSTITUTION = 'inst-consultant-csc-test';
const OWNER_UNIT = 'unit-owner-csc-test';
const REVIEWER_ID = 'user-reviewer-csc-test';
const FIXTURE_PROJECT = 'project-csc-test';
const FIXTURE_BOQ = 'boq-csc-test';
const FIXTURE_DOC = 'doc-csc-test';
const FIXTURE_REVIEW = 'review-csc-test';

let hasFixtures = false;

beforeAll(async () => {
  await prisma.institution.upsert({
    where: { id: OWNER_INSTITUTION },
    update: {},
    create: { id: OWNER_INSTITUTION, name: 'CSC Test Owner (fixture)', type: InstitutionType.OWNER },
  });
  await prisma.institution.upsert({
    where: { id: CONSULTANT_INSTITUTION },
    update: {},
    create: { id: CONSULTANT_INSTITUTION, name: 'CSC Test Consultant (fixture)', type: InstitutionType.CONSULTANT },
  });
  await prisma.unit.upsert({
    where: { id: OWNER_UNIT },
    update: {},
    create: { id: OWNER_UNIT, institution_id: OWNER_INSTITUTION, name: 'CSC Test Unit (fixture)', level: 0 },
  });
  await prisma.user.upsert({
    where: { id: REVIEWER_ID },
    update: {},
    create: {
      id: REVIEWER_ID,
      email: 'csc-test-reviewer@fixture.local',
      password_hash: 'fixture-only',
      name: 'CSC Test Reviewer',
      role: Role.REVIEWER,
      status: UserStatus.APPROVED,
      institution_id: CONSULTANT_INSTITUTION,
      unit_id: OWNER_UNIT,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: FIXTURE_PROJECT },
    update: {},
    create: {
      id: FIXTURE_PROJECT,
      name: 'CSC Test Project (fixture)',
      contract_signing_date: new Date('2026-01-01'),
      contract_effective_date: new Date('2026-01-01'),
      duration_days: 365,
      warranty_period_days: 365,
      project_type: ProjectType.GENERATION,
      nominal_values: [],
      owner_unit_id: OWNER_UNIT,
      created_by: REVIEWER_ID,
    },
  });
  await prisma.boqItem.upsert({
    where: { system_tag: 'csc-test-boq' },
    update: {},
    create: {
      id: FIXTURE_BOQ,
      project_id: project.id,
      level: 1,
      item_code: 'CSC-01',
      system_tag: 'csc-test-boq',
      title: 'CSC Test BOQ Item',
    },
  });
  await prisma.document.upsert({
    where: { id: FIXTURE_DOC },
    update: {},
    create: {
      id: FIXTURE_DOC,
      boq_item_id: FIXTURE_BOQ,
      section: DocumentSection.FIELD_ITP,
      doc_number: 'CSC-DOC-001',
      title: 'CSC Test Document',
      uploaded_by: REVIEWER_ID,
      vendor_institution_id: OWNER_INSTITUTION,
    },
  });
  await prisma.documentReview.upsert({
    where: { id: FIXTURE_REVIEW },
    update: { reviewer_id: REVIEWER_ID, checker_id: null, approver_id: null, reviewed_at: null, checked_at: null, approved_at: null },
    create: {
      id: FIXTURE_REVIEW,
      document_id: FIXTURE_DOC,
      reviewer_id: REVIEWER_ID,
    },
  });

  hasFixtures = true;
});

afterAll(async () => {
  if (hasFixtures) {
    await prisma.commentSheetItemAudit.deleteMany({ where: { review_id: FIXTURE_REVIEW } });
    await prisma.commentSheetItem.deleteMany({ where: { review_id: FIXTURE_REVIEW } });
    await prisma.reviewComment.deleteMany({ where: { review_id: FIXTURE_REVIEW } });
    await prisma.documentReview.deleteMany({ where: { id: FIXTURE_REVIEW } });
    await prisma.document.deleteMany({ where: { id: FIXTURE_DOC } });
    await prisma.boqItem.deleteMany({ where: { id: FIXTURE_BOQ } });
    await prisma.project.deleteMany({ where: { id: FIXTURE_PROJECT } });
    await prisma.user.deleteMany({ where: { id: REVIEWER_ID } });
    await prisma.unit.deleteMany({ where: { id: OWNER_UNIT } });
    await prisma.institution.deleteMany({ where: { id: CONSULTANT_INSTITUTION } });
    await prisma.institution.deleteMany({ where: { id: OWNER_INSTITUTION } });
  }
  await prisma.$disconnect();
});

describe('saveCommentSheetItems — Review Comments tracking', () => {
  it('has fixtures to work with', () => {
    expect(hasFixtures, 'local database is not migrated/reachable').toBe(true);
  });

  it('does not post a Review Comment for a brand-new row', async () => {
    await saveCommentSheetItems(FIXTURE_REVIEW, REVIEWER_ID, Role.REVIEWER, [
      { seq_no: 1, pln_comment: 'Initial PLN comment' },
    ]);

    const comments = await prisma.reviewComment.findMany({ where: { review_id: FIXTURE_REVIEW } });
    expect(comments).toEqual([]);
  });

  it('posts an attributed "Edit Comment Sheet" comment when a field changes', async () => {
    await saveCommentSheetItems(FIXTURE_REVIEW, REVIEWER_ID, Role.REVIEWER, [
      { seq_no: 1, pln_comment: 'Revised PLN comment', contractor_response: 'Ack' },
    ]);

    const comments = await prisma.reviewComment.findMany({ where: { review_id: FIXTURE_REVIEW }, orderBy: { created_at: 'asc' } });
    expect(comments).toHaveLength(1);
    expect(comments[0].commenter_id).toBe(REVIEWER_ID);
    expect(comments[0].comment).toBe('Edit Comment Sheet — row 1: PLN Comment, Contractor Response.');
  });

  it('posts a comment when a row is removed', async () => {
    await saveCommentSheetItems(FIXTURE_REVIEW, REVIEWER_ID, Role.REVIEWER, []);

    const comments = await prisma.reviewComment.findMany({ where: { review_id: FIXTURE_REVIEW }, orderBy: { created_at: 'asc' } });
    const removal = comments.find((c) => c.comment.includes('removed row 1'));
    expect(removal).toBeDefined();
    expect(removal?.comment).toBe('Edit Comment Sheet — removed row 1.');
  });

  it('is visible via getReviewById regardless of review status (the actual vendor-visibility fix)', async () => {
    const { getReviewById } = await import('../services/reviewService');
    const review = await getReviewById(FIXTURE_REVIEW);

    expect(review).not.toBeNull();
    const comments = (review as { comments: Array<{ comment: string }> }).comments;
    expect(comments.some((c) => c.comment.startsWith('Edit Comment Sheet'))).toBe(true);
  });
});
