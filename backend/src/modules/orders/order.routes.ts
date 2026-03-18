import { Router } from 'express';
import { authenticate, requireRoles } from '@middlewares/auth';
import { validateRequest } from '@utils/validateRequest';
import {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamSchema,
  refundOrderSchema,
  updateOrderStatusSchema,
} from './order.validation';
import {
  createOrder,
  getOrder,
  listOrders,
  refundOrder,
  updateOrderStatus,
} from './order.controller';

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter
  .route('/')
  .get(requireRoles('ADMIN'), validateRequest(listOrdersSchema), listOrders)
  .post(requireRoles('ADMIN'), validateRequest(createOrderSchema), createOrder);

orderRouter
  .route('/:orderId')
  .get(requireRoles('ADMIN', 'MEMBER'), validateRequest(orderIdParamSchema), getOrder);

orderRouter.post(
  '/:orderId/status',
  requireRoles('ADMIN'),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus
);

orderRouter.post(
  '/:orderId/refund',
  requireRoles('ADMIN'),
  validateRequest(refundOrderSchema),
  refundOrder
);

export { orderRouter };
