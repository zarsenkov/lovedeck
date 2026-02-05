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
    categoriesData: {}
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    // Загрузка категорий
    await loadCategories();
    
    // Инициализация игроков
    initPlayers();
    
    // Инициализация категорий
    initCategories();
    
    // Показ главного экрана
    showScreen('homeScreen');
    
    // Фикс высоты для мобильных
    fixViewportHeight();
    window.addEventListener('resize', fixViewportHeight);
});

function fixViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

async function loadCategories() {
    try {
        // Правильный путь к файлу categories.json
        const response = await fetch('/friends/games/whoami/categories.json'); // добавили ./
        const data = await response.json();
        gameState.categoriesData = data.categories;
        console.log('Категории загружены:', Object.keys(data.categories).length, 'категорий');
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
        }
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
            guessed: 0
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
        input.onchange = function() {
            updatePlayerName(index, this.value);
        };
        container.appendChild(input);
    });
}

function updatePlayerName(index, newName) {
    if (newName.trim()) {
        gameState.players[index].name = newName.trim();
    }
}

function initCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container || !gameState.categoriesData) return;
    
    container.innerHTML = '';
    
    Object.keys(gameState.categoriesData).forEach(category => {
        const wordsCount = gameState.categoriesData[category].length;
        
        const div = document.createElement('div');
        div.className = 'category-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `cat_${category}`;
        checkbox.value = category;
        checkbox.checked = true;
        
        const label = document.createElement('label');
        label.className = 'category-label';
        label.htmlFor = `cat_${category}`;
        label.textContent = `${category} (${wordsCount})`;
        
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
}

// ===== НАЧАЛО ИГРЫ =====
function startGame() {
    // Получаем настройки
    gameState.totalRounds = parseInt(document.getElementById('roundsCount').value);
    const timerSeconds = parseInt(document.getElementById('timerSeconds').value);
    gameState.timeLeft = timerSeconds;
    
    // Получаем выбранные категории
    const selectedCategories = Array.from(
        document.querySelectorAll('.category-item input:checked')
    ).map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        alert('Выберите хотя бы одну категорию!');
        return;
    }
    
    gameState.categories = selectedCategories;
    
    // Сброс состояния игры
    gameState.currentRound = 1;
    gameState.currentPlayerIndex = 0;
    gameState.usedWords.clear();
    gameState.scores = {};
    gameState.gameActive = true;
    
    // Инициализация счета
    gameState.players.forEach(player => {
        player.score = 0;
        player.guessed = 0;
        gameState.scores[player.id] = 0;
    });
    
    // Показываем экран подготовки
    showScreen('readyScreen');
}

// ===== ЭКРАН ПОДГОТОВКИ =====
function prepareReadyScreen() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const word = getRandomWord();
    
    // Сохраняем текущее слово
    gameState.currentWord = word;
    
    // Обновляем отображение
    document.getElementById('currentPlayerName').textContent = player.name;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
    
    // Показываем плейсхолдеры
    document.getElementById('wordPlaceholder').textContent = '???';
    document.getElementById('categoryPlaceholder').textContent = 'Категория';
    
    // Активируем кнопку
    const btn = document.getElementById('showWordBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-eye"></i> Показать слово';
}

function showWord() {
    if (!gameState.currentWord) return;
    
    const btn = document.getElementById('showWordBtn');
    const wordElement = document.getElementById('wordPlaceholder');
    const categoryElement = document.getElementById('categoryPlaceholder');
    
    // Показываем счетчик
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 3';
    
    let count = 3;
    const countdown = setInterval(() => {
        count--;
        if (count > 0) {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${count}`;
        } else {
            clearInterval(countdown);
            
            // Показываем слово
            wordElement.textContent = gameState.currentWord.word;
            categoryElement.textContent = gameState.currentWord.category;
            
            // Меняем кнопку
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Перейти к игре';
            btn.onclick = function() {
                showScreen('gameScreen');
            };
        }
    }, 1000);
}

function skipPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
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
    if (gameState.timeLeft > 0) {
        startTimer();
    }
}

function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            skipWord();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getRandomWord() {
    const availableCategories = gameState.categories.filter(cat => 
        gameState.categoriesData[cat] && gameState.categoriesData[cat].length > 0
    );
    
    if (availableCategories.length === 0) {
        return { word: "Нет слов", category: "Ошибка" };
    }
    
    const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const words = gameState.categoriesData[category];
    
    let word;
    let attempts = 0;
    
    do {
        word = words[Math.floor(Math.random() * words.length)];
        attempts++;
    } while (gameState.usedWords.has(word) && attempts < 50);
    
    gameState.usedWords.add(word);
    return { word, category };
}

// ===== ИГРОВЫЕ ДЕЙСТВИЯ =====
function correctGuess() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    player.score += 10;
    player.guessed++;
    gameState.scores[player.id] += 10;
    
    showNotification('Правильно! +10 очков');
    nextTurn();
}

function skipWord() {
    // Просто меняем слово без штрафа
    gameState.currentWord = getRandomWord();
    document.getElementById('currentWord').textContent = gameState.currentWord.word;
    document.getElementById('wordCategory').textContent = gameState.currentWord.category;
    
    // Сбрасываем таймер
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timeLeft = parseInt(document.getElementById('timerSeconds').value);
        startTimer();
    }
    
    showNotification('Слово изменено');
}

function giveUp() {
    showModal('giveUpModal');
}

function confirmGiveUp() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    player.score -= 10;
    gameState.scores[player.id] -= 10;
    
    closeModal('giveUpModal');
    showNotification('Сдался! -10 очков', 'warning');
    nextTurn();
}

function nextTurn() {
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
    
    // Подготовка следующего хода
    gameState.currentWord = getRandomWord();
    showScreen('readyScreen');
}

function updateScoreboard() {
    const container = document.getElementById('scoreboard');
    if (!container) return;
    
    container.innerHTML = '';
    
    const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;
    
    gameState.players.forEach((player, index) => {
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
    
    // Определение победителя
    const winner = gameState.players.reduce((prev, current) => 
        prev.score > current.score ? prev : current
    );
    
    document.getElementById('winnerName').textContent = winner.name;
    showResults();
    
    showScreen('resultsScreen');
}

function showResults() {
    const container = document.getElementById('resultsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Сортируем по очкам
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sorted.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        div.innerHTML = `
            <div class="result-rank">${index + 1}</div>
            <div class="result-info">
                <div class="result-name">${player.name}</div>
                <div class="result-stats">
                    <span>Угадано: ${player.guessed}</span>
                    <span>Слов сдано: ${gameState.totalRounds - player.guessed}</span>
                </div>
            </div>
            <div class="result-score">${player.score}</div>
        `;
        
        container.appendChild(div);
    });
}

// ===== УПРАВЛЕНИЕ ИГРОЙ =====
function pauseGame() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    showModal('pauseModal');
}

function resumeGame() {
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
    gameState.timeLeft = 120;
    
    // Сброс счета игроков
    if (gameState.players) {
        gameState.players.forEach(player => {
            player.score = 0;
            player.guessed = 0;
        });
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showNotification(text, type = 'success') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    
    if (type === 'success') {
        notification.style.background = 'var(--success)';
    } else if (type === 'warning') {
        notification.style.background = 'var(--warning)';
    } else if (type === 'error') {
        notification.style.background = 'var(--danger)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success);
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius);
        font-weight: 600;
        z-index: 1001;
        box-shadow: var(--shadow-lg);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function goBack() {
    if (gameState.gameActive) {
        pauseGame();
    } else {
        window.history.back();
    }
}

function goHome() {
    window.location.href = '../../index.html';
}

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
