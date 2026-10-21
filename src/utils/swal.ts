import Swal, { type SweetAlertResult } from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'

/** Tampilan dasar SweetAlert2.
    Popup mewarisi class `dark` dari <html> sehingga utility class di bawah
    otomatis mengikuti tema. Warna `background` / `color` tetap dikirim eksplisit
    karena SweetAlert2 menuliskannya sebagai inline style yang menang atas class. */

export type SwalTheme = Extract<SweetAlertOptions, object> & {
    background: string
    color: string
    iconColor: string
    customClass: Record<string, string>
}

export function swalTheme(isDark: boolean): SwalTheme {
    if (isDark) {
        return {
            background: '#171717',
            color: '#fafafa',
            iconColor: '#fafafa',
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-800! shadow-xl! shadow-black/50!',
                title: 'text-xl! font-extrabold! text-neutral-50!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-400!',
                actions: 'gap-2.5!',
                confirmButton:
                    'rounded-full! bg-neutral-50! px-5! py-2.5! text-sm! font-semibold! text-neutral-950! transition hover:bg-neutral-200!',
                cancelButton:
                    'rounded-full! border! border-neutral-700! bg-neutral-900! px-5! py-2.5! text-sm! font-semibold! text-neutral-100! transition hover:bg-neutral-800!'
            }
        }
    }

    return {
        background: '#ffffff',
        color: '#171717',
        iconColor: '#171717',
        customClass: {
            popup: 'rounded-2xl! border! border-neutral-200! shadow-xl! shadow-neutral-900/5!',
            title: 'text-xl! font-extrabold! text-neutral-950!',
            htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
            actions: 'gap-2.5!',
            confirmButton:
                'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            cancelButton:
                'rounded-full! border! border-neutral-300! bg-white! px-5! py-2.5! text-sm! font-semibold! text-neutral-950! transition hover:bg-neutral-100!'
        }
    }
}

/** Popup sukses. Check circle memakai animasi bawaan SweetAlert2, garis progres
    bawah dimatikan, dan warna ikon mengikuti `swalTheme()` supaya konsisten
    dengan tema situs (tanpa hijau/merah bawaan). */
export function swalSuccess(
    isDark: boolean,
    options: { title: string; text?: string; timer?: number }
): Promise<SweetAlertResult> {
    return Swal.fire({
        ...swalTheme(isDark),
        icon: 'success',
        timerProgressBar: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 1800,
        ...options
    })
}

/** Popup proses sedang berjalan: spinner tanpa tombol, tidak bisa ditutup. */
export function swalProcessing(isDark: boolean, title: string, text?: string): void {
    Swal.fire({
        ...swalTheme(isDark),
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    })
}