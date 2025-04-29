import app from './app'
import ErrorMiddleware from './middlewares/error.middlewares'
import { Server } from 'socket.io'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import gameSocketHandler from "sockets/GameSocketHandler"


const PORT = process.env.PORT || 3000
const prisma = new PrismaClient()

// Crear el servidor HTTP
const server = http.createServer(app)

// Middleware de error (esto siempre antes del listen)
app.use(ErrorMiddleware)

// Crear el servidor WebSocket sobre el mismo server HTTP
const io = new Server(server)

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
    console.log(`Jugador ${socket.id} conectado`)

    gameSocketHandler(socket, prisma, io)
})

// Levantar el servidor
server.listen(PORT, () => {
    console.log('Servidor encendido en el puerto:' + PORT)
})