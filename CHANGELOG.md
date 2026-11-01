# Changelog

All notable changes to Mew & Brew website will be documented in this file.

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
