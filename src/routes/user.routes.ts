import { Router } from "express";
import { AuthController } from "../controlers/auth.controller";
import { isAuthenticate}  from "../middlewares/auth.middleware";

const router = Router()

router.get('/profile',isAuthenticate,  AuthController.profile )

export default router