import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicleController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import {
  createVehicleSchema,
  updateVehicleSchema,
  restockVehicleSchema,
} from '../lib/validation';

const router = Router();

router.post('/', authenticate, validate(createVehicleSchema), createVehicle);
router.get('/search', authenticate, searchVehicles);
router.get('/', authenticate, getVehicles);
router.put('/:id', authenticate, validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', authenticate, requireAdmin, deleteVehicle);
router.post('/:id/purchase', authenticate, purchaseVehicle);
router.post('/:id/restock', authenticate, requireAdmin, validate(restockVehicleSchema), restockVehicle);

export default router;