<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
const isSigningOut = ref(false)

const isAuthenticated = computed(() => Boolean(session.value.data?.user))

const handleLogout = async () => {
  if (isSigningOut.value) {
    return
  }

  isSigningOut.value = true

  try {
    const response = await authClient.signOut()

    if (response.error) {
      return
    }

    await navigateTo('/login')
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <div class="landing-shell relative flex min-h-screen flex-col overflow-x-clip">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="orb orb-teal" />
      <div class="orb orb-orange" />
      <div class="noise" />
    </div>

    <header class="relative z-10 px-6 py-6 md:px-10">
      <nav class="mx-auto flex w-full max-w-6xl items-center justify-between">
        <a href="/" class="flex items-center gap-3">
          <div
            class="grid size-9 place-items-center rounded-xl border border-black/10 bg-white/80 text-sm font-extrabold text-(--lp-ink) shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            OE
          </div>
          <p class="font-['Space_Grotesk','Manrope',sans-serif] text-base font-bold tracking-tight">
            over engineer todo
          </p>
        </a>
        <div class="flex items-center gap-2">
          <template v-if="isAuthenticated">
            <Button type="button" variant="outline" :disabled="isSigningOut" @click="handleLogout">
              {{ isSigningOut ? 'Keluar...' : 'Logout' }}
            </Button>
          </template>
          <template v-else>
            <Button as-child variant="outline">
              <NuxtLink to="/home">Dashboard</NuxtLink>
            </Button>
            <Button as-child>
              <NuxtLink to="/register">Mulai Gratis</NuxtLink>
            </Button>
          </template>
        </div>
      </nav>
    </header>

    <main class="relative z-10 flex-1">
      <slot />
    </main>

    <footer class="border-border relative z-10 border-t px-6 py-8 md:px-10">
      <div
        class="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <p class="text-sm text-[var(--lp-soft)]">
          © {{ new Date().getFullYear() }} Over Engineer Todo
        </p>
        <div class="flex items-center gap-4 text-sm font-medium text-[var(--lp-soft)]">
          <a href="#fitur" class="transition hover:text-[var(--lp-ink)]">Fitur</a>
          <a href="#cta" class="transition hover:text-[var(--lp-ink)]">Daftar</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
  .landing-shell {
    background:
      radial-gradient(1300px 720px at 0% 0%, #fff8e9 0%, transparent 60%),
      radial-gradient(1100px 720px at 100% 20%, #e8f8f5 0%, transparent 58%), var(--lp-bg);
    font-family: 'Manrope', 'Avenir Next', 'Segoe UI', sans-serif;
  }

  .orb {
    position: absolute;
    filter: blur(70px);
    opacity: 0.32;
    border-radius: 9999px;
  }

  .orb-teal {
    width: 380px;
    height: 380px;
    background: #59d0b4;
    top: 14%;
    right: -130px;
  }

  .orb-orange {
    width: 420px;
    height: 420px;
    background: #ffcf89;
    bottom: -190px;
    left: -160px;
  }

  .noise {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgb(0 0 0 / 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(0 0 0 / 0.03) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: radial-gradient(circle at center, black, transparent 82%);
  }
</style>
