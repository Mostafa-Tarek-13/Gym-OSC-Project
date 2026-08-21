
import { Request, Response } from "express";
import { AuthRequest } from '../middleware/auth';
import { BookingService } from '../services/bookingService';


const bookingService = new BookingService();
export const createBookingController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sessionId = req.body.id;
        if (!req.user) {
            res.status(401).json({ message: "User required" });
            return;
        }
        const memberId = req.user?.id;
        const booking = await bookingService.createBooking(sessionId, memberId);
        res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const cancelBookingController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        //note
        const sessionId = req.params.sessionId;
        if (!req.user) {
            res.status(401).json({ message: "User required" });
            return;
        }
        const memberId = req.user?.id;
        const booking = await bookingService.cancelBooking(sessionId, memberId);
        res.status(201).json({ success: true, message: "Successful Booking Cancellation", data: booking });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getBookingController = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User required" });
            return;
        }
        const memberId = req.user?.id;
        const bookings = await bookingService.getMemberBookings(memberId);
        res.status(200).json({
            success: true, count: bookings.length, data: bookings
        });
    } catch (error: any) {
        res.status(500).json({
            success: false, message: 'Failed to retrieve bookings', error: error.message
        });
    }
};

