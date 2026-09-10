// Service Worker — Apontamento Frotas PWA
const CACHE_NAME = 'apontamento-frotas-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// Instalar e cachear arquivos essenciais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, cache como fallback
self.addEventListener('fetch', e => {
  // Não cachear requisições do Supabase
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Atualiza cache com resposta mais recente
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
