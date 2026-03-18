import type { RequestHandler } from 'express';
import type { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject): RequestHandler => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) {
        req.body = parsed.body;
      }
      if (parsed.params) {
        req.params = parsed.params;
      }
      if (parsed.query) {
        req.query = parsed.query;
      }

      next();
    } catch (error) {
      const zodError = error as ZodError;
      res.status(422).json({
        message: 'Validation failed',
        errors: zodError.flatten(),
      });
    }
  };
};
