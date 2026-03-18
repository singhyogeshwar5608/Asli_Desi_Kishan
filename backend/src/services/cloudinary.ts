import { v2 as cloudinary } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';

import { config } from '@config/env';
import { ApiError } from '@utils/apiError';

const hasCredentials = Boolean(
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
);

if (hasCredentials) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export type CloudinaryUploadResult = {
  url: string;
  secureUrl: string;
  publicId: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  originalFilename?: string;
};

const ensureConfigured = () => {
  if (!hasCredentials) {
    throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Cloudinary is not configured');
  }
};

export const cloudinaryService = {
  uploadImage: (buffer: Buffer, filename: string) => {
    ensureConfigured();

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: config.cloudinary.uploadFolder ?? 'netshop_flutter/products',
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new ApiError(StatusCodes.BAD_GATEWAY, error?.message ?? 'Cloudinary upload failed')
            );
          }

          resolve({
            url: result.url,
            secureUrl: result.secure_url ?? result.url,
            publicId: result.public_id,
            bytes: result.bytes,
            width: result.width ?? 0,
            height: result.height ?? 0,
            format: result.format ?? 'image',
            originalFilename: filename,
          });
        }
      );

      stream.end(buffer);
    });
  },
};
