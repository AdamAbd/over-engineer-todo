const runtimeConfigKeyMap = {
  DATABASE_URL: 'databaseUrl',
  BETTER_AUTH_SECRET: 'betterAuthSecret',
  BETTER_AUTH_URL: 'betterAuthUrl',
} as const

type ServerConfigKey = keyof typeof runtimeConfigKeyMap

function fromRuntimeConfig(key: ServerConfigKey): string | undefined {
  try {
    const runtimeConfig = useRuntimeConfig()
    const runtimeKey = runtimeConfigKeyMap[key]
    const value = runtimeConfig[runtimeKey]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }

    return undefined
  } catch {
    return undefined
  }
}

export function getServerConfigValue(key: ServerConfigKey): string | undefined {
  const value = process.env[key]

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  return fromRuntimeConfig(key)
}

export function requireServerConfigValue(key: ServerConfigKey): string {
  const value = getServerConfigValue(key)

  if (value) {
    return value
  }

  throw new Error(
    `[config] Missing "${key}". Set it in Cloudflare Worker runtime variables, then redeploy.`
  )
}
