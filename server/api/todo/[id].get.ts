import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/database'
import { todo } from '~~/server/database/schema'
import { auth } from '#server/lib/auth'

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

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID tidak valid atau hilang.',
    })
  }

  const [item] = await db
    .select()
    .from(todo)
    .where(and(eq(todo.id, id), eq(todo.userId, session.user.id)))

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Todo tidak ditemukan.',
    })
  }

  return item
})
