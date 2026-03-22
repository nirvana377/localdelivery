import { Router } from 'express';
import {
    getAssignedOrders,
    updateDeliveryStatus,
    updateRiderLocation,
    getRiders
} from '../controllers/delivery.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/orders', authMiddleware, roleMiddleware(['rider']), getAssignedOrders);
router.put('/orders/:id/status', authMiddleware, roleMiddleware(['rider']), updateDeliveryStatus);
router.post('/orders/:id/location', authMiddleware, roleMiddleware(['rider']), updateRiderLocation);
router.get('/riders', authMiddleware, roleMiddleware(['business']), getRiders);

export default router;