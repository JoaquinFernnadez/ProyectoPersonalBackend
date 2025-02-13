import { Request, Response } from 'express';
import { ScoreService } from '../services/score.service';

export class ScoreController{


    static async getScoresById(req:Request, res:Response){
        const id = Number(req.body.score.iduserCreator)
        const scores = ScoreService.getScoresById(id)
        res.status(200).json({message:'Has entrado a tus Puntuaciones'})

    }
    static async getBestScoresLast30Days(req:Request, res:Response){
        const scores = ScoreService.getBestScoresLast30Days
        res.status(200).json ({message:'Has entrado a las mejores puntuaciones de los ultimos 30 días'})
    }
    static async getBestScores(req:Request, res:Response){
        const scores = ScoreService.getBestScores
        res.status(200).json ({message:'Has entrado a las mejores puntuaciones de la historia'})
    }
}