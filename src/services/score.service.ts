import HttpException from "../exceptions/HttpException2";
import  {prisma} from "../dataBase/database"

const currentDate = new Date();
const thirtyDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 30));

export class ScoreService{
    static async getBestScores(){
        const score = await prisma.score.findMany({
            orderBy: {
              score: 'desc',
            },
          });
          if(!score)  throw new HttpException (404,'User not found')
          return score;
    } 
    static async getBestScoresLast30Days(){
        const score = await prisma.score.findMany({
            where: {
                createdAt: {
                  gte: thirtyDaysAgo, // Mayor o igual a hace 30 días
                },
              },
            orderBy: {
              score: 'desc',
            },
          });
          if(!score)  throw new HttpException (404,'User not found')
          return score;
    } 
    static async getScoresById(id: Number){

    }
}