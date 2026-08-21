import { ClassSession, IClassSession } from "../models/ClassSession";
import { Booking } from "../models/Booking";

export class ClassService{
    async createSession(trainerId: string, sessionData: Partial<IClassSession>) :Promise <IClassSession> {
        return await ClassSession.create({
            title: sessionData.title,
            timeSlot: sessionData.timeSlot,
            capacity: sessionData.capacity,
            trainer: trainerId,
        });
    }


    async updateSession(sessionId: string, trainerId: string, updateData:Partial <IClassSession>) : Promise <IClassSession>{
        const session = await ClassSession.findOne({ _id: sessionId, trainer: trainerId});
        if(!session){
            throw new Error('Class session not found or unauthorized');
        }
        Object.assign(session, updateData);
        return await session.save();
    } 

    async deleteSession(sessionId: string, trainerId: string) :Promise<void>{
        const session = await ClassSession.findOne({ _id: sessionId, trainer: trainerId});
        if(!session){
            throw new Error('Class session not found or unauthorized');
        }

        const activeBookingCount = await Booking.countDocuments({
            session: sessionId, 
            status: 'booked',
        });

        if (activeBookingCount > 0){
            throw new Error('Cannot delete session because it has confirmed bookings')
        }
        await ClassSession.findByIdAndDelete(sessionId);
    }
}

