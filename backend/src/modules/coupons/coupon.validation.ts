import { z } from 'zod';

export const couponIdParamSchema = z.object({
  params: z.object({
    couponId: z.string().min(1),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).toUpperCase(),
    title: z.string().min(3),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().nonnegative().optional(),
    minBv: z.number().nonnegative().optional(),
    maxDiscountValue: z.number().nonnegative().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    maxUsage: z.number().int().min(1).optional(),
    maxUsagePerMember: z.number().int().min(1).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateCouponSchema = z.object({
  body: createCouponSchema.shape.body.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

export const listCouponsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    search: z.string().optional(),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).toUpperCase(),
    memberId: z.string().min(1),
    subtotal: z.number().nonnegative(),
    totalBv: z.number().nonnegative(),
  }),
});

export const toggleCouponSchema = couponIdParamSchema.merge(
  z.object({
    body: z.object({
      isActive: z.boolean(),
    }),
  })
);

export type CreateCouponDto = z.infer<typeof createCouponSchema>['body'];
export type UpdateCouponDto = z.infer<typeof updateCouponSchema>['body'];
export type ListCouponsQuery = z.infer<typeof listCouponsSchema>['query'];
export type ApplyCouponDto = z.infer<typeof applyCouponSchema>['body'];
export type CouponIdParams = z.infer<typeof couponIdParamSchema>['params'];
export type ToggleCouponDto = z.infer<typeof toggleCouponSchema>['body'];
