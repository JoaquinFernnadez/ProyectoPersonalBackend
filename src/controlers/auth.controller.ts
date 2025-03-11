import { AuthService } from "../services/auth.service";
import { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken";

const TOKEN_PASSWORD = process.env.TOKEN_PASSWORD || 'pass'

export class AuthController{
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body
            //TODO validar el body
            const newUser = await AuthService.register(userData)
            res.status(201).json({ message: 'User register successfully', newUser })
        } catch (error) {
            next(error)
        }

    }
    static async login(req:Request, res:Response){

        try{ 
            const userData = req.body
            // Validar el body ( opcional ) implementarlo en mi proyecto
            const token = await AuthService.login(userData.email,userData.password)
            // inyectar una cookie al cliente en lugar del token
            res.cookie('token',token,{
                maxAge: 60 * 60 * 1000, // 1 hora de duracion
                httpOnly: true, // no se puede acceder mediate js
                secure: false,  // solo se envia por https
                sameSite: 'strict', // Evita ataque CSRF
            })
            res.status(201).json({message:'Login succesfully',token})
            
        }
        catch(error){
            res.status(409).json({message: error})
        }

    }

    static async getAuthenticatedUser (req: Request, res: Response, next: NextFunction){
        try {
            const token = req.cookies.token;
            if (!token)  res.status(401).json({ message: "No autenticado" });
            const decoded = jwt.verify(token, TOKEN_PASSWORD);
            res.status(200).json(decoded)
        } catch (error) {
            next(error)
        }
    };
}