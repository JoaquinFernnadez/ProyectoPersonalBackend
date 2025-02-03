import { NextFunction,Request, Response } from "express";
import HttpException from "../exceptions/HttpException2";

  const ErrorMiddleware = (error:HttpException ,req:Request, res: Response, next:NextFunction): any => {
    try{
        const status = error.status || 500
        const message = error.message || 'Something went wrong'

        res.status(status).json({message})

    }catch(error){
        next(error)
    }
}
export default ErrorMiddleware