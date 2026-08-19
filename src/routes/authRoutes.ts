import { Router } from 'express';
import { register, signIn } from '../controllers/authController';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/signin', signIn);

export default authRouter;
