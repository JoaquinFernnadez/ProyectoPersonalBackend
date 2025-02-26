import { Router } from "express";
import { AuthController } from "../controlers/auth.controller";
import { loginValidation, registerValidation } from "../middlewares/validators.middleware";
import { ValidationMiddleware } from "../middlewares/validation.middleware";

const router = Router()

router.post('/login', loginValidation, ValidationMiddleware, AuthController.login)
router.post('/register', registerValidation, ValidationMiddleware, AuthController.register)


export default router