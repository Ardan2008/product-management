<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, ShieldCheck, User, UserPlus, Zap } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import { useAuth } from '../../stores/auth'

interface AuthErrors {
    name?: string[]
    email?: string[]
    password?: string[]
}

const route = useRoute()
const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errors = ref<AuthErrors>({})
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const isLoading = ref(true)

const redirectPath = computed(() => (route.query.redirect as string) || '/')

onMounted(() => {
    window.setTimeout(() => {
        isLoading.value = false
    }, 800)
})

const handleSubmit = async () => {
    errors.value = {}
    errorMessage.value = ''
    let hasError = false

    if (!name.value.trim()) {
        errors.value.name = ['The name field is required.']
        hasError = true
    }

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
    } else if (password.value.length < 6) {
        errors.value.password = ['The password must be at least 6 characters.']
        hasError = true
    }

    if (!passwordConfirmation.value) {
        errors.value.password = ['The password confirmation field is required.']
        hasError = true
    } else if (password.value !== passwordConfirmation.value) {
        errors.value.password = ['The password confirmation does not match.']
        hasError = true
    }

    if (hasError) return

    isSubmitting.value = true
    try {
        await register({
            name: name.value.trim(),
            email: email.value.trim(),
            password: password.value,
            password_confirmation: passwordConfirmation.value
        })

        await Swal.fire({
            icon: 'success',
            iconColor: '#ffffff',
            title: 'Register berhasil!',
            text: 'Silakan login dengan akun barumu.',
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

        router.push({ name: 'login', query: { redirect: redirectPath.value } })
    } catch (err: any) {
        const data = err?.response?.data
        if (data?.errors) {
            errors.value = data.errors
        } else if (data?.message) {
            errorMessage.value = data.message
        } else {
            errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
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
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,theme(colors.neutral.900/10),transparent_55%)]" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,theme(colors.neutral.900/10),transparent_55%)]" />
            <div
                class="absolute inset-0 opacity-[0.4]"
                style="background-image: radial-gradient(theme(colors.neutral.900/12) 1px, transparent 1px); background-size: 22px 22px;"
            />
        </div>

        <!-- Skeleton loading -->
        <div
            v-if="isLoading"
            class="relative grid w-full max-w-4xl animate-pulse overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 md:grid-cols-2"
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
                <div class="mt-8 space-y-4">
                    <div class="space-y-1.5">
                        <div class="h-4 w-16 rounded-full bg-neutral-200" />
                        <div class="h-11 rounded-xl bg-neutral-100" />
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-1.5">
                            <div class="h-4 w-16 rounded-full bg-neutral-200" />
                            <div class="h-11 rounded-xl bg-neutral-100" />
                        </div>
                        <div class="space-y-1.5">
                            <div class="h-4 w-16 rounded-full bg-neutral-200" />
                            <div class="h-11 rounded-xl bg-neutral-100" />
                        </div>
                    </div>
                    <div class="h-11 rounded-full bg-neutral-200" />
                </div>
                <div class="mt-7 h-4 w-2/3 rounded-full bg-neutral-200" />
            </div>
        </div>

        <!-- Form register -->
        <div v-else class="relative grid w-full max-w-4xl overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 md:grid-cols-2">
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
                        Bergabung<br />gratis sekarang<span class="text-neutral-500">.</span>
                    </p>

                    <ul class="mt-8 space-y-3">
                        <li class="flex items-center gap-3 text-sm text-neutral-400">
                            <UserPlus :size="16" class="shrink-0 text-white" />
                            Daftar akun hanya dalam 1 menit
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400">
                            <ShieldCheck :size="16" class="shrink-0 text-white" />
                            Data terlindungi dengan JWT authentication
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400">
                            <Zap :size="16" class="shrink-0 text-white" />
                            Langsung bisa kelola produk kamu
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

                <h1 class="text-2xl font-extrabold tracking-tight text-neutral-950 md:text-3xl">Buat akun baru</h1>
                <p class="mt-1.5 text-sm text-neutral-500">Gratis, cepat, dan aman. Mulai sekarang.</p>

                <form @submit.prevent="handleSubmit" class="mt-8 space-y-4">
                    <div v-if="errorMessage" class="rounded-xl border border-neutral-950/10 bg-neutral-950/[0.04] px-4 py-3 text-sm text-neutral-700">
                        {{ errorMessage }}
                    </div>

                    <div>
                        <label for="name" class="mb-1.5 block text-sm font-semibold text-neutral-900">Nama</label>
                        <div class="relative">
                            <User :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                id="name"
                                v-model="name"
                                type="text"
                                autocomplete="name"
                                placeholder="Nama lengkap"
                                class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-11 pr-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                            />
                        </div>
                        <p v-if="errors.name" class="mt-1.5 text-xs text-neutral-500">{{ errors.name[0] }}</p>
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

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label for="password" class="mb-1.5 block text-sm font-semibold text-neutral-900">Password</label>
                            <div class="relative">
                                <KeyRound :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    id="password"
                                    v-model="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    autocomplete="new-password"
                                    placeholder="Minimal 6 karakter"
                                    class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-11 pr-10 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                                />
                                <button
                                    type="button"
                                    :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                                    class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950"
                                    @click="showPassword = !showPassword"
                                >
                                    <EyeOff v-if="showPassword" :size="16" />
                                    <Eye v-else :size="16" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label for="password_confirmation" class="mb-1.5 block text-sm font-semibold text-neutral-900">Konfirmasi</label>
                            <div class="relative">
                                <KeyRound :size="17" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    id="password_confirmation"
                                    v-model="passwordConfirmation"
                                    :type="showPasswordConfirmation ? 'text' : 'password'"
                                    autocomplete="new-password"
                                    placeholder="Ulangi password"
                                    class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-11 pr-10 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                                />
                                <button
                                    type="button"
                                    :aria-label="showPasswordConfirmation ? 'Sembunyikan password' : 'Tampilkan password'"
                                    class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950"
                                    @click="showPasswordConfirmation = !showPasswordConfirmation"
                                >
                                    <EyeOff v-if="showPasswordConfirmation" :size="16" />
                                    <Eye v-else :size="16" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <p v-if="errors.password" class="text-xs text-neutral-500">{{ errors.password[0] }}</p>

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                        <template v-if="isSubmitting">
                            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Memproses...
                        </template>
                        <template v-else>
                            Daftar
                            <ArrowRight :size="16" class="transition-transform group-hover:translate-x-0.5" />
                        </template>
                    </button>
                </form>

                <p class="mt-7 text-center text-sm text-neutral-500">
                    Sudah punya akun?
                    <router-link :to="{ name: 'login' }" class="font-semibold text-neutral-950 underline-offset-4 transition hover:underline">
                        Masuk di sini
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>