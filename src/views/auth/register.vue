<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertTriangle, ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck, User, UserPlus } from 'lucide-vue-next'
import LoadingScreen from '../../components/common/LoadingScreen.vue'
import FormField from '../../components/common/FormField.vue'
import PasswordStrength from '../../components/common/PasswordStrength.vue'
import { useFormValidation } from '../../composables/useFormValidation'
import * as v from '../../utils/validators'
import { useAuth } from '../../stores/auth'
import { useTheme } from '../../composables/useTheme'
import { swalSuccess } from '../../utils/swal'

type FormFieldInstance = InstanceType<typeof FormField>

const route = useRoute()
const router = useRouter()
const { register } = useAuth()
const { isDark } = useTheme()

const isSubmitting = ref(false)
const errorMessage = ref('')
const isLoading = ref(true)
const isShaking = ref(false)
const isCapsLockOn = ref(false)
const isLeaving = ref(false)

const schema = {
    name: v.name(),
    email: [v.required('Email'), v.email(), v.maxLength(255, 'Email')],
    password: [v.required('Password'), v.password()],
    password_confirmation: [
        v.required('Password confirmation'),
        v.sameAs('password', 'Password confirmation', 'Password')
    ]
}

const {
    values,
    errors,
    touched,
    isValid,
    firstInvalidField,
    validateAll,
    touch,
    revalidateTouched,
    setServerErrors,
    clearErrors
} = useFormValidation(
    {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    },
    schema
)

const nameField = ref<FormFieldInstance | null>(null)
const emailField = ref<FormFieldInstance | null>(null)
const passwordField = ref<FormFieldInstance | null>(null)
const confirmField = ref<FormFieldInstance | null>(null)
const fieldRefs: Record<string, Ref<FormFieldInstance | null>> = {
    name: nameField,
    email: emailField,
    password: passwordField,
    password_confirmation: confirmField
}

const redirectPath = computed(() => (route.query.redirect as string) || '/')

// meter kekuatan hanya muncul setelah ada karakter yang diketik
const hasPasswordInput = computed(() => values.password.length > 0)

// tanda centang hijau hanya muncul ketika field sudah terisi dan valid
const isFieldValid = (field: string) =>
    Boolean(touched.value[field]) &&
    !errors.value[field] &&
    !v.isEmpty((values as Record<string, unknown>)[field])

// konfirmasi password divalidasi ulang otomatis setiap kali password berubah
const syncConfirmation = () => {
    revalidateTouched('password')
    if (!touched.value.password_confirmation) return
    if (!values.password_confirmation) return
    revalidateTouched('password_confirmation')
}

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

    // validasi client dulu, supaya tidak kelihatan seperti error jaringan
    if (!validateAll()) {
        triggerShake()
        await focusField(firstInvalidField.value)
        return
    }

    clearErrors()
    isSubmitting.value = true

    try {
        await register({
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
            password_confirmation: values.password_confirmation
        })

        await swalSuccess(isDark.value, {
            title: 'Registration successful!',
            text: 'Please log in with your new account.',
            timer: 2000,
        })

        // bawa email ke halaman login supaya user hanya perlu mengisi password
        router.push({
            name: 'login',
            query: { redirect: redirectPath.value, email: values.email.trim() }
        })
    } catch (err: any) {
        const data = err?.response?.data

        if (data?.errors) {
            // Laravel mengirim error konfirmasi yang tidak cocok pada key "password"
            const serverErrors = { ...data.errors }
            if (serverErrors.password_confirmation === undefined) {
                const passwordError = serverErrors.password?.[0] ?? ''
                if (/confirmation|konfirmasi|same|matches/i.test(passwordError)) {
                    serverErrors.password_confirmation = serverErrors.password
                    delete serverErrors.password
                }
            }

            setServerErrors(serverErrors)
            triggerShake()
            await focusField(firstInvalidField.value)
        } else if (data?.message) {
            errorMessage.value = data.message
            triggerShake()
        } else {
            errorMessage.value = 'Something went wrong. Please try again.'
            triggerShake()
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
        <div aria-hidden="true" class="pointer-events-none absolute inset-0">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,23,23,0.1),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(250,250,250,0.06),transparent_55%)]"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(23,23,23,0.1),transparent_55%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(250,250,250,0.06),transparent_55%)]"></div>
            <div
                class="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
                :style="isDark ? 'background-image: radial-gradient(rgba(250,250,250,0.08) 1px, transparent 1px); background-size: 22px 22px;' : 'background-image: radial-gradient(rgba(23, 23, 23, 0.12) 1px, transparent 1px); background-size: 22px 22px;'"
            ></div>
        </div>

        <button
            type="button"
            :disabled="isLeaving"
            class="group absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-300 dark:hover:bg-neutral-100 dark:hover:text-neutral-950 disabled:opacity-60 sm:left-6 sm:top-6"
            @click="goHome"
        >
            <ArrowLeft :size="16" class="transition-transform group-hover:-translate-x-0.5" />
            Back
        </button>

        <LoadingScreen v-if="isLeaving" message="Loading..." />

        <div
            v-if="isLoading"
            class="relative grid w-full max-w-4xl animate-pulse overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40 md:grid-cols-2"
        >
            <div class="hidden flex-col justify-between bg-neutral-950 p-10 dark:bg-white dark:text-neutral-950 md:flex">
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
            <div class="mt-8 space-y-4">
                <div class="space-y-1.5">
                    <div class="h-4 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div class="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
                <div class="space-y-1.5">
                    <div class="h-4 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div class="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
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

        <div v-else class="relative grid w-full max-w-4xl overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40 md:grid-cols-2">
            <div class="relative hidden flex-col justify-between bg-neutral-950 p-10 text-white dark:bg-white dark:text-neutral-950 md:flex">
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
                        Join for free<br />today<span class="text-neutral-500 dark:text-neutral-500">.</span>
                    </p>

                    <ul class="mt-8 space-y-3">
                        <li class="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600">
                            <UserPlus :size="16" class="shrink-0 text-white dark:text-neutral-950" />
                            Create your account in under a minute
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600">
                            <ShieldCheck :size="16" class="shrink-0 text-white dark:text-neutral-950" />
                            Your data stays protected with JWT authentication
                        </li>
                        <li class="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-600">
                            <ShieldCheck :size="16" class="shrink-0 text-white dark:text-neutral-950" />
                            Get started with Orvella Coffee today
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

                <h1 class="text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 md:text-3xl">Create your Orvella Coffee account</h1>
                <p class="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">Join Orvella Coffee and enjoy a better coffee experience.</p>

                <form
                    novalidate
                    class="mt-7 space-y-3.5"
                    :class="{ shake: isShaking }"
                    @animationend="onShakeEnd"
                    @submit.prevent="handleSubmit"
                >
                    <div
                        v-if="errorMessage"
                        role="alert"
                        class="rounded-xl border border-neutral-200 bg-neutral-950/4 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                        {{ errorMessage }}
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="name"
                            ref="nameField"
                            v-model="values.name"
                            label="Name"
                            autocomplete="name"
                            placeholder="Full name"
                            :icon="User"
                            :error="errors.name"
                            :success="isFieldValid('name')"
                            :disabled="isSubmitting"
                            :maxlength="255"
                            @blur="touch('name')"
                            @input="revalidateTouched('name')"
                        />

                        <FormField
                            id="email"
                            ref="emailField"
                            v-model="values.email"
                            label="Email"
                            type="email"
                            inputmode="email"
                            autocomplete="email"
                            placeholder="name@email.com"
                            :icon="Mail"
                            :error="errors.email"
                            :success="isFieldValid('email')"
                            :disabled="isSubmitting"
                            :maxlength="255"
                            @blur="touch('email')"
                            @input="revalidateTouched('email')"
                        />
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <FormField
                            id="password"
                            ref="passwordField"
                            v-model="values.password"
                            label="Password"
                            type="password"
                            placeholder="At least 6 characters"
                            autocomplete="new-password"
                            :icon="KeyRound"
                            :error="errors.password"
                            :disabled="isSubmitting"
                            revealable
                            @blur="touch('password')"
                            @input="syncConfirmation"
                            @caps-lock="isCapsLockOn = $event"
                        />
                        <FormField
                            id="password_confirmation"
                            ref="confirmField"
                            v-model="values.password_confirmation"
                            label="Confirm"
                            type="password"
                            placeholder="Repeat the password"
                            autocomplete="new-password"
                            :icon="KeyRound"
                            :error="errors.password_confirmation"
                            :success="isFieldValid('password_confirmation')"
                            :disabled="isSubmitting"
                            revealable
                            @blur="touch('password_confirmation')"
                            @input="revalidateTouched('password_confirmation')"
                        >
                            <template #feedback>
                                <p
                                    v-if="isCapsLockOn"
                                    class="field-feedback mt-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                                >
                                    <AlertTriangle :size="13" class="shrink-0" />
                                    Caps Lock is on
                                </p>
                            </template>
                        </FormField>
                    </div>

                    <Transition
                        enter-active-class="transition duration-200 ease-out"
                        enter-from-class="opacity-0 -translate-y-1"
                    >
                        <div
                            v-if="hasPasswordInput"
                            class="rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <PasswordStrength v-model="values.password" />
                        </div>
                    </Transition>

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition disabled:opacity-60"
                        :class="isValid ? 'bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200' : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'"
                    >
                        <template v-if="isSubmitting">
                            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Processing...
                        </template>
                        <template v-else>
                            Sign up
                            <ArrowRight :size="16" class="transition-transform group-hover:translate-x-0.5" />
                        </template>
                    </button>
                </form>

                <p class="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Already have an account?
                    <router-link :to="{ name: 'login' }" class="font-semibold text-neutral-950 underline-offset-4 transition hover:underline dark:text-neutral-100 dark:hover:text-neutral-200">
                        Sign in here
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>
