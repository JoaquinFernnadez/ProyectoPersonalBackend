import { Router } from "express";
import { AuthController } from "../controlers/auth.controller";
import {isAuthenticate}  from "../middlewares/auth.middleware"
import { loginValidation, registerValidation } from "../middlewares/validators.middleware";
import { ValidationMiddleware } from "../middlewares/validation.middleware";

const router = Router()

router.post('/login',loginValidation, AuthController.login )
// router.post('/logout',AuthController.logout )
router.post('/register',registerValidation ,ValidationMiddleware,AuthController.register )


export default router