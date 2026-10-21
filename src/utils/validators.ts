export type ValidationRule = (
  value: any,
  values: Record<string, any>
) => string | null

export const isEmpty = (value: any): boolean => {
  if (Array.isArray(value)) return value.length === 0

  return String(value ?? '').trim().length === 0
}

export const required = (label: string): ValidationRule => (value) =>
  isEmpty(value) ? `${label} is required.` : null

export const minLength = (
  min: number,
  label: string
): ValidationRule => (value) => {
  if (isEmpty(value)) return null

  return String(value).length < min
    ? `${label} must be at least ${min} characters.`
    : null
}

export const maxLength = (
  max: number,
  label: string
): ValidationRule => (value) => {
  if (isEmpty(value)) return null

  return String(value).length > max
    ? `${label} must be at most ${max} characters.`
    : null
}

export const email = (): ValidationRule => (value) => {
  if (isEmpty(value)) return null

  const v = String(value).trim()

  if (/\s/.test(v)) {
    return 'Email cannot contain spaces.'
  }

  const [local, domain] = v.split('@')

  if (!local || !domain) {
    return 'Invalid email format. Example: name@email.com'
  }

  if (!domain.includes('.')) {
    return 'Email domain is incomplete. Example: name@email.com'
  }

  if (domain.endsWith('.')) {
    return 'Invalid email format. Example: name@email.com'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    return 'Invalid email format. Example: name@email.com'
  }

  return null
}

export const noSpaces = (label: string): ValidationRule => (value) => {
  if (isEmpty(value)) return null

  return /\s/.test(String(value))
    ? `${label} cannot contain spaces.`
    : null
}

export const sameAs = (
  field: string,
  label: string,
  otherLabel: string
): ValidationRule => (value, values) => {
  if (isEmpty(value)) return null

  return value === values[field]
    ? null
    : `${label} does not match ${otherLabel.toLowerCase()}.`
}

export const password = (): ValidationRule => (value) => {
  if (isEmpty(value)) return null

  const passwordValue = String(value)

  if (passwordValue.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  if (passwordValue.length > 72) {
    return 'Password must be at most 72 characters.'
  }

  return null
}

export const name = (): ValidationRule[] => [
  required('Name'),
  minLength(2, 'Name'),
  maxLength(255, 'Name'),
]

export interface ProductFieldValues {
  name: string
  description: string
  price: string
  stock: string
  id_kategori: string
}

// harga Rupiah: digit diawal, lalu titik ribuan opsional (80.000 / 1.234.567)
const PRICE_FORMAT = /^\d{1,3}(\.\d{3})*$/

// dipakai bersama oleh create.vue dan edit.vue supaya aturannya tidak bisa berbeda
export const validateProductFields = (
  values: ProductFieldValues
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {}

  // dicek setelah trim, kalau tidak isi spasi doang lolos sebagai "terisi"
  const nameValue = String(values.name ?? '').trim()
  const descriptionValue = String(values.description ?? '').trim()
  const priceValue = String(values.price ?? '').trim()
  const stockValue = String(values.stock ?? '').trim()

  if (!nameValue) {
    errors.name = ['The name field is required.']
  } else if (nameValue.length < 2) {
    errors.name = ['The name must be at least 2 characters.']
  } else if (nameValue.length > 255) {
    errors.name = ['The name must be at most 255 characters.']
  }

  if (!descriptionValue) {
    errors.description = ['The description field is required.']
  } else if (descriptionValue.length > 1000) {
    errors.description = ['The description must be at most 1000 characters.']
  }

  if (!priceValue) {
    errors.price = ['The price field is required.']
  } else if (!PRICE_FORMAT.test(priceValue)) {
    errors.price = ['The price format is invalid. Use Rupiah format, e.g. 80.000.']
  } else if (Number(priceValue.replace(/\./g, '')) <= 0) {
    errors.price = ['The price must be greater than 0.']
  }

  if (!stockValue) {
    errors.stock = ['The stock field is required.']
  } else if (!/^\d+$/.test(stockValue)) {
    // menolak desimal dan negatif sekaligus, keduanya tidak masuk akal untuk stok
    errors.stock = ['The stock must be a whole number of 0 or more, e.g. 10.']
  }

  if (!String(values.id_kategori ?? '').trim()) {
    errors.id_kategori = ['Please choose a category.']
  }

  return errors
}
