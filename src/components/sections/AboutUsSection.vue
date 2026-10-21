<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowRight, X } from 'lucide-vue-next'
import BlurReveal from '../ui/BlurReveal.vue'
import type { LandingProduct } from '../../types/landing'

// props dibiarkan opsional agar parent yang masih mengirim data tidak error
defineProps<{
  products?: LandingProduct[]
}>()

const highlights = [
  'Single origin beans, roasted three times a week',
  'Brewed in the same room where it is served',
  'A quiet room, twenty seats, no loud music'
]

const isOpen = ref(false)
const closeBtn = ref<HTMLButtonElement | null>(null)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}

// kunci scroll halaman selama popup terbuka
watch(isOpen, async (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
  if (value) {
    await nextTick()
    closeBtn.value?.focus()
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section id="about" class="scroll-mt-28 bg-black text-white">
    <div
      class="mx-auto grid max-w-[110rem] gap-8 px-4 py-16 sm:px-8 md:py-20 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-16 lg:px-16"
    >
      <h2
        class="font-display text-4xl font-semibold lowercase leading-none tracking-tight sm:text-5xl lg:text-6xl"
      >
        <BlurReveal>what about us</BlurReveal>
      </h2>

      <p class="max-w-md text-base leading-relaxed text-white/70 lg:justify-self-center">
        <BlurReveal as="p" block :delay="0.15">
          A modern coffee brand for those who appreciate good coffee, thoughtful design, and
          simple moments, one cup at a time.
        </BlurReveal>
      </p>

      <button
        type="button"
        class="group inline-flex items-center gap-3 justify-self-start rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-neutral-950 dark:hover:bg-neutral-50 dark:hover:text-neutral-950 lg:justify-self-end"
        aria-haspopup="dialog"
        @click="open"
      >
        learn about us
        <ArrowRight :size="16" class="transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
    </div>

    <!-- popup dipindahkan ke <body> agar selalu berada di depan halaman -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          @click.self="close"
        >
          <div
            class="panel relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-4xl border border-white/20 bg-neutral-950/60 p-8 text-white backdrop-blur-2xl sm:p-12"
          >
            <button
              ref="closeBtn"
              type="button"
              class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-300 hover:bg-white hover:text-neutral-950"
              aria-label="Close"
              @click="close"
            >
              <X :size="18" />
            </button>

            <span class="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              What about us
            </span>

            <h3
              id="about-title"
              class="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl"
            >
              More than coffee,
              <span class="italic text-white/60">it’s an everyday ritual.</span>
            </h3>

            <p class="mt-6 text-base leading-relaxed text-white/70">
              Orvella is a modern coffee brand created for those who appreciate good coffee,
              thoughtful design, and simple moments. We bring together quality beans, refined
              taste, and a minimalist experience in every cup.
            </p>

            <ul class="mt-8 space-y-3">
              <li
                v-for="item in highlights"
                :key="item"
                class="flex items-start gap-3 text-sm text-white/80"
              >
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
/* durasi overlay dan panel sengaja sama (0.4s): Vue menunggu overlay selesai
   sebelum popup dilepas dari DOM */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s ease;
}
.modal-enter-active .panel,
.modal-leave-active .panel {
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.4s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .panel,
.modal-leave-to .panel {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .panel,
  .modal-leave-active .panel {
    transition: none;
  }
}
</style>
