import { Schema, model, type Document, type Types } from 'mongoose';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface OrderItem {
  productId: Types.ObjectId;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  bv: number;
  image?: string;
}

export interface OrderDocument extends Document {
  memberId: Types.ObjectId;
  memberSnapshot: {
    memberId: string;
    fullName: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalBv: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  history: Array<{
    status: OrderStatus;
    note?: string;
    changedBy: string;
    changedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    bv: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    memberSnapshot: {
      memberId: { type: String, required: true },
      fullName: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    totalBv: { type: Number, required: true },
    couponCode: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'PENDING',
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    history: {
      type: [
        new Schema(
          {
            status: {
              type: String,
              enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
              required: true,
            },
            note: { type: String },
            changedBy: { type: String, required: true },
            changedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    return ret;
  },
});

export const OrderModel = model<OrderDocument>('Order', OrderSchema);
