import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth'
import { db } from '../database'
import * as schema from '../database/schema'
import { hashFastPassword, verifyFastPassword } from './password-fast'

const config = useRuntimeConfig()
const useFastPasswordHash = Boolean(config.auth?.fastPasswordHash)

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: config.betterAuthUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    ...(useFastPasswordHash
      ? {
          password: {
            hash: hashFastPassword,
            verify: verifyFastPassword,
          },
        }
      : {}),
  },
})
