<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
    message: 'Memproses...'
})
</script>

<template>
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
        <span class="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-950/20 border-t-neutral-950" />
        <p class="text-sm font-medium text-neutral-700">{{ message }}</p>
    </div>
</template>