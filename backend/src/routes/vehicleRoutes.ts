import { Router } from 'express';
import { createVehicle, getVehicles, searchVehicles, updateVehicle } from '../controllers/vehicleController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createVehicle);
router.get('/search', authenticate, searchVehicles);
router.get('/', authenticate, getVehicles);
router.put('/:id', authenticate, updateVehicle);

export default router;