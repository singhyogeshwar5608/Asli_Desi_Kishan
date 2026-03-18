import { z } from 'zod';

export const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
});

const shippingSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().min(6),
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  body: z.object({
    memberId: z.string().min(1),
    items: z.array(orderItemInputSchema).min(1),
    couponCode: z.string().optional(),
    paymentMethod: z.string().min(2),
    shippingAddress: shippingSchema,
  }),
});

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'REFUNDED', 'FAILED']).optional(),
    memberSearch: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = orderIdParamSchema.merge(
  z.object({
    body: z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
      note: z.string().optional(),
    }),
  })
);

export const refundOrderSchema = orderIdParamSchema.merge(
  z.object({
    body: z.object({
      amount: z.number().nonnegative().optional(),
      note: z.string().optional(),
    }),
  })
);

export type CreateOrderDto = z.infer<typeof createOrderSchema>['body'];
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>['query'];
export type OrderIdParams = z.infer<typeof orderIdParamSchema>['params'];
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>['body'];
export type RefundOrderDto = z.infer<typeof refundOrderSchema>['body'];
