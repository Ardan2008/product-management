<script setup lang="ts">
import { computed, ref } from 'vue'

type Align = 'start' | 'center' | 'end'

const props = withDefaults(
  defineProps<{
    align?: Align
    widthClass?: string
  }>(),
  { align: 'center', widthClass: 'w-80' }
)

const MARGIN = 16

const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const side = ref<'top' | 'bottom'>('top')
const hAlign = ref<Align>(props.align)

function reposition() {
  if (!root.value || !panel.value) return

  const t = root.value.getBoundingClientRect()
  const w = panel.value.offsetWidth
  const h = panel.value.offsetHeight
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight

  const spaceAbove = t.top
  const spaceBelow = vh - t.bottom
  side.value = spaceAbove < h && spaceBelow > spaceAbove ? 'bottom' : 'top'

  const cx = t.left + t.width / 2
  const fits: Record<Align, boolean> = {
    center: cx - w / 2 >= MARGIN && cx + w / 2 <= vw - MARGIN,
    start: t.left >= MARGIN && t.left + w <= vw - MARGIN,
    end: t.right - w >= MARGIN && t.right <= vw - MARGIN
  }

  const order: Align[] = [props.align, 'center', 'start', 'end']
  hAlign.value = order.find((a) => fits[a]) ?? (cx > vw / 2 ? 'end' : 'start')
}

const panelClass = computed(() => {
  const vertical = side.value === 'top' ? 'bottom-full pb-3' : 'top-full pt-3'
  const horizontal =
    hAlign.value === 'start'
      ? 'left-0'
      : hAlign.value === 'end'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2'
  return [vertical, horizontal, props.widthClass]
})

const cardClass = computed(() =>
  side.value === 'top' ? 'origin-bottom translate-y-1' : 'origin-top -translate-y-1'
)
</script>

<template>
  <div
    ref="root"
    class="group/hc relative inline-flex"
    @mouseenter="reposition"
    @focusin="reposition"
  >
    <slot name="trigger" />

    <div
      ref="panel"
      class="invisible absolute z-30 max-w-[calc(100vw-2rem)] transition-[visibility] duration-200 group-hover/hc:visible group-focus-within/hc:visible"
      :class="panelClass"
    >
      <div
        class="scale-95 rounded-2xl border border-neutral-950/10 bg-white p-5 text-neutral-950 opacity-0 shadow-2xl transition duration-200 ease-out group-hover/hc:translate-y-0 group-hover/hc:scale-100 group-hover/hc:opacity-100 group-focus-within/hc:translate-y-0 group-focus-within/hc:scale-100 group-focus-within/hc:opacity-100 motion-reduce:transition-none dark:border-neutral-100/10 dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-black/40"
        :class="cardClass"
      >
        <slot />
      </div>
    </div>
  </div>
</template>