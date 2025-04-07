import HttpException from "../exceptions/HttpException2";
import { prisma } from "../dataBase/database";

export class UserService {

    static async getByEmail(email: string) {
        const findUser = await prisma.user.findUnique({
            where: { email },
            omit: { password: true }
        })
        if (!findUser) throw new HttpException(404, 'User not found')
        return findUser
    }
    static async getAll(idUser: number) {
        const rol = await prisma.user.findUnique({ where: { id: idUser, role: 'Admin' } })
        if (!rol) throw new HttpException(401, 'Unauthorized')
        const Users = await prisma.user.findMany({omit:{password: true}})
        return Users
    }
    static async getById(id: number) {
        const findUser = await prisma.user.findUnique({
            where: { id },
            omit: { password: true }
        })
        if (!findUser) throw new HttpException(404, 'User not found')
        return findUser
    }
    static async getLevel(idUser: number) {
        const user = await this.getById(idUser)
        return user.level
    }
    static async updatelvl(idUser: number, level: number) {
        console.log(level)
        await prisma.user.update({
            where: { id: idUser },
            data: {
                level
            }
        })
    
        this.updateMaxLvl(idUser, level)
    }
    static async updateMaxLvl(idUser: number, body: number) {

        const user = await this.getById(idUser)
        if (body > user?.maxLevel) {
            await prisma.user.update({
                where: { id: idUser },
                data: {
                    maxLevel: body
                }
            })
        }
        return  
    }

    static async getBestScores() {
        const topPlayers = await prisma.user.findMany({
            orderBy: {
                maxLevel : "desc"
            },
            take : 100,
            omit :{
                password: true,
                role: true,
                email: true,
                level: true
            }
        })
        return topPlayers
    }
}