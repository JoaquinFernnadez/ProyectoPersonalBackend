import HttpException from "../exceptions/HttpException2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export class UserService {

    static async getByEmail(email:string){
        const findUser =  await prisma.user.findUnique({ 
            where: {email},
            omit: {password: true}})
        if(!findUser)  throw new HttpException (404,'User not found')
        return findUser
    }

    static async getById(id:number){
        const findUser =  await prisma.user.findUnique({ where: {id}})
        if(!findUser)  throw new HttpException (404, 'User not found')
        return findUser
    }
    static async getAll(){
        const users = await prisma.user.findMany()
        return users
    }
}