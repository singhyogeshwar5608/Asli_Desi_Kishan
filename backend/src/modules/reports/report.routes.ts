import { Router } from 'express';
import { authenticate, requireRoles } from '@middlewares/auth';
import { validateRequest } from '@utils/validateRequest';
import { exportReportSchema, rangeQuerySchema } from './report.validation';
import { exportReport, getDashboardReport } from './report.controller';

const reportRouter = Router();

reportRouter.use(authenticate, requireRoles('ADMIN'));

reportRouter.get('/dashboard', validateRequest(rangeQuerySchema), getDashboardReport);
reportRouter.get('/export', validateRequest(exportReportSchema), exportReport);

export { reportRouter };
