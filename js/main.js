/*
 * Mew & Brew — proprietary source-available.
 * Copyright (c) 2026 Mew & Brew. All rights reserved. See LICENSE.
 * Canary: mewnbrew-canary-7f3a91c2-2026-11-19
 */

document.documentElement.classList.add('js');

/* ============================================================
   KONFIGURASI PENJUAL
   Nomor WhatsApp penjual dalam format 62xxx (tanpa +, tanpa spasi).
   Format: 0812-9598-8816 → 6281295988816
   ============================================================ */
const SELLER_WA = "6281295988816";

const PRICE = 10000;
const MAX_QTY = 999;
const COPY_LABEL = "Salin Pesanan";

/* Satu sumber data untuk keranjang dan render kartu tambahan.
   Kartu HTML di index.html tetap menjadi baseline no-JS/SEO;
   syncCatalog() menambahkan kartu yang belum ada di HTML dan
   syncPrices() menyamakan semua harga tampilan dengan PRICE. */
const MENU = [
  { id:"classic",   group:"kopsu", name:"Kopsu Classic", display:"KOPSU", script:"classic", variant:null,
    tag:"smooth, creamy, purr-fecto", img:"assets/img/label-kopsu-classic.webp",
    alt:"Label Kopsu Classic", doodle:"assets/img/doodle-cangkir-latte-teal.webp" },
  { id:"oat",       group:"kopsu", name:"Kopsu Oat", display:"KOPSU", script:"oat", variant:null,
    tag:"smooth, creamy, purr-fecto", img:"assets/img/label-kopsu-oat.webp",
    alt:"Label Kopsu Oat", doodle:"assets/img/doodle-gelas-takeaway-teal.webp" },
  { id:"regal",     group:"kopsu", name:"Kopsu Regal", display:"KOPSU", script:"regal", variant:null,
    tag:"smooth, creamy, purr-fecto", img:"assets/img/label-kopsu-regal.webp",
    alt:"Label Kopsu Regal", doodle:"assets/img/doodle-moka-pot-rust.webp" },
  { id:"gayo",      group:"cold",  name:"Cold Brew Gayo", display:"COLD", script:"brew", variant:"Gayo",
    tag:"brewed cold, made to wake you up", img:"assets/img/label-cold-brew-gayo.webp",
    alt:"Label Cold Brew Gayo", doodle:"assets/img/doodle-teko-susu-teal.webp" },
  { id:"kerinci",   group:"cold",  name:"Cold Brew Kerinci", display:"COLD", script:"brew", variant:"Kerinci",
    tag:"brewed cold, made to wake you up", img:"assets/img/label-cold-brew-kerinci.webp",
    alt:"Label Cold Brew Kerinci", doodle:"assets/img/doodle-cangkir-latte-rust.webp" },
  { id:"puntang",   group:"cold",  name:"Cold Brew Puntang", display:"COLD", script:"brew", variant:"Puntang",
    tag:"brewed cold, made to wake you up", img:"assets/img/label-cold-brew-puntang.webp",
    alt:"Label Cold Brew Puntang", doodle:"assets/img/doodle-gelas-latte-teal.webp" },
  { id:"kintamani", group:"cold",  name:"Cold Brew Kintamani", display:"COLD", script:"brew", variant:"Kintamani",
    tag:"brewed cold, made to wake you up", img:"assets/img/label-cold-brew-kintamani.webp",
    alt:"Label Cold Brew Kintamani", doodle:"assets/img/doodle-moka-pot-teal.webp" }
];

const CART_KEY = "mewnbrew_cart";
const FORM_KEY = "mewnbrew_form";
const ORDER_KEY = "mewnbrew_order";

function readStore(key){
  try { return localStorage.getItem(key); } catch(e){ return null; }
}
function writeStore(key, value){
  try {
    if(value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch(e){}
}

function loadCart(){
  const saved = readStore(CART_KEY);
  if(!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if(!parsed || typeof parsed !== "object") return;
    MENU.forEach(function(m){
      const raw = parsed[m.id];
      if(typeof raw === "number") cart[m.id] = normalizeQty(raw);
    });
  } catch(e){}
}
function saveCart(){
  writeStore(CART_KEY, JSON.stringify(cart));
}

const cart = {};
MENU.forEach(function(m){ cart[m.id] = 0; });
let mode = "harian";        // "harian" | "acara"
let fulfil = "ambil";       // "ambil" | "antar"
let eventType = null;
let orderNo = null;
let orderSig = null;
let sheetOpen = false;
let prevTotals = 0;
let lastFocused = null;
let copyTimer = null;
let filterAnnounceTimer = null;

const $ = function(s, r){ return (r || document).querySelector(s); };
const $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
const EVENT_TYPES = $$("[data-event]").map(function(b){ return b.getAttribute("data-event"); });

function val(id){
  const el = $("#" + id);
  return el ? el.value : "";
}
function fmt(n){ return "Rp" + n.toLocaleString("id-ID"); }
function normalizeQty(q){
  const n = Number(q);
  if(!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_QTY, Math.trunc(n)));
}
function todayISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function totals(){
  let bottles = 0;
  MENU.forEach(function(m){ bottles += cart[m.id]; });
  return { bottles: bottles, total: bottles * PRICE };
}
function menuById(id){ return MENU.filter(function(m){ return m.id === id; })[0]; }
function cartSignature(){
  return MENU.map(function(m){ return m.id + ":" + cart[m.id]; }).join("|");
}

function loadForm(){
  const saved = readStore(FORM_KEY);
  if(!saved) return;
  try {
    const f = JSON.parse(saved);
    if(!f || typeof f !== "object") return;
    if(f.mode === "harian" || f.mode === "acara") mode = f.mode;
    if(f.fulfil === "ambil" || f.fulfil === "antar") fulfil = f.fulfil;
    if(EVENT_TYPES.indexOf(f.eventType) !== -1) eventType = f.eventType;
    if(typeof f.name === "string") $("#fName").value = f.name;
    if(typeof f.address === "string") $("#fAddress").value = f.address;
    if(typeof f.location === "string") $("#fLocation").value = f.location;
    if(typeof f.payment === "string") $("#fPayment").value = f.payment;
    if(typeof f.note === "string") $("#fNote").value = f.note;
    if(typeof f.eventOther === "string") $("#fEventOther").value = f.eventOther;
    // Tanggal acara yang sudah lewat tidak dipulihkan sebagai nilai valid.
    if(typeof f.date === "string" && f.date && f.date >= todayISO()) $("#fDate").value = f.date;
  } catch(e){}
}
function saveForm(){
  writeStore(FORM_KEY, JSON.stringify({
    mode: mode,
    fulfil: fulfil,
    eventType: eventType,
    name: val("fName").trim(),
    address: val("fAddress").trim(),
    location: val("fLocation").trim(),
    payment: val("fPayment").trim(),
    note: val("fNote").trim(),
    date: val("fDate"),
    eventOther: val("fEventOther").trim()
  }));
}

/* ---------- Nomor pesanan ----------
   Nomor terikat pada isi keranjang (cartSignature). Selama isi keranjang
   sama, nomor dipertahankan — termasuk setelah refresh atau setelah
   WhatsApp dibuka. Begitu isi berubah, nomor lama dibuang. */
function setOrderNoText(){
  const el = $("#orderNo");
  if(!el) return;
  el.textContent = orderNo ? "No. Pesanan: " + orderNo : "Belum ada nomor pesanan";
}
function writeOrder(){
  if(orderNo && orderSig) writeStore(ORDER_KEY, JSON.stringify({ no: orderNo, sig: orderSig }));
  else writeStore(ORDER_KEY, null);
}
function resetOrderNo(){
  orderNo = null;
  orderSig = null;
  writeStore(ORDER_KEY, null);
  setOrderNoText();
}
function loadOrder(){
  const saved = readStore(ORDER_KEY);
  if(!saved){ setOrderNoText(); return; }
  try {
    const o = JSON.parse(saved);
    if(o && typeof o.no === "string" && o.sig === cartSignature() && totals().bottles > 0){
      orderNo = o.no;
      orderSig = o.sig;
    } else {
      writeStore(ORDER_KEY, null);
    }
  } catch(e){
    writeStore(ORDER_KEY, null);
  }
  setOrderNoText();
}
function ensureOrderNo(){
  if(totals().bottles === 0){ resetOrderNo(); return null; }
  const sig = cartSignature();
  if(orderNo && orderSig === sig){
    setOrderNoText();
    return orderNo;
  }
  const d = new Date();
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const rnd = String(Math.floor(100 + Math.random() * 900));
  orderNo = "MB-" + yy + mm + dd + "-" + hh + min + "-" + rnd;
  orderSig = sig;
  setOrderNoText();
  writeOrder();
  return orderNo;
}

function pulse(el){
  if(!el) return;
  el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse");
  setTimeout(function(){ el.classList.remove("pulse"); }, 380);
}

function renderQtys(changedId){
  MENU.forEach(function(m){
    $$('[data-qty="' + m.id + '"]').forEach(function(el){
      if(el.textContent !== String(cart[m.id])){
        el.textContent = cart[m.id];
        if(m.id === changedId){
          el.classList.remove("bump");
          void el.offsetWidth;
          el.classList.add("bump");
        }
      }
    });
    const card = $('.card[data-id="' + m.id + '"]');
    if(card) card.classList.toggle("has-qty", cart[m.id] > 0);
    const dec = $('[data-dec="' + m.id + '"]');
    if(dec) dec.disabled = cart[m.id] <= 0;
    const inc = $('[data-inc="' + m.id + '"]');
    if(inc) inc.disabled = cart[m.id] >= MAX_QTY;
    const add = $('[data-add10="' + m.id + '"]');
    if(add) add.disabled = cart[m.id] >= MAX_QTY;
    const stepper = inc ? inc.closest(".stepper") : null;
    if(stepper) stepper.setAttribute("data-max-reached", String(cart[m.id] >= MAX_QTY));
  });
  if(changedId){
    const m = menuById(changedId);
    if(m) announce(m.name + ", " + cart[changedId] + " botol");
  }
}

var announceTimer = null;
function announce(text){
  const region = $("#cartAnnouncer");
  if(!region) return;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(function(){ region.textContent = text; }, 600);
}

function updateBars(){
  const t = totals();
  const count = $("#headerCount");
  if(count) count.textContent = t.bottles;
  const summary = $("#sheetSummary");
  if(summary) summary.textContent = t.bottles + " botol • " + fmt(t.total);
  const label = "Keranjang, " + t.bottles + " botol, " + fmt(t.total);
  const headerBtn = $("#headerCartBtn");
  if(headerBtn) headerBtn.setAttribute("aria-label", label);
  if(t.total !== prevTotals){
    if(t.total > prevTotals && t.bottles > 0) pulse(headerBtn);
    prevTotals = t.total;
  }
}

function setQty(id, qty){
  if(!Object.prototype.hasOwnProperty.call(cart, id)) return;
  const next = normalizeQty(qty);
  if(cart[id] === next) return;
  cart[id] = next;
  if(orderNo && orderSig !== cartSignature()) resetOrderNo();
  if(totals().bottles === 0) resetOrderNo();
  renderQtys(id);
  updateBars();
  renderSheetItems();
  updatePreview();
  saveCart();
  resetSentNote();
}

/* ---------- Harga tampilan ---------- */
function syncPrices(){
  $$(".price-pill").forEach(function(el){ el.textContent = fmt(PRICE); });
  $$("[data-price]").forEach(function(el){ el.textContent = fmt(PRICE); });
  $$(".marquee-set > span").forEach(function(el){
    if(el.querySelector("[data-price]")) return;
    if(/Rp[\d.]+/.test(el.textContent)) el.textContent = el.textContent.replace(/Rp[\d.]+/g, fmt(PRICE));
  });
}
function syncJsonLd(){
  const el = document.querySelector('script[type="application/ld+json"]');
  if(!el) return;
  try {
    const data = JSON.parse(el.textContent);
    if(data.priceRange) data.priceRange = fmt(PRICE);
    const menu = data.hasMenu;
    if(menu && Array.isArray(menu.hasMenuSection)){
      menu.hasMenuSection.forEach(function(section){
        if(Array.isArray(section.hasMenuItem)){
          section.hasMenuItem.forEach(function(item){
            if(item.offers) item.offers.price = String(PRICE);
          });
        }
      });
    }
    el.textContent = JSON.stringify(data, null, 2);
  } catch(e){}
}

/* ---------- Katalog ----------
   Kartu HTML adalah baseline. Jika MENU berisi item yang belum punya
   kartu, kartu baru dibuat di sini; item yang tidak ada di MENU dibuang. */
function createCard(m){
  const card = document.createElement("article");
  card.className = "card reveal";
  card.setAttribute("data-id", m.id);
  card.setAttribute("data-group", m.group);
  const display = m.display || m.name.toUpperCase();
  const script = m.script || "";
  const doodle = m.doodle || "assets/img/doodle-cangkir-latte-teal.webp";
  const alt = m.alt || ("Label " + m.name);
  const variant = m.variant ? '<p class="card-variant">' + m.variant + '</p>' : "";
  card.innerHTML =
    '<img class="doodle card-doodle" src="' + doodle + '" alt="" aria-hidden="true" width="230" height="180" loading="lazy" />' +
    '<div class="card-media"><img loading="lazy" src="' + m.img + '" alt="' + alt + '" width="900" height="900" /></div>' +
    '<div class="card-body">' +
      '<h3 class="card-name">' + display + ' <span class="script">' + script + '</span></h3>' +
      variant +
      '<p class="card-tag">' + (m.tag || "smooth, creamy, purr-fecto") + '</p>' +
      '<div class="card-meta"><span class="card-size">250 ml</span><span class="price-pill">' + fmt(PRICE) + '</span></div>' +
      '<div class="stepper" role="group" aria-label="Jumlah ' + m.name + '">' +
        '<button type="button" data-dec="' + m.id + '" aria-label="Kurangi ' + m.name + '">−</button>' +
        '<span class="qty" data-qty="' + m.id + '">0</span>' +
        '<button type="button" data-inc="' + m.id + '" aria-label="Tambah ' + m.name + '">+</button>' +
      '</div>' +
      '<button type="button" class="add10" data-add10="' + m.id + '">+10 botol</button>' +
    '</div>';
  return card;
}
function syncCatalog(){
  const grid = $("#grid");
  if(!grid) return;
  const divider = $("#groupDivider");
  const ids = MENU.map(function(m){ return m.id; });
  $$(".card", grid).forEach(function(card){
    if(ids.indexOf(card.getAttribute("data-id")) === -1) card.remove();
  });
  MENU.forEach(function(m){
    if($('.card[data-id="' + m.id + '"]', grid)) return;
    const card = createCard(m);
    if(m.group === "kopsu" && divider && divider.parentNode === grid) grid.insertBefore(card, divider);
    else grid.appendChild(card);
    card.classList.add("in");
  });
}

/* ---------- Pesan ---------- */
function formatDateID(value){
  if(!value) return "";
  const parts = value.split("-");
  if(parts.length !== 3) return value;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if(isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}
function buildMessage(){
  const t = totals();
  const lines = [];
  const no = ensureOrderNo();
  lines.push("Halo Mew & Brew! Saya mau order:");
  lines.push("");
  lines.push("No. Pesanan: " + (no || "-"));
  if(mode === "acara"){
    const other = val("fEventOther").trim();
    const label = eventType === "Lainnya" && other ? other : eventType;
    lines.push("Jenis Pesanan: Acara" + (label ? ", " + label : ""));
    const dv = val("fDate");
    if(dv) lines.push("Tanggal Acara: " + formatDateID(dv));
  } else {
    lines.push("Jenis Pesanan: Harian");
  }
  lines.push("");
  let i = 0;
  MENU.forEach(function(m){
    if(cart[m.id] > 0){
      i++;
      lines.push(i + ". " + m.name + " (250ml) x" + cart[m.id] + ", " + fmt(cart[m.id] * PRICE));
    }
  });
  lines.push("");
  lines.push("Total: " + t.bottles + " botol, " + fmt(t.total));
  lines.push("");
  lines.push("Nama: " + (val("fName").trim() || "-"));
  lines.push("Ambil/Antar: " + (fulfil === "antar" ? "Antar" : "Ambil sendiri"));
  if(fulfil === "antar"){
    const addr = val("fAddress").trim();
    if(addr) lines.push("Alamat: " + addr);
  }
  if(mode === "acara"){
    const loc = val("fLocation").trim();
    if(loc) lines.push("Lokasi Acara: " + loc);
  }
  const pay = val("fPayment").trim();
  lines.push("Pembayaran: " + (pay || "Konfirmasi di WhatsApp"));
  const note = val("fNote").trim();
  if(note) lines.push("Catatan: " + note);
  return lines.join("\n");
}
function updatePreview(){
  if(!sheetOpen) return;
  const preview = $("#preview");
  if(!preview) return;
  if(totals().bottles === 0){
    preview.textContent = "Belum ada botol yang dipilih. Pesan akan muncul di sini setelah kamu memilih menu.";
    return;
  }
  preview.textContent = buildMessage();
}

/* ---------- Item di sheet ---------- */
function getSheetFocusKey(wrap){
  const active = document.activeElement;
  if(!active || !wrap || !wrap.contains(active)) return null;
  if(active.hasAttribute("data-sinc")) return { kind: "sinc", id: active.getAttribute("data-sinc") };
  if(active.hasAttribute("data-sdec")) return { kind: "sdec", id: active.getAttribute("data-sdec") };
  if(active.hasAttribute("data-squick")) return { kind: "squick", id: active.getAttribute("data-squick"), q: active.getAttribute("data-q") };
  return null;
}
function restoreSheetFocus(wrap, key){
  if(!key) return;
  let el = null;
  if(key.kind === "squick") el = wrap.querySelector('[data-squick="' + key.id + '"][data-q="' + key.q + '"]');
  else el = wrap.querySelector("[data-" + key.kind + '="' + key.id + '"]');
  if(!el || el.disabled) el = wrap.querySelector("[data-sinc]:not([disabled])") || $("#sheetClose");
  if(el) el.focus({ preventScroll: true });
}
function renderSheetItems(){
  const wrap = $("#sheetItems");
  if(!wrap) return;
  const items = MENU.filter(function(m){ return cart[m.id] > 0; });
  const empty = items.length === 0;
  const focusKey = getSheetFocusKey(wrap);

  $("#sheetEmpty").style.display = empty ? "" : "none";
  $("#checkoutArea").style.display = empty ? "none" : "";
  $("#sheetFoot").style.display = empty ? "none" : "";

  const t = totals();
  $("#sheetBottlesLabel").textContent = t.bottles + " botol";
  $("#sheetTotal").textContent = fmt(t.total);

  if(empty){
    wrap.innerHTML = "";
    if(focusKey) $("#sheetClose").focus({ preventScroll: true });
    return;
  }

  wrap.innerHTML = "";
  items.forEach(function(m){
    const max = cart[m.id] >= MAX_QTY;
    const row = document.createElement("div");
    row.className = "sheet-item";
    row.innerHTML =
      '<div class="sheet-item-top">' +
        '<img loading="lazy" src="' + m.img + '" alt="' + (m.alt || m.name) + '" width="52" height="52" />' +
        '<div class="sheet-item-name">' + m.name + '<small>250 ml • ' + fmt(PRICE) + ' / botol</small></div>' +
        '<div class="sheet-item-price">' + fmt(cart[m.id] * PRICE) + '</div>' +
      '</div>' +
      '<div class="sheet-item-controls">' +
        '<div class="stepper" data-max-reached="' + String(max) + '" role="group" aria-label="Jumlah ' + m.name + '">' +
          '<button type="button" data-sdec="' + m.id + '" aria-label="Kurangi ' + m.name + '">−</button>' +
          '<span class="qty" data-sqty="' + m.id + '">' + cart[m.id] + '</span>' +
          '<button type="button" data-sinc="' + m.id + '" aria-label="Tambah ' + m.name + '"' + (max ? " disabled" : "") + '>+</button>' +
        '</div>' +
        '<div class="quick-set" role="group" aria-label="Atur cepat ' + m.name + '"><span>Atur:</span>' +
          [10,25,50,100].map(function(q){
            return '<button type="button" data-squick="' + m.id + '" data-q="' + q + '" aria-pressed="' + (cart[m.id] === q) + '">' + q + '</button>';
          }).join("") +
        '</div>' +
      '</div>';
    wrap.appendChild(row);
  });

  $$("[data-sdec]", wrap).forEach(function(b){
    b.disabled = cart[b.getAttribute("data-sdec")] <= 0;
    b.addEventListener("click", function(){ b.focus(); setQty(b.getAttribute("data-sdec"), cart[b.getAttribute("data-sdec")] - 1); });
  });
  $$("[data-sinc]", wrap).forEach(function(b){
    b.addEventListener("click", function(){ b.focus(); setQty(b.getAttribute("data-sinc"), cart[b.getAttribute("data-sinc")] + 1); });
  });
  $$("[data-squick]", wrap).forEach(function(b){
    b.addEventListener("click", function(){ b.focus(); setQty(b.getAttribute("data-squick"), Number(b.getAttribute("data-q"))); });
  });

  restoreSheetFocus(wrap, focusKey);
}

/* ---------- Error helper ---------- */
function setError(id, show, message){
  const el = $("#" + id);
  if(!el) return;
  if(message) el.textContent = message;
  el.hidden = !show;
}
function setFieldInvalid(id, invalid){
  const el = $("#" + id);
  if(el) el.setAttribute("aria-invalid", String(!!invalid));
}
function clearError(fieldId, errorId){
  setFieldInvalid(fieldId, false);
  setError(errorId, false);
}

/* ---------- Form visibility ---------- */
function updateMinDate(){
  const el = $("#fDate");
  if(el) el.min = todayISO();
}
function syncForm(){
  $$("[data-mode]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
  $$("[data-fulfil]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-fulfil") === fulfil)); });
  $$("[data-event]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-event") === eventType)); });

  const acaraOpen = mode === "acara";
  const addressOpen = fulfil === "antar";
  const otherOpen = acaraOpen && eventType === "Lainnya";

  $("#acaraWrap").classList.toggle("open", acaraOpen);
  $("#alamatWrap").classList.toggle("open", addressOpen);
  $("#eventOtherWrap").classList.toggle("open", otherOpen);

  $("#fDate").disabled = !acaraOpen;
  $("#fLocation").disabled = !acaraOpen;
  $("#fAddress").disabled = !addressOpen;
  $("#fEventOther").disabled = !otherOpen;

  $("#acaraWrap").inert = !acaraOpen;
  $("#alamatWrap").inert = !addressOpen;
  $("#eventOtherWrap").inert = !otherOpen;

  $$("[data-event]").forEach(function(b){ b.tabIndex = acaraOpen ? 0 : -1; });

  if(!addressOpen) clearError("fAddress", "errAddress");
  if(!acaraOpen){
    clearError("fDate", "errDate");
    clearError("fLocation", "errLocation");
    clearError("fEventOther", "errEventOther");
    setError("errEvent", false);
    setFieldInvalid("eventChips", false);
  }
  if(!otherOpen) clearError("fEventOther", "errEventOther");

  updateMinDate();
  updatePreview();
  saveForm();
}
function setMode(next){
  mode = next;
  syncForm();
}
function setFulfil(next){
  fulfil = next;
  syncForm();
}
function setEventType(next){
  eventType = (eventType === next) ? null : next;
  if(eventType) mode = "acara";
  clearError("eventChips", "errEvent");
  syncForm();
}

/* ---------- Sheet open/close + focus ---------- */
function setBackgroundInert(on){
  ["header", "main", "footer", ".mobile-nav", ".skip-link"].forEach(function(sel){
    const el = document.querySelector(sel);
    if(!el) return;
    el.inert = on;
    if(on) el.setAttribute("aria-hidden", "true");
    else el.removeAttribute("aria-hidden");
  });
}
function openSheet(){
  if(sheetOpen) return;
  lastFocused = document.activeElement;
  sheetOpen = true;
  if(totals().bottles > 0) ensureOrderNo();
  else resetOrderNo();
  renderSheetItems();
  syncForm();
  updatePreview();
  resetSentNote();

  $("#sheet").classList.add("open");
  $("#backdrop").classList.add("open");
  $("#sheet").setAttribute("aria-hidden", "false");
  $("#sheetBody").scrollTop = 0;
  $("#headerCartBtn").setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  $("#sheetClose").focus();
  setBackgroundInert(true);
}
function closeSheet(){
  if(!sheetOpen) return;
  sheetOpen = false;
  $("#sheet").classList.remove("open");
  $("#backdrop").classList.remove("open");
  document.body.style.overflow = "";
  setBackgroundInert(false);

  let target = lastFocused;
  if(!target || target === document.body || target === document.documentElement || !document.contains(target) || $("#sheet").contains(target)) target = $("#headerCartBtn");
  if(target && typeof target.focus === "function") target.focus({ preventScroll: true });

  $("#sheet").setAttribute("aria-hidden", "true");
  $("#headerCartBtn").setAttribute("aria-expanded", "false");
  resetSentNote();
  lastFocused = null;
}
function getFocusable(){
  return $$("#sheet a[href], #sheet button:not([disabled]), #sheet input:not([disabled]), #sheet textarea:not([disabled]), #sheet select:not([disabled]), #sheet [tabindex]:not([tabindex='-1'])")
    .filter(function(el){
      return !el.closest("[inert]") && el.tabIndex >= 0 && el.getClientRects().length > 0;
    });
}

/* ---------- Validasi ---------- */
function validate(){
  let ok = true;
  updateMinDate();

  const nameOk = val("fName").trim().length > 0;
  setError("errName", !nameOk);
  setFieldInvalid("fName", !nameOk);
  if(!nameOk) ok = false;

  if(fulfil === "antar"){
    const addressOk = val("fAddress").trim().length > 0;
    setError("errAddress", !addressOk);
    setFieldInvalid("fAddress", !addressOk);
    if(!addressOk) ok = false;
  }

  if(mode === "acara"){
    const evOk = eventType !== null;
    setError("errEvent", !evOk);
    setFieldInvalid("eventChips", !evOk);
    if(!evOk) ok = false;

    const dateVal = val("fDate");
    const dateOk = dateVal !== "" && dateVal >= todayISO();
    setError("errDate", !dateOk, dateVal ? "Tanggal acara tidak boleh di masa lalu." : "Isi tanggal acaranya dulu, ya.");
    setFieldInvalid("fDate", !dateOk);
    if(!dateOk) ok = false;

    const locOk = val("fLocation").trim().length > 0;
    setError("errLocation", !locOk);
    setFieldInvalid("fLocation", !locOk);
    if(!locOk) ok = false;

    if(eventType === "Lainnya"){
      const otherOk = val("fEventOther").trim().length > 0;
      setError("errEventOther", !otherOk);
      setFieldInvalid("fEventOther", !otherOk);
      if(!otherOk) ok = false;
    } else {
      clearError("fEventOther", "errEventOther");
    }
  }

  if(!ok){
    if(mode === "acara" && eventType === null){
      const chips = $("#eventChips");
      if(chips) chips.focus();
    } else {
      const firstBad = $("#sheetBody input[aria-invalid='true'], #sheetBody textarea[aria-invalid='true'], #sheetBody select[aria-invalid='true']");
      if(firstBad && !firstBad.disabled) firstBad.focus();
    }
  }
  return ok;
}

/* ---------- Kirim / salin ---------- */
function resetSentNote(){
  const note = $("#sentNote");
  if(note) note.hidden = true;
}
function sendWA(){
  if(!SELLER_WA) return;
  if(totals().bottles === 0) return;
  if(!validate()) return;
  const url = "https://wa.me/" + SELLER_WA + "?text=" + encodeURIComponent(buildMessage());
  window.open(url, "_blank", "noopener");
  const note = $("#sentNote");
  if(note) note.hidden = false;
}
function copyFeedback(text){
  const btn = $("#copyBtn");
  if(!btn) return;
  if(copyTimer) clearTimeout(copyTimer);
  btn.textContent = text;
  copyTimer = setTimeout(function(){
    btn.textContent = COPY_LABEL;
    copyTimer = null;
  }, 1600);
}
function copyOrder(){
  if(totals().bottles === 0) return;
  if(!validate()) return;
  const text = buildMessage();
  const done = function(){ copyFeedback("✓ Disalin!"); };
  const failed = function(){ copyFeedback("Gagal menyalin"); };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text, done, failed); });
  } else {
    fallbackCopy(text, done, failed);
  }
}
function fallbackCopy(text, done, failed){
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    const success = document.execCommand("copy");
    if(success) done(); else if(failed) failed();
  } catch(e) {
    if(failed) failed();
  }
  document.body.removeChild(ta);
}
function clearCart(){
  MENU.forEach(function(m){ cart[m.id] = 0; });
  resetOrderNo();
  renderQtys(null);
  updateBars();
  renderSheetItems();
  updatePreview();
  saveCart();
  resetSentNote();
  announce("Keranjang dikosongkan");
  if(sheetOpen) $("#sheetClose").focus({ preventScroll: true });
}

/* ---------- Reveal & image loading ---------- */
var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function scrollToEl(el){ el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); }

function initReveal(){
  const cards = $$(".card.reveal");
  const pops = $$(".doodle-pop");
  if(!("IntersectionObserver" in window)){
    cards.forEach(function(c){ c.classList.add("in"); });
    pops.forEach(function(c){ c.classList.add("in"); });
    return;
  }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        const idx = cards.indexOf(en.target);
        en.target.style.transitionDelay = ((idx % 4) * 45) + "ms";
        en.target.classList.add("in");
        io.unobserve(en.target);
        setTimeout(function(){ en.target.style.transitionDelay = ""; }, 700);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px 300px 0px" });
  cards.forEach(function(c){ io.observe(c); });

  const io2 = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        en.target.classList.add("in");
        io2.unobserve(en.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px 120px 0px" });
  pops.forEach(function(c){ io2.observe(c); });
}

function initImageLoad(){
  $$(".card-media").forEach(function(media){
    const img = media.querySelector("img");
    if(!img){ media.classList.add("is-loaded"); return; }
    if(img.complete && img.naturalWidth > 0){
      media.classList.add("is-loaded");
      return;
    }
    img.addEventListener("load", function(){ media.classList.add("is-loaded"); }, { once: true });
    img.addEventListener("error", function(){ media.classList.add("is-loaded"); }, { once: true });
  });
  // Jangan biarkan shimmer menahan gambar selamanya jika event load tidak datang.
  setTimeout(function(){
    $$(".card-media").forEach(function(media){ media.classList.add("is-loaded"); });
  }, 4000);
}

// Jalankan lebih awal supaya kegagalan di wiring tidak membuat gambar
// katalog tetap transparan. Dipanggil lagi setelah katalog disinkronkan.
initImageLoad();

function initServiceWorker(){
  if(!("serviceWorker" in navigator)) return;
  const register = function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  };
  if(document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

/* ---------- Wire up ---------- */
$("#grid").addEventListener("click", function(e){
  const target = e.target instanceof Element ? e.target : null;
  if(!target) return;
  const inc = target.closest("[data-inc]");
  if(inc){ const id = inc.getAttribute("data-inc"); setQty(id, cart[id] + 1); return; }
  const dec = target.closest("[data-dec]");
  if(dec){ const id = dec.getAttribute("data-dec"); setQty(id, cart[id] - 1); return; }
  const add = target.closest("[data-add10]");
  if(add){ const id = add.getAttribute("data-add10"); setQty(id, cart[id] + 10); }
});

$$("[data-filter]").forEach(function(b){
  b.addEventListener("click", function(){
    const f = b.getAttribute("data-filter");
    $$("[data-filter]").forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
    const grid = $("#grid");
    const divider = $("#groupDivider");
    grid.classList.add("is-switching");
    setTimeout(function(){
      $$(".card", grid).forEach(function(card){
        card.hidden = !(f === "semua" || card.getAttribute("data-group") === f);
      });
      if(divider) divider.hidden = (f !== "semua");
      grid.classList.remove("is-switching");
      announceFilter(f);
    }, 180);
  });
});

function announceFilter(f){
  const grid = $("#grid");
  const count = $$(".card", grid).filter(function(c){ return !c.hidden; }).length;
  const label = f === "semua" ? "semua menu" : (f === "kopsu" ? "Kopsu" : "Cold Brew");
  if(filterAnnounceTimer) clearTimeout(filterAnnounceTimer);
  filterAnnounceTimer = setTimeout(function(){
    const region = $("#filterAnnouncer");
    if(region) region.textContent = "Menampilkan " + count + " menu " + label + ".";
  }, 220);
}

$$("[data-event]").forEach(function(b){
  b.addEventListener("click", function(){ setEventType(b.getAttribute("data-event")); });
});
$$("[data-mode]").forEach(function(b){
  b.addEventListener("click", function(){ setMode(b.getAttribute("data-mode")); });
});
$$("[data-fulfil]").forEach(function(b){
  b.addEventListener("click", function(){ setFulfil(b.getAttribute("data-fulfil")); });
});

$("#headerCartBtn").addEventListener("click", openSheet);
$("#sheetClose").addEventListener("click", closeSheet);
$("#backdrop").addEventListener("click", closeSheet);
$("#emptyMenuBtn").addEventListener("click", function(){
  closeSheet();
  scrollToEl(document.getElementById("menu"));
});
$("#copyBtn").addEventListener("click", copyOrder);
$("#clearCartBtn").addEventListener("click", clearCart);
$("#checkoutArea").addEventListener("submit", function(e){
  e.preventDefault();
  sendWA();
});

const ERROR_FOR = {
  fName: "errName",
  fAddress: "errAddress",
  fDate: "errDate",
  fLocation: "errLocation",
  fEventOther: "errEventOther"
};
["fName", "fAddress", "fDate", "fLocation", "fEventOther", "fPayment", "fNote"].forEach(function(id){
  const el = $("#" + id);
  if(!el) return;
  el.addEventListener("input", function(){
    if(ERROR_FOR[id]){
      setFieldInvalid(id, false);
      setError(ERROR_FOR[id], false);
    }
    updatePreview();
    saveForm();
  });
  el.addEventListener("change", function(){
    if(ERROR_FOR[id]){
      setFieldInvalid(id, false);
      setError(ERROR_FOR[id], false);
    }
    updatePreview();
    saveForm();
  });
});

document.addEventListener("keydown", function(e){
  if(!sheetOpen) return;
  if(e.key === "Escape"){ closeSheet(); return; }
  if(e.key !== "Tab") return;
  const focusables = getFocusable();
  if(!focusables.length){ e.preventDefault(); return; }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if(!$("#sheet").contains(document.activeElement)){
    e.preventDefault();
    first.focus();
    return;
  }
  if(e.shiftKey && document.activeElement === first){
    e.preventDefault();
    last.focus();
  } else if(!e.shiftKey && document.activeElement === last){
    e.preventDefault();
    first.focus();
  }
});

/* WA button state: disabled until a real seller number is configured. */
(function initWA(){
  const btn = $("#waBtn");
  if(!btn) return;
  if(!SELLER_WA){
    btn.disabled = true;
    btn.title = "Nomor WhatsApp penjual belum diisi";
  }
})();

/* ---------- Init ---------- */
loadCart();
saveCart();
loadOrder();
loadForm();
syncCatalog();
syncPrices();
syncJsonLd();
prevTotals = totals().total;
renderQtys(null);
updateBars();
syncForm();
initReveal();
initImageLoad();
initServiceWorker();
