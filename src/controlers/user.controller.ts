import { NextFunction, Request, Response } from 'express';
import {UserService}  from "../services/user.service";

export class UserController{
    static async profile(req:Request, res:Response){
        const {email} = req.body.user.email
        const user = UserService.getByEmail(email)
        res.status(200).json({message:'Has conseguido entrar en una ruta protegida'})
    }
    static async getAll(req: Request,res: Response, next: NextFunction){
        try{
        const user = await UserService.getAll()
        res.status(200).json()
        }catch(error){
            next(error)
        }
    }
    

}