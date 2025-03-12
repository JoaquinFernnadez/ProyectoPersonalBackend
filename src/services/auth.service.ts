import {  User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import HttpException from "../exceptions/HttpException2"
import  {prisma} from "dataBase/database"


const Token_password = process.env.TOKEN_PASSWORD || 'pass'

export class AuthService{
    static async register(user:User){
        console.log(user)
        
        const findUser = await prisma.user.findUnique({where:{email: user.email
            }})

        if(findUser) throw new HttpException(409 , `User ${user.email} alredy exists`)

        // Encriptar el password
        const passwordEncrypted = await bcrypt.hash(user.password, 10) 
        // user.password = ''
        //Guardar el usuario en la bd
        return await prisma.user.create({
                data:{
                    ...user,
                    password: passwordEncrypted,
                    role: "user"
                },
                omit:{
                    password: true
                }
        })

    }
    
    static async login(email: string, password: string){

        /*const query = `SELECT * FROM user WHERE email= '${email}'`

        const findUsers = await prisma.$queryRawUnsafe(query) as User[]
        const findUser = findUsers[0]*/

        const findUser = await prisma.user.findUnique({where:{email}})
        if(!findUser) throw new HttpException(401,"Invalid user or password")

        const isPaswordCorrect =  await bcrypt.compare(password,findUser.password)
        if(!isPaswordCorrect) throw new HttpException(401,"Invalid user or password")

        const token = jwt.sign({id:findUser.id, email:findUser.email},
            Token_password,
            {expiresIn:"1h"})
        return token 

    }

}
