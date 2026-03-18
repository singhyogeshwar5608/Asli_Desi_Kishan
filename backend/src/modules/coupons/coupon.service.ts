import { StatusCodes } from 'http-status-codes';
import { CouponModel } from './coupon.model';
import type {
  ApplyCouponDto,
  CouponIdParams,
  CreateCouponDto,
  ListCouponsQuery,
  ToggleCouponDto,
  UpdateCouponDto,
} from './coupon.validation';
import { ApiError } from '@utils/apiError';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

const buildCouponFilter = (query: ListCouponsQuery) => {
  const filter: Record<string, unknown> = {};
  if (query.status) {
    filter.isActive = query.status === 'active';
  }
  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ code: regex }, { title: regex }, { description: regex }];
  }
  return filter;
};

const normalizeCode = (code: string) => code.trim().toUpperCase();

const ensureCouponExists = async (params: CouponIdParams) => {
  const coupon = await CouponModel.findById(params.couponId);
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
  }
  return coupon;
};

const validateCouponUsage = (coupon: InstanceType<typeof CouponModel>) => {
  const now = new Date();
  if (!coupon.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon is inactive');
  }
  if (coupon.startDate && now < coupon.startDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon is not active yet');
  }
  if (coupon.endDate && now > coupon.endDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon has expired');
  }
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Coupon usage limit reached');
  }
};

const computeDiscountAmount = (payload: ApplyCouponDto, discountType: string, discountValue: number, maxDiscountValue?: number) => {
  let amount =
    discountType === 'PERCENTAGE'
      ? (payload.subtotal * discountValue) / 100
      : discountValue;
  if (maxDiscountValue) {
    amount = Math.min(amount, maxDiscountValue);
  }
  return amount;
};

export const CouponService = {
  list: async (query: ListCouponsQuery) => {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    const filter = buildCouponFilter(query);

    const [coupons, total] = await Promise.all([
      CouponModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CouponModel.countDocuments(filter),
    ]);

    return {
      data: coupons,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  getById: async (params: CouponIdParams) => {
    const coupon = await CouponModel.findById(params.couponId).lean();
    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }
    return coupon;
  },

  create: async (payload: CreateCouponDto) => {
    const code = normalizeCode(payload.code);
    const existing = await CouponModel.findOne({ code });
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'Coupon code already exists');
    }
    const coupon = await CouponModel.create({ ...payload, code });
    return coupon.toJSON();
  },

  update: async (params: CouponIdParams, payload: UpdateCouponDto) => {
    if (payload.code) {
      payload.code = normalizeCode(payload.code);
    }
    const coupon = await CouponModel.findByIdAndUpdate(params.couponId, payload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }
    return coupon;
  },

  remove: async (params: CouponIdParams) => {
    const coupon = await CouponModel.findByIdAndDelete(params.couponId).lean();
    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }
    return coupon;
  },

  toggle: async (params: CouponIdParams, payload: ToggleCouponDto) => {
    const coupon = await CouponModel.findByIdAndUpdate(
      params.couponId,
      { isActive: payload.isActive },
      { new: true }
    ).lean();
    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }
    return coupon;
  },

  apply: async (payload: ApplyCouponDto) => {
    const code = normalizeCode(payload.code);
    const coupon = await CouponModel.findOne({ code });
    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coupon not found');
    }

    validateCouponUsage(coupon);

    if (coupon.minOrderAmount && payload.subtotal < coupon.minOrderAmount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order amount below coupon minimum');
    }

    if (coupon.minBv && payload.totalBv < coupon.minBv) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'BV below coupon minimum');
    }

    const discount = computeDiscountAmount(
      payload,
      coupon.discountType,
      coupon.discountValue,
      coupon.maxDiscountValue
    );

    return {
      coupon: coupon.toJSON(),
      discount,
    };
  },

  recordUsage: async (couponId: string) => {
    await CouponModel.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 } }).exec();
  },
};
