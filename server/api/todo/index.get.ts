import { and, eq, ilike, or, desc, asc, count } from 'drizzle-orm'
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

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search : ''
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || 10))
  const sort = (query.sort as string) || 'created_at'
  const order = (query.order as string) === 'asc' ? 'asc' : 'desc'

  const offset = (page - 1) * limit

  const whereOptions = [eq(todo.userId, session.user.id)]

  if (search) {
    whereOptions.push(
      or(ilike(todo.title, `%${search}%`), ilike(todo.description, `%${search}%`)) as any
    )
  }

  const whereClause = and(...whereOptions)

  // Get total count
  const [totalResult] = await db.select({ count: count() }).from(todo).where(whereClause)

  const total = totalResult?.count ?? 0

  // Get data
  let orderByClause = order === 'desc' ? desc(todo.created_at) : asc(todo.created_at)

  if (sort === 'title') {
    orderByClause = order === 'desc' ? desc(todo.title) : asc(todo.title)
  } else if (sort === 'status') {
    orderByClause = order === 'desc' ? desc(todo.status) : asc(todo.status)
  } else if (sort === 'updated_at') {
    orderByClause = order === 'desc' ? desc(todo.updated_at) : asc(todo.updated_at)
  }

  const items = await db
    .select()
    .from(todo)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
})
