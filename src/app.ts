import express, {Response, Request} from "express"
import authRouter from "./routes/auth.routes"
import userRouter from "./routes/user.routes"
import OffertRouter from "./routes/offer.routes"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()
// Limitar cors en un futuro 
// cambiar la url al deployar

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}))

app.use(express.json())
app.use(helmet())
app.use(compression())
app.use(cookieParser())

const limiter = rateLimit({
    max: 100,
    windowMs: 1000 * 15 * 60
})
app.use(limiter)


app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/offert',OffertRouter)

app.get('/', (req:Request, res:Response) => {
    res.send('Bienvenido al backend')
})

export default app 
