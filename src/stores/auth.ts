import { ref, type Ref } from 'vue'
import Api from '../api'

export interface AuthUser {
    id: number
    name: string
    email: string
}

export interface RegisterPayload {
    name: string
    email: string
    password: string
    password_confirmation: string
}

export interface ChangePasswordPayload {
    current_password: string
    password: string
    password_confirmation: string
}

const TOKEN_KEY = 'crud_token'
const USER_KEY = 'crud_user'

const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))

const loadStoredUser = (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as AuthUser
    } catch {
        return null
    }
}

const user = ref<AuthUser | null>(loadStoredUser())
const isAuthenticated = ref(!!token.value)

const setToken = (t: string) => {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
    isAuthenticated.value = true
}

const persistUser = (u: AuthUser) => {
    user.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
}

const fetchProfile = async (): Promise<AuthUser> => {
    const { data } = await Api.get('/api/auth/profile')
    persistUser(data.data)
    return data.data
}

const login = async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await Api.post('/api/auth/login', { email, password })
    setToken(data.data.access_token)
    return fetchProfile()
}

const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    const { data } = await Api.post('/api/auth/register', payload)
    return data.data.user
}

const logout = async () => {
    try {
        await Api.post('/api/auth/logout')
    } catch {
        // tetap logout lokal walau server gagal merespons
    }
    token.value = null
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

const changePassword = async (payload: ChangePasswordPayload): Promise<unknown> => {
    const { data } = await Api.post('/api/auth/change-password', payload)
    return data
}

export interface UseAuth {
    token: Ref<string | null>
    user: Ref<AuthUser | null>
    isAuthenticated: Ref<boolean>
    login: (email: string, password: string) => Promise<AuthUser>
    register: (payload: RegisterPayload) => Promise<AuthUser>
    logout: () => Promise<void>
    changePassword: (payload: ChangePasswordPayload) => Promise<unknown>
    fetchProfile: () => Promise<AuthUser>
}

export function useAuth(): UseAuth {
    return {
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        changePassword,
        fetchProfile
    }
}