// Основной файл скриптов для LoveCouple Games

// Состояние приложения
const AppState = {
    initialized: false,
    currentGame: null,
    settings: {
        sound: true,
        vibrations: true,
        animations: true
    }
};

// Инициализация приложения
function initApp() {
    console.log('Инициализация LoveCouple Games...');
    
    // Проверяем сохраненные настройки
    loadSettings();
    
    // Проверяем, есть ли сохраненная игра
    const savedGame = localStorage.getItem('selectedGame');
    if (savedGame) {
        AppState.currentGame = savedGame;
        console.log(`Восстановлена игра: ${savedGame}`);
    }
    
    // Проверяем поддержку функций
    checkFeaturesSupport();
    
    // Устанавливаем обработчики событий
    setupEventListeners();
    
    // Обновляем UI
    updateUI();
    
    AppState.initialized = true;
    console.log('Приложение инициализировано');
}

// Загрузка настроек
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('lovecouple_settings');
        if (savedSettings) {
            AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
    }
}

// Сохранение настроек
function saveSettings() {
    try {
        localStorage.setItem('lovecouple_settings', JSON.stringify(AppState.settings));
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
    }
}

// Проверка поддержки функций
function checkFeaturesSupport() {
    const features = {
        serviceWorker: 'serviceWorker' in navigator,
        pwa: window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator.standalone === true) ||
             document.referrer.includes('android-app://'),
        vibrations: 'vibrate' in navigator,
        notifications: 'Notification' in window && 
                      'serviceWorker' in navigator &&
                      'PushManager' in window,
        offline: 'onLine' in navigator,
        storage: 'localStorage' in window
    };
    
    console.log('Поддерживаемые функции:', features);
    
    // Сохраняем информацию о поддержке
    AppState.features = features;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработка онлайн/офлайн статуса
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    // Обработка изменения видимости страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Предотвращение масштабирования на мобильных
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    // Обработка нажатия клавиши "Назад" на Android
    window.addEventListener('popstate', handlePopState);
    
    // Адаптация к изменению размера окна
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Предотвращение контекстного меню на изображениях
    document.addEventListener('contextmenu', handleContextMenu);
}

// Обработчики событий
function handleOnlineStatus() {
    console.log('Приложение онлайн');
    showToast('Соединение восстановлено', 'success');
    
    // Можно добавить синхронизацию данных
    if (AppState.currentGame) {
        syncGameData(AppState.currentGame);
    }
}

function handleOfflineStatus() {
    console.log('Приложение офлайн');
    showToast('Работаем в офлайн режиме', 'info');
}

function handleVisibilityChange() {
    if (document.hidden) {
        console.log('Приложение скрыто');
        // Сохраняем состояние
        saveAppState();
    } else {
        console.log('Приложение активно');
        // Восстанавливаем состояние
        restoreAppState();
    }
}

function handleTouchStart(e) {
    // Предотвращаем масштабирование при двойном тапе
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}

function handlePopState(e) {
    console.log('Нажата кнопка "Назад"');
    // Можно добавить навигацию по истории приложения
}

function handleResize() {
    console.log('Изменен размер окна:', window.innerWidth, 'x', window.innerHeight);
    updateResponsiveClasses();
}

function handleContextMenu(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
}

// Обновление UI
function updateUI() {
    // Обновляем статус сети
    updateNetworkStatus();
    
    // Обновляем адаптивные классы
    updateResponsiveClasses();
    
    // Показываем/скрываем элементы в зависимости от платформы
    updatePlatformSpecificUI();
}

// Обновление статуса сети
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('online', isOnline);
    document.body.classList.toggle('offline', !isOnline);
}

// Обновление адаптивных классов
function updateResponsiveClasses() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    document.body.classList.toggle('mobile', width < 768);
    document.body.classList.toggle('tablet', width >= 768 && width < 1024);
    document.body.classList.toggle('desktop', width >= 1024);
    document.body.classList.toggle('landscape', width > height);
    document.body.classList.toggle('portrait', height >= width);
}

// Обновление UI в зависимости от платформы
function updatePlatformSpecificUI() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    document.body.classList.toggle('ios', isIOS);
    document.body.classList.toggle('android', isAndroid);
    
    // Добавляем отступы для безопасных областей на iOS
    if (isIOS) {
        const style = document.createElement('style');
        style.textContent = `
            .ios-safe-area {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            }
        `;
        document.head.appendChild(style);
    }
}

// Загрузка игры
async function loadGame(gameName) {
    if (!gameName) {
        console.error('Не указано название игры');
        return;
    }
    
    try {
        console.log(`Загрузка игры: ${gameName}`);
        
        // Показываем индикатор загрузки
        showLoading(true);
        
        // Вибрация на мобильных
        if (AppState.settings.vibrations && AppState.features.vibrations) {
            navigator.vibrate(50);
        }
        
        // Сохраняем выбранную игру
        AppState.currentGame = gameName;
        localStorage.setItem('selectedGame', gameName);
        
        // Сохраняем историю
        saveToHistory(gameName);
        
        // Переходим к игре
        setTimeout(() => {
            window.location.href = `games/${gameName}/index.html`;
        }, 300);
        
    } catch (error) {
        console.error('Ошибка загрузки игры:', error);
        showToast('Не удалось загрузить игру', 'error');
        showLoading(false);
    }
}

// Показать/скрыть индикатор загрузки
function showLoading(show) {
    let loader = document.getElementById('global-loader');
    
    if (show && !loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="loader-overlay">
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        `;
        
        // Стили для лоадера
        const style = document.createElement('style');
        style.textContent = `
            .loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
            }
            
            .loader-content {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .loader-spinner {
                width: 48px;
                height: 48px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #8b5cf6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loader);
        
    } else if (!show && loader) {
        loader.remove();
    }
}

// Показать уведомление
function showToast(message, type = 'info') {
    // Создаем тост, если его еще нет
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Создаем тост
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    // Стили для тоста
    const toastStyle = {
        info: { background: '#3b82f6', color: 'white' },
        success: { background: '#10b981', color: 'white' },
        warning: { background: '#f59e0b', color: 'white' },
        error: { background: '#ef4444', color: 'white' }
    };
    
    Object.assign(toast.style, {
        padding: '12px 16px',
        borderRadius: '8px',
        background: toastStyle[type].background,
        color: toastStyle[type].color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease'
    });
    
    // Анимация
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .toast-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // Кнопка закрытия
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
    
    // Автоматическое закрытие
    toastContainer.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Сохранение в историю
function saveToHistory(gameName) {
    try {
        let history = JSON.parse(localStorage.getItem('game_history') || '[]');
        
        // Добавляем запись
        history.unshift({
            game: gameName,
            timestamp: new Date().toISOString(),
            duration: null
        });
        
        // Ограничиваем историю 50 записями
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('game_history', JSON.stringify(history));
    } catch (error) {
        console.error('Ошибка сохранения истории:', error);
    }
}

// Синхронизация данных игры
async function syncGameData(gameName) {
    // Здесь можно добавить логику синхронизации с сервером
    console.log(`Синхронизация данных для игры: ${gameName}`);
}

// Сохранение состояния приложения
function saveAppState() {
    try {
        const state = {
            currentGame: AppState.currentGame,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('app_state', JSON.stringify(state));
    } catch (error) {
        console.error('Ошибка сохранения состояния:', error);
    }
}

// Восстановление состояния приложения
function restoreAppState() {
    try {
        const savedState = localStorage.getItem('app_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            // Можно восстановить состояние, если нужно
            console.log('Восстановлено состояние:', state);
        }
    } catch (error) {
        console.error('Ошибка восстановления состояния:', error);
    }
}

// Вспомогательные функции
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Запрашиваем разрешение на уведомления
function requestNotificationPermission() {
    if (!AppState.features.notifications) {
        return Promise.reject(new Error('Уведомления не поддерживаются'));
    }
    
    return Notification.requestPermission().then(permission => {
        console.log('Разрешение на уведомления:', permission);
        return permission;
    });
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Плавное появление
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        
        // Инициализируем приложение
        initApp();
        
        // Проверяем обновления Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
            });
        }
    }, 100);
});

// Экспортируем функции для использования в других файлах
window.LoveCouple = {
    loadGame,
    showToast,
    showLoading,
    requestNotificationPermission,
    getSettings: () => ({ ...AppState.settings }),
    updateSettings: (newSettings) => {
        AppState.settings = { ...AppState.settings, ...newSettings };
        saveSettings();
    }
};

console.log('LoveCouple Games script loaded');
