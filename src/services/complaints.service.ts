
import HttpException from "../exceptions/HttpException2";
import  prisma  from "../dataBase/database";
import { Quejas } from "@prisma/client";

export class ComplaintsService {

    static async getAll(){
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
    static async delete(id: number){
        const complaint = await prisma.quejas.delete({where: {id}})
        return complaint
    }
}