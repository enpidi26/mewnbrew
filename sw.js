/*
 * Mew & Brew — proprietary source-available.
 * Copyright (c) 2026 Mew & Brew. All rights reserved. See LICENSE.
 * Canary: mewnbrew-canary-7f3a91c2-2026-11-19
 */

/* Mew & Brew service worker — offline app shell.
   Naikkan CACHE setiap kali aset inti berubah. */
const CACHE = "mewnbrew-v1.2.1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css?v=1.2.1",
  "./js/main.js?v=1.2.1",
  "./manifest.json",
  "./favicon.svg",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  "./assets/img/icon-maskable-512.png",
  "./assets/img/apple-touch-icon.png",
  "./assets/img/og-mew-brew.png",
  "./assets/img/logo-mew-brew.png",
  "./assets/img/kucing-hero.webp",
  "./assets/img/label-kopsu-classic.webp",
  "./assets/img/label-kopsu-oat.webp",
  "./assets/img/label-kopsu-regal.webp",
  "./assets/img/label-cold-brew-gayo.webp",
  "./assets/img/label-cold-brew-kerinci.webp",
  "./assets/img/label-cold-brew-puntang.webp",
  "./assets/img/label-cold-brew-kintamani.webp",
  "./assets/img/foto-cooler-bag.webp",
  "./assets/img/foto-tangan-cold-brew.webp"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE)
      .then(function(cache){ return cache.addAll(APP_SHELL); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(keys.filter(function(key){ return key !== CACHE; }).map(function(key){ return caches.delete(key); }));
      })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  const request = event.request;
  if(request.method !== "GET") return;

  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  if(request.mode === "navigate"){
    event.respondWith(
      fetch(request)
        .then(function(response){
          const copy = response.clone();
          caches.open(CACHE).then(function(cache){ return cache.put(request, copy); }).catch(function(){});
          return response;
        })
        .catch(function(){
          return caches.open(CACHE).then(function(cache){
            return cache.match(new URL("./index.html", self.registration.scope).href)
              .then(function(hit){ return hit || cache.match(new URL("./", self.registration.scope).href); })
              .then(function(hit){ return hit || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }); });
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(request).then(function(cached){
        const network = fetch(request)
          .then(function(response){
            if(response && response.status === 200 && response.type === "basic"){
              cache.put(request, response.clone()).catch(function(){});
            }
            return response;
          })
          .catch(function(){ return null; });
        if(cached) return cached;
        return network.then(function(response){ return response || new Response("", { status: 504 }); });
      });
    })
  );
});
