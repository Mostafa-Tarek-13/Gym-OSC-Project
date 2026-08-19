import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { SignInInput, RegisterInput } from '../utils/validators';
import { createAuthToken } from '../utils/jwt';

export class DuplicateEmailError extends Error {
	constructor() {
		super('Email is already registered');
		this.name = 'DuplicateEmailError';
	}
}

export class InvalidCredentialsError extends Error {
	constructor() {
		super('Invalid email or password');
		this.name = 'InvalidCredentialsError';
	}
}

export async function registerUser(input: RegisterInput) {
	const existingUser = await User.findOne({ email: input.email }).lean();
	if (existingUser) {
		throw new DuplicateEmailError();
	}

	const password = await bcrypt.hash(input.password, 12);
	try {
		const user = await User.create({
			fullName: input.fullName,
			email: input.email,
			password,
			role: input.role ?? ('member' as UserRole),
		});

		return {
			id: user._id,
			fullName: user.fullName,
			email: user.email,
			role: user.role,
		};
	} catch (error: unknown) {
		if (isDuplicateKeyError(error)) {
			throw new DuplicateEmailError();
		}
		throw error;
	}
}

export async function signInUser(input: SignInInput) {
	const user = await User.findOne({ email: input.email });
	if (!user || !(await bcrypt.compare(input.password, user.password))) {
		throw new InvalidCredentialsError();
	}

	const userId = user._id.toString();
	const token = createAuthToken({ userId, role: user.role });

	return {
		userId,
		role: user.role,
		token,
	};
}

function isDuplicateKeyError(error: unknown): boolean {
	return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
