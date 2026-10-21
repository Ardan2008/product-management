<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, ChevronDown } from "lucide-vue-next";
import Swal from "sweetalert2";
import Api from "../../api";
import ImageUpload from "../common/ImageUpload.vue";
import { useTheme } from "../../composables/useTheme";
import { swalProcessing, swalSuccess, swalTheme } from "../../utils/swal";
import { withSkeletonDuration } from "../../utils/skeleton";
import { validateProductFields } from "../../utils/validators";

const { isDark } = useTheme();

interface Kategori {
    id: number;
    name: string;
}

interface Errors {
    name?: string[];
    description?: string[];
    price?: string[];
    stock?: string[];
    id_kategori?: string[];
    image?: string[];
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

// `image` = file baru pilihan user (belum ada di server),
// `currentImageUrl` = gambar yang sudah dimiliki produk ini
const image = ref<File | null>(null);
const currentImageUrl = ref<string | null>(null);
const isImageRemoved = ref(false);

const kategoris = ref<Kategori[]>([]);
const isLoadingKategori = ref(true);

const initialValues = ref({
    name: "",
    description: "",
    price: "",
    stock: "",
    id_kategori: "",
});

const getKategoris = async () => {
    try {
        await withSkeletonDuration(async () => {
            const response = await Api.get("/api/kategoris");
            kategoris.value = response.data.data ?? response.data;
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    } finally {
        isLoadingKategori.value = false;
    }
};

const hasChanges = computed(() =>
    String(name.value) !== initialValues.value.name ||
    String(description.value) !== initialValues.value.description ||
    String(price.value) !== initialValues.value.price ||
    String(stock.value) !== initialValues.value.stock ||
    String(id_kategori.value) !== initialValues.value.id_kategori ||
    image.value !== null ||
    isImageRemoved.value
);

const errors = ref<Errors>({});
const isLoading = ref(true);
const isSubmitting = ref(false);

const route = useRoute();
const router = useRouter();

const redirectPath = computed(() => (route.query.redirect as string) || "/products");

// aturan produk sama dengan create.vue, keduanya berbagi validateProductFields
const validate = () => {
    const found = validateProductFields({
        name: name.value,
        description: description.value,
        price: price.value,
        stock: stock.value,
        id_kategori: id_kategori.value,
    });

    errors.value = found as Errors;
    return Object.keys(found).length === 0;
};

const clearFieldError = (field: keyof Errors) => {
    if (!errors.value[field]) return;

    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
};

const onPriceInput = (event: Event) => {
    price.value = formatPrice((event.target as HTMLInputElement).value);
    clearFieldError("price");
};

// style field: abu-abu terang, jadi putih saat focus / error
const fieldBase =
    "w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-950/5 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100 dark:focus:bg-neutral-900 dark:focus:ring-neutral-100/10";
const fieldClass = (invalid?: boolean) => [
    fieldBase,
    invalid
        ? "border-neutral-950 bg-white dark:border-neutral-100 dark:bg-neutral-900"
        : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100/70 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
];

const fetchDetailProduct = async () => {
    try {
        await withSkeletonDuration(async () => {
            const response = await Api.get(`/api/products/${route.params.id}`);
            const data = response.data.data;

            name.value = data.name ?? "";
            description.value = data.description ?? "";
            price.value = data.price != null ? formatPrice(String(data.price)) : "";
            stock.value = data.stock != null ? String(data.stock) : "";
            id_kategori.value = data.id_kategori != null ? String(data.id_kategori) : "";
            currentImageUrl.value = data.image_url ?? null;
            initialValues.value = {
                name: name.value,
                description: description.value,
                price: price.value,
                stock: stock.value,
                id_kategori: id_kategori.value,
            };
        });
    } catch (error) {
        console.error("Error fetching product:", error);
    } finally {
        isLoading.value = false;
    }
};

// user memilih file baru: batalkan penandaan penghapusan gambar
const onImageSelected = (file: File | null) => {
    image.value = file;
    if (file) {
        isImageRemoved.value = false;
    }
};

// user menghapus gambar: buang file baru dan tandai untuk dihapus di server
const onImageRemove = () => {
    image.value = null;
    isImageRemoved.value = true;
};

const updateProduct = async () => {
    // validasi dulu sebelum popup konfirmasi, jangan sampai user mengonfirmasi
    // form yang memang tidak akan bisa dikirim
    if (!validate()) return;

    if (!hasChanges.value) {
        Swal.fire({
            ...swalTheme(isDark.value),
            title: "No changes",
            text: "The product data is still the same as before, there is nothing to update.",
            icon: "warning",
            confirmButtonText: "Okay",
            buttonsStyling: false,
        });
        return;
    }

    const confirm = await Swal.fire({
        ...swalTheme(isDark.value),
        title: "Update product?",
        text: "Are you sure about these changes?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    swalProcessing(isDark.value, "Updating...", "One moment, please.");

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("description", description.value);
    formData.append("price", price.value.replace(/\./g, ""));
    formData.append("stock", stock.value);
    formData.append("id_kategori", id_kategori.value);
    formData.append("_method", "PUT");
    if (image.value) {
        formData.append("image", image.value);
    }
    if (isImageRemoved.value) {
        formData.append("remove_image", "1");
    }

    isSubmitting.value = true;
    try {
        await Promise.all([Api.post(`/api/products/${route.params.id}`, formData), new Promise((r) => setTimeout(r, 1000))]);

        await swalSuccess(isDark.value, {
            title: "Success!",
            text: "The product has been updated.",
            timer: 1500,
        });

        router.push(redirectPath.value);
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.errors) {
            errors.value = error.response.data.errors;
        }

        Swal.fire({
            ...swalTheme(isDark.value),
            title: "Failed!",
            text: "Something went wrong while updating the product.",
            icon: "error",
            confirmButtonText: "Okay",
            buttonsStyling: false,
        });
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    fetchDetailProduct();
    getKategoris();
});
</script>

<template>
    <div class="mx-auto max-w-5xl px-4 py-10">

        <div class="flex items-center gap-4">
            <router-link
                :to="redirectPath"
                title="Back"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-50"
            >
                <ArrowLeft :size="18" />
            </router-link>
            <div class="min-w-0">
                <h1 class="text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">Edit product</h1>
                <p class="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
                    <template v-if="isLoading">Loading product details...</template>
                    <template v-else>Update the details of "{{ initialValues.name }}".</template>
                </p>
            </div>
        </div>

        <div v-if="isLoading" class="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
            <div class="space-y-6 rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-6 sm:p-8 lg:col-span-3">
                <div class="h-4 w-28 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                <div class="h-12 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                <div class="h-32 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                <div class="grid grid-cols-2 gap-5">
                    <div class="h-12 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                    <div class="h-12 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                </div>
            </div>
            <div class="space-y-6 lg:col-span-2">
                <div class="h-56 animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800" />
                <div class="h-24 animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800" />
            </div>
        </div>

        <form v-else @submit.prevent="updateProduct" class="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">

            <section class="space-y-6 rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-6 sm:p-8 lg:col-span-3">
                <h2 class="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Product details</h2>

                <div>
                    <label for="name" class="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Name</label>
                    <input
                        id="name"
                        type="text"
                        v-model="name"
                        placeholder="e.g. Caffe Latte"
                        :class="fieldClass(!!errors.name)"
                        @input="clearFieldError('name')"
                    />
                    <p v-if="errors.name" class="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">{{ errors.name[0] }}</p>
                </div>

                <div>
                    <label for="description" class="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Description</label>
                    <textarea
                        id="description"
                        v-model="description"
                        rows="5"
                        placeholder="Describe the product in a sentence or two"
                        :class="[fieldClass(!!errors.description), 'resize-none leading-relaxed']"
                        @input="clearFieldError('description')"
                    ></textarea>
                    <p v-if="errors.description" class="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">{{ errors.description[0] }}</p>
                </div>

                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label for="price" class="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Price</label>
                        <div class="relative">
                            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 dark:text-neutral-500">Rp</span>
                            <input
                                id="price"
                                type="text"
                                inputmode="numeric"
                                :value="price"
                                @input="onPriceInput"
                                placeholder="0"
                                :class="[fieldClass(!!errors.price), 'pl-11']"
                            />
                        </div>
                        <p v-if="errors.price" class="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">{{ errors.price[0] }}</p>
                    </div>
                    <div>
                        <label for="stock" class="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Stock</label>
                        <input
                            id="stock"
                            type="number"
                            min="0"
                            v-model="stock"
                            placeholder="0"
                            :class="fieldClass(!!errors.stock)"
                            @input="clearFieldError('stock')"
                        />
                        <p v-if="errors.stock" class="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">{{ errors.stock[0] }}</p>
                    </div>
                </div>
            </section>

            <aside class="space-y-6 lg:sticky lg:top-6 lg:col-span-2">
                <div class="rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-6">
                    <ImageUpload
                        :model-value="image"
                        :existing-url="isImageRemoved ? null : currentImageUrl"
                        label="Image"
                        :error="errors.image?.[0]"
                        :disabled="isSubmitting"
                        @update:model-value="onImageSelected"
                        @remove="onImageRemove"
                    />
                </div>

                <div class="rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-6">
                    <label for="category" class="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Category</label>
                    <div class="relative">
                        <select
                            id="category"
                            v-model="id_kategori"
                            :disabled="isLoadingKategori"
                            :class="[fieldClass(!!errors.id_kategori), 'cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60']"
                            @change="clearFieldError('id_kategori')"
                        >
                            <option value="">
                                {{ isLoadingKategori ? 'Loading categories...' : 'Select category' }}
                            </option>
                            <option
                                v-for="kategori in kategoris"
                                :key="kategori.id"
                                :value="String(kategori.id)"
                                class="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                {{ kategori.name }}
                            </option>
                        </select>
                        <ChevronDown :size="16" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <p v-if="errors.id_kategori" class="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">{{ errors.id_kategori[0] }}</p>
                </div>

                <div class="flex flex-col gap-2.5">
                    <p v-if="hasChanges && !isSubmitting" class="text-center text-xs text-neutral-500 dark:text-neutral-400">
                        You have unsaved changes.
                    </p>
                    <button
                        type="submit"
                        :disabled="isSubmitting || !hasChanges"
                        class="w-full rounded-full bg-neutral-950 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
                    >
                        {{ isSubmitting ? "Updating..." : "Update product" }}
                    </button>
                    <router-link
                        :to="redirectPath"
                        class="w-full rounded-full border border-neutral-200 bg-white py-3 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                    >
                        Cancel
                    </router-link>
                </div>
            </aside>

        </form>
    </div>
</template>
