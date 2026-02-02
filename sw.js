// ========== SERVICE WORKER С АВТООБНОВЛЕНИЕМ ==========
const CACHE_NAME = 'lovecouple-v1.7.0'; // ⚡ МЕНЯЙТЕ ВЕРСИЮ ПРИ КАЖДОМ ОБНОВЛЕНИИ!
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', 
  '/app.js',
  '/custom_cards.js',
  '/manifest.json'
];

// ========== УСТАНОВКА ==========
self.addEventListener('install', event => {
  console.log('[Service Worker] Установка новой версии:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Немедленная активация нового SW
        return self.skipWaiting();
      })
  );
});

// ========== АКТИВАЦИЯ ==========
self.addEventListener('activate', event => {
  console.log('[Service Worker] Активация новой версии');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Удаляем старые кэши
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Берём управление всеми клиентами
      return self.clients.claim();
    })
  );
});

// ========== ЗАПРОСЫ ==========
self.addEventListener('fetch', event => {
  // Пропускаем неподходящие запросы
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Для HTML - стратегия "сеть, потом кэш"
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Клонируем ответ для кэша
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, берём из кэша
          return caches.match(event.request);
        })
    );
  } else {
    // Для остальных файлов - "кэш, потом сеть"
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Проверяем, не устарел ли кэш
            return fetch(event.request)
              .then(networkResponse => {
                // Обновляем кэш
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
                return networkResponse;
              })
              .catch(() => {
                // Если сеть недоступна, используем кэш
                return cachedResponse;
              });
          }
          // Если нет в кэше - загружаем
          return fetch(event.request);
        })
    );
  }
});

// ========== ОБРАБОТКА СООБЩЕНИЙ ==========
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ========== ФОНОВАЯ СИНХРОНИЗАЦИЯ ==========
self.addEventListener('sync', event => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

// Функция проверки обновлений
async function checkForUpdates() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = urlsToCache.map(url => new Request(url));
    
    for (const request of requests) {
      const networkResponse = await fetch(request);
      const cachedResponse = await cache.match(request);
      
      if (!cachedResponse || 
          networkResponse.headers.get('etag') !== cachedResponse.headers.get('etag') ||
          networkResponse.headers.get('last-modified') !== cachedResponse.headers.get('last-modified')) {
        
        console.log('[Service Worker] Обнаружено обновление для:', request.url);
        // Можно отправить уведомление клиенту
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATE_AVAILABLE',
              url: request.url
            });
          });
        });
        
        // Обновляем кэш
        cache.put(request, networkResponse.clone());
      }
    }
  } catch (error) {
    console.error('[Service Worker] Ошибка проверки обновлений:', error);
  }
}
