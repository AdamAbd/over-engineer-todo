import tailwindcss from '@tailwindcss/vite'

const isDev = process.env.NODE_ENV !== 'production'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: isDev },
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/home': { ssr: false },
  },
  modules: [
    ...(isDev ? ['@nuxt/eslint', '@nuxt/hints', '@nuxt/test-utils/module'] : []),
    '@vueuse/nuxt',
    '@nuxt/image',
    'shadcn-nuxt',
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    upload: {
      imageMaxSizeBytes: Number(process.env.TODO_IMAGE_MAX_SIZE_BYTES ?? 5 * 1024 * 1024),
      imagePresignExpiresInSeconds: Number(
        process.env.TODO_IMAGE_PRESIGN_EXPIRES_IN_SECONDS ?? 120
      ),
      allowedImageMimeTypes:
        process.env.TODO_IMAGE_ALLOWED_MIME_TYPES ??
        'image/jpeg,image/png,image/webp,image/avif,image/gif',
    },
    r2: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      endpoint: process.env.R2_ENDPOINT,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    },
  },
})
