<script setup lang="ts">
import { onMounted, ref } from 'vue'

withDefaults(
  defineProps<{
    delay?: number // dalam detik
    as?: string // tag HTML: span, p, div, dll.
    block?: boolean // true untuk teks panjang (paragraf)
  }>(),
  { delay: 0, as: 'span', block: false }
)

const shown = ref(false)

onMounted(() => {
  requestAnimationFrame(() => (shown.value = true))
})
</script>

<template>
  <component
    :is="as"
    class="transition-[filter,opacity,transform] duration-900 ease-out"
    :class="[
      block ? 'block' : 'inline-block',
      shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-md'
    ]"
    :style="{ transitionDelay: `${delay}s` }"
  >
    <slot />
  </component>
</template>