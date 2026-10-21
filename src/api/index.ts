import axios from 'axios';

const Api = axios.create({
    baseURL: 'http://localhost:8000'
})

Api.interceptors.request.use((config) => {
    const token = localStorage.getItem('crud_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

Api.interceptors.response.use(
    (response) => response,
    (error) => {
        // token kedaluwarsa: hapus kredensial, lalu lempar ke login
        if (error.response && error.response.status === 401) {
            const isAuthRoute = error.config?.url?.includes('/api/auth/login') ||
                                error.config?.url?.includes('/api/auth/register')

            // jangan hapus token saat login/register sendiri yang gagal (mis. password salah)
            if (!isAuthRoute) {
                localStorage.removeItem('crud_token')
                localStorage.removeItem('crud_user')

                // simpan tujuan asal supaya setelah login user kembali ke halaman tadi, bukan beranda
                if (!window.location.hash.includes('login') && !window.location.pathname.includes('login')) {
                    const from = window.location.pathname + window.location.search
                    window.location.assign(`/login?redirect=${encodeURIComponent(from)}`)
                }
            }
        }
        return Promise.reject(error)
    }
)

export default Api