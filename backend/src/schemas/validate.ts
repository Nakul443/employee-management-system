// will catch validation errors and send error response
// example: 

import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};