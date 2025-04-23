import { Router } from "express";
import { PokemonController } from "../controlers/pokemon.controller";

const router = Router()

router.get('/pokedex',  PokemonController.getAllPokemons )
router.get('/getDetail',  PokemonController.getPokemonDetail )
router.get ('/packs', PokemonController.getNewPokemons )
router.get('/desbloqueados', PokemonController.obtenerPokemonsDesbloqueados)
router.post('/desbloqueados/guardarEquipo',PokemonController.guardarEquipoUsuario)
router.get('/verEquipo',  PokemonController.verEquipo )
router.get('/getTeams' , PokemonController.getTeamForLevel)
router.get('/poblarDB' , PokemonController.poblarDB)
router.get('/news',PokemonController.getNews )

router.get('/gts',PokemonController.showGTS)
router.post('/gts/crear', PokemonController.newTrade)
router.post('/gts/aceptar', PokemonController.acceptTrade)
router.post('/gts/cancelar', PokemonController.cancelTrade) 


export default router