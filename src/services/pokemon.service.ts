import { prisma } from "../dataBase/database"
import { UserService } from "./user.service";


const BASE_POKEAPI = 'https://pokeapi.co/api/v2/pokemon';

interface ApiResponse {
  results: PokemonResponse[]
}
interface PokemonResponse {
  name: string
  id: number
  sprites: {
    front_default: string

  }
  unlocked?: boolean
}
interface PokemonDetails {
  name: string
  height: number
  weight: number
  types: string[]
  abilities: string[]
  stats: {
    stat: { name: string }
    base_stat: number
  }[]
}

let newPokemons: PokemonResponse[] = []
let maxStats:  number[] = []

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
  static async getPokemonDetail(id: number) {
    const response = await fetch(`${BASE_POKEAPI}/${id}`)
    const data = await response.json() as PokemonDetails
    const detalles = {
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map((typeInfo: any) => typeInfo.type.name),
      abilities: data.abilities.map((abilityInfo: any) => abilityInfo.ability.name),
      stats: data.stats.map((statInfo: any) => ({
        stat: statInfo.stat.name,
        base_stat: statInfo.base_stat,
      })),
    };
    return detalles

  }

  static async getNewPokemons() {
    newPokemons = []
    for (let i = 0; i < 6; i++) {
      newPokemons.push(await this.generateRandomPokemon())
    }
    return newPokemons
  }
  static async guardarPokemons(pokemons: PokemonResponse[], idUser: number) {
    for (let i = 0; i < pokemons.length; i++) {
      const search = await prisma.pokemon.findUnique({
        where: {
          id: pokemons[i].id,
          name: pokemons[i].name,
        }
      })
      if (!search) {
        await prisma.pokemon.create({
          data: {
            id: pokemons[i].id,
            name: pokemons[i].name,
            sprite: pokemons[i].sprites?.front_default,
          },
        })
      }
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
            sprite: pokemons[i].sprites?.front_default,
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
  
  static async getTeam(userId: number) {
    maxStats = []
    try {
      const team = [] as PokemonDetails[]
      let pokemon: PokemonDetails
      
      const user = await UserService.getById(userId)

      for (let i = 0; team.length <= 6; i++) {
        const pokemons = await this.generateRandomPokemon()

        pokemon = await this.getPokemonDetail(pokemons.id)

        if (await this.validarPokemons(user.level, pokemon) && !team.includes(pokemon)) {
          team.push(pokemon)
        } 
      }

      return team
    } catch (error) {
      throw new Error('Error al generar el equipo')
    }
  }
  static async validarPokemons(level: number, pokemon: PokemonDetails) {
   
    let acumulador = 0 
    let maxStat = 0
    let limitAcum = ( level * 20 ) + 280
    let minMaxStat = level * 10 
    let posicion  = 0

    for(let i = 0; i < 6;i++){
      acumulador += pokemon.stats[i].base_stat
      if(maxStat < pokemon.stats[i].base_stat){
        maxStat = pokemon.stats[i].base_stat
        posicion = i 
      }
    }
    if(level < 10 &&  acumulador < limitAcum ) return true
    if(level >= 10 && !maxStats[posicion] && maxStat > minMaxStat && acumulador < limitAcum){
      maxStats[posicion] = maxStat
      return true 
    }
    return false

  }
  static async generateRandomPokemon() {

    const random = Math.floor(Math.random() * 1025) + 1;
    const response = await fetch(`${BASE_POKEAPI}/${random}`);
    const data = await response.json() as PokemonResponse;
    return data

  }

}

