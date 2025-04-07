import { Router } from "express";
import {UserController} from "../controlers/user.controller";

const router = Router()

router.get('/usuarios', UserController.getAll )
router.get('/level', UserController.getLevel)
router.put('/actualizarlvl', UserController.updatelvl)
router.get('/bestScores',UserController.getBestScores)

export default router