import { createError, readBody } from 'h3'
import { createR2PresignedUpload } from '#server/lib/r2'
import { auth } from '#server/lib/auth'

const MAX_PRESIGN_EXPIRES_SECONDS = 60 * 60 * 24 * 7

type RuntimeUploadConfig = {
  imageMaxSizeBytes?: number
  imagePresignExpiresInSeconds?: number
  allowedImageMimeTypes?: string
}

type PresignRequestBody = {
  fileName?: string
  fileType?: string
  fileSize?: number
  category?: string
}

const parseAllowedMimeTypes = (mimeTypes: string | undefined) =>
  new Set(
    (mimeTypes ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  )

const normalizeFileName = (fileName: string) => fileName.trim().replace(/\s+/g, ' ')

const clampExpires = (expiresInSeconds: number) =>
  Math.min(Math.max(Math.floor(expiresInSeconds), 1), MAX_PRESIGN_EXPIRES_SECONDS)

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody<PresignRequestBody>(event)
  const fileName = typeof body?.fileName === 'string' ? normalizeFileName(body.fileName) : ''
  const fileType = typeof body?.fileType === 'string' ? body.fileType.trim().toLowerCase() : ''
  const fileSize = typeof body?.fileSize === 'number' ? body.fileSize : Number.NaN
  const category = typeof body?.category === 'string' ? body.category.trim().toLowerCase() : 'todos'

  if (!fileName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama file wajib diisi.',
    })
  }

  if (!fileType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipe file wajib diisi.',
    })
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ukuran file tidak valid.',
    })
  }

  const runtimeConfig = useRuntimeConfig()
  const uploadConfig = runtimeConfig.upload as RuntimeUploadConfig | undefined
  const maxFileSizeBytes = Number(uploadConfig?.imageMaxSizeBytes ?? 5 * 1024 * 1024)
  const allowedMimeTypes = parseAllowedMimeTypes(uploadConfig?.allowedImageMimeTypes)
  const presignExpires = clampExpires(Number(uploadConfig?.imagePresignExpiresInSeconds ?? 120))

  if (!fileType.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File harus berupa gambar.',
    })
  }

  if (allowedMimeTypes.size > 0 && !allowedMimeTypes.has(fileType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipe file tidak diizinkan.',
    })
  }

  if (fileSize > maxFileSizeBytes) {
    throw createError({
      statusCode: 400,
      statusMessage: `Ukuran file maksimal ${Math.floor(maxFileSizeBytes / (1024 * 1024))}MB.`,
    })
  }

  const signedUpload = await createR2PresignedUpload(session.user.id, category, {
    fileName,
    fileType,
    expiresInSeconds: presignExpires,
  })

  return {
    ...signedUpload,
    maxFileSizeBytes,
    expiresInSeconds: presignExpires,
  }
})
