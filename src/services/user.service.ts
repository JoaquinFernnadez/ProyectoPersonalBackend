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
    static async getMaxLevel(idUser: number) {
        const user = await this.getById(idUser)
        return user.maxLevel
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
     // Body es un array tal que [arg1,arg2] arg1: Indica si suma o resta puntos | arg2: Cantidad de puntos
    static async actualizarPuntos(idUser: number, body: number[]){
        const puntos = body[1]
        const user = await prisma.user.findUnique({where:{id: idUser}})
        const userPoints = user?.pokePuntos || 0
        
        if(body[0] == 1) {
            await prisma.user.update({where: {id: idUser}, data: {pokePuntos: (userPoints - puntos)}})
        }else 
            await prisma.user.update({where: {id: idUser}, data: {pokePuntos: (userPoints + puntos)}})
    


    }
    static async getPuntos(idUser: number){
        const user = await this.getById(idUser)
        return user.pokePuntos
    }
}