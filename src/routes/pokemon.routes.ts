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
router.get('/getSprite', PokemonController.getSprite)

router.get('/gts',PokemonController.showGTS)
router.get('/gts/own', PokemonController.showOwnGts)
router.post('/gts/crear', PokemonController.newTrade)
router.post('/gts/aceptar', PokemonController.acceptTrade)
router.get('/gts/cancelar', PokemonController.cancelTrade)
router.get('/listPokeNames', PokemonController.listPokeNames)
router.get('/listMyNames', PokemonController.obtenerNombrePokemonsDesbloqueados)
router.get('/games', PokemonController.getGames)

router.get('/gameDetails', PokemonController.gameDetails)
router.get('/player1Id', PokemonController.getPlayer1Id)

export default router