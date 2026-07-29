import { Router } from 'express';
import { createVehicle, getVehicles, searchVehicles } from '../controllers/vehicleController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createVehicle);
router.get('/search', authenticate, searchVehicles);
router.get('/', authenticate, getVehicles);

export default router;