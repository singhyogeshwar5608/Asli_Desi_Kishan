import { Router } from 'express';
import { authenticate, requireRoles } from '@middlewares/auth';
import { validateRequest } from '@utils/validateRequest';
import {
  createProductSchema,
  listProductSchema,
  productIdParamSchema,
  updateProductSchema,
  stockUpdateSchema,
} from './product.validation';
import {
  adjustProductStock,
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from './product.controller';

const productRouter = Router();

productRouter.use(authenticate);

productRouter
  .route('/')
  .get(requireRoles('ADMIN', 'MEMBER'), validateRequest(listProductSchema), listProducts)
  .post(requireRoles('ADMIN'), validateRequest(createProductSchema), createProduct);

productRouter
  .route('/:productId')
  .get(requireRoles('ADMIN', 'MEMBER'), validateRequest(productIdParamSchema), getProduct)
  .patch(
    requireRoles('ADMIN'),
    validateRequest(updateProductSchema.merge(productIdParamSchema)),
    updateProduct
  )
  .delete(requireRoles('ADMIN'), validateRequest(productIdParamSchema), deleteProduct);

productRouter.post(
  '/:productId/stock',
  requireRoles('ADMIN'),
  validateRequest(stockUpdateSchema),
  adjustProductStock
);

export { productRouter };
