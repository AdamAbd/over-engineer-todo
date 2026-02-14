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

  const body = await readBody(event)

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Judul todo wajib diisi.',
    })
  }

  const newTodo: typeof todo.$inferInsert = {
    id: crypto.randomUUID(),
    userId: session.user.id,
    title: body.title,
    description: body.description || '',
    status: (body.status as 'backlog' | 'in_progress' | 'done') || 'backlog',
    image_url: body.image_url || null,
    jsonb: body.jsonb || null,
  }

  const [inserted] = await db.insert(todo).values(newTodo).returning()

  return inserted
})
