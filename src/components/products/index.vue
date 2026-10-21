<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import {
    Plus, Pencil, Trash2, Package, ImageOff, Search, Ellipsis, X,
    ChevronLeft, ChevronRight, Coffee, CupSoda, Croissant, Utensils,
} from "lucide-vue-next";
import Swal from "sweetalert2";
import Api from "../../api";
import { useTheme } from "../../composables/useTheme";
import { swalProcessing, swalSuccess, swalTheme } from "../../utils/swal";
import { SKELETON_DURATION, withSkeletonDuration } from "../../utils/skeleton";

const { isDark } = useTheme();

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    id_kategori: number;
    kategori?: string | null;
    image?: string | null;
    image_url?: string | null;
}

const route = useRoute();
const products = ref<Product[]>([]);
const isLoading = ref(true);

const search = ref("");
const activeCategory = ref("All");
const page = ref(1);
const perPage = 8;
const openMenuId = ref<number | null>(null);
const isFiltering = ref(false);

const skeletonCards = [1, 2, 3, 4, 5, 6, 7, 8];

// ikon per kategori, dengan fallback untuk kategori lainnya
const categoryIcon: Record<string, any> = {
    coffee: Coffee,
    "non-coffee": CupSoda,
    bakery: Croissant,
    food: Utensils,
};
const getIcon = (name?: string | null) => categoryIcon[(name || "").toLowerCase()] ?? Package;

const categories = computed(() => {
    const names = new Set<string>();
    products.value.forEach((p) => p.kategori && names.add(p.kategori));
    return ["All", ...names];
});

const filtered = computed(() => {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return products.value.filter((p) => {
        if (activeCategory.value !== "All" && p.kategori !== activeCategory.value) return false;
        if (!terms.length) return true;

        const haystack = [
            p.name,
            p.description,
            p.kategori,
            p.price,
            formatCurrency(p.price),
            p.stock > 0 ? `${p.stock} left` : "sold out",
        ]
            .join(" ")
            .toLowerCase();

        return terms.every((term) => haystack.includes(term));
    });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)));
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage));

// placeholder mengikuti jumlah hasil filter supaya grid tidak melompat
const flashCards = computed(() => Math.min(Math.max(filtered.value.length, 1), perPage));

let filterTimer: number | null = null;

// filter dihitung di browser, jadi cukup tahan pesan 'sedang memuat', bukan scroll
watch([search, activeCategory], () => {
    page.value = 1;

    isFiltering.value = true;
    if (filterTimer !== null) window.clearTimeout(filterTimer);
    filterTimer = window.setTimeout(() => {
        isFiltering.value = false;
        filterTimer = null;
    }, SKELETON_DURATION);
});

const goTo = (n: number) => {
    page.value = Math.min(Math.max(1, n), totalPages.value);
};

const resetFilters = () => {
    search.value = "";
    activeCategory.value = "All";
};

const formatCurrency = (value: string | number): string => {
    const digits = String(value ?? 0).replace(/\D/g, "");
    return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
};

const fetchDataProducts = async () => {
    isLoading.value = true;
    try {
        await withSkeletonDuration(async () => {
            const response = await Api.get("/api/products");
            products.value = response.data.data || response.data;
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        isLoading.value = false;
    }
};

const toggleMenu = (id: number) => {
    openMenuId.value = openMenuId.value === id ? null : id;
};
const closeMenu = () => (openMenuId.value = null);

const deleteProduct = async (id: number) => {
    closeMenu();
    const product = products.value.find((item) => item.id === id);

    const confirm = await Swal.fire({
        ...swalTheme(isDark.value),
        title: "Delete this product?",
        html: `Product <b>"${product ? product.name : id}"</b> will be deleted permanently.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    swalProcessing(isDark.value, "Deleting...", "One moment, please.");

    try {
        await Promise.all([Api.delete(`/api/products/${id}`), new Promise((r) => setTimeout(r, 1000))]);
        await swalSuccess(isDark.value, {
            title: "Deleted!",
            text: "The product has been deleted.",
            timer: 1500,
        });
        await fetchDataProducts();
        if (page.value > totalPages.value) page.value = totalPages.value;
    } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
            ...swalTheme(isDark.value),
            title: "Failed!",
            text: "Something went wrong while deleting the product.",
            icon: "error",
            confirmButtonText: "Okay",
            buttonsStyling: false,
        });
    }
};

onMounted(() => {
    fetchDataProducts();
    document.addEventListener("click", closeMenu);
});
onBeforeUnmount(() => {
    document.removeEventListener("click", closeMenu);
    if (filterTimer !== null) window.clearTimeout(filterTimer);
});
</script>

<template>
    <div class="mx-auto max-w-6xl px-4 py-10">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">Products</h1>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your coffee shop products in one place.</p>
            </div>
            <router-link
                :to="{ path: '/products/create', query: { redirect: route.path } }"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
                <Plus :size="16" />
                Add product
            </router-link>
        </div>

        <div class="mt-6 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 px-4 py-3 focus-within:border-neutral-950 dark:focus-within:border-neutral-700">
            <Search :size="18" class="text-neutral-500 dark:text-neutral-400" />
            <input
                v-model="search"
                type="text"
                placeholder="Search by name, category, price..."
                class="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                @keydown.esc="search = ''"
            />
            <span v-if="search.trim() && !isLoading && !isFiltering" class="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                {{ filtered.length }} found
            </span>
            <button
                v-if="search"
                type="button"
                aria-label="Clear search"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                @click="search = ''"
            >
                <X :size="14" />
            </button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2.5">
            <button
                v-for="cat in categories"
                :key="cat"
                @click="activeCategory = cat"
                class="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition"
                :class="activeCategory === cat
                    ? 'border-neutral-950 bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 dark:border-neutral-700'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'"
            >
                <component :is="getIcon(cat)" v-if="cat !== 'All'" :size="15" />
                {{ cat }}
            </button>
        </div>

        <div v-if="isLoading || isFiltering" class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="n in (isLoading ? skeletonCards : flashCards)" :key="n" class="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-2">
                <div class="h-44 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                <div class="space-y-2.5 p-3">
                    <div class="h-4 w-1/2 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <div class="h-3 w-3/4 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <div class="h-4 w-1/3 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
                </div>
            </div>
        </div>

        <div
            v-else-if="products.length === 0"
            class="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 px-6 py-16 text-center"
        >
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                <Package :size="18" />
            </span>
            <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">No products yet</p>
            <p class="text-xs text-neutral-400 dark:text-neutral-500">Click "Add product" to add your first one.</p>
        </div>

        <div
            v-else-if="filtered.length === 0"
            class="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 px-6 py-16 text-center"
        >
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                <Search :size="18" />
            </span>
            <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">No products found</p>
            <p class="text-xs text-neutral-400 dark:text-neutral-500">Try a different keyword or category.</p>
            <button
                @click="resetFilters"
                class="mt-3 rounded-full border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-neutral-950 dark:text-neutral-100 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
                Clear search
            </button>
        </div>

        <div v-else class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div
                v-for="product in paged"
                :key="product.id"
                class="relative rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-2 shadow-sm transition hover:shadow-md"
            >
                <div class="relative h-44 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <img
                        v-if="product.image_url"
                        :src="product.image_url"
                        :alt="product.name"
                        class="h-full w-full object-cover"
                        loading="lazy"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-500">
                        <ImageOff :size="24" />
                    </div>
                    <span
                        class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                    >
                        <component :is="getIcon(product.kategori)" :size="13" />
                        {{ product.kategori || `Category #${product.id_kategori}` }}
                    </span>
                </div>

                <div class="px-3 pb-3 pt-3.5">
                    <div class="flex items-start justify-between gap-2">
                        <h3 class="truncate text-base font-semibold text-neutral-950 dark:text-neutral-50">{{ product.name }}</h3>

                        <div class="relative shrink-0">
                            <button
                                @click.stop="toggleMenu(product.id)"
                                title="Menu"
                                class="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                            >
                                <Ellipsis :size="16" />
                            </button>
                            <div
                                v-if="openMenuId === product.id"
                                @click.stop
                                class="absolute right-0 top-8 z-10 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 py-1 shadow-lg"
                            >
                                <router-link
                                    :to="{ path: `/products/edit/${product.id}`, query: { redirect: route.path } }"
                                    class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    <Pencil :size="14" /> Edit
                                </router-link>
                                <button
                                    @click="deleteProduct(product.id)"
                                    class="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                                >
                                    <Trash2 :size="14" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <p class="mt-1 line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {{ product.description || "—" }}
                    </p>

                    <div class="mt-5 flex items-center gap-3">
                        <span class="text-base font-bold text-neutral-950 dark:text-neutral-50">{{ formatCurrency(product.price) }}</span>
                        <span class="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
                        <span
                            class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            :class="product.stock > 0 ? 'border border-neutral-200 text-neutral-700 dark:border-neutral-800 dark:text-neutral-300' : 'bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950'"
                        >
                            {{ product.stock > 0 ? `${product.stock} left` : "Sold out" }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!isLoading && !isFiltering && totalPages > 1" class="mt-8 flex justify-center">
            <div class="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 p-1.5">
                <button
                    @click="goTo(page - 1)"
                    :disabled="page === 1"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                    <ChevronLeft :size="16" />
                </button>
                <button
                    v-for="n in totalPages"
                    :key="n"
                    @click="goTo(n)"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition"
                    :class="n === page ? 'bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'"
                >
                    {{ n }}
                </button>
                <button
                    @click="goTo(page + 1)"
                    :disabled="page === totalPages"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                    <ChevronRight :size="16" />
                </button>
            </div>
        </div>
    </div>
</template>
