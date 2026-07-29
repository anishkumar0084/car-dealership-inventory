import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'All vehicle fields are required' });
    }

    const vehicle = await prisma.vehicle.create({
      data: { make, model, category, price, quantity },
    });

    return res.status(201).json({ vehicle });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ vehicles });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const searchVehicles = async (req: AuthRequest, res: Response) => {
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
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { make, model, category, price, quantity } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
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
    return res.status(500).json({ error: 'Something went wrong' });
  }
};