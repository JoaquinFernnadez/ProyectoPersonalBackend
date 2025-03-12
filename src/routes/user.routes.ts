import { Router } from "express";
import {UserController} from "../controlers/user.controller";

const router = Router()

router.get('/usuarios', UserController.getAll )

export default router