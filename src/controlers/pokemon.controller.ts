import { Response, Request } from 'express'
import { PokemonService } from '../services/pokemon.service';


export class PokemonController {

  static async getAllPokemons(req: Request, res: Response) {
    const userId = Number(req.query.id)
    const offset = Number(req.query.offset)
    const pokemons = await PokemonService.getAllPokemons(userId, offset)
    res.status(200).json(pokemons)
  }

  static async getPokemonDetail(req: Request, res: Response) {
    const id = Number(req.query.id)
    const pokemon = await PokemonService.getPokemonDetail(id)
    res.status(200).json(pokemon)

  }
  static async getPlayer1Id(req: Request, res: Response) {
    try {
      const gameId = Number(req.query.id)
      const player1Id = await PokemonService.getPlayer1Id(gameId)
     
      res.status(200).json(player1Id)
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el player1Id" })
    }
  }

  static async getNewPokemons(req: Request, res: Response) {
    const idUser = Number(req.query.id)
    const newPokemons = await PokemonService.getNewPokemons()
    await PokemonService.guardarPokemons(newPokemons, idUser)
    res.status(200).json(newPokemons)
  }
  static async getGames(req: Request, res: Response) {
    try {
      const games = await PokemonService.getGames()
      res.status(200).json(games)
    } catch (error) {
      res.status(500).json(error)
    }
  }

  static async obtenerPokemonsDesbloqueados(req: Request, res: Response) {
    const userId = Number(req.query.id)
    try {
      const pokemons = await PokemonService.obtenerPokemonsDesbloqueados(userId)
      res.json(pokemons)
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener los Pokémon desbloqueados.' })
    }
  }
  static async obtenerNombrePokemonsDesbloqueados(req: Request, res: Response) {
    const userId = Number(req.query.id)
    try {
      const pokemons = await PokemonService.obtenerNombrePokemonsDesbloqueados(userId)
      res.json(pokemons)
    } catch (error) {
      res.status(500).json({ message: 'No se pudieron obtener los Pokémon desbloqueados.' })
    }
  }

  static async guardarEquipoUsuario(req: Request, res: Response) {
    const userId = Number(req.query.id)
    const { pokemonIds } = req.body

    try {
      const mensaje = await PokemonService.guardarEquipoUsuario(userId, pokemonIds)
      res.json({ message: mensaje })
    } catch (error) {
      res.status(400).json({ message: 'Error al guardar el equipo de Pokémon.' })
    }
  }
  static async verEquipo(req: Request, res: Response) {
    
    const userId = Number(req.query.id)
    try {
      const equipo = await PokemonService.verEquipo(userId)
      res.json(equipo)
    } catch (error) {
      res.status(500).json({ message: 'No se pudo obtener el equipo de Pokémon.' })
    }
  }
  static async getTeamForLevel(req: Request, res: Response) {
    const idUser = Number(req.query.id)
    try {
      const equipo = await PokemonService.getTeamForLevel(idUser)
      res.json(equipo)
    } catch (error) {
      res.status(500).json({ message: "No se pudo generar el equipo" })
    }
  }
  static async getNews(req: Request, res: Response) {
    try {
      const data = await PokemonService.getNoticias()
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: "No se pudieron cargar las noticias" })
    }
  }
  static async showGTS(req: Request, res: Response) {
    const id = Number(req.query.id) || 0
    try {
      const data = await PokemonService.showGTS(id)
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: "No se pudo cargar la GTS" })
    }
  }
  static async showOwnGts(req: Request, res: Response) {
    const id = Number(req.query.id)
    try {
      const data = await PokemonService.showOwnGts(id)
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: "No se pudo cargar la GTS" })
    }
  }


  static async newTrade(req: Request, res: Response) {
    const info = req.body
    try {
      const data = await PokemonService.newTrade(info)
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ message: "No se pudo cargar la GTS" })
    }
  }
  static async acceptTrade(req: Request, res: Response) {
    const id = Number(req.query.id)  // id del intercambio que se va a realizar 
    const { usuarioAceptaId } = req.body
    try {
      const data = await PokemonService.acceptTrade(id, usuarioAceptaId)
      res.status(200).json()
    } catch (error) {
      res.status(500).json({ message: "Error " + error })
    }
  }
  static async cancelTrade(req: Request, res: Response) {
    const id = Number(req.query.id)  // id del intercambio que se va a realizar 

    try {
      const data = await PokemonService.cancelTrade(id)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ message: "Error " + error })
    }
  }

  static async listPokeNames(req: Request, res: Response) {
    try {
      const data = await PokemonService.listPokeName()
      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ message: "No se pudo cargar la lista de PokeNames" })
    }
  }

  static async getSprite(req: Request, res: Response) {
    const name = req.query.name as string
    try {
      const sprite = await PokemonService.getSprite(name)
      res.status(200).json({ sprite })
    } catch (error) {
      res.status(500).json({ message: "No se pudo obtener el Sprite" })
    }
  }
  static async gameDetails(req: Request, res: Response) {
    try {
      const gameId = Number(req.query.id)
      const game = await PokemonService.gameDetails(gameId)
      res.status(200).json(game)
    } catch (error) {
      res.status(500).json(error)
    }
  }



  // Solo se usa para poblar la base datos pero no tiene Utilidad en la Web
  static async poblarDB(req: Request, res: Response) {
    try {
      await PokemonService.populatePokemonDatabase()
      res.json({ message: "Guardado correctamente" })
    } catch (error) {
      res.status(909).json({ message: "La cagaste maquinote" })
    }
  }

}