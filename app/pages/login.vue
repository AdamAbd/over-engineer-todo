<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod'
import { Eye, EyeClosed } from 'lucide-vue-next'
  import { useForm, Field as VeeField } from 'vee-validate'
  import { toast } from 'vue-sonner'
  import { z } from 'zod'
  import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'

  definePageMeta({
    layout: 'auth',
  })

  useHead({
    title: 'Login | Over Engineer Todo',
    meta: [
      {
        name: 'description',
        content: 'Masuk ke Over Engineer Todo untuk lanjutkan task dan sprint kamu.',
      },
    ],
  })

  const formSchema = toTypedSchema(
    z.object({
      email: z.string().email({ message: 'Email tidak valid' }),
      password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
    })
  )

  const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
      email: '',
      password: '',
    },
  })

  const passwordVisible = ref(false)

  const onSubmit = handleSubmit((values) => {
    // Simulate login process
    toast.success(`Berhasil login sebagai ${values.email}`)
  })
</script>

<template>
  <Card
    class="border-black/10 bg-white/85 shadow-[0_20px_55px_rgba(20,24,22,0.18)] backdrop-blur-sm"
  >
    <CardHeader>
      <CardTitle class="font-['Space_Grotesk','Manrope',sans-serif] text-2xl">Login</CardTitle>
      <CardDescription>Masuk dan lanjutkan progress task kamu.</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <form id="login-form" class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <FieldGroup>
          <VeeField v-slot="{ field, errors }" name="email">
            <Field :data-invalid="!!errors.length">
              <FieldLabel for="login-form-email">Email</FieldLabel>
              <Input
                id="login-form-email"
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
              <FieldLabel for="login-form-password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="login-form-password"
                  :type="passwordVisible ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter"
                  autocomplete="new-password"
                  :model-value="field.value"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" @click="passwordVisible = !passwordVisible">
                    <Eye v-if="!passwordVisible" />
                    <EyeClosed v-if="passwordVisible" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </VeeField>
        </FieldGroup>

        <NuxtLink to="/register" class="self-end text-sm font-medium text-foreground hover:underline">
          Lupa password?
        </NuxtLink>

        <Button class="w-full" size="lg">Masuk</Button>
      </form>
    </CardContent>

    <CardFooter class="justify-center border-t pt-5 text-sm text-[var(--lp-soft)]">
      Tidak punya akun?
      <NuxtLink to="/register" class="ml-1 font-semibold text-[var(--lp-ink)] hover:underline">
        Daftar di sini
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
