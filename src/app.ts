import express, { Response, Request } from "express"
import authRouter from "./routes/auth.routes"
import userRouter from "./routes/user.routes"
import pokemonRouter from "./routes/pokemon.routes"
import complaintsRouter from "./routes/complaints.routes"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'https://proyectopersonalfronted.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
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

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/pokemon', pokemonRouter)
app.use('/api/complaints', complaintsRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Bienvenido al backend (api rest)');
})

export default app
