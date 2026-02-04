class QuizGame {
    constructor() {
        // Состояние игры
        this.state = {
            // Настройки
            players: 1,
            difficulty: 'easy',
            categories: ['general', 'science', 'history', 'culture', 'sport', 'geography', 'movies'],
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
            
            // Статистика
            stats: {
                totalGames: 0,
                totalCorrect: 0,
                bestScore: 0,
                achievements: []
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadStats();
        this.bindEvents();
        this.updateQuestionCount();
        this.initPlayers();
    }
    
    bindEvents() {
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
        
        // Категории
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const cat = e.target.closest('.category-tag').dataset.cat;
                this.toggleCategory(cat);
            });
        });
        
        // Слайдер вопросов
        document.getElementById('questionSlider').addEventListener('input', (e) => {
            this.setQuestionCount(e.target.value);
        });
        
        // Быстрый старт
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.closest('.quick-btn').dataset.preset;
                this.applyPreset(preset);
            });
        });
        
        // Кнопка старта
        document.querySelector('.start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Правила
        document.querySelector('.show-rules').addEventListener('click', () => {
            this.showModal('rulesModal');
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal('rulesModal');
        });
        
        // Ответы
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer')) {
                const index = parseInt(e.target.dataset.index);
                this.selectAnswer(index);
            }
        });
        
        // Пропустить
        document.getElementById('skipBtn').addEventListener('click', () => {
            this.skipQuestion();
        });
        
        // Подсказка
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        
        // Рестарт
        document.querySelector('.play-again').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Новые настройки
        document.querySelector('.change-settings').addEventListener('click', () => {
            this.showScreen('mainScreen');
        });
        
        // Поделиться
        document.querySelector('.share-results').addEventListener('click', () => {
            this.shareResults();
        });
        
        // Обработка нажатий вне модалки
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }
    
    // === НАСТРОЙКИ ===
    setPlayers(count) {
        this.state.players = count;
        
        // Обновляем UI
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.classList.toggle('active', 
                parseInt(btn.dataset.players) === count
            );
        });
        
        this.initPlayers();
    }
    
    setDifficulty(diff) {
        this.state.difficulty = diff;
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
    }
    
    toggleCategory(cat) {
        const tag = document.querySelector(`[data-cat="${cat}"]`);
        tag.classList.toggle('active');
        
        if (this.state.categories.includes(cat)) {
            this.state.categories = this.state.categories.filter(c => c !== cat);
        } else {
            this.state.categories.push(cat);
        }
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
    
    applyPreset(preset) {
        switch(preset) {
            case 'solo':
                this.setPlayers(1);
                this.setDifficulty('medium');
                this.setQuestionCount(10);
                break;
            case 'duel':
                this.setPlayers(2);
                this.setDifficulty('hard');
                this.setQuestionCount(15);
                break;
            case 'party':
                this.setPlayers(4);
                this.setDifficulty('easy');
                this.setQuestionCount(20);
                break;
        }
        this.startGame();
    }
    
    initPlayers() {
        this.state.playerScores = [];
        
        for (let i = 0; i < this.state.players; i++) {
            this.state.playerScores.push({
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
            
            // Редактирование имени
            playerEl.addEventListener('click', () => {
                if (!this.state.gameStarted) {
                    const newName = prompt('Имя игрока:', player.name);
                    if (newName && newName.trim()) {
                        this.state.playerScores[index].name = newName.trim();
                        this.updatePlayersUI();
                    }
                }
            });
            
            container.appendChild(playerEl);
        });
    }
    
    // === ИГРОВОЙ ПРОЦЕСС ===
    startGame() {
        // Проверяем, что выбрана хотя бы одна категория
        if (this.state.categories.length === 0) {
            this.showToast('Выберите хотя бы одну категорию!', 'warning');
            return;
        }
        
        // Генерируем вопросы
        this.generateQuestions();
        
        // Сбрасываем состояние
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.totalCorrect = 0;
        this.state.gameTime = 0;
        this.state.currentPlayer = 0;
        this.state.gameStarted = true;
        
        // Сбрасываем очки игроков
        this.state.playerScores.forEach(p => {
            p.score = 0;
            p.correct = 0;
        });
        
        // Показываем игровой экран
        this.showScreen('gameScreen');
        
        // Запускаем первый вопрос
        this.showQuestion();
        
        // Обновляем статистику
        this.state.stats.totalGames++;
    }
    
    generateQuestions() {
        let allQuestions = [];
        
        // Собираем вопросы по выбранным категориям и сложности
        this.state.categories.forEach(cat => {
            const catQuestions = QUIZ_DATABASE[this.state.difficulty].filter(q => q.category === cat);
            allQuestions = allQuestions.concat(catQuestions);
        });
        
        // Перемешиваем
        allQuestions = this.shuffleArray(allQuestions);
        
        // Берем нужное количество
        this.state.questions = allQuestions.slice(0, this.state.questionCount);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    showQuestion() {
        if (this.state.currentQuestion >= this.state.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.state.questions[this.state.currentQuestion];
        
        // Обновляем UI
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('qCategory').textContent = CATEGORY_NAMES[question.category];
        document.getElementById('qDifficulty').textContent = 
            this.state.difficulty === 'easy' ? 'Легко' :
            this.state.difficulty === 'medium' ? 'Средне' : 'Сложно';
        
        // Прогресс
        const progress = ((this.state.currentQuestion) / this.state.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentQ').textContent = this.state.currentQuestion + 1;
        document.getElementById('totalQ').textContent = this.state.questions.length;
        
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
        this.state.timer = 30;
        this.updateTimer();
        
        this.state.timerInterval = setInterval(() => {
            this.state.timer--;
            this.updateTimer();
            
            if (this.state.timer <= 0) {
                this.timeUp();
            }
            
            this.state.gameTime++;
        }, 1000);
    }
    
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }
    
    updateTimer() {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = this.state.timer;
        
        // Меняем цвет при низком времени
        timerEl.classList.remove('warning', 'danger');
        if (this.state.timer <= 10) {
            timerEl.classList.add('danger');
        } else if (this.state.timer <= 20) {
            timerEl.classList.add('warning');
        }
    }
    
    selectAnswer(index) {
        if (this.state.selectedAnswer !== null) return;
        
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
        
        // Останавливаем таймер
        this.stopTimer();
        
        // Обновляем очки
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        // Следующий вопрос через 1.5 секунды
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    handleCorrectAnswer() {
        // Базовые очки
        let points = 100;
        
        // Бонус за скорость (до 50 очков)
        const speedBonus = Math.floor(this.state.timer / 6) * 10;
        points += speedBonus;
        
        // Бонус за серию (каждые 3 правильных ответа +50)
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
        this.showToast(`+${points} очков!`, 'success');
        
        // Проверяем достижения
        if (this.state.streak === 10) {
            this.unlockAchievement('streak_10');
        }
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
        this.showToast(`-${penalty} очков`, 'danger');
    }
    
    skipQuestion() {
        this.state.streak = 0;
        this.nextQuestion();
        this.showToast('Вопрос пропущен', 'warning');
    }
    
    showHint() {
        const question = this.state.questions[this.state.currentQuestion];
        const correctAnswer = question.answers[question.correct];
        
        // Показываем первую букву
        const hint = correctAnswer.charAt(0) + '...';
        
        // Штраф за подсказку
        const penalty = 25;
        this.state.score = Math.max(0, this.state.score - penalty);
        
        const player = this.state.playerScores[this.state.currentPlayer];
        player.score = Math.max(0, player.score - penalty);
        
        this.updateScoreUI();
        this.showToast(`Подсказка: ${hint} (-${penalty} очков)`, 'info');
    }
    
    timeUp() {
        if (this.state.selectedAnswer !== null) return;
        
        this.stopTimer();
        this.handleIncorrectAnswer();
        
        // Автоматически переходим дальше
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    }
    
    nextQuestion() {
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
    
    updateScoreUI() {
        // Общий счет
        document.getElementById('totalScore').textContent = this.state.score;
        
        // Очки игроков
        this.state.playerScores.forEach((player, index) => {
            const playerEl = document.querySelector(`.player-score:nth-child(${index + 1}) .player-points`);
            if (playerEl) {
                playerEl.textContent = player.score;
            }
        });
    }
    
    // === ЗАВЕРШЕНИЕ ИГРЫ ===
    endGame() {
        this.stopTimer();
        this.state.gameStarted = false;
        
        // Обновляем статистику
        this.state.stats.totalCorrect += this.state.totalCorrect;
        
        if (this.state.score > this.state.stats.bestScore) {
            this.state.stats.bestScore = this.state.score;
            this.unlockAchievement('high_score');
        }
        
        // Проверяем достижения
        if (this.state.totalCorrect === this.state.questions.length) {
            this.unlockAchievement('perfect_score');
        }
        
        if (this.state.gameTime < 300) { // Меньше 5 минут
            this.unlockAchievement('speed_run');
        }
        
        this.saveStats();
        
        // Показываем результаты
        this.showResults();
    }
    
    showResults() {
        this.showScreen('resultsScreen');
        
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
        
        // Если мультиплеер, показываем победителя
        if (this.state.players > 1) {
            const winner = this.state.playerScores.reduce((a, b) => 
                a.score > b.score ? a : b
            );
            
            this.showToast(`Победитель: ${winner.name} с ${winner.score} очками!`, 'success');
        }
    }
    
    restartGame() {
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.totalCorrect = 0;
        this.state.gameTime = 0;
        this.state.currentPlayer = 0;
        this.state.selectedAnswer = null;
        
        // Сбрасываем очки игроков
        this.state.playerScores.forEach(p => {
            p.score = 0;
            p.correct = 0;
        });
        
        this.startGame();
    }
    
    // === УТИЛИТЫ ===
    showScreen(screenId) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        document.getElementById(screenId).classList.add('active');
        
        // Прокручиваем вверх
        document.getElementById(screenId).scrollTop = 0;
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    showToast(message, type = 'info') {
        // Удаляем старые тосты
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();
        
        // Создаем новый
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Цвета по типу
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        };
        
        toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
        
        document.body.appendChild(toast);
        
        // Автоматическое удаление
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    unlockAchievement(achievementId) {
        if (this.state.stats.achievements.includes(achievementId)) return;
        
        this.state.stats.achievements.push(achievementId);
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        
        if (achievement) {
            this.showToast(`Достижение: ${achievement.name}!`, 'success');
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    shareResults() {
        const accuracy = Math.round((this.state.totalCorrect / this.state.questions.length) * 100);
        const time = this.formatTime(this.state.gameTime);
        
        let shareText = `🎯 Я набрал ${this.state.score} очков в LoveCouple Викторине!\n`;
        shareText += `Правильных ответов: ${this.state.totalCorrect}/${this.state.questions.length} (${accuracy}%)\n`;
        shareText += `Лучшая серия: ${this.state.bestStreak}\n`;
        shareText += `Время: ${time}\n\n`;
        shareText += `Попробуйте и вы: https://lovecouple.ru/friends/`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Мои результаты в LoveCouple Викторине',
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Результаты скопированы!', 'success');
        });
    }
    
    // === СОХРАНЕНИЕ ===
    saveStats() {
        localStorage.setItem('quizStats', JSON.stringify(this.state.stats));
        localStorage.setItem('quizSettings', JSON.stringify({
            players: this.state.players,
            difficulty: this.state.difficulty,
            categories: this.state.categories,
            questionCount: this.state.questionCount
        }));
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('quizStats');
        if (savedStats) {
            this.state.stats = JSON.parse(savedStats);
        }
        
        const savedSettings = localStorage.getItem('quizSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.state.players = settings.players || 1;
            this.state.difficulty = settings.difficulty || 'easy';
            this.state.categories = settings.categories || ['general'];
            this.state.questionCount = settings.questionCount || 10;
            
            // Обновляем UI настроек
            this.setPlayers(this.state.players);
            this.setDifficulty(this.state.difficulty);
            this.setQuestionCount(this.state.questionCount);
            
            // Категории
            document.querySelectorAll('.category-tag').forEach(tag => {
                const cat = tag.dataset.cat;
                tag.classList.toggle('active', this.state.categories.includes(cat));
            });
        }
    }
}

// Инициализация игры при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.game = new QuizGame();
});

// Предотвращаем стандартное поведение свайпа в браузере
document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Фиксим баг с 100vh на мобильных
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
