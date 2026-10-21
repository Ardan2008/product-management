<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-vue-next'

const props = withDefaults(
    defineProps<{
        id: string
        label: string
        modelValue: string
        type?: string
        placeholder?: string
        autocomplete?: string
        inputmode?: 'text' | 'email' | 'numeric' | 'tel' | 'search' | 'url' | 'decimal' | 'none'
        icon?: Component
        /** Pesan error validasi. Kalau terisi, input dirender dalam kondisi error. */
        error?: string
        /** Tampilkan tombol lihat/sembunyikan (untuk field password). */
        revealable?: boolean
        /** Tampilkan centang hijau ketika field terisi dan valid. */
        success?: boolean
        disabled?: boolean
        maxlength?: number
    }>(),
    {
        type: undefined,
        placeholder: '',
        autocomplete: 'off',
        icon: undefined,
        error: '',
        revealable: false,
        success: false,
        disabled: false,
        maxlength: undefined
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'blur', field: string): void
    (e: 'input', field: string): void
    (e: 'capsLock', active: boolean): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isRevealed = ref(false)

const hasError = computed(() => Boolean(props.error))
const showReveal = computed(() => props.revealable)
// field dengan tombol lihat/sembunyikan otomatis jadi type='password'
const baseType = computed(() => props.type ?? (showReveal.value ? 'password' : 'text'))
const inputType = computed(() => (showReveal.value && isRevealed.value ? 'text' : baseType.value))

const focus = () => inputRef.value?.focus()

defineExpose({ focus })

const onInput = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value)
    emit('input', props.id)
}

const onKeyEvent = (event: KeyboardEvent) => {
    emit('capsLock', Boolean(event.getModifierState?.('CapsLock')))
}

const toggleReveal = () => {
    isRevealed.value = !isRevealed.value
    focus()
}
</script>

<template>
    <div>
        <div class="mb-1.5 flex items-baseline justify-between gap-2">
            <label :for="id" class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{{ label }}</label>
            <slot name="label-right" />
        </div>

        <div class="relative">
            <component
                :is="icon"
                v-if="icon"
                :size="17"
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
                :class="hasError ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 dark:text-neutral-500'"
            />

            <input
                :id="id"
                ref="inputRef"
                :type="inputType"
                :value="modelValue"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :inputmode="inputmode"
                :maxlength="maxlength"
                :disabled="disabled"
                :aria-invalid="hasError || undefined"
                :aria-describedby="hasError ? `${id}-feedback` : undefined"
                class="w-full rounded-xl border bg-white py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
                :class="[
                    icon ? 'pl-11' : 'pl-3.5',
                    showReveal || $slots.suffix ? 'pr-11' : 'pr-3.5',
                    hasError
                        ? 'border-neutral-950 bg-neutral-50 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10'
                        : success
                            ? 'border-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5 dark:border-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10'
                            : 'border-neutral-200 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5 dark:border-neutral-800 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10',
                ]"
                @input="onInput"
                @blur="emit('blur', id)"
                @keydown="onKeyEvent"
                @keyup="onKeyEvent"
            />

            <span
                v-if="success && !hasError && !showReveal"
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-950 dark:text-neutral-50"
            >
                <Check :size="17" />
            </span>

            <slot v-if="$slots.suffix" name="suffix" />

            <button
                v-if="showReveal"
                type="button"
                :aria-label="isRevealed ? 'Hide password' : 'Show password'"
                :aria-pressed="isRevealed"
                :disabled="disabled"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300 dark:text-neutral-500 dark:hover:text-neutral-50 dark:disabled:text-neutral-700"
                @mousedown.prevent
                @click="toggleReveal"
            >
                <EyeOff v-if="isRevealed" :size="17" />
                <Eye v-else :size="17" />
            </button>
        </div>

        <p
            v-if="hasError"
            :id="`${id}-feedback`"
            role="alert"
            class="field-feedback mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-neutral-950 dark:text-neutral-50"
        >
            <AlertCircle :size="13" class="mt-0.5 shrink-0" />
            <span>{{ error }}</span>
        </p>
        <slot v-else name="feedback" />
    </div>
</template>
