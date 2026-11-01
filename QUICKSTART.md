# ⚡ QUICK START - Deploy in 5 Minutes

## 🎯 Langkah Super Cepat (Untuk yang buru-buru)

### 1️⃣ Update URLs (2 menit)
Buka file ini dan ganti `yourdomain.com` dengan domain kamu:

```bash
# Edit 3 file ini:
index.html      # Line 14, 15, 21
sitemap.xml     # Line 3
robots.txt      # Line 3
```

**Atau gunakan find & replace:**
```bash
# Linux/Mac:
sed -i 's/yourdomain.com/mewnbrew.com/g' index.html sitemap.xml robots.txt

# Windows PowerShell:
(Get-Content index.html) -replace 'yourdomain.com','mewnbrew.com' | Set-Content index.html
(Get-Content sitemap.xml) -replace 'yourdomain.com','mewnbrew.com' | Set-Content sitemap.xml
(Get-Content robots.txt) -replace 'yourdomain.com','mewnbrew.com' | Set-Content robots.txt
```

### 2️⃣ Deploy ke Netlify (3 menit)

**Option A: Drag & Drop (TERMUDAH)**
1. Zip folder `mewnbrew`
2. Buka https://app.netlify.com/drop
3. Drag & drop file zip
4. Done! ✅

**Option B: Via GitHub**
```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Deploy Mew & Brew"
git remote add origin https://github.com/USERNAME/mewnbrew.git
git push -u origin main

# 2. Connect di Netlify
# - Login netlify.com
# - New site from Git
# - Pick repo
# - Deploy!
```

### 3️⃣ Test Live Website (30 detik)
- [ ] Buka URL Netlify
- [ ] Test tombol WhatsApp
- [ ] Test add to cart
- [ ] Test form & send WA
- [ ] Test di mobile phone

### 4️⃣ (Optional) Custom Domain
**Di Netlify:**
- Domain settings → Add custom domain → `mewnbrew.com`

**Di DNS Provider (Niagahoster/Cloudflare):**
```
Type    Name    Value
CNAME   www     your-site.netlify.app
CNAME   @       your-site.netlify.app
```

---

## 🚨 TROUBLESHOOTING CEPAT

### WhatsApp button tidak bekerja?
✅ Nomor sudah diisi: `6281295988816` di `js/main.js` line 11

### Gambar tidak muncul?
✅ Upload folder `assets/` juga (jangan cuma HTML/CSS/JS)

### Cart tidak save?
✅ Jangan pakai incognito mode untuk test

### CSS berantakan?
✅ Clear cache: Ctrl+Shift+R atau Cmd+Shift+R

---

## 📱 TESTING CHECKLIST

Quick test sebelum kasih tau customer:

```
✅ Homepage load
✅ Logo & images tampil
✅ Scroll smooth
✅ Filter works (Kopsu/Cold Brew)
✅ Add to cart works
✅ Cart badge update
✅ Click cart → sheet open
✅ Increment/decrement works
✅ Cart persist after refresh (F5)
✅ Form validation works
✅ WhatsApp button works
✅ Copy button works
✅ Mobile responsive
✅ Coba pesan via WA (test order)
```

---

## 💡 POST-DEPLOY CHECKLIST

Setelah live:

### Immediate (Hari 1):
- [ ] Share link ke teman/keluarga untuk test
- [ ] Test order via WhatsApp
- [ ] Pastikan nomor WA terima message
- [ ] Bookmark untuk monitoring

### Week 1:
- [ ] Submit sitemap: https://search.google.com/search-console
- [ ] Test Open Graph: Kirim link via WhatsApp (cek preview)
- [ ] Monitor orders

### Month 1:
- [ ] Pasang Google Analytics (optional)
- [ ] Check performance: https://pagespeed.web.dev/
- [ ] Backup website files

---

## 🎯 MARKETING QUICK TIPS

Share link ini:

**Instagram Story/Post:**
```
☕ ORDER SEKARANG!
Kopi susu & cold brew cuma Rp10.000 💛
250ml, cocok untuk harian & acara

🔗 Link di bio!
atau langsung: [your-url]

#MewnBrew #KopiMurah #KopiSusu #ColdBrew
```

**WhatsApp Status:**
```
☕ Mew & Brew sekarang bisa order online!

✨ Semua menu Rp10.000
📦 Botol 250ml
🎉 Cocok untuk acara

Order: [your-url]
atau chat: 0812-9598-8816
```

**Facebook Post:**
```
🐱☕ Mew & Brew - Kopi untuk Semua Acara!

Kopi susu & cold brew Rp10.000
Botol 250ml, praktis & enak

🛒 Order online sekarang:
👉 [your-url]

Atau hubungi: 0812-9598-8816

#MewnBrew #KopiMurah #KopiSusu #ColdBrew #KopiEnak
```

---

## 📞 BUTUH BANTUAN?

**Website tidak bisa diakses?**
→ Cek hosting/Netlify status

**WhatsApp tidak terima message?**
→ Cek nomor format: 6281295988816 (benar)

**Mau ganti harga/produk?**
→ Baca `README.md` section "Customization"

**Mau custom lebih lanjut?**
→ Hire developer atau contact 0812-9598-8816

---

## 🎉 YOU'RE DONE!

Website sudah live dan ready menerima order!

**Share link kamu:**
📱 WhatsApp: Status & grup
📷 Instagram: Bio & story
👥 Facebook: Post & share
💬 Telegram: Channel & grup

**Selamat berjualan! 🚀**

---

**Files Penting:**
- `SUMMARY.md` - Ringkasan lengkap semua perbaikan
- `README.md` - Dokumentasi teknis
- `DEPLOY.md` - Deployment guide detail
- `CHANGELOG.md` - Version history

**Next Level:**
- [ ] Google Ads (iklan berbayar)
- [ ] Instagram Ads
- [ ] Facebook Pixel untuk retargeting
- [ ] Email newsletter (collect emails)
- [ ] Loyalty program

**Version:** 1.1.0  
**Status:** ✅ PRODUCTION READY  
**Last Update:** November 2026
