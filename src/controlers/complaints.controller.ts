import { NextFunction, Request, Response } from 'express';
import {ComplaintsService}  from "../services/complaints.service";

export class ComplaintsController{

    static async getAll(req:Request, res:Response){
        const idUser = Number (req.query.id)
        const complaint = await ComplaintsService.getAll(idUser)
        res.status(200).json(complaint) 
    }
    static async createNew(req:Request, res:Response){
        try{
            const complaint = req.body 
            if(!complaint)  res.status(400).json({error:'Hace falta la queja'})
            
            const newComplaint = await ComplaintsService.create(complaint);
            res.status(201).json(newComplaint)
        }catch(error){
            res.status(401).json({error:'Error al crear la queja'})
        }

    }
}