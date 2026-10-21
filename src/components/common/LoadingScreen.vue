<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
    message: 'Processing...'
})
</script>

<template>
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm dark:bg-neutral-950/90">
        <span class="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-950/20 border-t-neutral-950 dark:border-neutral-100/20 dark:border-t-neutral-100" />
        <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ message }}</p>
    </div>
</template>