<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Api from '../api'
import HeroSection from '../components/sections/HeroSection.vue'
import InfiniteRibbonSection from '../components/sections/InfiniteRibbonSection.vue'
import ProductCollectionSection from '../components/sections/ProductCollectionSection.vue'
import AboutUsSection from '../components/sections/AboutUsSection.vue'
import WhyChooseUsSection from '../components/sections/WhyChooseUsSection.vue'
import FeaturedMenuSection from '../components/sections/FeaturedMenuSection.vue'
import GallerySection from '../components/sections/GallerySection.vue'
import CustomerReviewsSection from '../components/sections/CustomerReviewsSection.vue'
import CtaSection from '../components/sections/CtaSection.vue'
import type { LandingProduct } from '../types/landing'
import { withSkeletonDuration } from '../utils/skeleton'

const products = ref<LandingProduct[]>([])
const isLoading = ref(true)

const fetchLandingData = async () => {
  isLoading.value = true

  try {
    await withSkeletonDuration(async () => {
      const response = await Api.get('/api/products')
      products.value = response.data.data ?? response.data ?? []
    })
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLandingData)
</script>

<template>
  <div>
    <HeroSection v-reveal />
    <InfiniteRibbonSection v-reveal />
    <ProductCollectionSection v-reveal :products="products" :is-loading="isLoading" />
    <AboutUsSection v-reveal />
    <WhyChooseUsSection v-reveal />
    <FeaturedMenuSection v-reveal :products="products" :is-loading="isLoading" />
    <GallerySection v-reveal />
    <CustomerReviewsSection v-reveal />
    <CtaSection v-reveal />
  </div>
</template>
