<script setup lang="ts">
withDefaults(
  defineProps<{
    repeat?: number
    duration?: number // detik per putaran
    reverse?: boolean
    rotation?: number // dalam derajat
  }>(),
  { repeat: 5, duration: 10, reverse: false, rotation: 0 }
)
</script>

<template>
  <div
    class="max-w-full overflow-hidden bg-neutral-100 py-1 text-lg text-black dark:bg-neutral-800 dark:text-neutral-50"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <div
      class="ribbon-track flex w-max whitespace-nowrap"
      :class="reverse ? 'ribbon-reverse' : 'ribbon-forward'"
      :style="{ '--ribbon-duration': `${duration}s` }"
    >
      <div v-for="group in 2" :key="group" class="flex shrink-0" :aria-hidden="group === 2">
        <span v-for="n in repeat" :key="n" class="mr-8 inline-block select-none">
          <slot />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ribbon-track {
  animation-duration: var(--ribbon-duration, 10s);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
.ribbon-forward {
  animation-name: ribbon-forward;
}
.ribbon-reverse {
  animation-name: ribbon-reverse;
}

@keyframes ribbon-forward {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
@keyframes ribbon-reverse {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ribbon-track {
    animation: none;
  }
}
</style>