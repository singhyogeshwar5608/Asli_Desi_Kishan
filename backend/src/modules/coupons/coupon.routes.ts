import { Router } from 'express';
import { authenticate, requireRoles } from '@middlewares/auth';
import { validateRequest } from '@utils/validateRequest';
import {
  applyCouponSchema,
  couponIdParamSchema,
  createCouponSchema,
  listCouponsSchema,
  toggleCouponSchema,
  updateCouponSchema,
} from './coupon.validation';
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  toggleCoupon,
  updateCoupon,
} from './coupon.controller';

const couponRouter = Router();

couponRouter.use(authenticate);

couponRouter
  .route('/')
  .get(requireRoles('ADMIN'), validateRequest(listCouponsSchema), listCoupons)
  .post(requireRoles('ADMIN'), validateRequest(createCouponSchema), createCoupon);

couponRouter
  .route('/:couponId')
  .get(requireRoles('ADMIN'), validateRequest(couponIdParamSchema), getCoupon)
  .patch(
    requireRoles('ADMIN'),
    validateRequest(updateCouponSchema.merge(couponIdParamSchema)),
    updateCoupon
  )
  .delete(requireRoles('ADMIN'), validateRequest(couponIdParamSchema), deleteCoupon);

couponRouter.post(
  '/:couponId/toggle',
  requireRoles('ADMIN'),
  validateRequest(toggleCouponSchema),
  toggleCoupon
);

couponRouter.post(
  '/apply',
  requireRoles('ADMIN', 'MEMBER'),
  validateRequest(applyCouponSchema),
  applyCoupon
);

export { couponRouter };
