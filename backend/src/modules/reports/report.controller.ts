import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ReportService } from './report.service';
import type { RangeQueryDto, ExportReportQuery } from './report.validation';

export const getDashboardReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await ReportService.getDashboardMetrics(req.query as RangeQueryDto);
  res.json(data);
});

export const exportReport = asyncHandler(async (req: Request, res: Response) => {
  const data = await ReportService.exportReport(req.query as ExportReportQuery);
  res.json(data);
});
