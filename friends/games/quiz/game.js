// Основной игровой код (упрощенный)

// DOM элементы
const screens = {
    main: document.getElementById('mainMenu'),
    category: document.getElementById('categoryMenu'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen'),
    end: document.getElementById('endScreen'),
    stats: document.getElementById('statsScreen'),
    pause: document.getElementById('pauseScreen'),
    competitive: document.getElementById('competitiveScreen')
};

// Игровые переменные
let timer;
let timeLeft = 30;
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let selectedAnswer = null;
let gameStarted = false;
let gameQuestions = [];
let gameStartTime;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadCategories();
});

// Загрузка статистики
function loadStats() {
    document.getElementById('gamesPlayed').textContent = gameStats.gamesPlayed;
    document.getElementById('correctAnswers').textContent = gameStats.correctAnswers;
    document.getElementById('totalPoints').textContent = gameStats.totalPoints;
}

// Загрузка категорий
function loadCategories() {
    const container = document.getElementById('categoriesList');
    let html = '';
    
    Object.entries(quizDatabase).forEach(([id, category]) => {
        const stats = getCategoryStats(id);
        const isSelected = gameSettings.selectedCategories.includes(id);
        
        html += `
            <div class="category-item ${isSelected ? 'active' : ''}" onclick="toggleCategory('${id}')">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-name">${category.name}</div>
                <div class="category-stats">
                    ${stats.accuracy}% точность
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Переключение категории
function toggleCategory(categoryId) {
    const index = gameSettings.selectedCategories.indexOf(categoryId);
    
    if (index === -1) {
        gameSettings.selectedCategories.push(categoryId);
    } else {
        gameSettings.selectedCategories.splice(index, 1);
    }
    
    localStorage.setItem('quizSettings', JSON.stringify(gameSettings));
    loadCategories();
}

// Изменение количества вопросов
function changeQuestionCount(delta) {
    const element = document.getElementById('questionCount');
    let count = parseInt(element.textContent) + delta;
    count = Math.max(5, Math.min(50, count));
    element.textContent = count;
    gameSettings.questionsCount = count;
    localStorage.setItem('quizSettings', JSON.stringify(gameSettings));
}

// Показать главное меню
function showMainMenu() {
    hideAllScreens();
    screens.main.classList.add('active');
    loadStats();
}

// Показать категории
function showCategories() {
    hideAllScreens();
    screens.category.classList.add('active');
}

// Показать статистику
function showStats() {
    hideAllScreens();
    screens.stats.classList.add('active');
    loadStatistics();
}

// Показать соревнование
function showCompetitive() {
    hideAllScreens();
    screens.competitive.classList.add('active');
}

// Скрыть все экраны
function hideAllScreens() {
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
}

// Начать игру
function startGame(type) {
    let questions = [];
    
    if (type === 'quick') {
        // Быстрая игра
        questions = getRandomQuestions('mixed', 'mixed', 10);
    } else if (type === 'category') {
        // Игра по категориям
        const category = gameSettings.selectedCategories.length > 0 ? 
            gameSettings.selectedCategories[Math.floor(Math.random() * gameSettings.selectedCategories.length)] : 
            'general';
        const difficulty = document.getElementById('difficultySelect').value;
        const count = parseInt(document.getElementById('questionCount').textContent);
        questions = getRandomQuestions(category, difficulty, count);
    }
    
    if (questions.length === 0) {
        showNotification('Недостаточно вопросов. Выберите больше категорий.', 'error');
        return;
    }
    
    // Инициализация игры
    currentGame = {
        questions: questions,
        score: 0,
        correctAnswers: 0,
        currentQuestion: 0,
        startTime: new Date(),
        userAnswers: [],
        categoryStats: {}
    };
    
    gameQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    gameStarted = true;
    gameStartTime = new Date();
    
    // Показать игровой экран
    hideAllScreens();
    screens.game.classList.add('active');
    
    // Загрузить первый вопрос
    loadQuestion();
}

// Загрузить вопрос
function loadQuestion() {
    if (!gameQuestions[currentQuestionIndex]) {
        endGame();
        return;
    }
    
    const question = gameQuestions[currentQuestionIndex];
    selectedAnswer = null;
    
    // Обновить UI
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('categoryName').textContent = question.category;
    document.getElementById('difficultyLabel').textContent = 
        question.difficulty === 'easy' ? 'Легкая' : 
        question.difficulty === 'medium' ? 'Средняя' : 'Сложная';
    document.getElementById('difficultyLabel').className = `difficulty ${question.difficulty}`;
    document.getElementById('currentQuestion').textContent = `${currentQuestionIndex + 1}/${gameQuestions.length}`;
    document.getElementById('score').textContent = score;
    
    // Прогресс бар
    const progress = (currentQuestionIndex / gameQuestions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Очистить ответы
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';
    
    // Добавить варианты ответов
    const letters = ['A', 'B', 'C', 'D'];
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer';
        answerElement.innerHTML = `
            <span class="answer-letter">${letters[index]}</span>
            <span class="answer-text">${answer}</span>
        `;
        answerElement.onclick = () => selectAnswer(index);
        container.appendChild(answerElement);
    });
    
    // Сбросить подсказки
    document.querySelectorAll('.hint-btn').forEach(btn => {
        btn.disabled = false;
    });
    
    // Запустить таймер
    startTimer();
}

// Запустить таймер
function startTimer() {
    timeLeft = 30;
    document.getElementById('timer').textContent = timeLeft;
    
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 10) {
            document.getElementById('timer').style.color = '#EF4444';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeOut();
        }
    }, 1000);
}

// Выбор ответа
function selectAnswer(index) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = index;
    
    // Подсветить выбранный ответ
    const answers = document.querySelectorAll('.answer');
    answers.forEach((answer, i) => {
        answer.classList.remove('selected');
        if (i === index) {
            answer.classList.add('selected');
        }
    });
    
    // Проверить ответ через 1 секунду
    setTimeout(checkAnswer, 1000);
}

// Проверить ответ
function checkAnswer() {
    clearInterval(timer);
    
    const question = gameQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correct;
    const timeBonus = Math.floor(timeLeft / 3);
    const points = isCorrect ? question.points + timeBonus : 0;
    
    // Обновить статистику
    if (isCorrect) {
        score += points;
        correctAnswers++;
    }
    
    // Показать правильный/неправильный ответ
    const answers = document.querySelectorAll('.answer');
    answers.forEach((answer, index) => {
        if (index === question.correct) {
            answer.classList.add('correct');
        } else if (index === selectedAnswer && !isCorrect) {
            answer.classList.add('wrong');
        }
    });
    
    // Сохранить ответ
    currentGame.userAnswers.push({
        question: question.question,
        selected: selectedAnswer,
        correct: question.correct,
        isCorrect: isCorrect,
        points: points
    });
    
    // Обновить статистику по категориям
    if (!currentGame.categoryStats[question.categoryId]) {
        currentGame.categoryStats[question.categoryId] = { total: 0, correct: 0 };
    }
    currentGame.categoryStats[question.categoryId].total++;
    if (isCorrect) {
        currentGame.categoryStats[question.categoryId].correct++;
    }
    
    // Показать результат
    setTimeout(() => {
        showResult(isCorrect, points, question);
    }, 2000);
}

// Тайм-аут
function timeOut() {
    const question = gameQuestions[currentQuestionIndex];
    
    // Показать правильный ответ
    const answers = document.querySelectorAll('.answer');
    answers.forEach((answer, index) => {
        if (index === question.correct) {
            answer.classList.add('correct');
        }
    });
    
    // Сохранить ответ
    currentGame.userAnswers.push({
        question: question.question,
        selected: null,
        correct: question.correct,
        isCorrect: false,
        points: 0
    });
    
    setTimeout(() => {
        showResult(false, 0, question);
    }, 2000);
}

// Показать результат
function showResult(isCorrect, points, question) {
    document.getElementById('resultIcon').className = `result-icon ${isCorrect ? 'correct' : 'wrong'}`;
    document.getElementById('resultIcon').innerHTML = 
        isCorrect ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';
    document.getElementById('resultTitle').textContent = isCorrect ? 'Правильно!' : 'Неверно!';
    document.getElementById('resultMessage').textContent = 
        isCorrect ? `Вы заработали ${points} очков` : 'Попробуйте в следующий раз';
    document.getElementById('correctAnswerText').textContent = question.answers[question.correct];
    document.getElementById('explanationText').textContent = question.explanation;
    
    hideAllScreens();
    screens.result.classList.add('active');
}

// Следующий вопрос
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= gameQuestions.length) {
        endGame();
    } else {
        hideAllScreens();
        screens.game.classList.add('active');
        loadQuestion();
    }
}

// Завершить игру
function endGame() {
    currentGame.endTime = new Date();
    currentGame.score = score;
    currentGame.correctAnswers = correctAnswers;
    
    // Сохранить игру в историю
    gameHistory.unshift({
        date: new Date().toISOString(),
        score: score,
        correct: correctAnswers,
        total: gameQuestions.length,
        time: Math.floor((currentGame.endTime - currentGame.startTime) / 1000)
    });
    
    // Обновить статистику
    const categoryStats = Object.entries(currentGame.categoryStats).map(([category, stats]) => ({
        category,
        total: stats.total,
        correct: stats.correct
    }));
    
    updateStats({
        score: score,
        correct: correctAnswers,
        total: gameQuestions.length,
        categoryStats: categoryStats
    });
    
    // Показать результаты
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCorrect').textContent = `${correctAnswers}/${gameQuestions.length}`;
    const accuracy = Math.round((correctAnswers / gameQuestions.length) * 100);
    document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
    const timeSpent = Math.floor((currentGame.endTime - currentGame.startTime) / 1000);
    document.getElementById('finalTime').textContent = `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`;
    
    hideAllScreens();
    screens.end.classList.add('active');
}

// Играть снова
function playAgain() {
    currentGame = null;
    gameStarted = false;
    showMainMenu();
}

// Пропустить вопрос
function skipQuestion() {
    if (selectedAnswer !== null) return;
    
    currentGame.userAnswers.push({
        question: gameQuestions[currentQuestionIndex].question,
        selected: null,
        correct: gameQuestions[currentQuestionIndex].correct,
        isCorrect: false,
        points: 0
    });
    
    currentQuestionIndex++;
    nextQuestion();
}

// Пауза игры
function pauseGame() {
    clearInterval(timer);
    hideAllScreens();
    screens.pause.classList.add('active');
}

// Продолжить игру
function resumeGame() {
    hideAllScreens();
    screens.game.classList.add('active');
    startTimer();
}

// Начать заново
function restartGame() {
    if (confirm('Начать игру заново?')) {
        currentGame = null;
        gameStarted = false;
        showMainMenu();
    }
}

// Использовать подсказку
function useHint(type) {
    const btn = document.getElementById(`hint${type}`);
    btn.disabled = true;
    
    const question = gameQuestions[currentQuestionIndex];
    
    switch(type) {
        case '50':
            // 50/50 - убрать 2 неправильных ответа
            const wrongAnswers = [];
            question.answers.forEach((answer, index) => {
                if (index !== question.correct) {
                    wrongAnswers.push(index);
                }
            });
            
            // Перемешать и взять 2
            const toRemove = shuffleArray(wrongAnswers).slice(0, 2);
            const answers = document.querySelectorAll('.answer');
            toRemove.forEach(index => {
                answers[index].style.opacity = '0.3';
                answers[index].style.pointerEvents = 'none';
            });
            break;
            
        case 'time':
            // +30 секунд
            timeLeft += 30;
            document.getElementById('timer').textContent = timeLeft;
            break;
            
        case 'hint':
            // Подсказка (объяснение)
            alert(`Подсказка: ${question.explanation}`);
            break;
    }
    
    showNotification('Подсказка использована', 'success');
}

// Загрузить статистику
function loadStatistics() {
    const container = document.getElementById('statsGrid');
    let html = '';
    
    // Общая статистика
    html += `
        <div class="stat-card">
            <h4>Всего игр</h4>
            <div class="stat-value">${gameStats.gamesPlayed}</div>
            <div class="stat-label">сыграно</div>
        </div>
        
        <div class="stat-card">
            <h4>Точность</h4>
            <div class="stat-value">${gameStats.totalQuestions > 0 ? 
                Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100) : 0}%</div>
            <div class="stat-label">правильных ответов</div>
        </div>
        
        <div class="stat-card">
            <h4>Всего очков</h4>
            <div class="stat-value">${gameStats.totalPoints}</div>
            <div class="stat-label">набрано</div>
        </div>
    `;
    
    // Статистика по категориям
    Object.entries(quizDatabase).forEach(([id, category]) => {
        const stats = getCategoryStats(id);
        if (stats.played > 0) {
            html += `
                <div class="stat-card">
                    <h4>${category.name}</h4>
                    <div class="stat-value">${stats.accuracy}%</div>
                    <div class="stat-label">${stats.correct}/${stats.played}</div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    
    // История
    const historyList = document.getElementById('historyList');
    if (gameHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666;">История игр пуста</p>';
    } else {
        let historyHtml = '';
        gameHistory.slice(0, 10).forEach(game => {
            const date = new Date(game.date);
            const accuracy = Math.round((game.correct / game.total) * 100);
            historyHtml += `
                <div class="history-item">
                    <span>${date.toLocaleDateString()}</span>
                    <span>${game.score} очков (${accuracy}%)</span>
                </div>
            `;
        });
        historyList.innerHTML = historyHtml;
    }
}

// Соревновательный режим
function setPlayers(count) {
    document.querySelectorAll('.player-count').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Создать список игроков
    const container = document.getElementById('playersList');
    let html = '';
    
    for (let i = 0; i < count; i++) {
        html += `
            <div class="player-input">
                <div class="player-number">${i + 1}</div>
                <input type="text" placeholder="Игрок ${i + 1}" value="Игрок ${i + 1}">
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Начать соревнование
function startCompetitive() {
    showNotification('Соревновательный режим в разработке', 'info');
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}