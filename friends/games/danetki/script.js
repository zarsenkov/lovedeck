// Основные переменные игры
let currentGame = {
    players: 6,
    timeLimit: 10,
    hintsEnabled: true,
    difficulty: 'all',
    currentDanetka: 0,
    totalSolved: 0,
    startTime: null,
    timerInterval: null,
    questionsHistory: [],
    hintsUsed: 0,
    totalHints: 3
};

let filteredDanetki = [];
let currentDanetkaData = null;

// DOM элементы
const elements = {
    // Экраны
    setupScreen: document.getElementById('setup-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultScreen: document.getElementById('result-screen'),
    
    // Настройки
    playerCount: document.getElementById('player-count'),
    timeLimit: document.getElementById('time-limit'),
    hintsEnabled: document.getElementById('hints-enabled'),
    startGameBtn: document.getElementById('start-game'),
    
    // Игра
    currentGameSpan: document.getElementById('current-game'),
    timer: document.getElementById('timer'),
    questionsAsked: document.getElementById('questions-asked'),
    hintsAvailable: document.getElementById('hints-available'),
    categoryBadge: document.getElementById('category-badge'),
    cardNumber: document.getElementById('card-number'),
    danetkaText: document.getElementById('danetka-text'),
    hintText: document.getElementById('hint-text'),
    getHintBtn: document.getElementById('get-hint'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history'),
    showSolutionBtn: document.getElementById('show-solution'),
    nextDanetkaBtn: document.getElementById('next-danetka'),
    endGameBtn: document.getElementById('end-game'),
    
    // Результат
    resultTitle: document.getElementById('result-title'),
    solutionText: document.getElementById('solution-text'),
    statTime: document.getElementById('stat-time'),
    statQuestions: document.getElementById('stat-questions'),
    statHints: document.getElementById('stat-hints'),
    statDifficulty: document.getElementById('stat-difficulty'),
    playAgainBtn: document.getElementById('play-again'),
    backToMenuBtn: document.getElementById('back-to-menu'),
    
    // Модальные окна
    hintModal: document.getElementById('hint-modal'),
    timeoutModal: document.getElementById('timeout-modal'),
    modalHintText: document.getElementById('modal-hint-text'),
    showAnswerTimeoutBtn: document.getElementById('show-answer-timeout'),
    
    // Прогресс
    progressFill: document.getElementById('progress-fill')
};

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    filterDanetkiByDifficulty('all');
});

// Инициализация
function initializeGame() {
    // Загружаем сохраненные настройки
    const savedSettings = JSON.parse(localStorage.getItem('danetkiSettings'));
    if (savedSettings) {
        currentGame = { ...currentGame, ...savedSettings };
        elements.playerCount.value = currentGame.players;
        elements.timeLimit.value = currentGame.timeLimit;
        elements.hintsEnabled.checked = currentGame.hintsEnabled;
        
        const activeBtn = document.querySelector(`.difficulty-btn[data-level="${currentGame.difficulty}"]`);
        if (activeBtn) {
            document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }
    
    // Обновляем статистику
    updateStatsDisplay();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки сложности
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const level = btn.dataset.level;
            currentGame.difficulty = level;
            filterDanetkiByDifficulty(level);
            saveSettings();
        });
    });
    
    // Начало игры
    elements.startGameBtn.addEventListener('click', startGame);
    
    // Управление в игре
    elements.getHintBtn.addEventListener('click', showHint);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.showSolutionBtn.addEventListener('click', showSolution);
    elements.nextDanetkaBtn.addEventListener('click', nextDanetka);
    elements.endGameBtn.addEventListener('click', endGame);
    
    // Результат
    elements.playAgainBtn.addEventListener('click', playAgain);
    elements.backToMenuBtn.addEventListener('click', backToMenu);
    
    // Модальные окна
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
        });
    });
    
    elements.showAnswerTimeoutBtn.addEventListener('click', showSolution);
    
    // Клик вне модального окна
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Сохранение настроек при изменении
    elements.playerCount.addEventListener('change', saveSettings);
    elements.timeLimit.addEventListener('change', saveSettings);
    elements.hintsEnabled.addEventListener('change', saveSettings);
}

// Фильтрация данеток по сложности
function filterDanetkiByDifficulty(level) {
    if (level === 'all') {
        filteredDanetki = [...danetkiData];
    } else {
        filteredDanetki = danetkiData.filter(d => d.difficulty === level);
    }
    
    elements.currentGameSpan.textContent = `1/${filteredDanetki.length}`;
    updateProgressBar();
}

// Сохранение настроек
function saveSettings() {
    currentGame.players = parseInt(elements.playerCount.value);
    currentGame.timeLimit = parseInt(elements.timeLimit.value);
    currentGame.hintsEnabled = elements.hintsEnabled.checked;
    
    localStorage.setItem('danetkiSettings', JSON.stringify({
        players: currentGame.players,
        timeLimit: currentGame.timeLimit,
        hintsEnabled: currentGame.hintsEnabled,
        difficulty: currentGame.difficulty
    }));
}

// Изменение количества игроков
function changePlayerCount(delta) {
    let count = parseInt(elements.playerCount.value) + delta;
    count = Math.max(2, Math.min(15, count));
    elements.playerCount.value = count;
    saveSettings();
}

// Начало игры
function startGame() {
    if (filteredDanetki.length === 0) {
        alert('Нет данеток выбранной сложности!');
        return;
    }
    
    // Сброс состояния игры
    currentGame.currentDanetka = 0;
    currentGame.totalSolved = 0;
    currentGame.questionsHistory = [];
    currentGame.hintsUsed = 0;
    currentGame.totalHints = currentGame.hintsEnabled ? 3 : 0;
    
    // Переход к экрану игры
    elements.setupScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    elements.resultScreen.classList.remove('active');
    
    // Загрузка первой данетки
    loadDanetka();
    startTimer();
}

// Загрузка данетки
function loadDanetka() {
    if (currentGame.currentDanetka >= filteredDanetki.length) {
        endGame();
        return;
    }
    
    currentDanetkaData = filteredDanetki[currentGame.currentDanetka];
    
    // Обновление интерфейса
    elements.danetkaText.textContent = currentDanetkaData.question;
    elements.cardNumber.textContent = `#${currentGame.currentDanetka + 1}`;
    
    // Категория сложности
    const difficultyText = {
        easy: 'Легкая',
        medium: 'Средняя',
        hard: 'Сложная'
    };
    
    elements.categoryBadge.textContent = `Сложность: ${difficultyText[currentDanetkaData.difficulty]}`;
    elements.categoryBadge.className = 'category-badge ' + currentDanetkaData.difficulty;
    
    // Сброс истории вопросов
    elements.historyList.innerHTML = `
        <div class="history-empty">
            <i class="fas fa-comment-dots"></i>
            <p>Вопросы еще не задавались</p>
        </div>
    `;
    
    // Обновление подсказок
    elements.hintText.textContent = 'Нажмите "Получить подсказку" для помощи';
    elements.getHintBtn.disabled = !currentGame.hintsEnabled;
    elements.hintsAvailable.textContent = `${currentGame.hintsUsed}/${currentGame.totalHints} подсказок`;
    
    // Обновление счетчиков
    elements.currentGameSpan.textContent = `${currentGame.currentDanetka + 1}/${filteredDanetki.length}`;
    elements.questionsAsked.textContent = '0 вопросов';
    
    // Обновление прогресса
    updateProgressBar();
    
    // Анимация появления
    elements.danetkaText.classList.add('fade-in-up');
    setTimeout(() => elements.danetkaText.classList.remove('fade-in-up'), 500);
}

// Таймер
function startTimer() {
    if (currentGame.timeLimit === 0) {
        elements.timer.textContent = '∞';
        return;
    }
    
    clearInterval(currentGame.timerInterval);
    currentGame.startTime = Date.now();
    const totalSeconds = currentGame.timeLimit * 60;
    
    currentGame.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentGame.startTime) / 1000);
        const remaining = totalSeconds - elapsed;
        
        if (remaining <= 0) {
            clearInterval(currentGame.timerInterval);
            elements.timeoutModal.classList.add('active');
            return;
        }
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Запись ответа
function recordAnswer(answer) {
    const question = prompt('Введите вопрос, который задал игрок:');
    if (!question) return;
    
    // Добавление в историю
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const answerText = {
        yes: 'ДА',
        no: 'НЕТ',
        irrelevant: 'НЕ ИМЕЕТ ЗНАЧЕНИЯ'
    };
    
    const answerClass = {
        yes: 'answer-yes',
        no: 'answer-no',
        irrelevant: 'answer-irrelevant'
    };
    
    historyItem.innerHTML = `
        <div class="history-question">${question}</div>
        <div class="history-answer ${answerClass[answer]}">${answerText[answer]}</div>
    `;
    
    // Удаление пустого состояния
    const emptyState = elements.historyList.querySelector('.history-empty');
    if (emptyState) {
        emptyState.remove();
    }
    
    elements.historyList.prepend(historyItem);
    
    // Обновление счетчика вопросов
    currentGame.questionsHistory.push({ question, answer });
    elements.questionsAsked.textContent = `${currentGame.questionsHistory.length} вопросов`;
    
    // Анимация
    historyItem.classList.add('fade-in-up');
}

// Быстрые вопросы
function quickQuestion(type) {
    const questions = {
        time: 'Это связано со временем?',
        location: 'Это связано с местом?',
        object: 'Это предмет?',
        person: 'Это человек?'
    };
    
    if (questions[type]) {
        if (confirm(`Задать вопрос: "${questions[type]}"?`)) {
            // Определяем правильный ответ на основе типа
            const answer = 'yes'; // В реальной игре нужно анализировать контекст
            recordAnswer(answer);
        }
    }
}

// Показ подсказки
function showHint() {
    if (!currentGame.hintsEnabled || currentGame.hintsUsed >= currentGame.totalHints) {
        alert('Подсказки закончились или отключены!');
        return;
    }
    
    currentGame.hintsUsed++;
    
    // Обновление счетчика
    elements.hintsAvailable.textContent = `${currentGame.hintsUsed}/${currentGame.totalHints} подсказок`;
    
    // Показ подсказки
    if (currentDanetkaData.hints && currentDanetkaData.hints.length > 0) {
        const randomHint = currentDanetkaData.hints[Math.floor(Math.random() * currentDanetkaData.hints.length)];
        elements.modalHintText.textContent = randomHint;
        elements.hintModal.classList.add('active');
        
        // Сохраняем последнюю подсказку
        elements.hintText.textContent = randomHint;
    } else {
        alert('Для этой данетки нет подсказок');
    }
    
    // Отключение кнопки если подсказки кончились
    if (currentGame.hintsUsed >= currentGame.totalHints) {
        elements.getHintBtn.disabled = true;
    }
}

// Очистка истории
function clearHistory() {
    currentGame.questionsHistory = [];
    elements.historyList.innerHTML = `
        <div class="history-empty">
            <i class="fas fa-comment-dots"></i>
            <p>Вопросы еще не задавались</p>
        </div>
    `;
    elements.questionsAsked.textContent = '0 вопросов';
}

// Показать решение
function showSolution() {
    // Остановка таймера
    clearInterval(currentGame.timerInterval);
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    
    // Обновление результата
    elements.resultTitle.textContent = currentGame.totalSolved === filteredDanetki.length 
        ? 'Все данетки разгаданы!' 
        : 'Разгадано!';
    
    elements.solutionText.textContent = currentDanetkaData.solution;
    
    // Статистика
    const timeSpent = Math.floor((Date.now() - currentGame.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    elements.statTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    elements.statQuestions.textContent = currentGame.questionsHistory.length;
    elements.statHints.textContent = currentGame.hintsUsed;
    
    const difficultyText = {
        easy: 'Легкая',
        medium: 'Средняя',
        hard: 'Сложная'
    };
    
    elements.statDifficulty.textContent = difficultyText[currentDanetkaData.difficulty];
    
    // Переход к экрану результата
    elements.gameScreen.classList.remove('active');
    elements.resultScreen.classList.add('active');
    
    // Увеличение счетчика решенных
    currentGame.totalSolved++;
}

// Следующая данетка
function nextDanetka() {
    currentGame.currentDanetka++;
    
    if (currentGame.currentDanetka >= filteredDanetki.length) {
        endGame();
        return;
    }
    
    // Сброс состояния
    currentGame.questionsHistory = [];
    currentGame.hintsUsed = 0;
    
    // Переход к игре
    elements.resultScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Загрузка новой данетки
    loadDanetka();
    startTimer();
}

// Завершение игры
function endGame() {
    // Остановка таймера
    clearInterval(currentGame.timerInterval);
    
    // Показ финального результата
    elements.resultTitle.textContent = 'Игра завершена!';
    elements.solutionText.textContent = `Вы разгадали ${currentGame.totalSolved} из ${filteredDanetki.length} данеток.`;
    
    // Обновление статистики
    elements.statTime.textContent = '-';
    elements.statQuestions.textContent = currentGame.totalSolved;
    elements.statHints.textContent = currentGame.hintsUsed;
    elements.statDifficulty.textContent = 'Завершено';
    
    // Переход к результату
    elements.gameScreen.classList.remove('active');
    elements.resultScreen.classList.add('active');
}

// Играть снова
function playAgain() {
    elements.resultScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Сброс
    currentGame.currentDanetka = 0;
    currentGame.totalSolved = 0;
    currentGame.questionsHistory = [];
    currentGame.hintsUsed = 0;
    
    // Загрузка первой данетки
    loadDanetka();
    startTimer();
}

// Вернуться в меню
function backToMenu() {
    elements.resultScreen.classList.remove('active');
    elements.setupScreen.classList.add('active');
    
    // Сброс состояния
    currentGame.currentDanetka = 0;
    currentGame.totalSolved = 0;
    currentGame.questionsHistory = [];
    currentGame.hintsUsed = 0;
    
    // Обновление прогресса
    updateProgressBar();
}

// Обновление прогресс бара
function updateProgressBar() {
    const progress = filteredDanetki.length > 0 
        ? ((currentGame.currentDanetka + 1) / filteredDanetki.length) * 100 
        : 0;
    
    elements.progressFill.style.width = `${progress}%`;
}

// Обновление статистики
function updateStatsDisplay() {
    const stats = JSON.parse(localStorage.getItem('danetkiStats')) || {
        totalPlayed: 0,
        totalSolved: 0,
        bestTime: 0
    };
    
    // Можно добавить отображение статистики где-то в интерфейсе
}

// Сохранение статистики
function saveStats(solved) {
    const stats = JSON.parse(localStorage.getItem('danetkiStats')) || {
        totalPlayed: 0,
        totalSolved: 0,
        bestTime: 0
    };
    
    stats.totalPlayed++;
    if (solved) stats.totalSolved++;
    
    // Расчет времени
    const timeSpent = Math.floor((Date.now() - currentGame.startTime) / 1000);
    if (stats.bestTime === 0 || timeSpent < stats.bestTime) {
        stats.bestTime = timeSpent;
    }
    
    localStorage.setItem('danetkiStats', JSON.stringify(stats));
}
