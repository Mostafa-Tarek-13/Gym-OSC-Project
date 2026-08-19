import { Document, model, Schema, Types } from 'mongoose';

export interface ITimeSlot {
	start: Date;
	end: Date;
}

export interface IClassSession extends Document {
	title: string;
	trainer: Types.ObjectId;
	timeSlot: ITimeSlot;
	capacity: number;
}

const classSessionSchema = new Schema<IClassSession>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		trainer: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		timeSlot: {
			start: {
				type: Date,
				required: true,
			},
			end: {
				type: Date,
				required: true,
				validate: {
					validator(this: IClassSession, end: Date) {
						return end > this.timeSlot.start;
					},
					message: 'Time slot end must be after its start',
				},
			},
		},
		capacity: {
			type: Number,
			required: true,
			min: 1,
			validate: {
				validator: Number.isInteger,
				message: 'Capacity must be a whole number',
			},
		},
	},
	{ timestamps: true },
);

export const ClassSession = model<IClassSession>('ClassSession', classSessionSchema);
