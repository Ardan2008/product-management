<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Database, Plus, Pencil, Package, ArrowRight, Github } from 'lucide-vue-next'
import Api from '../../api'

interface Product {
  id: number
  name: string
  stock: number
}

const route = useRoute()
const previewProducts = ref<Product[]>([])
const isLoading = ref(true)

const fetchPreviewProducts = async () => {
  isLoading.value = true
  try {
    const response = await Api.get('/api/products')
    const data = response.data.data || response.data
    previewProducts.value = [...data].sort((a, b) => b.id - a.id).slice(0, 5)
  } catch (error) {
    console.error('Error fetching preview products:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPreviewProducts()
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 sm:px-6">

    <!-- Hero -->
    <section class="grid grid-cols-1 items-start gap-10 pt-10 pb-16 sm:pt-16 sm:pb-20 lg:grid-cols-2 lg:gap-8">

      <div>
        <span class="inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-600">
          Vite + Vue 3 + TypeScript
        </span>

        <h1 class="mt-6 text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
          Belajar CRUD data product dari nol sampai jalan.
        </h1>

        <p class="mt-5 max-w-lg text-base leading-relaxed text-neutral-600 sm:text-lg">
          Tutorial praktik membangun operasi create, read, update, dan delete pada data product menggunakan Vue 3 dan TypeScript, bareng SantriKoding.com.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <router-link
            to="/products"
            class="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Lihat data product
            <ArrowRight :size="16" />
          </router-link>

          <a
            href="https://santrikoding.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            <Github :size="16" />
            Ikuti tutorialnya
          </a>
        </div>
      </div>

      <!-- Preview card data product -->
      <div class="relative mt-1 sm:mt-2">
        <div class="absolute -inset-3 -z-10 rounded-3xl bg-white/60"></div>
        <div class="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <span class="text-sm font-semibold text-neutral-950">Data product</span>
            <router-link
              :to="{ path: '/products/create', query: { redirect: route.path } }"
              class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800"
            >
              <Plus :size="14" />
            </router-link>
          </div>

          <div v-if="isLoading" class="px-5 py-10 text-center text-sm text-neutral-400">
            Loading...
          </div>

          <ul v-else-if="previewProducts.length" class="divide-y divide-neutral-100">
            <li
              v-for="item in previewProducts"
              :key="item.id"
              class="flex items-center justify-between px-5 py-3.5"
            >
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                  <Database :size="14" />
                </span>
                <span class="max-w-32 truncate text-sm font-medium text-neutral-800 sm:max-w-44 lg:max-w-none">{{ item.name }}</span>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <span class="text-xs text-neutral-500">Stok {{ item.stock }}</span>
                <router-link
                  :to="{ path: `/products/edit/${item.id}`, query: { redirect: route.path } }"
                  class="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <Pencil :size="13" />
                </router-link>
              </div>
            </li>
          </ul>

          <div v-else class="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Package :size="18" />
            </span>
            <p class="text-sm font-medium text-neutral-700">Belum ada data product</p>
            <p class="text-xs text-neutral-400">Tambahkan product pertamamu untuk mulai.</p>
          </div>
        </div>
      </div>

    </section>

  </div>
</template>