class QuizGame {
    constructor() {
        console.log('Игра создана');
        
        this.state = {
            // Настройки
            players: 1,
            difficulty: 'easy',
            categories: ['general'],
            questionCount: 10,
            
            // Игровой процесс
            currentQuestion: 0,
            questions: [],
            selectedAnswer: null,
            timer: 30,
            timerInterval: null,
            gameStarted: false,
            gameTime: 0,
            
            // Очки
            score: 0,
            streak: 0,
            bestStreak: 0,
            totalCorrect: 0,
            
            // Мультиплеер
            playerScores: [],
            currentPlayer: 0,
            
            // Подсказки
            fiftyFiftyUsed: false
        };
        
        this.init();
    }
    
    init() {
        console.log('Инициализация игры');
        this.bindEvents();
        this.updateQuestionCount();
        this.initPlayers();
    }
    
    bindEvents() {
        console.log('Настройка обработчиков');
        
        // Кнопка назад
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.state.gameStarted) {
                this.showModal('exitModal');
            } else {
                window.location.href = '../../index.html';
            }
        });
        
        // Меню (пока не используется)
        document.getElementById('menuBtn').addEventListener('click', () => {
            console.log('Меню нажато');
        });
        
        // Игроки
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const players = parseInt(e.target.dataset.players);
                this.setPlayers(players);
            });
        });
        
        // Сложность
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diff = e.target.dataset.diff;
                this.setDifficulty(diff);
            });
        });
        
        // Категории - САМОЕ ВАЖНОЕ!
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                console.log('Клик по категории!');
                const cat = tag.dataset.cat;
                console.log('Категория:', cat);
                this.toggleCategory(cat);
            });
        });
        
        // Слайдер вопросов
        const slider = document.getElementById('questionSlider');
        slider.addEventListener('input', (e) => {
            this.setQuestionCount(e.target.value);
        });
        
        // Старт игры
        document.querySelector('.start-game').addEventListener('click', () => {
            console.log('Старт игры');
            this.startGame();
        });
        
        // Выход из игры
        document.getElementById('exitGameBtn').addEventListener('click', () => {
            this.showModal('exitModal');
        });
        
        document.querySelector('.cancel-exit').addEventListener('click', () => {
            this.hideModal('exitModal');
        });
        
        document.querySelector('.confirm-exit').addEventListener('click', () => {
            this.exitGame();
        });
        
        document.getElementById('closeExitModal').addEventListener('click', () => {
            this.hideModal('exitModal');
        });
        
        // Ответы
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer')) {
                const index = parseInt(e.target.dataset.index);
                this.selectAnswer(index);
            }
        });
        
        // Подсказка 50/50
        document.getElementById('fiftyFiftyBtn').addEventListener('click', () => {
            this.useFiftyFifty();
        });
        
        // Рестарт
        document.querySelector('.play-again').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Новые настройки
        document.querySelector('.change-settings').addEventListener('click', () => {
            this.showMainScreen();
        });
        
        console.log('Обработчики настроены');
    }
    
    // === НАСТРОЙКИ ===
    setPlayers(count) {
        console.log('Установка игроков:', count);
        this.state.players = count;
        
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.players) === count);
        });
        
        this.initPlayers();
    }
    
    setDifficulty(diff) {
        console.log('Установка сложности:', diff);
        this.state.difficulty = diff;
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
    }
    
    toggleCategory(cat) {
        console.log('Переключение категории:', cat);
        console.log('Текущие категории:', this.state.categories);
        
        const tag = document.querySelector(`[data-cat="${cat}"]`);
        if (!tag) {
            console.error('Тег не найден');
            return;
        }
        
        // Переключаем класс
        const isActive = tag.classList.contains('active');
        
        if (isActive) {
            // Нельзя отключить последнюю категорию
            if (this.state.categories.length === 1) {
                console.log('Нельзя отключить последнюю категорию');
                alert('Должна быть выбрана хотя бы одна категория!');
                return;
            }
            
            tag.classList.remove('active');
            this.state.categories = this.state.categories.filter(c => c !== cat);
        } else {
            tag.classList.add('active');
            this.state.categories.push(cat);
        }
        
        console.log('Новые категории:', this.state.categories);
        
        // Визуальная обратная связь
        tag.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tag.style.transform = '';
        }, 200);
    }
    
    setQuestionCount(count) {
        this.state.questionCount = parseInt(count);
        document.getElementById('questionCount').textContent = count;
    }
    
    updateQuestionCount() {
        const slider = document.getElementById('questionSlider');
        const display = document.getElementById('questionCount');
        display.textContent = slider.value;
        this.state.questionCount = parseInt(slider.value);
    }
    
    initPlayers() {
        console.log('Инициализация игроков:', this.state.players);
        this.state.playerScores = [];
        
        for (let i = 0; i < this.state.players; i++) {
            this.state.playerScores.push({
                id: i,
                name: `Игрок ${i + 1}`,
                score: 0,
                correct: 0
            });
        }
        
        this.updatePlayersUI();
    }
    
    updatePlayersUI() {
        const container = document.getElementById('playersScores');
        container.innerHTML = '';
        
        this.state.playerScores.forEach((player, index) => {
            const playerEl = document.createElement('div');
            playerEl.className = `player-score ${index === this.state.currentPlayer ? 'active' : ''}`;
            playerEl.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-points">${player.score}</div>
            `;
            container.appendChild(playerEl);
        });
    }
    
    // === ИГРОВОЙ ПРОЦЕСС ===
    startGame() {
        console.log('Старт игры');
        console.log('Выбранные категории:', this.state.categories);
        
        if (this.state.categories.length === 0) {
            alert('Выберите хотя бы одну категорию!');
            return;
        }
        
        // Генерируем вопросы
        this.generateQuestions();
        
        if (this.state.questions.length === 0) {
            alert('Недостаточно вопросов для выбранных категорий!');
            return;
        }
        
        // Сбрасываем состояние
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.totalCorrect = 0;
        this.state.gameTime = 0;
        this.state.currentPlayer = 0;
        this.state.gameStarted = true;
        this.state.selectedAnswer = null;
        this.state.fiftyFiftyUsed = false;
        
        // Сбрасываем очки игроков
        this.state.playerScores.forEach(p => {
            p.score = 0;
            p.correct = 0;
        });
        
        // Обновляем UI
        document.getElementById('fiftyFiftyBtn').disabled = false;
        
        // Показываем игровой экран
        this.showScreen('gameScreen');
        document.getElementById('gameSubtitle').textContent = 'Игра идет...';
        
        // Запускаем первый вопрос
        this.showQuestion();
    }
    
    generateQuestions() {
        console.log('Генерация вопросов');
        let allQuestions = [];
        
        // Собираем вопросы по выбранным категориям и сложности
        this.state.categories.forEach(cat => {
            const catQuestions = QUIZ_QUESTIONS[this.state.difficulty].filter(q => q.category === cat);
            allQuestions = allQuestions.concat(catQuestions);
        });
        
        // Перемешиваем
        allQuestions = this.shuffleArray(allQuestions);
        
        // Берем нужное количество
        this.state.questions = allQuestions.slice(0, this.state.questionCount);
        
        console.log('Сгенерировано вопросов:', this.state.questions.length);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    showQuestion() {
        console.log('Показ вопроса:', this.state.currentQuestion + 1);
        
        if (this.state.currentQuestion >= this.state.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.state.questions[this.state.currentQuestion];
        
        // Обновляем UI
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('qCategory').textContent = CATEGORIES[question.category];
        document.getElementById('qDifficulty').textContent = 
            this.state.difficulty === 'easy' ? 'Легко' :
            this.state.difficulty === 'medium' ? 'Средне' : 'Сложно';
        
        // Прогресс
        const progress = ((this.state.currentQuestion) / this.state.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = 
            `Вопрос ${this.state.currentQuestion + 1} из ${this.state.questions.length}`;
        
        // Генерируем ответы
        this.generateAnswers(question);
        
        // Сбрасываем выбранный ответ
        this.state.selectedAnswer = null;
        
        // Запускаем таймер
        this.startTimer();
        
        // Обновляем текущего игрока
        this.updateCurrentPlayer();
    }
    
    generateAnswers(question) {
        const container = document.getElementById('answersContainer');
        container.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer';
            btn.dataset.index = index;
            btn.textContent = answer;
            container.appendChild(btn);
        });
    }
    
    startTimer() {
        // Очищаем старый таймер
        this.stopTimer();
        
        // Сбрасываем таймер
        this.state.timer = 30;
        document.getElementById('timer').textContent = '30';
        
        // Запускаем новый таймер
        this.state.timerInterval = setInterval(() => {
            if (this.state.selectedAnswer !== null) return;
            
            this.state.timer--;
            document.getElementById('timer').textContent = this.state.timer;
            
            // Изменяем цвет при малом времени
            const timerEl = document.getElementById('timer');
            timerEl.style.color = this.state.timer <= 10 ? '#ef4444' : 
                                 this.state.timer <= 20 ? '#f59e0b' : '#0f172a';
            
            this.state.gameTime++;
            
            if (this.state.timer <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }
    
    selectAnswer(index) {
        if (this.state.selectedAnswer !== null) return;
        
        console.log('Выбран ответ:', index);
        
        // Останавливаем таймер
        this.stopTimer();
        const timeRemaining = this.state.timer;
        
        this.state.selectedAnswer = index;
        const question = this.state.questions[this.state.currentQuestion];
        const isCorrect = index === question.correct;
        
        // Подсвечиваем ответы
        const answers = document.querySelectorAll('.answer');
        answers.forEach((btn, i) => {
            if (i === question.correct) {
                btn.classList.add('correct');
            } else if (i === index && !isCorrect) {
                btn.classList.add('incorrect');
            }
            
            if (i === index) {
                btn.classList.add('selected');
            }
            
            btn.disabled = true;
        });
        
        // Обновляем очки
        if (isCorrect) {
            this.handleCorrectAnswer(timeRemaining);
        } else {
            this.handleIncorrectAnswer();
        }
        
        // Следующий вопрос через 1.5 секунды
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    handleCorrectAnswer(timeRemaining) {
        // Базовые очки
        let points = 100;
        
        // Бонус за скорость
        const speedBonus = Math.floor(timeRemaining / 6) * 10;
        points += speedBonus;
        
        // Бонус за серию
        const streakBonus = Math.floor(this.state.streak / 3) * 50;
        points += streakBonus;
        
        // Увеличиваем серию
        this.state.streak++;
        this.state.totalCorrect++;
        
        if (this.state.streak > this.state.bestStreak) {
            this.state.bestStreak = this.state.streak;
        }
        
        // Обновляем общий счет
        this.state.score += points;
        
        // Обновляем счет текущего игрока
        const player = this.state.playerScores[this.state.currentPlayer];
        player.score += points;
        player.correct++;
        
        // Обновляем UI
        this.updateScoreUI();
        
        console.log(`+${points} очков! Серия: ${this.state.streak}`);
    }
    
    handleIncorrectAnswer() {
        // Сбрасываем серию
        this.state.streak = 0;
        
        // Штраф за неправильный ответ
        const penalty = 50;
        this.state.score = Math.max(0, this.state.score - penalty);
        
        const player = this.state.playerScores[this.state.currentPlayer];
        player.score = Math.max(0, player.score - penalty);
        
        this.updateScoreUI();
        
        console.log(`-${penalty} очков`);
    }
    
    updateScoreUI() {
        // Очки игроков
        this.state.playerScores.forEach((player, index) => {
            const playerEl = document.querySelector(`.player-score:nth-child(${index + 1}) .player-points`);
            if (playerEl) {
                playerEl.textContent = player.score;
            }
        });
    }
    
    useFiftyFifty() {
        if (this.state.fiftyFiftyUsed || this.state.selectedAnswer !== null) return;
        
        const question = this.state.questions[this.state.currentQuestion];
        const answers = document.querySelectorAll('.answer');
        const incorrectIndices = [];
        
        // Находим неправильные ответы
        for (let i = 0; i < answers.length; i++) {
            if (i !== question.correct) {
                incorrectIndices.push(i);
            }
        }
        
        // Выбираем 2 случайных неправильных ответа
        const toRemove = [];
        while (toRemove.length < 2 && incorrectIndices.length > 1) {
            const randomIndex = Math.floor(Math.random() * incorrectIndices.length);
            toRemove.push(incorrectIndices[randomIndex]);
            incorrectIndices.splice(randomIndex, 1);
        }
        
        // Убираем выбранные ответы
        toRemove.forEach(index => {
            answers[index].style.opacity = '0.3';
            answers[index].style.pointerEvents = 'none';
        });
        
        this.state.fiftyFiftyUsed = true;
        document.getElementById('fiftyFiftyBtn').disabled = true;
        
        console.log('Использована подсказка 50/50');
    }
    
    timeUp() {
        if (this.state.selectedAnswer !== null) return;
        
        this.stopTimer();
        this.handleIncorrectAnswer();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }
    
    nextQuestion() {
        // Останавливаем таймер
        this.stopTimer();
        
        this.state.currentQuestion++;
        
        // Переключаем игрока (если мультиплеер)
        if (this.state.players > 1) {
            this.state.currentPlayer = (this.state.currentPlayer + 1) % this.state.players;
            this.updateCurrentPlayer();
        }
        
        this.showQuestion();
    }
    
    updateCurrentPlayer() {
        const players = document.querySelectorAll('.player-score');
        players.forEach((player, index) => {
            player.classList.toggle('active', index === this.state.currentPlayer);
        });
    }
    
    // === ЗАВЕРШЕНИЕ ИГРЫ ===
    endGame() {
        console.log('Конец игры');
        this.stopTimer();
        this.state.gameStarted = false;
        this.state.selectedAnswer = null;
        
        // Показываем результаты
        this.showResults();
    }
    
    showResults() {
        console.log('Показ результатов');
        this.showScreen('resultsScreen');
        document.getElementById('gameSubtitle').textContent = 'Результаты';
        
        const accuracy = Math.round((this.state.totalCorrect / this.state.questions.length) * 100);
        
        // Обновляем результаты
        document.getElementById('finalScore').textContent = this.state.score;
        document.getElementById('correctCount').textContent = 
            `${this.state.totalCorrect}/${this.state.questions.length} (${accuracy}%)`;
        document.getElementById('bestStreak').textContent = this.state.bestStreak;
        document.getElementById('timeSpent').textContent = this.formatTime(this.state.gameTime);
        
        // Текст результата
        let resultText = '';
        if (accuracy === 100) {
            resultText = 'Идеально! Вы гений! 🧠';
        } else if (accuracy >= 80) {
            resultText = 'Отличный результат! 🎯';
        } else if (accuracy >= 60) {
            resultText = 'Хорошая игра! 👍';
        } else if (accuracy >= 40) {
            resultText = 'Неплохо, но можно лучше! 💪';
        } else {
            resultText = 'Есть куда расти! 📚';
        }
        
        document.getElementById('resultsText').textContent = resultText;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    restartGame() {
        console.log('Рестарт игры');
        
        // Сбрасываем состояние
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.totalCorrect = 0;
        this.state.gameTime = 0;
        this.state.currentPlayer = 0;
        this.state.selectedAnswer = null;
        this.state.fiftyFiftyUsed = false;
        
        // Сбрасываем очки игроков
        this.state.playerScores.forEach(p => {
            p.score = 0;
            p.correct = 0;
        });
        
        // Запускаем новую игру
        this.startGame();
    }
    
    exitGame() {
        console.log('Выход из игры');
        this.hideModal('exitModal');
        this.showMainScreen();
        this.state.gameStarted = false;
        document.getElementById('gameSubtitle').textContent = 'Проверьте знания';
    }
    
    showMainScreen() {
        console.log('Показ главного экрана');
        this.showScreen('mainScreen');
        document.getElementById('gameSubtitle').textContent = 'Проверьте знания';
    }
    
    // === УТИЛИТЫ ===
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(screenId).classList.add('active');
        document.getElementById(screenId).scrollTop = 0;
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

// Запуск игры
console.log('Загрузка игры...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    window.quizGame = new QuizGame();
    console.log('Игра готова');
});

// Простая проверка категорий
setTimeout(() => {
    console.log('=== ПРОВЕРКА КАТЕГОРИЙ ===');
    console.log('Все элементы .category-tag:', document.querySelectorAll('.category-tag').length);
    document.querySelectorAll('.category-tag').forEach(tag => {
        console.log(`Категория: ${tag.dataset.cat}, активна: ${tag.classList.contains('active')}`);
    });
}, 1000);
