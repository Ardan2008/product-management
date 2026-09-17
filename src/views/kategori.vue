<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import Api from '../api'

interface Kategori {
    id: number
    name: string
    created_at: string
    updated_at: string
}

const kategoris = ref<Kategori[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '' })

const getKategoris = async () => {
    isLoading.value = true
    try {
        const response = await Api.get('/api/kategoris')
        kategoris.value = response.data.data ?? response.data
    } catch (error: any) {
        console.error('Error fetching kategoris:', error)
        Swal.fire({
            title: 'Gagal!',
            text: error.response?.data?.message || 'Gagal mengambil data kategori.',
            icon: 'error',
            iconColor: '#dc2626',
            color: '#171717',
            confirmButtonText: 'Oke',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                title: 'text-xl! font-extrabold! text-neutral-950!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
                actions: 'gap-2.5!',
                confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            },
        })
    } finally {
        isLoading.value = false
    }
}

const resetForm = () => {
    form.value = { name: '' }
    isEditing.value = false
    editingId.value = null
    showForm.value = false
}

const openCreateForm = () => {
    if (isEditing.value) resetForm()
    showForm.value = !showForm.value
}

const editKategori = (kategori: Kategori) => {
    isEditing.value = true
    editingId.value = kategori.id
    form.value = { name: kategori.name }
    showForm.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const saveKategori = async () => {
    if (!form.value.name.trim()) {
        Swal.fire({
            title: 'Nama wajib diisi',
            text: 'Silakan isi nama kategori terlebih dahulu.',
            icon: 'warning',
            iconColor: '#171717',
            color: '#171717',
            confirmButtonText: 'Oke',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                title: 'text-xl! font-extrabold! text-neutral-950!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
                actions: 'gap-2.5!',
                confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            },
        })
        return
    }

    isSubmitting.value = true
    try {
        const payload = { name: form.value.name.trim() }

        if (isEditing.value && editingId.value !== null) {
            await Api.put(`/api/kategoris/${editingId.value}`, payload)
        } else {
            await Api.post('/api/kategoris', payload)
        }

        await Swal.fire({
            title: 'Berhasil!',
            text: isEditing.value ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil ditambahkan.',
            icon: 'success',
            iconColor: '#171717',
            color: '#171717',
            timer: 1600,
            showConfirmButton: false,
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                title: 'text-xl! font-extrabold! text-neutral-950!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
            },
        })

        resetForm()
        await getKategoris()
    } catch (error: any) {
        Swal.fire({
            title: 'Gagal!',
            text: error.response?.data?.message || 'Gagal menyimpan kategori.',
            icon: 'error',
            iconColor: '#dc2626',
            color: '#171717',
            confirmButtonText: 'Oke',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                title: 'text-xl! font-extrabold! text-neutral-950!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
                actions: 'gap-2.5!',
                confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            },
        })
    } finally {
        isSubmitting.value = false
    }
}

const deleteKategori = async (id: number) => {
    const kategori = kategoris.value.find((item) => item.id === id)

    const confirm = await Swal.fire({
        title: 'Hapus kategori?',
        html: `Kategori <b>"${kategori ? kategori.name : id}"</b> akan dihapus secara permanen.`,
        icon: 'warning',
        iconColor: '#171717',
        color: '#171717',
        showCancelButton: true,
        confirmButtonText: 'Ya, hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        customClass: {
            popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
            title: 'text-xl! font-extrabold! text-neutral-950!',
            htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
            actions: 'gap-2.5!',
            confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            cancelButton: 'rounded-full! border! border-neutral-300! bg-white! px-5! py-2.5! text-sm! font-semibold! text-neutral-950! transition hover:bg-neutral-100!',
        },
    })

    if (!confirm.isConfirmed) return

    Swal.fire({
        title: 'Menghapus...',
        text: 'Mohon tunggu sebentar.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
        customClass: {
            popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
            title: 'text-xl! font-extrabold! text-neutral-950!',
            htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
        },
    })

    try {
        await Promise.all([Api.delete(`/api/kategoris/${id}`), new Promise((r) => setTimeout(r, 1000))])
        await Swal.fire({
            title: 'Terhapus!',
            text: 'Kategori berhasil dihapus.',
            icon: 'success',
            iconColor: '#171717',
            color: '#171717',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                title: 'text-xl! font-extrabold! text-neutral-950!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
            },
        })
        getKategoris()
    } catch (error: any) {
        console.error('Error deleting kategori:', error)
        Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus kategori.',
            icon: 'error',
            iconColor: '#dc2626',
            color: '#171717',
            confirmButtonText: 'Oke',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-2xl! border! border-neutral-200! shadow-xl!',
                title: 'text-xl! font-extrabold! text-neutral-950!',
                htmlContainer: 'text-sm! leading-relaxed! text-neutral-600!',
                actions: 'gap-2.5!',
                confirmButton: 'rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!',
            },
        })
    }
}

onMounted(() => {
    getKategoris()
})
</script>

<template>
    <div class="mx-auto max-w-5xl px-4 py-10">

        <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-950">
                    Kategori
                </h1>
                <p class="mt-1 text-sm text-neutral-500">Kelola kategori product</p>
            </div>

            <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                @click="openCreateForm"
            >
                <Plus v-if="!showForm" :size="16" />
                <X v-else :size="16" />
                {{ showForm ? 'Tutup' : 'Tambah Kategori' }}
            </button>
        </div>

        <div v-if="showForm" class="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 class="text-lg font-bold tracking-tight text-neutral-950">
                {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori' }}
            </h2>
            <p class="mt-1 text-sm text-neutral-500">
                {{ isEditing ? 'Perbarui nama kategori.' : 'Tambahkan kategori product baru.' }}
            </p>

            <form @submit.prevent="saveKategori" class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div class="flex-1">
                    <label for="name" class="mb-1.5 block text-sm font-medium text-neutral-800">Nama Kategori</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        placeholder="Masukkan nama kategori"
                        class="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    />
                </div>

                <div class="flex gap-2">
                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan' }}
                    </button>
                    <button
                        type="button"
                        class="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
                        @click="resetForm"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>

        <div class="mt-6 rounded-2xl border border-neutral-200 bg-white">

            <div v-if="isLoading" class="px-6 py-16 text-center text-sm text-neutral-500">
                Loading kategoris...
            </div>

            <div v-else-if="kategoris.length === 0" class="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <FolderOpen :size="18" />
                </span>
                <p class="text-sm font-medium text-neutral-700">Belum ada kategori</p>
                <p class="text-xs text-neutral-400">Tambahkan kategori pertamamu untuk mulai.</p>
            </div>

            <template v-else>
                <div class="border-b border-neutral-200 px-6 py-3.5 text-xs font-medium text-neutral-500">
                    Total kategori: {{ kategoris.length }}
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500">
                            <th class="px-6 py-3.5 font-medium">ID</th>
                            <th class="px-6 py-3.5 font-medium">Nama Kategori</th>
                            <th class="px-6 py-3.5 text-right font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100">
                        <tr
                            v-for="kategori in kategoris"
                            :key="kategori.id"
                            class="transition hover:bg-neutral-50"
                        >
                            <td class="px-6 py-4 text-neutral-500">{{ kategori.id }}</td>
                            <td class="px-6 py-4 font-medium text-neutral-900">{{ kategori.name }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
                                        :aria-label="`Edit ${kategori.name}`"
                                        @click="editKategori(kategori)"
                                    >
                                        <Pencil :size="15" />
                                    </button>
                                    <button
                                        type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-red-600"
                                        :aria-label="`Hapus ${kategori.name}`"
                                        @click="deleteKategori(kategori.id)"
                                    >
                                        <Trash2 :size="15" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </template>

        </div>
    </div>
</template>