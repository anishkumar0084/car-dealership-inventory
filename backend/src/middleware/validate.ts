import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { BadRequestError } from '../lib/errors';

export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        // ZodError exposes .issues containing the list of validation errors
        const formattedErrors = error.issues
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        
        return next(new BadRequestError(`Validation error: ${formattedErrors}`));
      }
      next(error);
    }
  };
};
