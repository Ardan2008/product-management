<script setup lang="ts">
import InfiniteRibbon from '../ui/InfiniteRibbon.vue'
</script>

<template>
  <section
    class="relative flex h-70 w-full items-center justify-center overflow-hidden py-8"
    aria-label="Orvella Coffee"
  >
    <InfiniteRibbon
      :rotation="3"
      :duration="40"
      :repeat="6"
      class="absolute w-[120%] bg-neutral-950! dark:bg-white! border-y border-white/10 dark:border-neutral-950/10 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white! dark:text-neutral-950!"
    >
      ORVELLA COFFEE • PREMIUM QUALITY BEANS • FRESHLY BREWED DAILY • CRAFTED WITH PASSION •
    </InfiniteRibbon>

    <InfiniteRibbon
      reverse
      :rotation="-3"
      :duration="40"
      :repeat="6"
      class="absolute w-[120%] bg-white dark:bg-neutral-950 border-y border-neutral-950/10 dark:border-neutral-100/10 py-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-950 dark:text-neutral-50"
    >
      VISIT OUR CAFE • SENSE THE FLAVORS • FRESH INGREDIENTS • ARTISANAL EXPERIENCE •
    </InfiniteRibbon>
  </section>
</template>