import { Router } from "express";
import { ComplaintsController } from "../controlers/complaints.controller";
import {isAuthenticate} from "../middlewares/auth.middleware";

const router = Router()

router.get('/list', isAuthenticate, ComplaintsController.getAll )
router.post('/create', ComplaintsController.createNew )

export default router


