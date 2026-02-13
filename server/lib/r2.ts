import { createHash, createHmac, randomUUID } from 'crypto'
import { createError } from 'h3'

type RuntimeR2Config = {
  accessKeyId?: string
  secretAccessKey?: string
  endpoint?: string
  bucketName?: string
  publicUrl?: string
  region?: string
}

type BunS3File = {
  write: (data: Blob, options?: { type?: string }) => Promise<unknown>
}

type BunS3Client = {
  file: (key: string) => BunS3File
}

type BunGlobal = {
  S3Client: new (options: {
    accessKeyId: string
    secretAccessKey: string
    endpoint: string
    bucket: string
  }) => BunS3Client
}

type UploadFileLike = Pick<File, 'name' | 'type'>

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

const getR2Config = () => {
  const runtimeConfig = useRuntimeConfig()
  const r2 = runtimeConfig.r2 as RuntimeR2Config | undefined

  if (!r2?.accessKeyId || !r2?.secretAccessKey || !r2?.endpoint || !r2?.bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi R2 belum lengkap.',
    })
  }

  return r2
}

type R2AuthConfig = Required<
  Pick<RuntimeR2Config, 'accessKeyId' | 'secretAccessKey' | 'endpoint' | 'bucketName'>
> &
  Pick<RuntimeR2Config, 'region'>

const createS3Client = (
  S3ClientCtor: new (options: {
    accessKeyId: string
    secretAccessKey: string
    endpoint: string
    bucket: string
  }) => BunS3Client,
  r2: R2AuthConfig
) =>
  new S3ClientCtor({
    accessKeyId: r2.accessKeyId,
    secretAccessKey: r2.secretAccessKey,
    endpoint: r2.endpoint,
    bucket: r2.bucketName,
  })

const getBunS3Client = async (
  r2: R2AuthConfig
) => {
  const bun = (globalThis as typeof globalThis & { Bun?: BunGlobal }).Bun
  if (bun?.S3Client) {
    return createS3Client(bun.S3Client, r2)
  }

  return null
}

const encodeObjectKey = (key: string) => key.split('/').map(encodeURIComponent).join('/')

const hashHex = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const hmac = (key: Buffer | string, value: string) => createHmac('sha256', key).update(value).digest()

const toAmzDate = (date: Date) => date.toISOString().replace(/[:-]|\.\d{3}/g, '')
const toDateStamp = (date: Date) => toAmzDate(date).slice(0, 8)

const buildCanonicalQueryString = (url: URL) =>
  [...url.searchParams.entries()]
    .sort(([aKey, aValue], [bKey, bValue]) => {
      if (aKey === bKey) {
        return aValue.localeCompare(bValue)
      }

      return aKey.localeCompare(bKey)
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

const buildUploadObjectUrl = (key: string, r2: RuntimeR2Config) => {
  if (!r2.endpoint || !r2.bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi endpoint R2 belum lengkap.',
    })
  }

  const encodedKey = encodeObjectKey(key)
  const url = new URL(r2.endpoint.replace(/\/+$/, ''))
  const normalizedPath = url.pathname.replace(/^\/+|\/+$/g, '')
  const hasBucketInHost = url.hostname.startsWith(`${r2.bucketName}.`)
  const hasBucketInPath = normalizedPath === r2.bucketName
  const basePath = url.pathname.replace(/\/+$/, '')

  if (hasBucketInHost || hasBucketInPath) {
    url.pathname = `${basePath}/${encodedKey}`
    return url
  }

  url.pathname = `${basePath}/${encodeURIComponent(r2.bucketName)}/${encodedKey}`
  return url
}

const putObjectUsingSignedFetch = async (
  r2: R2AuthConfig,
  objectKey: string,
  file: File
) => {
  const url = buildUploadObjectUrl(objectKey, r2)
  const payloadBuffer = Buffer.from(await file.arrayBuffer())
  const payloadHash = hashHex(payloadBuffer)
  const date = new Date()
  const amzDate = toAmzDate(date)
  const dateStamp = toDateStamp(date)
  const region = r2.region || 'auto'
  const service = 's3'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`

  const requestHeaders: Record<string, string> = {
    'content-type': file.type || 'application/octet-stream',
    host: url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  }

  const sortedHeaderEntries = Object.entries(requestHeaders).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  const canonicalHeaders = sortedHeaderEntries.map(([key, value]) => `${key}:${value}\n`).join('')
  const signedHeaders = sortedHeaderEntries.map(([key]) => key).join(';')

  const canonicalRequest = [
    'PUT',
    url.pathname,
    buildCanonicalQueryString(url),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join('\n')

  const kDate = hmac(`AWS4${r2.secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'aws4_request')
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${r2.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ')

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...requestHeaders,
      authorization,
    },
    body: payloadBuffer,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: `Upload ke R2 gagal (${response.status} ${response.statusText}). ${errorBody.slice(0, 300)}`,
    })
  }
}

const createPresignedPutObjectUrl = (
  r2: R2AuthConfig,
  objectKey: string,
  contentType: string,
  expiresInSeconds: number
) => {
  const url = buildUploadObjectUrl(objectKey, r2)
  const date = new Date()
  const amzDate = toAmzDate(date)
  const dateStamp = toDateStamp(date)
  const region = r2.region || 'auto'
  const service = 's3'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const signedHeaders = 'content-type;host'
  const canonicalHeaders = `content-type:${contentType}\nhost:${url.host}\n`

  url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256')
  url.searchParams.set('X-Amz-Credential', `${r2.accessKeyId}/${credentialScope}`)
  url.searchParams.set('X-Amz-Date', amzDate)
  url.searchParams.set('X-Amz-Expires', String(expiresInSeconds))
  url.searchParams.set('X-Amz-SignedHeaders', signedHeaders)

  const canonicalRequest = [
    'PUT',
    url.pathname,
    buildCanonicalQueryString(url),
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join('\n')

  const kDate = hmac(`AWS4${r2.secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'aws4_request')
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

  url.searchParams.set('X-Amz-Signature', signature)

  return {
    uploadUrl: url.toString(),
    expiresAt: new Date(date.getTime() + expiresInSeconds * 1000).toISOString(),
    method: 'PUT' as const,
    headers: {
      'Content-Type': contentType,
    },
  }
}

const buildPublicObjectUrl = (key: string, r2: RuntimeR2Config) => {
  const encodedKey = encodeObjectKey(key)

  if (r2.publicUrl) {
    return `${r2.publicUrl.replace(/\/+$/, '')}/${encodedKey}`
  }

  if (!r2.endpoint || !r2.bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi URL publik R2 belum lengkap.',
    })
  }

  const endpoint = r2.endpoint.replace(/\/+$/, '')
  const url = new URL(endpoint)
  const normalizedPath = url.pathname.replace(/^\/+|\/+$/g, '')
  const hasBucketInHost = url.hostname.startsWith(`${r2.bucketName}.`)
  const hasBucketInPath = normalizedPath === r2.bucketName

  if (hasBucketInHost || hasBucketInPath) {
    return `${endpoint}/${encodedKey}`
  }

  return `${endpoint}/${encodeURIComponent(r2.bucketName)}/${encodedKey}`
}

const resolveFileExtension = (file: UploadFileLike) => {
  const byMimeType = MIME_EXTENSION_MAP[file.type]
  if (byMimeType) return byMimeType

  const byName = file.name.split('.').pop()?.toLowerCase()
  if (byName && byName.length <= 5) return byName

  return 'bin'
}

const buildTodoPhotoObjectKey = (userId: string, file: UploadFileLike) => {
  const extension = resolveFileExtension(file)
  return `todos/${userId}/${Date.now()}-${randomUUID()}.${extension}`
}

export const createTodoPhotoPresignedUpload = async (
  userId: string,
  options: {
    fileName: string
    fileType: string
    expiresInSeconds: number
  }
) => {
  const r2 = getR2Config()
  const objectKey = buildTodoPhotoObjectKey(userId, {
    name: options.fileName,
    type: options.fileType,
  })
  const authConfig = {
    accessKeyId: r2.accessKeyId!,
    secretAccessKey: r2.secretAccessKey!,
    endpoint: r2.endpoint!,
    bucketName: r2.bucketName!,
    region: r2.region,
  }
  const presigned = createPresignedPutObjectUrl(
    authConfig,
    objectKey,
    options.fileType,
    options.expiresInSeconds
  )

  return {
    objectKey,
    photoUrl: buildPublicObjectUrl(objectKey, r2),
    ...presigned,
  }
}

export const uploadTodoPhotoToR2 = async (userId: string, file: File) => {
  const r2 = getR2Config()
  const objectKey = buildTodoPhotoObjectKey(userId, file)
  const authConfig = {
    accessKeyId: r2.accessKeyId!,
    secretAccessKey: r2.secretAccessKey!,
    endpoint: r2.endpoint!,
    bucketName: r2.bucketName!,
    region: r2.region,
  }

  const client = await getBunS3Client(authConfig)

  if (client) {
    const objectFile = client.file(objectKey)
    await objectFile.write(file, {
      type: file.type || 'application/octet-stream',
    })
  } else {
    await putObjectUsingSignedFetch(authConfig, objectKey, file)
  }

  return {
    objectKey,
    photoUrl: buildPublicObjectUrl(objectKey, r2),
  }
}
