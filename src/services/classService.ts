import { ClassSession } from '../models/ClassSession';

export interface ClassSearchFilters {
	title?: string;
	trainer?: string;
	day?: number;
	startTime?: number;
	endTime?: number;
	minSpots?: number;
	maxSpots?: number;
}

export class ClassService {
	async searchClasses(filters: ClassSearchFilters) {
		const match: Record<string, unknown> = {};

		if (filters.title) {
			match.title = { $regex: filters.title, $options: 'i' };
		}
		const scheduleExpressions: Record<string, unknown>[] = [];
		if (filters.day !== undefined) {
			scheduleExpressions.push({ $eq: [{ $dayOfWeek: '$timeSlot.start' }, filters.day] });
		}
		if (filters.startTime !== undefined) {
			scheduleExpressions.push({
				$gte: [
					{ $add: [{ $multiply: [{ $hour: '$timeSlot.start' }, 60] }, { $minute: '$timeSlot.start' }] },
					filters.startTime,
				],
			});
		}
		if (filters.endTime !== undefined) {
			scheduleExpressions.push({
				$lte: [
					{ $add: [{ $multiply: [{ $hour: '$timeSlot.end' }, 60] }, { $minute: '$timeSlot.end' }] },
					filters.endTime,
				],
			});
		}

		const classes = await ClassSession.aggregate([
			{ $match: match },
			{
				$lookup: {
					from: 'users',
					localField: 'trainer',
					foreignField: '_id',
					as: 'trainer',
				},
			},
			{ $unwind: '$trainer' },
			...(filters.trainer
				? [{ $match: { 'trainer.fullName': { $regex: filters.trainer, $options: 'i' } } }]
				: []),
			{
				$lookup: {
					from: 'bookings',
					let: { sessionId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$session', '$$sessionId'] },
								status: 'booked',
							},
						},
						{ $count: 'count' },
					],
					as: 'bookings',
				},
			},
			{
				$set: {
					bookedSpots: { $ifNull: [{ $arrayElemAt: ['$bookings.count', 0] }, 0] },
				},
			},
			{
				$set: {
					spotsRemaining: { $subtract: ['$capacity', '$bookedSpots'] },
				},
			},
			{
				$match: {
					...(scheduleExpressions.length ? { $expr: { $and: scheduleExpressions } } : {}),
					...(filters.minSpots !== undefined || filters.maxSpots !== undefined
						? {
								spotsRemaining: {
									...(filters.minSpots !== undefined ? { $gte: filters.minSpots } : {}),
									...(filters.maxSpots !== undefined ? { $lte: filters.maxSpots } : {}),
								},
							}
							: {}),
				},
			},
			{
				$project: {
					bookings: 0,
					bookedSpots: 0,
					'trainer.password': 0,
				},
			},
		]);

		return classes;
	}
}


