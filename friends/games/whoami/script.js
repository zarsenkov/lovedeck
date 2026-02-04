// ===== КОНСТАНТЫ И ПЕРЕМЕННЫЕ =====
const CATEGORIES_FILE = 'categories.json';
const STORAGE_KEYS = {
    STATS: 'whoami_stats',
    SETTINGS: 'whoami_settings'
};

let gameState = {
    mode: null,
    players: [],
    categories: [],
    currentRound: 1,
    totalRounds: 5,
    currentPlayerIndex: 0,
    usedWords: new Set(),
    timer: null,
    timeLeft: 120,
    gameStarted: false,
    scores: {},
    guessedWords: {},
    settings: {},
    statistics: {}
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    // Загрузка данных
    await loadCategories();
    loadSettings();
    loadStatistics();
    
    // Инициализация элементов управления
    initEventListeners();
    initCategories();
    
    // Показ экрана выбора режима
    showScreen('modeScreen');
});

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadCategories() {
    try {
        const response = await fetch(CATEGORIES_FILE);
        const data = await response.json();
        gameState.categoriesData = data.categories;
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        // Базовые категории по умолчанию
        gameState.categoriesData = {
            'Персонажи': ['Гарри Поттер', 'Шерлок Холмс', 'Дарт Вейдер', 'Индиана Джонс'],
            'Фильмы': ['Криминальное чтиво', 'Назад в будущее', 'Крестный отец', 'Титаник'],
            'Знаменитости': ['Леонардо ДиКаприо', 'Бейонсе', 'Илон Маск', 'Джо Байден'],
            'Предметы': ['Кофеварка', 'Смартфон', 'Книга', 'Зонтик']
        };
    }
}

function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
        gameState.settings = JSON.parse(saved);
    } else {
        gameState.settings = {
            sound: true,
            animations: true,
            vibration: false,
            timer: true,
            timerMinutes: 2
        };
    }
    
    // Применяем настройки
    document.getElementById('soundEnabled').checked = gameState.settings.sound;
    document.getElementById('animationsEnabled').checked = gameState.settings.animations;
    document.getElementById('vibrationEnabled').checked = gameState.settings.vibration;
}

function loadStatistics() {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    if (saved) {
        gameState.statistics = JSON.parse(saved);
    } else {
        gameState.statistics = {
            totalGames: 0,
            totalWins: {},
            totalGuessed: 0,
            averageTime: 0,
            categoryStats: {},
            lastPlayed: null
        };
    }
    
    updateStatsDisplay();
}

// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====
function showScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Показываем нужный экран
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
        
        // Дополнительные действия при показе экранов
        switch(screenId) {
            case 'modeScreen':
                resetGameState();
                break;
            case 'setupScreen':
                initSetupScreen();
                break;
            case 'gameScreen':
                startGameRound();
                break;
        }
    }
}

function goBack() {
    if (gameState.gameStarted) {
        showModal('pauseModal');
    } else {
        window.location.href = '../../index.html';
    }
}

function goBackFromStats() {
    showScreen('modeScreen');
}

// ===== НАСТРОЙКА ИГРЫ =====
function selectMode(mode) {
    gameState.mode = mode;
    showScreen('setupScreen');
}

function initSetupScreen() {
    // Инициализация количества игроков
    const playerCountInput = document.getElementById('playerCount');
    const playerNamesContainer = document.getElementById('playerNames');
    
    playerCountInput.addEventListener('input', updatePlayerNames);
    updatePlayerNames();
    
    // Инициализация категорий
    initCategories();
    
    // Инициализация таймера
    const timerToggle = document.getElementById('timerEnabled');
    timerToggle.addEventListener('change', toggleTimerSettings);
    toggleTimerSettings();
}

function adjustPlayerCount(change) {
    const input = document.getElementById('playerCount');
    let value = parseInt(input.value) + change;
    value = Math.max(3, Math.min(12, value));
    input.value = value;
    updatePlayerNames();
}

function updatePlayerNames() {
    const count = parseInt(document.getElementById('playerCount').value);
    const container = document.getElementById('playerNames');
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем поля для имен
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'player-input';
        input.placeholder = `Игрок ${i + 1}`;
        input.value = `Игрок ${i + 1}`;
        container.appendChild(input);
    }
}

function initCategories() {
    const container = document.getElementById('categoriesList');
    if (!container || !gameState.categoriesData) return;
    
    container.innerHTML = '';
    
    for (const [category, words] of Object.entries(gameState.categoriesData)) {
        const div = document.createElement('div');
        div.className = 'category-checkbox';
        
        const id = `cat_${category.replace(/\s+/g, '_')}`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.value = category;
        checkbox.checked = true;
        
        const label = document.createElement('label');
        label.className = 'category-label';
        label.htmlFor = id;
        label.textContent = `${category} (${words.length})`;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    }
}

function toggleTimerSettings() {
    const enabled = document.getElementById('timerEnabled').checked;
    const settings = document.getElementById('timerSettings');
    const input = document.getElementById('timerMinutes');
    
    if (enabled) {
        input.style.display = 'inline-block';
        settings.querySelector('span').textContent = 'минут на раунд';
    } else {
        input.style.display = 'none';
        settings.querySelector('span').textContent = 'Без таймера';
    }
}

// ===== НАЧАЛО ИГРЫ =====
function startGame() {
    // Собираем настройки
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const playerInputs = document.querySelectorAll('.player-input');
    
    gameState.players = Array.from(playerInputs).map(input => ({
        name: input.value.trim() || `Игрок ${Array.from(playerInputs).indexOf(input) + 1}`,
        score: 0,
        guessed: 0,
        time: 0
    }));
    
    // Собираем выбранные категории
    gameState.categories = Array.from(document.querySelectorAll('.category-checkbox input:checked'))
        .map(checkbox => checkbox.value);
    
    if (gameState.categories.length === 0) {
        alert('Выберите хотя бы одну категорию!');
        return;
    }
    
    // Настройки таймера
    gameState.timerEnabled = document.getElementById('timerEnabled').checked;
    if (gameState.timerEnabled) {
        gameState.timeLeft = parseInt(document.getElementById('timerMinutes').value) * 60;
    }
    
    gameState.totalRounds = parseInt(document.getElementById('roundsCount').value);
    gameState.currentRound = 1;
    gameState.currentPlayerIndex = 0;
    gameState.usedWords.clear();
    gameState.gameStarted = true;
    gameState.scores = {};
    gameState.guessedWords = {};
    
    // Инициализация статистики для игроков
    gameState.players.forEach(player => {
        gameState.scores[player.name] = 0;
        gameState.guessedWords[player.name] = 0;
    });
    
    // Показываем игровой экран
    showScreen('gameScreen');
    updateGameDisplay();
}

function startGameRound() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const word = getRandomWord();
    
    // Обновляем отображение
    document.getElementById('currentPlayerName').textContent = player.name;
    document.getElementById('currentWord').textContent = word.word;
    document.getElementById('wordHint').textContent = word.category;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
    
    // Обновляем счет
    updateScoresDisplay();
    
    // Запускаем таймер, если включен
    if (gameState.timerEnabled && !gameState.timer) {
        startTimer();
    }
}

function getRandomWord() {
    const availableCategories = gameState.categories.filter(cat => 
        gameState.categoriesData[cat] && gameState.categoriesData[cat].length > 0
    );
    
    if (availableCategories.length === 0) {
        return { word: "Нет доступных слов", category: "Ошибка" };
    }
    
    const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const words = gameState.categoriesData[randomCategory];
    
    let word;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        word = words[Math.floor(Math.random() * words.length)];
        attempts++;
    } while (gameState.usedWords.has(word) && attempts < maxAttempts);
    
    gameState.usedWords.add(word);
    return { word, category: randomCategory };
}

// ===== ТАЙМЕР =====
function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timeUp() {
    // Время вышло
    if (gameState.animationsEnabled) {
        document.getElementById('playerCard').classList.add('shake');
        setTimeout(() => {
            document.getElementById('playerCard').classList.remove('shake');
        }, 500);
    }
    
    nextTurn();
}

// ===== ИГРОВЫЕ ДЕЙСТВИЯ =====
function guessWord(correct) {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (correct) {
        // Правильно угадал
        player.score += 10;
        player.guessed++;
        gameState.scores[player.name] += 10;
        gameState.guessedWords[player.name]++;
        
        if (gameState.animationsEnabled) {
            showConfetti();
        }
        
        // Анимация успеха
        const card = document.getElementById('playerCard');
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.4)';
        
        setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
            nextTurn();
        }, 500);
    } else {
        nextTurn();
    }
}

function skipWord() {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.score -= 2; // Штраф за пропуск
    gameState.scores[player.name] -= 2;
    
    if (gameState.animationsEnabled) {
        const card = document.getElementById('playerCard');
        card.classList.add('shake');
        setTimeout(() => {
            card.classList.remove('shake');
            nextTurn();
        }, 500);
    } else {
        nextTurn();
    }
}

function giveUp() {
    if (confirm('Вы уверены, что хотите сдаться?')) {
        nextPlayer();
        startGameRound();
    }
}

function nextTurn() {
    // Проверяем, завершен ли раунд
    if (gameState.currentPlayerIndex === gameState.players.length - 1) {
        // Все игроки сходили в этом раунде
        gameState.currentRound++;
        
        if (gameState.currentRound > gameState.totalRounds) {
            endGame();
            return;
        }
    }
    
    nextPlayer();
    startGameRound();
}

function nextPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    // Сброс таймера для следующего игрока
    if (gameState.timerEnabled) {
        if (gameState.timer) clearInterval(gameState.timer);
        gameState.timeLeft = parseInt(document.getElementById('timerMinutes').value) * 60;
        startTimer();
    }
}

// ===== ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ =====
function updateGameDisplay() {
    updateScoresDisplay();
    updateTimerDisplay();
}

function updateScoresDisplay() {
    const container = document.getElementById('scoresList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Сортируем игроков по очкам
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'score-item';
        
        const playerDiv = document.createElement('div');
        playerDiv.className = 'score-player';
        
        const icon = document.createElement('i');
        icon.className = index === 0 ? 'fas fa-crown' : 'fas fa-user';
        icon.style.color = index === 0 ? '#f59e0b' : '#6366f1';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = player.name;
        nameSpan.style.fontWeight = player.name === gameState.players[gameState.currentPlayerIndex].name ? '700' : '400';
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'score-value';
        scoreSpan.textContent = player.score;
        
        playerDiv.appendChild(icon);
        playerDiv.appendChild(nameSpan);
        
        div.appendChild(playerDiv);
        div.appendChild(scoreSpan);
        container.appendChild(div);
    });
}

// ===== ЗАВЕРШЕНИЕ ИГРЫ =====
function endGame() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Обновляем статистику
    updateStatistics();
    
    // Определяем победителя
    const winner = gameState.players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
    );
    
    // Показываем результаты
    document.getElementById('winnerText').innerHTML = `Победитель: <span class="winner-name">${winner.name}</span>`;
    showFinalResults();
    
    gameState.gameStarted = false;
    showScreen('resultsScreen');
}

function showFinalResults() {
    const tbody = document.querySelector('#finalResults tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Сортируем игроков по очкам
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <i class="fas fa-${index === 0 ? 'crown' : 'user'}"></i>
                ${player.name}
            </td>
            <td><strong>${player.score}</strong></td>
            <td>${player.guessed}</td>
            <td>${Math.floor(player.time / 60)}:${(player.time % 60).toString().padStart(2, '0')}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// ===== СТАТИСТИКА =====
function updateStatistics() {
    // Обновляем общую статистику
    gameState.statistics.totalGames++;
    
    // Обновляем статистику побед
    const winner = gameState.players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
    );
    
    if (!gameState.statistics.totalWins[winner.name]) {
        gameState.statistics.totalWins[winner.name] = 0;
    }
    gameState.statistics.totalWins[winner.name]++;
    
    // Обновляем количество угаданных слов
    const totalGuessed = gameState.players.reduce((sum, player) => sum + player.guessed, 0);
    gameState.statistics.totalGuessed += totalGuessed;
    
    // Сохраняем статистику
    saveStatistics();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('totalGames').textContent = gameState.statistics.totalGames;
    
    const totalWins = Object.values(gameState.statistics.totalWins).reduce((a, b) => a + b, 0);
    document.getElementById('totalWins').textContent = totalWins;
    
    document.getElementById('totalGuessed').textContent = gameState.statistics.totalGuessed;
    
    if (gameState.statistics.averageTime > 0) {
        document.getElementById('avgTime').textContent = 
            `${Math.floor(gameState.statistics.averageTime)} сек`;
    }
    
    // Обновляем график
    updateChart();
}

function updateChart() {
    const canvas = document.getElementById('categoriesChart');
    if (!canvas || !gameState.categoriesData) return;
    
    const ctx = canvas.getContext('2d');
    const labels = Object.keys(gameState.categoriesData);
    
    // Для демонстрации - случайные данные
    const data = labels.map(() => Math.floor(Math.random() * 100));
    
    // Удаляем старый график
    if (window.statsChart) {
        window.statsChart.destroy();
    }
    
    window.statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Угадано слов',
                data: data,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function showStats() {
    updateStatsDisplay();
    showScreen('statsScreen');
}

function clearStats() {
    if (confirm('Вы уверены, что хотите очистить всю статистику?')) {
        gameState.statistics = {
            totalGames: 0,
            totalWins: {},
            totalGuessed: 0,
            averageTime: 0,
            categoryStats: {},
            lastPlayed: null
        };
        
        saveStatistics();
        updateStatsDisplay();
    }
}

// ===== УПРАВЛЕНИЕ ИГРОЙ =====
function pauseGame() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    showModal('pauseModal');
}

function resumeGame() {
    closeModal('pauseModal');
    if (gameState.timerEnabled) {
        startTimer();
    }
}

function restartGame() {
    resetGameState();
    showScreen('modeScreen');
}

function goHome() {
    window.location.href = '../../index.html';
}

function resetGameState() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState = {
        ...gameState,
        mode: null,
        players: [],
        currentRound: 1,
        currentPlayerIndex: 0,
        usedWords: new Set(),
        timer: null,
        timeLeft: 120,
        gameStarted: false,
        scores: {},
        guessedWords: {}
    };
}

// ===== НАСТРОЙКИ =====
function showSettings() {
    showModal('settingsModal');
}

function saveSettings() {
    gameState.settings = {
        sound: document.getElementById('soundEnabled').checked,
        animations: document.getElementById('animationsEnabled').checked,
        vibration: document.getElementById('vibrationEnabled').checked,
        timer: true,
        timerMinutes: 2
    };
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(gameState.settings));
    closeModal('settingsModal');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function initEventListeners() {
    // Кнопки в шапке
    document.getElementById('statsBtn').addEventListener('click', showStats);
    document.getElementById('settingsBtn').addEventListener('click', showSettings);
    
    // Кнопки игры
    document.querySelectorAll('[onclick*="guessWord"]').forEach(btn => {
        btn.onclick = function() {
            const correct = this.classList.contains('success');
            guessWord(correct);
        };
    });
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function saveStatistics() {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(gameState.statistics));
}

function showConfetti() {
    // Простая анимация конфетти
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '1000';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        // Анимация
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
window.goBack = goBack;
window.selectMode = selectMode;
window.adjustPlayerCount = adjustPlayerCount;
window.startGame = startGame;
window.guessWord = guessWord;
window.skipWord = skipWord;
window.giveUp = giveUp;
window.pauseGame = pauseGame;
window.endGame = endGame;
window.restartGame = restartGame;
window.showStats = showStats;
window.goBackFromStats = goBackFromStats;
window.clearStats = clearStats;
window.goHome = goHome;
window.showScreen = showScreen;
window.closeModal = closeModal;
window.saveSettings = saveSettings;
