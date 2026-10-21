<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from 'lucide-vue-next'
import LoadingScreen from '../../components/common/LoadingScreen.vue'
import FormField from '../../components/common/FormField.vue'
import { useFormValidation } from '../../composables/useFormValidation'
import * as v from '../../utils/validators'
import { useAuth } from '../../stores/auth'
import { useTheme } from '../../composables/useTheme'
import { swalSuccess } from '../../utils/swal'

type FormFieldInstance = InstanceType<typeof FormField>

const route = useRoute()
const router = useRouter()
const { login } = useAuth()
const { isDark } = useTheme()

const isSubmitting = ref(false)
const errorMessage = ref('')
const isAuthError = ref(false)
const isLoading = ref(true)
const isShaking = ref(false)
const isLeaving = ref(false)

const redirectPath = computed(() => (route.query.redirect as string) || '/')

// register.vue meneruskan email lewat query; kalau diabaikan, email hilang saja
const emailFromRegister = typeof route.query.email === 'string' ? route.query.email : ''

// pakai composable & validators yang sama dengan register.vue; password di sini
// hanya dicek tidak kosong, karena aturan panjang hanya relevan saat membuat akun
const {
    values,
    errors,
    touched,
    isValid,
    firstInvalidField,
    validateAll,
    touch,
    revalidateTouched,
    clearErrors,
    setServerErrors
} = useFormValidation(
    { email: emailFromRegister, password: '' },
    {
        email: [v.required('Email'), v.email()],
        password: [v.required('Password')],
    }
)

const emailField = ref<FormFieldInstance | null>(null)
const passwordField = ref<FormFieldInstance | null>(null)
const fieldRefs: Record<string, Ref<FormFieldInstance | null>> = {
    email: emailField,
    password: passwordField
}

// tanda centang hijau hanya muncul ketika field sudah terisi dan valid
const isFieldValid = (field: string) =>
    Boolean(touched.value[field]) &&
    !errors.value[field] &&
    !v.isEmpty((values as Record<string, unknown>)[field])

const triggerShake = () => {
    isShaking.value = false
    window.requestAnimationFrame(() => {
        isShaking.value = true
    })
}

// hentikan animasi getar hanya setelah animasi form selesai, bukan elemen anaknya
const onShakeEnd = (event: AnimationEvent) => {
    if (event.target === event.currentTarget) isShaking.value = false
}

const focusField = async (field: string | null) => {
    if (!field) return
    await nextTick()
    fieldRefs[field]?.value?.focus()
}

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
    errorMessage.value = ''
    isAuthError.value = false

    if (!validateAll()) {
        triggerShake()
        await focusField(firstInvalidField.value)
        return
    }

    clearErrors()
    isSubmitting.value = true
    try {
        await login(values.email.trim(), values.password)

        await swalSuccess(isDark.value, {
            title: 'Login successful!',
            text: 'Welcome back.',
            timer: 2000,
        })

        router.push(redirectPath.value)
    } catch (err: any) {
        const data = err?.response?.data
        if (data?.errors) {
            setServerErrors(data.errors)
            triggerShake()
            await focusField(firstInvalidField.value)
        } else if (data?.message) {
            errorMessage.value = data.message
            isAuthError.value = err?.response?.status === 401
            if (isAuthError.value) {
                errorMessage.value = "Incorrect email or password. Don't have an account yet? "
            }
            triggerShake()
        } else {
            errorMessage.value = 'Something went wrong. Please try again.'
            isAuthError.value = false
            triggerShake()
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        <div aria-hidden="true" class="pointer-events-none absolute inset-0">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,23,23,0.1),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(250,250,250,0.06),transparent_55%)]" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(23,23,23,0.1),transparent_55%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(250,250,250,0.06),transparent_55%)]" />
            <div
                class="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
                :style="isDark ? 'background-image: radial-gradient(rgba(250,250,250,0.08) 1px, transparent 1px); background-size: 22px 22px;' : 'background-image: radial-gradient(rgba(23,23,23,0.12) 1px, transparent 1px); background-size: 22px 22px;'"
            />
        </div>

        <button
            type="button"
            :disabled="isLeaving"
            class="group absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-100 dark:hover:text-neutral-950 sm:left-6 sm:top-6"
            @click="goHome"
        >
            <ArrowLeft :size="16" class="transition-transform group-hover:-translate-x-0.5" />
            Back
        </button>

        <LoadingScreen v-if="isLeaving" message="Loading..." />

        <div
            v-if="isLoading"
            class="relative grid w-full max-w-4xl animate-pulse overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 md:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40"
        >
            <div class="hidden flex-col justify-between bg-neutral-950 p-10 md:flex dark:bg-white">
                <div class="flex items-center gap-2">
                    <div class="h-9 w-9 rounded-xl bg-neutral-700 dark:bg-neutral-300" />
                    <div class="h-4 w-20 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                </div>
                <div class="space-y-3">
                    <div class="h-5 w-3/4 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                    <div class="h-5 w-1/2 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                </div>
                <div class="space-y-2.5">
                    <div class="h-4 w-full rounded-full bg-neutral-700 dark:bg-neutral-300" />
                    <div class="h-4 w-2/3 rounded-full bg-neutral-700 dark:bg-neutral-300" />
                </div>
            </div>
            <div class="p-7 sm:p-10">
                <div class="mb-8 md:hidden">
                    <div class="flex items-center gap-2">
                        <div class="h-9 w-9 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                        <div class="h-4 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="h-6 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div class="h-4 w-2/3 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div class="mt-8 space-y-5">
                    <div class="space-y-1.5">
                        <div class="h-4 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        <div class="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    </div>
                    <div class="space-y-1.5">
                        <div class="h-4 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        <div class="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    </div>
                    <div class="h-11 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div class="mt-7 h-4 w-2/3 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>

        <div v-else class="relative grid w-full max-w-4xl overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 md:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40">
            <div class="relative hidden flex-col justify-between bg-neutral-950 p-10 text-white md:flex dark:bg-white dark:text-neutral-950">
                <div
                    aria-hidden="true"
                    class="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10 dark:border-neutral-950/10"
                />
                <div
                    aria-hidden="true"
                    class="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10 dark:border-neutral-950/10"
                />

                <div class="relative">
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-bold tracking-tight">Orvella</span>
                    </div>

                    <p class="mt-14 text-3xl font-extrabold leading-tight tracking-tight">
                        Manage your products<br />with ease<span class="text-neutral-500 dark:text-neutral-500">.</span>
                    </p>

                    <ul class="mt-8 space-y-3">
                        <li class="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600">
                            <ShieldCheck :size="16" class="shrink-0 text-white dark:text-neutral-950" />
                            Secure login with JWT authentication
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600">
                            <ShieldCheck :size="16" class="shrink-0 text-white dark:text-neutral-950" />
                            Enjoy fast, seamless access to your account
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600">
                            <KeyRound :size="16" class="shrink-0 text-white dark:text-neutral-950" />
                            Your data stays protected from other people
                        </li>
                    </ul>
                </div>

                <p class="relative text-xs text-neutral-500 dark:text-neutral-500">© {{ new Date().getFullYear() }} Orvella Coffee</p>
            </div>

            <div class="p-7 sm:p-10">
                <div class="mb-8 md:hidden">
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50">Orvella</span>
                    </div>
                </div>

                <h1 class="text-2xl font-extrabold tracking-tight text-neutral-950 md:text-3xl dark:text-neutral-50">Welcome back to Orvella Coffee</h1>
                <p class="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Sign in to your Orvella Coffee account to continue.</p>

                <form
                    novalidate
                    class="mt-8 space-y-5"
                    :class="{ shake: isShaking }"
                    @animationend="onShakeEnd"
                    @submit.prevent="handleSubmit"
                >
                    <div
                        v-if="errorMessage"
                        class="rounded-xl border border-neutral-950/10 bg-neutral-950/4 px-4 py-3.5 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                    >
                        <div class="flex items-start gap-3">
                            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950">
                                <KeyRound :size="14" />
                            </span>
                            <p class="pt-1 font-medium">{{ errorMessage }}</p>
                        </div>
                        <p v-if="isAuthError" class="mt-3 border-t border-neutral-950/5 pt-3 text-neutral-600 dark:border-neutral-100/10 dark:text-neutral-400">
                            Don't have an account?
                            <router-link
                                :to="{ name: 'register' }"
                                class="font-semibold text-neutral-950 underline underline-offset-2 transition hover:text-neutral-700 dark:text-neutral-50 dark:hover:text-neutral-300"
                            >
                                Create an account
                            </router-link>
                            so you can log in.
                        </p>
                    </div>

                    <FormField
                        id="email"
                        ref="emailField"
                        v-model="values.email"
                        label="Email"
                        type="email"
                        inputmode="email"
                        autocomplete="email"
                        placeholder="nama@email.com"
                        :icon="Mail"
                        :error="errors.email"
                        :success="isFieldValid('email')"
                        :disabled="isSubmitting"
                        :maxlength="255"
                        @blur="touch('email')"
                        @input="revalidateTouched('email')"
                    />

                    <FormField
                        id="password"
                        ref="passwordField"
                        v-model="values.password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        :icon="KeyRound"
                        :error="errors.password"
                        :disabled="isSubmitting"
                        revealable
                        @blur="touch('password')"
                        @input="revalidateTouched('password')"
                    />

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="group flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition disabled:opacity-60"
                        :class="isValid ? 'bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200' : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'"
                    >
                        <template v-if="isSubmitting">
                            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-neutral-950/30 dark:border-t-neutral-950" />
                            Processing...
                        </template>
                        <template v-else>
                            Log in
                            <ArrowRight :size="16" class="transition-transform group-hover:translate-x-0.5" />
                        </template>
                    </button>
                </form>

                <p class="mt-7 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Don't have an account?
                    <router-link :to="{ name: 'register' }" class="font-semibold text-neutral-950 underline-offset-4 transition hover:underline dark:text-neutral-50">
                        Create an account
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>
