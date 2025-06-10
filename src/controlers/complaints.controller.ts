import { NextFunction, Request, Response } from 'express';
import {ComplaintsService}  from "../services/complaints.service";

export class ComplaintsController{

    static async getAll(req:Request, res:Response){
    
        const complaint = await ComplaintsService.getAll()
        res.status(200).json(complaint) 
    }
    static async createNew(req:Request, res:Response,next: NextFunction){
        try{
            const complaint = req.body 
            if(!complaint)  res.status(400).json({error:'Hace falta la queja'}), next()
            
            const newComplaint = await ComplaintsService.create(complaint);
            res.status(201).json(newComplaint)
        }catch(error){
            res.status(401).json({error:'Error al crear la queja'})
            next(error)
        }

    }
}