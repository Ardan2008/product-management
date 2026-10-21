<script setup lang="ts">
import { ref } from 'vue'
import { ImageOff } from 'lucide-vue-next'
import BlurReveal from '../ui/BlurReveal.vue'

interface GalleryItem {
  title: string
  src: string
  cell: string
}

const gallery: GalleryItem[] = [
  { title: 'Cafe Interior', src: '/gallery/interior.webp', cell: 'col-span-2 row-span-2' },
  { title: 'Brewing Process', src: '/gallery/brewing.webp', cell: 'col-span-2 row-span-1' },
  { title: 'Coffee Products', src: '/gallery/product.webp', cell: 'col-span-1 row-span-1' },
  { title: 'Barista at Work', src: '/gallery/barista.webp', cell: 'col-span-1 row-span-1' }
]

const failed = ref<Record<string, boolean>>({})
const loaded = ref<Record<string, boolean>>({})

const onError = (title: string) => {
  failed.value = { ...failed.value, [title]: true }
}

const onLoad = (title: string) => {
  loaded.value = { ...loaded.value, [title]: true }
}
</script>

<template>
  <section id="gallery" class="relative scroll-mt-28 text-neutral-950 dark:text-neutral-50">
    <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
      <div class="max-w-xl">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
          Gallery
        </span>
        <h2
          class="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          <BlurReveal>Inside</BlurReveal>{{ ' ' }}
          <BlurReveal :delay="0.1"><span class="italic">Orvella</span></BlurReveal>
        </h2>
      </div>

      <div class="mt-12 grid auto-rows-40 grid-cols-2 gap-2 md:mt-16 md:auto-rows-50 md:grid-cols-4">
        <div
          v-for="item in gallery"
          :key="item.title"
          class="group relative overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          :class="item.cell"
        >
          <div
            v-if="failed[item.title]"
            class="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-400 dark:text-neutral-500"
          >
            <ImageOff :size="22" />
            <span class="text-xs">{{ item.title }}</span>
          </div>

          <template v-else>
            <!-- skeleton menutupi sel sampai benang gambar selesai di-decode -->
            <div
              v-if="!loaded[item.title]"
              class="absolute inset-0 z-10 animate-pulse bg-neutral-100 dark:bg-neutral-800"
            />

            <img
              :src="item.src"
              :alt="item.title"
              loading="lazy"
              class="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
              :class="loaded[item.title] ? 'opacity-100' : 'opacity-0'"
              @load="onLoad(item.title)"
              @error="onError(item.title)"
            />

            <div
              v-if="loaded[item.title]"
              class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span
              v-if="loaded[item.title]"
              class="pointer-events-none absolute bottom-4 left-4 text-xs uppercase tracking-[0.2em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              {{ item.title }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
