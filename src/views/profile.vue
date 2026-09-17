<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, KeyRound, LogOut, Mail, ShieldCheck, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import LoadingScreen from '../components/common/LoadingScreen.vue'
import { useAuth } from '../stores/auth'

const router = useRouter()
const { user, fetchProfile, logout, changePassword } = useAuth()

const isLoggingOut = ref(false)
const isChangingPassword = ref(false)

const initial = computed(() => (user.value?.name?.trim().charAt(0) || 'U').toUpperCase())

onMounted(async () => {
    try {
        await fetchProfile()
    } catch {
        // token tidak valid / kedaluwarsa — abaikan, data lama di store tetap dipakai
    }
})

// ====== Modal ubah password ======
interface PasswordErrors {
    current_password?: string
    password?: string
}

const showPasswordModal = ref(false)
const showConfirmModal = ref(false)
const passwordForm = ref({
    current_password: '',
    password: '',
    password_confirmation: ''
})
const passwordErrors = ref<PasswordErrors>({})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const resetPasswordForm = () => {
    passwordForm.value = {
        current_password: '',
        password: '',
        password_confirmation: ''
    }
    passwordErrors.value = {}
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
}

const openPasswordModal = () => {
    resetPasswordForm()
    showPasswordModal.value = true
}

const closePasswordModal = () => {
    if (isChangingPassword.value) return
    showPasswordModal.value = false
    showConfirmModal.value = false
    resetPasswordForm()
}

const submitPassword = () => {
    passwordErrors.value = {}
    let hasError = false

    if (!passwordForm.value.current_password) {
        passwordErrors.value.current_password = 'Password saat ini wajib diisi.'
        hasError = true
    }

    if (!passwordForm.value.password) {
        passwordErrors.value.password = 'Password baru wajib diisi.'
        hasError = true
    } else if (passwordForm.value.password.length < 6) {
        passwordErrors.value.password = 'Password baru minimal 6 karakter.'
        hasError = true
    }

    if (!passwordForm.value.password_confirmation) {
        passwordErrors.value.password = 'Konfirmasi password baru wajib diisi.'
        hasError = true
    } else if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
        passwordErrors.value.password = 'Konfirmasi password baru tidak cocok.'
        hasError = true
    }

    if (hasError) return

    showConfirmModal.value = true
}

const cancelConfirm = () => {
    showConfirmModal.value = false
}

const confirmChangePassword = async () => {
    showConfirmModal.value = false
    isChangingPassword.value = true

    try {
        await changePassword({
            current_password: passwordForm.value.current_password,
            password: passwordForm.value.password,
            password_confirmation: passwordForm.value.password_confirmation
        })

        await Swal.fire({
            icon: 'success',
            iconColor: '#ffffff',
            title: 'Password berhasil diubah!',
            text: 'Gunakan password barumu saat login berikutnya.',
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

        showPasswordModal.value = false
        resetPasswordForm()
    } catch (err: any) {
        const data = err?.response?.data

        if (data?.errors) {
            passwordErrors.value = {
                current_password: data.errors.current_password?.[0],
                password: data.errors.password?.[0],
            }
        } else if (data?.message) {
            // backend hanya mengebalikan pesan tanpa "errors"
            // ketika password saat ini tidak cocok — tampilkan inline di field + popup
            passwordErrors.value.current_password = data.message

            Swal.fire({
                title: 'Gagal!',
                text: data.message,
                icon: 'error',
                iconColor: '#dc2626',
                color: '#171717',
                confirmButtonText: 'Oke',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                    title: 'text-xl! font-extrabold! text-neutral-950!',
                    htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
                    actions: 'gap-2.5!',
                    confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
                },
            })
        } else {
            Swal.fire({
                title: 'Gagal!',
                text: 'Terjadi kesalahan. Silakan coba lagi.',
                icon: 'error',
                iconColor: '#dc2626',
                color: '#171717',
                confirmButtonText: 'Oke',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                    title: 'text-xl! font-extrabold! text-neutral-950!',
                    htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
                    actions: 'gap-2.5!',
                    confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
                },
            })
        }
    } finally {
        isChangingPassword.value = false
    }
}

// ====== Logout ======
const handleLogout = async () => {
    const confirm = await Swal.fire({
        title: 'Yakin logout?',
        text: 'Kamu harus login lagi untuk mengakses products.',
        icon: 'question',
        iconColor: '#171717',
        color: '#171717',
        showCancelButton: true,
        confirmButtonText: 'Ya, logout',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
            title: 'text-xl! font-extrabold! text-neutral-950!',
            htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
            actions: 'gap-2.5!',
            confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            cancelButton: 'rounded-full! border! border-neutral-300! bg-white! px-5! py-2.5! text-sm! font-semibold! text-neutral-950! transition hover:bg-neutral-100!',
        },
    })

    if (!confirm.isConfirmed) return

    isLoggingOut.value = true
    await logout()

    await Swal.fire({
        icon: 'success',
        iconColor: '#ffffff',
        title: 'Logout berhasil!',
        timer: 1200,
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

    window.setTimeout(() => {
        router.push({ name: 'home' })
        isLoggingOut.value = false
    }, 400)
}
</script>

<template>
    <!-- Loading screen saat logout -->
    <LoadingScreen v-if="isLoggingOut" message="Logging out..." />

    <!-- Lazy loading saat ubah password -->
    <LoadingScreen v-if="isChangingPassword" message="Mengubah password..." />

    <div class="mx-auto max-w-2xl px-4 py-10">
        <router-link
            :to="{ name: 'home' }"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
            <ArrowLeft :size="16" />
            Back
        </router-link>

        <h1 class="mt-4 text-2xl font-bold tracking-tight text-neutral-950">Profile</h1>
        <p class="mt-1 text-sm text-neutral-500">Informasi akun yang sedang login.</p>

        <div class="mt-6 space-y-4">
            <div class="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    <div
                        class="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-3xl font-extrabold text-white"
                    >
                        {{ initial }}
                        <span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                            <span class="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500">
                                <span class="h-1.5 w-1.5 rounded-full bg-white" />
                            </span>
                        </span>
                    </div>

                    <div class="flex-1 text-center sm:text-left">
                        <p class="text-xl font-extrabold tracking-tight text-neutral-950">{{ user?.name }}</p>
                        <p class="mt-1 flex items-center justify-center gap-1.5 text-sm text-neutral-500 sm:justify-start">
                            <Mail :size="14" />
                            {{ user?.email }}
                        </p>

                        <div class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
                            <ShieldCheck :size="14" class="text-neutral-900" />
                            Terverifikasi dengan JWT
                        </div>
                    </div>
                </div>
            </div>

            <div class="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <p class="text-sm font-semibold text-neutral-900">Keamanan</p>
                <p class="mt-1 text-sm text-neutral-500">Perbarui password akun kamu secara berkala.</p>

                <button
                    type="button"
                    class="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    @click="openPasswordModal"
                >
                    <KeyRound :size="15" />
                    Ubah Password
                </button>
            </div>

            <div class="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <p class="text-sm font-semibold text-neutral-900">Akses</p>
                <p class="mt-1 text-sm text-neutral-500">
                    Kamu bisa mengelola seluruh data product melalui halaman
                    <router-link :to="{ name: 'products' }" class="font-semibold text-neutral-950 underline underline-offset-2 transition hover:text-neutral-700">
                        Products
                    </router-link>.
                </p>

                <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                        @click="handleLogout"
                    >
                        <LogOut :size="15" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal ubah password (bg transparan) -->
    <div
        v-if="showPasswordModal"
        class="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm"
        @click.self="closePasswordModal"
    >
        <div class="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-7 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h2 class="text-xl font-extrabold tracking-tight text-neutral-950">Ubah Password</h2>
                    <p class="mt-1 text-sm text-neutral-500">Pastikan password baru mudah diingat tapi sulit ditebak.</p>
                </div>
                <button
                    type="button"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
                    aria-label="Tutup"
                    @click="closePasswordModal"
                >
                    <X :size="16" />
                </button>
            </div>

            <form @submit.prevent="submitPassword" class="mt-6 space-y-4">
                <div>
                    <label for="current_password" class="mb-1.5 block text-sm font-medium text-neutral-800">Password Saat Ini</label>
                    <div class="relative">
                        <input
                            id="current_password"
                            v-model="passwordForm.current_password"
                            :type="showCurrentPassword ? 'text' : 'password'"
                            autocomplete="current-password"
                            placeholder="•••••••••••"
                            :class="[
                                'w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400',
                                passwordErrors.current_password
                                    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-neutral-200 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5',
                            ]"
                        />
                        <button
                            type="button"
                            :aria-label="showCurrentPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950"
                            @click="showCurrentPassword = !showCurrentPassword"
                        >
                            <EyeOff v-if="showCurrentPassword" :size="17" />
                            <Eye v-else :size="17" />
                        </button>
                    </div>
                    <p v-if="passwordErrors.current_password" class="mt-1.5 text-xs text-neutral-500">{{ passwordErrors.current_password }}</p>
                </div>

                <div>
                    <label for="new_password" class="mb-1.5 block text-sm font-medium text-neutral-800">Password Baru</label>
                    <div class="relative">
                        <input
                            id="new_password"
                            v-model="passwordForm.password"
                            :type="showNewPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="•••••••••••"
                            class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-3.5 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                        />
                        <button
                            type="button"
                            :aria-label="showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950"
                            @click="showNewPassword = !showNewPassword"
                        >
                            <EyeOff v-if="showNewPassword" :size="17" />
                            <Eye v-else :size="17" />
                        </button>
                    </div>
                </div>

                <div>
                    <label for="password_confirmation" class="mb-1.5 block text-sm font-medium text-neutral-800">Konfirmasi Password Baru</label>
                    <div class="relative">
                        <input
                            id="password_confirmation"
                            v-model="passwordForm.password_confirmation"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="•••••••••••"
                            class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-3.5 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5"
                        />
                        <button
                            type="button"
                            :aria-label="showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950"
                            @click="showConfirmPassword = !showConfirmPassword"
                        >
                            <EyeOff v-if="showConfirmPassword" :size="17" />
                            <Eye v-else :size="17" />
                        </button>
                    </div>
                </div>

                <p v-if="passwordErrors.password" class="text-xs text-neutral-500">{{ passwordErrors.password }}</p>

                <div class="flex items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        class="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
                        @click="closePasswordModal"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal konfirmasi (bg transparan) -->
    <div
        v-if="showConfirmModal"
        class="fixed inset-0 z-95 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm"
        @click.self="cancelConfirm"
    >
        <div class="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-7 text-center shadow-2xl">
            <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white">
                <KeyRound :size="20" />
            </span>
            <h3 class="mt-4 text-lg font-extrabold tracking-tight text-neutral-950">Apakah Anda yakin dengan data yang Anda masukkan?</h3>
            <p class="mt-1.5 text-sm text-neutral-500">Password kamu akan diganti setelah konfirmasi.</p>

            <div class="mt-6 flex items-center justify-center gap-2.5">
                <button
                    type="button"
                    class="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
                    @click="cancelConfirm"
                >
                    Batal
                </button>
                <button
                    type="button"
                    class="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    @click="confirmChangePassword"
                >
                    Ya
                </button>
            </div>
        </div>
    </div>
</template>