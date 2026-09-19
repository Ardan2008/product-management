<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Plus, Pencil, Trash2, Package } from "lucide-vue-next";
import Swal from "sweetalert2";
import Api from "../../api";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    id_kategori: number;
}

const route = useRoute();
const products = ref<Product[]>([]);
const isLoading = ref(true);

const formatCurrency = (value: string | number): string => {
    const digits = String(value ?? 0).replace(/\D/g, "");
    return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
};

const fetchDataProducts = async () => {
    isLoading.value = true;
    try {
        const response = await Api.get("/api/products");
        products.value = response.data.data || response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        isLoading.value = false;
    }
};

const deleteProduct = async (id: number) => {
    const product = products.value.find((item) => item.id === id);

    const confirm = await Swal.fire({
        title: "Hapus product?",
        html: `Product <b>"${product ? product.name : id}"</b> akan dihapus secara permanen.`,
        icon: "warning",
        iconColor: "#171717",
        color: "#171717",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        customClass: {
            popup: "rounded-2xl! border! border-neutral-200! shadow-xl!",
            title: "text-xl! font-extrabold! text-neutral-950!",
            htmlContainer: "text-sm! leading-relaxed! text-neutral-600!",
            actions: "gap-2.5!",
            confirmButton: "rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!",
            cancelButton: "rounded-full! border! border-neutral-300! bg-white! px-5! py-2.5! text-sm! font-semibold! text-neutral-950! transition hover:bg-neutral-100!",
        },
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
        customClass: {
            popup: "rounded-2xl! border! border-neutral-200! shadow-xl!",
            title: "text-xl! font-extrabold! text-neutral-950!",
            htmlContainer: "text-sm! leading-relaxed! text-neutral-600!",
        },
    });

    try {
        await Promise.all([Api.delete(`/api/products/${id}`), new Promise((r) => setTimeout(r, 1000))]);
        await Swal.fire({
            title: "Terhapus!",
            text: "Product berhasil dihapus.",
            icon: "success",
            iconColor: "#171717",
            color: "#171717",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                popup: "rounded-2xl! border! border-neutral-200! shadow-xl!",
                title: "text-xl! font-extrabold! text-neutral-950!",
                htmlContainer: "text-sm! leading-relaxed! text-neutral-600!",
            },
        });
        fetchDataProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus product.",
            icon: "error",
            iconColor: "#dc2626",
            color: "#171717",
            confirmButtonText: "Oke",
            buttonsStyling: false,
            customClass: {
                popup: "rounded-2xl! border! border-neutral-200! shadow-xl!",
                title: "text-xl! font-extrabold! text-neutral-950!",
                htmlContainer: "text-sm! leading-relaxed! text-neutral-600!",
                actions: "gap-2.5!",
                confirmButton: "rounded-full! bg-neutral-950! px-5! py-2.5! text-sm! font-semibold! text-white! transition hover:bg-neutral-800!",
            },
        });
    }
};

onMounted(() => {
    fetchDataProducts();
});
</script>

<template>
    <div class="mx-auto max-w-5xl px-4 py-10">

        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold tracking-tight text-neutral-950">
                Products
            </h1>
            <router-link
                :to="{ path: '/products/create', query: { redirect: route.path } }"
                class="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
                <Plus :size="16" />
                Add product
            </router-link>
        </div>

        <div class="mt-6 rounded-2xl border border-neutral-200 bg-white">

            <div v-if="isLoading" class="px-6 py-16 text-center text-sm text-neutral-500">
                Loading products...
            </div>

            <div v-else-if="products.length === 0" class="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <Package :size="18" />
                </span>
                <p class="text-sm font-medium text-neutral-700">No products yet</p>
                <p class="text-xs text-neutral-400">Add your first product to get started.</p>
            </div>

            <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-neutral-200 text-left text-xs font-medium text-neutral-500">
                        <th class="px-6 py-3.5 font-medium">Name</th>
                        <th class="px-6 py-3.5 font-medium">Category</th>
                        <th class="px-6 py-3.5 font-medium">Description</th>
                        <th class="px-6 py-3.5 text-right font-medium">Price</th>
                        <th class="px-6 py-3.5 text-right font-medium">Stock</th>
                        <th class="px-6 py-3.5 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                    <tr
                        v-for="product in products"
                        :key="product.id"
                        class="transition hover:bg-neutral-50"
                    >
                        <td class="px-6 py-4 font-medium text-neutral-900">{{ product.name }}</td>
                        <td class="px-6 py-4 text-neutral-600">{{ product.id_kategori }}</td>
                        <td class="max-w-xs truncate px-6 py-4 text-neutral-600">{{ product.description }}</td>
                        <td class="px-6 py-4 text-right text-neutral-900">{{ formatCurrency(product.price) }}</td>
                        <td class="px-6 py-4 text-right text-neutral-600">{{ product.stock }}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center justify-end gap-1">
                                <router-link
                                    :to="{ path: `/products/edit/${product.id}`, query: { redirect: route.path } }"
                                    class="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
                                >
                                    <Pencil :size="15" />
                                </router-link>
                                <button
                                    @click="deleteProduct(product.id)"
                                    class="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
                                >
                                    <Trash2 :size="15" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>

        </div>
    </div>
</template>