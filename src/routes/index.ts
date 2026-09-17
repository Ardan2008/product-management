import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Swal from 'sweetalert2'

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

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('crud_token')

  // user yang sudah login tidak boleh membuka halaman login / register
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    return { name: 'home' }
  }

  // halaman yang butuh login — tampilkan popup & alihkan ke login
  if (to.meta.requiresAuth && !isAuthenticated) {
    Swal.fire({
      icon: 'info',
      iconColor: '#ffffff',
      title: 'Login diperlukan',
      text: 'Silakan login terlebih dahulu untuk mengakses halaman ini.',
      confirmButtonText: 'Masuk',
      background: '#0a0a0a',
      color: '#ffffff',
      customClass: {
        popup: 'rounded-2xl! border! border-neutral-700! shadow-2xl!',
        title: 'text-xl! font-extrabold!',
        htmlContainer: 'text-sm!',
        confirmButton: 'rounded-full! bg-white! px-5! py-2.5! text-sm! font-semibold! text-neutral-950! transition!',
      },
    })

    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router