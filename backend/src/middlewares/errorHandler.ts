import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/apiError';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    message: 'Internal server error',
  });
};
