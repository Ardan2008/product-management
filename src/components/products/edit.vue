<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import Swal from "sweetalert2";
import Api from "../../api";

interface Errors {
    name?: string[];
    description?: string[];
    price?: string[];
    stock?: string[];
    id_kategori?: string[];
}

const formatPrice = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const name = ref("");
const description = ref("");
const price = ref("");
const stock = ref("");
const id_kategori = ref("");

const initialValues = ref({
    name: "",
    description: "",
    price: "",
    stock: "",
    id_kategori: "",
});

// true kalau ada field yang berubah dari kondisi awal produk
const hasChanges = computed(() =>
    String(name.value) !== initialValues.value.name ||
    String(description.value) !== initialValues.value.description ||
    String(price.value) !== initialValues.value.price ||
    String(stock.value) !== initialValues.value.stock ||
    String(id_kategori.value) !== initialValues.value.id_kategori
);

const errors = ref<Errors>({});
const isLoading = ref(true);
const isSubmitting = ref(false);

const route = useRoute();
const router = useRouter();

const redirectPath = computed(() => (route.query.redirect as string) || "/products");

const fetchDetailProduct = async () => {
    try {
        const response = await Api.get(`/api/products/${route.params.id}`);
        const data = response.data.data;

        name.value = data.name ?? "";
        description.value = data.description ?? "";
        price.value = data.price != null ? formatPrice(String(data.price)) : "";
        stock.value = data.stock != null ? String(data.stock) : "";
        id_kategori.value = data.id_kategori != null ? String(data.id_kategori) : "";
        initialValues.value = {
            name: name.value,
            description: description.value,
            price: price.value,
            stock: stock.value,
            id_kategori: id_kategori.value,
        };
    } catch (error) {
        console.error("Error fetching product:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchDetailProduct();
});

const updateProduct = async () => {
    if (!hasChanges.value) {
        Swal.fire({
            title: "Tidak Ada Perubahan",
            text: "Data product masih sama dengan sebelumnya, tidak ada yang perlu diupdate.",
            icon: "warning",
            iconColor: "#171717",
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
        return;
    }

    const confirm = await Swal.fire({
        title: "Update product?",
        text: "Apakah kamu sudah yakin dengan perubahan data ini?",
        icon: "question",
        iconColor: "#171717",
        color: "#171717",
        showCancelButton: true,
        confirmButtonText: "Ya, update",
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
        title: "Mengupdate...",
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

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("description", description.value);
    formData.append("price", price.value.replace(/\./g, ""));
    formData.append("stock", stock.value);
    formData.append("id_kategori", id_kategori.value);
    formData.append("_method", "PUT");

    isSubmitting.value = true;
    try {
        await Promise.all([Api.post(`/api/products/${route.params.id}`, formData), new Promise((r) => setTimeout(r, 1000))]);

        await Swal.fire({
            title: "Berhasil!",
            text: "Product berhasil diperbarui.",
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

        router.push(redirectPath.value);
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            errors.value = error.response.data.errors;
        }

        Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat memperbarui product.",
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
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="mx-auto max-w-2xl px-4 py-10">

        <router-link
            :to="redirectPath"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
        >
            <ArrowLeft :size="16" />
            Back
        </router-link>

        <h1 class="mt-4 text-2xl font-bold tracking-tight text-neutral-950">
            Edit product
        </h1>

        <div v-if="isLoading" class="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            Loading product...
        </div>

        <form v-else @submit.prevent="updateProduct" class="mt-8 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">

            <div>
                <label class="mb-1.5 block text-sm font-medium text-neutral-800">Name</label>
                <input
                    type="text"
                    v-model="name"
                    placeholder="Product name"
                    class="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                />
                <p v-if="errors.name" class="mt-1.5 text-xs text-neutral-500">{{ errors.name[0] }}</p>
            </div>

            <div>
                <label class="mb-1.5 block text-sm font-medium text-neutral-800">Category</label>
                <select
                    v-model="id_kategori"
                    class="w-full rounded-lg border border-neutral-200 py-2.5 pl-3.5 pr-9 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                >
                    <option value="">Select category</option>
                    <option value="1">Category 1</option>
                    <option value="2">Category 2</option>
                    <option value="3">Category 3</option>
                    <option value="4">Category 4</option>
                    <option value="5">Category 5</option>
                </select>
                <p v-if="errors.id_kategori" class="mt-1.5 text-xs text-neutral-500">{{ errors.id_kategori[0] }}</p>
            </div>

            <div>
                <label class="mb-1.5 block text-sm font-medium text-neutral-800">Description</label>
                <textarea
                    v-model="description"
                    rows="5"
                    placeholder="Product description"
                    class="w-full resize-none rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                ></textarea>
                <p v-if="errors.description" class="mt-1.5 text-xs text-neutral-500">{{ errors.description[0] }}</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label class="mb-1.5 block text-sm font-medium text-neutral-800">Price</label>
                    <input
                        type="text"
                        inputmode="numeric"
                        :value="price"
                        @input="price = formatPrice(($event.target as HTMLInputElement).value)"
                        placeholder="0"
                        class="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    />
                    <p v-if="errors.price" class="mt-1.5 text-xs text-neutral-500">{{ errors.price[0] }}</p>
                </div>
                <div>
                    <label class="mb-1.5 block text-sm font-medium text-neutral-800">Stock</label>
                    <input
                        type="number"
                        v-model="stock"
                        placeholder="0"
                        class="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    />
                    <p v-if="errors.stock" class="mt-1.5 text-xs text-neutral-500">{{ errors.stock[0] }}</p>
                </div>
            </div>

            <button
                type="submit"
                :disabled="isSubmitting || !hasChanges"
                class="w-full rounded-full bg-neutral-950 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
                {{ isSubmitting ? "Updating..." : "Update product" }}
            </button>

        </form>
    </div>
</template>