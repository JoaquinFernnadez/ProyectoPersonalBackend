import { AuthService } from "../services/auth.service";
import { Request, Response } from 'express';
import {UserService}  from "../services/user.service";
import HttpException from "../exceptions/HttpException2";

export class AuthController{
    static async  register(req:Request, res:Response){
        try{
            const userData = req.body
            const newUser = await AuthService.register(userData)
            res.status(201).json({message:'User register succesfully',newUser})
           
        }
        catch(error: HttpException | any){
            res.status(error.status).json({message:error.message})
        }
    }


    static async login(req:Request, res:Response){

 try{ 
            const userData = req.body
            // Validar el body ( opcional ) implementarlo en mi proyecto
            const token = await AuthService.login(userData.email,userData.password,userData.role)
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
            res.status(409).json({message:'Fallo al loguearse al usuario'})
        }

    }

    static async profile(req:Request, res:Response){
        const {email} = req.body.user.email
        const user = UserService.getByEmail(email)
        res.status(200).json({message:'Has conseguido entrar en una ruta protegida'})
    }
}