import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { OrderModel, type OrderDocument } from './order.model';
import { ProductModel } from '@modules/products/product.model';
import { MemberModel } from '@modules/members/member.model';
import { CouponService } from '@modules/coupons/coupon.service';
import type {
  CreateOrderDto,
  ListOrdersQuery,
  OrderIdParams,
  RefundOrderDto,
  UpdateOrderStatusDto,
} from './order.validation';
import { ApiError } from '@utils/apiError';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

const buildOrderFilter = (query: ListOrdersQuery) => {
  const filter: Record<string, unknown> = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.memberSearch) {
    const regex = new RegExp(query.memberSearch, 'i');
    filter.$or = [
      { 'memberSnapshot.memberId': regex },
      { 'memberSnapshot.fullName': regex },
      { 'memberSnapshot.email': regex },
    ];
  }
  return filter;
};

const hydrateMember = async (memberId: string) => {
  const member = await MemberModel.findOne(
    Types.ObjectId.isValid(memberId) ? { _id: memberId } : { memberId }
  );
  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found');
  }
  return member;
};

const hydrateProducts = async (items: CreateOrderDto['items']) => {
  const ids = items.map((item) => item.productId);
  const products = await ProductModel.find({ _id: { $in: ids } }).lean();
  const productMap = new Map<string, typeof products[number]>();
  products.forEach((p) => productMap.set(p._id.toString(), p));
  return { productMap };
};

const buildOrderItems = async (payload: CreateOrderDto) => {
  const { productMap } = await hydrateProducts(payload.items);
  const orderItems = payload.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }
    if (product.stock < item.quantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Insufficient stock for ${product.name}`);
    }
    return {
      productId: product._id,
      sku: product.sku,
      name: product.name,
      price: product.totalPrice,
      quantity: item.quantity,
      bv: product.bv,
      image: product.images?.[0]?.url,
    };
  });
  return orderItems;
};

const computeTotals = (items: OrderDocument['items']) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalBv = items.reduce((sum, item) => sum + item.bv * item.quantity, 0);
  return { subtotal, totalBv };
};

const adjustInventory = async (items: OrderDocument['items']) => {
  const bulk = items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: -item.quantity } },
    },
  }));
  await ProductModel.bulkWrite(bulk);
};

const restoreInventory = async (items: OrderDocument['items']) => {
  const bulk = items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: item.quantity } },
    },
  }));
  await ProductModel.bulkWrite(bulk);
};

export const OrderService = {
  list: async (query: ListOrdersQuery) => {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter = buildOrderFilter(query);

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  getById: async ({ orderId }: OrderIdParams, requesterId?: string) => {
    const order = await OrderModel.findById(orderId).lean();
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }
    if (requesterId && order.memberId.toString() !== requesterId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot access this order');
    }
    return order;
  },

  create: async (payload: CreateOrderDto, opts: { actorId: string; actorName: string }) => {
    const member = await hydrateMember(payload.memberId);
    const orderItems = await buildOrderItems(payload);
    const totals = computeTotals(orderItems);
    let discount = 0;
    let appliedCouponId: string | undefined;

    if (payload.couponCode) {
      const couponResult = await CouponService.apply({
        code: payload.couponCode,
        memberId: member.memberId,
        subtotal: totals.subtotal,
        totalBv: totals.totalBv,
      });
      discount = couponResult.discount;
      appliedCouponId = couponResult.coupon.id;
    }

    const total = Math.max(totals.subtotal - discount, 0);

    const order = await OrderModel.create({
      memberId: member._id,
      memberSnapshot: {
        memberId: member.memberId,
        fullName: member.fullName,
        email: member.email,
      },
      items: orderItems,
      subtotal: totals.subtotal,
      discount,
      total,
      totalBv: totals.totalBv,
      couponCode: payload.couponCode,
      status: 'PENDING',
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'PENDING',
      shippingAddress: payload.shippingAddress,
      history: [
        {
          status: 'PENDING',
          changedBy: opts.actorName,
          changedAt: new Date(),
        },
      ],
    });

    await adjustInventory(order.items);

    if (appliedCouponId) {
      await CouponService.recordUsage(appliedCouponId);
    }

    return order.toJSON();
  },

  updateStatus: async (
    params: OrderIdParams,
    payload: UpdateOrderStatusDto,
    opts: { actorId: string; actorName: string }
  ) => {
    const order = await OrderModel.findById(params.orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    if (order.status === 'CANCELLED' && payload.status !== 'CANCELLED') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot modify a cancelled order');
    }

    order.status = payload.status;
    order.history.push({
      status: payload.status,
      note: payload.note,
      changedBy: opts.actorName,
      changedAt: new Date(),
    });

    if (payload.status === 'CANCELLED' && order.paymentStatus === 'PAID') {
      order.paymentStatus = 'REFUNDED';
      await restoreInventory(order.items);
    }

    await order.save();
    return order.toJSON();
  },

  refund: async (
    params: OrderIdParams,
    payload: RefundOrderDto,
    opts: { actorId: string; actorName: string }
  ) => {
    const order = await OrderModel.findById(params.orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
    }

    if (order.paymentStatus !== 'PAID') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Only paid orders can be refunded');
    }

    order.paymentStatus = 'REFUNDED';
    order.status = 'CANCELLED';
    order.history.push({
      status: 'CANCELLED',
      note: payload.note ?? 'Refund processed',
      changedBy: opts.actorName,
      changedAt: new Date(),
    });

    await order.save();
    await restoreInventory(order.items);

    return order.toJSON();
  },
};
