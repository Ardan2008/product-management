<script setup lang="ts">
import { MapPin, Mail, Phone } from 'lucide-vue-next'
import HoverCard from '../ui/HoverCard.vue'

const year = new Date().getFullYear()

const waMessage = encodeURIComponent(
  'Hello Orvella Coffee, I would like to ask a bit more. Thank you!'
)
const whatsappLink = `https://wa.me/6288217934130?text=${waMessage}`

const emailSubject = encodeURIComponent('Questions About Orvella Coffee')
const emailBody = encodeURIComponent(
  'Hello Orvella Coffee,\n\nI would like to ask a bit more about the available menu and services.\n\nThank you.'
)
const gmailComposeLink = `https://mail.google.com/mail/?view=cm&fs=1&to=hello@orvellacoffee.com&su=${emailSubject}&body=${emailBody}`

const exploreLinks = [
  { label: 'About', hash: '#about' },
  { label: 'Why Choose Us', hash: '#why' },
  { label: 'Best Seller', hash: '#menu' },
  { label: 'Gallery', hash: '#gallery' }
]

const openingHours = [
  { days: 'Mon – Fri', time: '08:00 – 22:00' },
  { days: 'Sat – Sun', time: '09:00 – 23:00' }
]

interface Post {
  src: string
  alt: string
  views?: string
}

interface Social {
  key: 'instagram' | 'tiktok'
  label: string
  href: string
  handle: string
  followClass: string
  avatarClass: string
  bio: string
  stats: { value: string; label: string }[]
  postsTitle: string
  postRatio: string
  overlayClass: string
  posts: Post[]
}

const socials: Social[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/orvellacoffee',
    handle: '@orvellacoffee',
    followClass: 'bg-[#0095f6] hover:bg-[#1877f2]',
    avatarClass: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-sm',
    bio: '☕ Crafting cozy moments & premium brews in Malang. Share your story with',
    stats: [
      { value: '142', label: 'posts' },
      { value: '12.4K', label: 'followers' },
      { value: '320', label: 'following' }
    ],
    postsTitle: 'Recent Posts',
    postRatio: 'aspect-square',
    overlayClass: 'bg-black/10',
    posts: [
      { src: '/gallery/product.webp', alt: 'Product' },
      { src: '/gallery/brewing.webp', alt: 'Brewing' },
      { src: '/gallery/interior.webp', alt: 'Interior' }
    ]
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    href: 'https://tiktok.com/@orvellacoffee',
    handle: '@orvellacoffee',
    followClass: 'bg-[#fe2c55] hover:bg-[#e02447]',
    avatarClass: 'bg-black p-0.5 shadow-[1px_1.5px_0_#00f2fe,-1px_-1.5px_0_#fe0979]',
    bio: '🎥 Behind the scenes, barista tips & satisfying coffee pours at Orvella Coffee. Follow for your daily dose of brew!',
    stats: [
      { value: '15', label: 'following' },
      { value: '45.2K', label: 'followers' },
      { value: '128.5K', label: 'likes' }
    ],
    postsTitle: 'Latest Videos',
    postRatio: 'aspect-[3/4]',
    overlayClass: 'bg-black/20',
    posts: [
      { src: '/gallery/barista.webp', alt: 'Barista Video', views: '84.2K' },
      { src: '/gallery/brewing.webp', alt: 'Brewing Video', views: '53.1K' },
      { src: '/gallery/product.webp', alt: 'Product Video', views: '121.7K' }
    ]
  }
]

// jika file gambar belum tersedia, sembunyikan <img> (kotak abu-abunya tetap tampil)
function hideBroken(e: Event) {
  ;(e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <footer class="relative text-neutral-950 dark:text-neutral-100">
    <div class="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
      <div class="border-t border-neutral-950/10 dark:border-neutral-100/10" />

      <div
        class="grid gap-10 py-14 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] xl:gap-x-12 2xl:gap-x-16"
      >

        <div class="sm:col-span-2 xl:col-span-1">
          <h3 class="font-display text-2xl italic">Orvella</h3>
          <p class="mt-4 max-w-55 text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            From bean to cup, every detail is crafted so a coffee break feels like coming home.
          </p>
          <p class="mt-4 text-[11px] text-neutral-500 dark:text-neutral-400">
            © {{ year }} Orvella Coffee. All rights reserved.
          </p>
        </div>

        <div>
          <h3 class="whitespace-nowrap text-[11px] uppercase tracking-[0.3em]">Explore</h3>
          <ul class="mt-5 space-y-3 text-[13px] text-neutral-700 dark:text-neutral-300">
            <li v-for="link in exploreLinks" :key="link.hash">
              <router-link
                :to="{ name: 'home', hash: link.hash }"
                class="whitespace-nowrap transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="whitespace-nowrap text-[11px] uppercase tracking-[0.3em]">Contact</h3>
          <ul class="mt-5 space-y-4 text-[13px] text-neutral-700 dark:text-neutral-300">
            <li class="flex items-center gap-3">
              <MapPin :size="16" :stroke-width="1.5" class="shrink-0 text-neutral-500 dark:text-neutral-400" />
              <span>Jl. Gajah Mada No. 108, Malang, Indonesia</span>
            </li>
            <li class="flex items-center gap-3">
              <Phone :size="16" :stroke-width="1.5" class="shrink-0 text-neutral-500 dark:text-neutral-400" />
              <a
                :href="whatsappLink"
                target="_blank"
                rel="noopener noreferrer"
                class="whitespace-nowrap transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                +62 882-1793-4130
              </a>
            </li>
            <li class="flex items-center gap-3">
              <Mail :size="16" :stroke-width="1.5" class="shrink-0 text-neutral-500 dark:text-neutral-400" />
              <a
                :href="gmailComposeLink"
                target="_blank"
                rel="noopener noreferrer"
                class="whitespace-nowrap transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                hello@orvellacoffee.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="whitespace-nowrap text-[11px] uppercase tracking-[0.3em]">Opening Hours</h3>
          <ul class="mt-5 space-y-3 text-[13px] text-neutral-700 dark:text-neutral-300">
            <li
              v-for="row in openingHours"
              :key="row.days"
              class="flex items-center justify-between gap-4 whitespace-nowrap"
            >
              <span class="text-neutral-500 dark:text-neutral-400">{{ row.days }}</span>
              <span>{{ row.time }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="whitespace-nowrap text-[11px] uppercase tracking-[0.3em]">Follow Us</h3>
          <div class="mt-5 flex flex-nowrap items-center gap-3">
            <HoverCard v-for="s in socials" :key="s.key" align="end" class="shrink-0">
              <template #trigger>
                <a
                  :href="s.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="s.label"
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-950/30 text-neutral-700 transition-colors duration-300 hover:bg-neutral-950 hover:text-white dark:border-neutral-700/60 dark:text-neutral-300 dark:hover:bg-neutral-100 dark:hover:text-neutral-950"
                >
                  <svg
                    v-if="s.key === 'instagram'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                    <path
                      d="M16.5 3c.4 1.9 1.7 3.3 3.5 3.6v2.6c-1.3 0-2.5-.4-3.5-1.1v6.4c0 3-2.4 5.5-5.5 5.5S5.5 17.5 5.5 14.5 8 9 11 9c.3 0 .6 0 .9.1v2.7c-.3-.1-.6-.1-.9-.1-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.6Z"
                    />
                  </svg>
                </a>
              </template>

              <div class="flex flex-col gap-4">

                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full"
                      :class="s.avatarClass"
                    >
                      <div
                        class="flex h-full w-full items-center justify-center rounded-full bg-white font-display text-lg font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-neutral-100"
                      >
                        Orvella
                      </div>
                    </div>
                    <div class="text-left">
                      <h4 class="flex items-center gap-1 text-sm font-bold leading-tight">
                        Orvella Coffee
                        <span
                          class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 text-[8px] font-extrabold text-white"
                        >✓</span>
                      </h4>
                      <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ s.handle }}</span>
                    </div>
                  </div>
                  <a
                    :href="s.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200"
                    :class="s.followClass"
                  >
                    Follow
                  </a>
                </div>

                <p class="text-left text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                  {{ s.bio }}
                  <span v-if="s.key === 'instagram'" class="text-sky-600">#OrvellaMoment</span>
                </p>

                <div class="flex flex-wrap gap-x-5 gap-y-1 border-y border-neutral-950/5 py-2 dark:border-neutral-100/5">
                  <div v-for="stat in s.stats" :key="stat.label" class="flex gap-1 text-xs">
                    <span class="font-bold">{{ stat.value }}</span>
                    <span class="text-neutral-500 dark:text-neutral-400">{{ stat.label }}</span>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span class="text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {{ s.postsTitle }}
                  </span>
                  <div class="grid grid-cols-3 gap-2">
                    <div
                      v-for="post in s.posts"
                      :key="post.alt"
                      class="group relative cursor-pointer overflow-hidden rounded-lg border border-neutral-950/5 bg-neutral-100 dark:border-neutral-100/5 dark:bg-neutral-800"
                      :class="s.postRatio"
                    >
                      <img
                        :src="post.src"
                        :alt="post.alt"
                        loading="lazy"
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        @error="hideBroken"
                      />
                      <div
                        class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                        :class="s.overlayClass"
                      />
                      <div
                        v-if="post.views"
                        class="absolute bottom-1 left-1.5 flex items-center gap-0.5 text-[9px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        <svg class="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>{{ post.views }}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </HoverCard>
          </div>
        </div>

      </div>
    </div>

        <div class="select-none overflow-hidden px-4 sm:px-6" aria-hidden="true">
      <svg
        viewBox="0 0 800 210"
        preserveAspectRatio="xMidYMax meet"
        class="mx-auto block w-full max-w-6xl"
      >
        <text
          x="400"
          y="190"
          text-anchor="middle"
          textLength="780"
          lengthAdjust="spacingAndGlyphs"
          class="fill-neutral-900 font-display dark:fill-neutral-800"
          style="font-size: 240px; font-weight: 800"
        >
          Orvella
        </text>
      </svg>
    </div>
  </footer>
</template>
