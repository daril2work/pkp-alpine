# Cara Menggunakan Komponen UI Terpusat

Dokumen ini menjelaskan cara mengintegrasikan komponen UI terpusat (`_sidebar.html`, `_header.html`, dan `_modal.html`) ke dalam halaman HTML mana pun di proyek ini.

## Struktur Dasar Halaman

Pastikan halaman HTML Anda memiliki struktur dasar berikut, termasuk Alpine.js dan Font Awesome:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Judul Halaman Anda</title>
    <link href="/styles.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-800">
    <!-- Konten halaman akan ada di sini -->
</body>
</html>
```

## Integrasi Komponen

Untuk mengintegrasikan komponen, Anda perlu menambahkan *placeholder* `div` di dalam `body` dan kemudian menggunakan JavaScript untuk memuat konten komponen secara dinamis.

### 1. Menambahkan Sidebar, Header, dan Modal

Tambahkan `div` berikut ke dalam `body` halaman Anda. Sidebar dan konten utama harus dibungkus dalam `div` dengan `display: flex` untuk tata letak yang benar.

```html
<div class="flex h-screen" x-data="{ sidebarOpen: true }">
    <!-- Sidebar Placeholder -->
    <div id="sidebar-container"></div>

    <!-- Konten Utama -->
    <div class="flex-1 flex flex-col overflow-y-auto">
        <!-- Header Placeholder -->
        <div id="header-container"></div>

        <!-- Konten Spesifik Halaman -->
        <main class="flex-1 p-8">
            <h1 class="text-2xl font-bold text-gray-800">Judul Halaman Utama</h1>
            <p>Isi konten halaman Anda di sini.</p>
        </main>
    </div>
</div>

<!-- Modal Placeholder -->
<div id="modal-container"></div>
```

### 2. Memuat Komponen dengan JavaScript

Tambahkan skrip berikut di bagian bawah `body` untuk memuat komponen dari file HTML-nya.

```html
<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Muat Sidebar
        fetch('/components/_sidebar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('sidebar-container').innerHTML = data;
            });

        // Muat Header
        fetch('/components/_header.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('header-container').innerHTML = data;
                // Atur judul halaman secara dinamis
                document.getElementById('page-title').innerText = 'Judul Halaman Anda';
            });

        // Muat Modal
        fetch('/components/_modal.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('modal-container').innerHTML = data;
            });
    });
</script>
```

### 3. Menggunakan Modal

Modal dikendalikan oleh variabel `modalOpen` di Alpine.js. Untuk membuka modal, Anda perlu mengatur `modalOpen = true`. Anda dapat melakukannya dengan menambahkan tombol di mana saja di halaman Anda:

```html
<button @click="modalOpen = true" class="bg-blue-500 text-white px-4 py-2 rounded">Buka Modal</button>
```

Anda juga dapat menyesuaikan judul, isi, dan tombol footer modal secara dinamis dengan JavaScript sebelum membukanya.

Contoh:
```javascript
function openCustomModal(title, content) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = content;
    // Buka modal
    document.querySelector('[x-data]').__x.$data.modalOpen = true;
}

// Panggil fungsi ini saat dibutuhkan
openCustomModal('Judul Kustom', '<p>Ini adalah konten modal yang dibuat secara dinamis.</p>');