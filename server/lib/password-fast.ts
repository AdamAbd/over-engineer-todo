type VerifyPasswordInput = {
  hash: string
  password: string
}

const FAST_HASH_PREFIX = 'v1'
const SALT_BYTES = 16
const encoder = new TextEncoder()

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')

const hexToBytes = (hex: string) => {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    return null
  }

  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }

  return bytes
}

const timingSafeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) {
    return false
  }

  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index]! ^ right[index]!
  }

  return diff === 0
}

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return new Uint8Array(digest)
}

const normalizePassword = (password: string) => password.normalize('NFKC')

const getPepper = () => {
  const config = useRuntimeConfig()
  return String(config.betterAuthSecret || '')
}

export const hashFastPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const saltHex = bytesToHex(salt)
  const pepper = getPepper()
  const digest = await sha256(`${saltHex}:${normalizePassword(password)}:${pepper}`)

  return `${FAST_HASH_PREFIX}:${saltHex}:${bytesToHex(digest)}`
}

export const verifyFastPassword = async ({ hash, password }: VerifyPasswordInput) => {
  const [prefix, saltHex, digestHex] = hash.split(':')
  if (prefix !== FAST_HASH_PREFIX || !saltHex || !digestHex) {
    return false
  }

  const expectedDigest = hexToBytes(digestHex)
  if (!expectedDigest) {
    return false
  }

  const pepper = getPepper()
  const computedDigest = await sha256(`${saltHex}:${normalizePassword(password)}:${pepper}`)

  return timingSafeEqual(computedDigest, expectedDigest)
}
