<script setup lang="ts">
withDefaults(
  defineProps<{
    direction?: 'left' | 'right'
    repeat?: number
    duration?: number // detik per satu putaran penuh
  }>(),
  { direction: 'left', repeat: 4, duration: 60 }
)
</script>

<template>
  <div
    class="marquee group flex overflow-hidden"
    :style="{ '--duration': `${duration}s`, '--gap': '1rem', gap: 'var(--gap)' }"
  >
    <div
      v-for="n in repeat"
      :key="n"
      class="marquee-group flex shrink-0 justify-around"
      :class="direction === 'left' ? 'marquee-left' : 'marquee-right'"
      :aria-hidden="n > 1"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.marquee-group {
  gap: var(--gap);
  animation-duration: var(--duration);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
.marquee-left {
  animation-name: marquee-left;
}
.marquee-right {
  animation-name: marquee-right;
}
.marquee:hover .marquee-group {
  animation-play-state: paused;
}

@keyframes marquee-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}
@keyframes marquee-right {
  from {
    transform: translateX(calc(-100% - var(--gap)));
  }
  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-group {
    animation: none;
  }
}
</style>