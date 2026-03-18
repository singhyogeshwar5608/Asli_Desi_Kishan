import { Schema, model, type Document } from 'mongoose';

export interface ProductDocument extends Document {
  sku: string;
  name: string;
  brand: string;
  description?: string;
  actualPrice: number;
  totalPrice: number;
  bv: number;
  stock: number;
  categories: string[];
  images: Array<{
    url: string;
    alt?: string;
  }>;
  rating: number;
  popularityScore: number;
  isActive: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<ProductDocument>(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, default: 'Independent' },
    description: { type: String },
    actualPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bv: { type: Number, required: true },
    stock: { type: Number, required: true },
    categories: { type: [String], default: [] },
    images: { type: [ImageSchema], default: [] },
    rating: { type: Number, default: 4.5 },
    popularityScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', categories: 'text' });

ProductSchema.set('toJSON', {
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

export const ProductModel = model<ProductDocument>('Product', ProductSchema);
