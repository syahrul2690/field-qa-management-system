import { config } from '../config';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface FieldQcWmsRecord {
  id: string;
  code: string;
  title: string;
  qa_project_id: string;
  qa_boq_item_id: string;
  document_revision: number;
  workflow_status: string;
  final_quality_status: string | null;
  finalized_at: string | null;
  monitoring_status: string;
  updated_at: string;
  detail_url: string;
}

interface FieldQcMonitoringResponse {
  data: FieldQcWmsRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getProjectWmsMonitoring(filters: {
  projectId: string;
  boqItemId?: string;
  finalQualityStatus?: string;
  workflowStatus?: string;
  page?: number;
  limit?: number;
}) {
  if (!config.fieldQc.monitoringApiKey) {
    throw new AppError('Field QC monitoring integration is not configured', 503);
  }

  const endpoint = new URL('/integration/wms-monitoring', config.fieldQc.apiUrl);
  endpoint.searchParams.set('qaProjectId', filters.projectId);
  if (filters.boqItemId) endpoint.searchParams.set('qaBoqItemId', filters.boqItemId);
  if (filters.finalQualityStatus) {
    endpoint.searchParams.set('finalQualityStatus', filters.finalQualityStatus);
  }
  if (filters.workflowStatus) endpoint.searchParams.set('workflowStatus', filters.workflowStatus);
  if (filters.page) endpoint.searchParams.set('page', String(filters.page));
  if (filters.limit) endpoint.searchParams.set('limit', String(filters.limit));

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: { 'x-api-key': config.fieldQc.monitoringApiKey },
      signal: AbortSignal.timeout(config.fieldQc.timeoutMs),
    });
  } catch (error) {
    console.error('[FieldQC] WMS monitoring request failed', error);
    throw new AppError('Field QC monitoring is temporarily unavailable', 503);
  }

  if (!response.ok) {
    console.error(`[FieldQC] WMS monitoring returned ${response.status}`);
    throw new AppError('Field QC monitoring is temporarily unavailable', 503);
  }

  const payload = (await response.json()) as Partial<FieldQcMonitoringResponse>;
  if (!Array.isArray(payload.data) || !payload.pagination) {
    console.error('[FieldQC] WMS monitoring returned an invalid response');
    throw new AppError('Field QC monitoring is temporarily unavailable', 503);
  }
  const boqIds = Array.from(new Set(payload.data.map((record) => record.qa_boq_item_id)));
  const boqItems = await prisma.boqItem.findMany({
    where: { id: { in: boqIds }, project_id: filters.projectId },
    select: { id: true, item_code: true, title: true },
  });
  const boqById = new Map(boqItems.map((item) => [item.id, item]));

  return {
    pagination: payload.pagination,
    data: payload.data.map((record) => ({
      ...record,
      boq_item_code: boqById.get(record.qa_boq_item_id)?.item_code ?? null,
      boq_item_title: boqById.get(record.qa_boq_item_id)?.title ?? null,
    })),
  };
}
