export type TodoStatus = 'backlog' | 'in_progress' | 'done'

export interface TodoItem {
  id: string
  title: string
  description: string
  status: TodoStatus
  image_url: string | null
  jsonb: unknown
  created_at: string
}

export interface TodoFormModel {
  title: string
  description: string
  status: TodoStatus
  image_url: string
  jsonb_text: string
}
