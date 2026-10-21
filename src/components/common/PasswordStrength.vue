<script setup lang="ts">
import { computed } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { analyzePassword } from '../../utils/passwordStrength'

const props = defineProps<{
    modelValue: string
}>()

const analysis = computed(() => analyzePassword(props.modelValue))
const hasValue = computed(() => props.modelValue.length > 0)
const allPassed = computed(() => analysis.value.checks.every((check) => check.passed))
</script>

<template>
    <div class="select-none">
        <div class="flex items-center gap-3">
            <div class="flex flex-1 gap-1.5">
                <span
                    v-for="bar in 4"
                    :key="bar"
                    class="h-1.5 flex-1 rounded-full transition-colors duration-300"
                    :class="hasValue && analysis.score >= bar ? analysis.barClass : 'bg-neutral-200 dark:bg-neutral-700'"
                />
            </div>
            <span
                aria-live="polite"
                class="w-20 shrink-0 text-right text-[11px] font-semibold transition-colors duration-300"
                :class="hasValue ? analysis.textClass : 'text-neutral-400 dark:text-neutral-500'"
            >
                {{ hasValue ? analysis.label : 'Not set yet' }}
            </span>
        </div>

        <ul class="mt-2.5 flex flex-wrap items-center gap-1.5">
            <li
                v-for="check in analysis.checks"
                :key="check.short"
                :title="check.required ? `${check.label} (required)` : check.label"
                :aria-label="`${check.label}: ${check.passed ? 'met' : 'not met'}`"
                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors duration-200"
                :class="
                    check.passed
                        ? 'border-neutral-950 bg-neutral-950 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950'
                        : 'border-neutral-200 bg-white text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500'
                "
            >
                <Check v-if="check.passed" :size="9" :stroke-width="3.5" />
                <X v-else :size="9" :stroke-width="3.5" />
                {{ check.short }}
            </li>

            <span
                v-if="allPassed"
                aria-live="polite"
                class="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-950 dark:text-neutral-50"
            >
                <Check :size="11" :stroke-width="3" />
                All requirements met
            </span>
        </ul>
    </div>
</template>
