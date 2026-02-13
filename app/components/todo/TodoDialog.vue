<script setup lang="ts">
  import type { TodoFormModel } from '~/types/todo'

  const props = defineProps<{
    mode: 'create' | 'edit'
    form: TodoFormModel
    error: string
    open: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'update:form', value: TodoFormModel): void
    (e: 'submit'): void
  }>()

  const updateForm = <K extends keyof TodoFormModel>(key: K, value: TodoFormModel[K]) => {
    emit('update:form', {
      ...props.form,
      [key]: value,
    })
  }

  const titleValue = computed({
    get: () => props.form.title,
    set: (value: string) => updateForm('title', value),
  })

  const statusValue = computed({
    get: () => props.form.status,
    set: (value: TodoFormModel['status']) => updateForm('status', value),
  })

  const descriptionValue = computed({
    get: () => props.form.description,
    set: (value: string) => updateForm('description', value),
  })

  const imageUrlValue = computed({
    get: () => props.form.image_url,
    set: (value: string) => updateForm('image_url', value),
  })

  const jsonbTextValue = computed({
    get: () => props.form.jsonb_text,
    set: (value: string) => updateForm('jsonb_text', value),
  })

  const closeDialog = () => {
    emit('update:open', false)
  }

  const selectedFileName = ref('')
  const uploadError = ref('')
  const uploadPending = ref(false)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  type PresignedUploadResponse = {
    uploadUrl: string
    method: 'PUT'
    headers: Record<string, string>
    objectKey: string
    photoUrl: string
    expiresAt: string
    expiresInSeconds: number
    maxFileSizeBytes: number
  }

  const toUploadErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error !== null) {
      const maybeData = (error as { data?: { statusMessage?: string; message?: string } }).data
      if (maybeData?.statusMessage) {
        return maybeData.statusMessage
      }
      if (maybeData?.message) {
        return maybeData.message
      }

      const maybeStatusMessage = (error as { statusMessage?: string }).statusMessage
      if (maybeStatusMessage) {
        return maybeStatusMessage
      }

      const maybeMessage = (error as { message?: string }).message
      if (maybeMessage) {
        return maybeMessage
      }
    }

    return 'Upload gambar gagal. Coba lagi.'
  }

  const resetUploadState = () => {
    selectedFileName.value = ''
    uploadError.value = ''
    uploadPending.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  const uploadImage = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    uploadError.value = ''

    if (!file) {
      selectedFileName.value = ''
      return
    }

    selectedFileName.value = file.name
    uploadPending.value = true

    try {
      const fileType = file.type || 'application/octet-stream'
      const presigned = await $fetch<PresignedUploadResponse>('/api/upload/presign', {
        method: 'POST',
        body: {
          fileName: file.name,
          fileType,
          fileSize: file.size,
        },
      })

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: presigned.method,
        headers: presigned.headers,
        body: file,
      })

      if (!uploadResponse.ok) {
        const uploadResponseBody = await uploadResponse.text().catch(() => '')
        const suffix = uploadResponseBody ? ` ${uploadResponseBody.slice(0, 250)}` : ''
        throw new Error(
          `Upload ke storage gagal (${uploadResponse.status} ${uploadResponse.statusText}).${suffix}`
        )
      }

      imageUrlValue.value = presigned.photoUrl
    } catch (error) {
      uploadError.value = toUploadErrorMessage(error)
    } finally {
      uploadPending.value = false
    }
  }

  watch(
    () => props.open,
    (isOpen) => {
      if (!isOpen) {
        resetUploadState()
      }
    }
  )
</script>

<template>
  <Dialog :open="props.open" @update:open="(value) => emit('update:open', value)">
    <DialogContent
      class="max-h-[85vh] w-full overflow-y-auto border-black/10 bg-white/95 shadow-[0_20px_55px_rgba(20,24,22,0.2)] sm:max-w-2xl"
    >
      <DialogHeader>
        <DialogTitle class="font-['Space_Grotesk','Manrope',sans-serif] text-2xl">
          {{ props.mode === 'create' ? 'Tambah Todo Baru' : 'Update Todo' }}
        </DialogTitle>
        <DialogDescription>
          Isi data task, termasuk field JSONB dan image URL untuk preview CDN.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="emit('submit')">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="todo-title">Judul</Label>
            <Input
              id="todo-title"
              v-model="titleValue"
              type="text"
              placeholder="Contoh: Integrasi auth middleware"
            />
          </div>

          <div class="space-y-2">
            <Label for="todo-status">Status</Label>
            <NativeSelect id="todo-status" v-model="statusValue" class="w-full">
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </NativeSelect>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="todo-description">Deskripsi</Label>
          <Textarea
            id="todo-description"
            v-model="descriptionValue"
            placeholder="Catatan singkat task yang mau dikerjakan"
            class="min-h-24"
          />
        </div>

        <div class="space-y-2">
          <Label for="todo-image-url">Image URL (Cloudflare CDN)</Label>
          <Input
            id="todo-image-url"
            v-model="imageUrlValue"
            type="url"
            placeholder="https://cdn.example.com/todos/card-01.webp"
          />
          <div class="space-y-2">
            <Label for="todo-image-upload">Upload Gambar</Label>
            <Input
              id="todo-image-upload"
              ref="fileInputRef"
              type="file"
              accept="image/*"
              :disabled="uploadPending"
              @change="uploadImage"
            />
            <p v-if="selectedFileName" class="text-xs text-[#5a5a5a]">
              File dipilih: {{ selectedFileName }}
            </p>
            <p v-if="uploadPending" class="text-xs text-[#3f3f3f]">Mengunggah gambar...</p>
            <p v-if="uploadError" class="text-xs text-red-700">
              {{ uploadError }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="todo-jsonb">JSONB</Label>
          <Textarea
            id="todo-jsonb"
            v-model="jsonbTextValue"
            placeholder='{"priority":"high","estimate":5}'
            class="min-h-40 font-mono text-xs"
          />
        </div>

        <p
          v-if="props.error"
          class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ props.error }}
        </p>

        <DialogFooter class="gap-2">
          <Button type="button" variant="outline" @click="closeDialog">Batal</Button>
          <Button type="submit" :disabled="uploadPending">
            {{ props.mode === 'create' ? 'Simpan Todo' : 'Simpan Perubahan' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
