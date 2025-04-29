import { Server, Socket } from 'socket.io'
import { PrismaClient, Round } from '@prisma/client'
import { PokemonService } from '@/services/pokemon.service'

export interface TurnData {
  gameId: number
  playerId: number
  turn: number
  choice: number
  roundNumber: number
  selectedStat: number
}

const TOTAL_ROUNDS = 3;

export default function gameSocketHandler(socket: Socket, prisma: PrismaClient, io: Server) {
  socket.on('create-room', async (password: string, userId: number) => {
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
            player1Choice: null,
            player2Choice: null,
            winner: null,
          },
          {
            gameId: game.id,
            roundNumber: 2,
            player1Choice: null,
            player2Choice: null,
            winner: null,
          },
          {
            gameId: game.id,
            roundNumber: 3,
            player1Choice: null,
            player2Choice: null,
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

  socket.on('join-game', async (gameId: number, password: string, player2Id: number) => {
    try {
      const game = await prisma.game.findUnique({ where: { id: gameId, password } })
      if (!game) {
        socket.emit('error', 'La sala no existe o la contraseña no es correcta')
        return
      }
      await prisma.game.update({
        where: { id: game?.id },
        data: {
          player2Id,
          status: "playing"
        }
      })
      socket.join(gameId.toString())
      console.log(`Jugador ${socket.id} se unió al juego ${gameId}`)
    } catch (error) {
      console.error('Error al unir jugador:', error)
      socket.emit('error', 'No se pudo unir al juego')
    }
  })
  socket.on('turn-selected', async (turnData: TurnData) => {
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
      const dataToUpdate: Partial<Round> = {
        ...(turnData.turn === 1 ? { player1Choice: turnData.choice } : { player2Choice: turnData.choice }),
        selectedStat: turnData.selectedStat,
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
      io.to(turnData.gameId.toString()).emit('game-update', {
        message: `Jugador ${turnData.turn} ha seleccionado`,
        gameUpdated,
        round
      })
      if (turnData.roundNumber === 2 && turnData.turn === 2) {
        const winner = await PokemonService.calculateGameWinner(gameUpdated.rounds, gameUpdated)
        if (winner === 1 || winner === 2) {
          const finishedGame = await prisma.game.update({
            where: { id: turnData.gameId },
            data: {
              status: 'finished',
              winner
            }
          })
          await prisma.user.update({
            where: {
              id: winner
            },data: {
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
      if (turnData.roundNumber === TOTAL_ROUNDS) {
        // Lógica para decidir el ganador, si la tienes (ejemplo simple):
        const winner = await PokemonService.calculateGameWinner(gameUpdated.rounds, gameUpdated)

          await prisma.user.update({
            where: {
              id: winner
            },data: {
              wins: {
                increment: 1
              }
            }
          })
        
        const finishedGame = await prisma.game.update({
          where: { id: turnData.gameId },
          data: {
            status: 'finished',
            winner
          }
        })

        io.to(turnData.gameId.toString()).emit('game-ended', {
          message: 'El juego ha terminado',
          finalGameState: finishedGame
        })
      }
    } catch (error) {
      socket.emit('error', error)
    }
  })
  socket.on('leave-game', async (gameId: number, userId: number) => {
    try {
      socket.leave(gameId.toString())
      console.log(`Jugador ${socket.id} ha salido de la sala ${gameId}`)
      
      const socketsInRoom = await io.in(gameId.toString()).fetchSockets()

      if (socketsInRoom.length === 0) {
        console.log(`Cerrando sala ${gameId} por inactividad`)
        
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
}
