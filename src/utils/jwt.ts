import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthTokenPayload {
	userId: string;
	role: UserRole;
}

export function createAuthToken(payload: AuthTokenPayload): string {
	const jwtSecret = process.env.JWT_SECRET ?? 'development-secret';
	return jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
}
