
export interface PasswordCheck {
  label: string
  short: string
  passed: boolean
  required: boolean
}

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordAnalysis {
  score: StrengthLevel
  label: string
  barClass: string
  textClass: string
  checks: PasswordCheck[]
}

const BARS = [
  'bg-neutral-200',
  'bg-neutral-400',
  'bg-neutral-500',
  'bg-neutral-700',
  'bg-neutral-950',
]

const LABELS = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong']

const TEXT_CLASSES = [
  'text-neutral-400',
  'text-neutral-500',
  'text-neutral-600',
  'text-neutral-700',
  'text-neutral-950',
]

export const analyzePassword = (value: string): PasswordAnalysis => {
  const password = String(value ?? '')
  const length = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9\s]/.test(password)
  const hasLetter = hasLower || hasUpper

  let score = 0

  if (length >= 6) score++
  if (length >= 10) score++
  if (hasLetter && hasNumber) score++
  if (hasLetter && hasSymbol) score++
  if (hasLower && hasUpper && hasNumber && hasSymbol) score++

  if (score > 4) score = 4
  if (length === 0) score = 0

  return {
    score: score as StrengthLevel,
    label: LABELS[score],
    barClass: BARS[score],
    textClass: TEXT_CLASSES[score],
    checks: [
      {
        label: 'At least 6 characters',
        short: '6+',
        passed: length >= 6,
        required: true,
      },
      {
        label: 'Uppercase letter (A-Z)',
        short: 'A-Z',
        passed: hasUpper,
        required: false,
      },
      {
        label: 'Lowercase letter (a-z)',
        short: 'a-z',
        passed: hasLower,
        required: false,
      },
      {
        label: 'Number (0-9)',
        short: '0-9',
        passed: hasNumber,
        required: false,
      },
      {
        label: 'Symbol (!@#$)',
        short: '!@#$',
        passed: hasSymbol,
        required: false,
      },
    ],
  }
}