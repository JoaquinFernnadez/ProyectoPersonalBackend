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
        const body = req.body
        try {
            await UserService.updatelvl(idUser, body)
            res.status(200).json({ message: "Nivel actualizado en la base de datos" })
        } catch (error) {
            res.status(500).json(error)
        }

    }
}