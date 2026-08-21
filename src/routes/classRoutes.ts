
import { Router} from "express";
import {createSessionController, updateSessionController, cancelSessionController} from "../controllers/classController";

import {authMiddleware, roleMiddleware} from "../middleware/auth";

import { searchClassesController } from '../controllers/classController';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('trainer'), createSessionController);
router.patch('/:id', authMiddleware, roleMiddleware('trainer'), updateSessionController);
router.delete('/:id', authMiddleware, roleMiddleware('trainer'), cancelSessionController);
router.get('/', searchClassesController);


export default router;
