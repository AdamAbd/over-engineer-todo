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
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID tidak valid atau hilang.',
    })
  }

  const updatedTodo: Partial<typeof todo.$inferInsert> = {
    updated_at: new Date(),
  }

  if (body.title !== undefined) updatedTodo.title = body.title
  if (body.description !== undefined) updatedTodo.description = body.description
  if (body.status !== undefined) updatedTodo.status = body.status
  if (body.image_url !== undefined) updatedTodo.image_url = body.image_url
  if (body.jsonb !== undefined) updatedTodo.jsonb = body.jsonb

  const [updated] = await db
    .update(todo)
    .set(updatedTodo)
    .where(and(eq(todo.id, id), eq(todo.userId, session.user.id)))
    .returning()

  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Todo tidak ditemukan atau bukan milik Anda.',
    })
  }

  return updated
})
