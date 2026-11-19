# Changelog

All notable changes to Mew & Brew website will be documented in this file.

## [1.2.1] - 2026-11-19

### Changed
- Lisensi kode dipindah dari MIT ke **proprietary/source-available**. Kode tetap bisa dilihat di repo publik, tetapi tidak boleh dipakai, disalin, dimodifikasi, atau didistribusikan tanpa izin tertulis.
- Aset brand tetap proprietary; ditambahkan `TRADEMARK.md` dan `NOTICE`.
- Ditambahkan header lisensi dan canary di `index.html`, `404.html`, `css/style.css`, `js/main.js`, dan `sw.js`.
- Versi aset/cache dinaikkan ke `1.2.1` (`sw.js`, query CSS/JS, README, QUICKSTART, SUMMARY).
- README diperbarui: source-available, lisensi komersial, prior MIT, pihak ketiga, merek, monitoring, dan kepemilikan.

### Notes
- Kode yang dipublikasikan sebelum 19 November 2026, termasuk commit `a898a9f`, tetap MIT untuk salinan yang sudah diperoleh. Lisensi baru hanya berlaku untuk versi saat ini dan berikutnya.
- Tidak ada perubahan perilaku situs pada rilis ini.

## [1.2.0] - 2026-11-19

### Fixed
- Gambar produk tidak lagi hilang saat JavaScript mati/gagal: opacity hanya aktif di bawah `.js`, `initImageLoad` dijalankan lebih awal, dan ada fallback 4 detik.
- Nomor pesanan sekarang terikat pada signature keranjang: bertahan saat refresh, berubah saat isi keranjang berubah, dan direset saat keranjang kosong.
- LocalStorage keranjang divalidasi: negatif menjadi 0, pecahan dipotong, dan nilai >999 menjadi 999.
- Tanggal acara tidak boleh di masa lalu dan sekarang ikut tersimpan/restore.
- Mode Acara + Antar sekarang menampilkan dan mewajibkan alamat; alamat masuk ke pesan WhatsApp.
- Jenis acara "Lainnya" sekarang punya field teks + validasi.
- Error form punya `aria-describedby`, hilang saat field diperbaiki, dan tidak lagi memakai `alert()`.
- Tombol salin tidak macet di "✓ Disalin!" setelah klik ganda.
- Catatan WhatsApp tidak lagi menampilkan klaim sukses palsu dan direset saat order berubah.
- Dialog punya focus trap, focus restore, dan background `inert`/`aria-hidden`.
- Fokus tombol +/- di sheet dipertahankan setelah re-render; tombol +10 dinonaktifkan di 999; indikator maksimum muncul di sheet.
- Foto acara tidak lagi keluar dari kartu (margin `figure` direset).
- Kartu tidak bertumpuk di layout 3 kolom.
- Kontras CTA/teks kecil diperbaiki; outline fokus input dikembalikan.
- `loading="eager"` di gambar bawah fold diganti `loading="lazy"`.

### Added
- PWA lengkap: service worker `sw.js`, cache app shell, ikon 192/512 + maskable, `start_url`/`scope` relatif.
- OG image 1200×630 (`assets/img/og-mew-brew.png`), canonical, `og:locale`, `og:site_name`.
- JSON-LD diubah ke `CafeOrCoffeeShop` + `url` + `image` absolut + `hasMenu`.
- `_headers` (Netlify/Cloudflare Pages) dan `vercel.json` (Vercel).
- Mobile nav, skip link, footer WhatsApp CTA, tombol kosongkan keranjang.
- `syncPrices()` dan `syncCatalog()`: harga tampilan dan kartu mengikuti `PRICE`/`MENU`.
- Versi aset `?v=1.2.0` untuk cache busting.

### Changed
- `.htaccess`: `ErrorDocument 404`, `Options -Indexes`, CSP/HSTS/Permissions-Policy, hapus `X-XSS-Protection`.
- `robots.txt` dan `sitemap.xml` memakai URL absolut proyek.
- 404.html memakai link relatif + `noindex`.

## [1.1.0] - 2026-11-01

### 🔧 Fixed
- **CRITICAL:** Nomor WhatsApp penjual sudah diisi: `6281295988816`
- **CRITICAL:** Validasi jenis acara untuk mode "Acara" ditambahkan
- **BUG:** Date input minimum sekarang reactive (update tiap jam)
- **BUG:** Order number format diperbaiki untuk menghindari collision: `MB-YYMMDD-HHMM-RRR`
- **BUG:** Clipboard copy error handling diperbaiki dengan feedback ke user
- **BUG:** Form validation sekarang lebih strict dan informatif
- **BUG:** Debounce aria-live tidak berfungsi (atribut `aria-live` sudah ada, jadi
  reset-nya no-op). Diganti dengan satu live region `#cartAnnouncer` yang diisi
  nilai akhir setelah user berhenti klik.
- **BUG:** `loadForm()` dipanggil sebelum `const $` dideklarasikan (TDZ) sehingga
  data form tidak pernah ter-restore secara diam-diam.

### ✨ Added
- **LocalStorage persistence** untuk shopping cart & form data
- **Max quantity indicator** (999 botol) dengan visual feedback
- **Loading state** untuk product images dengan shimmer effect
- **Debounced aria-live** announcements untuk screen reader
- **PWA support** dengan manifest.json
- **Favicon** (cat icon SVG)
- **Open Graph tags** untuk WhatsApp/Facebook preview
- **Twitter Card** meta tags
- **JSON-LD structured data** untuk SEO (LocalBusiness schema)
- **robots.txt** dan **sitemap.xml**
- **404 error page** yang user-friendly
- **.htaccess** dengan compression, caching, dan security headers
- **README.md** dengan dokumentasi lengkap
- **CHANGELOG.md** untuk tracking versi
- **LICENSE** dengan lisensi terpisah: kode di bawah MIT, aset brand tetap
  proprietary (logo, maskot kucing, label produk, foto produk, nama "Mew & Brew")
- **.gitignore** untuk mengecualikan file junk OS dan editor

### 🎨 Improved
- Form data sekarang auto-save ke LocalStorage
- Increment button disabled saat mencapai max (999)
- Better copy feedback: "✓ Disalin!" atau "Gagal menyalin"
- Order number sekarang include timestamp untuk uniqueness

### 📝 Documentation
- README.md dengan setup instructions
- Deployment guide untuk berbagai platform
- Configuration guide untuk developer
- Performance metrics documented

---

## [1.0.0] - 2026-10-31

### 🎉 Initial Release
- Hero section dengan cat mascot
- Product catalog dengan 7 menu items
- Filter by category (Kopsu / Cold Brew)
- Shopping cart dengan stepper controls
- Order form (Harian / Acara)
- WhatsApp integration
- Copy to clipboard functionality
- Responsive design
- Accessibility features (ARIA labels, keyboard nav)
- Smooth animations dan scroll reveal
- Custom doodle illustrations
