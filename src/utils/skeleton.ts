// Durasi minimum skeleton di seluruh aplikasi ini. Tanpa itu, request ke localhost
// selesai dalam hitungan milidetik sehingga placeholder hanya berkedip sekali
// dan terbaca bukan sebagai loading.
export const SKELETON_DURATION = 220

// Menjalankan pekerjaan lalu menahan hasilnya minimal SKELETON_DURATION milidetik,
// supaya placeholder sempat terlihat walaupun request-nya sangat cepat.
export const withSkeletonDuration = async <T>(work: () => Promise<T>): Promise<T> => {
    const startedAt = Date.now()
    const result = await work()
    const remaining = SKELETON_DURATION - (Date.now() - startedAt)

    if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining))
    }

    return result
}