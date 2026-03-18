import { z } from 'zod';

export const rangeQuerySchema = z.object({
  query: z.object({
    range: z.coerce.number().int().min(7).max(365).default(30),
  }),
});

export const exportReportSchema = z.object({
  query: z.object({
    type: z.enum(['orders', 'members']),
    format: z.enum(['csv', 'xlsx']).default('csv'),
    limit: z.coerce.number().int().min(10).max(5000).optional(),
  }),
});

export type RangeQueryDto = z.infer<typeof rangeQuerySchema>['query'];
export type ExportReportQuery = z.infer<typeof exportReportSchema>['query'];
