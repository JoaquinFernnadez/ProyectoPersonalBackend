import { PrismaClient, Category } from "@prisma/client";
import HttpException from "../exceptions/HttpException2"

const prisma = new PrismaClient()

export class CategoryService {
    static async getAll() {
        const category = await prisma.category.findMany()
        return category
    }
    static async create(body: Category) {
        const category = await prisma.category.create({
            data: {
                ...body
            }
        })
        return category
    }
    static async delete(id: number) {
        const category = await prisma.category.delete({ where: { id } })
        if (!category) throw new HttpException(404, 'Category not found')
        return "Category deleted"
    }
}