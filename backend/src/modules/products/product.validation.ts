import { z } from 'zod';

export const productIdParamSchema = z.object({
  params: z.object({
    productId: z.string().min(1),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(2),
    name: z.string().min(2),
    description: z.string().optional(),
    actualPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    bv: z.number().nonnegative(),
    stock: z.number().int().min(0),
    categories: z.array(z.string()).default([]),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().optional(),
        })
      )
      .default([]),
    isActive: z.boolean().default(true),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

export const listProductSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const stockUpdateSchema = productIdParamSchema.merge(
  z.object({
    body: z.object({
      adjustment: z.number().int(),
    }),
  })
);

export type CreateProductDto = z.infer<typeof createProductSchema>['body'];
export type UpdateProductDto = z.infer<typeof updateProductSchema>['body'];
export type ListProductQuery = z.infer<typeof listProductSchema>['query'];
export type ProductIdParams = z.infer<typeof productIdParamSchema>['params'];
export type StockUpdateDto = z.infer<typeof stockUpdateSchema>['body'];
