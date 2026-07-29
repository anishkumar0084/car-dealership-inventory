import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1, { message: 'Make is required' }),
  model: z.string().trim().min(1, { message: 'Model is required' }),
  category: z.string().trim().min(1, { message: 'Category is required' }),
  price: z.number({ message: 'Price is required' }).nonnegative({ message: 'Price must be non-negative' }),
  quantity: z.number({ message: 'Quantity is required' }).int({ message: 'Quantity must be an integer' }).nonnegative({ message: 'Quantity must be non-negative' }),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const restockVehicleSchema = z.object({
  amount: z.number({ message: 'Restock amount is required' })
    .int({ message: 'Restock amount must be an integer' })
    .positive({ message: 'Restock amount must be positive' }),
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type RestockVehicleInput = z.infer<typeof restockVehicleSchema>;
