
import { Router } from "express";
import {
    createBookingController,
    cancelBookingController,
    getBookingController
} from '../controllers/bookingController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('member'), createBookingController);
router.get('/my-bookings', authMiddleware, roleMiddleware('member'), getBookingController);
router.patch('/:sessionId/cancel', authMiddleware, roleMiddleware('member'), cancelBookingController);

export default router;


