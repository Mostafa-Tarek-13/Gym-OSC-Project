import { Document, model, Schema } from 'mongoose';

export type UserRole = 'trainer' | 'member';

export interface IUser extends Document {
	fullName: string;
	email: string;
	password: string;
	role: UserRole;
}

const userSchema = new Schema<IUser>(
	{
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
			enum: ['trainer', 'member'],
			required: true,
			default: 'member',
		},
	},
	{ timestamps: true },
);

export const User = model<IUser>('User', userSchema);
