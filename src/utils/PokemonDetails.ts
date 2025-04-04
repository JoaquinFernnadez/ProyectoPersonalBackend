export default interface PokemonDetails {
    name: string
    id: number
    height: number
    weight: number
    types: string[]
    abilities: string[]
    stats: {
      stat: { name: string }
      base_stat: number
    }[]
    sprites: {
      front_default: string
  
    }
    sprite?: string
  }