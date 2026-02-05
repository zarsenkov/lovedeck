// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let gameState = {
    players: [],
    categories: [],
    currentRound: 1,
    totalRounds: 5,
    currentPlayerIndex: 0,
    currentWord: null,
    usedWords: new Set(),
    scores: {},
    timeLeft: 120,
    timerInterval: null,
    gameActive: false,
    categoriesData: {},
    isPaused: false
};

// ===== ФИКС ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ =====
function fixMobileViewport() {
    // Фикс высоты для iOS
    const setAppHeight = () => {
        const doc = document.documentElement;
        doc.style.setProperty('--app-height', `${window.innerHeight}px`);
        
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.height = 'var(--app-height)';
        }
    };
    
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    
    // Предотвращаем масштабирование при фокусе на input
    document.addEventListener('focusin', (e) => {
        if (e.target.matches('input, textarea')) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    // Предотвращаем стандартное поведение касания
    document.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            e.preventDefault();
        }
    }, { passive: false });
    
    setAppHeight();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    // Фикс для мобильных устройств
    fixMobileViewport();
    
    // Загрузка категорий
    await loadCategories();
    
    // Инициализация
    initDefaultState();
    
    // Показ главного экрана
    showScreen('homeScreen');
    
    // Предотвращаем скролл страницы
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('.screen')) {
            e.preventDefault();
        }
    }, { passive: false });
});

function initDefaultState() {
    // Настройки по умолчанию
    gameState.players = [];
    gameState.categories = Object.keys(gameState.categoriesData || {}).slice(0, 4);
    gameState.timeLeft = 120;
    gameState.totalRounds = 5;
}

async function loadCategories() {
    try {
        // Пробуем загрузить категории
        let response;
        const paths = [
            '/friends/games/whoami/categories.json',
            './categories.json',
            'categories.json'
        ];
        
        for (const path of paths) {
            try {
                response = await fetch(path);
                if (response.ok) break;
            } catch (e) {
                continue;
            }
        }
        
        if (response && response.ok) {
            const data = await response.json();
            gameState.categoriesData = data.categories || {};
            console.log('Категории загружены:', Object.keys(gameState.categoriesData).length, 'категорий');
        } else {
            throw new Error('Не удалось загрузить категории');
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        // Стандартные категории на случай ошибки
        gameState.categoriesData = {
            '🎭 Персонажи': ['Гарри Поттер', 'Шерлок Холмс', 'Дарт Вейдер'],
            '🎬 Фильмы': ['Криминальное чтиво', 'Назад в будущее'],
            '🌟 Знаменитости': ['Леонардо ДиКаприо', 'Бейонсе', 'Илон Маск'],
            '🍽️ Еда': ['Пицца', 'Суши', 'Шоколад']
        };
        console.warn('Используются стандартные категории');
    }
}

// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====
function showScreen(screenId) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать нужный экран
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        
        // Остановить таймер при переходе с игрового экрана
        if (screenId !== 'gameScreen' && gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Дополнительные действия
        switch(screenId) {
            case 'homeScreen':
                resetGameState();
                break;
            case 'setupScreen':
                initSetupScreen();
                break;
            case 'readyScreen':
                prepareReadyScreen();
                break;
            case 'gameScreen':
                startGameRound();
                break;
            case 'resultsScreen':
                showResults();
                break;
        }
        
        // Прокрутка наверх
        setTimeout(() => {
            screen.scrollTop = 0;
        }, 50);
    }
}

// ===== ГЛАВНЫЙ ЭКРАН =====
function changePlayerCount(change) {
    const countElement = document.getElementById('playerCount');
    let count = parseInt(countElement.textContent) + change;
    
    // Минимум 2, максимум 8 игроков
    count = Math.max(2, Math.min(8, count));
    countElement.textContent = count;
}

function goToSetup() {
    const playerCount = parseInt(document.getElementById('playerCount').textContent);
    
    // Создаем игроков
    gameState.players = [];
    for (let i = 0; i < playerCount; i++) {
        gameState.players.push({
            id: i + 1,
            name: `Игрок ${i + 1}`,
            score: 0,
            guessed: 0,
            skipped: 0
        });
    }
    
    showScreen('setupScreen');
}

// ===== ЭКРАН НАСТРОЕК =====
function initSetupScreen() {
    initPlayersList();
    initCategoriesList();
    
    // Установка значений по умолчанию
    document.getElementById('timerSeconds').value = 120;
    document.getElementById('roundsCount').value = 5;
}

function initPlayersList() {
    const container = document.getElementById('playersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-input';
        input.value = player.name;
        input.placeholder = `Имя игрока ${index + 1}`;
        input.maxLength = 20;
        
        // Сохраняем имя при изменении
        input.addEventListener('input', function() {
            const newName = this.value.trim();
            gameState.players[index].name = newName || `Игрок ${index + 1}`;
        });
        
        // Сохраняем при потере фокуса
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.value = `Игрок ${index + 1}`;
                gameState.players[index].name = `Игрок ${index + 1}`;
            }
        });
        
        container.appendChild(input);
    });
}

function initCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container || !gameState.categoriesData) return;
    
    container.innerHTML = '';
    
    const categories = Object.keys(gameState.categoriesData);
    
    categories.forEach(category => {
        const words = gameState.categoriesData[category];
        const wordsCount = words ? words.length : 0;
        
        if (wordsCount === 0) return;
        
        const div = document.createElement('div');
        div.className = 'category-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `cat_${category.replace(/[^\w\u0400-\u04FF]/g, '_')}`;
        checkbox.value = category;
        checkbox.checked = gameState.categories.includes(category);
        
        const label = document.createElement('label');
        label.className = 'category-label';
        label.htmlFor = checkbox.id;
        label.textContent = `${category} (${wordsCount})`;
        label.title = category;
        
        // Обработка выбора категории
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!gameState.categories.includes(this.value)) {
                    gameState.categories.push(this.value);
                }
            } else {
                const index = gameState.categories.indexOf(this.value);
                if (index > -1) {
                    gameState.categories.splice(index, 1);
                }
            }
        });
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

function changeTimer(change) {
    const input = document.getElementById('timerSeconds');
    let value = parseInt(input.value) + change;
    value = Math.max(30, Math.min(300, value));
    input.value = value;
    input.dispatchEvent(new Event('change'));
}

// ===== НАЧАЛО ИГРЫ =====
function startGame() {
    // Проверяем выбранные категории
    const selectedCategories = gameState.categories.filter(cat => 
        gameState.categoriesData[cat] && gameState.categoriesData[cat].length > 0
    );
    
    if (selectedCategories.length === 0) {
        showNotification('Выберите хотя бы одну категорию!', 'error');
        return;
    }
    
    // Обновляем настройки
    gameState.totalRounds = parseInt(document.getElementById('roundsCount').value) || 5;
    const timerSeconds = parseInt(document.getElementById('timerSeconds').value) || 120;
    gameState.timeLeft = timerSeconds;
    
    // Сброс состояния игры
    gameState.currentRound = 1;
    gameState.currentPlayerIndex = 0;
    gameState.usedWords.clear();
    gameState.scores = {};
    gameState.gameActive = true;
    gameState.isPaused = false;
    
    // Инициализация счета
    gameState.players.forEach(player => {
        player.score = 0;
        player.guessed = 0;
        player.skipped = 0;
        gameState.scores[player.id] = 0;
    });
    
    // Показываем экран подготовки
    showScreen('readyScreen');
}

// ===== ЭКРАН ПОДГОТОВКИ =====
function prepareReadyScreen() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Генерируем новое слово
    const word = getRandomWord();
    gameState.currentWord = word;
    
    // Обновляем отображение
    document.getElementById('currentPlayerName').textContent = player.name;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
    
    // Сбрасываем плейсхолдеры
    const wordElement = document.getElementById('wordPlaceholder');
    const categoryElement = document.getElementById('categoryPlaceholder');
    const btn = document.getElementById('showWordBtn');
    
    wordElement.textContent = '???';
    categoryElement.textContent = 'Категория';
    wordElement.style.opacity = '1';
    categoryElement.style.opacity = '1';
    
    // Активируем кнопку
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-eye"></i> Показать слово';
    btn.onclick = showWord;
}

function showWord() {
    if (!gameState.currentWord) {
        gameState.currentWord = getRandomWord();
    }
    
    const btn = document.getElementById('showWordBtn');
    const wordElement = document.getElementById('wordPlaceholder');
    const categoryElement = document.getElementById('categoryPlaceholder');
    
    // Отключаем кнопку на время анимации
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 3';
    
    let count = 3;
    const countdown = setInterval(() => {
        count--;
        if (count > 0) {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${count}`;
        } else {
            clearInterval(countdown);
            
            // Показываем слово с анимацией
            wordElement.textContent = gameState.currentWord.word;
            categoryElement.textContent = gameState.currentWord.category;
            
            wordElement.style.animation = 'none';
            categoryElement.style.animation = 'none';
            setTimeout(() => {
                wordElement.style.animation = 'fadeIn 0.5s ease';
                categoryElement.style.animation = 'fadeIn 0.5s ease';
            }, 10);
            
            // Меняем кнопку
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-arrow-right"></i> Перейти к игре';
            btn.onclick = () => showScreen('gameScreen');
        }
    }, 1000);
}

function skipPlayer() {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.skipped++;
    showNotification(`${player.name} пропущен`, 'warning');
    
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    // Проверяем, не завершился ли раунд
    if (gameState.currentPlayerIndex === 0) {
        gameState.currentRound++;
        if (gameState.currentRound > gameState.totalRounds) {
            endGame();
            return;
        }
    }
    
    prepareReadyScreen();
}

// ===== ИГРОВОЙ ЭКРАН =====
function startGameRound() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Обновляем отображение
    document.getElementById('currentPlayerDisplay').textContent = player.name;
    document.getElementById('roundNumber').textContent = gameState.currentRound;
    document.getElementById('totalRoundsGame').textContent = gameState.totalRounds;
    
    if (gameState.currentWord) {
        document.getElementById('currentWord').textContent = gameState.currentWord.word;
        document.getElementById('wordCategory').textContent = gameState.currentWord.category;
    }
    
    // Обновляем счет
    updateScoreboard();
    
    // Запускаем таймер
    if (gameState.timeLeft > 0 && !gameState.isPaused) {
        startTimer();
    }
    
    updateTimerDisplay();
}

function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            updateTimerDisplay();
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                skipWord();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    const timerElement = document.getElementById('timerDisplay');
    if (timerElement) {
        timerElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
        // Меняем цвет при малом времени
        if (gameState.timeLeft <= 30) {
            timerElement.style.color = '#ef4444';
            timerElement.style.fontWeight = 'bold';
        } else {
            timerElement.style.color = '';
            timerElement.style.fontWeight = '';
        }
    }
}

function getRandomWord() {
    if (gameState.categories.length === 0) {
        return { word: "Нет слов", category: "Ошибка" };
    }
    
    // Выбираем случайную категорию
    const availableCategories = gameState.categories.filter(cat => {
        const words = gameState.categoriesData[cat];
        return words && words.length > 0;
    });
    
    if (availableCategories.length === 0) {
        return { word: "Нет доступных слов", category: "Ошибка" };
    }
    
    const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const words = gameState.categoriesData[randomCategory];
    
    if (!words || words.length === 0) {
        return getRandomWord(); // Рекурсивно пробуем другую категорию
    }
    
    let word;
    let attempts = 0;
    const maxAttempts = Math.min(50, words.length * 2);
    
    do {
        word = words[Math.floor(Math.random() * words.length)];
        attempts++;
    } while (gameState.usedWords.has(word) && attempts < maxAttempts);
    
    // Если все слова использованы, очищаем историю
    if (attempts >= maxAttempts) {
        gameState.usedWords.clear();
        word = words[Math.floor(Math.random() * words.length)];
    }
    
    gameState.usedWords.add(word);
    return { word, category: randomCategory };
}

// ===== ИГРОВЫЕ ДЕЙСТВИЯ =====
function correctGuess() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    player.score += 10;
    player.guessed++;
    gameState.scores[player.id] = player.score;
    
    showNotification(`Правильно! +10 очков. Угадано: ${player.guessed}`);
    nextTurn();
}

function skipWord() {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.skipped++;
    
    // Меняем слово
    gameState.currentWord = getRandomWord();
    document.getElementById('currentWord').textContent = gameState.currentWord.word;
    document.getElementById('wordCategory').textContent = gameState.currentWord.category;
    
    // Сбрасываем таймер
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    const timerSeconds = parseInt(document.getElementById('timerSeconds').value) || 120;
    gameState.timeLeft = timerSeconds;
    
    if (gameState.gameActive && !gameState.isPaused) {
        startTimer();
    }
    
    updateTimerDisplay();
    showNotification('Слово изменено');
}

function giveUp() {
    showModal('giveUpModal');
}

function confirmGiveUp() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    player.score = Math.max(0, player.score - 10);
    gameState.scores[player.id] = player.score;
    
    closeModal('giveUpModal');
    showNotification('Сдался! -10 очков', 'warning');
    nextTurn();
}

function nextTurn() {
    // Останавливаем таймер
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Следующий игрок
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    // Если все игроки сходили - следующий раунд
    if (gameState.currentPlayerIndex === 0) {
        gameState.currentRound++;
        
        if (gameState.currentRound > gameState.totalRounds) {
            endGame();
            return;
        }
    }
    
    // Сбрасываем таймер
    const timerSeconds = parseInt(document.getElementById('timerSeconds').value) || 120;
    gameState.timeLeft = timerSeconds;
    
    // Подготовка следующего хода
    gameState.currentWord = getRandomWord();
    showScreen('readyScreen');
}

function updateScoreboard() {
    const container = document.getElementById('scoreboard');
    if (!container) return;
    
    container.innerHTML = '';
    
    const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;
    
    // Сортируем по очкам (по убыванию)
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = `score-row ${player.id === currentPlayerId ? 'current' : ''}`;
        
        div.innerHTML = `
            <div class="score-name">
                <i class="fas fa-${index === 0 ? 'crown' : 'user'}"></i>
                <span>${player.name}</span>
            </div>
            <div class="score-value">${player.score}</div>
        `;
        
        container.appendChild(div);
    });
}

// ===== ЗАВЕРШЕНИЕ ИГРЫ =====
function endGame() {
    // Остановка таймера
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    gameState.gameActive = false;
    gameState.isPaused = false;
    
    showScreen('resultsScreen');
}

function showResults() {
    // Определение победителя
    let maxScore = -1;
    let winner = null;
    
    gameState.players.forEach(player => {
        if (player.score > maxScore) {
            maxScore = player.score;
            winner = player;
        }
    });
    
    if (winner) {
        document.getElementById('winnerName').textContent = winner.name;
    }
    
    const container = document.getElementById('resultsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Сортируем по очкам
    const sorted = [...gameState.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.guessed - a.guessed;
    });
    
    sorted.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        div.innerHTML = `
            <div class="result-rank">${index + 1}</div>
            <div class="result-info">
                <div class="result-name">${player.name}</div>
                <div class="result-stats">
                    <span>Угадано: ${player.guessed}</span>
                    <span>Пропущено: ${player.skipped}</span>
                </div>
            </div>
            <div class="result-score">${player.score}</div>
        `;
        
        container.appendChild(div);
    });
}

// ===== УПРАВЛЕНИЕ ИГРОЙ =====
function pauseGame() {
    gameState.isPaused = true;
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    showModal('pauseModal');
}

function resumeGame() {
    gameState.isPaused = false;
    closeModal('pauseModal');
    
    if (gameState.timeLeft > 0) {
        startTimer();
    }
}

function newGame() {
    resetGameState();
    showScreen('homeScreen');
}

function resetGameState() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    gameState.currentRound = 1;
    gameState.currentPlayerIndex = 0;
    gameState.usedWords.clear();
    gameState.scores = {};
    gameState.gameActive = false;
    gameState.isPaused = false;
    
    const timerSeconds = parseInt(document.getElementById('timerSeconds')?.value) || 120;
    gameState.timeLeft = timerSeconds;
    
    // Сброс счета игроков
    if (gameState.players) {
        gameState.players.forEach(player => {
            player.score = 0;
            player.guessed = 0;
            player.skipped = 0;
        });
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showNotification(text, type = 'success') {
    // Удаляем старые уведомления
    document.querySelectorAll('.notification').forEach(el => el.remove());
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    
    // Цвет в зависимости от типа
    if (type === 'warning') {
        notification.style.background = '#f59e0b';
    } else if (type === 'error') {
        notification.style.background = '#ef4444';
    } else {
        notification.style.background = '#10b981';
    }
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function goBack() {
    if (gameState.gameActive && !gameState.isPaused) {
        pauseGame();
    } else if (document.querySelector('#setupScreen.active')) {
        showScreen('homeScreen');
    } else if (document.querySelector('#readyScreen.active')) {
        showScreen('setupScreen');
    } else if (document.querySelector('#gameScreen.active')) {
        showScreen('readyScreen');
    } else if (document.querySelector('#resultsScreen.active')) {
        showScreen('homeScreen');
    } else {
        goHome();
    }
}

function goHome() {
    window.location.href = '../../index.html';
}

// Добавляем CSS анимацию
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Экспорт функций в глобальную область видимости
window.changePlayerCount = changePlayerCount;
window.goToSetup = goToSetup;
window.changeTimer = changeTimer;
window.startGame = startGame;
window.showWord = showWord;
window.skipPlayer = skipPlayer;
window.correctGuess = correctGuess;
window.skipWord = skipWord;
window.giveUp = giveUp;
window.confirmGiveUp = confirmGiveUp;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.endGame = endGame;
window.newGame = newGame;
window.showScreen = showScreen;
window.goBack = goBack;
window.goHome = goHome;
window.closeModal = closeModal;
