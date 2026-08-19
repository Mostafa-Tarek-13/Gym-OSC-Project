import { NextFunction, Request, Response } from 'express';
import { DuplicateEmailError, InvalidCredentialsError } from '../services/authService';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
	if (error instanceof DuplicateEmailError) {
		return res.status(409).json({ message: error.message });
	}

	if (error instanceof InvalidCredentialsError) {
		return res.status(401).json({ message: error.message });
	}

	if (error instanceof Error) {
		return res.status(400).json({ message: error.message });
	}

	return res.status(500).json({ message: 'Internal server error' });
}
