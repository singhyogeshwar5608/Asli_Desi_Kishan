import type { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { ProductService } from './product.service';
import {
  type CreateProductDto,
  type ListProductQuery,
  type ProductIdParams,
  type StockUpdateDto,
  type UpdateProductDto,
} from './product.validation';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.list(req.query as ListProductQuery);
  res.json(result);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.getById(req.params as ProductIdParams);
  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.create(req.body as CreateProductDto);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.update(
    req.params as ProductIdParams,
    req.body as UpdateProductDto
  );
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.remove(req.params as ProductIdParams);
  res.json({ product });
});

export const adjustProductStock = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.adjustStock(
    req.params as ProductIdParams,
    req.body as StockUpdateDto
  );
  res.json({ product });
});
