<script setup lang="ts">
import BlurReveal from '../ui/BlurReveal.vue'
</script>

<template>
  <section id="contact" class="text-neutral-950 dark:text-neutral-50">
    <div class="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div class="border-b border-neutral-200 dark:border-neutral-800 pb-12">
        <span class="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
          <BlurReveal :delay="0.1">Get In Touch</BlurReveal>
        </span>
        <h2
          class="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
        >
          <BlurReveal :delay="0.1">
            Let&apos;s brew something <span class="italic">together.</span>
          </BlurReveal>
        </h2>
      </div>
    </div>
  </section>
</template>