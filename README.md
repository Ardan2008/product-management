# Product Management

**Product Management** adalah project pengembangan website untuk mengelola data produk dengan menggabungkan **Laravel** sebagai backend REST API dan **Vue 3 + TypeScript** sebagai frontend.

Project ini dibuat untuk mempraktikkan proses integrasi antara frontend dan backend melalui **REST API**, mulai dari menampilkan data produk, menambahkan data, memperbarui data, hingga menghapus data.

## About Project

Project ini menggunakan arsitektur frontend dan backend yang dipisahkan.

**Laravel** bertanggung jawab sebagai backend yang menyediakan REST API untuk mengelola data produk dan berkomunikasi dengan database.

Sementara itu, **Vue 3** digunakan untuk membangun tampilan frontend yang berinteraksi dengan API Laravel untuk mengambil dan mengelola data produk secara dinamis.

Data yang dikirim antara frontend dan backend menggunakan format **JSON**.

## Features

* **Create Product** — Menambahkan data produk baru.
* **Read Products** — Menampilkan daftar data produk.
* **Update Product** — Mengubah informasi produk.
* **Delete Product** — Menghapus data produk.
* **REST API Integration** — Frontend Vue terhubung dengan backend Laravel melalui REST API.
* **Product Management** — Pengelolaan data produk melalui antarmuka frontend.

## Tech Stack

### Backend

* Laravel
* PHP
* MySQL
* REST API

### Frontend

* Vue 3
* TypeScript
* Vite
* Axios

## Architecture

```text
┌──────────────────────┐
│     Vue 3 Frontend   │
│   TypeScript + Vite  │
└──────────┬───────────┘
           │
           │ REST API
           │ JSON
           ▼
┌──────────────────────┐
│    Laravel Backend   │
│      REST API        │
└──────────┬───────────┘
           │
           │ Eloquent ORM
           ▼
┌──────────────────────┐
│    MySQL Database    │
│    Product Data      │
└──────────────────────┘
```

## CRUD Process

### Create

User mengisi form produk pada frontend Vue, kemudian data dikirim ke Laravel melalui request API untuk disimpan ke database.

### Read

Vue mengambil data produk dari Laravel API dan menampilkannya dalam bentuk daftar pada halaman frontend.

### Update

User memilih data produk yang ingin diubah, kemudian perubahan dikirim ke Laravel API untuk memperbarui data pada database.

### Delete

User memilih produk yang ingin dihapus, kemudian frontend mengirim request delete ke Laravel API.

## Project Goals

Project ini dibuat untuk memahami bagaimana **frontend Vue dan backend Laravel dapat bekerja secara terpisah namun tetap saling terhubung melalui REST API**.

Selain itu, project ini menjadi latihan dalam menerapkan:

* CRUD pada website
* REST API dengan Laravel
* Vue 3 dan TypeScript
* HTTP request menggunakan Axios
* Integrasi frontend dan backend
* Pengelolaan data menggunakan MySQL
* Pemisahan struktur frontend dan backend

## Project Structure

```text
product-management/
│
├── crud-vue3-ts/
│   └── Vue 3 + TypeScript Frontend
│
└── laravel-api-03/
    └── Laravel REST API Backend
```

---

A **Product Management** project built to practice Laravel REST API and Vue 3 integration.
