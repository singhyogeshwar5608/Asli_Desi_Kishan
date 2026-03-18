import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { OrderService } from './order.service';
import type {
  CreateOrderDto,
  ListOrdersQuery,
  OrderIdParams,
  RefundOrderDto,
  UpdateOrderStatusDto,
} from './order.validation';

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await OrderService.list(req.query as ListOrdersQuery);
  res.json(result);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const requesterId = req.user?.id;
  const order = await OrderService.getById(req.params as OrderIdParams, requesterId);
  res.json({ order });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const actor = {
    actorId: req.user?.id ?? 'system',
    actorName: req.user?.member?.fullName ?? 'System',
  };
  const order = await OrderService.create(req.body as CreateOrderDto, actor);
  res.status(201).json({ order });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const actor = {
    actorId: req.user?.id ?? 'system',
    actorName: req.user?.member?.fullName ?? 'System',
  };
  const order = await OrderService.updateStatus(
    req.params as OrderIdParams,
    req.body as UpdateOrderStatusDto,
    actor
  );
  res.json({ order });
});

export const refundOrder = asyncHandler(async (req: Request, res: Response) => {
  const actor = {
    actorId: req.user?.id ?? 'system',
    actorName: req.user?.member?.fullName ?? 'System',
  };
  const order = await OrderService.refund(
    req.params as OrderIdParams,
    req.body as RefundOrderDto,
    actor
  );
  res.json({ order });
});
