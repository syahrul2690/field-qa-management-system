import ExcelJS from 'exceljs';

type DashboardData = {
  summary: Record<string, unknown>;
  projects: Array<Record<string, any>>;
};

export async function buildDashboardWorkbook(data: DashboardData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Field QA Management System';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'value', width: 20 },
  ];
  summary.addRows([
    { metric: 'Total Projects', value: data.summary.total_projects },
    { metric: 'Total Documents', value: data.summary.total_docs },
    { metric: 'Remaining Documents', value: data.summary.remaining_docs },
    { metric: 'Overdue Reviews', value: data.summary.overdue_reviews },
    { metric: 'Completion Rate (%)', value: data.summary.completion_rate },
    { metric: 'Average Review Duration (days)', value: data.summary.avg_review_duration_days ?? '' },
    { metric: 'Min Review Duration (days)', value: data.summary.min_review_duration_days ?? '' },
    { metric: 'Max Review Duration (days)', value: data.summary.max_review_duration_days ?? '' },
    { metric: 'Total AMS Released', value: data.summary.total_ams_released },
  ]);

  const projects = workbook.addWorksheet('Projects');
  projects.columns = [
    { header: 'Project', key: 'name', width: 34 },
    { header: 'Type', key: 'project_type', width: 18 },
    { header: 'Urgency', key: 'urgency', width: 20 },
    { header: 'Total Current Docs', key: 'total_docs', width: 18 },
    { header: 'Completed Docs', key: 'completed_docs', width: 16 },
    { header: 'Remaining Docs', key: 'remaining_docs', width: 16 },
    { header: 'Superseded Revisions', key: 'superseded_revisions', width: 20 },
    { header: 'Completion Rate (%)', key: 'completion_rate', width: 20 },
    { header: 'Overdue Reviews', key: 'overdue_reviews', width: 16 },
    { header: 'Avg Review Duration (days)', key: 'avg_review_duration_days', width: 25 },
  ];
  projects.addRows(data.projects.map((project) => ({
    ...project,
    overdue_reviews: project.overdue_reviews.length,
    avg_review_duration_days: project.avg_review_duration_days ?? '',
  })));

  const overdue = workbook.addWorksheet('Overdue Reviews');
  overdue.columns = [
    { header: 'Project', key: 'project', width: 34 },
    { header: 'Document', key: 'document', width: 34 },
    { header: 'Document Number', key: 'doc_number', width: 20 },
    { header: 'Section', key: 'section', width: 18 },
    { header: 'Stage', key: 'stage', width: 22 },
    { header: 'SLA Deadline', key: 'sla_deadline', width: 24 },
    { header: 'Days Overdue', key: 'days_overdue', width: 16 },
  ];
  for (const project of data.projects) {
    for (const item of project.overdue_reviews) {
      overdue.addRow({
        project: project.name,
        document: item.document_title,
        doc_number: item.doc_number,
        section: item.section,
        stage: item.stage,
        sla_deadline: item.sla_deadline ? new Date(item.sla_deadline).toISOString() : '',
        days_overdue: item.days_overdue,
      });
    }
  }

  for (const sheet of workbook.worksheets) {
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    header.alignment = { vertical: 'middle' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + sheet.columnCount)}1` };
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
