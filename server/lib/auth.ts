import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth'
import { db } from '../database'
import * as schema from '../database/schema'

const secret = process.env.BETTER_AUTH_SECRET

if (!secret) {
  throw new Error('BETTER_AUTH_SECRET is missing')
}

export const auth = betterAuth({
  secret,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
})
