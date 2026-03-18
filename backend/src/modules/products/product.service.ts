import { StatusCodes } from 'http-status-codes';
import { ProductModel } from './product.model';
import {
  type CreateProductDto,
  type ListProductQuery,
  type ProductIdParams,
  type StockUpdateDto,
  type UpdateProductDto,
} from './product.validation';
import { ApiError } from '@utils/apiError';
import { socketService } from '@services/socket';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

const buildSearchFilter = (query: ListProductQuery) => {
  const filter: Record<string, unknown> = {};

  if (query.category) {
    filter.categories = query.category;
  }

  if (query.status) {
    filter.isActive = query.status === 'active';
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

const normalizeProduct = <
  T extends {
    actualPrice?: number;
    totalPrice?: number;
    price?: number;
    isActive?: boolean;
    status?: 'ACTIVE' | 'INACTIVE';
    _id?: unknown;
    id?: unknown;
  }
>(product: T) => {
  const priceFallback = product.price ?? 0;
  const normalizedId = product.id ?? (typeof product._id === 'object' && product._id !== null
      ? (product._id as { toString?: () => string }).toString?.()
      : product._id);

  const result: Record<string, unknown> = {
    ...product,
    id: normalizedId,
    actualPrice: product.actualPrice ?? priceFallback,
    totalPrice: product.totalPrice ?? priceFallback,
    isActive: typeof product.isActive === 'boolean' ? product.isActive : product.status === 'ACTIVE',
  };

  if ('_id' in result) {
    delete result._id;
  }

  return result as T & { id?: unknown; actualPrice: number; totalPrice: number; isActive: boolean };
};

const findProductOrThrow = async ({ productId }: ProductIdParams) => {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

export const ProductService = {
  list: async (query: ListProductQuery) => {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter = buildSearchFilter(query);

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    return {
      data: items.map((item) => normalizeProduct(item)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  },

  getById: async (params: ProductIdParams) => {
    const product = await ProductModel.findById(params.productId).lean();
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }
    return normalizeProduct(product);
  },

  create: async (payload: CreateProductDto) => {
    const existingSku = await ProductModel.findOne({ sku: payload.sku });
    if (existingSku) {
      throw new ApiError(StatusCodes.CONFLICT, 'SKU already exists');
    }

    const product = await ProductModel.create(payload);
    const normalized = normalizeProduct(product.toJSON());
    socketService.emitProductEvent('created', normalized);
    return normalized;
  },

  update: async (params: ProductIdParams, payload: UpdateProductDto) => {
    const product = await ProductModel.findByIdAndUpdate(params.productId, payload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }
    const normalized = normalizeProduct(product);
    socketService.emitProductEvent('updated', normalized);
    return normalized;
  },

  remove: async (params: ProductIdParams) => {
    const product = await ProductModel.findByIdAndDelete(params.productId).lean();
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }
    const normalized = normalizeProduct(product);
    socketService.emitProductEvent('deleted', normalized);
    return normalized;
  },

  adjustStock: async (params: ProductIdParams, payload: StockUpdateDto) => {
    const product = await findProductOrThrow(params);
    const newStock = product.stock + payload.adjustment;
    if (newStock < 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Stock cannot be negative');
    }
    product.stock = newStock;
    await product.save();
    const normalized = normalizeProduct(product.toJSON());
    socketService.emitProductEvent('stock_adjusted', normalized);
    return normalized;
  },
};
