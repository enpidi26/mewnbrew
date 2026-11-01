document.documentElement.classList.add('js');

/* ============================================================
   KONFIGURASI PENJUAL
   Nomor WhatsApp penjual dalam format 62xxx (tanpa +, tanpa spasi).
   Format: 0812-9598-8816 → 6281295988816
   ============================================================ */
const SELLER_WA = "6281295988816";

const PRICE = 10000;
const MENU = [
  { id:"classic",   group:"kopsu", name:"Kopsu Classic",       img:"assets/img/label-kopsu-classic.webp",    alt:"Label Kopsu Classic" },
  { id:"oat",       group:"kopsu", name:"Kopsu Oat",           img:"assets/img/label-kopsu-oat.webp",        alt:"Label Kopsu Oat" },
  { id:"regal",     group:"kopsu", name:"Kopsu Regal",         img:"assets/img/label-kopsu-regal.webp",      alt:"Label Kopsu Regal" },
  { id:"gayo",      group:"cold",  name:"Cold Brew Gayo",      img:"assets/img/label-cold-brew-gayo.webp",   alt:"Label Cold Brew Gayo" },
  { id:"kerinci",   group:"cold",  name:"Cold Brew Kerinci",   img:"assets/img/label-cold-brew-kerinci.webp",alt:"Label Cold Brew Kerinci" },
  { id:"puntang",   group:"cold",  name:"Cold Brew Puntang",   img:"assets/img/label-cold-brew-puntang.webp",alt:"Label Cold Brew Puntang" },
  { id:"kintamani", group:"cold",  name:"Cold Brew Kintamani", img:"assets/img/label-cold-brew-kintamani.webp", alt:"Label Cold Brew Kintamani" }
];

/* Keranjang disimpan di localStorage untuk persist antar refresh. */
const CART_KEY = "mewnbrew_cart";
const FORM_KEY = "mewnbrew_form";

function loadCart(){
  try {
    const saved = localStorage.getItem(CART_KEY);
    if(saved){
      const parsed = JSON.parse(saved);
      MENU.forEach(function(m){ if(typeof parsed[m.id] === "number") cart[m.id] = parsed[m.id]; });
    }
  } catch(e) {}
}
function saveCart(){
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e) {}
}
function loadForm(){
  try {
    const saved = localStorage.getItem(FORM_KEY);
    if(saved){
      const f = JSON.parse(saved);
      if(f.mode) mode = f.mode;
      if(f.fulfil) fulfil = f.fulfil;
      if(f.eventType) eventType = f.eventType;
      if(f.name) $("#fName").value = f.name;
      if(f.address) $("#fAddress").value = f.address;
      if(f.location) $("#fLocation").value = f.location;
      if(f.payment) $("#fPayment").value = f.payment;
      if(f.note) $("#fNote").value = f.note;
    }
  } catch(e) {}
}
function saveForm(){
  try {
    const f = {
      mode: mode,
      fulfil: fulfil,
      eventType: eventType,
      name: $("#fName").value.trim(),
      address: $("#fAddress").value.trim(),
      location: $("#fLocation").value.trim(),
      payment: $("#fPayment").value.trim(),
      note: $("#fNote").value.trim()
    };
    localStorage.setItem(FORM_KEY, JSON.stringify(f));
  } catch(e) {}
}

const cart = {};
MENU.forEach(function(m){ cart[m.id] = 0; });
let mode = "harian";        // "harian" | "acara"
let fulfil = "ambil";       // "ambil" | "antar"
let eventType = null;
let orderNo = null;
let sheetOpen = false;
let prevTotals = 0;

const $ = function(s, r){ return (r || document).querySelector(s); };
const $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function fmt(n){ return "Rp" + n.toLocaleString("id-ID"); }
function totals(){
  let bottles = 0;
  MENU.forEach(function(m){ bottles += cart[m.id]; });
  return { bottles: bottles, total: bottles * PRICE };
}
function menuById(id){ return MENU.filter(function(m){ return m.id === id; })[0]; }

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
    if(inc) inc.disabled = cart[m.id] >= 999;
    // Show max indicator
    const stepper = inc ? inc.closest('.stepper') : null;
    if(stepper) stepper.setAttribute('data-max-reached', cart[m.id] >= 999);
  });
  /* Announce once the clicking settles, using the final count. */
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
  $("#headerCount").textContent = t.bottles;
  const summary = $("#sheetSummary");
  if(summary) summary.textContent = t.bottles + " botol • " + fmt(t.total);
  const label = "Keranjang, " + t.bottles + " botol, " + fmt(t.total);
  const headerBtn = $("#headerCartBtn");
  if(headerBtn) headerBtn.setAttribute("aria-label", label);
  if(t.total !== prevTotals){
    if(t.total > prevTotals && t.bottles > 0){
      pulse($("#headerCartBtn"));
    }
    prevTotals = t.total;
  }
}

function setQty(id, qty){
  cart[id] = Math.max(0, Math.min(999, qty));
  renderQtys(id);
  updateBars();
  renderSheetItems();
  updatePreview();
  saveCart();
}

/* ---------- Order number: MB-YYMMDD-HHMM-RRR ---------- */
function ensureOrderNo(){
  if(orderNo) return orderNo;
  const d = new Date();
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const rnd = String(Math.floor(100 + Math.random() * 900));
  orderNo = "MB-" + yy + mm + dd + "-" + hh + min + "-" + rnd;
  $("#orderNo").textContent = "No. Pesanan: " + orderNo;
  return orderNo;
}

/* ---------- Message ---------- */
function formatDateID(value){
  if(!value) return "";
  const parts = value.split("-");
  if(parts.length !== 3) return value;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}
function buildMessage(){
  const t = totals();
  const lines = [];
  lines.push("Halo Mew & Brew! Saya mau order:");
  lines.push("");
  lines.push("No. Pesanan: " + ensureOrderNo());
  if(mode === "acara"){
    lines.push("Jenis Pesanan: Acara" + (eventType ? ", " + eventType : ""));
    const dv = $("#fDate").value;
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
  const name = $("#fName").value.trim();
  lines.push("Nama: " + (name || "-"));
  lines.push("Ambil/Antar: " + (fulfil === "antar" ? "Antar" : "Ambil sendiri"));
  if(mode === "acara"){
    const loc = $("#fLocation").value.trim();
    if(loc) lines.push("Lokasi Acara: " + loc);
  } else if(fulfil === "antar"){
    const addr = $("#fAddress").value.trim();
    if(addr) lines.push("Alamat: " + addr);
  }
  const pay = $("#fPayment").value.trim();
  lines.push("Pembayaran: " + (pay || "Konfirmasi di WhatsApp"));
  const note = $("#fNote").value.trim();
  if(note) lines.push("Catatan: " + note);
  return lines.join("\n");
}
function updatePreview(){
  if(!sheetOpen) return;
  if(totals().bottles === 0){
    $("#preview").textContent = "Belum ada botol yang dipilih. Pesan akan muncul di sini setelah kamu memilih menu.";
    return;
  }
  $("#preview").textContent = buildMessage();
}

/* ---------- Sheet items ---------- */
function renderSheetItems(){
  const wrap = $("#sheetItems");
  const items = MENU.filter(function(m){ return cart[m.id] > 0; });
  const empty = items.length === 0;
  $("#sheetEmpty").style.display = empty ? "" : "none";
  $("#checkoutArea").style.display = empty ? "none" : "";
  $("#sheetFoot").style.display = empty ? "none" : "";
  if(empty) return;
  wrap.innerHTML = "";
  items.forEach(function(m){
    const row = document.createElement("div");
    row.className = "sheet-item";
    row.innerHTML =
      '<div class="sheet-item-top">' +
        '<img src="' + m.img + '" alt="' + m.alt + '" width="52" height="52" />' +
        '<div class="sheet-item-name">' + m.name + '<small>250 ml • ' + fmt(PRICE) + ' / botol</small></div>' +
        '<div class="sheet-item-price">' + fmt(cart[m.id] * PRICE) + '</div>' +
      '</div>' +
      '<div class="sheet-item-controls">' +
        '<div class="stepper" role="group" aria-label="Jumlah ' + m.name + '">' +
          '<button type="button" data-sdec="' + m.id + '" aria-label="Kurangi ' + m.name + '">−</button>' +
          '<span class="qty" data-sqty="' + m.id + '">' + cart[m.id] + '</span>' +
          '<button type="button" data-sinc="' + m.id + '" aria-label="Tambah ' + m.name + '">+</button>' +
        '</div>' +
        '<div class="quick-set" role="group" aria-label="Atur cepat ' + m.name + '"><span>Atur:</span>' +
          [10,25,50,100].map(function(q){
            return '<button type="button" data-squick="' + m.id + '" data-q="' + q + '" aria-pressed="' + (cart[m.id] === q) + '">' + q + '</button>';
          }).join("") +
        '</div>' +
      '</div>';
    wrap.appendChild(row);
  });
  const t = totals();
  $("#sheetBottlesLabel").textContent = t.bottles + " botol";
  $("#sheetTotal").textContent = fmt(t.total);
  $$("[data-sdec]", wrap).forEach(function(b){
    b.disabled = cart[b.getAttribute("data-sdec")] <= 0;
    b.addEventListener("click", function(){ setQty(b.getAttribute("data-sdec"), cart[b.getAttribute("data-sdec")] - 1); });
  });
  $$("[data-sinc]", wrap).forEach(function(b){
    b.addEventListener("click", function(){ setQty(b.getAttribute("data-sinc"), cart[b.getAttribute("data-sinc")] + 1); });
  });
  $$("[data-squick]", wrap).forEach(function(b){
    b.addEventListener("click", function(){ setQty(b.getAttribute("data-squick"), Number(b.getAttribute("data-q"))); });
  });
}

/* ---------- Form visibility ---------- */
function syncForm(){
  $$("[data-mode]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === mode)); });
  $$("[data-fulfil]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-fulfil") === fulfil)); });
  $$("[data-event]").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-event") === eventType)); });
  const acaraOpen = mode === "acara";
  $("#acaraWrap").classList.toggle("open", acaraOpen);
  $("#alamatWrap").classList.toggle("open", mode === "harian" && fulfil === "antar");
  $("#fDate").disabled = !acaraOpen;
  $("#fLocation").disabled = !acaraOpen;
  $("#fAddress").disabled = !(mode === "harian" && fulfil === "antar");
  updatePreview();
  saveForm();
}
function setMode(next){
  mode = next;
  syncForm();
}
function setEventType(next){
  eventType = (eventType === next) ? null : next;
  if(eventType) mode = "acara";
  syncForm();
}

/* ---------- Sheet open/close ---------- */
function openSheet(){
  sheetOpen = true;
  if(totals().bottles > 0) ensureOrderNo();
  renderSheetItems();
  syncForm();
  updatePreview();
  $("#sheet").classList.add("open");
  $("#sheet").setAttribute("aria-hidden", "false");
  $("#backdrop").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#sheetClose").focus();
}
function closeSheet(){
  sheetOpen = false;
  $("#sheet").classList.remove("open");
  $("#sheet").setAttribute("aria-hidden", "true");
  $("#backdrop").classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------- Validation & send ---------- */
function validate(){
  let ok = true;
  const nameOk = $("#fName").value.trim().length > 0;
  $("#errName").hidden = nameOk;
  $("#fName").setAttribute("aria-invalid", String(!nameOk));
  if(!nameOk) ok = false;
  if(mode === "harian" && fulfil === "antar"){
    const aOk = $("#fAddress").value.trim().length > 0;
    $("#errAddress").hidden = aOk;
    $("#fAddress").setAttribute("aria-invalid", String(!aOk));
    if(!aOk) ok = false;
  }
  if(mode === "acara"){
    const evOk = eventType !== null;
    if(!evOk){
      alert("Pilih jenis acara terlebih dahulu.");
      ok = false;
    }
    const dOk = $("#fDate").value.length > 0;
    $("#errDate").hidden = dOk;
    $("#fDate").setAttribute("aria-invalid", String(!dOk));
    if(!dOk) ok = false;
    const lOk = $("#fLocation").value.trim().length > 0;
    $("#errLocation").hidden = lOk;
    $("#fLocation").setAttribute("aria-invalid", String(!lOk));
    if(!lOk) ok = false;
  }
  if(!ok){
    const firstBad = $("#sheetBody [aria-invalid='true']");
    if(firstBad) firstBad.focus();
  }
  return ok;
}
function sendWA(){
  if(!SELLER_WA) return;
  if(totals().bottles === 0) return;
  if(!validate()) return;
  const url = "https://wa.me/" + SELLER_WA + "?text=" + encodeURIComponent(buildMessage());
  window.open(url, "_blank", "noopener");
  $("#sentNote").hidden = false;
}
function copyOrder(){
  if(totals().bottles === 0) return;
  if(!validate()) return;
  const text = buildMessage();
  const done = function(){
    const btn = $("#copyBtn");
    const old = btn.textContent;
    btn.textContent = "✓ Disalin!";
    setTimeout(function(){ btn.textContent = old; }, 1600);
  };
  const failed = function(){
    const btn = $("#copyBtn");
    const old = btn.textContent;
    btn.textContent = "Gagal menyalin";
    setTimeout(function(){ btn.textContent = old; }, 1600);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text, done, failed); });
  } else {
    fallbackCopy(text, done, failed);
  }
}
function fallbackCopy(text, done, failed){
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed"; ta.style.opacity = "0";
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

/* ---------- Wire up ---------- */
var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function scrollToEl(el){ el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); }
$$("[data-inc]").forEach(function(b){
  b.addEventListener("click", function(){ const id = b.getAttribute("data-inc"); setQty(id, cart[id] + 1); });
});
$$("[data-dec]").forEach(function(b){
  b.addEventListener("click", function(){ const id = b.getAttribute("data-dec"); setQty(id, cart[id] - 1); });
});
$$("[data-add10]").forEach(function(b){
  b.addEventListener("click", function(){ const id = b.getAttribute("data-add10"); setQty(id, cart[id] + 10); });
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
    }, 180);
  });
});
$$("[data-event]").forEach(function(b){
  b.addEventListener("click", function(){ setEventType(b.getAttribute("data-event")); });
});
$$("[data-mode]").forEach(function(b){
  b.addEventListener("click", function(){ setMode(b.getAttribute("data-mode")); });
});
$$("[data-fulfil]").forEach(function(b){
  b.addEventListener("click", function(){ fulfil = b.getAttribute("data-fulfil"); syncForm(); });
});
$("#headerCartBtn").addEventListener("click", openSheet);
$("#sheetClose").addEventListener("click", closeSheet);
$("#backdrop").addEventListener("click", closeSheet);
document.addEventListener("keydown", function(e){ if(e.key === "Escape" && sheetOpen) closeSheet(); });
$("#emptyMenuBtn").addEventListener("click", function(){
  closeSheet();
  scrollToEl(document.getElementById("menu"));
});
$("#waBtn").addEventListener("click", sendWA);
$("#copyBtn").addEventListener("click", copyOrder);
["fName","fAddress","fDate","fLocation","fPayment","fNote"].forEach(function(id){
  $("#" + id).addEventListener("input", function(){
    updatePreview();
    saveForm();
  });
});
$("#fDate").addEventListener("change", function(){
  updatePreview();
  saveForm();
});

/* WA button state: disabled until a real seller number is configured. */
(function initWA(){
  const btn = $("#waBtn");
  if(!SELLER_WA){
    btn.disabled = true;
    btn.title = "Nomor WhatsApp penjual belum diisi";
  }
})();

/* Date minimum = today (local), updated dynamically. */
(function initDate(){
  function updateMinDate(){
    const d = new Date();
    const iso = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
    $("#fDate").min = iso;
  }
  updateMinDate();
  // Update at midnight if page stays open
  setInterval(updateMinDate, 60000 * 60); // every hour
})();

/* Reveal-on-scroll for product cards and doodles, once, with a soft stagger. */
(function initReveal(){
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
})();

/* Fade product labels in once decoded, over the .card-media shimmer. */
(function initImageLoad(){
  $$(".card-media").forEach(function(media){
    const img = media.querySelector("img");
    if(!img) return;
    if(img.complete && img.naturalWidth > 0){
      media.classList.add("is-loaded");
      return;
    }
    img.addEventListener("load", function(){ media.classList.add("is-loaded"); });
    /* On error reveal anyway, so a broken file shows the alt text
       instead of shimmering forever. */
    img.addEventListener("error", function(){ media.classList.add("is-loaded"); });
  });
})();

loadCart();
loadForm();
renderQtys(null);
updateBars();
syncForm();
