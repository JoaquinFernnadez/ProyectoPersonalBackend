import { Router } from "express";
import { isAuthenticate}  from "../middlewares/auth.middleware";
import { PokemonController } from "../controlers/pokemon.controller";

const router = Router()

router.get('/api/pokemon',isAuthenticate,  PokemonController.getAllPokemons )
router.get('/api/pokemon/getDetail',isAuthenticate,  PokemonController.getPokemonDetail )
router.get ('/api/pokemon/getNewPokemons', isAuthenticate,PokemonController.getNewPokemons )
router.get('/api/pokemon/desbloqueados',isAuthenticate, PokemonController.obtenerPokemonsDesbloqueados);
router.post('/api/pokemon/desbloqueados/guardarEquipo', isAuthenticate,PokemonController.guardarEquipoUsuario);
router.get('/api/pokemon/verequipo',isAuthenticate,  PokemonController.verEquipo )
router.post('/api/pokemon/guardarEquipo',isAuthenticate, PokemonController.guardarEquipoUsuario)

export default router