import { Document, model, Schema, Types } from 'mongoose';

export type BookingStatus = 'booked' | 'cancelled';

export interface IBooking extends Document {
	session: Types.ObjectId;
	member: Types.ObjectId;
	status: BookingStatus;
}

const bookingSchema = new Schema<IBooking>(
	{
		session: {
			type: Schema.Types.ObjectId,
			ref: 'ClassSession',
			required: true,
		},
		member: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		status: {
			type: String,
			enum: ['booked', 'cancelled'],
			required: true,
			default: 'booked',
		},
	},
	{ timestamps: true },
);

bookingSchema.index({ session: 1, member: 1 }, { unique: true });

export const Booking = model<IBooking>('Booking', bookingSchema);
