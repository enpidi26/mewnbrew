# Mew & Brew - Website Documentation

## 🎯 Overview
Website katalog dan pemesanan untuk Mew & Brew - brand kopi susu dan cold brew dengan harga flat Rp10.000 per botol 250ml.

## 📱 Fitur Utama
- ✅ Katalog produk interaktif dengan filter (Kopsu / Cold Brew)
- ✅ Shopping cart dengan LocalStorage persistence
- ✅ Form pemesanan untuk harian & acara
- ✅ Integrasi WhatsApp untuk order
- ✅ Copy to clipboard untuk order manual
- ✅ Responsive design (mobile-first)
- ✅ Accessibility compliant (ARIA labels, keyboard navigation)
- ✅ Loading states untuk images
- ✅ Dark mode compatible color scheme

## 🛠️ Teknologi
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript** - No dependencies
- **LocalStorage** - Cart & form persistence
- **WebP** - Optimized images

## 📁 Struktur File
```
mewnbrew/
├── index.html          # Main page
├── manifest.json       # PWA manifest
├── favicon.svg         # Favicon (cat icon)
├── README.md          # This file
├── css/
│   └── style.css      # All styles
├── js/
│   └── main.js        # All functionality
└── assets/
    └── img/           # Product images & doodles
```

## 🚀 Setup & Deploy

### Local Development
1. Clone atau extract project
2. Buka `index.html` di browser modern
3. Atau gunakan local server:
   ```bash
   # PHP
   php -S localhost:8000
   
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server)
   npx http-server -p 8000
   ```

### Production Deploy
**Hosting Gratis:**
- **Netlify**: Drag & drop folder ke netlify.com/drop
- **Vercel**: `vercel --prod` (install: `npm i -g vercel`)
- **GitHub Pages**: Push ke repo, enable di Settings > Pages
- **Cloudflare Pages**: Connect GitHub repo

**Domain Custom:**
1. Deploy ke hosting pilihan
2. Point domain A record ke hosting IP
3. Update nomor WA di `js/main.js` jika perlu

## ⚙️ Konfigurasi

### Nomor WhatsApp
File: `js/main.js` line 11
```javascript
const SELLER_WA = "6281295988816";  // Format: 62xxx (tanpa +)
```

### Harga Produk
File: `js/main.js` line 13
```javascript
const PRICE = 10000;  // Harga per botol dalam Rupiah
```

### Menu Produk
File: `js/main.js` lines 14-22
```javascript
const MENU = [
  { id:"classic", group:"kopsu", name:"Kopsu Classic", img:"...", alt:"..." },
  // ... tambah/edit produk di sini
];
```

## 🐛 Bug Fixes (v1.1)
✅ **CRITICAL:**
- Nomor WhatsApp sudah diisi: `6281295988816`
- Validasi jenis acara ditambahkan
- LocalStorage untuk persist cart & form

✅ **IMPROVEMENTS:**
- Order number format: `MB-YYMMDD-HHMM-RRR` (lebih unique)
- Date minimum validation reactive (update tiap jam)
- Max quantity indicator (999 botol)
- Debounced aria-live announcements
- Better error handling untuk clipboard
- Loading state untuk images
- Single `#cartAnnouncer` live region (announces the settled cart count once)

## 🎨 Customization

### Warna Brand
File: `css/style.css` lines 2-8
```css
:root{
  --teal:#0C2C3B;      /* Primary dark */
  --cream:#F7F6F1;     /* Background */
  --tan:#DAB78D;       /* Accent light */
  --caramel:#BA9165;   /* Accent medium */
  --rust:#B84A2A;      /* Accent warm */
}
```

### Font
Menggunakan:
- **Fraunces** (headings, italic script) - Google Fonts
- **Plus Jakarta Sans** (body text) - Google Fonts

Ganti di `index.html` line 11 atau `css/style.css` line 19

## 📊 Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

**Optimizations:**
- WebP images (50-70% smaller than PNG)
- Loading="eager" untuk above-fold images
- Loading="lazy" untuk below-fold images
- CSS animations dengan `will-change` hints
- No external JavaScript dependencies

## 🔒 Security
- No inline JavaScript (all in main.js)
- Sanitized user inputs (trim, validation)
- `noopener` untuk external links
- No eval() atau innerHTML dengan user data
- HTTPS recommended untuk production

## 📱 Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Chrome/Safari (iOS 14+, Android 10+)

**Fallbacks:**
- IntersectionObserver → immediate reveal
- Clipboard API → execCommand fallback
- LocalStorage → in-memory only (rare)

## 🎯 SEO
**Meta tags sudah include:**
- ✅ Description
- ✅ Viewport
- ✅ Color scheme
- ✅ Semantic HTML5

**TODO untuk SEO lebih baik:**
- [ ] Open Graph tags (Facebook/WhatsApp preview)
- [ ] Twitter Card meta
- [ ] Structured data (JSON-LD untuk LocalBusiness)
- [ ] robots.txt
- [ ] sitemap.xml

## 📞 Support
Website ini dibuat oleh **Navid Athallah and Team**.

**Contact:**
- WhatsApp: 0812-9598-8816
- Order via web: [your-domain.com]

## 📄 License

Proyek ini memakai lisensi **terpisah untuk kode dan aset brand** — lihat [`LICENSE`](LICENSE) untuk teks lengkap.

| Bagian | Ketentuan |
|---|---|
| **Kode sumber** (HTML, CSS, JS, config) | **MIT License** — bebas dipakai, dimodifikasi, dan didistribusikan, dengan menyertakan notice hak cipta |
| **Aset brand** (logo, nama "Mew & Brew", ilustrasi kucing, label produk, foto produk, teks pemasaran) | **Proprietary** — © 2026 Mew & Brew. Dilarang disalin atau dipakai untuk keperluan komersial tanpa izin tertulis |

Singkatnya: kamu boleh memakai dan mempelajari **kodenya**, tetapi tidak boleh memakai **identitas visual dan merek** Mew & Brew.

Untuk perizinan aset brand atau kerja sama, hubungi WhatsApp [0812-9598-8816](https://wa.me/6281295988816).

---

**Version:** 1.1.0  
**Last Updated:** November 2026  
**Status:** ✅ Production Ready
