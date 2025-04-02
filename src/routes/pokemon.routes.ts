import { Router } from "express";
import { PokemonController } from "../controlers/pokemon.controller";

const router = Router()

router.get('/pokedex',  PokemonController.getAllPokemons )
router.get('/getDetail',  PokemonController.getPokemonDetail )
router.get ('/packs', PokemonController.getNewPokemons )
router.get('/desbloqueados', PokemonController.obtenerPokemonsDesbloqueados);
router.post('/desbloqueados/guardarEquipo',PokemonController.guardarEquipoUsuario);
router.get('/verEquipo',  PokemonController.verEquipo )
router.get('/getTeams' , PokemonController.getTeam)

export default router