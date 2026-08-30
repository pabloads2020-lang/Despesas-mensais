// Service worker do Orçamento Doméstico.
// Estratégia: cache-first pros arquivos do app (funciona offline depois da
// primeira visita), sempre tentando a rede primeiro só pra pegar atualizações
// em segundo plano.
const CACHE_NAME = 'orcamento-domestico-v1';
const ARQUIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      const buscaRede = fetch(event.request)
        .then((respostaRede) => {
          if(respostaRede && respostaRede.status === 200){
            const clone = respostaRede.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return respostaRede;
        })
        .catch(() => respostaCache);
      return respostaCache || buscaRede;
    })
  );
});
