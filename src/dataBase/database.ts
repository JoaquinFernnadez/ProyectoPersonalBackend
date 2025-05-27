import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import dotenv from "dotenv"
dotenv.config()

export const libsql = createClient({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
  syncUrl: 'file:./dev.db'
})

export const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({adapter})
export default  prisma