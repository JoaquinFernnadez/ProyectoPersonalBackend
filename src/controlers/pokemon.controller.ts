import {Response, Request} from 'express'
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '@prisma/client';


export class PokemonController{

    static async getAllPokemons(req:Request, res:Response){
        const pokemons = PokemonService.getAllPokemons()
        res.status(200).json ({message:'Has entrado a las mejores puntuaciones de los ultimos 30 días'})
    }
    
    static async getPokemonDetail(req:Request, res:Response){
        const id =  Number(req.params.id)   
        const pokemon = PokemonService.getPokemonDetail(id)
        res.status(200).json({message:'Has entrado a tus Puntuaciones'})

    }
   
    static async getNewPokemons(req:Request, res:Response){
        const  idUser = req.body.user.id
        const newPokemons = PokemonService.getNewPokemons(idUser)
        res.status(200).json ({message:'Has entrado a las mejores puntuaciones de la historia'})
    }

     static async  obtenerPokemonsDesbloqueados  (req: Request, res: Response) {
        const  userId  = req.body.user.id
        try {
          const pokemones = await PokemonService.obtenerPokemonsDesbloqueados(parseInt(userId))
          res.json(pokemones)
        } catch (error) {
          res.status(500).json({ message: 'No se pudieron obtener los Pokémon desbloqueados.' })
        }
      }
      
      static async  guardarEquipoUsuario (req: Request, res: Response)  {
        const  userId  = req.body.user?.id 
        const  {pokemonNames}   = req.body 
      
        try {
          const mensaje = await PokemonService.guardarEquipoUsuario(userId, pokemonNames)
          res.json({ message: mensaje })
        } catch (error) {
          res.status(400).json({ message: 'Error al guardar el equipo de Pokémon.' })
        }
      }
      static async verEquipo  (req: Request, res: Response) {
        const  userId  = Number(req.params.id)
        try {
          const equipo = await PokemonService.verEquipo(userId)
          res.json(equipo)
        } catch (error) {
          res.status(500).json({ message: 'No se pudo obtener el equipo de Pokémon.' })
        }
      }
       static async guardarPoekmonsNuevos(req: Request, res: Response)  {
        try {
          const { pokemons } = req.body;
          const userId = req.body.user.id; // ID del usuario autenticado
      
          if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });
          if (!pokemons || !Array.isArray(pokemons) || pokemons.length === 0) {
            return res.status(400).json({ error: "Lista de Pokémon no válida" });
          }
      
          // Llamamos al servicio para guardar los Pokémon
          const savedPokemons = await PokemonService.guardarPoekmonsNuevos(userId, pokemons);
      
          return res.json({ message: "Pokémon guardados con éxito", savedPokemons });
        } catch (error) {
          console.error("Error en saveUserPokemons:", error);
          return res.status(500).json({ error: "Error interno del servidor" });
        }
      };
}