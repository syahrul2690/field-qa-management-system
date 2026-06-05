import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as boqService from '../services/boqService';

// POST /api/projects/:projectId/boq/upload
export const uploadBoq = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded. Use field name "boq_file".', 400);
  }

  const { projectId } = req.params;
  const result = await boqService.uploadBoq(projectId, req.file.path);

  res.status(201).json({
    success: true,
    message: `BoQ uploaded successfully. ${result.count} items created.`,
    data: result,
  });
});

// GET /api/projects/:projectId/boq
export const getBoqTree = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const tree = await boqService.getBoqTree(projectId);

  res.json({ success: true, data: tree });
});

// DELETE /api/projects/:projectId/boq
export const clearBoq = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  await boqService.clearBoq(projectId);

  res.json({ success: true, message: 'BoQ cleared. You may now re-upload.' });
});

// GET /api/boq/template
export const downloadTemplate = asyncHandler(async (_req: Request, res: Response) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Field QA Management System';
  const ws = wb.addWorksheet('BoQ');

  // Column definitions
  ws.columns = [
    { header: 'Level',       key: 'level',       width: 8  },
    { header: 'Item Code',   key: 'item_code',   width: 14 },
    { header: 'Title',       key: 'title',       width: 42 },
    { header: 'Description', key: 'description', width: 52 },
    { header: 'Parent Code', key: 'parent_code', width: 14 },
  ];

  // Style the header row
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Sample data — realistic PLN power plant BoQ
  const rows: Array<[number, string, string, string, string]> = [
    [1, 'A',     'Civil Works',                  'Civil and structural construction scope',          ''   ],
    [2, 'A.1',   'Foundation Work',              'Substructure and foundation construction',         'A'  ],
    [3, 'A.1.1', 'Earthworks',                   'Soil excavation, backfill, and compaction',        'A.1'],
    [3, 'A.1.2', 'Concrete Piling',              'Supply and installation of concrete piles',        'A.1'],
    [3, 'A.1.3', 'Reinforced Concrete Footing',  'RC footing casting with formwork and rebar',       'A.1'],
    [2, 'A.2',   'Structural Steel',             'Structural steel fabrication and erection',        'A'  ],
    [3, 'A.2.1', 'Steel Fabrication',            'Fabrication of columns, beams, and bracing',       'A.2'],
    [3, 'A.2.2', 'Steel Erection',               'Field erection, alignment, and bolting',           'A.2'],
    [1, 'B',     'Electrical Works',             'HV/LV electrical installation scope',              ''   ],
    [2, 'B.1',   'High Voltage Equipment',       'Procurement and installation of HV equipment',     'B'  ],
    [3, 'B.1.1', 'Power Transformer',            'Installation of 150/20 kV power transformer',      'B.1'],
    [3, 'B.1.2', 'HV Switchgear Panel',          'GIS/AIS HV switchgear installation and testing',   'B.1'],
    [2, 'B.2',   'Low Voltage Distribution',     'LV panel, cable ladder, and wiring',               'B'  ],
    [3, 'B.2.1', 'LV Main Distribution Panel',   'Fabrication and installation of LVMDP',            'B.2'],
    [3, 'B.2.2', 'Cable Laying & Termination',   'Power and control cable installation',             'B.2'],
    [1, 'C',     'Instrumentation & Control',    'DCS, PLC, and field instrument installation',      ''   ],
    [2, 'C.1',   'DCS / PLC System',             'Control system hardware supply and installation',  'C'  ],
    [3, 'C.1.1', 'Controller Cabinet',           'Assembly and wiring of DCS controller cabinets',   'C.1'],
    [3, 'C.1.2', 'Field Instrument Installation','Installation of transmitters, sensors, and gauges', 'C.1'],
  ];

  for (const [level, item_code, title, description, parent_code] of rows) {
    const r = ws.addRow({ level, item_code, title, description, parent_code });
    // Indent title visually by level
    r.getCell('title').alignment = { indent: (level - 1) * 2 };
    if (level === 1) {
      r.font = { bold: true };
      r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    }
  }

  // Freeze header row
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="boq_template.xlsx"');
  res.send(Buffer.from(buffer));
});

// GET /api/boq/:itemId
export const getBoqItem = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const item = await boqService.getBoqItem(itemId);

  res.json({ success: true, data: item });
});

// GET /api/boq/:itemId/children
export const getBoqItemChildren = asyncHandler(async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const children = await boqService.getBoqItemChildren(itemId);

  res.json({ success: true, data: children });
});
