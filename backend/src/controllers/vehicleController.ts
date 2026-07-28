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