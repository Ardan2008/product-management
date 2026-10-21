export interface LandingProduct {
  id: number
  name: string
  description?: string | null
  price: number | string
  stock: number
  kategori?: string | null
  image_url?: string | null
}

export interface LandingKategori {
  id: number
  name: string
}
