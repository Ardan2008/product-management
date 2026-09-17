<script setup>
import { useRoute } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'

const route = useRoute()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-linear-to-b from-neutral-100 via-neutral-50 to-neutral-100 text-neutral-900">
    <Navbar v-if="!route.meta.hideLayout" />

    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>