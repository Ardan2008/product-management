<script setup lang="ts">
import { ChefHat, Clock, Coffee, Leaf, Star } from 'lucide-vue-next'
import BlurReveal from '../ui/BlurReveal.vue'

const reasons = [
  {
    icon: Coffee,
    title: 'Premium Beans',
    text: 'Carefully selected coffee beans with distinctive character and quality.'
  },
  {
    icon: ChefHat,
    title: 'Crafted With Care',
    text: 'Every cup is prepared with precision by skilled baristas.'
  },
  {
    icon: Leaf,
    title: 'Fresh Every Day',
    text: 'Fresh ingredients and carefully balanced flavors in every cup.'
  },
  {
    icon: Clock,
    title: 'Made For Your Moment',
    text: 'Coffee crafted to complement your everyday moments, from morning to late afternoon.'
  },
  {
    icon: Star,
    title: 'Simple, Refined Experience',
    text: 'Quality coffee, thoughtful service, and a space designed around simplicity.'
  }
]
</script>

<template>
  <section id="why" class="relative scroll-mt-28 text-neutral-950 dark:text-neutral-50">
    <div class="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div class="max-w-xl">
        <span class="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
          Why Orvella
        </span>
        <h2 class="mt-4 font-serif text-4xl font-normal leading-tight md:text-5xl">
          <BlurReveal>Why Choose</BlurReveal>{{ ' ' }}
          <BlurReveal :delay="0.1"><span class="italic">Us?</span></BlurReveal>
        </h2>
      </div>

      <div class="mt-16 grid grid-cols-2 border-l border-t border-neutral-950/10 dark:border-neutral-100/10 md:grid-cols-5">
        <div
          v-for="(reason, index) in reasons"
          :key="reason.title"
          class="group relative flex flex-col items-start gap-4 border-b border-r border-neutral-950/10 dark:border-neutral-100/10 px-6 py-10 transition-colors duration-300 hover:bg-neutral-950 dark:hover:bg-neutral-50 max-md:last:col-span-2"
        >
          <component
            :is="reason.icon"
            :size="32"
            :stroke-width="1.25"
            class="text-neutral-950 dark:text-neutral-50 transition-colors duration-300 group-hover:text-white dark:group-hover:text-neutral-950"
          />

          <h3
            class="font-serif text-base font-normal leading-snug transition-colors duration-300 group-hover:text-white dark:group-hover:text-neutral-950"
          >
            <BlurReveal :delay="index * 0.1">{{ reason.title }}</BlurReveal>
          </h3>

          <p
            class="font-serif text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 transition-colors duration-300 group-hover:text-white/70 dark:group-hover:text-neutral-950/70"
          >
            <BlurReveal :delay="index * 0.1 + 0.05">{{ reason.text }}</BlurReveal>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
