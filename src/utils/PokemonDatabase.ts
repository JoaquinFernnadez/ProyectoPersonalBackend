export default interface PokemonDetailsBase {
    name: string
    id: number
    height: number
    weight: number
    types: {
      type: {
        name: string
      }
    }[]
    abilities: {
      ability: {
        name: string
      }
    }[]
    stats: {
      stat: { name: string }
      base_stat: number
    }[]
    sprites: {
      front_default: string
  
    }
  }