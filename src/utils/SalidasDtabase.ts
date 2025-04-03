import { JsonValue } from "@prisma/client/runtime/library"

export default interface SalidaDatabase {
    name: string
    id: number
    types: JsonValue
    abilities: JsonValue
    stats: JsonValue
    sprite: string
}