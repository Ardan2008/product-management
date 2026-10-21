<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ChevronRight, Eye, EyeOff, KeyRound, LogOut, Mail, ShieldCheck, Package, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import LoadingScreen from '../components/common/LoadingScreen.vue'
import { useAuth } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { swalSuccess, swalTheme } from '../utils/swal'
import { withSkeletonDuration } from '../utils/skeleton'

const router = useRouter()
const { user, fetchProfile, logout, changePassword } = useAuth()
const { isDark } = useTheme()

const isLoggingOut = ref(false)
const isChangingPassword = ref(false)
// selama profil diambil dari server, kartu identitas dirender sebagai skeleton
const isLoading = ref(true)

const initial = computed(() => (user.value?.name?.trim().charAt(0) || 'U').toUpperCase())

onMounted(async () => {
    try {
        await withSkeletonDuration(fetchProfile)
    } catch {
        // token tidak valid / kedaluwarsa — abaikan, store tetap menyimpan data lama
    } finally {
        isLoading.value = false
    }
})

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
        passwordErrors.value.current_password = 'The current password is required.'
        hasError = true
    }

    if (!passwordForm.value.password) {
        passwordErrors.value.password = 'The new password is required.'
        hasError = true
    } else if (passwordForm.value.password.length < 6) {
        passwordErrors.value.password = 'The new password must be at least 6 characters.'
        hasError = true
    }

    if (!passwordForm.value.password_confirmation) {
        passwordErrors.value.password = 'Please confirm the new password.'
        hasError = true
    } else if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
        passwordErrors.value.password = 'The password confirmation does not match.'
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

        await swalSuccess(isDark.value, {
            title: 'Password updated!',
            text: 'Use your new password the next time you log in.',
            timer: 2000,
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
            // backend hanya mengirim message tanpa 'errors' ketika password saat ini salah,
            // jadi tampilkan langsung di field sekaligus lewat popup
            passwordErrors.value.current_password = data.message

            Swal.fire({
                ...swalTheme(isDark.value),
                title: 'Failed!',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'Okay',
                buttonsStyling: false,
            })
        } else {
            Swal.fire({
                ...swalTheme(isDark.value),
                title: 'Failed!',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonText: 'Okay',
                buttonsStyling: false,
            })
        }
    } finally {
        isChangingPassword.value = false
    }
}

const handleLogout = async () => {
    const confirm = await Swal.fire({
        ...swalTheme(isDark.value),
        title: 'Log out?',
        text: 'You will need to log in again to access the products.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
    })

    if (!confirm.isConfirmed) return

    isLoggingOut.value = true
    await logout()

    await swalSuccess(isDark.value, {
        title: 'Logged out!',
        text: 'You have been logged out.',
        timer: 1200,
    })

    window.setTimeout(() => {
        router.push({ name: 'home' })
        isLoggingOut.value = false
    }, 400)
}

// Helper UI (animasi + keyboard)
const modalTransition = {
    enterActiveClass: 'transition duration-300 ease-out [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-out',
    enterFromClass: 'opacity-0 [&>div]:translate-y-4 [&>div]:scale-95 [&>div]:opacity-0',
    leaveActiveClass: 'transition duration-200 ease-in [&>div]:transition-all [&>div]:duration-200 [&>div]:ease-in',
    leaveToClass: 'opacity-0 [&>div]:translate-y-2 [&>div]:scale-95 [&>div]:opacity-0',
}

const currentPasswordRef = ref<HTMLInputElement | null>(null)
const confirmYesRef = ref<HTMLButtonElement | null>(null)

/* Penanda fokus keyboard untuk grup tombol ← → ↑ ↓. Pakai atribut `data-kb-focus`,
   bukan `:focus-visible`: setelah `.focus()` dari handler keydown, beberapa browser
   tidak menganggap elemen itu focus-visible sehingga ring tidak pernah tampil.

   Warna outline lewat inline style, bukan kelas `dark:` — aturan `dark:` di
   style.css memakai :where() dengan spesifitas sama, jadi hanya urutan file yang
   menentukan. Inline style selalu menang, jadi warnanya pasti ikut tema. */
const clearKeyboardFocus = (group: HTMLElement | null) => {
    group?.querySelectorAll('[data-kb-focus]').forEach((node) => node.removeAttribute('data-kb-focus'))
}

const markKeyboardFocus = (button: HTMLButtonElement | null | undefined) => {
    if (!button) return
    clearKeyboardFocus(button.parentElement)
    button.setAttribute('data-kb-focus', 'true')
}

//   light -> Cancel (putih) hitam, Yes/Save (hitam) putih
//   dark  -> Cancel (abu tua) putih, Yes/Save (putih) hitam
const kbOutline = (variant: 'cancel' | 'primary') => ({
    outlineColor: isDark.value
        ? variant === 'cancel'
            ? '#ffffff'
            : '#000000'
        : variant === 'cancel'
            ? '#000000'
            : '#ffffff'
})

const focusCurrentPassword = () => currentPasswordRef.value?.focus()
const focusConfirmYes = () => confirmYesRef.value?.focus()

// ← → ↑ ↓ memindahkan fokus antar tombol di dalam grup yang sama
const navigateButtons = (event: KeyboardEvent) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
    if (!keys.includes(event.key)) return

    const group = event.currentTarget as HTMLElement
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('button'))
    if (!buttons.length) return

    event.preventDefault()

    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1

    // fokus belum di salah satu tombol (mis. baru masuk ke grup), lompat ke yang
    // pertama supaya penanda fokus langsung terlihat
    if (index === -1) {
        buttons[0]?.focus()
        markKeyboardFocus(buttons[0])
        return
    }

    const next = buttons[(index + step + buttons.length) % buttons.length]
    next?.focus()
    markKeyboardFocus(next)
}

// klik/tap menghapus penanda fokus keyboard
const clearFocusOnPointer = (event: PointerEvent) => {
    clearKeyboardFocus(event.currentTarget as HTMLElement)
}

const inputClass =
    'w-full rounded-xl border bg-neutral-50/60 py-3 pl-4 pr-11 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-white dark:bg-neutral-900/60 dark:text-neutral-100 dark:focus:bg-neutral-900'
const inputNormal =
    'border-neutral-200 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5 dark:border-neutral-800 dark:border-neutral-100 dark:focus:ring-white/10'
</script>

<template>
    <LoadingScreen v-if="isLoggingOut" message="Logging out..." />
    <LoadingScreen v-if="isChangingPassword" message="Updating password..." />

    <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <router-link
            :to="{ name: 'home' }"
            class="group inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-100 dark:hover:text-neutral-50"
        >
            <ArrowLeft :size="15" class="transition-transform group-hover:-translate-x-0.5" />
            Back
        </router-link>

        <div class="mt-8">
            <h1 class="text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">Profile</h1>
            <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Details of the account that is currently signed in.</p>
        </div>

        <div class="mt-8 space-y-5">
            <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div class="h-24 bg-linear-to-br from-neutral-100 via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 sm:h-28" />

                <div class="px-6 pb-7 sm:px-8">
                    <div v-if="isLoading" class="-mt-10 flex flex-col items-center gap-5 sm:-mt-12 sm:flex-row sm:items-end">
                        <div class="h-20 w-20 shrink-0 animate-pulse rounded-3xl border-4 border-white bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 sm:h-24 sm:w-24" />

                        <div class="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
                            <div class="mx-auto h-7 w-48 max-w-full animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800 sm:mx-0" />
                            <div class="mx-auto mt-3 h-4 w-64 max-w-full animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800 sm:mx-0" />
                        </div>

                        <div class="h-9 w-36 shrink-0 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800 sm:mb-1" />
                    </div>

                    <div v-else class="-mt-10 flex flex-col items-center gap-5 sm:-mt-12 sm:flex-row sm:items-end">
                        <div
                            class="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-neutral-950 text-3xl font-extrabold text-white shadow-lg dark:border-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 sm:h-24 sm:w-24 sm:text-4xl"
                        >
                            {{ initial }}
                            <span class="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow">
                                <span class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black">
                                    <span class="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                            </span>
                        </div>

                        <div class="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
                            <p class="truncate text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">{{ user?.name }}</p>
                            <p class="mt-1 flex items-center justify-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 sm:justify-start">
                                <Mail :size="14" class="shrink-0" />
                                <span class="truncate">{{ user?.email }}</span>
                            </p>
                        </div>

                        <div class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 sm:mb-1">
                            <ShieldCheck :size="14" class="text-neutral-900 dark:text-neutral-100" />
                            Verified with JWT
                        </div>
                    </div>
                </div>
            </div>

            <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <div class="px-6 pb-2 pt-6 sm:px-8">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Account</p>
                </div>

                <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div class="flex items-start gap-4">
                            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-100">
                                <KeyRound :size="18" />
                            </span>
                            <div>
                                <p class="text-sm font-semibold text-neutral-950 dark:text-neutral-100">Security</p>
                                <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Update your account password regularly.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                            @click="openPasswordModal"
                        >
                            <KeyRound :size="15" />
                            Change Password
                        </button>
                    </div>

                    <router-link
                        :to="{ name: 'products' }"
                        class="group flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:px-8"
                    >
                        <div class="flex items-start gap-4">
                            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-100">
                                <Package :size="18" />
                            </span>
                            <div>
                                <p class="text-sm font-semibold text-neutral-950 dark:text-neutral-100">Access</p>
                                <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                                    You can manage every product record from the Products page.
                                </p>
                            </div>
                        </div>
                        <ChevronRight
                            :size="18"
                            class="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-950 dark:text-neutral-500 dark:group-hover:text-neutral-50"
                        />
                    </router-link>

                    <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div class="flex items-start gap-4">
                            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-100">
                                <LogOut :size="18" />
                            </span>
                            <div>
                                <p class="text-sm font-semibold text-neutral-950 dark:text-neutral-100">Sign out</p>
                                <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">End your session on this device.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-100 dark:hover:bg-neutral-800"
                            @click="handleLogout"
                        >
                            <LogOut :size="15" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Transition v-bind="modalTransition" @after-enter="focusCurrentPassword">
        <div
            v-if="showPasswordModal"
            class="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-neutral-950/50 p-4 backdrop-blur-sm dark:bg-black/70"
            @click.self="closePasswordModal"
        >
            <div class="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-7 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 sm:p-8">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950">
                            <KeyRound :size="18" />
                        </span>
                        <div>
                            <h2 class="text-xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">Change Password</h2>
                            <p class="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                Make sure the new password is easy to remember but hard to guess.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                        aria-label="Close"
                        @click="closePasswordModal"
                    >
                        <X :size="16" />
                    </button>
                </div>

                <form @submit.prevent="submitPassword" class="mt-7 space-y-4">
                    <div>
                        <label for="current_password" class="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Current Password</label>
                        <div class="relative">
                            <input
                                id="current_password"
                                ref="currentPasswordRef"
                                v-model="passwordForm.current_password"
                                :type="showCurrentPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                placeholder="•••••••••••"
                                :class="[
                                    inputClass,
                                    passwordErrors.current_password
                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                        : inputNormal,
                                ]"
                            />
                            <button
                                type="button"
                                :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
                                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-50"
                                @click="showCurrentPassword = !showCurrentPassword"
                            >
                                <EyeOff v-if="showCurrentPassword" :size="17" />
                                <Eye v-else :size="17" />
                            </button>
                        </div>
                        <p v-if="passwordErrors.current_password" class="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">{{ passwordErrors.current_password }}</p>
                    </div>

                    <div>
                        <label for="new_password" class="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">New Password</label>
                        <div class="relative">
                            <input
                                id="new_password"
                                v-model="passwordForm.password"
                                :type="showNewPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="•••••••••••"
                                :class="[inputClass, inputNormal]"
                            />
                            <button
                                type="button"
                                :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
                                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-50"
                                @click="showNewPassword = !showNewPassword"
                            >
                                <EyeOff v-if="showNewPassword" :size="17" />
                                <Eye v-else :size="17" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label for="password_confirmation" class="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Confirm New Password</label>
                        <div class="relative">
                            <input
                                id="password_confirmation"
                                v-model="passwordForm.password_confirmation"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="•••••••••••"
                                :class="[inputClass, inputNormal]"
                            />
                            <button
                                type="button"
                                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 transition hover:text-neutral-950 dark:text-neutral-500 dark:hover:text-neutral-50"
                                @click="showConfirmPassword = !showConfirmPassword"
                            >
                                <EyeOff v-if="showConfirmPassword" :size="17" />
                                <Eye v-else :size="17" />
                            </button>
                        </div>
                    </div>

                    <p v-if="passwordErrors.password" class="text-xs text-neutral-500 dark:text-neutral-400">{{ passwordErrors.password }}</p>

                    <div class="flex items-center justify-end gap-2.5 pt-3" @keydown="navigateButtons" @pointerdown="clearFocusOnPointer">
                        <button
                            type="button"
                            :class="[
                                'rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 outline-none transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 kb-btn-cancel',
                            ]"
                            :style="kbOutline('cancel')"
                            @click="closePasswordModal"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            :class="[
                                'rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 kb-btn-primary',
                            ]"
                            :style="kbOutline('primary')"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Transition>

    <Transition v-bind="modalTransition" @after-enter="focusConfirmYes">
        <div
            v-if="showConfirmModal"
            class="fixed inset-0 z-95 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm dark:bg-black/70"
            @click.self="cancelConfirm"
        >
            <div class="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
                <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950">
                    <KeyRound :size="22" />
                </span>
                <h3 class="mt-5 text-lg font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
                    Are you sure about the details you entered?
                </h3>
                <p class="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">Your password will be replaced after confirmation.</p>

                <div class="mt-7 flex items-center justify-center gap-2.5" @keydown="navigateButtons" @pointerdown="clearFocusOnPointer">
                    <button
                        type="button"
                        :class="[
                            'rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 outline-none transition hover:bg-neutral-100 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 kb-btn-cancel',
                        ]"
                        :style="kbOutline('cancel')"
                        @click="cancelConfirm"
                    >
                        Cancel
                    </button>
                    <button
                        ref="confirmYesRef"
                        type="button"
                        :class="[
                            'rounded-full bg-neutral-950 px-7 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 kb-btn-primary',
                        ]"
                        :style="kbOutline('primary')"
                        @click="confirmChangePassword"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
