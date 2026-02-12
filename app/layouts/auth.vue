<template>
  <div class="auth-shell relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="orb orb-teal" />
      <div class="orb orb-orange" />
      <div class="noise" />
    </div>

    <header class="relative z-10 px-6 py-6 md:px-10">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div
            class="grid size-9 place-items-center rounded-xl border border-black/10 bg-white/80 text-sm font-extrabold text-(--lp-ink) shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            OE
          </div>
          <p class="font-['Space_Grotesk','Manrope',sans-serif] text-base font-bold tracking-tight">
            over engineer todo
          </p>
        </NuxtLink>

        <Button as-child variant="outline">
          <NuxtLink to="/">Kembali</NuxtLink>
        </Button>
      </div>
    </header>

    <main class="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl items-center px-6 pb-10 md:px-10">
      <section class="hidden max-w-xl space-y-6 md:block">
        <p class="text-sm font-semibold tracking-[0.12em] text-[var(--lp-soft)] uppercase">
          Auth Workspace
        </p>
        <h1
          class="font-['Space_Grotesk','Manrope',sans-serif] text-5xl leading-[1.05] font-black tracking-tight text-[var(--lp-ink)]"
        >
          Satu langkah lagi buat workflow task yang lebih rapi.
        </h1>
        <p class="max-w-lg text-base leading-relaxed text-[var(--lp-soft)]">
          Login untuk lanjutkan pekerjaan kamu, atau buat akun baru dalam hitungan detik.
        </p>
      </section>

      <section class="w-full md:ml-auto md:max-w-md">
        <slot />
      </section>
    </main>
  </div>
</template>

<style scoped>
  .auth-shell {
    background:
      radial-gradient(900px 520px at 8% 8%, #fff8e9 0%, transparent 62%),
      radial-gradient(860px 560px at 100% 0%, #e8f8f5 0%, transparent 58%), var(--lp-bg);
    font-family: 'Manrope', 'Avenir Next', 'Segoe UI', sans-serif;
  }

  .orb {
    position: absolute;
    filter: blur(80px);
    opacity: 0.26;
    border-radius: 9999px;
  }

  .orb-teal {
    width: 340px;
    height: 340px;
    background: #59d0b4;
    top: -90px;
    right: -100px;
  }

  .orb-orange {
    width: 380px;
    height: 380px;
    background: #ffcf89;
    bottom: -180px;
    left: -140px;
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
