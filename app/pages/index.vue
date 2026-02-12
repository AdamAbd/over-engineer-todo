<script setup lang="ts">
  useHead({
    title: 'Over Engineer Todo | Todo App for Builders',
    meta: [
      {
        name: 'description',
        content:
          'Kelola todo dengan struktur yang disukai engineer: cepat, terukur, dan bebas dari task chaos.',
      },
    ],
  })

  const highlights = [
    { label: 'Task selesai lebih cepat', value: '2.7x' },
    { label: 'Sinkronisasi antar device', value: '< 80ms' },
    { label: 'Downtime', value: '99.99%' },
  ]

  const features = [
    {
      title: 'Task board yang niat',
      description: 'Pisahkan backlog, in-progress, dan done tanpa ribet drag-drop yang berat.',
    },
    {
      title: 'Prioritas berbasis impact',
      description: 'Lihat pekerjaan mana yang paling ngaruh ke target sprint dan fokus di sana.',
    },
    {
      title: 'Workflow buat tim kecil',
      description: 'Kolaborasi async, update status cepat, dan history jelas untuk setiap task.',
    },
  ]

  const steps = [
    {
      title: 'Capture',
      description: 'Semua ide masuk inbox dulu supaya tidak hilang saat konteks berubah.',
    },
    {
      title: 'Structure',
      description: 'Kelompokkan tugas, kasih estimasi, lalu lock prioritas harian.',
    },
    {
      title: 'Ship',
      description: 'Eksekusi fokus, monitor progress, dan tutup hari dengan review singkat.',
    },
  ]
</script>

<template>
  <div class="px-6 pb-16 md:px-10 md:pb-24">
    <section class="mx-auto grid w-full max-w-6xl gap-10 pt-6 md:grid-cols-[1.1fr_0.9fr] md:pt-12">
      <div class="reveal space-y-7">
        <span
          class="border-border inline-flex items-center rounded-full border bg-white/80 px-4 py-1 text-xs font-bold tracking-[0.14em] uppercase"
        >
          Built for focused makers
        </span>
        <h1
          class="font-['Space_Grotesk','Manrope',sans-serif] text-4xl leading-[1.04] font-black tracking-tight text-[var(--lp-ink)] md:text-6xl"
        >
          Todo app untuk engineer yang suka sistem rapi dan hasil cepat.
        </h1>
        <p class="max-w-xl text-base leading-relaxed text-[var(--lp-soft)] md:text-lg">
          Over Engineer Todo bantu kamu pindah dari daftar tugas acak ke workflow yang jelas. Lebih
          sedikit context-switch, lebih banyak task yang benar-benar selesai.
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <Button size="lg">Mulai gratis</Button>
          <Button variant="outline" size="lg"> Lihat fitur </Button>
        </div>
        <div class="grid max-w-xl grid-cols-1 gap-3 pt-3 sm:grid-cols-3">
          <article
            v-for="item in highlights"
            :key="item.label"
            class="border-border rounded-2xl border bg-white/70 px-4 py-3 backdrop-blur-sm"
          >
            <p
              class="font-['Space_Grotesk','Manrope',sans-serif] text-2xl font-bold text-[var(--lp-ink)]"
            >
              {{ item.value }}
            </p>
            <p class="text-xs leading-tight text-[var(--lp-soft)]">{{ item.label }}</p>
          </article>
        </div>
      </div>

      <div class="reveal delay-1 md:justify-self-end">
        <div
          class="panel relative mx-auto w-full max-w-[520px] overflow-hidden rounded-3xl border border-black/10 bg-[#151515] p-5 shadow-[0_22px_60px_rgba(16,17,14,0.24)]"
        >
          <div
            class="mb-4 flex items-center justify-between text-[11px] tracking-[0.16em] text-white/70 uppercase"
          >
            <span>Sprint Board</span>
            <span>Week 07</span>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <section class="rounded-xl bg-white/6 p-3">
              <h3 class="mb-3 text-xs font-semibold tracking-[0.12em] text-white/80 uppercase">
                Backlog
              </h3>
              <div class="space-y-2">
                <p class="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#272727]">
                  Refactor auth flow
                </p>
                <p class="rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-[#272727]">
                  Fix race condition
                </p>
              </div>
            </section>
            <section class="rounded-xl bg-[color:var(--lp-teal)]/85 p-3">
              <h3 class="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
                In Progress
              </h3>
              <div class="space-y-2">
                <p class="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#214542]">
                  Landing page revamp
                </p>
                <p class="rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-[#214542]">
                  Improve empty state
                </p>
              </div>
            </section>
            <section class="rounded-xl bg-[color:var(--lp-orange)]/90 p-3">
              <h3 class="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
                Done
              </h3>
              <div class="space-y-2">
                <p class="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#4f3412]">
                  Add keyboard shortcut
                </p>
                <p class="rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-[#4f3412]">
                  Setup test suite
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>

    <section id="fitur" class="mx-auto mt-16 w-full max-w-6xl md:mt-24">
      <div class="reveal mb-8 delay-2">
        <p class="text-sm font-semibold tracking-[0.12em] text-[var(--lp-soft)] uppercase">
          Kenapa pilih ini
        </p>
        <h2
          class="font-['Space_Grotesk','Manrope',sans-serif] text-3xl font-bold tracking-tight md:text-4xl"
        >
          Semua yang kamu butuhkan untuk menyelesaikan lebih banyak task.
        </h2>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="(feature, index) in features"
          :key="feature.title"
          class="reveal border-border rounded-2xl border bg-white/70 p-6 backdrop-blur-sm"
          :style="{ animationDelay: `${180 + index * 110}ms` }"
        >
          <div class="mb-4 size-8 rounded-lg bg-[var(--lp-teal)]/15" />
          <h3 class="mb-2 font-['Space_Grotesk','Manrope',sans-serif] text-xl font-semibold">
            {{ feature.title }}
          </h3>
          <p class="text-sm leading-relaxed text-[var(--lp-soft)]">{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section class="mx-auto mt-16 w-full max-w-6xl md:mt-24">
      <div class="reveal border-border rounded-3xl border bg-white/80 p-6 md:p-10">
        <h2
          class="font-['Space_Grotesk','Manrope',sans-serif] text-3xl font-bold tracking-tight md:text-4xl"
        >
          Workflow sederhana, output lebih konsisten.
        </h2>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <article
            v-for="(step, index) in steps"
            :key="step.title"
            class="border-border rounded-2xl border bg-[var(--lp-panel)] p-5"
          >
            <p class="mb-3 text-xs font-bold tracking-[0.14em] text-[var(--lp-soft)] uppercase">
              0{{ index + 1 }}
            </p>
            <h3 class="mb-2 font-['Space_Grotesk','Manrope',sans-serif] text-xl font-semibold">
              {{ step.title }}
            </h3>
            <p class="text-sm leading-relaxed text-[var(--lp-soft)]">{{ step.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="cta" class="mx-auto mt-16 w-full max-w-6xl md:mt-24">
      <div
        class="reveal border-border rounded-3xl border bg-muted px-6 py-10 text-center text-white shadow-[0_18px_40px_rgba(20,20,20,0.25)] delay-2 md:px-10"
      >
        <h2
          class="font-['Space_Grotesk','Manrope',sans-serif] text-3xl font-bold tracking-tight md:text-4xl"
        >
          Stop overthinking. Start shipping.
        </h2>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
          Coba Over Engineer Todo hari ini dan ubah task list jadi progress nyata tiap minggu.
        </p>
        <Button variant="secondary" size="lg" class="mt-6">Daftar gratis sekarang</Button>
      </div>
    </section>
  </div>
</template>

<style scoped>
  .panel {
    transform: rotate(-1.2deg);
    transition: transform 250ms ease;
  }

  .panel:hover {
    transform: rotate(0deg);
  }

  .reveal {
    opacity: 0;
    transform: translateY(16px);
    animation: reveal 700ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  }

  .delay-1 {
    animation-delay: 120ms;
  }

  .delay-2 {
    animation-delay: 240ms;
  }

  @keyframes reveal {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .panel {
      transform: none;
    }
  }
</style>
