import { createError, readMultipartFormData } from 'h3'
import { uploadTodoPhotoToR2 } from '#server/lib/r2'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
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

  const uploaded = await uploadTodoPhotoToR2('abc123', fileValue)

  return {
    photoUrl: uploaded.photoUrl,
    objectKey: uploaded.objectKey,
  }
})
