import { Request, Response, NextFunction } from 'express';
import { registerUser, signInUser } from '../services/authService';
import { validateRegisterInput, validateSignInInput } from '../utils/validators';

export async function register(req: Request, res: Response, next: NextFunction) {
	try {
		const input = validateRegisterInput(req.body);
		const user = await registerUser(input);
		return res.status(201).json({ user });
	} catch (error) {
		return next(error);
	}
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
	try {
		const input = validateSignInInput(req.body);
		const authentication = await signInUser(input);
		return res.status(200).json(authentication);
	} catch (error) {
		return next(error);
	}
}
