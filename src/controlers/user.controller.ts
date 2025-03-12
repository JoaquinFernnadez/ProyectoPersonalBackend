import {  Request, Response } from 'express';
import {UserService}  from "../services/user.service";

export class UserController{

    static async getAll(req:Request, res:Response){
        const idUser = Number (req.query.id)
        const users =  await UserService.getAll(idUser)  
        res.status(200).json(users) 
    }
}