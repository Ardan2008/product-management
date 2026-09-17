<template>
  <header class="sticky top-4 z-50 px-4">
      <nav
        class="mx-auto max-w-4xl rounded-[28px] border border-white/60 bg-white/60 shadow-lg shadow-neutral-900/5 backdrop-blur-xl transition-[height] duration-300 ease-out"
      >
        <div class="flex h-16 items-center justify-between px-6">

          <!-- Logo -->
          <router-link
            :to="{ name: 'home' }"
            class="text-lg font-bold tracking-tight text-neutral-950"
            @click="isOpen = false"
          >
            Product Management<span class="text-neutral-400">.</span>
          </router-link>

          <!-- Navigation desktop -->
          <div class="hidden items-center gap-2 md:flex">

            <router-link
              :to="{ name: 'home' }"
              class="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950"
              exact-active-class="bg-white text-neutral-950 shadow-sm"
            >
              Home
            </router-link>

            <router-link
              to="/products"
              class="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950"
              active-class="bg-white text-neutral-950 shadow-sm"
            >
              Products
            </router-link>

            <router-link
              :to="{ name: 'kategori' }"
              class="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950"
              active-class="bg-white text-neutral-950 shadow-sm"
            >
              Kategori
            </router-link>

            <!-- Belum login -->
            <template v-if="!isAuthenticated">
              <router-link
                :to="{ name: 'login' }"
                class="ml-1 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Login
              </router-link>
            </template>

            <!-- Sudah login -->
            <template v-else>
              <router-link
                :to="{ name: 'profile' }"
                class="ml-1 hidden rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950 md:inline-flex md:items-center md:gap-1.5"
                active-class="bg-white text-neutral-950 shadow-sm"
              >
                <User :size="15" class="shrink-0" />
                <span class="hidden max-w-32 truncate lg:inline">{{ user?.name }}</span>
              </router-link>
            </template>

          </div>

          <!-- Tombol hamburger mobile -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white/80 md:hidden"
            :aria-expanded="isOpen"
            aria-label="Buka menu navigasi"
            @click="isOpen = !isOpen"
          >
            <Menu v-if="!isOpen" :size="20" />
            <X v-else :size="20" />
          </button>

        </div>

        <!-- Navigation mobile (expand) -->
        <div
          class="grid overflow-hidden transition-all duration-300 ease-out md:hidden"
          :class="isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
        >
          <div class="min-h-0">
            <div class="flex flex-col gap-1 px-4 pb-4 pt-1">

              <router-link
                :to="{ name: 'home' }"
                class="rounded-2xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950"
                exact-active-class="bg-white text-neutral-950 shadow-sm"
                @click="isOpen = false"
              >
                Home
              </router-link>

              <router-link
                to="/products"
                class="rounded-2xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950"
                active-class="bg-white text-neutral-950 shadow-sm"
                @click="isOpen = false"
              >
                Products
              </router-link>

              <router-link
                :to="{ name: 'kategori' }"
                class="rounded-2xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950"
                active-class="bg-white text-neutral-950 shadow-sm"
                @click="isOpen = false"
              >
                Kategori
              </router-link>

              <!-- Belum login -->
              <template v-if="!isAuthenticated">
                <router-link
                  :to="{ name: 'login' }"
                  class="mt-1 rounded-2xl bg-neutral-950 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                  @click="isOpen = false"
                >
                  Login
                </router-link>
              </template>

              <!-- Sudah login -->
              <template v-else>
                <router-link
                  :to="{ name: 'profile' }"
                  class="mt-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:text-neutral-950"
                  active-class="bg-white text-neutral-950 shadow-sm"
                  @click="isOpen = false"
                >
                  <User :size="15" />
                  {{ user?.name }}
                </router-link>
              </template>

            </div>
          </div>
        </div>

      </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, User, X } from 'lucide-vue-next'
import { useAuth } from '../../stores/auth'

const isOpen = ref(false)
const route = useRoute()

const { isAuthenticated, user } = useAuth()

watch(() => route.path, () => {
  isOpen.value = false
})
</script>