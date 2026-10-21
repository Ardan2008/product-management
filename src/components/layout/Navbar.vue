<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight, Menu, Moon, Sun, User, X } from 'lucide-vue-next'
import { useAuth } from '../../stores/auth'
import { useTheme } from '../../composables/useTheme'

const isOpen = ref(false)
const route = useRoute()

const { isAuthenticated, user } = useAuth()
const { isDark, toggleTheme } = useTheme()

const links = [
  { label: 'Home', to: { name: 'home' }, exact: true },
  { label: 'Products', to: { name: 'products' }, exact: false },
  { label: 'Categories', to: { name: 'kategori' }, exact: false }
]

// -1 kalau tidak ada yang cocok, misalnya di halaman profile
const activeIndex = computed(() =>
  links.findIndex((l) =>
    l.exact ? route.name === l.to.name : route.matched.some((r) => r.name === l.to.name)
  )
)

const linkEls: (HTMLElement | null)[] = []

function setLinkEl(i: number, el: unknown) {
  const node = (el as { $el?: unknown } | null)?.$el ?? el
  linkEls[i] = node instanceof HTMLElement ? node : null
}

// mencegah pil aktif meluncur dari kiri saat halaman pertama dimuat
const ready = ref(false)
const active = reactive({ left: 0, width: 0 })
const hover = reactive({ index: -1, left: 0, width: 0, visible: false, animate: false })

function measureActive() {
  const el = linkEls[activeIndex.value]
  if (!el) return
  active.left = el.offsetLeft
  active.width = el.offsetWidth
}

function onEnter(i: number) {
  const el = linkEls[i]
  if (!el) return
  // muncul pertama kali: langsung ditempatkan, tanpa meluncur
  if (!hover.visible) hover.animate = false
  hover.index = i
  hover.left = el.offsetLeft
  hover.width = el.offsetWidth
  hover.visible = true
  if (!hover.animate) {
    requestAnimationFrame(() => requestAnimationFrame(() => (hover.animate = true)))
  }
}

function onLeave() {
  hover.visible = false
}

watch(activeIndex, () => nextTick(measureActive))

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
  }
)

onMounted(async () => {
  await nextTick()
  measureActive()
  requestAnimationFrame(() => (ready.value = true))
  document.fonts?.ready.then(measureActive) // ukur ulang setelah font selesai dimuat
  window.addEventListener('resize', measureActive)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureActive)
})
</script>

<template>
  <header class="relative z-40 w-full">
    <nav class="mx-auto max-w-[110rem] px-4 sm:px-8 lg:px-16">
      <div class="flex h-20 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">

        <router-link
          :to="{ name: 'home' }"
          class="justify-self-start font-display text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
          aria-label="Orvella — home"
        >
          Orvella
        </router-link>

        <div
          class="relative hidden items-center gap-1 md:flex"
          @mouseleave="onLeave"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-0 left-0 z-0 rounded-full bg-neutral-100 duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-neutral-800"
            :class="hover.animate ? 'transition-[transform,width,opacity]' : 'transition-opacity'"
            :style="{
              width: hover.width + 'px',
              transform: `translateX(${hover.left}px)`,
              opacity: hover.visible && hover.index !== activeIndex ? 1 : 0
            }"
          />

          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-0 left-0 z-0 rounded-full bg-neutral-950 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-neutral-100"
            :class="ready ? 'transition-[transform,width,opacity]' : ''"
            :style="{
              width: active.width + 'px',
              transform: `translateX(${active.left}px)`,
              opacity: activeIndex >= 0 ? 1 : 0
            }"
          />

          <router-link
            v-for="(link, i) in links"
            :key="link.label"
            :ref="(el) => setLinkEl(i, el)"
            :to="link.to"
            class="relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300"
            :class="activeIndex === i ? 'text-white dark:text-neutral-950' : 'text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50'"
            @mouseenter="onEnter(i)"
            @focus="onEnter(i)"
            @blur="onLeave"
          >
            {{ link.label }}
          </router-link>
        </div>

        <div class="hidden items-center gap-2 justify-self-end md:flex">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-950 bg-white text-neutral-950 transition-colors duration-300 hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="isDark"
            :title="isDark ? 'Light mode' : 'Dark mode'"
            @click="toggleTheme"
          >
            <Sun v-if="isDark" :size="18" class="theme-toggle-icon" />
            <Moon v-else :size="18" class="theme-toggle-icon" />
          </button>

          <router-link
            v-if="isAuthenticated"
            :to="{ name: 'profile' }"
            class="inline-flex items-center gap-2 rounded-full border border-neutral-950 bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors duration-300 hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
            active-class="!bg-neutral-950 !text-white dark:!bg-neutral-100 dark:!text-neutral-950"
          >
            <User :size="15" class="shrink-0" />
            <span class="max-w-28 truncate">{{ user?.name }}</span>
          </router-link>

          <router-link
            v-else
            :to="{ name: 'login' }"
            class="group inline-flex items-center gap-2 rounded-full border border-neutral-950 bg-neutral-950 px-5 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-white hover:text-neutral-950 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-950 dark:hover:text-white"
          >
            Login
            <ArrowRight :size="15" class="transition-transform duration-300 group-hover:translate-x-0.5" />
          </router-link>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-950 text-neutral-950 transition-colors duration-300 hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950 md:hidden"
          :aria-expanded="isOpen"
          aria-label="Open navigation menu"
          @click="isOpen = !isOpen"
        >
          <Menu v-if="!isOpen" :size="20" />
          <X v-else :size="20" />
        </button>

      </div>

      <div
        class="absolute inset-x-4 top-full origin-top rounded-3xl border border-neutral-950 bg-white p-2 transition-all duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900 sm:inset-x-8 md:hidden"
        :class="
          isOpen
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        "
      >
        <div class="flex flex-col gap-1">

          <router-link
            v-for="(link, i) in links"
            :key="link.label"
            :to="link.to"
            class="rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors duration-200"
            :class="
              activeIndex === i
                ? 'bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50'
            "
            @click="isOpen = false"
          >
            {{ link.label }}
          </router-link>

          <router-link
            v-if="isAuthenticated"
            :to="{ name: 'profile' }"
            class="flex items-center gap-2 rounded-2xl border border-neutral-950 px-4 py-2.5 text-sm font-medium text-neutral-950 transition-colors duration-200 hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
            active-class="!bg-neutral-950 !text-white dark:!bg-neutral-100 dark:!text-neutral-950"
            @click="isOpen = false"
          >
            <User :size="15" />
            {{ user?.name }}
          </router-link>

          <router-link
            v-else
            :to="{ name: 'login' }"
            class="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-950 bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-neutral-950 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-950 dark:hover:text-white"
            @click="isOpen = false"
          >
            Login
            <ArrowRight :size="15" />
          </router-link>

          <button
            type="button"
            class="mt-1 flex items-center justify-between gap-2 rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-950 transition-colors duration-200 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="isDark"
            @click="toggleTheme"
          >
            <span>{{ isDark ? 'Dark mode' : 'Light mode' }}</span>
            <Sun v-if="isDark" :size="16" class="theme-toggle-icon shrink-0" />
            <Moon v-else :size="16" class="theme-toggle-icon shrink-0" />
          </button>

        </div>
      </div>

    </nav>
  </header>
</template>
