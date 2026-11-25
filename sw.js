// Service worker : l'appli marche sans internet après la première ouverture.
// La page est toujours chargée depuis internet quand il y a du réseau (mises à jour immédiates),
// sinon depuis le cache. Pour publier une nouvelle version, changer le numéro ci-dessous.
var VERSION = 'carnet-seances-13';
var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "fonts/barlow-condensed-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-700-normal.woff2",
  "fonts/barlow-latin-400-normal.woff2",
  "fonts/barlow-latin-500-normal.woff2",
  "fonts/barlow-latin-600-normal.woff2"
];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  var url=new URL(e.request.url);
  var page = e.request.mode==='navigate' || /\/$|index\.html$|manifest\.webmanifest$/.test(url.pathname);
  if(page){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(function(r){
      if(r && r.ok){ var c=r.clone(); caches.open(VERSION).then(function(ca){ ca.put(e.request,c); }); }
      return r;
    }).catch(function(){ return caches.match(e.request,{ignoreSearch:true}).then(function(h){ return h || caches.match('index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(hit){
    if(hit) return hit;
    return fetch(e.request).catch(function(){ return caches.match('index.html'); });
  }));
});
