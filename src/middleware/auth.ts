import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../models/User';

export class UnauthorizedError extends Error {
	constructor(message = 'Authentication is required') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}

export class ForbiddenError extends Error {
	constructor(message = 'You do not have permission to access this resource') {
		super(message);
		this.name = 'ForbiddenError';
	}
}

function isAuthTokenPayload(payload: string | JwtPayload): payload is JwtPayload & {
	userId: string;
	role: UserRole;
} {
	return (
		typeof payload !== 'string' &&
		typeof payload.userId === 'string' &&
		(payload.role === 'member' || payload.role === 'trainer')
	);
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
	const authorization = req.headers.authorization;
	const token =
		typeof authorization === 'string' && /^Bearer\s+(.+)$/i.test(authorization)
			? authorization.replace(/^Bearer\s+/i, '').trim()
			: '';

	if (!token) {
		return next(new UnauthorizedError('Bearer token is required'));
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'development-secret');
		if (!isAuthTokenPayload(payload)) {
			return next(new UnauthorizedError('Invalid token payload'));
		}

		req.user = { id: payload.userId, role: payload.role };
		return next();
	} catch {
		return next(new UnauthorizedError('Invalid or expired token'));
	}
}

export function roleMiddleware(requiredRole: UserRole) {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new UnauthorizedError('Authentication is required'));
		}

		if (req.user.role !== requiredRole) {
			return next(new ForbiddenError(`Only ${requiredRole}s can access this resource`));
		}

		return next();
	};
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}