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
  export interface PokemonDetails2 {

    id?: number
    name?: string
    height?: number
    weight?: number
    sprite?: string
    types?: string[]
    abilities?: string[]
    stats:  Record<string,number> 
}
export interface Stats { 
    hp: number
    attack: number
    defense: number
    "special-attack": number
    "special-defense": number
    speed: number
}