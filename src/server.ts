import app from './app'
import ErrorMiddleware from './middlewares/error.middlewares'
import { Server } from 'socket.io'
import http from 'http'
import { Prisma } from '@prisma/client'
import { PokemonService } from './services/pokemon.service'
import prisma from "../src/dataBase/database"


export interface TurnData {
    gameId: number
    playerId: number
    turn: number  // 1 : 2
    choice: number // id del pokemon 
    roundNumber: number
    selectedStat: number // id de la stat 
}
interface joinedGameData {
    gameId: number
    password: string
    player2Id: number
}

const TOTAL_ROUNDS = 3;


const PORT = process.env.PORT || 3000


// Crear el servidor HTTP
const server = http.createServer(app)

// Middleware de error (esto siempre antes del listen)
app.use(ErrorMiddleware)

// Crear el servidor WebSocket sobre el mismo server HTTP
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://proyectopersonalfronted.onrender.com'],
        methods: ['GET', 'POST']
    }
})

// Manejo de conexiones WebSocket
io.on('connect', (socket) => {
    console.log(`Jugador ${socket.id} conectado`)

    socket.onAny((event, ...args) => {
        console.log(`📥 Evento recibido: ${event}`, args)
    })

    socket.on('create-game', async (password: string, userId: number) => {
        console.log("llego todo bien al backend", password, userId)
        try {

            const game = await prisma.game.create({
                data: {
                    password: password,
                    player1Id: userId,
                }
            })
            await prisma.round.createMany({
                data: [
                    {
                        gameId: game.id,
                        roundNumber: 1,
                        player1Choice: { pokeId: 0, stat: 0 },
                        player2Choice: { pokeId: 0, stat: 0 },
                        winner: null,
                    },
                    {
                        gameId: game.id,
                        roundNumber: 2,
                        player1Choice: { pokeId: 0, stat: 0 },
                        player2Choice: { pokeId: 0, stat: 0 },
                        winner: null,
                    },
                    {
                        gameId: game.id,
                        roundNumber: 3,
                        player1Choice: { pokeId: 0, stat: 0 },
                        player2Choice: { pokeId: 0, stat: 0 },
                        winner: null,
                    }
                ]
            })

            socket.join(game.id.toString())
            console.log(`Jugador ${socket.id} se unió al juego ${game.id}`)
        } catch (error) {
            console.error('Error al crear la partida', error)
            socket.emit('error', 'No se pudo crear la partida')
        }
    })

    socket.on('join-game', async (gameId: number, player2Id: number, password?: string) => {
        console.log("llego todo bien ", gameId, player2Id, password)
        try {
            const game = await prisma.game.findUnique({ where: { id: gameId, password } })
            if (!game) {
                socket.emit('error', 'La sala no existe o la contraseña no es correcta')
                return
            }
            await prisma.game.update({
                where: { id: game?.id, password },
                data: {
                    player2Id,
                    status: "playing"
                }
            })
            socket.join(gameId.toString())
            io.to(gameId.toString()).emit("join-game", {
                ready: true,
                gameId: game.id,
                players: {
                    player1Id: game.player1Id,
                    player2Id
                }
            })
            console.log(`Jugador ${socket.id} se unió al juego ${gameId}`)
        } catch (error) {
            console.error('Error al unir jugador:', error)
            socket.emit('error', 'No se pudo unir al juego')
        }
    })
    socket.on('game-update', async (turnData: TurnData) => {
        console.log('turnData : ' , turnData)

        try {
            // Actualizar la base de datos con la elección del jugador
            const gameUpdated = await prisma.game.update({
                where: {
                    id: turnData.gameId,
                },
                data: {
                    currentTurn: turnData.turn === 1 ? 2 : 1, // Alternamos el turno
                },
                include: {
                    rounds: true
                }
            })
            const dataToUpdate: Prisma.RoundUpdateInput = {
                ...(turnData.turn === 1
                    ? {
                        player1Choice: {
                            pokeId: turnData.choice,
                            stat: await PokemonService.IdToStat(turnData.choice, turnData.selectedStat)
                        },
                        selectedStat: turnData.selectedStat
                    }
                    : {
                        player2Choice: {
                            pokeId: turnData.choice,
                            stat: await PokemonService.IdToStat(turnData.choice, turnData.selectedStat)
                        }
                    })
            }
            if (turnData.turn === 2) dataToUpdate.winner = await PokemonService.calculateRoundWinner(turnData)

            const round = await prisma.round.update({
                where: {
                    gameId_roundNumber: {
                        gameId: turnData.gameId,
                        roundNumber: turnData.roundNumber
                    }

                },
                data: dataToUpdate
            })

            // Emitir evento de actualización del juego a ambos jugadores
            console.log("Recibido el turno y enviandolo")
            io.emit('game-update', {
                message: `Jugador ${turnData.turn} ha seleccionado`,
                gameUpdated,
                round
            })
            if (turnData.roundNumber === 2 && turnData.turn === 2) {
                const winner = await PokemonService.calculateGameWinner(gameUpdated.rounds, gameUpdated)
                if (winner[0] === "player1" || winner[0] === "player2") {
                    const finishedGame = await prisma.game.update({
                        where: { id: turnData.gameId },
                        data: {
                            status: 'finished',
                            winner: winner[0]
                        }
                    })
                    await prisma.user.update({
                        where: {
                            id: winner[1] as number
                        }, data: {
                            wins: {
                                increment: 1
                            }
                        }
                    })
                    io.to(turnData.gameId.toString()).emit('game-ended', {
                        message: 'El juego ha terminado antes de la 3ª ronda',
                        finalGameState: finishedGame
                    })

                    return
                }
            }
            if (turnData.roundNumber === TOTAL_ROUNDS && turnData.playerId === gameUpdated.player2Id) {

                const winner = await PokemonService.calculateGameWinner(gameUpdated.rounds, gameUpdated)
                console.log("WINNER HERE PLEASE LOOK ", winner)
                await prisma.user.update({
                    where: {
                        id: winner[1] as number
                    }, data: {
                        wins: {
                            increment: 1
                        }
                    }
                })

                const finishedGame = await prisma.game.update({
                    where: { id: turnData.gameId },
                    data: {
                        status: 'finished',
                        winner: winner[0] as string
                    }
                })

                io.to(turnData.gameId.toString()).emit('game-ended', {
                    message: 'El juego ha terminado',
                    finalGameState: finishedGame
                })
            }
        } catch (error) {
            socket.emit('error', error)
            console.log('ERROR :', error)
        }
    })
    socket.on('leave-game', async (gameId: number, userId: number) => {
        try {
            const game = await prisma.game.findUnique({ where: { id: gameId } })
            await prisma.game.update({
                where: {
                    id: gameId
                },
                data: {
                    winner: (game?.player1Id == userId) ? "player2" : "player1"
                }
            })
            socket.leave(gameId.toString())
            console.log(`Jugador ${socket.id} ha salido de la sala ${gameId}`)

            const socketsInRoom = await io.in(gameId.toString()).fetchSockets()

            if (socketsInRoom.length === 0) {
                console.log(`Cerrando sala ${gameId} `)

            }


            io.to(gameId.toString()).emit('player-left', {
                message: `Un jugador ha salido del juego.`,
                playerId: userId
            })

        } catch (error) {
            console.error('Error al salir del juego:', error)
            socket.emit('game-error', 'No se pudo salir correctamente')
        }
    })
    socket.on('stat-selected', (stat: string, index: number) => {
        console.log(stat, index)
        
        io.emit('stat-selected',
            stat,
            index
        )
    })
})

// Levantar el servidor
server.listen(PORT, () => {
    console.log('Servidor encendido en el puerto:' + PORT)
})