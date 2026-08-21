import { error } from 'node:console';
import { Booking, IBooking } from '../models/Booking';
import { ClassSession } from '../models/ClassSession';


export class BookingService{
    async createBooking(sessionId: string, memberId: string): Promise <IBooking>{
        const session = await ClassSession.findById(sessionId);
        if(!session){
            throw new Error('Session not Found');
        }
        if (session.timeSlot.start.getTime() <= Date.now()){
            throw new Error('Cannot Book Sessions in the Past')
        }
        
        const bookingsCount = await Booking.countDocuments({
            session: sessionId,
            status: 'booked',
        });

        if(bookingsCount >= session.capacity){
            throw new Error('Session has reached full capacity. No available bookings.')
        }

        let existingBooking = await Booking.findOne({session: sessionId, member:memberId, status: 'booked'});
        if(existingBooking){
            if(existingBooking.status === 'booked'){
                throw new Error('Members cannot book the same session twice.');
            }
            existingBooking.status = 'booked';
            return await existingBooking.save();
        }
        return await Booking.create({
            session: sessionId,
            member: memberId,
            status: 'booked',
        });
    }

    async cancelBooking(sessionId: string,memberId: string): Promise <IBooking>{
        const booking = await Booking.findOne({session: sessionId, member: memberId, status: 'booked'});
        if(!booking){
            throw new Error('Booking is not found for this session');
        }
        booking.status = 'cancelled';
        return await booking.save();
    }

    async getMemberBookings(memberId: string) : Promise<IBooking[]>{
        return await Booking.find({member:memberId}).
        populate({
            path: 'session',
            populate: {
                path: 'trainer', select: 'fullName email'
            },
        }); 
    }
}
