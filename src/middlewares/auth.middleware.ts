import jwt from "jsonwebtoken"
import { Request, Response,NextFunction } from 'express'; 

const Token_password = process.env.TOKEN_PASSWORD || 'pass'

export const isAuthenticate = (req:Request, res: Response, next:NextFunction): any => {

    const token = req.cookies.token
    
    if(!token) return res.status(401).json({error : 'Access denied'})

    try{
        const decodifyToken = jwt.verify(token, Token_password)
        req.body.user = decodifyToken
        next()
    }catch(error){
        next(error)
    }
    
}
