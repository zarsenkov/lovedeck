// ===== GAME STATUS CONFIGURATION =====
const gameStatus = {
    'whoami': 'available',
    'spy': 'available',
    'crocodile': 'available',
    'alias': 'available',
    'danetki': 'available',
    'quiz': 'available',
    'bunker': 'coming-soon',
    'mafia': 'maintenance',
    'newgame': 'coming-soon'
};

// ===== UTILITY FUNCTIONS =====

/**
 * Активирует черную шторку для перехода
 */
function activateBlackFade() {
    const fade = document.querySelector('.black-fade');
    if (fade) {
        fade.classList.add('active');
    }
}

/**
 * Деактивирует черную шторку
 */
function deactivateBlackFade() {
    const fade = document.querySelector('.black-fade');
    if (fade) {
        fade.classList.remove('active');
    }
}

/**
 * Показывает loading state на кнопке
 */
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        const span = button.querySelector('span');
        if (span) {
            span.setAttribute('data-original-text', span.textContent);
            span.textContent = 'ЗАГРУЗКА';
        }
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        const span = button.querySelector('span');
        if (span) {
            const originalText = span.getAttribute('data-original-text');
            if (originalText) {
                span.textContent = originalText;
            }
        }
    }
}

/**
 * Анимация "запрета" для недоступных игр
 */
function shakeCard(card) {
    if (!card) return;
    
    // Удаляем класс, если он уже есть
    card.classList.remove('shake');
    
    // Триггерим reflow
    void card.offsetWidth;
    
    // Добавляем класс заново
    card.classList.add('shake');
    
    // Удаляем класс после анимации
    setTimeout(() => {
        card.classList.remove('shake');
    }, 500);
}

// ===== MAIN GAME LOADING FUNCTION =====

/**
 * Загружает игру с валидацией и плавным переходом
 * @param {string} gameName - ID игры
 * @param {Event} event - Event объект
 */
function loadGame(gameName, event) {
    // Предотвращаем баббл события
    if (event) {
        event.stopPropagation();
    }
    
    // Проверяем статус игры
    const status = gameStatus[gameName];
    
    // Если игра недоступна
    if (status !== 'available') {
        const card = document.querySelector(`[data-game="${gameName}"]`);
        shakeCard(card);
        return;
    }
    
    // Сохраняем выбранную игру
    try {
        localStorage.setItem('selectedGame', gameName);
    } catch (e) {
        console.warn('localStorage недоступен:', e);
    }
    
    // Находим кнопку
    const button = event ? event.currentTarget : null;
    
    // Показываем loading state
    setButtonLoading(button, true);
    
    // Активируем черную шторку
    activateBlackFade();
    
    // Переходим на страницу игры
    setTimeout(() => {
        window.location.href = `games/${gameName}/index.html`;
    }, 400);
}

// ===== INITIALIZATION =====

/**
 * Инициализирует обработчики событий для карточек игр
 */
function initializeGameCards() {
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        const gameName = card.getAttribute('data-game');
        const status = card.getAttribute('data-status');
        const button = card.querySelector('.play-btn');
        
        // Для доступных игр
        if (status === 'available' && button) {
            // Убираем старые обработчики
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Добавляем новый обработчик
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                loadGame(gameName, e);
            });
            
            // Добавляем обработчик на саму карточку
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Игнорируем клики по кнопке (они обрабатываются отдельно)
                if (e.target.closest('.play-btn')) {
                    return;
                }
                loadGame(gameName, e);
            });
        }
        
        // Для недоступных игр
        if ((status === 'coming-soon' || status === 'maintenance') && button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                shakeCard(card);
            });
            
            card.addEventListener('click', (e) => {
                e.preventDefault();
                shakeCard(card);
            });
        }
    });
}

/**
 * Проверяет наличие сохраненной игры
 */
function checkSavedGame() {
    try {
        const savedGame = localStorage.getItem('selectedGame');
        if (savedGame) {
            console.log(`Сохраненная игра: ${savedGame}`);
            // Здесь можно добавить логику для отображения "Продолжить игру"
        }
    } catch (e) {
        console.warn('localStorage недоступен:', e);
    }
}

/**
 * Добавляет CSS для анимации shake
 */
function injectShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
            20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        
        .game-card.shake {
            animation: shake 0.5s ease;
        }
    `;
    document.head.appendChild(style);
}

// ===== DOCUMENT READY =====

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация
    checkSavedGame();
    injectShakeAnimation();
    initializeGameCards();
    
    // Убираем черную шторку при загрузке (если осталась)
    deactivateBlackFade();
    
    // Плавное появление body
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 50);
    
    console.log('✓ LoveCouple Games инициализирован');
});

// ===== ERROR HANDLING =====

// Глобальный обработчик ошибок
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
    // Деактивируем fade в случае ошибки
    deactivateBlackFade();
});

// Обработчик unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    deactivateBlackFade();
});

// ===== PREVENT SCROLL ISSUES =====

// Предотвращаем горизонтальный скролл
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
});