import { prisma } from "../dataBase/database"


const BASE_POKEAPI = 'https://pokeapi.co/api/v2/pokemon/';
let PokemonsNames: string[] = [];

interface ApiResponse {
  results: PokemonResponse[]
}
interface PokemonResponse {
  name: string
  sprites: {
    front_default: string
  }
}
interface PokemonDetails {
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: { stat: { name: string }; base_stat: number }[];
}

let newPokemons: PokemonResponse[] = []
let allpokemons : PokemonResponse[] = []

export class PokemonService {

  static async getAllPokemons() {
    const response = await fetch(BASE_POKEAPI)
    const data = await response.json() as ApiResponse
    const pokemons = data.results
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

  static async getNewPokemons(idUser : number) {
    allpokemons = []
    newPokemons = []
    for (let i = 0; i < 6; i++) {
      
      const random = Math.floor(Math.random() * 1025) + 1;
      const response = await fetch(`${BASE_POKEAPI}/${random}`);
      const data = await response.json() as PokemonResponse;
      const search = await prisma.pokemon.findUnique({
        where: {
          id: random,
          name: data.name,
        }
      })
      if (!search) {
        await prisma.pokemon.create({
          data: {
            id: random,
            name: data.name,
            sprite: data.sprites?.front_default, 
          },
        })
      }
      const search2 = await prisma.userPokemon.findUnique({
        where: {
          id: random,
        }
      })
      if (!search2) {
        await prisma.userPokemon.create({
          data: {
            id: random,
            userId: idUser,
            pokemonName: data.name,
            unlocked: true,
            isTeam: false,
            sprite: data.sprites?.front_default,
          },
        })
      }
      newPokemons.push(data)
      if(!allpokemons.includes(data)) {
        allpokemons.push(data)
      }
  
    }
    return newPokemons
  }

  static async obtenerPokemonsDesbloqueados(userId: number) {
    try {
      const pokemonesDesbloqueados = await prisma.userPokemon.findMany({
        where: {
          userId: userId,
        },
        include: {
          pokemon: true,
        },
      })
      return pokemonesDesbloqueados
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
    for(const pokemon of equipo) {
      await prisma.userPokemon.update({
        where: {
          id: pokemon.id,
          userId: userId
        },data: {
          isTeam : false
        }
      });
    }

    try {
      for (const pokemonId of pokemonIds) {
        const pokemon = await prisma.userPokemon.update({
          where: {
            id: Number(pokemonId),
            userId: userId
          },data: {
            isTeam : true
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
  
  }

