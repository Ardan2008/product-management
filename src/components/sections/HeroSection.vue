<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BlurReveal from '../ui/BlurReveal.vue'

const router = useRouter()

const heroImage = '/coffee.webp'
const heroImageAlt = 'Iced coffee in a glass'
const imageFailed = ref(false)

const isNavigating = ref(false)

// route products itu terlindungi; kalau belum login, router guard yang (-> login + popup)
async function handleExplore() {
  isNavigating.value = true
  try {
    await router.push({ name: 'products' })
  } finally {
    isNavigating.value = false
  }
}
</script>

<template>
  <section
    class="relative mx-auto flex w-full max-w-[110rem] flex-col overflow-hidden px-6 py-10 text-black dark:text-white md:px-16 md:py-12 lg:min-h-[calc(100svh-5rem)]"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[20vw] font-black tracking-tighter text-black/3 dark:text-white/3 md:text-[16vw]"
    >
      ORVELLA
    </span>

    <div
      class="relative z-10 mx-auto mb-6 flex w-full max-w-6xl flex-1 flex-col items-center justify-center pt-4 md:mb-0 md:flex-row md:pt-0"
    >
      <h1
        class="font-display order-2 shrink-0 text-center text-6xl font-bold leading-none tracking-tight md:order-1 md:-mr-8 md:text-right md:text-6xl lg:-mr-12 lg:text-8xl"
      >
        <BlurReveal>Orvella</BlurReveal>
      </h1>

      <div class="relative order-1 flex shrink-0 justify-center md:order-2">
        <div
          aria-hidden="true"
          class="absolute left-1/2 top-1/2 aspect-square w-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/10 dark:bg-white/10 blur-3xl sm:w-65 md:w-[320px] lg:w-95"
        />
        <img
          v-if="!imageFailed"
          :src="heroImage"
          :alt="heroImageAlt"
          class="relative h-auto w-70 object-contain drop-shadow-2xl sm:w-90 lg:w-130"
          @error="imageFailed = true"
        />
      </div>

      <h1
        class="font-display order-3 shrink-0 text-center text-6xl font-bold leading-none tracking-tight md:-ml-8 md:text-left md:text-6xl lg:-ml-12 lg:text-8xl"
      >
        <BlurReveal :delay="0.15">Coffee</BlurReveal>
      </h1>
    </div>

    <div class="relative z-10 mx-auto w-full max-w-6xl">
      <div class="max-w-sm text-left">
        <BlurReveal as="p" block :delay="0.3" class="text-base text-black dark:text-white md:text-lg">
          Formulated from the best choice beans, Orvella Coffee presents clean, rich, consistent
          taste in every sip — created for those who appreciate the details in a cup of coffee.
        </BlurReveal>

        <button
          type="button"
          :disabled="isNavigating"
          class="mt-8 inline-flex cursor-pointer items-center gap-2 border-2 border-black dark:border-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-black dark:text-white transition-colors duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
          @click="handleExplore"
        >
          Explore
          <ArrowRight :size="20" />
        </button>
      </div>
    </div>
  </section>
</template>