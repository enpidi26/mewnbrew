# 🚀 Deployment Guide - Mew & Brew

## Pre-Deployment Checklist

### ✅ Wajib Dicek Sebelum Deploy:

1. **Nomor WhatsApp sudah benar?**
   - File: `js/main.js` line 11
   - Format: `6281295988816` (62 + nomor tanpa 0)
   - Test: Buka website → tambah produk → coba tombol "Kirim via WhatsApp"

2. **Semua gambar ada?**
   ```bash
   # Check all images exist
   ls assets/img/*.webp assets/img/*.png
   ```
   Should show 31 files (logo, labels, doodles, photos)

3. **Update domain di file-file ini:**
   - `sitemap.xml` line 3: ganti `yourdomain.com`
   - `index.html` line 14: Open Graph URL
   - `README.md`: ganti semua `your-domain.com` atau `yourdomain.com`

4. **Test local dulu:**
   ```bash
   php -S localhost:8000
   # Buka http://localhost:8000
   # Test semua fitur: tambah cart, isi form, kirim WA
   ```

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Paling Mudah)

**Gratis, auto SSL, CDN global**

#### Via Drag & Drop (Tercepat):
1. Zip folder `mewnbrew`
2. Buka https://app.netlify.com/drop
3. Drag & drop file zip
4. Done! Langsung live dengan subdomain netlify

#### Via Git (Auto Deploy):
```bash
# 1. Init git (kalau belum)
cd mewnbrew
git init
git add .
git commit -m "Initial commit"

# 2. Push ke GitHub
# Buat repo baru di github.com
git remote add origin https://github.com/USERNAME/mewnbrew.git
git push -u origin main

# 3. Connect di Netlify
# - Login ke netlify.com
# - New site from Git
# - Pilih repo
# - Deploy!
```

**Custom Domain di Netlify:**
1. Domain settings → Add custom domain
2. Di registrar domain (Niagahoster, Cloudflare, dll):
   - Tambah CNAME record: `www` → `your-site.netlify.app`
   - Atau A record: `@` → IP Netlify
3. SSL otomatis active dalam 24 jam

---

### Option 2: Vercel

**Gratis, super cepat, bagus untuk developer**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd mewnbrew
vercel

# Follow prompts:
# - Login dengan GitHub/email
# - Confirm project settings
# - Done!

# Production deploy
vercel --prod
```

**Custom Domain:**
```bash
vercel domains add yourdomain.com
# Follow DNS instructions
```

---

### Option 3: GitHub Pages

**Gratis, langsung dari GitHub**

```bash
# 1. Buat repo di GitHub (public)
# 2. Push code
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/mewnbrew.git
git push -u origin main

# 3. Enable GitHub Pages
# - Repo Settings → Pages
# - Source: Deploy from branch
# - Branch: main, folder: / (root)
# - Save
```

**Accessible at:** `https://username.github.io/mewnbrew/`

**Custom Domain:**
1. Settings → Pages → Custom domain
2. Tambah `yourdomain.com`
3. Di DNS provider, tambah records:
   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   username.github.io
   ```

---

### Option 4: Cloudflare Pages

**Gratis dengan CDN terbaik**

#### Via Dashboard:
1. Login https://dash.cloudflare.com
2. Pages → Create a project
3. Connect to Git (GitHub) atau Upload files
4. Deploy!

#### Via Wrangler CLI:
```bash
npm install -g wrangler
wrangler login
wrangler pages publish mewnbrew --project-name=mewnbrew
```

---

### Option 5: Shared Hosting (cPanel)

**Untuk hosting berbayar tradisional**

1. **Upload via FTP/cPanel File Manager:**
   - Zip folder `mewnbrew`
   - Upload ke `public_html/`
   - Extract di server

2. **Struktur akhir:**
   ```
   public_html/
   ├── index.html
   ├── manifest.json
   ├── favicon.svg
   ├── .htaccess
   ├── css/
   ├── js/
   └── assets/
   ```

3. **Cek .htaccess aktif:**
   - cPanel → File Manager → Show hidden files (dot files)
   - Pastikan `.htaccess` ada dan readable

4. **SSL/HTTPS:**
   - cPanel → SSL/TLS Status → Run AutoSSL
   - Atau manual: Let's Encrypt certificate

---

## ⚙️ Post-Deployment Tasks

### 1. Update URLs Absolut
Setelah deploy, ganti di file ini:

**index.html:**
```html
<meta property="og:url" content="https://mewnbrew.com" />
<meta property="og:image" content="https://mewnbrew.com/assets/img/logo-mew-brew.png" />
<meta name="twitter:image" content="https://mewnbrew.com/assets/img/logo-mew-brew.png" />
```

**sitemap.xml:**
```xml
<loc>https://mewnbrew.com/</loc>
```

**robots.txt:**
```
Sitemap: https://mewnbrew.com/sitemap.xml
```

### 2. Test Website

**Functionality Test:**
- [ ] Homepage loads dengan gambar
- [ ] Filter Kopsu/Cold Brew bekerja
- [ ] Tambah produk ke cart
- [ ] Cart persist setelah refresh
- [ ] Buka sheet/drawer
- [ ] Toggle Harian/Acara
- [ ] Isi form lengkap
- [ ] Validasi error muncul jika field kosong
- [ ] Copy order bekerja
- [ ] Tombol WhatsApp terbuka dengan benar
- [ ] Mobile responsive (test di phone)

**Performance Test:**
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Target: Score 90+ desktop, 80+ mobile

**SEO Test:**
- Google Rich Results Test: https://search.google.com/test/rich-results
- Pastikan LocalBusiness schema valid

**Social Preview Test:**
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- WhatsApp preview: Kirim link ke diri sendiri

### 3. Submit ke Search Engines

**Google Search Console:**
1. https://search.google.com/search-console
2. Add property → Domain atau URL prefix
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

**Bing Webmaster Tools:**
1. https://www.bing.com/webmasters
2. Add site
3. Submit sitemap

### 4. Setup Analytics (Optional)

**Google Analytics 4:**
```html
<!-- Tambahkan sebelum </head> di index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Simple Analytics (Privacy-friendly):**
```html
<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" /></noscript>
```

---

## 🔒 Security Hardening (Production)

### Force HTTPS
Uncomment di `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### Content Security Policy
Tambahkan di `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://www.google-analytics.com">
```

---

## 📊 Monitoring

### Uptime Monitoring (Gratis):
- **UptimeRobot**: https://uptimerobot.com (50 monitors free)
- **Freshping**: https://www.freshworks.com/website-monitoring (50 checks free)

### Error Tracking:
- **Sentry**: https://sentry.io (5k errors/month free)
- Tambah SDK di `<head>` untuk catch JS errors

---

## 🆘 Troubleshooting

### Tombol WhatsApp tidak bekerja
- Cek `js/main.js` line 11: `SELLER_WA` harus ada isinya
- Format harus `62xxx` tanpa +, spasi, atau tanda kurung
- Test manual: `https://wa.me/6281295988816?text=Test`

### Images tidak muncul (404)
- Cek path: harus `assets/img/filename.webp` (lowercase)
- Upload ulang folder `assets/` ke server
- Cek file permissions: 644 untuk files, 755 untuk folders

### CSS/JS tidak load
- Clear browser cache (Ctrl+Shift+R)
- Cek path di `index.html`: `css/style.css` dan `js/main.js`
- Cek di browser DevTools → Network tab

### Cart tidak persist
- Cek browser support localStorage (semua modern browser OK)
- Cek browser tidak dalam private/incognito mode
- Clear localStorage: `localStorage.clear()` di Console

### Form tidak submit
- Buka Console (F12) untuk cek error
- Validasi harus pass: nama, alamat (jika antar), tanggal (jika acara)
- Test validasi: coba submit tanpa isi nama

---

## 📞 Support

**Need Help?**
- WhatsApp: 0812-9598-8816
- Email: (tambahkan jika ada)

**Report Issues:**
- GitHub Issues: (link ke repo jika public)

---

**Happy Deploying! 🎉**

Website ini production-ready dan siap melayani customer Mew & Brew!
