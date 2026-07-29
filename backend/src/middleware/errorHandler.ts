import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the full stack trace for development debugging
  console.error('❌ Error caught by global handler:', err);

  // 1. Check if it is a custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 2. Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint failed (e.g. duplicate email)
      return res.status(400).json({ error: 'Database constraint violation: Record already exists' });
    }
    if (err.code === 'P2025') {
      // Record not found for update/delete operations
      return res.status(404).json({ error: 'Record not found' });
    }
  }

  // 3. Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token has expired' });
  }

  // 4. Default Fallback for Unhandled Errors (500)
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: isProduction ? 'Something went wrong' : err.message || 'Something went wrong',
  });
};
