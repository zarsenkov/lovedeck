const CACHE_NAME = 'lovecouple-quiz-v4';
const urlsToCache = [
  '/friends/',
  '/friends/index.html',
  '/friends/style.css',
  '/friends/games/quiz/index.html',
  '/friends/games/quiz/style.css',
  '/friends/games/quiz/script.js',
  '/friends/games/quiz/questions.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Добавляем иконки в кэш только если они существуют
const iconUrls = [
  '/friends/icon-192.png',
  '/friends/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Кэширование основных файлов');
        // Кэшируем основные файлы
        return cache.addAll(urlsToCache)
          .then(() => {
            // Пробуем добавить иконки, но не падаем если их нет
            return Promise.all(
              iconUrls.map(url => 
                cache.add(url).catch(err => {
                  console.log('[Service Worker] Иконка не найдена:', url);
                  return Promise.resolve(); // Игнорируем ошибку
                })
              )
            );
          });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Удаляем старый кэш:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Пропускаем non-GET запросы
  if (event.request.method !== 'GET') return;
  
  // Пропускаем запросы к внешним ресурсам (кроме тех что в кэше)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !urlsToCache.includes(event.request.url) &&
      !event.request.url.includes('cdnjs.cloudflare.com') &&
      !event.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша если есть
        if (response) {
          return response;
        }
        
        // Иначе загружаем из сети
        return fetch(event.request)
          .then(response => {
            // Проверяем валидный ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем для кэша
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // Если офлайн и нет в кэше
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/friends/index.html');
            }
            
            // Для картинок возвращаем заглушку
            if (event.request.headers.get('accept').includes('image')) {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" fill="#f8fafc"/><text x="96" y="100" text-anchor="middle" font-family="Arial" font-size="20" fill="#6366f1">🧠</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
          });
      })
  );
});
