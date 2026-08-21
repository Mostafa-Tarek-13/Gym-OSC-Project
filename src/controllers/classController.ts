import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ClassService} from "../services/classService"

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