import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createVehicle);
router.get('/search', authenticate, searchVehicles);
router.get('/', authenticate, getVehicles);
router.put('/:id', authenticate, updateVehicle);
router.delete('/:id', authenticate, requireAdmin, deleteVehicle);

export default router;