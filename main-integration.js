// Основной файл для интеграции всех фич
function initializeAllFeatures() {
    console.log('🎮 Инициализация LoveDeck...');
    
    // 1. Загружаем локальное хранилище (если есть)
    if (typeof DeckManager !== 'undefined') {
        console.log('✅ Локальное хранилище загружено');
    }
    
    // 2. Инициализируем удаленную игру
    setTimeout(() => {
        if (typeof RemoteSession !== 'undefined') {
            RemoteSession.checkUrlForSession();
            console.log('✅ Удаленная игра инициализирована');
        }
    }, 500);
    
    // 3. Инициализируем пирамиду
    setTimeout(() => {
        if (typeof LovePyramid !== 'undefined') {
            console.log('✅ Пирамида инициализирована');
        }
    }, 1000);
    
    // 4. Организуем кнопки
    organizeAllButtons();
}

// Организация всех плавающих кнопок
function organizeAllButtons() {
    const buttons = [
        { id: 'pyramid-btn', text: '🏆', top: 20, color: '#2196F3' },
        { id: 'remote-play-btn', text: '🎮', top: 90, color: '#ff6b8b' },
        { id: 'stats-btn', text: '📊', top: 160, color: '#4CAF50' },
        { id: 'share-btn', text: '📤', top: 230, color: '#ff8e53' }
    ];
    
    buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.style.cssText = `
                position: fixed;
                right: 20px;
                top: ${btn.top}px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: ${btn.color};
                color: white;
                border: none;
                font-size: 24px;
                cursor: pointer;
                z-index: 999;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.3s;
            `;
            
            element.onmouseenter = () => {
                element.style.transform = 'scale(1.1)';
                element.style.boxShadow = `0 4px 20px ${btn.color}80`;
            };
            
            element.onmouseleave = () => {
                element.style.transform = 'scale(1)';
                element.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            };
        }
    });
}

// Запускаем инициализацию при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFeatures);
} else {
    initializeAllFeatures();
}

// Экспортируем глобальные функции для HTML
window.openPyramid = function() {
    if (typeof LovePyramid !== 'undefined') {
        const stats = DeckManager ? DeckManager.getStats() : { opened: 0, liked: 0, completed: 0 };
        const points = LovePyramid.calculatePoints(stats);
        LovePyramid.showPyramid(points);
    }
};

window.startRemoteSession = function() {
    if (typeof RemoteSession !== 'undefined') {
        RemoteSession.createSession();
    }
};
