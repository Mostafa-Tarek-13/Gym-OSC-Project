import { NextFunction, Request, Response } from 'express';
import { DuplicateEmailError, InvalidCredentialsError } from '../services/authService';
import { ForbiddenError, UnauthorizedError } from './auth';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
	if (error instanceof DuplicateEmailError) {
		return res.status(409).json({ message: error.message });
	}

	if (error instanceof InvalidCredentialsError) {
		return res.status(401).json({ message: error.message });
	}

	if (error instanceof UnauthorizedError) {
		return res.status(401).json({ message: error.message });
	}

	if (error instanceof ForbiddenError) {
		return res.status(403).json({ message: error.message });
	}

	if (error instanceof Error) {
		return res.status(400).json({ message: error.message });
	}

	return res.status(500).json({ message: 'Internal server error' });
}
