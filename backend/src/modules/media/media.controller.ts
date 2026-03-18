import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '@utils/asyncHandler';
import { ApiError } from '@utils/apiError';
import { cloudinaryService } from '@services/cloudinary';

const normalizeFiles = (req: Request): Express.Multer.File[] => {
  const files = req.files;
  if (!files) {
    return [];
  }
  if (Array.isArray(files)) {
    return files;
  }
  return Object.values(files).flat();
};

export const uploadProductMedia = asyncHandler(async (req: Request, res: Response) => {
  const files = normalizeFiles(req);

  if (!files || !files.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No files uploaded');
  }

  const uploads = await Promise.all(
    files.map((file) => cloudinaryService.uploadImage(file.buffer, file.originalname))
  );

  res.status(StatusCodes.CREATED).json({
    files: uploads.map((file) => ({
      url: file.secureUrl,
      secureUrl: file.secureUrl,
      publicId: file.publicId,
      bytes: file.bytes,
      width: file.width,
      height: file.height,
      format: file.format,
      name: file.originalFilename ?? file.publicId,
    })),
  });
});
