import { prisma } from "../dataBase/database"
import { UserService } from "./user.service";
import PokemonDetails from "../utils/PokemonDetails"
import PokemonDetailsBase, { PokemonDetails2 } from "../utils/PokemonDatabase"
import ApiResponse from "../utils/ApiResponse"
import SalidaDatabase from "../utils/SalidasDtabase"
import Intercambio from "../utils/IntercambioGTS";
import { Game, Round } from "@prisma/client";
import { TurnData } from "@/sockets/GameSocketHandler";
import { Stats } from "../utils/PokemonDatabase";

const BASE_POKEAPI = 'https://pokeapi.co/api/v2/pokemon';
const API_NEWS_KEY = process.env.API_KEY

interface NewsResponse {
  status: string
  totalResults: number
  articles: []
}
interface roun{
  id: number 
  gameId: number
  player1Choice?: {
    pokeId: number
    stat: number
  }
  player2Choice?: {
    pokeId: number
    stat: number
  }
  winner?: String
  selectedStat?: number
  createdAt: Date
}


let newPokemons: SalidaDatabase[] = []
let maxStats: number[] = []
const pokemonCache = new Map();
const teamSet = new Set()
let generatedPokemonNames = new Set();

export class PokemonService {

  static async getAllPokemons(userId: number, offset: number) {
    let limit = 20
    if (offset == 1020) limit = 5;
    const response = await fetch(BASE_POKEAPI + `?limit=${limit}&offset=${offset}`)
    const data = await response.json() as ApiResponse
    const pokemons = data.results
    // pokemons = name + url
    const unlocked = await PokemonService.obtenerPokemonsDesbloqueados(userId)
    for (const pokemon of unlocked) {
      for (const a of pokemons) {
        if (pokemon.pokemon?.name == a.name) {
          a.unlocked = true
        }
      }
    }
    return pokemons

  }
  static async gameDetails(gameId: number){
    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      }
    })
  }


  static async getNewPokemons() {
    newPokemons = []
    for (let i = 0; i < 6; i++) {
      let pokemon = await this.getRandomPokemon()
      if (pokemon) newPokemons.push(pokemon)

    }
    return newPokemons
  }
  static async guardarPokemons(pokemons: SalidaDatabase[], idUser: number) {
    for (let i = 0; i < pokemons.length; i++) {
      const search2 = await prisma.userPokemon.findUnique({
        where: {
          id: pokemons[i].id,
        }
      })
      if (!search2) {
        await prisma.userPokemon.create({
          data: {
            id: pokemons[i].id,
            userId: idUser,
            pokemonName: pokemons[i].name,
            unlocked: true,
            isTeam: false,
            sprite: pokemons[i].sprite,
          },
        })
      }

    }
  }

  static async obtenerPokemonsDesbloqueados(userId: number) {
    try {
      const pokemonsDesbloqueados = await prisma.userPokemon.findMany({
        where: {
          userId: userId,
        },
        include: {
          pokemon: true,
        },
      })
      return pokemonsDesbloqueados
    } catch (error) {
      throw Error('Error al obtener los Pokémon desbloqueados.');
    }
  }

  static async guardarEquipoUsuario(userId: number, pokemonIds: number[]) {
    if (pokemonIds.length > 6) {
      throw new Error('No puedes seleccionar más de 6 Pokémon.');
    }
    const equipo = await prisma.userPokemon.findMany({
      where: {
        userId: userId,
        isTeam: true,
      },
      include: {
        pokemon: true,
      },
    })
    for (const pokemon of equipo) {
      await prisma.userPokemon.update({
        where: {
          id: pokemon.id,
          userId: userId
        }, data: {
          isTeam: false

        }
      });
    }

    try {
      for (const pokemonId of pokemonIds) {
        const pokemon = await prisma.userPokemon.update({
          where: {
            id: Number(pokemonId),
            userId: userId
          }, data: {
            isTeam: true
          }
        });
        if (!pokemon) {
          throw new Error(`El Pokémon no existe.`);
        }
      }

      return 'Equipo guardado correctamente';
    } catch (error) {
      throw new Error('Error al guardar el equipo.');
    }
  }

  static async verEquipo(userId: number) {
    try {
      const equipo = await prisma.userPokemon.findMany({
        where: {
          userId: userId,
          isTeam: true,
        },
        include: {
          pokemon: true,
        },
      })
      return equipo
    } catch (error) {
      throw new Error('Error al obtener el equipo.')
    }
  }
  static async getPokemonDetail(id: number) {

    if (pokemonCache.has(id)) {
      return pokemonCache.get(id);
    }
    const response = await fetch(`${BASE_POKEAPI}/${id}`)
    const data = await response.json() as PokemonDetails
    const detalles = {
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map((typeInfo: any) => typeInfo.type.name),
      sprite: data.sprites.front_default,
      abilities: data.abilities.map((abilityInfo: any) => abilityInfo.ability.name),
      stats: data.stats.map((statInfo: any) => ({
        stat: statInfo.stat.name,
        base_stat: statInfo.base_stat,
      })),
    };

    pokemonCache.set(id, detalles)
    return detalles

  }

  static async getTeamForLevel(userId: number) {
    const team = [] as PokemonDetails[]
    try {


      const user = await UserService.getById(userId)

      while (team.length < 6) {

        const pokemonsPromises = Array.from({ length: 10 }).map(() => this.getRandomPokemon());
        const pokemons = await Promise.all(pokemonsPromises);

        for (const pokemonsData of pokemons) {
          if (!pokemonsData) return
          if (!generatedPokemonNames.has(pokemonsData.name)) {
            const pokemon = await this.getPokemonDetail(pokemonsData.id) as PokemonDetails
            generatedPokemonNames.add(pokemonsData.name)

            if (await this.validarPokemons(user.level, pokemon) && !teamSet.has(pokemon.name) && team.length < 6) {
              team.push(pokemon)
              teamSet.add(pokemon.name)
            }
          }
        }
      }
      maxStats = []
      teamSet.clear()
      generatedPokemonNames.clear()

      return team
    } catch (error) {
      throw new Error('Error al generar el equipo')
    }
  }
  static async validarPokemons(level: number, pokemon: PokemonDetails) {

    const acumulador = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const maxStat = Math.max(...pokemon.stats.map(stat => stat.base_stat));
    const posicionMaxStat = pokemon.stats.findIndex(stat => stat.base_stat === maxStat);

    let limitAcum = (level * 20) + 280
    let minMaxStat = level * 10

    if (level < 10 && acumulador < limitAcum) return true

    if (level >= 10 && !maxStats[posicionMaxStat] && maxStat > minMaxStat) {
      maxStats[posicionMaxStat] = maxStat
      return true
    }
    return false

  }


  static async getRandomPokemon() {
    const random = Math.floor(Math.random() * 1025) + 1;
    const pokemon = prisma.pokemon.findUnique({
      where: { id: random }
    })
    return pokemon
  }

  static async getNoticias() {
    const url = "https://newsapi.org/v2/everything"

    // const formattedDate = format(new Date(), 'yyyy-MM-dd');

    const params = new URLSearchParams({
      q: 'Pokemon',
      pageSize: '21',
      /* from: `${formattedDate}`,   
      sortBy: 'popularity',  */
      apiKey: `${API_NEWS_KEY}`
    })

    try {
      const response = await fetch(`${url}?${params}`)
      if (!response.ok) throw new Error('Error en la solicitud')
      const data = await response.json() as NewsResponse

      return data.articles
    } catch (error) {
      console.error('Error' + error)
    }

  }
  static async showGTS(id: number) {

    try {
      const data = await prisma.intercambioGTS.findMany({
        where: { estado: "abierto" },
        include: {
          pokemonDeseado: true,
          pokemonOfrecido: true
        }
      })
      const filtrado = data.filter(item => item.usuarioId !== id);

      return filtrado
    } catch (error) {
      console.log('Erorr' + error)
    }
  }
  static async showOwnGts(id: number) {

    try {
      const data = await prisma.intercambioGTS.findMany({
        where: { estado: "abierto", usuarioId: id },
        include: {
          pokemonDeseado: true,
          pokemonOfrecido: true
        }
      })
      return data
    } catch (error) {
      console.log('Erorr' + error)
    }
  }

  static async newTrade(data: Intercambio) {

    try {
      const pokemon = await prisma.userPokemon.findUnique({
        where: {
          userId: data.usuarioId,
          id: data.userPokemonId
        }
      })

      if (!pokemon) return console.log("Necesitas tener el pokemon que ofreces")

      // Elimino el pokemon para evitar que el usuario pueda proponer varios intercambios con el mismo pokemon

      await prisma.userPokemon.delete({
        where: {
          id: pokemon.id,
          userId: pokemon.userId
        }
      })

      const nuevo = await prisma.intercambioGTS.create({
        data: {
          usuarioId: data.usuarioId,
          userPokemonId: pokemon.id,
          pokemonDeseadoId: data.pokemonDeseadoId,
          pokemonSprite: data.pokemonSprite.sprite,
          pokemonDeseadoSprite: data.pokemonDeseadoSprite.sprite
        },

      })

    } catch (error) {
      console.log("Error " + error)
    }
  }

  static async acceptTrade(id: number, usuarioAceptaId: number) {
    try {
      const trade = await prisma.intercambioGTS.update({
        where: { id: id },
        data: { estado: "intercambiado" }
      })

      // Primero: Elimino el pokemon de quien acepto el intercambio

      await prisma.userPokemon.delete({
        where: {
          id: trade.pokemonDeseadoId,
          userId: usuarioAceptaId
        },
      })

      // Segundo: Elimino el pokemon del usuario que propuso el intercambio 



      const pokemonOfrecido = await prisma.pokemon.findUnique({ where: { id: trade.userPokemonId } })
      const pokemonDeseado = await prisma.pokemon.findUnique({ where: { id: trade.pokemonDeseadoId } })

      // Guardo el pokemon si no existe
      // Pokemon para quien acepto el intercambio
      const pokemon1 = await prisma.userPokemon.findUnique({ where: { userId: usuarioAceptaId, id: trade.userPokemonId } })
      if (!pokemon1) {
        await prisma.userPokemon.create({
          data: {
            id: trade.userPokemonId,
            user: {
              connect: { id: usuarioAceptaId }
            },
            pokemon: {
              connect: { name: pokemonOfrecido?.name }
            },
            unlocked: true,
            isTeam: false,
            sprite: pokemonOfrecido?.sprite
          },
          include: {
            user: true,
            pokemon: true
          }
        })
      }

      // Guardo el pokemon si no existe
      // Pokemon para quien propuso el intercambio

      const pokemon2 = await prisma.userPokemon.findUnique({ where: { userId: trade.usuarioId, id: trade.pokemonDeseadoId } })
      if (!pokemon2) {
        await prisma.userPokemon.create({
          data: {
            id: trade.pokemonDeseadoId,
            user: {
              connect: { id: trade.usuarioId }
            },
            pokemon: {
              connect: { name: pokemonDeseado?.name }
            },
            unlocked: true,
            isTeam: false,
            sprite: pokemonDeseado?.sprite
          }
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  static async cancelTrade(id: any) {

    try {
      const trade = await prisma.intercambioGTS.delete({
        where: { id: id }
      })
      await this.recuperarPokemon(trade.userPokemonId, trade.usuarioId)

    } catch (error) {
      console.log(error)
    }
  }

  static async recuperarPokemon(idPokemon: number, idUser: number) {
    const pokemon = await prisma.pokemon.findUnique({
      where: { id: idPokemon }
    })
    const comprobar = await prisma.userPokemon.findUnique({
      where: {
        id: idPokemon,
        userId: idUser
      }
    })
    if (comprobar) return
    else {
      await prisma.userPokemon.create({
        data: {
          id: pokemon?.id || 1,
          userId: idUser,
          pokemonName: pokemon?.name || "",
          sprite: pokemon?.sprite,
          unlocked: true

        },
        include: {
          pokemon: true,
          user: true,

        }
      })
    }
  }

  static async listPokeName() {
    const PokemonNames = []
    const pokemon = await prisma.pokemon.findMany()
    for (let i = 0; i < 1025; i++) {
      PokemonNames[i] = pokemon[i].name
    }
    return PokemonNames
  }

  static async getSprite(name: string) {
    try {
      const pokemon = await prisma.pokemon.findUnique({
        where: {
          name
        }
      })
      return pokemon?.sprite
    } catch (error) {
      console.log(error)
    }
  }
  static async calculateGameWinner(rounds: Round[], gameUpdated: Game){
    const score = { p1: 0, p2: 0 }
    rounds.forEach(r => {
      if (r.winner === 'player1') score.p1++
      if (r.winner === 'player2') score.p2++
    })
    const winner =
      score.p1 > score.p2
        ? ["player1", gameUpdated.player1Id]
        : score.p2 < score.p1 
        ? ["player2", gameUpdated.player2Id]
        : ["1", 0]
        
    return winner
  }
  static async calculateRoundWinner(turnData: TurnData) {
    let winner
    const round = await prisma.round.findUnique({
      where: {
        gameId_roundNumber: {
          gameId: turnData.gameId,
          roundNumber: turnData.roundNumber
        }
      }, include: {
        game: true
      }
    }) as unknown as roun   
    const pokemon1 = await prisma.pokemon.findUnique({
      where: {
        id: round?.player1Choice?.pokeId || 0
      }, select: {
        id: true,
        name: true,
        stats: true
      }
    })
    const pokemon2 = await prisma.pokemon.findUnique({
      where: {
        id: round?.player2Choice?.pokeId || 0

      }
    })

    winner = this.setWinner(pokemon1 as unknown as PokemonDetails2, pokemon2 as unknown as PokemonDetails2, turnData.selectedStat)

    return winner
  }
  
  static async getUserValue(estadisticas: Stats, statIndex: number) {
    const stats =  PokemonService.getArrayFromStats(estadisticas)

    return stats[statIndex]
  }
  static  getArrayFromStats(stats: Stats) {
    const userStats = []

    userStats[0] = stats.hp
    userStats[1] = stats.attack
    userStats[2] = stats.defense
    userStats[3] = stats["special-attack"]
    userStats[4] = stats["special-defense"]
    userStats[5] = stats.speed

    return userStats
  }
  static async setWinner(pokemon1: PokemonDetails2, pokemon2: PokemonDetails2, selectedStat: number) {
    let winner
    const stats1 = pokemon1?.stats as unknown as Stats
    const player1Value = await this.getUserValue(stats1, selectedStat)
    const stats2 = pokemon2?.stats as unknown as Stats
    const player2Value = await this.getUserValue(stats2, selectedStat)
    player1Value > player2Value
      ? winner = "player1"
      : player2Value > player1Value
        ? winner = "player2"
        : winner = this.tieBreaker(pokemon1, pokemon2)
    return winner
  }
  static async tieBreaker(pokemon1: PokemonDetails2, pokemon2: PokemonDetails2) {
    let winner
    this.getTBS(pokemon1) > this.getTBS(pokemon2) ? winner = "player1" : winner = "player2"
    return winner
  }
  static getTBS(pokemon: PokemonDetails2) {
    const TBS = pokemon.stats.attack + pokemon.stats.defense + pokemon.stats.hp + pokemon.stats["special-attack"] + pokemon.stats["special-defense"] + pokemon.stats.speed
    return TBS
  }
  static async IdToStat(pokemonId: number, statIndex: number){
    const pokemon =  await prisma.pokemon.findUnique({where: {id: pokemonId}})
    const stats =  this.getArrayFromStats(pokemon?.stats as unknown as Stats)
    return stats[statIndex]
  }




  // Solo se usa para poblar la base de datos pero no tiene utilidad en la web 
  static async populatePokemonDatabase() {
    const inicio = 498
    try {
      for (let i = inicio; i <= 1025; i++) {
        const response = await fetch(`${BASE_POKEAPI}/${i}`);
        const data = await response.json() as PokemonDetailsBase


        const stats = {} as Record<string, number>
        data.stats.forEach(stat => {
          stats[stat.stat.name] = stat.base_stat;
        })


        const types = {} as Record<string, string>
        data.types.forEach((type, index) => {
          types[`${index + 1}`] = type.type.name
        })


        const abilities = {} as Record<string, string>
        data.abilities.forEach((abilitiy, index) => {
          abilities[`${index + 1}`] = abilitiy.ability.name
        })


        await prisma.pokemon.create({
          data: {
            id: data.id,
            name: data.name,
            sprite: data.sprites.front_default,
            stats: stats,
            types: types,
            abilities: abilities
          }
        })

      }

      console.log("Base de datos poblada exitosamente.");
    } catch (error) {
      console.error("Error al poblar la base de datos:", error);
    }
  }
  // solo se usa para limpiar registros de una tabla, esn este caso la de pokemons
  static async limpiarPokemonTable() {
    const tope = 87
    for (let i = 1; i <= tope; i++) {
      await prisma.pokemon.delete({
        where: { id: i }
      })
    }
  }

}

