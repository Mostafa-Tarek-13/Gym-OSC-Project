import { Router } from 'express';
import { searchClassesController } from '../controllers/classController';

const router = Router();

router.get('/', searchClassesController);

export default router;
