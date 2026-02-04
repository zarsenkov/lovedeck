// Основной игровой код для Данеток

// DOM элементы
const screens = {
    main: document.getElementById('mainScreen'),
    difficulty: document.getElementById('difficultyScreen'),
    game: document.getElementById('gameScreen'),
    hint: document.getElementById('hintScreen'),
    solution: document.getElementById('solutionScreen'),
    history: document.getElementById('historyScreen'),
    rules: document.getElementById('rulesScreen')
};

// Таймер
let gameTimer;
let timeLeft = 600; // 10 минут в секундах
let gameStartTime;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    setupEventListeners();
    setupDifficultyBadges();
    
    // Восстанавливаем последнюю игру, если она была прервана
    const savedGame = localStorage.getItem('currentDanetkiGame');
    if (savedGame) {
        const confirmRestore = confirm('У вас есть незавершенная игра. Хотите продолжить?');
        if (confirmRestore) {
            currentGame = JSON.parse(savedGame);
            startGameWithDifficulty(currentGame.difficulty, true);
        } else {
            localStorage.removeItem('currentDanetkiGame');
        }
    }
});

// Загрузка статистики
function loadStats() {
    const stats = getStats();
    document.getElementById('totalPlayed').textContent = stats.totalPlayed;
    document.getElementById('totalSolved').textContent = stats.totalSolved;
    document.getElementById('totalTime').textContent = stats.totalTime;
}

// Настройка слушателей событий
function setupEventListeners() {
    // Кнопки сложности на главном экране
    document.querySelectorAll('.difficulty-badge').forEach(badge => {
        badge.addEventListener('click', function() {
            const level = this.getAttribute('data-level');
            setDifficulty(level);
            startGameWithDifficulty(level);
        });
    });
    
    // Кнопка "Назад" в истории
    document.querySelectorAll('.back-button').forEach(btn => {
        if (btn.onclick === null) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                showScreen('mainScreen');
            });
        }
    });
}

// Настройка бейджей сложности
function setupDifficultyBadges() {
    const badges = document.querySelectorAll('.difficulty-badge');
    badges.forEach(badge => {
        badge.addEventListener('click', function() {
            badges.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Показать экран
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    if (screens[screenName.replace('Screen', '')]) {
        screens[screenName.replace('Screen', '')].classList.add('active');
    }
    
    // Особые действия для экранов
    switch(screenName) {
        case 'mainScreen':
            loadStats();
            break;
        case 'historyScreen':
            loadHistory();
            break;
    }
}

// Начать игру
function startGame() {
    const activeBadge = document.querySelector('.difficulty-badge.active');
    const difficulty = activeBadge ? activeBadge.getAttribute('data-level') : 'all';
    startGameWithDifficulty(difficulty);
}

// Начать игру с определенной сложностью
function startGameWithDifficulty(difficulty, restore = false) {
    currentGame.difficulty = difficulty;
    
    if (!restore) {
        currentGame.currentRiddle = getRandomRiddle(difficulty);
        currentGame.startTime = new Date();
        currentGame.questions = [];
        currentGame.hintsUsed = 0;
        currentGame.solved = false;
        
        // Сохраняем игру
        localStorage.setItem('currentDanetkiGame', JSON.stringify(currentGame));
    }
    
    // Настройка интерфейса
    setupGameScreen();
    showScreen('gameScreen');
    
    // Запуск таймера
    startTimer();
}

// Настройка игрового экрана
function setupGameScreen() {
    const riddle = currentGame.currentRiddle;
    
    // Обновляем информацию о загадке
    document.getElementById('riddleNumber').textContent = riddle.id;
    document.getElementById('riddleText').textContent = riddle.riddle;
    
    // Настройка сложности
    const difficultyBadge = document.querySelector('.difficulty-badge-small');
    difficultyBadge.textContent = getDifficultyText(riddle.difficulty);
    difficultyBadge.className = 'difficulty-badge-small ' + riddle.difficulty;
    document.getElementById('currentDifficulty').textContent = getDifficultyText(riddle.difficulty);
    
    // Сброс счетчиков
    document.getElementById('questionCount').textContent = '0';
    document.getElementById('hintCount').textContent = '3';
    document.getElementById('hintsLeft').textContent = '3';
    
    // Очистка лога вопросов
    document.getElementById('logEntries').innerHTML = '';
    document.getElementById('emptyLog').style.display = 'block';
    
    // Сброс таймера
    timeLeft = riddle.estimatedTime * 60 || 600;
    updateTimerDisplay();
}

// Запуск таймера
function startTimer() {
    gameStartTime = new Date();
    
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    gameTimer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            timeOut();
        }
        
        // Автосохранение каждые 30 секунд
        if (timeLeft % 30 === 0) {
            localStorage.setItem('currentDanetkiGame', JSON.stringify(currentGame));
        }
    }, 1000);
}

// Обновление отображения таймера
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Меняем цвет при низком времени
    if (timeLeft < 60) {
        document.getElementById('timer').style.color = '#EF4444';
    } else if (timeLeft < 180) {
        document.getElementById('timer').style.color = '#F59E0B';
    } else {
        document.getElementById('timer').style.color = '#4F46E5';
    }
}

// Тайм-аут
function timeOut() {
    showNotification('Время вышло!', 'warning');
    setTimeout(() => {
        showSolution();
    }, 2000);
}

// Дать ответ
function giveAnswer(answer) {
    if (!currentGame.currentRiddle) return;
    
    // Добавляем вопрос в историю (в реальной игре здесь был бы вопрос игрока)
    const questionNumber = currentGame.questions.length + 1;
    const questionText = `Вопрос ${questionNumber}`;
    
    currentGame.questions.push({
        question: questionText,
        answer: answer,
        timestamp: new Date()
    });
    
    // Обновляем счетчик вопросов
    document.getElementById('questionCount').textContent = currentGame.questions.length;
    
    // Добавляем в лог
    addToLog(questionText, answer);
    
    // Сохраняем игру
    localStorage.setItem('currentDanetkiGame', JSON.stringify(currentGame));
    
    // Показываем уведомление
    const answerText = getAnswerText(answer);
    showNotification(`Ответ: ${answerText}`, 'success');
}

// Добавить запись в лог
function addToLog(question, answer) {
    const logEntries = document.getElementById('logEntries');
    const emptyLog = document.getElementById('emptyLog');
    
    // Скрываем сообщение о пустом логе
    if (emptyLog.style.display !== 'none') {
        emptyLog.style.display = 'none';
    }
    
    // Создаем новую запись
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${answer}`;
    
    const answerText = getAnswerText(answer);
    const answerIcon = getAnswerIcon(answer);
    
    logEntry.innerHTML = `
        <div class="log-question">${question}</div>
        <div class="log-answer">${answerIcon} Ответ: ${answerText}</div>
    `;
    
    logEntries.prepend(logEntry);
    
    // Ограничиваем количество записей
    if (logEntries.children.length > 10) {
        logEntries.removeChild(logEntries.lastChild);
    }
}

// Использовать подсказку
function useHint() {
    if (currentGame.hintsUsed >= 3) {
        showNotification('Подсказки закончились!', 'error');
        return;
    }
    
    if (!currentGame.currentRiddle) return;
    
    currentGame.hintsUsed++;
    
    // Обновляем счетчик подсказок
    document.getElementById('hintCount').textContent = 3 - currentGame.hintsUsed;
    document.getElementById('hintsLeft').textContent = 3 - currentGame.hintsUsed;
    document.getElementById('remainingHints').textContent = 3 - currentGame.hintsUsed;
    
    // Показываем подсказку
    showHint();
    
    // Сохраняем игру
    localStorage.setItem('currentDanetkiGame', JSON.stringify(currentGame));
}

// Показать подсказку
function showHint() {
    const riddle = currentGame.currentRiddle;
    const hintIndex = Math.min(currentGame.hintsUsed - 1, riddle.hints.length - 1);
    
    document.getElementById('hintContent').textContent = riddle.hints[hintIndex] || 
        'Попробуйте подумать над загадкой с другой стороны...';
    
    showScreen('hintScreen');
}

// Закрыть подсказку
function closeHint() {
    showScreen('gameScreen');
}

// Показать решение
function showSolution() {
    if (!currentGame.currentRiddle) return;
    
    // Останавливаем таймер
    clearInterval(gameTimer);
    
    // Рассчитываем время
    const endTime = new Date();
    const timeSpent = Math.floor((endTime - currentGame.startTime) / 1000);
    
    // Обновляем статистику на экране решения
    document.getElementById('totalQuestions').textContent = currentGame.questions.length;
    document.getElementById('solveTime').textContent = formatTime(timeSpent);
    document.getElementById('usedHints').textContent = currentGame.hintsUsed;
    
    // Показываем решение
    document.getElementById('solutionText').textContent = currentGame.currentRiddle.solution;
    
    // Сохраняем результат
    const solved = confirm('Вы разгадали загадку?');
    currentGame.solved = solved;
    
    saveGameHistory(
        currentGame.currentRiddle,
        solved,
        timeSpent,
        currentGame.questions.length,
        currentGame.hintsUsed
    );
    
    // Очищаем текущую игру
    localStorage.removeItem('currentDanetkiGame');
    currentGame = {
        difficulty: null,
        currentRiddle: null,
        startTime: null,
        questions: [],
        hintsUsed: 0,
        solved: false
    };
    
    // Показываем экран решения
    showScreen('solutionScreen');
}

// Пропустить загадку
function skipRiddle() {
    if (confirm('Вы уверены, что хотите пропустить эту загадку?')) {
        showSolution();
    }
}

// Следующая загадка
function nextRiddle() {
    startGameWithDifficulty(currentGame.difficulty || 'all');
}

// Поделиться результатом
function shareResult() {
    const riddle = currentGame.currentRiddle;
    const timeSpent = document.getElementById('solveTime').textContent;
    const questionsCount = currentGame.questions.length;
    
    const text = `Я только что разгадал данетку "${riddle.title}" за ${timeSpent}, задав ${questionsCount} вопросов! Попробуйте и вы в игре "Данетки"!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Данетки - LoveCouple_Friends',
            text: text,
            url: window.location.href
        });
    } else {
        // Копируем в буфер обмена
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Текст скопирован в буфер обмена!', 'success');
        });
    }
}

// Показать выбор сложности
function showDifficultySelection() {
    showScreen('difficultyScreen');
}

// Установить сложность
function setDifficulty(level) {
    const badges = document.querySelectorAll('.difficulty-badge');
    badges.forEach(badge => {
        badge.classList.remove('active');
        if (badge.getAttribute('data-level') === level) {
            badge.classList.add('active');
        }
    });
    
    // Сохраняем настройку
    localStorage.setItem('danetkiDifficulty', level);
}

// Показать историю
function showHistory() {
    showScreen('historyScreen');
}

// Загрузить историю
function loadHistory() {
    const history = getHistory();
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <h3>История игр пуста</h3>
                <p>Сыграйте в свою первую данетку!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    history.forEach(game => {
        const date = new Date(game.date);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        const timeSpent = formatTime(game.timeSpent);
        
        html += `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-title">${game.title}</div>
                    <div class="history-date">${formattedDate}</div>
                </div>
                <div class="history-stats">
                    <span><i class="fas fa-clock"></i> ${timeSpent}</span>
                    <span><i class="fas fa-question-circle"></i> ${game.questionsCount} вопросов</span>
                    <span><i class="fas fa-lightbulb"></i> ${game.hintsUsed} подсказок</span>
                    <span class="${game.solved ? 'success' : 'danger'}">
                        <i class="fas fa-${game.solved ? 'check' : 'times'}"></i>
                        ${game.solved ? 'Разгадано' : 'Не разгадано'}
                    </span>
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

// Показать правила
function showRules() {
    showScreen('rulesScreen');
}

// Вспомогательные функции
function getDifficultyText(difficulty) {
    switch(difficulty) {
        case 'easy': return 'Легкая';
        case 'medium': return 'Средняя';
        case 'hard': return 'Сложная';
        default: return 'Смешанная';
    }
}

function getAnswerText(answer) {
    switch(answer) {
        case 'yes': return 'Да';
        case 'no': return 'Нет';
        case 'irrelevant': return 'Не имеет значения';
        default: return answer;
    }
}

function getAnswerIcon(answer) {
    switch(answer) {
        case 'yes': return '✅';
        case 'no': return '❌';
        case 'irrelevant': return '➖';
        default: return '❓';
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Предотвращаем закрытие страницы с несохраненной игрой
window.addEventListener('beforeunload', function(e) {
    if (currentGame.currentRiddle && !currentGame.solved) {
        e.preventDefault();
        e.returnValue = 'У вас есть незавершенная игра. Вы уверены, что хотите уйти?';
        return e.returnValue;
    }
});

// Инициализация PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('../service-worker.js').then(
            function(registration) {
                console.log('ServiceWorker registration successful');
            },
            function(err) {
                console.log('ServiceWorker registration failed: ', err);
            }
        );
    });
}