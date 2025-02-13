import { Router } from "express";
import { isAuthenticate}  from "../middlewares/auth.middleware";
import { ScoreController } from "../controlers/score.controller";

const router = Router()

router.get('/getBestScores',isAuthenticate,  ScoreController.getBestScores )
router.get('/getBestScoresLast30Days',isAuthenticate,  ScoreController.getBestScoresLast30Days )
router.get('/getScoresById',isAuthenticate,  ScoreController.getScoresById )

export default router