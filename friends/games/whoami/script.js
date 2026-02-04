// ===== КОНСТАНТЫ И ПЕРЕМЕННЫЕ =====
const STORAGE_KEYS = {
    STATS: 'whoami_stats_v3',
    PLAYERS: 'whoami_players_v3'
};

let gameState = {
    // Настройки игры
    mode: 'classic',
    players: [],
    categories: [],
    rounds: 5,
    timerEnabled: true,
    timerMinutes: 2,
    
    // Игровое состояние
    currentRound: 1,
    currentPlayerIndex: 0,
    currentWord: null,
    usedWords: new Set(),
    scores: {},
    timeLeft: 120,
    timerInterval: null,
    gameActive: false,
    
    // Данные
    categoriesData: {},
    stats: {
        totalGames: 0,
        totalWords: 0,
        totalTime: 0,
        highScore: 0
    }
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
async function init() {
    // Фикс высоты для мобильных
    fixViewportHeight();
    
    // Загрузка данных
    await loadCategories();
    loadStats();
    loadPlayers();
    
    // Инициализация интерфейса
    initPlayersList();
    initCategoriesList();
    
    // Показ главного экрана
    showScreen('homeScreen');
    
    // События
    window.addEventListener('resize', fixViewportHeight);
    window.addEventListener('orientationchange', fixViewportHeight);
    
    // Отладка
    console.log('Игра "Кто я?" загружена');
}

// Фикс высоты viewport
function fixViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Загрузка категорий
async function loadCategories() {
    try {
        const response = await fetch('categories.json');
        const data = await response.json();
        gameState.categoriesData = data.categories;
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        // Стандартные категории
        gameState.categoriesData = {
            'Персонажи': ['Гарри Поттер', 'Шерлок Холмс', 'Дарт Вейдер', 'Индиана Джонс'],
            'Фильмы': ['Криминальное чтиво', 'Назад в будущее', 'Крестный отец'],
            'Знаменитости': ['Леонардо ДиКаприо', 'Бейонсе', 'Илон Маск'],
            'Предметы': ['Холодильник', 'Смартфон', 'Книга', 'Зонтик']
        };
    }
}

// Загрузка статистики
function loadStats() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STATS);
        if (saved) {
            gameState.stats = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Ошибка загрузки статистики:', e);
    }
    updateStatsDisplay();
}

// Сохранение статистики
function saveStats() {
    try {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(gameState.stats));
    } catch (e) {
        console.error('Ошибка сохранения статистики:', e);
    }
}

// Загрузка игроков
function loadPlayers() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
        if (saved) {
            gameState.players = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Ошибка загрузки игроков:', e);
    }
    
    if (gameState.players.length === 0) {
        gameState.players = [
            { id: 1, name: 'Игрок 1', score: 0, guessed: 0 },
            { id: 2, name: 'Игрок 2', score: 0, guessed: 0 },
            { id: 3, name: 'Игрок 3', score: 0, guessed: 0 }
        ];
    }
}

// Сохранение игроков
function savePlayers() {
    try {
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(gameState.players));
    } catch (e) {
        console.error('Ошибка сохранения игроков:', e);
    }
}

// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====
function showScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем нужный экран
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        
        // Прокрутка наверх
        screen.scrollTop = 0;
        
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
function selectMode(mode) {
    gameState.mode = mode;
    showScreen('setupScreen');
}

function quickStart() {
    // Быстрый старт с настройками по умолчанию
    gameState.mode = 'classic';
    gameState.rounds = 5;
    gameState.timerEnabled = true;
    gameState.timerMinutes = 2;
    
    // Выбираем все категории
    gameState.categories = Object.keys(gameState.categoriesData);
    
    // Начинаем игру
    startGame();
}

// ===== ЭКРАН НАСТРОЕК =====
function initSetupScreen() {
    initPlayersList();
    initCategoriesList();
}

function initPlayersList() {
    const container = document.getElementById('playersContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.innerHTML = `
            <input type="text" 
                   value="${player.name}" 
                   placeholder="Имя игрока"
                   onchange="updatePlayerName(${index}, this.value)">
            <button class="remove-player" onclick="removePlayer(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function initCategoriesList() {
    const container = document.getElementById('categoriesContainer');
    if (!container || !gameState.categoriesData) return;
    
    container.innerHTML = '';
    
    Object.keys(gameState.categoriesData).forEach(category => {
        const wordsCount = gameState.categoriesData[category].length;
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <input type="checkbox" id="cat_${category}" value="${category}" checked>
            <label class="category-label" for="cat_${category}">
                ${category} (${wordsCount})
            </label>
        `;
        container.appendChild(div);
    });
}

function addPlayer() {
    if (gameState.players.length >= 12) {
        showNotification('Максимум 12 игроков');
        return;
    }
    
    const newId = gameState.players.length + 1;
    gameState.players.push({
        id: newId,
        name: `Игрок ${newId}`,
        score: 0,
        guessed: 0
    });
    
    initPlayersList();
    savePlayers();
}

function removePlayer(index) {
    if (gameState.players.length <= 3) {
        showNotification('Минимум 3 игрока');
        return;
    }
    
    gameState.players.splice(index, 1);
    initPlayersList();
    savePlayers();
}

function updatePlayerName(index, newName) {
    if (newName.trim()) {
        gameState.players[index].name = newName.trim();
        savePlayers();
    }
}

// ===== НАЧАЛО ИГРЫ =====
function startGame() {
    // Собираем настройки
    gameState.rounds = parseInt(document.getElementById('roundsSelect').value);
    gameState.timerEnabled = document.getElementById('timerToggle').checked;
    gameState.timeLeft = gameState.timerEnabled ? gameState.timerMinutes * 60 : 0;
    
    // Собираем выбранные категории
    const selectedCategories = Array.from(
        document.querySelectorAll('.category-item input:checked')
    ).map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        showNotification('Выберите хотя бы одну категорию!');
        return;
    }
    
    gameState.categories = selectedCategories;
    
    // Сброс игрового состояния
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
    document.getElementById('readyWord').textContent = '???';
    document.getElementById('readyCategory').textContent = word.category;
}

function showWord() {
    if (!gameState.currentWord) return;
    
    // Показываем слово
    document.getElementById('readyWord').textContent = gameState.currentWord.word;
    
    // Через 2 секунды переходим к игре
    setTimeout(() => {
        showScreen('gameScreen');
    }, 2000);
}

function skipPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    prepareReadyScreen();
}

// ===== ИГРОВОЙ ЭКРАН =====
function startGameRound() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Обновляем отображение
    document.getElementById('currentPlayer').textContent = player.name;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('totalRounds').textContent = gameState.rounds;
    
    if (gameState.currentWord) {
        document.getElementById('currentWord').textContent = gameState.currentWord.word;
        document.getElementById('wordCategory').textContent = gameState.currentWord.category;
    }
    
    // Обновляем счет
    updateScoresDisplay();
    
    // Запускаем таймер
    if (gameState.timerEnabled && !gameState.timerInterval) {
        startTimer();
    }
}

// Таймер
function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    gameState.timeLeft = gameState.timerMinutes * 60;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function timeUp() {
    showNotification('Время вышло!');
    skipWord();
}

// Получение случайного слова
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
    const player = gameState.players[gameState.currentPlayerIndex];
    
    player.score -= 2;
    gameState.scores[player.id] -= 2;
    
    showNotification('Пропущено! -2 очка');
    nextTurn();
}

function giveUp() {
    if (confirm('Сдаетесь?')) {
        showNotification('Сдался...');
        nextTurn();
    }
}

function nextTurn() {
    // Следующий игрок
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    // Если все игроки сходили - следующий раунд
    if (gameState.currentPlayerIndex === 0) {
        gameState.currentRound++;
        
        if (gameState.currentRound > gameState.rounds) {
            endGame();
            return;
        }
    }
    
    // Подготовка следующего хода
    gameState.currentWord = getRandomWord();
    showScreen('readyScreen');
}

// Обновление отображения счета
function updateScoresDisplay() {
    const container = document.getElementById('scoresContainer');
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
function endGame
