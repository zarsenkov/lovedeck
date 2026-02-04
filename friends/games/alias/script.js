// games/alias/script.js

class AliasGame {
    constructor() {
        this.teams = [];
        this.currentTeam = 0;
        this.currentPlayer = 0;
        this.words = [];
        this.usedWords = new Set();
        this.currentWordIndex = 0;
        this.timer = null;
        this.timeLeft = 60;
        this.gameStarted = false;
        this.roundActive = false;
        this.stats = this.loadStats();
        
        // Настройки по умолчанию
        this.settings = {
            teamCount: 2,
            timePerRound: 60,
            difficulty: 'medium',
            themes: ['all'],
            skipLimit: 3,
            oneWordRule: false,
            englishWords: false
        };
        
        this.currentRound = {
            words: [],
            guessed: [],
            skipped: [],
            wrong: [],
            skipsUsed: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.bindEvents();
        this.generateWords();
        this.renderTeams();
        this.updateDisplay();
        
        // Инициализация PWA
        this.initPWA();
        
        // Сохраняем контекст для обработчиков событий
        this.handleKeyPress = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.handleKeyPress);
    }
    
    initPWA() {
        // Проверка PWA и добавление индикатора мобильной версии
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone ||
            document.referrer.includes('android-app://')) {
            document.body.classList.add('pwa-mode');
        }
        
        // Добавляем класс для мобильных устройств
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            document.body.classList.add('touch-device');
        }
        
        // Определение типа устройства
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
            
            // Автоматические настройки для мобильных
            if (!localStorage.getItem('aliasMobileSettingsSet')) {
                this.settings.timePerRound = 90; // Больше времени на мобильных
                this.saveSettings();
                localStorage.setItem('aliasMobileSettingsSet', 'true');
            }
        }
    }
    
    loadSettings() {
        const saved = localStorage.getItem('aliasSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // Применяем настройки к UI
        this.updateSettingsUI();
    }
    
    saveSettings() {
        localStorage.setItem('aliasSettings', JSON.stringify(this.settings));
    }
    
    updateSettingsUI() {
        // Устанавливаем активные кнопки
        document.querySelectorAll('.team-count-selector .count-btn').forEach(btn => {
            btn.classList.toggle('active', 
                parseInt(btn.dataset.count) === this.settings.teamCount);
        });
        
        document.querySelectorAll('.time-selector .time-btn').forEach(btn => {
            btn.classList.toggle('active', 
                parseInt(btn.dataset.time) === this.settings.timePerRound);
        });
        
        document.querySelectorAll('.difficulty-selector .diff-btn').forEach(btn => {
            btn.classList.toggle('active', 
                btn.dataset.diff === this.settings.difficulty);
        });
        
        // Устанавливаем темы с улучшенным стилем
        const themeSelect = document.getElementById('themeSelect');
        Array.from(themeSelect.options).forEach(option => {
            option.selected = this.settings.themes.includes(option.value);
            
            // Добавляем классы для стилизации
            if (option.value === 'all') {
                option.className = 'theme-option theme-all';
            } else if (option.value === 'Кино и сериалы') {
                option.className = 'theme-option theme-movies';
            } else if (option.value === 'Еда и напитки') {
                option.className = 'theme-option theme-food';
            } else if (option.value === 'Путешествия') {
                option.className = 'theme-option theme-travel';
            } else if (option.value === 'IT и технологии') {
                option.className = 'theme-option theme-tech';
            } else if (option.value === 'Спорт и активность') {
                option.className = 'theme-option theme-sport';
            }
        });
        
        // Устанавливаем чекбоксы
        document.getElementById('skipLimit').checked = this.settings.skipLimit > 0;
        document.getElementById('oneWordRule').checked = this.settings.oneWordRule;
        document.getElementById('englishWords').checked = this.settings.englishWords;
    }
    
    bindEvents() {
        // Кнопки настроек
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.teamCount = parseInt(btn.dataset.count);
                this.updateSettingsUI();
                this.generateTeams();
                this.saveSettings();
            });
        });
        
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.timePerRound = parseInt(btn.dataset.time);
                this.saveSettings();
            });
        });
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.difficulty = btn.dataset.diff;
                this.generateWords();
                this.saveSettings();
            });
        });
        
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.settings.themes = selected;
            this.generateWords();
            this.saveSettings();
        });
        
        // Чекбоксы
        document.getElementById('skipLimit').addEventListener('change', (e) => {
            this.settings.skipLimit = e.target.checked ? 3 : 0;
            this.saveSettings();
        });
        
        document.getElementById('oneWordRule').addEventListener('change', (e) => {
            this.settings.oneWordRule = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('englishWords').addEventListener('change', (e) => {
            this.settings.englishWords = e.target.checked;
            this.generateWords();
            this.saveSettings();
        });
        
        // Обработчики свайпов для мобильных
        this.setupSwipeGestures();
    }
    
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (!this.roundActive || !document.body.classList.contains('mobile-device')) return;
            
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!this.roundActive || !document.body.classList.contains('mobile-device')) return;
            
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Минимальная дистанция свайпа
            if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) return;
            
            // Горизонтальный свайп (лево/право)
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    // Свайп вправо - угадали
                    this.correctWord();
                    this.showSwipeFeedback('right');
                } else {
                    // Свайп влево - пропустить
                    this.skipWord();
                    this.showSwipeFeedback('left');
                }
            }
        });
    }
    
    showSwipeFeedback(direction) {
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback swipe-${direction}`;
        feedback.innerHTML = direction === 'right' ? 
            '<i class="fas fa-check"></i>' : 
            '<i class="fas fa-forward"></i>';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 500);
    }
    
    generateTeams() {
        this.teams = [];
        const teamColors = ['team-1', 'team-2', 'team-3', 'team-4'];
        const teamNames = ['Команда 1', 'Команда 2', 'Команда 3', 'Команда 4'];
        
        for (let i = 0; i < this.settings.teamCount; i++) {
            this.teams.push({
                id: i + 1,
                name: teamNames[i],
                color: teamColors[i],
                score: 0,
                totalWords: 0,
                roundsWon: 0
            });
        }
        
        this.renderTeams();
    }
    
    renderTeams() {
        if (!this.teams.length) {
            this.generateTeams();
        }
        
        const scoresContainer = document.getElementById('teamsScores');
        const resultsContainer = document.getElementById('teamsResultsList');
        
        scoresContainer.innerHTML = '';
        resultsContainer.innerHTML = '';
        
        this.teams.forEach(team => {
            // Для экрана игры
            const scoreElement = document.createElement('div');
            scoreElement.className = `team-score ${team.color}`;
            scoreElement.innerHTML = `
                <span class="team-name">${team.name}</span>
                <span class="team-points">${team.score} очков</span>
            `;
            scoresContainer.appendChild(scoreElement);
            
            // Для экрана результатов
            const resultElement = document.createElement('div');
            resultElement.className = `team-result ${team.color}`;
            resultElement.innerHTML = `
                <div class="team-result-info">
                    <span class="team-result-name">${team.name}</span>
                    <span class="team-result-score">${team.score} очков</span>
                </div>
            `;
            resultsContainer.appendChild(resultElement);
        });
    }
    
    generateWords() {
        let words = [];
        
        // Выбираем слова в зависимости от сложности
        if (this.settings.difficulty === 'mix') {
            words = [
                ...ALIAS_WORDS.easy.slice(0, 20),
                ...ALIAS_WORDS.medium.slice(0, 20),
                ...ALIAS_WORDS.hard.slice(0, 20)
            ];
        } else {
            words = [...ALIAS_WORDS[this.settings.difficulty]];
        }
        
        // Добавляем тематические слова
        if (!this.settings.themes.includes('all')) {
            let themeWords = [];
            this.settings.themes.forEach(theme => {
                if (ALIAS_WORDS.themes[theme]) {
                    themeWords = [...themeWords, ...ALIAS_WORDS.themes[theme]];
                }
            });
            
            if (themeWords.length > 0) {
                // Смешиваем 60% тематических и 40% обычных
                const themeCount = Math.min(Math.floor(words.length * 0.6), themeWords.length);
                const regularCount = words.length - themeCount;
                
                const selectedThemeWords = this.getRandomItems(themeWords, themeCount);
                const selectedRegularWords = this.getRandomItems(words, regularCount);
                
                words = [...selectedThemeWords, ...selectedRegularWords];
            }
        }
        
        // Добавляем английские слова если нужно
        if (this.settings.englishWords) {
            const englishWords = [
                'Computer', 'Phone', 'Table', 'Chair', 'Window', 'Door',
                'Book', 'Pen', 'Paper', 'Water', 'Food', 'House', 'Car',
                'Tree', 'Flower', 'Sun', 'Moon', 'Star', 'Cloud', 'Rain'
            ];
            words = [...words, ...englishWords];
        }
        
        // Перемешиваем слова
        this.words = this.shuffleArray([...words]);
        this.usedWords.clear();
        this.currentWordIndex = 0;
    }
    
    getRandomItems(array, count) {
        const shuffled = this.shuffleArray([...array]);
        return shuffled.slice(0, count);
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    getNextWord() {
        if (this.currentWordIndex >= this.words.length) {
            this.generateWords(); // Перегенерируем если слова закончились
        }
        
        let word;
        do {
            word = this.words[this.currentWordIndex];
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
        } while (this.usedWords.has(word) && this.usedWords.size < this.words.length * 0.8);
        
        this.usedWords.add(word);
        this.currentRound.words.push(word);
        
        return word;
    }
    
    startGame() {
        this.gameStarted = true;
        this.generateTeams();
        this.generateWords();
        this.showScreen('gameScreen');
        this.startRound();
    }
    
    startRound() {
        this.roundActive = true;
        this.currentRound = {
            words: [],
            guessed: [],
            skipped: [],
            wrong: [],
            skipsUsed: 0
        };
        
        this.timeLeft = this.settings.timePerRound;
        this.updateTimerDisplay();
        
        // Показываем первое слово
        this.showNextWord();
        
        // Запускаем таймер
        this.startTimer();
        
        // Обновляем интерфейс
        this.updateCurrentTeamDisplay();
        this.updateCounters();
        
        // Вибрация для мобильных (если разрешено)
        if (navigator.vibrate && document.body.classList.contains('mobile-device')) {
            navigator.vibrate(100);
        }
    }
    
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            // Вибрация при низком времени
            if (this.timeLeft === 10 && navigator.vibrate) {
                navigator.vibrate(200);
            }
            
            if (this.timeLeft === 5 && navigator.vibrate) {
                navigator.vibrate([100, 100, 100]);
            }
            
            if (this.timeLeft <= 0) {
                this.endRound();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const progressFill = document.getElementById('progressFill');
        
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
            
            // Меняем цвет при низком времени
            if (this.timeLeft <= 10) {
                timerElement.classList.add('warning');
                timerElement.classList.add('pulse');
            } else {
                timerElement.classList.remove('warning');
                timerElement.classList.remove('pulse');
            }
            
            // Обновляем прогресс-бар
            if (progressFill) {
                const percent = (this.timeLeft / this.settings.timePerRound) * 100;
                progressFill.style.width = `${percent}%`;
                
                // Меняем цвет прогресс-бара
                if (this.timeLeft <= 10) {
                    progressFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
                } else if (this.timeLeft <= 30) {
                    progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
                } else {
                    progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
                }
            }
        }
    }
    
    showNextWord() {
        if (!this.roundActive) return;
        
        const word = this.getNextWord();
        const wordDisplay = document.getElementById('currentWord');
        
        // Анимация смены слова
        wordDisplay.style.opacity = '0';
        wordDisplay.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            wordDisplay.textContent = word;
            wordDisplay.style.opacity = '1';
            wordDisplay.style.transform = 'translateY(0)';
        }, 150);
        
        this.updateCounters();
    }
    
    correctWord() {
        if (!this.roundActive) return;
        
        const currentWord = document.getElementById('currentWord').textContent;
        this.currentRound.guessed.push(currentWord);
        this.teams[this.currentTeam].score++;
        this.teams[this.currentTeam].totalWords++;
        
        this.updateCounters();
        this.showNextWord();
        
        // Анимация угадывания
        this.showWordFeedback('correct');
        
        // Вибрация для мобильных
        if (navigator.vibrate && document.body.classList.contains('mobile-device')) {
            navigator.vibrate(50);
        }
    }
    
    skipWord() {
        if (!this.roundActive) return;
        
        // Проверяем лимит пропусков
        if (this.settings.skipLimit > 0 && 
            this.currentRound.skipsUsed >= this.settings.skipLimit) {
            this.showNotification('Лимит пропусков исчерпан!', 'warning');
            
            // Вибрация для уведомления
            if (navigator.vibrate) {
                navigator.vibrate([100, 100, 100]);
            }
            return;
        }
        
        const currentWord = document.getElementById('currentWord').textContent;
        this.currentRound.skipped.push(currentWord);
        this.currentRound.skipsUsed++;
        
        this.updateCounters();
        this.showNextWord();
        
        this.showWordFeedback('skipped');
        
        // Вибрация для мобильных
        if (navigator.vibrate && document.body.classList.contains('mobile-device')) {
            navigator.vibrate(100);
        }
    }
    
    wrongWord() {
        if (!this.roundActive) return;
        
        const currentWord = document.getElementById('currentWord').textContent;
        this.currentRound.wrong.push(currentWord);
        
        // Штраф за ошибку (по желанию можно изменить)
        if (this.teams[this.currentTeam].score > 0) {
            this.teams[this.currentTeam].score--;
        }
        
        this.updateCounters();
        this.showNextWord();
        
        this.showWordFeedback('wrong');
        
        // Вибрация для мобильных
        if (navigator.vibrate && document.body.classList.contains('mobile-device')) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    showWordFeedback(type) {
        const wordDisplay = document.getElementById('currentWord');
        const originalText = wordDisplay.textContent;
        
        // Добавляем класс для анимации
        wordDisplay.classList.remove('correct', 'skipped', 'wrong');
        wordDisplay.classList.add(type);
        
        // Создаем плавающий feedback
        this.createFloatingFeedback(type);
        
        // Через короткое время убираем класс
        setTimeout(() => {
            wordDisplay.classList.remove(type);
        }, 300);
    }
    
    createFloatingFeedback(type) {
        const feedback = document.createElement('div');
        feedback.className = `floating-feedback ${type}`;
        
        let icon, text;
        switch(type) {
            case 'correct':
                icon = '✓';
                text = '+1 очко';
                break;
            case 'skipped':
                icon = '→';
                text = 'Пропущено';
                break;
            case 'wrong':
                icon = '✗';
                text = '-1 очко';
                break;
        }
        
        feedback.innerHTML = `<span class="feedback-icon">${icon}</span><span class="feedback-text">${text}</span>`;
        
        // Позиционируем относительно слова
        const wordDisplay = document.getElementById('currentWord');
        const rect = wordDisplay.getBoundingClientRect();
        
        feedback.style.position = 'fixed';
        feedback.style.left = `${rect.left + rect.width/2}px`;
        feedback.style.top = `${rect.top}px`;
        feedback.style.transform = 'translate(-50%, -100%)';
        
        document.body.appendChild(feedback);
        
        // Анимация
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translate(-50%, -150%)';
            feedback.style.transition = 'all 0.5s ease';
        }, 100);
        
        // Удаляем через секунду
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }
    
    endRound() {
        this.roundActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Сохраняем статистику
        this.saveRoundStats();
        
        // Вибрация для завершения раунда
        if (navigator.vibrate && document.body.classList.contains('mobile-device')) {
            navigator.vibrate([300, 100, 300]);
        }
        
        // Показываем экран результатов
        this.showResultsScreen();
    }
    
    showResultsScreen() {
        this.showScreen('resultsScreen');
        
        // Обновляем статистику раунда
        document.getElementById('wordsGuessed').textContent = this.currentRound.guessed.length;
        document.getElementById('wordsSkipped').textContent = this.currentRound.skipped.length;
        document.getElementById('pointsEarned').textContent = 
            this.currentRound.guessed.length - this.currentRound.wrong.length;
        document.getElementById('mistakesMade').textContent = this.currentRound.wrong.length;
        
        // Показываем слова раунда
        const wordsList = document.getElementById('roundWordsList');
        wordsList.innerHTML = '';
        
        this.currentRound.words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-result-item';
            
            let statusClass = '';
            let statusIcon = '';
            
            if (this.currentRound.guessed.includes(word)) {
                statusClass = 'guessed';
                statusIcon = '<i class="fas fa-check-circle"></i>';
            } else if (this.currentRound.skipped.includes(word)) {
                statusClass = 'skipped';
                statusIcon = '<i class="fas fa-forward"></i>';
            } else {
                statusClass = 'wrong';
                statusIcon = '<i class="fas fa-times-circle"></i>';
            }
            
            wordElement.innerHTML = `
                <span class="word-result-text">${word}</span>
                <span class="word-result-status ${statusClass}">${statusIcon}</span>
            `;
            
            wordsList.appendChild(wordElement);
        });
        
        // Обновляем счет команд
        this.renderTeams();
    }
    
    nextRound() {
        // Переходим к следующей команде
        this.currentTeam = (this.currentTeam + 1) % this.teams.length;
        this.currentPlayer = (this.currentPlayer + 1) % 2; // Простая ротация игроков
        
        // Начинаем новый раунд
        this.showScreen('gameScreen');
        this.startRound();
    }
    
    newGame() {
        this.showCustomConfirm(
            'Начать новую игру?',
            'Текущий прогресс будет потерян.',
            () => {
                this.resetGame();
                this.showScreen('setupScreen');
            },
            () => {
                // Ничего не делаем при отмене
            }
        );
    }
    
    resetGame() {
        this.teams.forEach(team => {
            team.score = 0;
            team.totalWords = 0;
        });
        
        this.currentTeam = 0;
        this.currentPlayer = 0;
        this.usedWords.clear();
        this.currentWordIndex = 0;
        this.gameStarted = false;
        this.roundActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    pauseGame() {
        if (!this.roundActive) return;
        
        this.roundActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.showModal('pauseModal');
    }
    
    resumeGame() {
        this.roundActive = true;
        this.startTimer();
        this.closeModal('pauseModal');
    }
    
    saveRoundStats() {
        const roundStats = {
            date: new Date().toISOString(),
            team: this.teams[this.currentTeam].name,
            wordsGuessed: this.currentRound.guessed.length,
            wordsSkipped: this.currentRound.skipped.length,
            wordsWrong: this.currentRound.wrong.length,
            totalWords: this.currentRound.words.length,
            timeUsed: this.settings.timePerRound - this.timeLeft
        };
        
        this.stats.rounds.push(roundStats);
        this.stats.totalRounds++;
        this.stats.totalWords += this.currentRound.words.length;
        this.stats.totalGames = Math.ceil(this.stats.totalRounds / (this.settings.teamCount * 3)); // Предполагаем 3 раунда на игру
        
        this.saveStats();
    }
    
    loadStats() {
        const saved = localStorage.getItem('aliasStats');
        return saved ? JSON.parse(saved) : {
            totalGames: 0,
            totalRounds: 0,
            totalWords: 0,
            rounds: []
        };
    }
    
    saveStats() {
        localStorage.setItem('aliasStats', JSON.stringify(this.stats));
    }
    
    resetStatistics() {
        this.showCustomConfirm(
            'Сбросить статистику?',
            'Вся статистика будет удалена безвозвратно.',
            () => {
                this.stats = {
                    totalGames: 0,
                    totalRounds: 0,
                    totalWords: 0,
                    rounds: []
                };
                this.saveStats();
                this.showStatistics();
            },
            () => {
                // Ничего не делаем при отмене
            }
        );
    }
    
    showStatistics() {
        this.showScreen('statsScreen');
        this.updateStatsDisplay();
    }
    
    updateStatsDisplay() {
        // Общая статистика
        document.getElementById('totalGames').textContent = this.stats.totalGames;
        document.getElementById('totalRounds').textContent = this.stats.totalRounds;
        document.getElementById('totalWords').textContent = this.stats.totalWords;
        document.getElementById('avgWords').textContent = 
            this.stats.totalRounds > 0 
                ? (this.stats.totalWords / this.stats.totalRounds).toFixed(1)
                : '0';
        
        // Статистика команд
        const teamsStatsElement = document.getElementById('teamsStats');
        teamsStatsElement.innerHTML = '';
        
        this.teams.forEach(team => {
            const teamStats = document.createElement('div');
            teamStats.className = 'team-stats-item';
            teamStats.innerHTML = `
                <div class="team-stats-header ${team.color}">
                    <span class="team-stats-name">${team.name}</span>
                    <span class="team-stats-score">${team.score} очков</span>
                </div>
                <div class="team-stats-details">
                    <div class="stat-detail">
                        <span class="detail-label">Всего слов:</span>
                        <span class="detail-value">${team.totalWords}</span>
                    </div>
                    <div class="stat-detail">
                        <span class="detail-label">Побед в раундах:</span>
                        <span class="detail-value">${team.roundsWon}</span>
                    </div>
                </div>
            `;
            teamsStatsElement.appendChild(teamStats);
        });
    }
    
    updateCounters() {
        const totalWords = this.currentRound.words.length;
        const currentWordNum = Math.max(1, totalWords);
        
        document.getElementById('wordCounter').textContent = `${currentWordNum}`;
        document.getElementById('skipCounter').textContent = 
            `${this.currentRound.skipsUsed}/${this.settings.skipLimit || '∞'}`;
    }
    
    updateCurrentTeamDisplay() {
        const team = this.teams[this.currentTeam];
        document.getElementById('currentTeam').textContent = team.name;
        document.getElementById('currentTeam').className = `info-value ${team.color}`;
        
        // Простая ротация объясняющего
        const players = ['Игрок 1', 'Игрок 2', 'Игрок 3', 'Игрок 4'];
        document.getElementById('currentExplainer').textContent = 
            players[this.currentPlayer % players.length];
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление через 3 секунды
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
    
    showCustomConfirm(title, message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.innerHTML = `
            <div class="custom-confirm-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn cancel">Отмена</button>
                    <button class="confirm-btn confirm">Продолжить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчики кнопок
        modal.querySelector('.confirm-btn.confirm').addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });
        
        modal.querySelector('.confirm-btn.cancel').addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });
        
        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) onCancel();
            }
        });
    }
    
    handleKeyPress(event) {
        if (!this.roundActive) return;
        
        switch(event.key) {
            case 'ArrowRight':
            case ' ':
                event.preventDefault();
                this.correctWord();
                break;
                
            case 'ArrowDown':
            case 's':
                event.preventDefault();
                this.skipWord();
                break;
                
            case 'ArrowLeft':
            case 'x':
                event.preventDefault();
                this.wrongWord();
                break;
                
            case 'Escape':
                event.preventDefault();
                this.pauseGame();
                break;
        }
    }
    
    updateDisplay() {
        // Обновляем все элементы интерфейса
        this.updateSettingsUI();
        this.updateTimerDisplay();
        this.updateCounters();
        this.updateCurrentTeamDisplay();
    }
}

// Глобальные функции для вызова из HTML
let game;

function goToMainMenu() {
    game.showCustomConfirm(
        'Вернуться в главное меню?',
        'Несохраненный прогресс будет потерян.',
        () => {
            window.location.href = 'https://lovecouple.ru/friends/';
        },
        () => {
            // Ничего не делаем при отмене
        }
    );
}

function showRules() {
    document.getElementById('rulesModal').style.display = 'block';
}

function closeRules() {
    document.getElementById('rulesModal').style.display = 'none';
}

function toggleSound() {
    const icon = document.getElementById('soundIcon');
    if (icon.classList.contains('fa-volume-up')) {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    } else {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    }
}

function showSettings() {
    game.showScreen('setupScreen');
}

function startGame() {
    if (!game) return;
    game.startGame();
}

function pauseGame() {
    if (game) game.pauseGame();
}

function resumeGame() {
    if (game) game.resumeGame();
}

function endRound() {
    if (game) game.endRound();
}

function endRoundFromPause() {
    if (game) {
        game.closeModal('pauseModal');
        game.endRound();
    }
}

function newGameFromPause() {
    if (game) {
        game.closeModal('pauseModal');
        game.newGame();
    }
}

function correctWord() {
    if (game) game.correctWord();
}

function skipWord() {
    if (game) game.skipWord();
}

function wrongWord() {
    if (game) game.wrongWord();
}

function nextRound() {
    if (game) game.nextRound();
}

function newGame() {
    if (game) game.newGame();
}

function showStatistics() {
    if (game) game.showStatistics();
}

function resetStatistics() {
    if (game) game.resetStatistics();
}

function goBackFromStats() {
    if (game) game.showScreen('resultsScreen');
}

function showWordsList() {
    if (!game || !game.roundActive) return;
    
    game.showCustomConfirm(
        'Показать список слов?',
        'Это может помешать игре, если участники увидят будущие слова.',
        () => {
            const currentRound = game.currentRound;
            let message = `Текущие слова (${currentRound.words.length}):\n\n`;
            
            currentRound.words.forEach((word, index) => {
                let status = '○';
                if (currentRound.guessed.includes(word)) status = '✓';
                if (currentRound.skipped.includes(word)) status = '→';
                if (currentRound.wrong.includes(word)) status = '✗';
                
                message += `${index + 1}. ${status} ${word}\n`;
            });
            
            alert(message);
        },
        () => {
            // Ничего не делаем при отмене
        }
    );
}

function showStatsTab(tabName) {
    // Переключение вкладок статистики
    document.querySelectorAll('.stats-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Stats').style.display = 'block';
    event.target.classList.add('active');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    game = new AliasGame();
    
    // Инициализация модальных окон
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Закрытие модальных окон по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Добавляем инструкцию по PWA для мобильных
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('../sw.js')
            .then(() => {
                console.log('Service Worker зарегистрирован');
            })
            .catch(err => {
                console.log('Ошибка регистрации Service Worker:', err);
            });
    }
    
    // Добавляем кнопку "Установить приложение" для мобильных
    let deferredPrompt;
    const installBtn = document.createElement('button');
    installBtn.className = 'install-app-btn';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Установить приложение';
    installBtn.style.display = 'none';
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Показываем кнопку через 5 секунд после загрузки
        setTimeout(() => {
            installBtn.style.display = 'block';
            document.body.appendChild(installBtn);
        }, 5000);
        
        installBtn.addEventListener('click', () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Пользователь установил приложение');
                }
                deferredPrompt = null;
            });
        });
    });
    
    // Проверка ориентации устройства
    function checkOrientation() {
        if (window.matchMedia("(orientation: portrait)").matches && 
            document.body.classList.contains('mobile-device')) {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else if (document.body.classList.contains('mobile-device')) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    }
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
});
