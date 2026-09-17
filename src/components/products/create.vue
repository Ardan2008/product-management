<script setup lang="ts">
import { ref, computed } from "vue";
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

const errors = ref<Errors>({});
const isSubmitting = ref(false);

const route = useRoute();
const router = useRouter();

// halaman tujuan balik, default ke /products kalau nggak ada query redirect
const redirectPath = computed(() => (route.query.redirect as string) || "/products");

const validate = () => {
    errors.value = {};
    let hasError = false;

    if (!name.value) {
        errors.value.name = ["The name field is required."];
        hasError = true;
    }
    if (!description.value) {
        errors.value.description = ["The description field is required."];
        hasError = true;
    }
    if (!price.value) {
        errors.value.price = ["The price field is required."];
        hasError = true;
    } else {
        const pricePattern = /^\d{1,3}(\.\d{3})*$/;
        if (!pricePattern.test(price.value)) {
            errors.value.price = ["The price format is invalid. Use Rupiah format, e.g. 80.000."];
            hasError = true;
        }
    }
    if (!stock.value) {
        errors.value.stock = ["The stock field is required."];
        hasError = true;
    }

    return !hasError;
};

const storeProduct = async () => {
    if (!validate()) return;

    // Popup konfirmasi dulu sebelum benar-benar submit
    const confirm = await Swal.fire({
        title: "Simpan product ini?",
        html: `Kamu akan menambahkan product <b>"${name.value}"</b> ke daftar product.`,
        icon: "question",
        iconColor: "#171717",
        color: "#171717",
        showCancelButton: true,
        confirmButtonText: "Ya, simpan",
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
        title: "Menyimpan...",
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
    formData.append("price", price.value);
    formData.append("stock", stock.value);
    formData.append("id_kategori", id_kategori.value);

    isSubmitting.value = true;
    try {
        await Promise.all([Api.post("/api/products", formData), new Promise((r) => setTimeout(r, 1000))]);

        await Swal.fire({
            title: "Berhasil!",
            text: "Product baru berhasil ditambahkan.",
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
            text: "Terjadi kesalahan saat menambahkan product.",
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
            Add new product
        </h1>

        <form @submit.prevent="storeProduct" class="mt-8 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">

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
                :disabled="isSubmitting"
                class="w-full rounded-full bg-neutral-950 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
                {{ isSubmitting ? "Saving..." : "Save product" }}
            </button>

        </form>
    </div>
</template>