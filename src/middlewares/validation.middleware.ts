
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const ValidationMiddleware = (req:Request, res: Response, next:NextFunction): any => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        // next(throw new HttpException (400, {errors: errors.array()}))
        return res.status(400).json({errors: errors.array()})
    }
    next()
}