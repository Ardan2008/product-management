<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Mail, ShieldCheck, Zap } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import LoadingScreen from '../../components/common/LoadingScreen.vue'
import { useAuth } from '../../stores/auth'

interface AuthErrors {
    email?: string[]
    password?: string[]
}

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const errors = ref<AuthErrors>({})
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const isAuthError = ref(false)
const isLoading = ref(true)
const isLeaving = ref(false)

const redirectPath = computed(() => (route.query.redirect as string) || '/')

onMounted(() => {
    window.setTimeout(() => {
        isLoading.value = false
    }, 800)
})

const goHome = () => {
    if (isLeaving.value) return
    isLeaving.value = true
    window.setTimeout(() => {
        router.push({ name: 'home' })
    }, 600)
}

const handleSubmit = async () => {
    errors.value = {}
    errorMessage.value = ''
    isAuthError.value = false
    let hasError = false

    if (!email.value) {
        errors.value.email = ['The email field is required.']
        hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.value.email = ['The email format is invalid.']
        hasError = true
    }

    if (!password.value) {
        errors.value.password = ['The password field is required.']
        hasError = true
    }

    if (hasError) return

    isSubmitting.value = true
    try {
        await login(email.value.trim(), password.value)

        await Swal.fire({
            icon: 'success',
            iconColor: '#ffffff',
            title: 'Login berhasil!',
            text: 'Selamat datang kembali.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: '#0a0a0a',
            color: '#ffffff',
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-700! shadow-2xl!',
                title: 'text-xl! font-extrabold!',
            },
        })

        router.push(redirectPath.value)
    } catch (err: any) {
        const data = err?.response?.data
        if (data?.errors) {
            errors.value = data.errors
        } else if (data?.message) {
            errorMessage.value = data.message
            isAuthError.value = err?.response?.status === 401
        } else {
            errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
            isAuthError.value = false
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        <!-- latar dekoratif -->
        <div aria-hidden="true" class="pointer-events-none absolute inset-0">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,23,23,0.1),transparent_55%)]" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(23,23,23,0.1),transparent_55%)]" />
            <div
                class="absolute inset-0 opacity-[0.4]"
                style="background-image: radial-gradient(rgba(23,23,23,0.12) 1px, transparent 1px); background-size: 22px 22px;"
            />
        </div>

        <!-- Tombol kembali ke halaman utama -->
        <button
            type="button"
            :disabled="isLeaving"
            class="group absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white disabled:opacity-60 sm:left-6 sm:top-6"
            @click="goHome"
        >
            <ArrowLeft :size="16" class="transition-transform group-hover:-translate-x-0.5" />
            Kembali
        </button>

        <!-- Overlay loading saat kembali -->
        <LoadingScreen v-if="isLeaving" message="Memuat kembali..." />

        <!-- Skeleton loading -->
        <div
            v-if="isLoading"
            class="relative grid w-full max-w-4xl animate-pulse overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 md:grid-cols-2"
        >
            <div class="hidden flex-col justify-between bg-neutral-950 p-10 md:flex">
                <div class="flex items-center gap-2">
                    <div class="h-9 w-9 rounded-xl bg-neutral-700" />
                    <div class="h-4 w-20 rounded-full bg-neutral-700" />
                </div>
                <div class="space-y-3">
                    <div class="h-5 w-3/4 rounded-full bg-neutral-700" />
                    <div class="h-5 w-1/2 rounded-full bg-neutral-700" />
                </div>
                <div class="space-y-2.5">
                    <div class="h-4 w-full rounded-full bg-neutral-700" />
                    <div class="h-4 w-2/3 rounded-full bg-neutral-700" />
                </div>
            </div>
            <div class="p-7 sm:p-10">
                <div class="mb-8 md:hidden">
                    <div class="flex items-center gap-2">
                        <div class="h-9 w-9 rounded-xl bg-neutral-200" />
                        <div class="h-4 w-20 rounded-full bg-neutral-200" />
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="h-6 w-1/2 rounded-full bg-neutral-200" />
                    <div class="h-4 w-2/3 rounded-full bg-neutral-200" />
                </div>
                <div class="mt-8 space-y-5">
                    <div class="space-y-1.5">
                        <div class="h-4 w-16 rounded-full bg-neutral-200" />
                        <div class="h-11 rounded-xl bg-neutral-100" />
                    </div>
                    <div class="space-y-1.5">
                        <div class="h-4 w-16 rounded-full bg-neutral-200" />
                        <div class="h-11 rounded-xl bg-neutral-100" />
                    </div>
                    <div class="h-11 rounded-full bg-neutral-200" />
                </div>
                <div class="mt-7 h-4 w-2/3 rounded-full bg-neutral-200" />
            </div>
        </div>

        <!-- Form login -->
        <div v-else class="relative grid w-full max-w-4xl overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 md:grid-cols-2">
            <!-- Panel kiri (hitam) -->
            <div class="relative hidden flex-col justify-between bg-neutral-950 p-10 text-white md:flex">
                <div
                    aria-hidden="true"
                    class="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10"
                />
                <div
                    aria-hidden="true"
                    class="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10"
                />

                <div class="relative">
                    <div class="flex items-center gap-2">
                        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-950">
                            <Zap :size="18" fill="currentColor" />
                        </div>
                        <span class="text-lg font-bold tracking-tight">CRUD<span class="text-neutral-500">.</span></span>
                    </div>

                    <p class="mt-14 text-3xl font-extrabold leading-tight tracking-tight">
                        Kelola produk<br />lebih mudah<span class="text-neutral-500">.</span>
                    </p>

                    <ul class="mt-8 space-y-3">
                        <li class="flex items-center gap-3 text-sm text-neutral-400">
                            <ShieldCheck :size="16" class="shrink-0 text-white" />
                            Login aman dengan JWT authentication
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400">
                            <Zap :size="16" class="shrink-0 text-white" />
                            Akses cepat ke seluruh fitur CRUD
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400">
                            <KeyRound :size="16" class="shrink-0 text-white" />
                            Data kamu dilindungi dari pihak lain
                        </li>
                    </ul>
                </div>

                <p class="relative text-xs text-neutral-500">© {{ new Date().getFullYear() }} CRUD Vue 3 + Laravel</p>
            </div>

            <!-- Panel kanan (form) -->
            <div class="p-7 sm:p-10">
                <div class="mb-8 md:hidden">
                    <div class="flex items-center gap-2">
                        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white">
                            <Zap :size="18" fill="currentColor" />
                        </div>
                        <span class="text-lg font-bold tracking-tight text-neutral-950">CRUD<span class="text-neutral-400">.</span></span>
                    </div>
                </div>

                <h1 class="text-2xl font-extrabold tracking-tight text-neutral-950 md:text-3xl">Selamat datang kembali</h1>
                <p class="mt-1.5 text-sm text-neutral-500">Masuk ke akun kamu untuk melanjutkan.</p>

                <form @submit.prevent="handleSubmit" class="mt-8 space-y-5">
                    <div
                        v-if="errorMessage"
                        class="rounded-xl border border-neutral-950/10 bg-neutral-950/4 px-4 py-3.5 text-sm text-neutral-700"
                    >
                        <div class="flex items-start gap-3">
                            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                                <KeyRound :size="14" />
                            </span>
                            <p class="pt-1 font-medium">{{ errorMessage }}</p>
                        </div>
                        <p v-if="isAuthError" class="mt-3 border-t border-neutral-950/5 pt-3 text-neutral-600">
                            Belum punya akun?
                            <router-link
                                :to="{ name: 'register' }"
                                class="font-semibold text-neutral-950 underline underline-offset-2 transition hover:text-neutral-700"
                            >
                                Daftar sekarang
                            </router-link>
                            agar bisa login.
                        </p>
                    </div>

                    <div>
                        <label for="email" class="mb-1.5 block text-sm font-semibold text-neutral-900">Email</label>
                        <div class="relative">
                            <Mail :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                id="email"
                                v-model="email"
                                type="email"
                                autocomplete="email"
                                placeholder="nama@email.com"
                                class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-11 pr-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                            />
                        </div>
                        <p v-if="errors.email" class="mt-1.5 text-xs text-neutral-500">{{ errors.email[0] }}</p>
                    </div>

                    <div>
                        <label for="password" class="mb-1.5 block text-sm font-semibold text-neutral-900">Password</label>
                        <div class="relative">
                            <KeyRound :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                id="password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                placeholder="••••••••"
                                class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-11 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                            />
                            <button
                                type="button"
                                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950"
                                @click="showPassword = !showPassword"
                            >
                                <EyeOff v-if="showPassword" :size="17" />
                                <Eye v-else :size="17" />
                            </button>
                        </div>
                        <p v-if="errors.password" class="mt-1.5 text-xs text-neutral-500">{{ errors.password[0] }}</p>
                    </div>

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="group flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                        <template v-if="isSubmitting">
                            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Memproses...
                        </template>
                        <template v-else>
                            Masuk
                            <ArrowRight :size="16" class="transition-transform group-hover:translate-x-0.5" />
                        </template>
                    </button>
                </form>

                <p class="mt-7 text-center text-sm text-neutral-500">
                    Belum punya akun?
                    <router-link :to="{ name: 'register' }" class="font-semibold text-neutral-950 underline-offset-4 transition hover:underline">
                        Daftar sekarang
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>