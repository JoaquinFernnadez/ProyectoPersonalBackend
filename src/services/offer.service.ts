
import HttpException from "../exceptions/HttpException2";
import { Offer, PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient()

export class OfferService {

    static async getById(id: number) {
        const findUser = await prisma.user.findUnique({ where: { id } })
        if (!findUser) throw new HttpException(404, 'User not found')
        return findUser
    }
    static async getAll() {
        const offers = await prisma.offer.findMany()
        return offers
    }
    static async create(body: Offer) {
        const offers = await prisma.offer.create({
            data: {
                ...body
            }
        })
        return offers
    }
    static async delete(id: number) {
        const offer = await prisma.offer.delete({ where: { id } })
        if (!offer) throw new HttpException(404, 'Offer not found')
        return "offert deleted"
    }
    static async update(id: number) {
        const findOffer = await prisma.offer.findUnique({ where: { id } })
        if(!findOffer) throw new HttpException(404, 'Offer not found')
        return await prisma.offer.update({
        where:{id},
        data:{
            ...findOffer
        }})
    }
    static async rate(idOffer: number, rate: number, user: User) {
        const findOffert = await prisma.offer.findUnique({ where: { id: idOffer } })
        if (!findOffert) throw new HttpException(404, 'Offert not found')
        return await prisma.rate.create({
            data: {
                value: rate,
                idOffer: idOffer,
                idUser: user.id
            }
        })
    }

    static async getRate(idOffer: number) {
        const findOffert = await prisma.offer.findUnique({ where: { id: idOffer } })
        if (!findOffert) throw new HttpException(404, 'Offert not found')
        const rate = await prisma.rate.findMany({ where: { idOffer } })
        const sum = rate.reduce((acc, curr) => acc + curr.value, 0)
        return sum / rate.length
    }


}