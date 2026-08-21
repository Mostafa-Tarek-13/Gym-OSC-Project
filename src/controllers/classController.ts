git 
import {Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ClassSearchFilters, ClassService } from '../services/classService';


const classService = new ClassService();

export const createSessionController = async (req: AuthRequest, res: Response) : Promise<void> => {
    try{
        if(!req.user){
            res.status(401).json({
                success: false, 
                message: "User Required"             
            });
            return;
        }
        const trainerId = req.user.id;
        const session = await classService.createSession(trainerId, req.body);
        res.status(201).json({
            success: true,
            message: 'Session Created Successfully',
            data: session
        });
    }catch(error:any){
        res.status(400).json({
            success: false, 
            message: error.message
        });
    }
}

export const updateSessionController = async (req:AuthRequest, res: Response): Promise <void> =>{
    try{
        if(!req.user){
            res.status(401).json({
                success: false,
                message:'User Required'
            });
            return;
        }
        const trainerId =req.user.id;
        const sessionId = req.params.id;
        const updatedSession =await classService.updateSession(sessionId, trainerId, req.body);
        res.status(200).json({
            success: true,
            message:'Session Updated Successfully',
            data: updatedSession
        });
    }catch(error: any){
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


export const cancelSessionController = async (req: AuthRequest, res: Response) :Promise <void> =>{
    try{
        if(!req.user){
            res.status(401).json({
                success: false,
                message: "User Required"
            });
            return;
        }

        const trainerId = req.user.id;
        const sessionId = req.params.id;
        await classService.deleteSession(sessionId, trainerId);
        res.status(200).json({
            success: true,
            message:"Session Deleted Successfully"
        });

    }catch(error: any){
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


const weekdays: Record<string, number> = {
	sunday: 1,
	monday: 2,
	tuesday: 3,
	wednesday: 4,
	thursday: 5,
	friday: 6,
	saturday: 7,
};

function getQueryValue(value: unknown, name: string): string | undefined {
	if (value === undefined) return undefined;
	if (typeof value !== 'string' || !value.trim()) {
		throw new Error(`${name} must be a non-empty string`);
	}
	return value.trim();
}

function getInteger(value: unknown, name: string): number | undefined {
	const text = getQueryValue(value, name);
	if (text === undefined) return undefined;
	if (!/^\d+$/.test(text)) throw new Error(`${name} must be a non-negative integer`);
	return Number(text);
}

function getTime(value: unknown, name: string): number | undefined {
	const text = getQueryValue(value, name);
	if (text === undefined) return undefined;
	const match = /^(?:[01]\d|2[0-3]):[0-5]\d$/.exec(text);
	if (!match) throw new Error(`${name} must use HH:mm format`);
	const [hours, minutes] = text.split(':').map(Number);
	return hours * 60 + minutes;
}

export async function searchClassesController(req: Request, res: Response): Promise<void> {
	try {
		const dayName = getQueryValue(req.query.day, 'day')?.toLowerCase();
		if (dayName && !weekdays[dayName]) {
			throw new Error('day must be a weekday name, such as monday');
		}

		const filters: ClassSearchFilters = {
			title: getQueryValue(req.query.title, 'title'),
			trainer: getQueryValue(req.query.trainer, 'trainer'),
			day: dayName ? weekdays[dayName] : undefined,
			startTime: getTime(req.query.startTime, 'startTime'),
			endTime: getTime(req.query.endTime, 'endTime'),
			minSpots: getInteger(req.query.minSpots, 'minSpots'),
			maxSpots: getInteger(req.query.maxSpots, 'maxSpots'),
		};

		if (filters.startTime !== undefined && filters.endTime !== undefined && filters.startTime > filters.endTime) {
			throw new Error('startTime cannot be later than endTime');
		}
		if (filters.minSpots !== undefined && filters.maxSpots !== undefined && filters.minSpots > filters.maxSpots) {
			throw new Error('minSpots cannot be greater than maxSpots');
		}

		const classes = await classService.searchClasses(filters);
		res.status(200).json({ success: true, count: classes.length, data: classes });
	} catch (error) {
		res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid filters' });
	}
}

