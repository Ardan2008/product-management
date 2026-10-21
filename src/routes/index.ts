import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Swal from 'sweetalert2'
import { getLenis } from '../composables/useLenis'
import { useTheme } from '../composables/useTheme'
import { useAuth } from '../stores/auth'
import { swalTheme } from '../utils/swal'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home.vue')
  },
  {
    path: '/products',
    name: 'products',
    meta: { requiresAuth: true },
    component: () => import('../views/products.vue')
  },
  {
    path: '/products/create',
    name: 'products.create',
    meta: { requiresAuth: true },
    component: () => import('../components/products/create.vue')
  },
  {
    path: '/products/edit/:id',
    name: 'products.edit',
    meta: { requiresAuth: true },
    component: () => import('../components/products/edit.vue')
  },
  {
    path: '/kategori',
    name: 'kategori',
    meta: { requiresAuth: true },
    component: () => import('../views/kategori.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    meta: { requiresAuth: true },
    component: () => import('../views/profile.vue')
  },
  {
    path: '/login',
    name: 'login',
    meta: { hideLayout: true },
    component: () => import('../views/auth/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    meta: { hideLayout: true },
    component: () => import('../views/auth/register.vue')
  }
]

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    setTimeout(() => {
      const lenis = getLenis()
      const reduced = prefersReducedMotion()

      if (to.hash && !savedPosition) {
        if (lenis) {
          lenis.scrollTo(to.hash, { offset: -112, immediate: reduced })
        } else {
          document
            .querySelector(to.hash)
            ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
        }
        return
      }

      const top = savedPosition ? savedPosition.top : 0
      if (lenis) lenis.scrollTo(top, { immediate: true })
      else window.scrollTo({ top })
    }, 100)

    return false
  }
})

router.beforeEach((to) => {
  // baca dari store auth, bukan localStorage langsung, supaya status login di
  // guard selalu sama dengan yang dilihat komponen
  const { isAuthenticated } = useAuth()

  if ((to.name === 'login' || to.name === 'register') && isAuthenticated.value) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    const { isDark } = useTheme()

    Swal.fire({
      ...swalTheme(isDark.value),
      icon: 'info',
      title: 'Login required',
      text: 'Please log in first to access this page.',
      confirmButtonText: 'Sign in'
    })

    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router