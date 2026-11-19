# Mew & Brew - Website Documentation

## Overview
Website katalog dan pemesanan untuk Mew & Brew - brand kopi susu dan cold brew dengan harga flat Rp10.000 per botol 250 ml. Checkout dikirim ke WhatsApp penjual; tidak ada backend.

> **Status lisensi:** source-available, bukan open source. Repo ini publik agar source bisa dilihat, tetapi kode tidak boleh dipakai, disalin, dimodifikasi, atau didistribusikan tanpa izin tertulis. Lihat [`LICENSE`](LICENSE) dan [`TRADEMARK.md`](TRADEMARK.md).

## Fitur Utama
- Katalog 7 produk dengan filter Kopsu / Cold Brew
- Keranjang dengan LocalStorage, batas 999 botol per item, tombol +10, dan tombol kosongkan
- Form harian / acara, termasuk alamat antar, tanggal acara, dan jenis acara "Lainnya"
- Nomor pesanan yang terikat pada isi keranjang: bertahan saat refresh, berubah saat isi keranjang berubah
- Validasi tanggal acara (tidak boleh lampau), alamat antar, dan jenis acara
- Preview pesan WhatsApp + salin ke clipboard + kirim via WhatsApp
- PWA: manifest, ikon 192/512 + maskable, service worker, dan app shell offline
- Responsive mobile-first, mobile nav, skip link, dialog dengan focus trap dan pengembalian fokus
- Aksesibilitas: ARIA labels, error terhubung ke field, kontras teks diperbaiki, reduced motion
- Loading state gambar, lazy loading untuk gambar di bawah fold, dan `srcset` belum dipakai

## Teknologi
- HTML5, CSS3 (custom properties, grid, flexbox, animasi)
- Vanilla JavaScript, tanpa dependency
- LocalStorage untuk keranjang, form, dan nomor pesanan
- WebP/PNG untuk aset
- Service worker `sw.js` untuk app shell offline

## Struktur File
```
mewnbrew/
├── index.html              # Halaman utama
├── 404.html                # Halaman 404
├── manifest.json           # Manifest PWA
├── favicon.svg             # Favicon
├── sw.js                   # Service worker
├── _headers                # Header Netlify / Cloudflare Pages
├── vercel.json             # Header Vercel
├── .htaccess               # Compression, cache, security untuk Apache
├── robots.txt
├── sitemap.xml
├── LICENSE                 # Lisensi kode + aset brand
├── NOTICE                  # Lisensi lama, pihak ketiga, canary
├── TRADEMARK.md            # Notice merek + checklist DJKI
├── css/style.css
├── js/main.js
├── assets/img/             # Label, doodle, foto, ikon PWA, OG image
└── docs: README, CHANGELOG, DEPLOY, QUICKSTART, SUMMARY
```

## Setup & Deploy

### Local Development
1. Clone atau extract project.
2. Jalankan static server (service worker membutuhkan `http://localhost`, bukan `file://`):
   ```bash
   php -S localhost:8000
   # atau
   python -m http.server 8000
   # atau
   npx http-server -p 8000
   ```
3. Buka `http://localhost:8000`.

### Production Deploy
**Hosting gratis:**
- Netlify (drag & drop atau GitHub): `_headers` otomatis dipakai.
- Cloudflare Pages: `_headers` dipakai.
- Vercel: `vercel.json` dipakai.
- GitHub Pages: tidak membaca `_headers`/`.htaccess`; header keamanan perlu diatur lewat layanan lain. URL default proyek: `https://enpidi26.github.io/mewnbrew/`.

**Domain custom:**
1. Deploy.
2. Ganti semua `https://enpidi26.github.io/mewnbrew/` di `index.html`, `robots.txt`, `sitemap.xml`, dan dokumentasi ini dengan domain akhir.
3. Pastikan `start_url` dan `scope` di `manifest.json` tetap `./` agar aman di root maupun subfolder.
4. Aktifkan HTTPS; HSTS di `_headers`/`.htaccess` hanya berlaku di HTTPS.

## Konfigurasi

### Nomor WhatsApp
File: `js/main.js` baris 8
```javascript
const SELLER_WA = "6281295988816"; // format 62xxx, tanpa + dan spasi
```
Nomor juga muncul di JSON-LD (`index.html`), footer, dan dokumentasi. Ubah semuanya jika nomor berganti.

### Harga Produk
File: `js/main.js` baris 10
```javascript
const PRICE = 10000;
```
Saat halaman dimuat, `syncPrices()` menyamakan `price-pill`, teks hero, marquee, dan `syncJsonLd()` menyamakan `offers.price` di JSON-LD. Kartu HTML menyimpan nilai fallback untuk no-JS/SEO, jadi setelah mengubah `PRICE` sebaiknya ganti juga teks `Rp10.000` statis di `index.html` (cari `Rp10.000`), nilai `offers.price` di JSON-LD, dan meta deskripsi/OG.

### Menu Produk
File: `js/main.js` baris 18
```javascript
const MENU = [
  // id, group, name, display, script, variant, tag, img, alt, doodle
];
```
`syncCatalog()` membuat kartu untuk item MENU yang belum punya kartu HTML. Untuk kontrol visual penuh (doodle, varian, alt), tetap tambahkan kartu di `index.html`; untuk item baru yang sederhana, cukup tambahkan ke MENU dan kartu akan dibuat otomatis. Item baru tetap perlu ditambahkan manual ke JSON-LD/SEO jika ingin terindeks tanpa JavaScript.

### Cache / Service Worker
Setiap kali `css/style.css`, `js/main.js`, atau aset inti berubah:
1. Naikkan `CACHE` di `sw.js` (misalnya `mewnbrew-v1.2.1` → `mewnbrew-v1.2.2`).
2. Naikkan query versi di `index.html` (`css/style.css?v=...` dan `js/main.js?v=...`) serta daftar `APP_SHELL` di `sw.js`.
3. Deploy. Browser akan mengambil service worker baru; cache lama dihapus saat activate.

### Nomor Pesanan
Format: `MB-YYMMDD-HHMM-RRR`. Nomor disimpan di `mewnbrew_order` bersama signature isi keranjang. Nomor tetap selama isi keranjang sama; berubah saat jumlah/item berubah; dihapus saat keranjang dikosongkan.

## Bug Fixes v1.2.0
- Gambar produk tetap terlihat saat JavaScript mati/gagal (opacity hanya digerbangi `.js`; early init + fallback 4 detik).
- Nomor pesanan tidak lagi dipakai ulang untuk isi keranjang berbeda; bertahan setelah refresh dan direset saat keranjang kosong.
- Isi LocalStorage divalidasi: negatif → 0, pecahan → dibulatkan ke bawah, lebih dari 999 → 999.
- Harga tampilan disinkronkan dari `PRICE`; menu baru di `MENU` otomatis mendapat kartu.
- Tanggal acara divalidasi (tidak boleh lampau) dan ikut tersimpan.
- Mode Acara + Antar sekarang meminta alamat dan memasukkannya ke pesan.
- Jenis acara "Lainnya" punya field teks dan validasi.
- Error form punya `aria-describedby`, hilang saat field diperbaiki, dan tidak memakai `alert()`.
- Tombol salin tidak macet di "✓ Disalin!" setelah klik ganda.
- Catatan WhatsApp tidak lagi mengklaim sukses saat popup diblokir, dan direset saat order berubah.
- Dialog punya focus trap, mengembalikan fokus, dan membuat background inert/aria-hidden.
- Tombol +/- di sheet mempertahankan fokus setelah re-render.
- Tombol +10 dinonaktifkan di 999; indikator maksimum juga muncul di sheet.
- Foto acara tidak lagi keluar dari kartu (margin `figure` direset).
- Kartu tidak bertumpuk di layout 3 kolom.
- Kontras CTA/teks kecil diperbaiki; outline fokus input dikembalikan.
- PWA dilengkapi service worker, ikon persegi 192/512, maskable, dan `start_url`/`scope` relatif.
- Open Graph/Twitter/JSON-LD memakai URL absolut, canonical, OG image 1200×630, dan tipe `CafeOrCoffeeShop`.
- `_headers`/`vercel.json` ditambahkan; `.htaccess` memakai `ErrorDocument 404`, `Options -Indexes`, dan CSP/HSTS/Permissions-Policy.
- Gambar di bawah fold memakai `loading="lazy"`; cache CSS/JS memakai query versi.

## Browser Support
- Chrome/Edge 108+
- Firefox 101+
- Safari 15.4+

CSS memakai `aspect-ratio`, `dvh`, `inert`, dan `rotate`; browser lama akan kehilangan sebagian tata letak/animasi.

## Performance
- WebP untuk label/foto; ikon PWA PNG.
- `loading="lazy"` untuk gambar di bawah fold; hero memakai `fetchpriority="high"`.
- CSS/JS diberi query versi dan cache panjang; service worker menyajikan app shell saat offline.
- Label 900×900 masih dipakai untuk kartu kecil; `srcset`/resize adalah optimasi berikutnya.

## Security
- Tidak ada `eval()` atau `innerHTML` dengan input pembeli; `innerHTML` hanya untuk konstanta menu.
- Input masuk ke pesan lewat `textContent` dan `encodeURIComponent`.
- `noopener` untuk WhatsApp/footer link.
- Header keamanan tersedia di `_headers`, `vercel.json`, dan `.htaccess` (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Data form (nama, alamat, lokasi, pembayaran, catatan) disimpan di LocalStorage tanpa expiry; sediakan tombol hapus di browser jika perangkat dipakai bersama.

## SEO
- Description, canonical, Open Graph, Twitter Card, JSON-LD `CafeOrCoffeeShop` dengan `hasMenu`, `robots.txt`, `sitemap.xml`.
- OG image: `assets/img/og-mew-brew.png` (1200×630).
- Ganti URL `https://enpidi26.github.io/mewnbrew/` jika memakai domain lain.

## Testing
E2E manual/headless yang sudah dijalankan mencakup: katalog, filter, keranjang, clamp LocalStorage, nomor pesanan, validasi tanggal/alamat/Lainnya, persistensi form, fokus dialog, copy ganda, `sentNote`, harga/menu dinamis, layout 375/768/1024, JS-off, PWA offline, SEO, dan 404.

## Support
Website ini dibuat oleh **Navid Athallah and Team**.

- WhatsApp: 0812-9598-8816
- Order via web: `https://enpidi26.github.io/mewnbrew/` (ganti jika domain berbeda)

## License & Brand

**Source-available, bukan open source.** Kode saat ini milik Mew & Brew dan tidak dilisensikan untuk dipakai, disalin, dimodifikasi, atau didistribusikan tanpa izin tertulis. Melihat repo publik bukan izin untuk memakai.

| Bagian | Ketentuan |
|---|---|
| **Kode & konfigurasi** (HTML, CSS, JS, config) | **Proprietary/source-available** - lihat [`LICENSE`](LICENSE) |
| **Aset brand** (logo, nama “Mew & Brew”, ilustrasi kucing, label, foto, teks pemasaran, ikon PWA, OG image) | **Proprietary** - lihat [`TRADEMARK.md`](TRADEMARK.md) |
| **Dokumentasi** | **Proprietary** |
| **Versi sebelum 19 November 2026** (termasuk commit `a898a9f`) | **MIT**; salinan yang sudah diperoleh tetap MIT |

- Lisensi komersial atau izin penggunaan: WhatsApp 0812-9598-8816.
- Lisensi baru **tidak mencabut** hak salinan lama yang sudah diperoleh di bawah MIT. Riwayat commit tetap menyimpan versi tersebut.
- Font Fraunces dan Plus Jakarta Sans dimuat via Google Fonts di bawah SIL Open Font License 1.1; tidak ada library JS pihak ketiga. Lihat [`NOTICE`](NOTICE).

## Brand & Copy Protection

- **Canary:** source ini mengandung penanda unik di `index.html`, CSS, JS, dan service worker. Kalau penanda itu muncul di situs/repo lain, itu indikasi salinan tanpa izin; simpan bukti dan laporkan ke host.
- **Merek:** daftarkan logo/nama di DJKI (kelas 30/43/35; konsultasikan). Gunakan ™ sampai terdaftar; jangan memakai ® sebelum sertifikat terbit. Checklist ada di [`TRADEMARK.md`](TRADEMARK.md).
- **Aset master:** simpan file sumber logo/ilustrasi/foto; publikasikan versi teroptimasi/berwatermark. Repo publik tetap menampilkan aset yang di-commit.
- **Monitoring:** pantau GitHub code search, Google, dan reverse image search. Kirim takedown ke GitHub/Netlify/Cloudflare/host lain; simpan bukti sebelum menegur.
- **Kepemilikan:** pastikan Mew & Brew memegang hak cipta kode. Kalau ada tim/freelancer, siapkan IP assignment/NDA.
- **Batas teknis:** repo publik berarti kode bisa dibaca dan disalin; lisensi memberi dasar hukum, bukan pencegahan teknis. Jangan menaruh rahasia dagang di kode frontend.

---

**Version:** 1.2.1

**Last Updated:** November 2026
