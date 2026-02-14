<script setup lang="ts">
  import { PencilLine, Plus, Trash2 } from 'lucide-vue-next'
  import type { TodoFormModel, TodoItem, TodoStatus } from '~/types/todo'
  import { z } from 'zod'

  definePageMeta({
    middleware: 'auth',
  })

  useHead({
    title: 'Home Todo | Over Engineer Todo',
    meta: [
      {
        name: 'description',
        content:
          'Kelola backlog, in-progress, dan done dari satu board. Tambah dan update todo lewat dialog dengan field jsonb dan image url.',
      },
    ],
  })

  const statusOrder = ['backlog', 'in_progress', 'done'] as const

  const statusMeta: Record<
    TodoStatus,
    {
      label: string
      panelClass: string
      textClass: string
      accentClass: string
    }
  > = {
    backlog: {
      label: 'Backlog',
      panelClass: 'bg-white/6',
      textClass: 'text-white/85',
      accentClass: 'text-white/70',
    },
    in_progress: {
      label: 'In Progress',
      panelClass: 'bg-[color:var(--lp-teal)]/90',
      textClass: 'text-white',
      accentClass: 'text-white/75',
    },
    done: {
      label: 'Done',
      panelClass: 'bg-[color:var(--lp-orange)]/92',
      textClass: 'text-white',
      accentClass: 'text-white/75',
    },
  }

  const todoFormSchema = z.object({
    title: z.string().trim().min(1, 'Judul todo wajib diisi'),
    description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter'),
    status: z.enum(statusOrder),
    image_url: z
      .string()
      .trim()
      .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, {
        message: 'Image URL harus kosong atau berupa URL valid',
      }),
    jsonb_text: z
      .string()
      .trim()
      .refine((value) => {
        try {
          JSON.parse(value)
          return true
        } catch {
          return false
        }
      }, 'Field JSONB harus berformat JSON valid'),
  })

  const page = ref(1)
  const limit = ref(12)
  const search = ref('')
  const sort = ref('created_at')
  const order = ref<'asc' | 'desc'>('desc')

  const {
    data: todoResponse,
    refresh: refreshTodos,
    status: fetchStatus,
  } = await useFetch('/api/todo', {
    query: {
      page,
      limit,
      search,
      sort,
      order,
    },
    watch: [page, search, sort, order],
  })

  const todos = computed(() => todoResponse.value?.items ?? [])

  const dialogOpen = ref(false)
  const dialogMode = ref<'create' | 'edit'>('create')
  const editingTodoId = ref<string | null>(null)
  const formError = ref('')

  const form = reactive<TodoFormModel>({
    title: '',
    description: '',
    status: 'backlog',
    image_url: '',
    jsonb_text: '{\n  "priority": "medium",\n  "tags": []\n}',
  })

  const boardColumns = computed(() =>
    statusOrder.map((status) => ({
      status,
      ...statusMeta[status],
      items: todos.value.filter((todo) => todo.status === status),
    }))
  )

  const totalTodos = computed(() => todoResponse.value?.pagination.total ?? 0)
  const doneCount = computed(() => todos.value.filter((todo) => todo.status === 'done').length)

  const formatJsonb = (value: unknown) => JSON.stringify(value, null, 2)

  const jsonSummary = (value: unknown) => {
    if (value === null) {
      return 'null'
    }

    if (Array.isArray(value)) {
      return `array (${value.length})`
    }

    if (typeof value === 'object') {
      return `object (${Object.keys(value as Record<string, unknown>).length} key)`
    }

    return typeof value
  }

  const resetForm = (status: TodoStatus = 'backlog') => {
    form.title = ''
    form.description = ''
    form.status = status
    form.image_url = ''
    form.jsonb_text = '{\n  "priority": "medium",\n  "tags": []\n}'
    formError.value = ''
  }

  const openCreateDialog = (status: TodoStatus = 'backlog') => {
    dialogMode.value = 'create'
    editingTodoId.value = null
    resetForm(status)
    dialogOpen.value = true
  }

  const openEditDialog = (todo: TodoItem) => {
    dialogMode.value = 'edit'
    editingTodoId.value = todo.id
    form.title = todo.title
    form.description = todo.description
    form.status = todo.status
    form.image_url = todo.image_url ?? ''
    form.jsonb_text = formatJsonb(todo.jsonb)
    formError.value = ''
    dialogOpen.value = true
  }

  const removeTodo = async (todoId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus todo ini?')) return

    try {
      await $fetch(`/api/todo/${todoId}`, {
        method: 'DELETE',
      })
      await refreshTodos()
    } catch (e: any) {
      console.error('Gagal menghapus todo:', e)
    }
  }

  const submitTodo = async () => {
    const parsedForm = todoFormSchema.safeParse(form)
    if (!parsedForm.success) {
      formError.value = parsedForm.error.issues[0]?.message ?? 'Form todo tidak valid'
      return
    }

    const parsedJsonb = JSON.parse(parsedForm.data.jsonb_text)

    try {
      if (dialogMode.value === 'create') {
        await $fetch('/api/todo', {
          method: 'POST',
          body: {
            title: parsedForm.data.title,
            description: parsedForm.data.description,
            status: parsedForm.data.status,
            image_url: parsedForm.data.image_url,
            jsonb: parsedJsonb,
          },
        })
      } else if (editingTodoId.value) {
        await $fetch(`/api/todo/${editingTodoId.value}`, {
          method: 'PATCH',
          body: {
            title: parsedForm.data.title,
            description: parsedForm.data.description,
            status: parsedForm.data.status,
            image_url: parsedForm.data.image_url,
            jsonb: parsedJsonb,
          },
        })
      }

      await refreshTodos()
      dialogOpen.value = false
    } catch (e: any) {
      formError.value = e.data?.message || e.message || 'Gagal menyimpan todo'
    }
  }

  const updateForm = (nextForm: TodoFormModel) => {
    Object.assign(form, nextForm)
  }

  watch(dialogOpen, (isOpen) => {
    if (!isOpen) {
      formError.value = ''
    }
  })
</script>

<template>
  <div class="px-6 pb-16 md:px-10 md:pb-24">
    <section class="mx-auto w-full max-w-6xl pt-6 md:pt-12">
      <div class="reveal space-y-7">
        <div class="flex flex-wrap">
          <span
            class="border-border inline-flex items-center rounded-full border bg-white/80 px-4 py-1 text-xs font-bold tracking-[0.14em] uppercase"
          >
            Todo Workspace
          </span>
          <h1
            class="mt-4 font-['Space_Grotesk','Manrope',sans-serif] text-4xl leading-[1.05] font-black tracking-tight text-[var(--lp-ink)] md:text-5xl"
          >
            Sprint Board untuk backlog, progress, dan done.
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--lp-soft)] md:text-base">
            Tambah atau update todo langsung dari dialog. Setiap todo punya field
            <code>jsonb</code> dan <code>image_url</code> supaya siap dihubungkan ke backend + CDN.
          </p>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="grid w-full max-w-2xl grid-cols-2 gap-3">
            <article
              class="border-border rounded-2xl border bg-white/70 px-4 py-3 backdrop-blur-sm"
            >
              <p
                class="font-['Space_Grotesk','Manrope',sans-serif] text-2xl font-bold text-[var(--lp-ink)]"
              >
                {{ totalTodos }}
              </p>
              <p class="text-xs leading-tight text-[var(--lp-soft)]">Total todo aktif</p>
            </article>
            <article
              class="border-border rounded-2xl border bg-white/70 px-4 py-3 backdrop-blur-sm"
            >
              <p
                class="font-['Space_Grotesk','Manrope',sans-serif] text-2xl font-bold text-[var(--lp-ink)]"
              >
                {{ doneCount }}
              </p>
              <p class="text-xs leading-tight text-[var(--lp-soft)]">Todo selesai</p>
            </article>
          </div>

          <div class="w-full max-w-xs">
            <Input
              v-model="search"
              type="text"
              placeholder="Cari todo..."
              class="rounded-xl bg-white/50 backdrop-blur-sm"
              @input="page = 1"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto mt-8 w-full max-w-6xl">
      <div
        class="reveal relative overflow-hidden rounded-4xl border border-black/10 bg-[#151515] p-4 shadow-[0_24px_60px_rgba(16,17,14,0.26)] delay-1 md:p-6"
      >
        <div
          class="mb-5 flex items-center justify-between text-[11px] tracking-[0.16em] text-white/70 uppercase"
        >
          <span>Sprint Board</span>
          <span>Week 07</span>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <section
            v-for="column in boardColumns"
            :key="column.status"
            class="min-h-[360px] rounded-3xl p-4"
            :class="column.panelClass"
          >
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2
                  class="text-sm font-semibold tracking-[0.12em] uppercase"
                  :class="column.textClass"
                >
                  {{ column.label }}
                </h2>
                <p class="text-xs" :class="column.accentClass">{{ column.items.length }} item</p>
              </div>
              <button
                size="icon-sm"
                variant="secondary"
                class="inline-flex size-8 items-center justify-center rounded-lg bg-white/90 text-black hover:bg-white"
                @click="openCreateDialog(column.status)"
              >
                <Plus class="size-4" />
              </button>
            </div>

            <div class="space-y-3">
              <article
                v-for="todo in column.items"
                :key="todo.id"
                class="rounded-2xl bg-white px-3 py-3 text-[#272727] shadow-[0_10px_22px_rgba(0,0,0,0.12)]"
              >
                <NuxtImg
                  v-if="todo.image_url"
                  :src="todo.image_url"
                  :alt="`Preview untuk ${todo.title}`"
                  class="mb-3 h-24 w-full rounded-xl border border-black/5 object-cover"
                  loading="lazy"
                  sizes="sm:100vw md:33vw"
                />

                <h3 class="text-sm leading-snug font-semibold">
                  {{ todo.title }}
                </h3>
                <p
                  v-if="todo.description"
                  class="mt-1 line-clamp-3 text-xs leading-relaxed text-[#4b4b4b]"
                >
                  {{ todo.description }}
                </p>

                <div class="mt-3 rounded-lg bg-[#f5f5f5] px-2 py-2">
                  <p class="text-[11px] font-medium text-[#616161]">
                    jsonb: {{ jsonSummary(todo.jsonb) }}
                  </p>
                  <pre class="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[#4b4b4b]">{{
                    formatJsonb(todo.jsonb)
                  }}</pre>
                </div>

                <div class="mt-3 flex items-center justify-between gap-2">
                  <Button size="sm" variant="outline" class="gap-1.5" @click="openEditDialog(todo)">
                    <PencilLine class="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="text-red-600 hover:text-red-700"
                    @click="removeTodo(todo.id)"
                  >
                    <Trash2 class="size-3.5" />
                  </Button>
                </div>
              </article>

              <article
                v-if="column.items.length === 0"
                class="rounded-2xl border border-dashed border-white/35 bg-white/8 px-3 py-5 text-center text-xs text-white/80"
              >
                Belum ada todo di kolom ini.
              </article>
            </div>
          </section>
        </div>

        <!-- Pagination -->
        <div
          v-if="todoResponse?.pagination && todoResponse.pagination.totalPages > 1"
          class="mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-6"
        >
          <Button
            variant="outline"
            size="sm"
            :disabled="page === 1"
            class="bg-white/10 text-white hover:bg-white/20"
            @click="page--"
          >
            Prev
          </Button>
          <span class="text-xs text-white/70">
            Halaman {{ page }} dari {{ todoResponse.pagination.totalPages }}
          </span>
          <Button
            variant="outline"
            size="sm"
            :disabled="page >= todoResponse.pagination.totalPages"
            class="bg-white/10 text-white hover:bg-white/20"
            @click="page++"
          >
            Next
          </Button>
        </div>
      </div>
    </section>

    <TodoDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :form="form"
      :error="formError"
      @update:form="updateForm"
      @submit="submitTodo"
    />
  </div>
</template>

<style scoped>
  .reveal {
    opacity: 0;
    transform: translateY(16px);
    animation: reveal 720ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  }

  .delay-1 {
    animation-delay: 140ms;
  }

  @keyframes reveal {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
