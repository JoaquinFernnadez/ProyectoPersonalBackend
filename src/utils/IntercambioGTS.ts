export default interface Intercambio {
    id :  number 
    usuarioId : number 
    userPokemonId : number 
    pokemonDeseadoId : number
    pokemonSprite: {
        sprite: string
    }
    pokemonDeseadoSprite : {
        sprite: string
    }

    estado:  EstadoIntercambio
    fechaCreacion : Date
}

enum EstadoIntercambio {
    abierto,
    intercambiado
  }