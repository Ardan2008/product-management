<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ImagePlus, RefreshCw, Trash2, X } from 'lucide-vue-next'

const props = withDefaults(
    defineProps<{
        modelValue: File | null
        /** URL gambar yang sudah tersimpan (dipakai di form edit). */
        existingUrl?: string | null
        label?: string
        error?: string
        maxSizeMb?: number
        disabled?: boolean
    }>(),
    {
        existingUrl: null,
        label: 'Image',
        error: '',
        maxSizeMb: 2,
        disabled: false
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: File | null): void
    (e: 'remove'): void
}>()

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = computed(() => props.maxSizeMb * 1024 * 1024)

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localError = ref('')
const previewUrl = ref<string | null>(null)

const previewSource = computed(() => previewUrl.value ?? props.existingUrl ?? null)
const hasImage = computed(() => Boolean(previewSource.value))
const fileName = computed(() => props.modelValue?.name ?? '')
const hasError = computed(() => Boolean(localError.value || props.error))

const formatSize = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(2)} MB`

const openPicker = () => {
    if (props.disabled) return
    inputRef.value?.click()
}

// lepas object URL lama supaya tidak bocor di memory
watch(
    () => props.modelValue,
    (file) => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
            previewUrl.value = null
        }

        if (file) {
            previewUrl.value = URL.createObjectURL(file)
        }
    }
)

onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const validateAndSet = (file: File) => {
    localError.value = ''

    if (!ACCEPTED.includes(file.type)) {
        localError.value = 'The image must be a JPG, PNG, or WEBP file.'
        return
    }

    if (file.size > MAX_SIZE.value) {
        localError.value = `The image must be ${props.maxSizeMb} MB or smaller.`
        return
    }

    emit('update:modelValue', file)
}

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
        validateAndSet(file)
    }

    // reset input supaya memilih file yang sama lagi tetap memicu change
    input.value = ''
}

const onDrop = (event: DragEvent) => {
    isDragging.value = false
    if (props.disabled) return

    const file = event.dataTransfer?.files?.[0]
    if (file) {
        validateAndSet(file)
    }
}

const clearImage = () => {
    localError.value = ''

    if (props.existingUrl) {
        emit('remove')
    }

    emit('update:modelValue', null)
}
</script>

<template>
    <div>
        <div class="mb-2 flex items-baseline justify-between gap-2">
            <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">{{ label }}</span>
            <span class="text-xs text-neutral-400 dark:text-neutral-500">Max. {{ maxSizeMb }} MB</span>
        </div>

        <div
            class="relative aspect-4/3 w-full overflow-hidden rounded-2xl transition"
            :class="[
                hasImage ? 'bg-neutral-100 dark:bg-neutral-800' : '',
                isDragging ? 'ring-4 ring-neutral-950/10 dark:ring-neutral-100/10' : '',
                hasError ? 'outline outline-1 outline-neutral-950 dark:outline-neutral-100' : ''
            ]"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
        >
            <template v-if="hasImage">
                <img
                    :src="previewSource ?? undefined"
                    :alt="fileName || 'Product image preview'"
                    class="h-full w-full object-cover"
                />

                <div class="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                        type="button"
                        :disabled="disabled"
                        class="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-neutral-950 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100/90 dark:text-neutral-950 dark:hover:bg-neutral-100"
                        @click="openPicker"
                    >
                        <RefreshCw :size="13" />
                        Replace
                    </button>
                    <button
                        type="button"
                        :disabled="disabled"
                        title="Remove image"
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950/85 text-white shadow-sm backdrop-blur transition hover:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100/85 dark:text-neutral-950 dark:hover:bg-neutral-100"
                        @click="clearImage"
                    >
                        <Trash2 :size="14" />
                    </button>
                </div>
            </template>

            <div
                v-if="isDragging"
                class="absolute inset-0 flex items-center justify-center bg-neutral-950/60 text-sm font-semibold text-white"
            >
                Drop to replace the image
            </div>

            <button
                v-if="!hasImage"
                type="button"
                :disabled="disabled"
                :aria-invalid="hasError || undefined"
                class="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 text-center transition disabled:cursor-not-allowed disabled:opacity-60"
                :class="
                    isDragging || hasError
                        ? 'border-neutral-950 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100/70 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/70'
                "
                @click="openPicker"
            >
                <span class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:ring-neutral-700">
                    <ImagePlus :size="18" />
                </span>
                <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Drag an image here or
                    <span class="font-semibold text-neutral-950 underline underline-offset-2 dark:text-neutral-50">choose a file</span>
                </span>
                <span class="text-xs text-neutral-400 dark:text-neutral-500">JPG, PNG, or WEBP</span>
            </button>
        </div>

        <p v-if="modelValue" class="mt-2.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {{ fileName }} · {{ formatSize(modelValue.size) }}
        </p>

        <input
            ref="inputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="onFileChange"
        />

        <p v-if="localError || error" role="alert" class="mt-2 flex items-start gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <X :size="13" class="mt-0.5 shrink-0" />
            <span>{{ localError || error }}</span>
        </p>
    </div>
</template>
