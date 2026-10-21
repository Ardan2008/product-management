<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import Api from '../api'
import { useTheme } from '../composables/useTheme'
import { swalProcessing, swalSuccess, swalTheme } from '../utils/swal'
import { withSkeletonDuration } from '../utils/skeleton'

const { isDark } = useTheme()

interface Kategori {
    id: number
    name: string
    created_at: string
    updated_at: string
}

const kategoris = ref<Kategori[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
// jumlah baris placeholder saat tabel dimuat
const skeletonRows = [1, 2, 3, 4, 5]

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '' })

// masuk lebih lama daripada keluar supaya panel terasa "dibuka", bukan sekadar hilang
const formTransition = {
    enterActiveClass: 'transition-all duration-300 ease-out motion-reduce:transition-none',
    enterFromClass: 'opacity-0 -translate-y-3',
    leaveActiveClass: 'transition-all duration-200 ease-in motion-reduce:transition-none',
    leaveToClass: 'opacity-0 -translate-y-2',
}

const nameInputRef = ref<HTMLInputElement | null>(null)

// fokus baru masuk setelah panel selesai beranimasi: saat transform masih
// berjalan, memindahkan fokus bikin layar berkedip
const focusNameInput = () => nameInputRef.value?.focus()

// skeleton hanya untuk muat pertama; setelah simpan/hapus cukup sinkron ulang
// supaya tabel yang sudah ada tidak berkedip jadi placeholder
const getKategoris = async (withSkeleton = true) => {
    if (withSkeleton) isLoading.value = true
    try {
        const load = async () => {
            const response = await Api.get('/api/kategoris')
            kategoris.value = response.data.data ?? response.data
        }
        if (withSkeleton) await withSkeletonDuration(load)
        else await load()
    } catch (error: any) {
        console.error('Error fetching categories:', error)
        Swal.fire({
            ...swalTheme(isDark.value),
            title: 'Failed!',
            text: error.response?.data?.message || 'Could not load the categories.',
            icon: 'error',
            confirmButtonText: 'Okay',
            buttonsStyling: false,
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
    // saat form tampil, tombol berfungsi sebagai "tutup"
    if (showForm.value) {
        resetForm()
        return
    }
    showForm.value = true
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
            ...swalTheme(isDark.value),
            title: 'Name is required',
            text: 'Please enter a category name first.',
            icon: 'warning',
            confirmButtonText: 'Okay',
            buttonsStyling: false,
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

        await swalSuccess(
            isDark.value,
            isEditing.value
                ? { title: 'Updated!', text: 'The category has been updated.' }
                : { title: 'Added!', text: 'The category has been added.' }
        )

        resetForm()
        await getKategoris(false)
    } catch (error: any) {
        Swal.fire({
            ...swalTheme(isDark.value),
            title: 'Failed!',
            text: error.response?.data?.message || 'Could not save the category.',
            icon: 'error',
            confirmButtonText: 'Okay',
            buttonsStyling: false,
        })
    } finally {
        isSubmitting.value = false
    }
}

const deleteKategori = async (id: number) => {
    const kategori = kategoris.value.find((item) => item.id === id)

    const confirm = await Swal.fire({
        ...swalTheme(isDark.value),
        title: 'Delete this category?',
        html: `Category <b>"${kategori ? kategori.name : id}"</b> will be deleted permanently.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
    })

    if (!confirm.isConfirmed) return

    swalProcessing(isDark.value, 'Deleting...', 'One moment, please.')

    try {
        await Promise.all([Api.delete(`/api/kategoris/${id}`), new Promise((r) => setTimeout(r, 1000))])
        await swalSuccess(isDark.value, { title: 'Deleted!', text: 'The category has been deleted.' })
        getKategoris(false)
    } catch (error: any) {
        console.error('Error deleting category:', error)

        // backend menolak hapus kategori yang masih dipakai produk (409)
        const isInUse = error?.response?.status === 409

        Swal.fire({
            ...swalTheme(isDark.value),
            title: isInUse ? 'Cannot delete' : 'Failed!',
            text: error?.response?.data?.message
                ?? 'Something went wrong while deleting the category.',
            icon: isInUse ? 'warning' : 'error',
            confirmButtonText: 'Okay',
            buttonsStyling: false,
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
                <h1 class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                    Categories
                </h1>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your product categories</p>
            </div>

            <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                @click="openCreateForm"
            >
                <Plus v-if="!showForm" :size="16" />
                <X v-else :size="16" />
                {{ showForm ? 'Close' : 'Add Category' }}
            </button>
        </div>

        <Transition v-bind="formTransition" @after-enter="focusNameInput">
            <div v-if="showForm" class="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 class="text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                    {{ isEditing ? 'Edit Category' : 'Add Category' }}
                </h2>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {{ isEditing ? 'Update the category name.' : 'Add a new product category.' }}
                </p>

                <form @submit.prevent="saveKategori" class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div class="flex-1">
                        <label for="name" class="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Category Name</label>
                        <input
                            id="name"
                            ref="nameInputRef"
                            v-model="form.name"
                            type="text"
                            placeholder="Enter a category name"
                            class="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-700 dark:focus:ring-neutral-800/40"
                        />
                    </div>

                    <div class="flex gap-2">
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            {{ isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save' }}
                        </button>
                        <button
                            type="button"
                            class="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                            @click="resetForm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Transition>

        <div class="mt-6 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">

            <div v-if="isLoading" class="px-6 py-6">
                <div class="h-3.5 w-40 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />

                <div class="mt-6 grid grid-cols-[4rem_1fr_5.5rem] items-center gap-6 border-b border-neutral-200 pb-3.5 dark:border-neutral-800">
                    <div class="h-3 w-6 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <div class="h-3 w-28 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <div class="h-3 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                </div>

                <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <div
                        v-for="n in skeletonRows"
                        :key="n"
                        class="grid grid-cols-[4rem_1fr_5.5rem] items-center gap-6 py-4"
                    >
                        <div class="h-4 w-8 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                        <div class="h-4 w-2/3 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                        <div class="flex justify-end gap-1">
                            <div class="h-8 w-8 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                            <div class="h-8 w-8 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="kategoris.length === 0" class="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                    <FolderOpen :size="18" />
                </span>
                <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">No categories yet</p>
                <p class="text-xs text-neutral-400 dark:text-neutral-500">Add your first category to get started.</p>
            </div>

            <template v-else>
                <div class="border-b border-neutral-200 px-6 py-3.5 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    Total categories: {{ kategoris.length }}
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                            <th class="px-6 py-3.5 font-medium">ID</th>
                            <th class="px-6 py-3.5 font-medium">Category Name</th>
                            <th class="px-6 py-3.5 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
                        <tr
                            v-for="kategori in kategoris"
                            :key="kategori.id"
                            class="transition hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
                            <td class="px-6 py-4 text-neutral-500 dark:text-neutral-400">{{ kategori.id }}</td>
                            <td class="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{{ kategori.name }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                                        :aria-label="`Edit ${kategori.name}`"
                                        @click="editKategori(kategori)"
                                    >
                                        <Pencil :size="15" />
                                    </button>
                                    <button
                                        type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                        :aria-label="`Delete ${kategori.name}`"
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