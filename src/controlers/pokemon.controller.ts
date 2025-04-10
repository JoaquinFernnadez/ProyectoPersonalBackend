import {Response, Request} from 'express'
import { PokemonService } from '../services/pokemon.service';


export class PokemonController{

    static async getAllPokemons(req:Request, res:Response){
      const userId = Number (req.query.id)
      const offset = Number (req.query.offset)
      const pokemons = await PokemonService.getAllPokemons( userId , offset )
      res.status(200).json (pokemons)
    }
    
    static async getPokemonDetail(req:Request, res:Response){
        const id =  Number(req.query.id)   
        const pokemon = await PokemonService.getPokemonDetail(id)
        res.status(200).json(pokemon)

    }
   
    static async getNewPokemons(req:Request, res:Response){
        const idUser = Number (req.query.id)
        const newPokemons = await PokemonService.getNewPokemons()
        await PokemonService.guardarPokemons(newPokemons,idUser)
        res.status(200).json (newPokemons)
    }

     static async  obtenerPokemonsDesbloqueados  (req: Request, res: Response) {
        const userId = Number (req.query.id)
        try {
          const pokemons = await PokemonService.obtenerPokemonsDesbloqueados(userId)
          res.json(pokemons)
        } catch (error) {
          res.status(500).json({ message: 'No se pudieron obtener los Pokémon desbloqueados.' })
        }
      }
      
      static async  guardarEquipoUsuario (req: Request, res: Response)  {
        const userId = Number (req.query.id)
        const  {pokemonIds}   = req.body 
      
        try {
          const mensaje = await PokemonService.guardarEquipoUsuario(userId, pokemonIds)
          res.json({ message: mensaje })
        } catch (error) {
          res.status(400).json({ message: 'Error al guardar el equipo de Pokémon.' })
        }
      }
      static async verEquipo  (req: Request, res: Response) {
        const  userId  = Number(req.query.id) 
        try {
          const equipo = await PokemonService.verEquipo(userId)
          res.json(equipo)
        } catch (error) {
          res.status(500).json({ message: 'No se pudo obtener el equipo de Pokémon.' })
        }
      }
      static async getTeamForLevel(req: Request, res: Response){
        const idUser = Number (req.query.id)
        try{
          const  equipo = await PokemonService.getTeamForLevel(idUser)
          res.json(equipo)
        }catch (error){
          res.status(500).json({message: "No se pudo generar el equipo"})
        }
      }
      static async getNews(req: Request, res: Response){
        try{
          const data = await PokemonService.getNoticias()
          res.json(data)
        }catch(error){
          res.status(500).json({message: "No se pudieron cargar las noticias"})
        }
      }
      


      // Solo se usa para poblar la base datos pero no tiene Utilidad en la Web
      static async poblarDB(req: Request, res: Response) {
        try{
        await PokemonService.populatePokemonDatabase()
        res.json({message: "Guardado correctamente"})
        }catch(error){
          res.status(909).json({message : "La cagaste maquinote"})
        }
      }
      
}