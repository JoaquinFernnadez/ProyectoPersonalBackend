import { NextFunction, Request, Response } from 'express';
import { OfferService } from '../services/offer.service';

class OfferController {
    static async getById(req: Request, res: Response) {
        const id = Number(req.params.id)
        const offer = await OfferService.getById(id)
        res.status(200).json(offer)
    }
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const offer = await OfferService.getAll()
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const offerData = req.body
            const offer = await OfferService.create(offerData)
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const user = await OfferService.delete(id)
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id)
            const offer = await OfferService.update(id)
            res.status(200).json(offer)
        } catch (error) {
            next(error)
        }
    }
    static async rate(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.cookies.token.id
            const rate = req.body.rate
            const id = Number(req.params.id)
            const offer = await OfferService.rate(id, rate, user)
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }
    static async getRate(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)
        try {
            const user = await OfferService.getRate(id)
            res.status(200).json()
        } catch (error) {
            next(error)
        }
    }


}

export default OfferController