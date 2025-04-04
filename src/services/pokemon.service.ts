import { prisma } from "../dataBase/database"
import { UserService } from "./user.service";
import PokemonDetails from "../utils/PokemonDetails"
import PokemonDetailsBase from "../utils/PokemonDatabase"
import ApiResponse from "../utils/ApiResponse"
import SalidaDatabase from "../utils/SalidasDtabase"

const BASE_POKEAPI = 'https://pokeapi.co/api/v2/pokemon';


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

  // Solo se usa para poblar la base de datos pero no tiene utilidad en la web 
  static async populatePokemonDatabase() {
    try {
      for (let i = 1; i <= 1025; i++) {
        const response = await fetch(`${BASE_POKEAPI}/${i}`);
        const data = await response.json() as PokemonDetailsBase

        
        const stats = {} as Record<string, number>
        data.stats.forEach(stat => {
          stats[stat.stat.name] = stat.base_stat;
        });

        
        const types = {} as Record<string, string>
        data.types.forEach((type, index) => {
          types[`${index + 1}`] = type.type.name
        });

        
        const abilities = {} as Record<string, string>
        data.abilities.forEach((abilitiy, index) => {
          abilities[`${index + 1}`] = abilitiy.ability.name;
        });

        // Guardar el Pokémon en la base de datos usando Prisma
        await prisma.pokemon.create({
          data: {
            id: data.id,
            name: data.name,
            sprite: data.sprites.front_default,
            stats: stats,
            types: types,
            abilities: abilities
          }
        });

      }

      console.log("Base de datos poblada exitosamente.");
    } catch (error) {
      console.error("Error al poblar la base de datos:", error);
    }
  }
  // solo se usa para limpiar registros de una tabla, esn este caso la de pokemons
  static async limpiarPokemonTable() {
    const tope = 10
    for (let i = 1; i <= tope; i++) {
      await prisma.pokemon.delete({
        where: { id: i }
      })
    }
  }

}

