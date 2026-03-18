import { Schema, model, type Document } from 'mongoose';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface CouponDocument extends Document {
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  minBv?: number;
  maxDiscountValue?: number;
  startDate?: Date;
  endDate?: Date;
  maxUsage?: number;
  usageCount: number;
  maxUsagePerMember?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<CouponDocument>(
  {
    code: { type: String, required: true, uppercase: true },
    title: { type: String, required: true },
    description: { type: String },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number },
    minBv: { type: Number },
    maxDiscountValue: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    maxUsage: { type: Number },
    usageCount: { type: Number, default: 0 },
    maxUsagePerMember: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

CouponSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      Reflect.deleteProperty(ret, '_id');
    }
    return ret;
  },
});

export const CouponModel = model<CouponDocument>('Coupon', CouponSchema);
