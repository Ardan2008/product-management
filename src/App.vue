<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import BackToTop from './components/ui/BackToTop.vue'
import { startLenis, stopLenis } from './composables/useLenis'
import { useTheme } from './composables/useTheme'

const route = useRoute()

// pasang class `dark` di <html> dari skema tersimpan, sebelum render pertama
useTheme()

onMounted(startLenis)
onBeforeUnmount(stopLenis)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-linear-to-b from-white via-neutral-50 to-white text-neutral-950 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-50">
    <Navbar v-if="!route.meta.hideLayout" />

    <!-- target fokus BackToTop setelah tombolnya hilang di atas; tanpa ini fokus jatuh ke <body> -->
    <main tabindex="-1" class="flex-1 focus:outline-none">
      <RouterView />
    </main>

    <Footer v-if="!route.meta.hideLayout" />

    <!-- halaman tanpa layout (login/register) tidak punya scroll, jadi tombol
         back-to-top ikut disembunyikan; halaman lain tetap menilai sendiri
         berdasarkan jarak scroll -->
    <BackToTop v-if="!route.meta.hideLayout" />
  </div>
</template>