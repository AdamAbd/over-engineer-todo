import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { requireServerConfigValue } from '../lib/server-config'
import * as schema from './schema'

const databaseUrl = requireServerConfigValue('DATABASE_URL')

const client = neon(databaseUrl)

export const db = drizzle({ client, schema })
