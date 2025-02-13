import { Router } from "express";
import { AuthController } from "../controlers/auth.controller";
import { isAuthenticate}  from "../middlewares/auth.middleware";
import { UserController } from "../controlers/user.controller";
import {isAdmin} from "../middlewares/user.middleware";

const router = Router()

router.get('/profile',isAuthenticate,  AuthController.profile )
router.get('/getAll', isAdmin,UserController.getAll)

export default router