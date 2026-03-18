import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { CouponService } from './coupon.service';
import type {
  ApplyCouponDto,
  CouponIdParams,
  CreateCouponDto,
  ListCouponsQuery,
  ToggleCouponDto,
  UpdateCouponDto,
} from './coupon.validation';

export const listCoupons = asyncHandler(async (req: Request, res: Response) => {
  const result = await CouponService.list(req.query as ListCouponsQuery);
  res.json(result);
});

export const getCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.getById(req.params as CouponIdParams);
  res.json({ coupon });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.create(req.body as CreateCouponDto);
  res.status(201).json({ coupon });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.update(
    req.params as CouponIdParams,
    req.body as UpdateCouponDto
  );
  res.json({ coupon });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.remove(req.params as CouponIdParams);
  res.json({ coupon });
});

export const toggleCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.toggle(
    req.params as CouponIdParams,
    req.body as ToggleCouponDto
  );
  res.json({ coupon });
});

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await CouponService.apply(req.body as ApplyCouponDto);
  res.json(result);
});
