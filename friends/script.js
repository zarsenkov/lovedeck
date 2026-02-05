// Конфигурация статусов игр
const gameStatus = {
    'whoami': 'available',     // Доступна
    'spy': 'available',        // Доступна
    'crocodile': 'available',  // Доступна
    'alias': 'maintenance',      // Технические работы
    'danetki': 'available',    // Доступна
    'quiz': 'available',       // Доступна
    'bunker': 'coming-soon',   // Скоро
    'mafia': 'maintenance',    // Технические работы (пример другого статуса)
    'newgame': 'coming-soon'   // Скоро
};

// Тексты для разных статусов
const statusTexts = {
    'available': {
        button: '<i class="fas fa-play"></i> Начать игру',
        badge: null
    },
    'coming-soon': {
        button: '<i class="fas fa-hourglass-half"></i> В разработке',
        badge: 'СКОРО'
    },
    'maintenance': {
        button: '<i class="fas fa-tools"></i> Технические работы',
        badge: 'РЕМОНТ'
    }
};

// Загрузка игры
function loadGame(gameName) {
    // Проверяем статус игры
    const status = gameStatus[gameName];
    
    // Если игра недоступна, не переходим
    if (status !== 'available') {
        const card = document.querySelector(`[data-game="${gameName}"]`);
        if (card) {
            // Анимация "запрета"
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = 'shake 0.5s ease';
            }, 10);
        }
        return;
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('selectedGame', gameName);
    
    // Показываем loading state
    const btn = event.target.closest('.play-btn') || event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    btn.disabled = true;
    
    // Переход через секунду (для плавности)
    setTimeout(() => {
        window.location.href = `games/${gameName}/index.html`;
    }, 500);
}

// Обновляем статусы карточек игр
function updateGameStatus() {
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        const gameName = card.getAttribute('data-game');
        const status = gameStatus[gameName];
        
        if (status !== 'available') {
            // Добавляем класс для стилизации
            card.classList.add(status);
            
            // Обновляем текст кнопки
            const button = card.querySelector('.play-btn');
            if (button) {
                button.innerHTML = statusTexts[status].button;
                button.classList.add('disabled');
            }
            
            // Добавляем бейдж, если нужно
            if (statusTexts[status].badge) {
                let badge = card.querySelector('.game-status-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'game-status-badge';
                    card.appendChild(badge);
                }
                badge.textContent = statusTexts[status].badge;
                
                // Убираем клик по карточке для недоступных игр
                card.removeAttribute('onclick');
                card.style.cursor = 'default';
            }
        } else {
            // Для доступных игр добавляем обработчик клика
            const button = card.querySelector('.play-btn');
            if (button) {
                button.addEventListener('click', () => loadGame(gameName));
            }
        }
    });
}

// Проверяем, есть ли сохраненная игра
function checkSavedGame() {
    const savedGame = localStorage.getItem('selectedGame');
    if (savedGame) {
        console.log(`Есть сохраненная игра: ${savedGame}`);
        // Здесь можно добавить логику продолжения игры
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkSavedGame();
    updateGameStatus();
    
    // Плавное появление контента
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Добавляем hover-эффекты для карточек
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('coming-soon') && 
                !card.classList.contains('maintenance')) {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Добавляем анимацию появления карточек
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Анимация для недоступных игр
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);



