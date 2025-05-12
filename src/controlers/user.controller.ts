import { Request, Response } from 'express';
import { UserService } from "../services/user.service";

export class UserController {

    static async getAll(req: Request, res: Response) {
        const idUser = Number(req.query.id)
        const users = await UserService.getAll(idUser)
        res.status(200).json(users)
    }
    static async getLevel(req: Request, res: Response) {
        const idUser = Number(req.query.id)
        const lvl = await UserService.getLevel(idUser)
        res.status(200).json(lvl)
    }
    static async updatelvl(req: Request, res: Response) {
        const idUser = Number(req.query.id)
        const body = req.body.level
        
        try {
            await UserService.updatelvl(idUser, body)
            res.status(200).json({ message: "Nivel actualizado en la base de datos" })
        } catch (error) {
            res.status(500).json(error)
        }

    }
    
    static async getBestScores(req: Request, res: Response){
        try{
            const topScores = await UserService.getBestScores()
            res.status(200).json(topScores)

        }catch(error){
            res.status(500).json(error)
        }
    }
    static async actualizarPuntos(req: Request, res: Response){
        try{
            const userId = Number(req.query.id)
            const body = req.body.array
            
            await UserService.actualizarPuntos(userId,body)
            res.status(200).json({message: "Se actualizaron los puntos del Usuario"})
        }catch(error){
            res.status(500).json(error)
        }
    }
    static async getPuntos(req: Request, res: Response){
        const idUser = Number (req.query.id)
        const puntos = await UserService.getPuntos(idUser)
        res.status(200).json(puntos)
    }
    static async getMaxLevel(req: Request, res: Response) {
        const idUser = Number(req.query.id)
        const lvl = await UserService.getMaxLevel(idUser)
        res.status(200).json(lvl)
    }
    static async getWins(req: Request, res: Response) {
        const idUser = Number(req.query.id)
        const wins = await UserService.getWins(idUser)
        res.status(200).json(wins)
    }
}