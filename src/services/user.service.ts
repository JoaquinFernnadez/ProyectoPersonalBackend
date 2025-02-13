import HttpException from "../exceptions/HttpException2";
import  {prisma} from "dataBase/database"

export class UserService {

    static async getByEmail(email:string){
        const findUser =  await prisma.user.findUnique({ 
            where: {email},
            omit: {password: true}})
        if(!findUser)  throw new HttpException (404,'User not found')
        return findUser
    }
    static async getAll(){
        const Users =  await prisma.user.findMany()
        return Users
    }
}