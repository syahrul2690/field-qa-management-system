import { PrismaClient, Role, InstitutionType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. INSTITUTIONS ─────────────────────────────────────────────────────────

  const ownerInstitution = await prisma.institution.upsert({
    where: { id: 'inst-owner-001' },
    update: {},
    create: {
      id: 'inst-owner-001',
      name: 'PLN (Persero)',
      type: InstitutionType.OWNER,
      address: 'Jl. Trunojoyo Blok M-1 No.135, Jakarta Selatan',
    },
  });

  const consultantInstitution = await prisma.institution.upsert({
    where: { id: 'inst-consultant-001' },
    update: {},
    create: {
      id: 'inst-consultant-001',
      name: 'PT. Surveyor Indonesia',
      type: InstitutionType.CONSULTANT,
      address: 'Jl. Pesanggrahan No.1, Jakarta Barat',
    },
  });

  const vendorInstitution = await prisma.institution.upsert({
    where: { id: 'inst-vendor-001' },
    update: {},
    create: {
      id: 'inst-vendor-001',
      name: 'PT. Barata Indonesia',
      type: InstitutionType.VENDOR,
      address: 'Jl. Veteran No.241, Gresik, Jawa Timur',
    },
  });

  console.log('✅ Institutions created');

  // ── 2. UNITS ─────────────────────────────────────────────────────────────────

  // Owner units (level 0 = Unit Induk, level 1 = Unit Pelaksana Proyek)
  const ownerRoot = await prisma.unit.upsert({
    where: { id: 'unit-owner-root' },
    update: {},
    create: {
      id: 'unit-owner-root',
      institution_id: ownerInstitution.id,
      name: 'Unit Induk Transmisi Jawa Bagian Barat',
      level: 0,
    },
  });

  const ownerChild = await prisma.unit.upsert({
    where: { id: 'unit-owner-child' },
    update: {},
    create: {
      id: 'unit-owner-child',
      institution_id: ownerInstitution.id,
      parent_unit_id: ownerRoot.id,
      name: 'Unit Pelaksana Proyek Jaringan 150kV',
      level: 1,
    },
  });

  // Consultant units (level 0 = Kantor Induk, level 1 = MK, level 2 = Project Site)
  const consultantRoot = await prisma.unit.upsert({
    where: { id: 'unit-consultant-root' },
    update: {},
    create: {
      id: 'unit-consultant-root',
      institution_id: consultantInstitution.id,
      name: 'Kantor Induk Surveyor Indonesia',
      level: 0,
    },
  });

  const consultantChild = await prisma.unit.upsert({
    where: { id: 'unit-consultant-child' },
    update: {},
    create: {
      id: 'unit-consultant-child',
      institution_id: consultantInstitution.id,
      parent_unit_id: consultantRoot.id,
      name: 'Unit Pelaksana Manajemen Konstruksi Jawa Barat',
      level: 1,
    },
  });

  const consultantGrandchild = await prisma.unit.upsert({
    where: { id: 'unit-consultant-grandchild' },
    update: {},
    create: {
      id: 'unit-consultant-grandchild',
      institution_id: consultantInstitution.id,
      parent_unit_id: consultantChild.id,
      name: 'Tim Site — Proyek GI 150kV Bekasi',
      level: 2,
    },
  });

  // Vendor unit (standalone, level 0)
  const vendorUnit = await prisma.unit.upsert({
    where: { id: 'unit-vendor-001' },
    update: {},
    create: {
      id: 'unit-vendor-001',
      institution_id: vendorInstitution.id,
      name: 'PT. Barata Indonesia — Divisi Proyek',
      level: 0,
    },
  });

  console.log('✅ Units created');

  // ── 3. USERS ─────────────────────────────────────────────────────────────────

  const PASSWORD = 'Password123!';
  const hash = await bcrypt.hash(PASSWORD, 12);

  const users = [
    {
      id: 'user-admin-001',
      email: 'admin@qa-system.com',
      name: 'System Administrator',
      role: Role.ADMIN,
      institution_id: ownerInstitution.id,
      unit_id: ownerRoot.id,
    },
    {
      id: 'user-pic-001',
      email: 'pic@owner.com',
      name: 'Budi Santoso (PIC Project)',
      role: Role.PIC_PROJECT,
      institution_id: ownerInstitution.id,
      unit_id: ownerChild.id,
    },
    {
      id: 'user-pic-consultant-001',
      email: 'pic.consultant@consultant.com',
      name: 'Arief Budiman (PIC Consultant)',
      role: Role.PIC_CONSULTANT,
      institution_id: consultantInstitution.id,
      unit_id: consultantRoot.id,   // Kantor Induk — coordinates all review teams
    },
    {
      id: 'user-pic-consultant-002',
      email: 'pic.consultant2@consultant.com',
      name: 'Ratna Sari (PIC Consultant)',
      role: Role.PIC_CONSULTANT,
      institution_id: consultantInstitution.id,
      unit_id: consultantChild.id,  // Unit Pelaksana MK — field coordinator
    },
    {
      id: 'user-reviewer-001',
      email: 'reviewer@consultant.com',
      name: 'Dewi Rahayu (Reviewer)',
      role: Role.REVIEWER,
      institution_id: consultantInstitution.id,
      unit_id: consultantChild.id,        // Level 1 — for ITP & Procedure
    },
    {
      id: 'user-reviewer-site-001',
      email: 'reviewer.site@consultant.com',
      name: 'Ahmad Fauzi (Site Reviewer)',
      role: Role.REVIEWER,
      institution_id: consultantInstitution.id,
      unit_id: consultantGrandchild.id,   // Level 2 — for Work Method
    },
    {
      id: 'user-checker-001',
      email: 'checker@consultant.com',
      name: 'Siti Nurhaliza (Checker)',
      role: Role.CHECKER,
      institution_id: consultantInstitution.id,
      unit_id: consultantChild.id,
    },
    {
      id: 'user-approver-001',
      email: 'approver@consultant.com',
      name: 'Hendra Wijaya (Approver)',
      role: Role.APPROVER,
      institution_id: consultantInstitution.id,
      unit_id: consultantChild.id,
    },
    {
      id: 'user-vendor-001',
      email: 'vendor@barata.com',
      name: 'Rizky Pratama (Vendor)',
      role: Role.VENDOR,
      institution_id: vendorInstitution.id,
      unit_id: vendorUnit.id,
    },
    {
      id: 'user-viewer-001',
      email: 'viewer@qa-system.com',
      name: 'Viewer User',
      role: Role.VIEWER,
      institution_id: ownerInstitution.id,
      unit_id: ownerRoot.id,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        ...u,
        password_hash: hash,
        status: UserStatus.APPROVED,
        approved_at: new Date(),
      },
    });
  }

  console.log('✅ Users created\n');

  // ── SUMMARY ──────────────────────────────────────────────────────────────────

  console.log('━'.repeat(60));
  console.log('🎉  Seed complete! All accounts use password: Password123!');
  console.log('━'.repeat(60));
  console.log('');
  console.log('ROLE                EMAIL                              UNIT LEVEL');
  console.log('─'.repeat(70));
  console.log('ADMIN               admin@qa-system.com                Owner / Root');
  console.log('PIC_PROJECT         pic@owner.com                      Owner / Child');
  console.log('PIC_CONSULTANT      pic.consultant@consultant.com       Consultant / Root');
  console.log('PIC_CONSULTANT      pic.consultant2@consultant.com      Consultant / Child');
  console.log('REVIEWER            reviewer@consultant.com             Consultant / Child (ITP & Procedure)');
  console.log('REVIEWER (site)     reviewer.site@consultant.com        Consultant / Grandchild (Work Method)');
  console.log('CHECKER             checker@consultant.com              Consultant / Child');
  console.log('APPROVER            approver@consultant.com             Consultant / Child');
  console.log('VENDOR              vendor@barata.com                   Vendor');
  console.log('VIEWER              viewer@qa-system.com                Owner / Root');
  console.log('─'.repeat(70));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
