import { createError, readMultipartFormData } from 'h3'
import { uploadFileToR2 } from '#server/lib/r2'
import { auth } from '~~/server/lib/auth'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

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

  const parts = await readMultipartFormData(event)
  const categoryPart = parts?.find((part) => part.name === 'category')
  const category = categoryPart?.data ? categoryPart.data.toString().trim().toLowerCase() : 'todos'
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)

  if (!filePart) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File foto wajib diisi.',
    })
  }

  if (!filePart.type?.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File harus berupa gambar.',
    })
  }

  if (filePart.data.byteLength > MAX_FILE_SIZE_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ukuran file maksimal 5MB.',
    })
  }

  const fileValue = new File([filePart.data], filePart.filename!, {
    type: filePart.type,
  })

  const uploaded = await uploadFileToR2(session.user.id, category, fileValue)

  return {
    photoUrl: uploaded.photoUrl,
    objectKey: uploaded.objectKey,
  }
})
