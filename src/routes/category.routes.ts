
import { Router } from "express";
import { isAdmin } from "../middlewares/user.middleware";
import CategoryController from "../controlers/category.controller";


const router = Router()


router.get('/',  CategoryController.getAll )
router.post('/', isAdmin, CategoryController.create )
// Borrar oferta DELETE localhost:3000/api/offert/id
router.delete('/:id',isAdmin,  CategoryController.delete )