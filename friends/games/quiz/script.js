class QuizGame {
    constructor() {
        // Состояние игры
        this.state = {
            // Настройки
            players: 1,
            difficulty: 'easy',
            categories: ['general'], // ТОЛЬКО ОДНА КАТЕГОРИЯ ПО УМОЛЧАНИЮ
            questionCount: 10,
            
            // Игровой процесс
            currentQuestion: 0,
            questions: [],
            selectedAnswer: null,
            timer: 30,
            timerInterval: null,
            gameStarted: false,
            gameTime: 0,
            gamePaused: false,
            
            // Очки
            score: 0,
            streak: 0,
            bestStreak: 0,
            totalCorrect: 0,
            
            // Мультиплеер
            playerScores: [],
            currentPlayer: 0,
            
            // Подсказки
            hintsUsed: 0,
            fiftyFiftyUsed: false,
            
            // Статистика
            stats: {
                totalGames: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                bestScore: 0,
                achievements: [],
                categoriesPlayed: new Set(),
                totalTime: 0
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadStats();
        this.bindEvents();
        this.updateQuestionCount();
        this.initPlayers();
        this.updateStatsUI();
    }
    
    bindEvents() {
        // Кнопка назад
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.state.gameStarted && !this.state.gamePaused) {
                this.showModal('exitModal');
            } else {
                window.location.href = '../../index.html';
            }
        });
        
        // Меню
        document.getElementById('menuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        document.addEventListener('click', () => {
            document.getElementById('dropdownMenu').classList.remove('active');
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
        
        // Категории
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const cat = e.target.closest('.category-tag').dataset.cat;
                this.toggleCategory(cat);
            });
        });
        
        // Слайдер вопросов
        const slider = document.getElementById('questionSlider');
        slider.addEventListener('input', (e) => {
            this.setQuestionCount(e.target.value);
        });
        slider.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Быстрый старт
        document.querySelector('.quick-start-btn').addEventListener('click', () => {
            this.showModal('quickStartModal');
        });
        
        document.querySelectorAll('.quick-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.closest('.quick-option').dataset.preset;
                this.applyPreset(preset);
                this.hideModal('quickStartModal');
                this.startGame();
            });
        });
        
        // Кнопка старта
        document.querySelector('.start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Правила
        document.getElementById('rulesBtn').addEventListener('click', () => {
            this.showModal('rulesModal');
        });
        
        document.getElementById('closeRules').addEventListener('click', () => {
            this.hideModal('rulesModal');
        });
        
        document.getElementById('closeQuickStart').addEventListener('click', () => {
            this.hideModal('quickStartModal');
        });
        
        // Достижения
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            this.showAchievements();
        });
        
        document.getElementById('closeAchievements').addEventListener('click', () => {
            this.hideModal('achievementsModal');
        });
        
        // Сброс статистики
        document.getElementById('resetStatsBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
                this.resetStats();
            }
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
        
        // Поделиться
        document.querySelector('.share-results').addEventListener('click', () => {
            this.shareResults();
        });
        
        // Обработка нажатий вне модалок
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    // === НАСТРОЙКИ ===
    setPlayers(count) {
        this.state.players = count;
        
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.players) === count);
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
        const isActive = tag.classList.contains('active');
        
        if (isActive) {
            // Если пытаемся отключить последнюю категорию - не позволяем
            if (this.state.categories.length === 1) {
                this.showToast('Должна быть выбрана хотя бы одна категория!', 'warning');
                return;
            }
            tag.classList.remove('active');
            this.state.categories = this.state.categories.filter(c => c !== cat);
        } else {
            tag.classList.add('active');
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
                this.setDifficulty('easy');
                this.setQuestionCount(10);
                break;
            case 'duel':
                this.setPlayers(2);
                this.setDifficulty('medium');
                this.setQuestionCount(15);
                break;
            case 'party':
                this.setPlayers(4);
                this.setDifficulty('easy');
                this.setQuestionCount(20);
                break;
        }
    }
    
    initPlayers() {
        this.state.playerScores = [];
        
        for (let i = 0; i < this.state.players; i++) {
            this.state.playerScores.push({
                id: i,
                name: `Игрок ${i + 1}`,
                score: 0,
                correct: 0,
                streak: 0,
                bestStreak: 0
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
        // Проверяем категории
        if (this.state.categories.length === 0) {
            this.showToast('Выберите хотя бы одну категорию!', 'warning');
            return;
        }
        
        // Генерируем вопросы
        this.generateQuestions();
        
        if (this.state.questions.length === 0) {
            this.showToast('Недостаточно вопросов для выбранных категорий!', 'danger');
            return;
        }
        
        // Сбрасываем состояние
        this.resetGameState();
        
        // Обновляем UI
        document.getElementById('fiftyFiftyBtn').disabled = false;
        
        // Показываем игровой экран
        this.showScreen('gameScreen');
        document.getElementById('gameSubtitle').textContent = 'Игра идет...';
        
        // Запускаем первый вопрос
        this.showQuestion();
    }
    
    resetGameState() {
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.totalCorrect = 0;
        this.state.gameTime = 0;
        this.state.currentPlayer = 0;
        this.state.gameStarted = true;
        this.state.gamePaused = false;
        this.state.selectedAnswer = null;
        this.state.hintsUsed = 0;
        this.state.fiftyFiftyUsed = false;
        
        // Сбрасываем очки игроков
        this.state.playerScores.forEach(p => {
            p.score = 0;
            p.correct = 0;
            p.streak = 0;
            p.bestStreak = 0;
        });
        
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
        document.getElementById('qCategory').textContent = CATEGORIES[question.category].name;
        
        let diffText = '';
        switch(this.state.difficulty) {
            case 'easy': diffText = 'Легко'; break;
            case 'medium': diffText = 'Средне'; break;
            case 'hard': diffText = 'Сложно'; break;
        }
        document.getElementById('qDifficulty').textContent = diffText;
        
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
        this.updateTimer();
        
        // Запускаем новый таймер
        this.state.timerInterval = setInterval(() => {
            // Если игра на паузе или ответ уже выбран - выходим
            if (this.state.gamePaused || this.state.selectedAnswer !== null) {
                return;
            }
            
            this.state.timer--;
            this.updateTimer();
            
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
    
    updateTimer() {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = this.state.timer;
        
        timerEl.classList.remove('warning', 'danger');
        if (this.state.timer <= 10) {
            timerEl.classList.add('danger');
        } else if (this.state.timer <= 20) {
            timerEl.classList.add('warning');
        }
    }
    
    selectAnswer(index) {
        if (this.state.selectedAnswer !== null || this.state.gamePaused) return;
        
        // Останавливаем таймер и записываем оставшееся время
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
        
        // Обновляем очки с учетом оставшегося времени
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
        
        // Бонус за скорость (до 50 очков)
        const speedBonus = Math.floor(timeRemaining / 6) * 10;
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
        player.streak++;
        
        if (player.streak > player.bestStreak) {
            player.bestStreak = player.streak;
        }
        
        // Обновляем UI
        this.updateScoreUI();
        
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
        player.streak = 0;
        
        this.updateScoreUI();
    }
    
    useFiftyFifty() {
        if (this.state.fiftyFiftyUsed || this.state.selectedAnswer !== null || this.state.gamePaused) return;
        
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
        this.state.hintsUsed++;
        document.getElementById('fiftyFiftyBtn').disabled = true;
    }
    
    timeUp() {
        if (this.state.selectedAnswer !== null || this.state.gamePaused) return;
        
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
    
    updateScoreUI() {
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
        this.state.selectedAnswer = null;
        
        // Обновляем статистику
        this.updateStats();
        
        // Проверяем достижения
        this.checkAchievements();
        
        // Сохраняем статистику
        this.saveStats();
        
        // Показываем результаты
        this.showResults();
    }
    
    updateStats() {
        this.state.stats.totalQuestions += this.state.questions.length;
        this.state.stats.totalCorrect += this.state.totalCorrect;
        this.state.stats.totalTime += this.state.gameTime;
        
        if (this.state.score > this.state.stats.bestScore) {
            this.state.stats.bestScore = this.state.score;
        }
        
        // Обновляем сыгранные категории
        this.state.categories.forEach(cat => {
            this.state.stats.categoriesPlayed.add(cat);
        });
        
        // Проверяем достижение "все категории"
        if (this.state.stats.categoriesPlayed.size === Object.keys(CATEGORIES).length) {
            this.unlockAchievement('all_categories');
        }
    }
    
    checkAchievements() {
        // Первая игра
        if (this.state.stats.totalGames === 1) {
            this.unlockAchievement('first_game');
        }
        
        // Идеальный результат
        if (this.state.totalCorrect === this.state.questions.length && this.state.questions.length >= 10) {
            this.unlockAchievement('perfect_score');
        }
        
        // Скоростная игра
        const minutes = this.state.gameTime / 60;
        if (minutes < 5 && this.state.questions.length >= 10) {
            this.unlockAchievement('speed_run');
        }
    }
    
    unlockAchievement(achievementId) {
        if (this.state.stats.achievements.includes(achievementId)) return;
        
        this.state.stats.achievements.push(achievementId);
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        
        if (achievement) {
            this.showToast(`Достижение: ${achievement.name}!`, 'success');
        }
    }
    
    showResults() {
        this.showScreen('resultsScreen');
        document.getElementById('gameSubtitle').textContent = 'Результаты';
        
        const accuracy = this.state.questions.length > 0 
            ? Math.round((this.state.totalCorrect / this.state.questions.length) * 100)
            : 0;
        
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
        
        // Показываем победителя для мультиплеера
        if (this.state.players > 1) {
            const winner = this.state.playerScores.reduce((a, b) => a.score > b.score ? a : b);
            const winnerCard = document.getElementById('winnerCard');
            document.getElementById('winnerName').textContent = winner.name;
            document.getElementById('winnerScore').textContent = `${winner.score} очков`;
            winnerCard.style.display = 'block';
        }
    }
    
    restartGame() {
        // Сбрасываем состояние
        this.resetGameState();
        
        // Запускаем новую игру
        this.startGame();
    }
    
    exitGame() {
        this.hideModal('exitModal');
        this.showMainScreen();
        this.state.gameStarted = false;
        document.getElementById('gameSubtitle').textContent = 'Проверьте знания';
    }
    
    showMainScreen() {
        this.showScreen('mainScreen');
        this.updateStatsUI();
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
        if (this.state.gameStarted && !this.state.gamePaused) {
            this.state.gamePaused = true;
            this.stopTimer();
        }
        
        document.getElementById(modalId).classList.add('active');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        
        if (this.state.gameStarted && this.state.gamePaused) {
            this.state.gamePaused = false;
            if (this.state.timer > 0 && !this.state.selectedAnswer) {
                this.startTimer();
            }
        }
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        if (this.state.gameStarted && this.state.gamePaused) {
            this.state.gamePaused = false;
            if (this.state.timer > 0 && !this.state.selectedAnswer) {
                this.startTimer();
            }
        }
    }
    
    toggleDropdown() {
        const menu = document.getElementById('dropdownMenu');
        menu.classList.toggle('active');
    }
    
    showToast(message, type = 'info') {
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    showAchievements() {
        this.showModal('achievementsModal');
        
        const container = document.getElementById('achievementsList');
        container.innerHTML = '';
        
        ACHIEVEMENTS.forEach(achievement => {
            const isUnlocked = this.state.stats.achievements.includes(achievement.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            item.innerHTML = `
                <i class="${achievement.icon}"></i>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            container.appendChild(item);
        });
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    shareResults() {
        const accuracy = this.state.questions.length > 0 
            ? Math.round((this.state.totalCorrect / this.state.questions.length) * 100)
            : 0;
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
    
    // === СТАТИСТИКА ===
    updateStatsUI() {
        document.getElementById('totalGames').textContent = this.state.stats.totalGames;
        document.getElementById('bestScore').textContent = this.state.stats.bestScore;
        
        const accuracy = this.state.stats.totalQuestions > 0 
            ? Math.round((this.state.stats.totalCorrect / this.state.stats.totalQuestions) * 100)
            : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }
    
    saveStats() {
        const statsToSave = {
            ...this.state.stats,
            categoriesPlayed: Array.from(this.state.stats.categoriesPlayed)
        };
        
        localStorage.setItem('quizStats', JSON.stringify(statsToSave));
        this.saveSettings();
    }
    
    saveSettings() {
        const settings = {
            players: this.state.players,
            difficulty: this.state.difficulty,
            categories: this.state.categories,
            questionCount: this.state.questionCount
        };
        localStorage.setItem('quizSettings', JSON.stringify(settings));
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('quizStats');
        if (savedStats) {
            const parsed = JSON.parse(savedStats);
            this.state.stats = {
                ...parsed,
                categoriesPlayed: new Set(parsed.categoriesPlayed || [])
            };
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
    
    resetStats() {
        if (confirm('Вы уверены, что хотите сбросить всю статистику и достижения?')) {
            this.state.stats = {
                totalGames: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                bestScore: 0,
                achievements: [],
                categoriesPlayed: new Set(),
                totalTime: 0
            };
            
            localStorage.removeItem('quizStats');
            this.updateStatsUI();
            this.showToast('Статистика сброшена', 'info');
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.quizGame = new QuizGame();
});
