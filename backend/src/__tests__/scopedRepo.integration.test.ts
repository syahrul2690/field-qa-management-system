import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DocumentSection, InstitutionType, ProjectType, Role, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { ScopeUser } from '../services/accessScopeService';
import { createScopedRepo, isNotFound } from '../services/chat/scopedRepo';

/**
 * Proves the chat tools cannot read across institution boundaries.
 *
 * Runs against a real database and creates its own fixture rows (project →
 * BOQ item → document under a dedicated owner institution), so it is hermetic:
 * CI provisions a throwaway Postgres and runs `prisma migrate deploy` before
 * the test phase; no dev data is required.
 *
 * The fixture project has no ProjectVendorVisibility grants, and the outsider
 * vendor institution has none either, so the outsider must see nothing —
 * including when it names the fixture ids directly.
 */

const OUTSIDER_INSTITUTION = 'inst-vendor-scope-test';
const OWNER_INSTITUTION = 'inst-owner-scope-test';
const OWNER_UNIT = 'unit-owner-scope-test';
const FIXTURE_USER = 'user-scope-test';
const FIXTURE_PROJECT = 'project-scope-test';
const FIXTURE_BOQ = 'boq-scope-test';
const FIXTURE_DOC = 'doc-scope-test';
const FIXTURE_DOC_NUMBER = 'SCOPE-DOC-001';

let anyProjectId: string;
let anyProjectName: string;
let anyDocumentId: string;
let anyDocNumber: string;
let hasFixtures = false;

function asUser(overrides: Partial<ScopeUser>): ScopeUser {
  return {
    id: 'scope-test-user',
    role: Role.VENDOR,
    institution_id: OUTSIDER_INSTITUTION,
    institution_type: InstitutionType.VENDOR,
    unit_id: 'unit-vendor-scope-test',
    ...overrides,
  };
}

const outsider = asUser({});
const consultant = asUser({
  institution_id: 'inst-consultant-001',
  institution_type: InstitutionType.CONSULTANT,
  role: Role.REVIEWER,
});

beforeAll(async () => {
  await prisma.institution.upsert({
    where: { id: OUTSIDER_INSTITUTION },
    update: {},
    create: {
      id: OUTSIDER_INSTITUTION,
      name: 'Scope Test Vendor (fixture)',
      type: InstitutionType.VENDOR,
    },
  });
  await prisma.institution.upsert({
    where: { id: OWNER_INSTITUTION },
    update: {},
    create: {
      id: OWNER_INSTITUTION,
      name: 'Scope Test Owner (fixture)',
      type: InstitutionType.OWNER,
    },
  });
  await prisma.unit.upsert({
    where: { id: OWNER_UNIT },
    update: {},
    create: {
      id: OWNER_UNIT,
      institution_id: OWNER_INSTITUTION,
      name: 'Scope Test Unit (fixture)',
      level: 0,
    },
  });
  await prisma.user.upsert({
    where: { id: FIXTURE_USER },
    update: {},
    create: {
      id: FIXTURE_USER,
      email: 'scope-test@fixture.local',
      password_hash: 'fixture-only',
      name: 'Scope Test Fixture User',
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
      institution_id: OWNER_INSTITUTION,
      unit_id: OWNER_UNIT,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: FIXTURE_PROJECT },
    update: {},
    create: {
      id: FIXTURE_PROJECT,
      name: 'Scope Test Project (fixture)',
      contract_signing_date: new Date('2026-01-01'),
      contract_effective_date: new Date('2026-01-01'),
      duration_days: 365,
      warranty_period_days: 365,
      project_type: ProjectType.GENERATION,
      nominal_values: [],
      owner_unit_id: OWNER_UNIT,
      created_by: FIXTURE_USER,
    },
  });
  await prisma.boqItem.upsert({
    where: { system_tag: 'scope-test-boq' },
    update: {},
    create: {
      id: FIXTURE_BOQ,
      project_id: project.id,
      level: 1,
      item_code: 'SCOPE-01',
      system_tag: 'scope-test-boq',
      title: 'Scope Test BOQ Item',
    },
  });
  const document = await prisma.document.upsert({
    where: { id: FIXTURE_DOC },
    update: {},
    create: {
      id: FIXTURE_DOC,
      boq_item_id: FIXTURE_BOQ,
      section: DocumentSection.FIELD_ITP,
      doc_number: FIXTURE_DOC_NUMBER,
      title: 'Scope Test Document',
      uploaded_by: FIXTURE_USER,
    },
  });

  anyProjectId = project.id;
  anyProjectName = project.name;
  anyDocumentId = document.id;
  anyDocNumber = document.doc_number;

  hasFixtures = true;
});

afterAll(async () => {
  if (hasFixtures) {
    // FK order matters: document → boq item → project → user → unit → institution.
    await prisma.document.deleteMany({ where: { id: FIXTURE_DOC } });
    await prisma.boqItem.deleteMany({ where: { id: FIXTURE_BOQ } });
    await prisma.project.deleteMany({ where: { id: FIXTURE_PROJECT } });
    await prisma.user.deleteMany({ where: { id: FIXTURE_USER } });
    await prisma.unit.deleteMany({ where: { id: OWNER_UNIT } });
    await prisma.institution.deleteMany({ where: { id: OUTSIDER_INSTITUTION } });
    await prisma.institution.deleteMany({ where: { id: OWNER_INSTITUTION } });
  }
  await prisma.$disconnect();
});

describe('scopedRepo isolation', () => {
  it('has fixtures to work with', () => {
    expect(hasFixtures, 'dev database has no projects/documents seeded').toBe(true);
  });

  it('shows a vendor with no grants an empty project list', async () => {
    const result = await createScopedRepo(outsider).listProjects({});
    expect(result.total).toBe(0);
    expect(result.projects).toEqual([]);
  });

  it('shows a consultant the projects that exist', async () => {
    const result = await createScopedRepo(consultant).listProjects({});
    expect(result.total).toBeGreaterThan(0);
    expect(result.projects.map((p) => p.name)).toContain(anyProjectName);
  });

  // Naming a real id directly is the attack a chat assistant makes easy, so
  // each single-record read is checked explicitly rather than by inference
  // from the list being empty.
  it('refuses a real project id to an outsider', async () => {
    const result = await createScopedRepo(outsider).getProjectStats(anyProjectId);
    expect(isNotFound(result)).toBe(true);
  });

  it('allows the same project id for a consultant', async () => {
    const result = await createScopedRepo(consultant).getProjectStats(anyProjectId);
    expect(isNotFound(result)).toBe(false);
  });

  it('refuses a real document id to an outsider', async () => {
    const result = await createScopedRepo(outsider).getDocumentWorkflow({
      document_id: anyDocumentId,
    });
    expect(isNotFound(result)).toBe(true);
  });

  it('refuses a real document number to an outsider', async () => {
    const result = await createScopedRepo(outsider).getDocumentWorkflow({
      doc_number: anyDocNumber,
      project_id: anyProjectId,
    });
    expect(isNotFound(result)).toBe(true);
  });

  it('returns no documents to an outsider searching without filters', async () => {
    const result = await createScopedRepo(outsider).searchDocuments({});
    // isNotFound is a positive type guard, so a negated expect does not narrow
    // the union for TypeScript. Asserting the impossible branch instead does.
    if (isNotFound(result)) {
      throw new Error('searchDocuments({}) must return a result list, never NOT_FOUND');
    }
    expect(result.total).toBe(0);
    expect(result.documents).toEqual([]);
  });

  it('refuses a document search scoped to a project the outsider cannot see', async () => {
    const result = await createScopedRepo(outsider).searchDocuments({ project_id: anyProjectId });
    expect(isNotFound(result)).toBe(true);
  });

  it('gives an outsider the same answer for a real id as for a fabricated one', async () => {
    const repo = createScopedRepo(outsider);
    const real = await repo.getProjectStats(anyProjectId);
    const fake = await repo.getProjectStats('00000000-0000-0000-0000-000000000000');
    // Identical wording, so the response cannot be used to probe for the
    // existence of another institution's records.
    expect(real).toEqual(fake);
  });
});
