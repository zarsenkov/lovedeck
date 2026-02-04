// Версия кэша
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `lovecouple-cache-${CACHE_VERSION}`;

// Файлы для кэширования
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Установка');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Кэширование основных файлов');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Пропуск ожидания');
                return self.skipWaiting();
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Активация');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Клиенты активированы');
            return self.clients.claim();
        })
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    // Пропускаем запросы к внешним API
    if (event.request.url.includes('google-analytics') || 
        event.request.url.includes('api.')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Возвращаем кэшированный ответ, если он есть
                if (cachedResponse) {
                    // Обновляем кэш в фоне
                    fetchAndCache(event.request);
                    return cachedResponse;
                }
                
                // Если нет в кэше, делаем сетевой запрос
                return fetchAndCache(event.request);
            })
            .catch(error => {
                console.log('[Service Worker] Ошибка fetch:', error);
                
                // Для HTML запросов возвращаем запасную страницу
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
                
                // Для других типов можно вернуть запасной контент
                return new Response('Нет подключения к сети', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// Функция для получения и кэширования
function fetchAndCache(request) {
    return fetch(request)
        .then(response => {
            // Проверяем, валидный ли ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            
            // Клонируем ответ
            const responseToCache = response.clone();
            
            // Кэшируем
            caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(request, responseToCache);
                });
            
            return response;
        });
}

// Обработка push-уведомлений
self.addEventListener('push', event => {
    console.log('[Service Worker] Push уведомление получено');
    
    const title = 'LoveCouple Games';
    const options = {
        body: event.data?.text() || 'Новые игры доступны!',
        icon: 'assets/icon-192.png',
        badge: 'assets/icon-96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Уведомление было кликнуто');
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Фоновые задачи
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
        console.log('[Service Worker] Фоновая синхронизация');
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    // Здесь можно добавить логику обновления контента
    console.log('[Service Worker] Обновление контента...');
}
