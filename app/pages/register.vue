<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod'
  import { Eye, EyeClosed } from 'lucide-vue-next'
  import { Field as VeeField, useForm } from 'vee-validate'
  import { toast } from 'vue-sonner'
  import { z } from 'zod'
  import { authClient } from '~/lib/auth-client'

  definePageMeta({
    layout: 'auth',
    middleware: 'guest',
  })

  useHead({
    title: 'Register | Over Engineer Todo',
    meta: [
      {
        name: 'description',
        content: 'Buat akun Over Engineer Todo dan mulai rapikan workflow task kamu.',
      },
    ],
  })

  const formSchema = toTypedSchema(
    z
      .object(
        {
          name: z.string().min(1, { message: 'Nama tidak boleh kosong' }),
          email: z.string().email({ message: 'Email tidak valid' }),
          password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
          confirmPassword: z.string().min(8, { message: 'Konfirmasi password minimal 8 karakter' }),
        },
        {
          errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.custom && issue.message === 'passwords_must_match') {
              return { message: 'Password dan konfirmasi password tidak sesuai' }
            }
            return { message: ctx.defaultError }
          },
        }
      )
      .refine((data) => data.password === data.confirmPassword, {
        message: 'passwords_must_match',
      })
  )

  const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordVisible = ref(false)
  const passwordConfirmVisible = ref(false)
  const isSubmitting = ref(false)

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting.value) {
      return
    }

    isSubmitting.value = true

    try {
      const response = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (response.error) {
        toast.error(response.error.message ?? 'Gagal membuat akun')
        return
      }

      toast.success(`Akun ${values.email} berhasil dibuat`)
      await navigateTo('/home')
    } catch {
      toast.error('Terjadi kendala saat membuat akun. Coba lagi.')
    } finally {
      isSubmitting.value = false
    }
  })
</script>

<template>
  <Card
    class="border-black/10 bg-white/85 shadow-[0_20px_55px_rgba(20,24,22,0.18)] backdrop-blur-sm"
  >
    <CardHeader>
      <CardTitle class="font-['Space_Grotesk','Manrope',sans-serif] text-2xl">Register</CardTitle>
      <CardDescription>Bikin akun baru, lalu mulai sprint pertamamu.</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <form id="register-form" class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <FieldGroup>
          <VeeField v-slot="{ field, errors }" name="name">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="register-form-name">Nama</FieldLabel>
              <Input
                id="register-form-name"
                type="text"
                placeholder="Nama lengkap"
                :model-value="field.value"
                @update:model-value="field.onChange"
              />
            </Field>
          </VeeField>
        </FieldGroup>

        <FieldGroup>
          <VeeField v-slot="{ field, errors }" name="email">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="register-form-email">Email</FieldLabel>
              <Input
                id="register-form-email"
                type="email"
                placeholder="kamu@company.com"
                autocomplete="email"
                :model-value="field.value"
                @update:model-value="field.onChange"
              />
            </Field>
          </VeeField>
        </FieldGroup>

        <FieldGroup>
          <VeeField v-slot="{ field, errors }" name="password">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="register-form-password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="register-form-password"
                  :type="passwordVisible ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter"
                  autocomplete="new-password"
                  :model-value="field.value"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    @click="passwordVisible = !passwordVisible"
                  >
                    <Eye v-if="!passwordVisible" />
                    <EyeClosed v-if="passwordVisible" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </VeeField>
        </FieldGroup>

        <FieldGroup>
          <VeeField v-slot="{ field, errors }" name="confirmPassword">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="register-form-confirm-password">Konfirmasi Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="register-form-confirm-password"
                  :type="passwordConfirmVisible ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter"
                  autocomplete="new-password"
                  :model-value="field.value"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    @click="passwordConfirmVisible = !passwordConfirmVisible"
                  >
                    <Eye v-if="!passwordConfirmVisible" />
                    <EyeClosed v-if="passwordConfirmVisible" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </VeeField>
        </FieldGroup>

        <p class="text-xs leading-relaxed text-[var(--lp-soft)]">
          Dengan mendaftar, kamu menyetujui ketentuan penggunaan dan kebijakan privasi.
        </p>

        <Button type="submit" class="w-full" size="lg" :disabled="isSubmitting">
          {{ isSubmitting ? 'Memproses...' : 'Buat akun' }}
        </Button>
      </form>
    </CardContent>

    <CardFooter class="justify-center border-t pt-5 text-sm text-[var(--lp-soft)]">
      Sudah punya akun?
      <NuxtLink to="/login" class="ml-1 font-semibold text-[var(--lp-ink)] hover:underline">
        Login di sini
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
