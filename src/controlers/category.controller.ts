import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/category.service';


 class CategoryController{
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const Category = await CategoryService.getAll()
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const CategoryData = req.body
            const Category = await CategoryService.create(CategoryData)
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const user = await CategoryService.delete(id)
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
}
export default CategoryController