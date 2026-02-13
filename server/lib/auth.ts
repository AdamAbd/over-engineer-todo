import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth'
import { db } from '../database'
import * as schema from '../database/schema'
import { getServerConfigValue, requireServerConfigValue } from './server-config'

const secret = requireServerConfigValue('BETTER_AUTH_SECRET')
const baseURL = getServerConfigValue('BETTER_AUTH_URL')

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
})
