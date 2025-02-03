import jwt from "jsonwebtoken"
import { Request, Response,NextFunction } from 'express'; 


export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token 
    const { role } = jwt.decode(token) as jwt.JwtPayload  
    try{
    if(role != 'admin') res.status(401).json({error: "Access denied"})
    next()
    }catch (error){
        next(error)
    }
    
}