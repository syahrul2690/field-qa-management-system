import { prisma } from '../config/database';
import { DocumentSection, ReviewStatus } from '@prisma/client';

const APPROVED_STATUSES: ReviewStatus[] = [
  ReviewStatus.APPROVED_A,
  ReviewStatus.APPROVED_WITH_COMMENTS_B,
];

export async function getProjects() {
  return prisma.project.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      project_type: true,
      urgency: true,
      created_at: true,
      boq_items: {
        where: { parent_item_id: null },
        orderBy: { sort_order: 'asc' },
        select: {
          id: true,
          item_code: true,
          title: true,
          level: true,
          children: {
            orderBy: { sort_order: 'asc' },
            select: {
              id: true,
              item_code: true,
              title: true,
              level: true,
              children: {
                orderBy: { sort_order: 'asc' },
                select: {
                  id: true,
                  item_code: true,
                  title: true,
                  level: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getQcReadiness(boqItemId: string) {
  const boqItem = await prisma.boqItem.findUnique({
    where: { id: boqItemId },
    select: { id: true, item_code: true, title: true },
  });

  if (!boqItem) return null;

  const sections: DocumentSection[] = [
    DocumentSection.FIELD_ITP,
    DocumentSection.PROCEDURE,
    DocumentSection.WORK_METHOD,
  ];

  const sectionStatuses = await Promise.all(
    sections.map(async (section) => {
      const doc = await prisma.document.findFirst({
        where: {
          boq_item_id: boqItemId,
          section,
          is_current: true,
        },
        select: {
          id: true,
          doc_number: true,
          revision_no: true,
          status: true,
          title: true,
        },
      });

      if (!doc) {
        return { section, status: null, ready: false, document: null };
      }

      const ready = APPROVED_STATUSES.includes(doc.status);
      return {
        section,
        status: doc.status,
        ready,
        document: {
          id: doc.id,
          doc_number: doc.doc_number,
          revision_no: doc.revision_no,
          title: doc.title,
        },
      };
    }),
  );

  const allReady = sectionStatuses.every((s) => s.ready);

  return {
    boq_item: boqItem,
    sections: sectionStatuses,
    ready: allReady,
  };
}

export async function getDocumentWithItpItems(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      doc_number: true,
      title: true,
      section: true,
      revision_no: true,
      status: true,
      is_current: true,
      boq_item: {
        select: {
          id: true,
          item_code: true,
          title: true,
          project: {
            select: { id: true, name: true },
          },
        },
      },
      itp_items: {
        orderBy: { seq_no: 'asc' },
        select: {
          id: true,
          seq_no: true,
          activity: true,
          acceptance_criteria: true,
          reference_standard: true,
          verifying_document: true,
          sub_code: true,
          pp_code: true,
          pln_code: true,
          phase: true,
          category: true,
        },
      },
    },
  });

  return doc;
}
