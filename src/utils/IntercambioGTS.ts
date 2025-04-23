export default interface Intercambio {
    id :  number 
    usuarioId : number 
    userPokemonId : number 
    pokemonDeseadoId : number
    estado:  EstadoIntercambio
    fechaCreacion : Date
}

enum EstadoIntercambio {
    abierto,
    intercambiado
  }