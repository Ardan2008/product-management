<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUp } from 'lucide-vue-next'
import { getLenis } from '../../composables/useLenis'

const route = useRoute()

const visible = ref(false)
const progress = ref(0)

// geometri ring (viewBox 48x48, stroke 2)
const radius = 22
const circumference = 2 * Math.PI * radius

/* Ambang pakai rasio terhadap tinggi halaman, bukan pixel tetap: tiap halaman
   tinggi berbeda, jadi pixel tetap tidak pernah muncul di halaman pendek. */
const REVEAL_RATIO = 0.12
const REVEAL_MIN_PX = 120

let ticking = false
let disposed = false

/** Posisi scroll & batas bawah halaman. */
const readScroll = () => {
  const lenis = getLenis()

  // Batas bawah tetap diukur dari DOM: dimensions Lenis di-debounce dan ikut lagging.
  const top = lenis && !lenis.isStopped ? lenis.actualScroll : window.scrollY

  return {
    top,
    limit: Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
  }
}

const update = () => {
  ticking = false
  if (disposed) return

  // Lenis belum tentu ada saat mount, jadi langganan eventnya lengket dari sini.
  syncLenis()

  const { top, limit } = readScroll()
  const threshold = Math.min(limit * REVEAL_RATIO, REVEAL_MIN_PX)

  progress.value = limit > 0 ? Math.min(Math.max(top / limit, 0), 1) : 0

  // limit > 0 menutup halaman yang isinya tidak lebih tinggi dari viewport
  visible.value = limit > 0 && top > threshold
}

// Dibatasi dengan requestAnimationFrame supaya scrolling tetap halus
const scheduleUpdate = () => {
  if (ticking || disposed) return
  ticking = true
  requestAnimationFrame(update)
}

const timers: number[] = []

const clearTimers = () => {
  timers.splice(0).forEach((id) => window.clearTimeout(id))
}

const later = (fn: () => void, delay: number) => {
  timers.push(window.setTimeout(fn, delay))
}

// Lenis memanggil window.scrollTo() tiap frame, jadi event scroll native sudah cukup.
let subscribedLenis: ReturnType<typeof getLenis> = null
let unsubscribeLenis: (() => void) | null = null

function syncLenis() {
  const lenis = getLenis()
  if (!lenis || lenis === subscribedLenis) return

  unsubscribeLenis?.()
  subscribedLenis = lenis
  unsubscribeLenis = lenis.on('scroll', scheduleUpdate)
}

// tinggi tiap halaman baru settling beberapa frame setelah RouterView dirender,
// dan itu tidak menghasilkan event scroll.
watch(
  () => route.fullPath,
  () => {
    clearTimers()
    scheduleUpdate()
    later(scheduleUpdate, 0)
    later(scheduleUpdate, 150)
    later(scheduleUpdate, 400)
  }
)

/* Tombol ikut hilang setelah naik ke atas, jadi fokus harus dikembalikan ke <main>
   supaya pengguna keyboard tidak terjatuh ke <body>. preventScroll supaya tidak
   melawan animasi scroll yang sedang jalan. */
const focusMain = () => {
  if (disposed) return

  // lepas fokus dulu: <main> ada terus di DOM, jadi fokus tidak jatuh ke <body>
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()

  document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
}

const afterScroll = () => {
  scheduleUpdate()
  // tunggu Vue selesai melepas tombol dari DOM sebelum memindahkan fokus
  nextTick(() => requestAnimationFrame(focusMain))
}

// Pakai Lenis supaya scroll ke atas konsisten dengan smooth scrolling situs ini
const toTop = () => {
  const lenis = getLenis()

  if (lenis && !lenis.isStopped) {
    // onComplete Lenis dipanggil sinkron saat scroll-nya instan, jadi afterScroll aman di sini.
    lenis.scrollTo(0, { duration: 1.2, force: true, onComplete: afterScroll })
    return
  }

  // Lenis tidak aktif, andalkan scroll native dan hormati reduced motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  later(afterScroll, reduced ? 0 : 500)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('load', scheduleUpdate)

  // tinggi dokumen berubah diam-diam saat gambar memuat atau font menimpa fallback
  resizeObserver = new ResizeObserver(scheduleUpdate)
  resizeObserver.observe(document.documentElement)
  document.fonts?.ready.then(scheduleUpdate)

  update()
})

onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  window.removeEventListener('load', scheduleUpdate)
  clearTimers()
  unsubscribeLenis?.()
  unsubscribeLenis = null
  subscribedLenis = null
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-4 scale-90 opacity-0"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="translate-y-4 scale-90 opacity-0"
  >
    <button
      v-if="visible"
      type="button"
      aria-label="Back to top"
      class="group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-neutral-700/60 bg-neutral-900 text-neutral-100 shadow-[0_6px_18px_rgba(0,0,0,0.14)] transition duration-300 hover:-translate-y-0.5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 active:scale-95 sm:bottom-8 sm:right-8 dark:border-neutral-600/60 dark:bg-neutral-800 dark:text-neutral-100 dark:shadow-black/40 dark:hover:text-neutral-950"
      @click="toTop"
    >
      <!-- gelembung yang naik dari bawah saat hover -->
      <span
        class="pointer-events-none absolute left-1/2 top-full h-[160%] w-[160%] -translate-x-1/2 rounded-[50%] bg-neutral-200 transition-all duration-500 ease-out group-hover:top-[-30%] dark:bg-neutral-100"
        aria-hidden="true"
      />

      <svg class="absolute inset-0 z-10 -rotate-90" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" :r="radius" stroke="currentColor" stroke-opacity="0.15" stroke-width="2" />
        <circle
          cx="24"
          cy="24"
          :r="radius"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference * (1 - progress)"
        />
      </svg>

      <ArrowUp
        :size="18"
        :stroke-width="2.5"
        class="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  </Transition>
</template>
