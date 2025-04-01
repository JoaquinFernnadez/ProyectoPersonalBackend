
import HttpException from "../exceptions/HttpException2";
import { prisma } from "../dataBase/database";
import { Quejas } from "@prisma/client";

export class ComplaintsService {

    static async getAll(idUser : number){
        const rol = await prisma.user.findUnique({
            where:{
                id: idUser,
                role: 'Admin'
            }})
        if(!rol) {
                    const userComplaints = await prisma.quejas.findMany({
                     where: {
                        userId: idUser
                    }
                })
            return userComplaints
         }
        const complaints =  await prisma.quejas.findMany()
        return complaints
    }
    static async create(complaint: Quejas){
        try {
            return await prisma.quejas.create({
                data: {
                    ...complaint
                }
            })
        }catch (error){
            throw new HttpException(401,"Error al crear la queja")
        }
    } 
}