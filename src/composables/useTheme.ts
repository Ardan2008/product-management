import { computed, ref } from 'vue'

const STORAGE_KEY = 'crud_theme'
const THEME_COLOR = {
    light: '#fafafa',
    dark: '#0a0a0a'
} as const

export type ThemeName = 'light' | 'dark'

function readStoredTheme(): ThemeName | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (stored === 'dark' || stored === 'light') {
            return stored
        }
    } catch {
        // localStorage tidak tersedia (mis. mode privat)
    }

    return null
}

function readSystemTheme(): ThemeName {
    const prefersDark = window.matchMedia?.(
        '(prefers-color-scheme: dark)'
    ).matches

    return prefersDark ? 'dark' : 'light'
}

const initialTheme = readStoredTheme() ?? readSystemTheme()

// instance bersama, dipakai seluruh komponen
const theme = ref<ThemeName>(initialTheme)

function applyTheme(name: ThemeName) {
    const root = document.documentElement
    const isDark = name === 'dark'

    root.classList.toggle('dark', isDark)
    root.style.colorScheme = name
    root.style.backgroundColor = THEME_COLOR[name]

    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', THEME_COLOR[name])
}

function persistTheme(name: ThemeName) {
    try {
        localStorage.setItem(STORAGE_KEY, name)
    } catch {
        // localStorage tidak tersedia, abaikan saja
    }
}

function setTheme(name: ThemeName) {
    theme.value = name
    applyTheme(name)
    persistTheme(name)
}

function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

// terapkan tema sebelum render pertama supaya tidak ada kedipan warna
applyTheme(initialTheme)

export function useTheme() {
    return {
        theme,
        isDark: computed(() => theme.value === 'dark'),
        toggleTheme,
        setTheme,
        getTheme: () => theme.value
    }
}
