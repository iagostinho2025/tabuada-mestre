const CACHE_NAME = 'tabuada-mestre-v2'; // Mudei para v2 para forçar atualização

// Lista exata de arquivos para funcionar offline
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './audio.js',
  './manifest.json',
  
  // Arquivo Principal
  './js/app.js',
  
  // Módulos do Jogo (Essenciais!)
  './js/modules/game.js',
  './js/modules/state.js',
  './js/modules/ui.js',
  './js/modules/stats.js',
  './js/modules/store.js',
  './js/modules/lousa.js',
  
  // Se tiver ícones ou sons, adicione aqui:
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// 1. Instalação: Baixa e salva tudo
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Busca: Serve do cache primeiro (Rápido), cai na rede se falhar
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

// 3. Ativação: Limpa caches antigos (v1) para não ocupar espaço
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim(); // Controla a página imediatamente
});