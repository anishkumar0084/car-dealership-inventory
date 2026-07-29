import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { BadRequestError, NotFoundError } from '../lib/errors';

export const createVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      throw new BadRequestError('All vehicle fields are required');
    }

    const vehicle = await prisma.vehicle.create({
      data: { make, model, category, price, quantity },
    });

    return res.status(201).json({ vehicle });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
};

export const searchVehicles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;

    const filters: any = {};

    if (make) filters.make = { equals: make as string, mode: 'insensitive' };
    if (model) filters.model = { equals: model as string, mode: 'insensitive' };
    if (category) filters.category = { equals: category as string, mode: 'insensitive' };

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice as string);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice as string);
    }

    const vehicles = await prisma.vehicle.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { make, model, category, price, quantity } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(make !== undefined && { make }),
        ...(model !== undefined && { model }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price }),
        ...(quantity !== undefined && { quantity }),
      },
    });

    return res.status(200).json({ vehicle: updatedVehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    await prisma.vehicle.delete({ where: { id } });

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const purchaseVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    if (vehicle.quantity <= 0) {
      throw new BadRequestError('Vehicle is out of stock');
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity - 1 },
    });

    return res.status(200).json({ vehicle: updatedVehicle });
  } catch (error) {
    next(error);
  }
};

export const restockVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      throw new BadRequestError('Restock amount must be a positive number');
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity + amount },
    });

    return res.status(200).json({ vehicle: updatedVehicle });
  } catch (error) {
    next(error);
  }
};