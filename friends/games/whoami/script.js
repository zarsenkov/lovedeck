// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let game = {
    players: [],
    categories: [],
    currentRound: 1,
    totalRounds: 5,
    currentPlayerIndex: 0,
    currentWord: null,
    usedWords: new Set(),
    scores: {},
    timeLeft: 120,
    timer: null,
    gameActive: false,
    categoriesData: {},
    confirmCallback: null
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    initGame();
    
    // Показ главного экрана
    showScreen('screen1');
    
    // Загрузка категорий
    loadCategories();
});

function initGame() {
    // Сброс состояния
    game = {
        players: [],
        categories: [],
        currentRound: 1,
        totalRounds: 5,
        currentPlayerIndex: 0,
        currentWord: null,
        usedWords: new Set(),
        scores: {},
        timeLeft: 120,
        timer: null,
        gameActive: false,
        categoriesData: {},
        confirmCallback: null
    };
}

async function loadCategories() {
    try {
        const response = await fetch('categories.json');
        const data = await response.json();
        game.categoriesData = data.categories;
        console.log('Категории загружены');
    } catch (error) {
        console.log('Использую стандартные категории');
        game.categoriesData = {
            '🎭 Персонажи': ['Гарри Поттер', 'Шерлок Холмс', 'Дарт Вейдер'],
            '🎬 Фильмы': ['Криминальное чтиво', 'Назад в будущее'],
            '🌟 Знаменитости': ['Леонардо ДиКаприо', 'Бейонсе', 'Илон Маск']
        };
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
            case 'screen1': // Главное меню
                initGame();
                break;
            case 'screen2': // Настройки
                setupScreen();
                break;
            case 'screen3': // Подготовка
                prepareScreen();
                break;
            case 'screen4': // Игра
                startGameScreen();
                break;
            case 'screen5': // Результаты
                showResults();
                break;
        }
    }
}

// ===== ЭКРАН 1: ГЛАВНОЕ МЕНЮ =====
function changePlayers(change) {
    const countElement = document.getElementById('playersCount');
    let count = parseInt(countElement.textContent) + change;
    
    // Ограничения
    count = Math.max(2, Math.min(8, count));
    countElement.textContent = count;
}

function goToSetup() {
    const playerCount = parseInt(document.getElementById('playersCount').textContent);
    
    // Создаем игроков
    game.players = [];
    for (let i = 0; i < playerCount; i++) {
        game.players.push({
            id: i + 1,
            name: `Игрок ${i + 1}`,
            score: 0,
            guessed: 0
        });
    }
    
    showScreen('screen2');
}

// ===== ЭКРАН 2: НАСТРОЙКИ =====
function setupScreen() {
    // Заполняем имена игроков
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';
    
    game.players.forEach((player, index) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = player.name;
        input.placeholder = `Имя игрока ${index + 1}`;
        input.onchange = function() {
            updatePlayerName(index, this.value);
        };
        namesList.appendChild(input);
    });
    
    // Заполняем категории
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = '';
    
    if (Object.keys(game.categoriesData).length > 0) {
        Object.keys(game.categoriesData).forEach(category => {
            const wordsCount = game.categoriesData[category].length;
            
            const div = document.createElement('div');
            div.className = 'category-option';
            
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
            categoriesGrid.appendChild(div);
        });
    }
}

function updatePlayerName(index, newName) {
    if (newName.trim()) {
        game.players[index].name = newName.trim();
    }
}

function setTime(seconds) {
    game.timeLeft = seconds;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.time-opt').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function changeRounds(change) {
    const input = document.getElementById('roundsInput');
    let value = parseInt(input.value) + change;
    value = Math.max(1, Math.min(20, value));
    input.value = value;
    game.totalRounds = value;
}

function startGame() {
    // Получаем настройки
    game.totalRounds = parseInt(document.getElementById('roundsInput').value);
    
    // Получаем выбранные категории
    const selectedCategories = Array.from(
        document.querySelectorAll('.category-option input:checked')
    ).map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        alert('Выберите хотя бы одну категорию!');
        return;
    }
    
    game.categories = selectedCategories;
    
    // Проверяем имена
    game.players.forEach((player, index) => {
        const input = document.querySelector(`#namesList input:nth-child(${index + 1})`);
        if (input && input.value.trim()) {
            player.name = input.value.trim();
        }
    });
    
    // Сброс состояния
    game.currentRound = 1;
    game.currentPlayerIndex = 0;
    game.usedWords.clear();
    game.scores = {};
    game.gameActive = true;
    
    // Инициализация счета
    game.players.forEach(player => {
        player.score = 0;
        player.guessed = 0;
        game.scores[player.id] = 0;
    });
    
    // Переходим к экрану подготовки
    showScreen('screen3');
}

// ===== ЭКРАН 3: ПОДГОТОВКА =====
function prepareScreen() {
    const player = game.players[game.currentPlayerIndex];
    const word = getRandomWord();
    
    // Сохраняем слово
    game.currentWord = word;
    
    // Обновляем интерфейс
    document.getElementById('currentRound').textContent = game.currentRound;
    document.getElementById('totalRounds').textContent = game.totalRounds;
    document.getElementById('currentPlayerName').textContent = player.name;
    
    // Скрываем слово
    document.getElementById('wordPlaceholder').textContent = '???';
    document.getElementById('categoryPlaceholder').textContent = 'Категория';
    
    // Восстанавливаем кнопку
    const btn = document.getElementById('revealBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-eye"></i> Показать слово';
    btn.onclick = revealWord;
}

function revealWord() {
    if (!game.currentWord) return;
    
    const btn = document.getElementById('revealBtn');
    const wordElement = document.getElementById('wordPlaceholder');
    const categoryElement = document.getElementById('categoryPlaceholder');
    
    // Блокируем кнопку и показываем обратный отсчет
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
            wordElement.textContent = game.currentWord.word;
            categoryElement.textContent = game.currentWord.category;
            
            // Меняем кнопку
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Перейти к игре';
            btn.onclick = function() {
                showScreen('screen4');
            };
        }
    }, 1000);
}

function skipCurrentPlayer() {
    if (confirm(`Пропустить ${game.players[game.currentPlayerIndex].name}?`)) {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        prepareScreen();
    }
}

function getRandomWord() {
    const availableCategories = game.categories.filter(cat => 
        game.categoriesData[cat] && game.categoriesData[cat].length > 0
    );
    
    if (availableCategories.length === 0) {
        return { word: "Нет слов", category: "Ошибка" };
    }
    
    const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const words = game.categoriesData[category];
    
    let word;
    let attempts = 0;
    
    do {
        word = words[Math.floor(Math.random() * words.length)];
        attempts++;
    } while (game.usedWords.has(word) && attempts < 50);
    
    game.usedWords.add(word);
    return { word, category };
}

// ===== ЭКРАН 4: ИГРА =====
function startGameScreen() {
    const player = game.players[game.currentPlayerIndex];
    
    // Обновляем интерфейс
    document.getElementById('activePlayer').textContent = player.name;
    document.getElementById('gameRound').textContent = game.currentRound;
    document.getElementById('gameTotalRounds').textContent = game.totalRounds;
    
    if (game.currentWord) {
        document.getElementById('gameWord').textContent = game.currentWord.word;
        document.getElementById('gameCategory').textContent = game.currentWord.category;
    }
    
    // Обновляем счет
    updateScores();
    
    // Запускаем таймер
    startGameTimer();
}

function startGameTimer() {
    if (game.timer) {
        clearInterval(game.timer);
    }
    
    updateTimerDisplay();
    
    game.timer = setInterval(() => {
        if (game.timeLeft > 0) {
            game.timeLeft--;
            updateTimerDisplay();
            
            if (game.timeLeft <= 0) {
                clearInterval(game.timer);
                skipWord();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(game.timeLeft / 60);
    const seconds = game.timeLeft % 60;
    document.getElementById('gameTimer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateScores() {
    const scoresList = document.getElementById('scoresList');
    if (!scoresList) return;
    
    scoresList.innerHTML = '';
    
    const currentPlayerId = game.players[game.currentPlayerIndex].id;
    
    game.players.forEach(player => {
        const div = document.createElement('div');
        div.className = `score-item ${player.id === currentPlayerId ? 'current' : ''}`;
        
        div.innerHTML = `
            <div class="player-name">
                <i class="fas fa-user"></i>
                <span>${player.name}</span>
            </div>
            <div class="player-score">${player.score}</div>
        `;
        
        scoresList.appendChild(div);
    });
}

function markCorrect() {
    const player = game.players[game.currentPlayerIndex];
    
    player.score += 10;
    player.guessed++;
    game.scores[player.id] += 10;
    
    nextTurn();
}

function skipWord() {
    // Меняем слово
    game.currentWord = getRandomWord();
    document.getElementById('gameWord').textContent = game.currentWord.word;
    document.getElementById('gameCategory').textContent = game.currentWord.category;
    
    // Сбрасываем таймер
    if (game.timer) {
        clearInterval(game.timer);
    }
    
    // Восстанавливаем время из активной кнопки
    const activeTimeBtn = document.querySelector('.time-opt.active');
    if (activeTimeBtn) {
        const timeText = activeTimeBtn.textContent;
        const minutes = parseInt(timeText);
        game.timeLeft = minutes * 60;
    } else {
        game.timeLeft = 120; // По умолчанию 2 минуты
    }
    
    startGameTimer();
}

function giveUpWord() {
    showConfirm(`${game.players[game.currentPlayerIndex].name} сдаётся? (-10 очков)`, function() {
        const player = game.players[game.currentPlayerIndex];
        player.score -= 10;
        game.scores[player.id] -= 10;
        nextTurn();
    });
}

function nextTurn() {
    // Следующий игрок
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    
    // Если все сходили - следующий раунд
    if (game.currentPlayerIndex === 0) {
        game.currentRound++;
        
        if (game.currentRound > game.totalRounds) {
            endGame();
            return;
        }
    }
    
    // Новое слово и подготовка
    game.currentWord = getRandomWord();
    showScreen('screen3');
}

function pauseGame() {
    if (game.timer) {
        clearInterval(game.timer);
    }
    showModal('pauseModal');
}

function resumeGame() {
    closeModal('pauseModal');
    if (game.timeLeft > 0) {
        startGameTimer();
    }
}

function endGame() {
    if (game.timer) {
        clearInterval(game.timer);
        game.timer = null;
    }
    
    game.gameActive = false;
    showScreen('screen5');
}

// ===== ЭКРАН 5: РЕЗУЛЬТАТЫ =====
function showResults() {
    // Определяем победителя
    const winner = game.players.reduce((prev, current) => 
        prev.score > current.score ? prev : current
    );
    
    document.getElementById('winnerName').textContent = winner.name;
    
    // Заполняем таблицу результатов
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    
    // Сортируем по очкам
    const sorted = [...game.players].sort((a, b) => b.score - a.score);
    
    sorted.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        div.innerHTML = `
            <div class="result-rank">${index + 1}</div>
            <div class="result-info">
                <div class="result-name">${player.name}</div>
                <div class="result-stats">
                    <span>Угадано: ${player.guessed}</span>
                    <span>Сдано: ${game.totalRounds - player.guessed}</span>
                </div>
            </div>
            <div class="result-score">${player.score}</div>
        `;
        
        resultsList.appendChild(div);
    });
}

function newGame() {
    initGame();
    showScreen('screen1');
}

function goToMainMenu() {
    initGame();
    showScreen('screen1');
    closeModal('pauseModal');
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showConfirm(message, callback) {
    document.getElementById('confirmText').textContent = message;
    game.confirmCallback = callback;
    showModal('confirmModal');
}

function confirmAction() {
    if (game.confirmCallback) {
        game.confirmCallback();
    }
    closeModal('confirmModal');
}

function showRules() {
    showModal('rulesModal');
}

// ===== НАВИГАЦИЯ =====
function goBack() {
    if (game.gameActive) {
        pauseGame();
    } else {
        const activeScreen = document.querySelector('.screen.active').id;
        switch(activeScreen) {
            case 'screen2':
                showScreen('screen1');
                break;
            case 'screen3':
            case 'screen4':
                showScreen('screen2');
                break;
            case 'screen5':
                showScreen('screen1');
                break;
            default:
                window.location.href = '../../index.html';
        }
    }
}

// Экспорт функций
window.changePlayers = changePlayers;
window.goToSetup = goToSetup;
window.setTime = setTime;
window.changeRounds = changeRounds;
window.startGame = startGame;
window.revealWord = revealWord;
window.skipCurrentPlayer = skipCurrentPlayer;
window.markCorrect = markCorrect;
window.skipWord = skipWord;
window.giveUpWord = giveUpWord;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.endGame = endGame;
window.newGame = newGame;
window.goToMainMenu = goToMainMenu;
window.showScreen = showScreen;
window.goBack = goBack;
window.showRules = showRules;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
