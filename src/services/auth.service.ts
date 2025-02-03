import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import HttpException from "../exceptions/HttpException2"

const prisma = new PrismaClient()
const Token_password = process.env.TOKEN_PASSWORD || 'pass'

export class AuthService{
    static async register(user:User){
        // Ver si el usuario existe 
        // Sentencia sql normal :'select * from users where email = user.email'
        const findUser = await prisma.user.findUnique({where:{email: user.email
            }})

        if(findUser) throw new HttpException(409 , `User ${user.email} alredy exists`)

        // Encriptar el password
        const passwordEncrypted = await bcrypt.hash(user.password, 10) 
        user.password = ''
        //Guardar el usuario en la bd
        return await prisma.user.create({
                data:{
                    ...user,
                    password: passwordEncrypted,
                    role: null
                },
                omit:{
                    password: true
                }
        })

    }
    
    static async login(email: string, password: string, role: string){

        /*const query = `SELECT * FROM user WHERE email= '${email}'`

        const findUsers = await prisma.$queryRawUnsafe(query) as User[]
        const findUser = findUsers[0]*/

        const findUser = await prisma.user.findUnique({where:{email}})
        if(!findUser) throw new HttpException(401,"Invalid user or password")

        const isPaswordCorrect =  await bcrypt.compare(password,findUser.password)
        if(!isPaswordCorrect) throw new HttpException(401,"Invalid user or password")

        const token = jwt.sign({colorFavorito: "azul",id:findUser.id, email:findUser.email},
            Token_password,
            {expiresIn:"1h"})
        return token 

    }

}