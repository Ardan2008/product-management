import { computed, reactive, ref, type Ref } from 'vue'
import { isEmpty, type ValidationRule } from '../utils/validators'

export type ValidationSchema = Record<string, ValidationRule | ValidationRule[]>

export interface UseFormValidation<T extends Record<string, any>> {
    values: T
    errors: Ref<Record<string, string>>
    touched: Ref<Record<string, boolean>>
    isValid: Ref<boolean>
    validateField: (field: string) => string | null
    validateAll: () => boolean
    touch: (field: string) => string | null
    revalidateTouched: (field: string) => void
    setServerErrors: (payload: unknown, aliases?: Record<string, string>) => string[]
    clearErrors: () => void
    reset: () => void
    invalidFields: Ref<string[]>
    firstInvalidField: Ref<string | null>
}

const toRules = (rule?: ValidationRule | ValidationRule[]): ValidationRule[] => {
    if (!rule) return []
    return Array.isArray(rule) ? rule : [rule]
}

export function useFormValidation<T extends Record<string, any>>(
    initialValues: T,
    schema: ValidationSchema
): UseFormValidation<T> {
    const initial = { ...initialValues }
    const values = reactive({ ...initialValues }) as T

    const errors = ref<Record<string, string>>({})
    const touched = ref<Record<string, boolean>>({})
    const submitted = ref(false)

    const runRules = (field: string): string | null => {
        const rules = toRules(schema[field])
        for (const rule of rules) {
            const message = rule(values[field], values as Record<string, any>)
            if (message) return message
        }
        return null
    }

    const setFieldMessage = (field: string, message: string | null) => {
        const next = { ...errors.value }
        if (message) next[field] = message
        else delete next[field]
        errors.value = next
    }

    const validateField = (field: string): string | null => {
        const message = runRules(field)
        setFieldMessage(field, message)
        return message
    }

    const touch = (field: string): string | null => {
        touched.value = { ...touched.value, [field]: true }
        return validateField(field)
    }

    const revalidateTouched = (field: string) => {
        if (!touched.value[field] && !submitted.value) return
        validateField(field)
    }

    const validateAll = (): boolean => {
        submitted.value = true

        const allTouched: Record<string, boolean> = {}
        const nextErrors: Record<string, string> = {}

        Object.keys(schema).forEach((field) => {
            allTouched[field] = true
            const message = runRules(field)
            if (message) nextErrors[field] = message
        })

        touched.value = allTouched
        errors.value = nextErrors

        return Object.keys(nextErrors).length === 0
    }

    const setServerErrors = (payload: unknown, aliases: Record<string, string> = {}): string[] => {
        const raw = (payload ?? {}) as Record<string, unknown>
        const mapped: Record<string, string> = {}
        const keys: string[] = []

        Object.keys(raw).forEach((key) => {
            const target = aliases[key] ?? key
            const list = Array.isArray(raw[key]) ? (raw[key] as unknown[]) : [raw[key]]
            const message = list.filter(Boolean).map(String).join(' ')
            if (!message) return

            if (errors.value[target]) return

            mapped[target] = message
            keys.push(target)
            touched.value = { ...touched.value, [target]: true }
        })

        errors.value = { ...errors.value, ...mapped }
        return keys
    }

    const clearErrors = () => {
        errors.value = {}
    }

    const reset = () => {
        Object.keys(initial).forEach((key) => {
            ;(values as Record<string, any>)[key] = initial[key]
        })
        errors.value = {}
        touched.value = {}
        submitted.value = false
    }

    const invalidFields = computed(() =>
        Object.keys(errors.value).filter((field) => Boolean(errors.value[field]))
    )

    const firstInvalidField = computed(() => invalidFields.value[0] ?? null)

    const isValid = computed(() => {
        const fields = Object.keys(schema)
        if (!fields.length) return false
        return fields.every((field) => !errors.value[field] && !isEmpty(values[field]))
    })

    return {
        values,
        errors,
        touched,
        isValid,
        invalidFields,
        firstInvalidField,
        validateField,
        validateAll,
        touch,
        revalidateTouched,
        setServerErrors,
        clearErrors,
        reset
    }
}