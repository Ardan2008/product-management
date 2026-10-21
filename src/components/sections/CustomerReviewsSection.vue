<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import BlurReveal from '../ui/BlurReveal.vue'
import Marquee from '../ui/Marquee.vue'

interface Review {
  rating: number
  quote: string
  name: string
  order: string
}

const reviews: Review[] = [
  {
    rating: 5,
    quote:
      'The coffee is smooth, rich, and perfectly balanced. Definitely one of my new favorites.',
    name: 'Alya Putri',
    order: 'Iced Latte'
  },
  {
    rating: 5,
    quote:
      'Love the atmosphere and the coffee. Everything feels simple, warm, and thoughtfully made.',
    name: 'Raka Pratama',
    order: 'Americano'
  },
  {
    rating: 4,
    quote:
      'The flavor is amazing, especially the caramel latte. I’ll definitely come back again.',
    name: 'Nadia Rahma',
    order: 'Caramel Latte'
  },
  {
    rating: 5,
    quote:
      'Great coffee, beautiful presentation, and really friendly service. Orvella gets it right.',
    name: 'Dimas Arya',
    order: 'Cappuccino'
  }
]

// digandakan supaya satu grup marquee pasti lebih lebar dari layar
const rowOne = [...reviews, ...reviews]
const rowTwo = [...reviews].reverse().concat([...reviews].reverse())

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
</script>

<template>
  <section id="reviews" class="relative scroll-mt-28 overflow-hidden border-t border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-neutral-50">
    <div class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-24 md:pt-32">
      <div class="mb-12 max-w-xl md:mb-16">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
          What they say
        </span>
        <h2
          class="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          <BlurReveal>Customer</BlurReveal>{{ ' ' }}
          <BlurReveal :delay="0.1"><span class="italic">Reviews</span></BlurReveal>
        </h2>
      </div>
    </div>

    <div class="relative pb-20 sm:pb-24 md:pb-32">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white dark:from-neutral-950 to-transparent sm:w-40"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white dark:from-neutral-950 to-transparent sm:w-40"
      />

      <Marquee class="py-2" direction="left" :duration="60">
        <article
          v-for="(review, i) in rowOne"
          :key="`a-${i}`"
          class="flex w-72 shrink-0 flex-col justify-between rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 transition-colors duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:w-80"
        >
          <div>
            <div class="mb-3 flex items-center gap-0.5" :aria-label="`${review.rating} out of 5 stars`">
              <Star
                v-for="star in 5"
                :key="star"
                :size="15"
                :stroke-width="1.75"
                :class="star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-200 dark:fill-neutral-700 text-neutral-200 dark:text-neutral-700'"
              />
            </div>
            <blockquote class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              “{{ review.quote }}”
            </blockquote>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 dark:bg-neutral-50 text-xs font-semibold text-white dark:text-neutral-950"
            >
              {{ initials(review.name) }}
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-neutral-950 dark:text-neutral-50">{{ review.name }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ review.order }}</p>
            </div>
          </div>
        </article>
      </Marquee>

      <Marquee class="py-2" direction="right" :duration="60">
        <article
          v-for="(review, i) in rowTwo"
          :key="`b-${i}`"
          class="flex w-72 shrink-0 flex-col justify-between rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 transition-colors duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:w-80"
        >
          <div>
            <div class="mb-3 flex items-center gap-0.5" :aria-label="`${review.rating} out of 5 stars`">
              <Star
                v-for="star in 5"
                :key="star"
                :size="15"
                :stroke-width="1.75"
                :class="star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-200 dark:fill-neutral-700 text-neutral-200 dark:text-neutral-700'"
              />
            </div>
            <blockquote class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              “{{ review.quote }}”
            </blockquote>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 dark:bg-neutral-50 text-xs font-semibold text-white dark:text-neutral-950"
            >
              {{ initials(review.name) }}
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-neutral-950 dark:text-neutral-50">{{ review.name }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ review.order }}</p>
            </div>
          </div>
        </article>
      </Marquee>
    </div>
  </section>
</template>
