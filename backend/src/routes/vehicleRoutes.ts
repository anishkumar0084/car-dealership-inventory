import { Router } from 'express';
import { createVehicle, getVehicles } from '../controllers/vehicleController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createVehicle);
router.get('/', authenticate, getVehicles);

export default router;