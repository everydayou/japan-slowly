/* Japan Slowly -- offline service worker.
   Bump CACHE_VERSION whenever you want every installed phone to fully
   re-download everything (e.g. after replacing/renaming a bunch of images).
   Everyday content edits don't need a bump -- see the fetch handler below:
   the HTML/manifest are network-first, so they always refresh automatically
   whenever the phone has a connection; the version bump only matters for
   images/icons/fonts, which are cached cache-first for speed. */
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'japan-slowly-' + CACHE_VERSION;

/* Best-effort install list. Each URL is fetched independently -- unlike
   cache.addAll(), one missing/renamed file here just gets skipped (and
   logged) instead of failing the whole install. Keep this in rough sync
   with what index.html actually references; a stale entry here is harmless,
   it just never gets used. */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png?v=11',
  './cards.svg',
  './stays.svg',
  './weather.png',
  './japan app icon - black.png',
  './japan app icon - white.png',
  './cards images/day card - 1.jpg',
  './cards images/day card - 2.jpg',
  './cards images/day card - 3.jpg',
  './cards images/day card - 4.jpg',
  './cards images/day card - 5.jpg',
  './cards images/day card - 6.jpg',
  './cards images/day card - 7.jpg',
  './cards images/day card - 8.jpg',
  './cards images/day card - 9.jpg',
  './cards images/day card - 10.jpg',
  './cards images/day-card---1b.jpg',
  './cards images/day-card---2b.jpg',
  './cards images/day-card---3b.jpg',
  './cards images/day-card---4b.jpg',
  './cards images/day-card---5b.jpg',
  './cards images/day-card---6b.jpg',
  './cards images/day-card---7b.jpg',
  './cards images/day-card---8b.jpg',
  './cards images/day-card---9b.jpg',
  './cards images/day-card---10b.jpg',
  './cards images/stay 1.jpg',
  './cards images/stay 2.jpg',
  './cards images/stay 3.jpg',
  './cards images/stay 4.jpg',
  './cards images/stay-1b.jpg',
  './cards images/stay-2b.jpg',
  './cards images/stay-3b.jpg',
  './cards images/stay-4b.jpg',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return Promise.all(PRECACHE_URLS.map(function(url){
        var isCrossOrigin = url.indexOf('http') === 0;
        return fetch(url, { mode: isCrossOrigin ? 'no-cors' : 'same-origin' })
          .then(function(resp){
            if(resp && (resp.ok || resp.type === 'opaque')) return cache.put(url, resp);
          })
          .catch(function(err){
            console.warn('[sw] precache skipped (missing or renamed?):', url, err);
          });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;

  var accept = req.headers.get('accept') || '';
  var isHTML = req.mode === 'navigate' || accept.indexOf('text/html') !== -1;
  var isManifest = req.url.indexOf('manifest.json') !== -1;

  if(isHTML || isManifest){
    /* network-first: while you have a connection (e.g. still iterating on the
       app before the trip) this always serves the latest push, and updates
       the offline copy in the background. Only when the network request
       fails outright does it fall back to whatever was last cached. */
    event.respondWith(
      fetch(req).then(function(resp){
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
        return resp;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* everything else -- day/stay photos, icons, svgs, the Outfit font files --
     cache-first for instant offline loads, refreshed quietly in the
     background whenever there IS a connection. */
  event.respondWith(
    caches.match(req).then(function(cached){
      var networkFetch = fetch(req).then(function(resp){
        if(resp && (resp.ok || resp.type === 'opaque')){
          var copy = resp.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
        }
        return resp;
      }).catch(function(){ return cached; });
      return cached || networkFetch;
    })
  );
});
