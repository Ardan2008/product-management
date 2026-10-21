<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowRight, Loader2 } from 'lucide-vue-next'
import type { LandingProduct } from '../../types/landing'

const props = defineProps<{
  products: LandingProduct[]
  isLoading: boolean
}>()

const fallbackImage = '/coffee.webp'
const imageFailed = ref(false)
const imageLoaded = ref(false)

const featured = computed(() => props.products.find((item) => item.image_url) ?? props.products[0] ?? null)

const imageSrc = computed(() => {
  if (imageFailed.value || !featured.value?.image_url) return fallbackImage
  return featured.value.image_url
})

// sumber berganti (mis. jatuh ke fallback) → hitung ulang pemuatan dari nol
watch(imageSrc, () => {
  imageLoaded.value = false
})

const imageFit = computed(() => (featured.value?.image_url ? 'object-cover' : 'object-contain p-8'))

const formatCurrency = (value: number | string): string => {
  const digits = String(value ?? 0).replace(/\D/g, '')
  return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}
</script>

<template>
  <section id="collection" class="scroll-mt-28 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
    <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div v-reveal class="relative">
        <div class="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <div
            v-if="isLoading"
            class="flex aspect-4/5 w-full animate-pulse flex-col items-center justify-center gap-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
          >
            <Loader2 :size="22" class="animate-spin" />
            <span class="text-xs tracking-wide">Loading the collection...</span>
          </div>
          <template v-else>
            <!-- skeleton sampai gambar (API atau fallback) selesai dimuat -->
            <div
              v-if="!imageLoaded"
              class="absolute inset-0 z-10 animate-pulse bg-neutral-100 dark:bg-neutral-800"
            />
            <img
              :src="imageSrc"
              :alt="featured?.name ?? 'Orvella signature coffee'"
              class="aspect-4/5 w-full transition duration-700"
              :class="[imageFit, imageLoaded ? 'opacity-100' : 'opacity-0']"
              loading="lazy"
              @load="imageLoaded = true"
              @error="imageFailed = true"
            />
          </template>
        </div>

        <div
          v-if="!isLoading && featured && imageLoaded"
          class="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl bg-white/90 dark:bg-neutral-950/90 px-5 py-4 backdrop-blur"
        >
          <div class="min-w-0">
            <p class="truncate font-display text-base font-semibold text-neutral-950 dark:text-neutral-50">
              {{ featured.name }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ featured.kategori || 'Signature' }}</p>
          </div>
          <span class="shrink-0 text-sm font-bold text-neutral-950 dark:text-neutral-50">
            {{ formatCurrency(featured.price) }}
          </span>
        </div>
      </div>

      <div v-reveal="120">
        <span class="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
          collection
        </span>
        <h2 class="mt-4 font-display text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
          Collection
        </h2>
        <p class="mt-5 max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          A short menu, kept on purpose. Every coffee in the Orvella collection is roasted in small
          batches and served at the exact point where its flavour opens up, so nothing on the list
          is here just to fill the counter.
        </p>

        <router-link
          :to="{ name: 'products' }"
          class="group mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 dark:bg-neutral-50 px-6 py-3 text-sm font-semibold text-white dark:text-neutral-950 transition hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          View more
          <ArrowRight :size="16" class="transition-transform group-hover:translate-x-0.5" />
        </router-link>

        <p class="mt-10 max-w-sm border-l-2 border-neutral-950 dark:border-neutral-700 pl-5 font-display text-lg italic leading-relaxed text-neutral-950 dark:text-neutral-50">
          “From bean to cup, nothing is rushed. That is the whole Orvella idea.”
        </p>
      </div>
    </div>
  </section>
</template>
