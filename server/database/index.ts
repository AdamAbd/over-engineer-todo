import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const config = useRuntimeConfig()

const client = neon(config.databaseUrl)

export const db = drizzle({ client, schema })
