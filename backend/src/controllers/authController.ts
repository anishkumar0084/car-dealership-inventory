import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};