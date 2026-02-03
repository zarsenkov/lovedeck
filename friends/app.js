// Обновляем объект games в app.js
const games = {
    questions: {
        name: "Вопросы для друзей",
        description: "100+ карточек с вопросами для разговоров",
        players: "2-10",
        time: "15-60 мин",
        color: "#3b82f6",
        icon: "❓",
        hasOnline: false,
        isReady: true
    },
    spy: {
        name: "Шпион",
        description: "Найдите шпиона среди игроков",
        players: "3-8",
        time: "10-20 мин",
        color: "#10b981",
        icon: "🕵️",
        hasOnline: true,
        isReady: true
    },
    bunker: {
        name: "Бункер",
        description: "Выживание после апокалипсиса",
        players: "4-12",
        time: "30-90 мин",
        color: "#f59e0b",
        icon: "🏠",
        hasOnline: false,
        isReady: false
    },
    crocodile: {
        name: "Крокодил",
        description: "Объясняйте слова без слов",
        players: "4+",
        time: "15-45 мин",
        color: "#ef4444",
        icon: "🐊",
        hasOnline: false,
        isReady: true
    },
    truth: {
        name: "Правда или Действие",
        description: "Классика для смелых",
        players: "3+",
        time: "20-60 мин",
        color: "#8b5cf6",
        icon: "🎯",
        hasOnline: false,
        isReady: true
    },
    alias: {
        name: "Алиас",
        description: "Объясняйте слова за время",
        players: "4+",
        time: "20-40 мин",
        color: "#ec4899",
        icon: "🗣️",
        hasOnline: false,
        isReady: false
    }
};

// Обновляем функцию startGame
function startGame(gameId) {
    if (!games[gameId]) return;
    
    if (!games[gameId].isReady) {
        alert('Эта игра скоро будет доступна! Сейчас в разработке.');
        return;
    }
    
    // Сохраняем выбранную игру
    localStorage.setItem('selectedGame', gameId);
    localStorage.setItem('gameName', games[gameId].name);
    
    // Переходим на игровую страницу
    window.location.href = `game.html?game=${gameId}`;
}

// Случайная игра
document.addEventListener('DOMContentLoaded', function() {
    const randomBtn = document.getElementById('random-game');
    if (randomBtn) {
        randomBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const gameIds = Object.keys(games);
            const randomGame = gameIds[Math.floor(Math.random() * gameIds.length)];
            startGame(randomGame);
        });
    }
    
    // Можно добавить анимацию при наведении
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const gameId = this.dataset.game;
            if (games[gameId]) {
                this.style.borderColor = games[gameId].color;
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
        });
    });
});

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { games, startGame };
}
