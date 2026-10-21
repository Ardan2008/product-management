<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, Coffee, Croissant, CupSoda, ImageOff, Package, Utensils } from 'lucide-vue-next'
import type { LandingProduct } from '../../types/landing'

const props = defineProps<{
  products: LandingProduct[]
  isLoading: boolean
}>()

const maxTampil = 3

// ikon mengikuti kategori, sama seperti di halaman produk
const categoryIcon: Record<string, any> = {
  coffee: Coffee,
  'non-coffee': CupSoda,
  bakery: Croissant,
  food: Utensils
}

// 'baru' = produk dengan id terbesar, bukan berdasarkan created_at
const visible = computed(() =>
  [...props.products].sort((a, b) => b.id - a.id).slice(0, maxTampil)
)

const iconFor = (name?: string | null) => categoryIcon[(name || '').toLowerCase()] ?? Package

const formatCurrency = (value: number | string): string => {
  const digits = String(value ?? 0).replace(/\D/g, '')
  return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

const skeletons = [1, 2, 3]

// status gambar per kartu; skeleton tampil sampai @load datang
const loadedImages = ref<Record<number, boolean>>({})

const onLoad = (id: number) => {
  loadedImages.value[id] = true
}
</script>

<template>
  <section id="menu" class="scroll-mt-28 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
    <div v-reveal>
      <h2 class="font-display text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
        Taste &amp; Vibes
      </h2>
      <p class="mt-3 text-base text-neutral-500 dark:text-neutral-400">
        From signature drinks to sweet and savory treats
      </p>
    </div>

    <div v-if="isLoading" class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="n in skeletons"
        :key="n"
        class="aspect-3/4 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
      />
    </div>

    <div
      v-else-if="!products.length"
      class="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-16 text-center"
    >
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
        <ImageOff :size="18" />
      </span>
      <p class="text-sm font-medium text-neutral-950 dark:text-neutral-50">The menu is empty right now</p>
      <p class="text-xs text-neutral-500 dark:text-neutral-400">Add a product and it shows up here on its own.</p>
    </div>

    <div v-else class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="(product, index) in visible"
        :key="product.id"
        v-reveal="index * 80"
        class="group relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-950"
      >
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          :class="loadedImages[product.id] ? 'opacity-100' : 'opacity-0'"
          loading="lazy"
          @load="onLoad(product.id)"
        />
        <div
          v-if="product.image_url && !loadedImages[product.id]"
          class="absolute inset-0 z-10 animate-pulse bg-neutral-100 dark:bg-neutral-800"
        />
        <div v-if="!product.image_url" class="absolute inset-0 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
          <ImageOff :size="28" />
        </div>

        <div
          class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        />

        <span
          class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 backdrop-blur-sm"
        >
          <component :is="iconFor(product.kategori)" :size="14" />
          {{ product.kategori || 'Uncategorized' }}
        </span>

        <span
          class="absolute right-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-950 backdrop-blur-sm"
        >
          New
        </span>

        <div
          class="absolute inset-x-0 bottom-0 translate-y-0 p-6 opacity-100 transition duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100"
        >
          <h3 class="font-display text-xl font-semibold text-white sm:text-2xl">{{ product.name }}</h3>
          <p class="mt-1.5 text-base font-semibold text-white/85">
            {{ formatCurrency(product.price) }}
            <span v-if="product.stock <= 0" class="ml-2 text-sm font-medium text-white/60">· Sold out</span>
          </p>

          <router-link
            :to="{ name: 'products' }"
            class="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-50 dark:hover:bg-neutral-100"
          >
            View details
            <ArrowRight :size="15" />
          </router-link>
        </div>
      </article>
    </div>

    <p v-if="!isLoading && products.length > maxTampil" class="mt-6 text-xs text-neutral-400 dark:text-neutral-500">
      Showing the {{ maxTampil }} newest of {{ products.length }} items. The rest live on the product page.
    </p>
  </section>
</template>
