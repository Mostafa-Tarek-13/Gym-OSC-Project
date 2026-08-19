import { UserRole } from '../models/User';

export interface RegisterInput {
	fullName: string;
	email: string;
	password: string;
	role?: UserRole;
}

export interface SignInInput {
	email: string;
	password: string;
}

export function validateRegisterInput(input: unknown): RegisterInput {
	if (!input || typeof input !== 'object') {
		throw new Error('Request body must be an object');
	}

	const body = input as Record<string, unknown>;
	const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
	const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
	const password = typeof body.password === 'string' ? body.password : '';
	const role = body.role === undefined ? undefined : body.role;

	if (!fullName || !email || !password) {
		throw new Error('fullName, email, and password are required');
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error('A valid email is required');
	}

	if (password.length < 6) {
		throw new Error('Password must be at least 6 characters');
	}

	if (role !== undefined && role !== 'trainer' && role !== 'member') {
		throw new Error('Role must be trainer or member');
	}

	return { fullName, email, password, role };
}

export function validateSignInInput(input: unknown): SignInInput {
	if (!input || typeof input !== 'object') {
		throw new Error('Request body must be an object');
	}

	const body = input as Record<string, unknown>;
	const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
	const password = typeof body.password === 'string' ? body.password : '';

	if (!email || !password) {
		throw new Error('Email and password are required');
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error('A valid email is required');
	}

	return { email, password };
}
