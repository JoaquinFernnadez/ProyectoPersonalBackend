import { prisma } from "../dataBase/database"


const BASE_POKEAPI = 'https://pokeapi.co/api/v2/pokemon/';
let PokemonsNames: string[] = [];

interface ApiResponse {
  results: PokemonResponse[]
}
interface PokemonResponse {
  name: string
  url: string
}
interface PokemonDetails {
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: { stat: { name: string }; base_stat: number }[];
}

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

  static async getNewPokemons(id: number) {
    let newPokemons: PokemonResponse[] = []
    for (let i = 0; i < 6; i++) {
      const random = Math.floor(Math.random() * 1025) + 1;
      const response = await fetch(`${BASE_POKEAPI}/${random}`);
      const data = await response.json() as PokemonResponse;
      const search = await prisma.userPokemon.findMany({
        where: {
          userId: 1,
          pokemonName: data.name,
          unlocked: true
        }
      })
      if (!search) {
        await prisma.userPokemon.create({
          data: {
            userId: id,
            pokemonName: data.name,
            unlocked: true, // Marcamos el Pokémon como desbloqueado
          },
        })
      }
      newPokemons.push(data)
    }
    return newPokemons
  }

  static async obtenerPokemonsDesbloqueados(userId: number) {
    try {
      const pokemonesDesbloqueados = await prisma.userPokemon.findMany({
        where: {
          userId: userId,
          unlocked: true,
        },
        include: {
          pokemon: true,
        },
      });

      return pokemonesDesbloqueados.map((userPokemon) => userPokemon.pokemon);
    } catch (error) {
      throw new Error('Error al obtener los Pokémon desbloqueados.');
    }
  };

  static async guardarEquipoUsuario(userId: number, pokemonNames: string[]) {
    if (pokemonNames.length > 6) {
      throw new Error('No puedes seleccionar más de 6 Pokémon.');
    }

    try {
      await prisma.userPokemon.updateMany({
        where: {
          userId: userId,
          isTeam: true,
        },
        data: {
          isTeam: false,
        },
      })


      await prisma.userPokemon.updateMany({
        where: {
          userId: userId,
          pokemonName: { in: PokemonsNames },
        },
        data: {
          isTeam: true,
        },
      })

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
  static async guardarPoekmonsNuevos(userId: number, pokemons: string[]){ // Guardar los pokes ya al crear el sobre mejor
    
      const savedPokemons: string[] = [];
    
      for (const pokemonName of pokemons) {
        let pokemon = await prisma.pokemon.findUnique({ where: { name: pokemonName } })
    
        // Si el Pokémon no está en la BD, obtenerlo de la PokeAPI y guardarlo
        if (!pokemon) {
          const apiPokemon = await PokemonService.fetchPokemonFromAPI(pokemonName)
          if (!apiPokemon) return
    
          pokemon = await prisma.pokemon.create({
            data: {
              name: apiPokemon.name,
              sprite: apiPokemon.sprite,
            },
          })
        }
    
        // Verificar si el usuario ya tiene este Pokémon desbloqueado
        const existingUserPokemon = await prisma.userPokemon.findFirst({
          where: { userId, pokemonId: pokemon.id },
        })
    
        if (!existingUserPokemon) {
          await prisma.userPokemon.create({
            data: {
              userId,
              pokemonId: pokemon.id,
              unlocked: true,
            },
          })
          savedPokemons.push(pokemonName)
        }
      }
    
      return savedPokemons
    }
     static async  fetchPokemonFromAPI (pokemonName: string)  {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        
        if (!response.ok) {
          console.error(`Error al obtener ${pokemonName} de la PokeAPI`);
          return null
        }
    
        const data = await response.json();
        return {
          name: data.name,
          sprite: data.sprites.front_default,
        }
      } catch (error) {
        console.error(`Error en fetch de la PokeAPI para ${pokemonName}:`, error)
        return null
      }
    }

    
 
  }

