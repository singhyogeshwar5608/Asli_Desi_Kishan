import type { Express } from 'express';
import { authRouter } from '@modules/auth/auth.routes';
import { memberRouter } from '@modules/members/member.routes';
import { productRouter } from '@modules/products/product.routes';
import { orderRouter } from '@modules/orders/order.routes';
import { couponRouter } from '@modules/coupons/coupon.routes';
import { reportRouter } from '@modules/reports/report.routes';
import { mediaRouter } from '@modules/media/media.routes';

const API_PREFIX = '/api/v1';

export const registerModuleRoutes = (app: Express) => {
  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/members`, memberRouter);
  app.use(`${API_PREFIX}/products`, productRouter);
  app.use(`${API_PREFIX}/orders`, orderRouter);
  app.use(`${API_PREFIX}/coupons`, couponRouter);
  app.use(`${API_PREFIX}/reports`, reportRouter);
  app.use(`${API_PREFIX}/media`, mediaRouter);
};
