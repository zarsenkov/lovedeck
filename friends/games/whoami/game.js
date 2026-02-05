// 🎮 ОСНОВНОЙ ДВИЖОК ИГРЫ "КТО Я?"

const GameEngine = {
    // ТЕКУЩЕЕ СОСТОЯНИЕ ИГРЫ
    state: {
        // Основные параметры
        currentScreen: 'loading',
        gameActive: false,
        isPaused: false,
        
        // Игроки
        players: [],
        currentPlayerIndex: 0,
        currentTeam: 1,
        
        // Игровой процесс
        round: 1,
        turn: 1,
        currentWord: null,
        usedWords: new Set(),
        gamePhase: 'pass', // pass, word, guess, result, gameover
        timeLeft: 60,
        totalTime: 60,
        timerInterval: null,
        startTime: null,
        questionsAsked: 0,
        hintShown: false,
        
        // Счет
        scores: {},
        teamScores: { 1: 0, 2: 0 },
        currentStreak: 0,
        
        // Настройки
        config: {},
        
        // Статистика текущей игры
        gameStats: {
            wordsGuessed: 0,
            wordsSkipped: 0,
            totalTimeUsed: 0,
            perfectGuesses: 0,
            categoryUsage: {},
            startTime: null
        },
        
        // Временные данные
        tempData: {
            skipVotes: new Set(),
            timeAdded: 0,
            autoNextTimer: null
        }
    },

    // ИНИЦИАЛИЗАЦИЯ
    init() {
        console.log('🎮 Инициализация игрового движка...');
        
        // Загружаем настройки
        this.loadSettings();
        
        // Настраиваем обработчики событий
        this.setupEventListeners();
        
        // Показываем загрузку
        this.showLoadingScreen();
        
        // Инициализируем UI
        GameUI.init();
        
        // Загружаем статистику для главного меню
        this.updateMainMenuStats();
        
        // Переходим в главное меню
        setTimeout(() => {
            this.showScreen('main-menu');
        }, 1500);
    },

    // ЗАГРУЗКА НАСТРОЕК
    loadSettings() {
        this.state.config = GameData.loadSettings();
        console.log('⚙️ Загружены настройки:', this.state.config);
    },

    // СОХРАНЕНИЕ НАСТРОЕК
    saveSettings() {
        GameData.saveSettings(this.state.config);
    },

    // НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ
    setupEventListeners() {
        console.log('🎯 Настройка обработчиков событий...');
        
        // Быстрая игра
        document.getElementById('quick-play')?.addEventListener('click', () => this.startQuickGame());
        document.querySelector('.btn-play-now')?.addEventListener('click', () => this.startQuickGame());
        
        // Настройка игры
        document.getElementById('custom-game')?.addEventListener('click', () => this.showSetupScreen());
        document.querySelector('.btn-custom')?.addEventListener('click', () => this.showSetupScreen());
        
        // Меню
        document.getElementById('rules-btn')?.addEventListener('click', () => this.showRules());
        document.getElementById('stats-btn')?.addEventListener('click', () => this.showStats());
        document.getElementById('word-manager-btn')?.addEventListener('click', () => this.showWordManager());
        document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettings());
        
        // Игровые кнопки
        document.getElementById('show-word-btn')?.addEventListener('click', () => this.showWordPhase());
        document.getElementById('start-guessing-btn')?.addEventListener('click', () => this.startGuessingPhase());
        document.getElementById('correct-btn')?.addEventListener('click', () => this.handleCorrectGuess());
        document.getElementById('skip-btn')?.addEventListener('click', () => this.handleSkipWord());
        document.getElementById('timeout-btn')?.addEventListener('click', () => this.handleTimeout());
        document.getElementById('next-turn-btn')?.addEventListener('click', () => this.nextTurn());
        document.getElementById('start-game-btn')?.addEventListener('click', () => this.startGame());
        
        // Настройки в реальном времени
        document.getElementById('sound-toggle')?.addEventListener('change', (e) => this.toggleSound(e.target.checked));
        document.getElementById('vibration-toggle')?.addEventListener('change', (e) => this.toggleVibration(e.target.checked));
        document.getElementById('theme-toggle')?.addEventListener('change', (e) => this.toggleTheme(e.target.checked));
        document.getElementById('animations-toggle')?.addEventListener('change', (e) => this.toggleAnimations(e.target.checked));
        document.getElementById('autoplay-toggle')?.addEventListener('change', (e) => this.toggleAutoplay(e.target.checked));
        document.getElementById('hints-toggle')?.addEventListener('change', (e) => this.toggleHints(e.target.checked));
        document.getElementById('skip-penalty-toggle')?.addEventListener('change', (e) => this.toggleSkipPenalty(e.target.checked));
        
        // Предотвращение нежелательных действий
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Обработка видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.gameActive && !this.state.isPaused) {
                this.pauseGame();
            }
        });
    },

    // ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====

    showScreen(screenId) {
        GameUI.showScreen(screenId);
        this.state.currentScreen = screenId;
        
        // Дополнительные действия при переключении экранов
        switch(screenId) {
            case 'main-menu':
                this.updateMainMenuStats();
                break;
            case 'stats-screen':
                this.updateStatsScreen();
                break;
            case 'words-screen':
                this.updateWordsScreen();
                break;
            case 'setup-screen':
                this.updateSetupScreen();
                break;
        }
    },

    showLoadingScreen() {
        // Анимация прогресса загрузки
        let progress = 0;
        const progressBar = document.getElementById('loading-bar');
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 100);
    },

    updateMainMenuStats() {
        const stats = GameData.getOverallStats();
        
        document.getElementById('total-games-badge').textContent = stats.gamesPlayed;
        document.getElementById('best-score-badge').textContent = stats.bestScore;
        
        // Обновляем список последних игр
        const recentList = document.getElementById('recent-games-mini');
        if (recentList) {
            const recentGames = GameData.loadGameStats().recentGames.slice(0, 3);
            recentList.innerHTML = '';
            
            if (recentGames.length === 0) {
                recentList.innerHTML = '<div class="empty-state">Пока нет сыгранных игр</div>';
            } else {
                recentGames.forEach(game => {
                    const date = new Date(game.date);
                    const gameEl = document.createElement('div');
                    gameEl.className = 'game-preview-item';
                    gameEl.innerHTML = `
                        <div class="game-preview-info">
                            <div class="game-date">${date.toLocaleDateString()}</div>
                            <div class="game-players">${game.players} игрока</div>
                        </div>
                        <div class="game-score">${game.score} очков</div>
                    `;
                    recentList.appendChild(gameEl);
                });
            }
        }
    },

    showSetupScreen() {
        this.showScreen('setup-screen');
    },

    updateSetupScreen() {
        const content = document.getElementById('setup-content');
        if (!content) return;
        
        content.innerHTML = this.generateSetupContent();
        this.bindSetupEvents();
        this.updateSetupSummary();
    },

    generateSetupContent() {
        const config = this.state.config;
        const modeInfo = GameData.getGameModeInfo(config.mode);
        
        return `
            <!-- Настройка игроков -->
            <div class="setup-section">
                <h3><i class="fas fa-users"></i> Игроки</h3>
                <div class="players-container" id="players-container">
                    ${config.players.map((player, index) => `
                        <div class="player-row ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <div class="player-avatar" style="background: ${GameData.playerColors[index]}">
                                <i class="${GameData.playerIcons[index]}"></i>
                            </div>
                            <div class="player-info">
                                <input type="text" class="player-name-input" value="${player}" 
                                       placeholder="Имя игрока" data-index="${index}">
                            </div>
                            <input type="color" class="player-color" value="${GameData.playerColors[index]}" 
                                   data-index="${index}" title="Выбрать цвет">
                            ${index > 1 ? `
                                <button class="remove-player-btn" data-index="${index}">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                ${config.players.length < 8 ? `
                    <button class="add-player-btn" id="add-player-btn">
                        <i class="fas fa-plus"></i> Добавить игрока
                    </button>
                ` : ''}
            </div>

            <!-- Режим игры -->
            <div class="setup-section">
                <h3><i class="fas fa-gamepad"></i> Режим игры</h3>
                <div class="modes-grid">
                    ${Object.values(GameData.gameModes).map(mode => `
                        <div class="mode-option ${config.mode === mode.id ? 'selected' : ''}" data-mode="${mode.id}">
                            <div class="mode-icon" style="background: ${mode.color}">
                                <i class="${mode.icon}"></i>
                            </div>
                            <h4>${mode.name}</h4>
                            <p>${mode.description}</p>
                            ${config.mode === mode.id ? '<div class="selected-indicator">✓</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Таймер -->
            <div class="setup-section">
                <h3><i class="fas fa-clock"></i> Таймер</h3>
                <div class="timer-controls">
                    <div class="timer-value" id="timer-display-setup">${config.timePerTurn}с</div>
                    <div class="timer-buttons">
                        <button class="timer-btn" data-action="decrease">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="timer-btn" data-action="increase">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="timer-presets">
                    <button class="timer-preset ${config.timePerTurn === 30 ? 'active' : ''}" data-time="30">
                        30 секунд
                    </button>
                    <button class="timer-preset ${config.timePerTurn === 60 ? 'active' : ''}" data-time="60">
                        1 минута
                    </button>
                    <button class="timer-preset ${config.timePerTurn === 90 ? 'active' : ''}" data-time="90">
                        1.5 минуты
                    </button>
                    <button class="timer-preset ${config.timePerTurn === 120 ? 'active' : ''}" data-time="120">
                        2 минуты
                    </button>
                </div>
            </div>

            <!-- Категории -->
            <div class="setup-section">
                <h3><i class="fas fa-tags"></i> Категории</h3>
                <div class="categories-container">
                    ${GameData.categories.map(category => `
                        <div class="category-checkbox">
                            <input type="checkbox" id="category-${category.id}" 
                                   ${config.categories.includes(category.id) ? 'checked' : ''}
                                   data-category="${category.id}">
                            <label for="category-${category.id}" class="category-label">
                                <i class="${category.icon}"></i>
                                <span>${category.name}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Дополнительные настройки -->
            <div class="setup-section">
                <button class="advanced-toggle" id="advanced-toggle">
                    <span><i class="fas fa-cog"></i> Дополнительные настройки</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="advanced-settings" id="advanced-settings" style="display: none;">
                    <div class="setting-row">
                        <span class="setting-label">Сложность слов</span>
                        <select id="difficulty-select">
                            <option value="easy" ${config.difficulty === 'easy' ? 'selected' : ''}>Легкая</option>
                            <option value="normal" ${config.difficulty === 'normal' ? 'selected' : ''}>Средняя</option>
                            <option value="hard" ${config.difficulty === 'hard' ? 'selected' : ''}>Сложная</option>
                            <option value="mixed" ${config.difficulty === 'mixed' ? 'selected' : ''}>Смешанная</option>
                        </select>
                    </div>
                    <div class="setting-row">
                        <span class="setting-label">Очки для победы</span>
                        <input type="number" id="score-limit" value="${config.scoreToWin}" min="5" max="50" step="5">
                    </div>
                    <div class="setting-row">
                        <span class="setting-label">Штраф за пропуск</span>
                        <label class="switch">
                            <input type="checkbox" id="skip-penalty" ${config.skipPenalty ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <span class="setting-label">Показывать подсказки</span>
                        <label class="switch">
                            <input type="checkbox" id="show-hints" ${config.showHints ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    bindSetupEvents() {
        // Игроки
        document.querySelectorAll('.player-name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.state.config.players[index] = e.target.value.trim() || `Игрок ${index + 1}`;
                this.updateSetupSummary();
            });
        });
        
        document.querySelectorAll('.player-color').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                // Обновляем цвет в настройках
                this.updateSetupSummary();
            });
        });
        
        document.querySelectorAll('.remove-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.removePlayer(index);
            });
        });
        
        document.getElementById('add-player-btn')?.addEventListener('click', () => this.addPlayer());
        
        // Режимы игры
        document.querySelectorAll('.mode-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.state.config.mode = mode;
                this.updateSetupScreen();
            });
        });
        
        // Таймер
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.adjustTimer(action);
            });
        });
        
        document.querySelectorAll('.timer-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const time = parseInt(e.currentTarget.dataset.time);
                this.state.config.timePerTurn = time;
                this.updateSetupScreen();
            });
        });
        
        // Категории
        document.querySelectorAll('.category-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.dataset.category;
                const isChecked = e.target.checked;
                
                if (isChecked) {
                    if (!this.state.config.categories.includes(category)) {
                        this.state.config.categories.push(category);
                    }
                } else {
                    const index = this.state.config.categories.indexOf(category);
                    if (index > -1) {
                        this.state.config.categories.splice(index, 1);
                    }
                }
                this.updateSetupSummary();
            });
        });
        
        // Дополнительные настройки
        document.getElementById('advanced-toggle')?.addEventListener('click', (e) => {
            const settings = document.getElementById('advanced-settings');
            const toggle = e.currentTarget;
            
            if (settings.style.display === 'none') {
                settings.style.display = 'block';
                toggle.classList.add('active');
            } else {
                settings.style.display = 'none';
                toggle.classList.remove('active');
            }
        });
        
        document.getElementById('difficulty-select')?.addEventListener('change', (e) => {
            this.state.config.difficulty = e.target.value;
        });
        
        document.getElementById('score-limit')?.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (value < 5) value = 5;
            if (value > 50) value = 50;
            this.state.config.scoreToWin = value;
            e.target.value = value;
        });
        
        document.getElementById('skip-penalty')?.addEventListener('change', (e) => {
            this.state.config.skipPenalty = e.target.checked;
        });
        
        document.getElementById('show-hints')?.addEventListener('change', (e) => {
            this.state.config.showHints = e.target.checked;
        });
    },

    updateSetupSummary() {
        const config = this.state.config;
        
        document.getElementById('players-count').textContent = `${config.players.length} игрока`;
        document.getElementById('timer-value-summary').textContent = `${config.timePerTurn}с`;
        document.getElementById('categories-count').textContent = `${config.categories.length} категории`;
    },

    adjustTimer(action) {
        let time = this.state.config.timePerTurn;
        
        if (action === 'increase') {
            time = Math.min(180, time + 10);
        } else if (action === 'decrease') {
            time = Math.max(10, time - 10);
        }
        
        this.state.config.timePerTurn = time;
        document.getElementById('timer-display-setup').textContent = `${time}с`;
        this.updateSetupSummary();
    },

    addPlayer() {
        const newIndex = this.state.config.players.length;
        if (newIndex >= 8) return;
        
        this.state.config.players.push(`Игрок ${newIndex + 1}`);
        this.updateSetupScreen();
    },

    removePlayer(index) {
        if (this.state.config.players.length <= 2) return;
        
        this.state.config.players.splice(index, 1);
        this.updateSetupScreen();
    },

    // ===== ИГРОВОЙ ПРОЦЕСС =====

    startQuickGame() {
        // Используем настройки по умолчанию
        this.state.config = { ...GameData.defaultConfig };
        this.startGame();
    },

    startGame() {
        console.log('🚀 Начинаем новую игру!');
        
        // Сохраняем настройки
        this.saveSettings();
        
        // Сбрасываем состояние игры
        this.resetGameState();
        
        // Инициализируем игроков
        this.initPlayers();
        
        // Инициализируем статистику
        this.initGameStats();
        
        // Переходим на игровой экран
        this.showScreen('game-screen');
        
        // Начинаем первый ход
        this.startTurn();
    },

    resetGameState() {
        this.state.gameActive = true;
        this.state.isPaused = false;
        this.state.currentPlayerIndex = 0;
        this.state.currentTeam = 1;
        this.state.round = 1;
        this.state.turn = 1;
        this.state.usedWords.clear();
        this.state.gamePhase = 'pass';
        this.state.timeLeft = this.state.config.timePerTurn;
        this.state.totalTime = this.state.config.timePerTurn;
        this.state.questionsAsked = 0;
        this.state.hintShown = false;
        this.state.currentStreak = 0;
        this.state.scores = {};
        this.state.teamScores = { 1: 0, 2: 0 };
        this.state.tempData.skipVotes.clear();
        this.state.tempData.timeAdded = 0;
        
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        if (this.state.tempData.autoNextTimer) {
            clearTimeout(this.state.tempData.autoNextTimer);
            this.state.tempData.autoNextTimer = null;
        }
    },

    initPlayers() {
        this.state.players = this.state.config.players.map((name, index) => ({
            id: index + 1,
            name: name,
            color: GameData.playerColors[index],
            icon: GameData.playerIcons[index],
            score: 0,
            team: this.state.config.mode === 'teams' ? (index % 2) + 1 : null,
            wordsGuessed: 0,
            wordsSkipped: 0,
            totalTimeUsed: 0,
            streak: 0,
            bestStreak: 0
        }));
        
        // Обновляем список игроков на экране
        GameUI.updatePlayersList(this.state.players, this.state.currentPlayerIndex);
    },

    initGameStats() {
        this.state.gameStats = {
            wordsGuessed: 0,
            wordsSkipped: 0,
            totalTimeUsed: 0,
            perfectGuesses: 0,
            categoryUsage: {},
            startTime: Date.now()
        };
    },

    startTurn() {
        console.log(`🔄 Начинаем ход игрока ${this.state.currentPlayerIndex + 1}`);
        
        // Сбрасываем состояние хода
        this.state.questionsAsked = 0;
        this.state.hintShown = false;
        this.state.tempData.skipVotes.clear();
        this.state.tempData.timeAdded = 0;
        
        // Устанавливаем фазу передачи телефона
        this.state.gamePhase = 'pass';
        
        // Обновляем UI
        GameUI.updateGamePhase('pass');
        GameUI.updateCurrentPlayer(
            this.state.players[this.state.currentPlayerIndex],
            this.state.currentPlayerIndex + 1,
            this.state.players.length
        );
        
        // Обновляем прогресс игрока
        GameUI.updatePlayersList(this.state.players, this.state.currentPlayerIndex);
        
        // Показываем инструкцию для передачи телефона
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        const nextPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        const nextPlayer = this.state.players[nextPlayerIndex];
        
        document.getElementById('pass-instruction').textContent = 
            `Передайте телефон игроку ${currentPlayer.name}`;
        document.getElementById('pass-detail').textContent = 
            `${currentPlayer.name}, не смотрите на экран!`;
            
        // Обновляем аватар следующего игрока
        document.getElementById('next-player-avatar').innerHTML = 
            `<i class="${nextPlayer.icon}"></i>`;
        
        // Включаем вибрацию (если разрешено)
        if (this.state.config.vibrations && navigator.vibrate) {
            navigator.vibrate(100);
        }
    },

    showWordPhase() {
        console.log('👁️ Переходим к показу слова');
        
        // Выбираем случайное слово
        this.state.currentWord = this.getRandomWord();
        
        // Добавляем слово в использованные
        this.state.usedWords.add(this.state.currentWord.word);
        
        // Обновляем статистику категорий
        this.updateCategoryStats(this.state.currentWord.categoryId, 'used');
        
        // Устанавливаем фазу показа слова
        this.state.gamePhase = 'word';
        
        // Обновляем UI
        GameUI.updateGamePhase('word');
        GameUI.updateWordDisplay(this.state.currentWord);
        
        // Обновляем информацию об угадывающем
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        document.getElementById('current-guesser-name').textContent = currentPlayer.name;
        
        // Включаем вибрацию
        if (this.state.config.vibrations && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    },

    getRandomWord() {
        const config = this.state.config;
        const usedWordsArray = Array.from(this.state.usedWords);
        
        // Получаем слово из базы данных
        let word = GameData.getRandomWord(
            config.categories,
            config.difficulty === 'mixed' ? null : config.difficulty,
            usedWordsArray
        );
        
        // Если слов не хватает, сбрасываем использованные
        if (!word || word.word === 'Загадка') {
            console.log('⚠️ Заканчиваются слова, сбрасываем использованные');
            this.state.usedWords.clear();
            word = GameData.getRandomWord(
                config.categories,
                config.difficulty === 'mixed' ? null : config.difficulty,
                []
            );
        }
        
        return word;
    },

    startGuessingPhase() {
        console.log('⏱️ Начинаем фазу угадывания');
        
        // Сбрасываем время
        this.state.timeLeft = this.state.config.timePerTurn;
        this.state.totalTime = this.state.config.timePerTurn;
        this.state.startTime = Date.now();
        
        // Устанавливаем фазу угадывания
        this.state.gamePhase = 'guess';
        
        // Обновляем UI
        GameUI.updateGamePhase('guess');
        GameUI.updateTimer(this.state.timeLeft, this.state.totalTime);
        
        // Запускаем таймер
        this.startTimer();
        
        // Обновляем информацию об угадывающем
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        document.getElementById('guessing-player').textContent = currentPlayer.name;
        
        // Сбрасываем счетчик вопросов
        document.getElementById('questions-asked').textContent = '0 вопросов';
        
        // Включаем звук начала таймера
        if (this.state.config.soundEnabled) {
            this.playSound('start');
        }
    },

    startTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }
        
        this.state.timerInterval = setInterval(() => {
            if (this.state.isPaused) return;
            
            this.state.timeLeft--;
            GameUI.updateTimer(this.state.timeLeft, this.state.totalTime);
            
            // Визуальные эффекты при низком времени
            if (this.state.timeLeft <= 10) {
                GameUI.updateTimerCritical(true);
                
                // Вибрация при 5 секундах
                if (this.state.timeLeft <= 5 && this.state.config.vibrations && navigator.vibrate) {
                    navigator.vibrate(100);
                }
                
                // Звуковое предупреждение
                if (this.state.timeLeft <= 3 && this.state.config.soundEnabled) {
                    this.playSound('warning');
                }
            } else {
                GameUI.updateTimerCritical(false);
            }
            
            // Проверка окончания времени
            if (this.state.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    },

    handleCorrectGuess() {
        console.log('✅ Правильный ответ!');
        
        // Останавливаем таймер
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        // Рассчитываем очки
        const timeUsed = this.state.totalTime - this.state.timeLeft;
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        const isPerfect = this.state.questionsAsked === 0;
        
        const points = GameData.calculatePoints(
            true,
            this.state.currentWord.difficulty,
            this.state.timeLeft,
            this.state.totalTime,
            this.state.currentStreak + 1,
            isPerfect
        );
        
        // Обновляем статистику игрока
        currentPlayer.score += points;
        currentPlayer.wordsGuessed++;
        currentPlayer.totalTimeUsed += timeUsed;
        currentPlayer.streak++;
        
        if (currentPlayer.streak > currentPlayer.bestStreak) {
            currentPlayer.bestStreak = currentPlayer.streak;
        }
        
        // Обновляем счет команды
        if (currentPlayer.team) {
            this.state.teamScores[currentPlayer.team] += points;
        }
        
        // Обновляем общую статистику
        this.state.currentStreak++;
        this.state.gameStats.wordsGuessed++;
        this.state.gameStats.totalTimeUsed += timeUsed;
        
        if (isPerfect) {
            this.state.gameStats.perfectGuesses++;
        }
        
        // Обновляем статистику категорий
        this.updateCategoryStats(this.state.currentWord.categoryId, 'guessed');
        
        // Воспроизводим звук успеха
        if (this.state.config.soundEnabled) {
            this.playSound('success');
        }
        
        // Показываем результат
        this.showResult(true, points, timeUsed);
    },

    handleSkipWord() {
        console.log('⏭️ Пропускаем слово');
        
        // Останавливаем таймер
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        // Штраф за пропуск
        let penalty = 0;
        if (this.state.config.skipPenalty) {
            penalty = GameData.scoringRules.skipPenalty;
            const currentPlayer = this.state.players[this.state.currentPlayerIndex];
            currentPlayer.score += penalty;
            currentPlayer.wordsSkipped++;
            
            // Обновляем счет команды
            if (currentPlayer.team) {
                this.state.teamScores[currentPlayer.team] += penalty;
            }
        }
        
        // Обновляем общую статистику
        this.state.gameStats.wordsSkipped++;
        this.state.currentStreak = 0;
        
        // Сбрасываем стрик игрока
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        currentPlayer.streak = 0;
        
        // Воспроизводим звук
        if (this.state.config.soundEnabled) {
            this.playSound('skip');
        }
        
        // Показываем результат
        this.showResult(false, penalty, this.state.totalTime - this.state.timeLeft);
    },

    handleTimeout() {
        console.log('⏰ Время вышло!');
        
        // Останавливаем таймер
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        // Штраф за таймаут
        const penalty = GameData.scoringRules.timeoutPenalty;
        if (penalty !== 0) {
            const currentPlayer = this.state.players[this.state.currentPlayerIndex];
            currentPlayer.score += penalty;
            
            // Обновляем счет команды
            if (currentPlayer.team) {
                this.state.teamScores[currentPlayer.team] += penalty;
            }
        }
        
        // Обновляем общую статистику
        this.state.currentStreak = 0;
        
        // Сбрасываем стрик игрока
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        currentPlayer.streak = 0;
        
        // Воспроизводим звук
        if (this.state.config.soundEnabled) {
            this.playSound('timeout');
        }
        
        // Показываем результат
        this.showResult(false, penalty, this.state.totalTime);
    },

    showResult(success, points, timeUsed) {
        console.log(`📊 Результат: ${success ? 'успех' : 'неудача'}, очки: ${points}`);
        
        // Устанавливаем фазу результата
        this.state.gamePhase = 'result';
        
        // Обновляем UI
        GameUI.updateGamePhase('result');
        
        // Обновляем информацию о результате
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        
        document.getElementById('result-title').textContent = 
            success ? 'Отлично!' : (points < 0 ? 'Пропущено' : 'Время вышло');
        
        document.getElementById('result-text').textContent = success
            ? `${currentPlayer.name} угадал слово за ${timeUsed} секунд!`
            : points < 0
            ? `${currentPlayer.name} пропустил слово`
            : 'Время истекло!';
        
        document.getElementById('revealed-word-text').textContent = this.state.currentWord.word;
        document.getElementById('revealed-category').textContent = this.state.currentWord.category;
        document.getElementById('revealed-stars').textContent = 
            GameData.getDifficultyStars(this.state.currentWord.difficulty);
        
        document.getElementById('points-earned').textContent = 
            points > 0 ? `+${points.toFixed(1)}` : points.toFixed(1);
        document.getElementById('points-earned').style.color = 
            points > 0 ? 'var(--secondary-600)' : points < 0 ? 'var(--danger-600)' : 'var(--text-secondary)';
        
        document.getElementById('total-score-now').textContent = currentPlayer.score.toFixed(1);
        
        // Обновляем список игроков
        GameUI.updatePlayersList(this.state.players, this.state.currentPlayerIndex);
        
        // Запускаем авто-продолжение если включено
        if (this.state.config.autoPlay && !this.state.isPaused) {
            this.state.tempData.autoNextTimer = setTimeout(() => {
                this.nextTurn();
            }, 3000);
        }
    },

    nextTurn() {
        console.log('➡️ Переход к следующему ходу');
        
        // Очищаем авто-таймер если есть
        if (this.state.tempData.autoNextTimer) {
            clearTimeout(this.state.tempData.autoNextTimer);
            this.state.tempData.autoNextTimer = null;
        }
        
        // Переходим к следующему игроку
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        this.state.turn++;
        
        // Если прошли полный круг, увеличиваем раунд
        if (this.state.currentPlayerIndex === 0) {
            this.state.round++;
            console.log(`🎲 Начинаем раунд ${this.state.round}`);
            
            // Проверяем условия окончания игры
            if (this.checkGameEnd()) {
                this.endGame();
                return;
            }
        }
        
        // Начинаем новый ход
        this.startTurn();
    },

    checkGameEnd() {
        const config = this.state.config;
        const modeInfo = GameData.getGameModeInfo(config.mode);
        
        // Проверяем достижение лимита очков
        if (modeInfo.hasPoints) {
            if (config.mode === 'teams') {
                // Командный режим
                for (const [team, score] of Object.entries(this.state.teamScores)) {
                    if (score >= config.scoreToWin) {
                        this.state.winningTeam = parseInt(team);
                        return true;
                    }
                }
            } else {
                // Индивидуальный режим
                const winner = this.state.players.find(player => player.score >= config.scoreToWin);
                if (winner) {
                    return true;
                }
            }
        }
        
        // Проверяем лимит раундов (если не включены очки)
        if (!modeInfo.hasPoints && this.state.round > 5) {
            return true;
        }
        
        // Проверяем лимит времени (опционально)
        const gameDuration = Date.now() - this.state.gameStats.startTime;
        if (gameDuration > 30 * 60 * 1000) { // 30 минут
            return true;
        }
        
        return false;
    },

    endGame() {
        console.log('🏁 Игра окончена!');
        
        // Останавливаем таймер если он еще работает
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        // Устанавливаем фазу окончания игры
        this.state.gamePhase = 'gameover';
        this.state.gameActive = false;
        
        // Собираем финальную статистику
        const finalStats = this.calculateFinalStats();
        
        // Обновляем UI
        GameUI.updateGamePhase('gameover');
        GameUI.updateGameOverScreen(finalStats);
        
        // Сохраняем статистику игры
        this.saveGameStats(finalStats);
        
        // Воспроизводим звук окончания игры
        if (this.state.config.soundEnabled) {
            this.playSound('gameover');
        }
    },

    calculateFinalStats() {
        const players = [...this.state.players].sort((a, b) => b.score - a.score);
        const winner = players[0];
        const gameDuration = Date.now() - this.state.gameStats.startTime;
        
        // Форматируем время
        const minutes = Math.floor(gameDuration / 60000);
        const seconds = Math.floor((gameDuration % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Подсчитываем угаданные слова
        const totalWords = this.state.gameStats.wordsGuessed + this.state.gameStats.wordsSkipped;
        const guessedPercentage = totalWords > 0 
            ? Math.round((this.state.gameStats.wordsGuessed / totalWords) * 100)
            : 0;
        
        return {
            winner: winner,
            players: players,
            teamScores: this.state.teamScores,
            gameDuration: formattedTime,
            totalWords: totalWords,
            wordsGuessed: this.state.gameStats.wordsGuessed,
            wordsSkipped: this.state.gameStats.wordsSkipped,
            guessedPercentage: guessedPercentage,
            perfectGuesses: this.state.gameStats.perfectGuesses,
            totalRounds: this.state.round - 1,
            mode: this.state.config.mode,
            categories: this.state.config.categories,
            startTime: this.state.gameStats.startTime,
            endTime: Date.now()
        };
    },

    saveGameStats(finalStats) {
        const statsToSave = {
            score: finalStats.winner.score,
            players: this.state.players.length,
            time: Math.round((finalStats.endTime - finalStats.startTime) / 1000),
            rounds: finalStats.totalRounds,
            mode: finalStats.mode,
            categories: finalStats.categories.map(id => GameData.getCategoryById(id).name),
            playersData: this.state.players.map(player => ({
                name: player.name,
                score: player.score,
                wordsGuessed: player.wordsGuessed,
                wordsSkipped: player.wordsSkipped
            })),
            categories: Object.keys(this.state.gameStats.categoryUsage).map(id => ({
                id: id,
                used: this.state.gameStats.categoryUsage[id]?.used || 0,
                guessed: this.state.gameStats.categoryUsage[id]?.guessed || 0
            }))
        };
        
        GameData.saveGameStats(statsToSave);
    },

    updateCategoryStats(categoryId, type) {
        if (!this.state.gameStats.categoryUsage[categoryId]) {
            this.state.gameStats.categoryUsage[categoryId] = { used: 0, guessed: 0 };
        }
        
        if (type === 'used') {
            this.state.gameStats.categoryUsage[categoryId].used++;
        } else if (type === 'guessed') {
            this.state.gameStats.categoryUsage[categoryId].guessed++;
        }
    },

    // ===== УПРАВЛЕНИЕ ИГРОЙ =====

    pauseGame() {
        if (!this.state.gameActive || this.state.gamePhase === 'gameover') return;
        
        this.state.isPaused = true;
        
        // Останавливаем таймер
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        // Обновляем UI
        GameUI.showPauseMenu();
        
        // Обновляем статистику в меню паузы
        const currentPlayer = this.state.players[this.state.currentPlayerIndex];
        document.getElementById('pause-current-player').textContent = currentPlayer.name;
        document.getElementById('pause-round').textContent = this.state.round;
        document.getElementById('pause-time-left').textContent = `${this.state.timeLeft}с`;
    },

    resumeGame() {
        if (!this.state.isPaused) return;
        
        this.state.isPaused = false;
        
        // Возобновляем таймер если нужно
        if (this.state.gamePhase === 'guess' && this.state.timeLeft > 0) {
            this.startTimer();
        }
        
        // Скрываем меню паузы
        GameUI.hidePauseMenu();
    },

    restartGame() {
        if (confirm('Начать новую игру с текущими настройками?')) {
            this.startGame();
        }
    },

    // ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====

    showRules() {
        this.showScreen('rules-screen');
    },

    showStats() {
        this.showScreen('stats-screen');
    },

    updateStatsScreen() {
        const stats = GameData.getOverallStats();
        const categoryStats = GameData.getCategoryStats();
        const recentGames = GameData.loadGameStats().recentGames.slice(0, 10);
        
        // Обновляем основные статистики
        document.getElementById('total-games-stat').textContent = stats.gamesPlayed;
        document.getElementById('avg-time-stat').textContent = `${stats.avgTime}с`;
        document.getElementById('best-score-stat').textContent = stats.bestScore;
        document.getElementById('words-guessed-stat').textContent = stats.wordsGuessed;
        
        // Обновляем статистику по категориям
        const categoriesList = document.getElementById('categories-stats-list');
        if (categoriesList) {
            categoriesList.innerHTML = categoryStats.map(cat => `
                <div class="category-stat">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-count">
                        ${cat.guessed}/${cat.used} (${cat.percentage}%)
                    </span>
                </div>
            `).join('');
        }
        
        // Обновляем историю игр
        const gamesHistory = document.getElementById('games-history');
        if (gamesHistory) {
            gamesHistory.innerHTML = recentGames.map(game => {
                const date = new Date(game.date);
                const modeInfo = GameData.getGameModeInfo(game.mode);
                
                return `
                    <div class="game-row">
                        <div class="game-date">${date.toLocaleDateString()}</div>
                        <div class="game-players">${game.players} игрока</div>
                        <div class="game-mode">${modeInfo?.name || game.mode}</div>
                        <div class="game-score">${game.score} очков</div>
                    </div>
                `;
            }).join('');
            
            if (recentGames.length === 0) {
                gamesHistory.innerHTML = '<div class="empty-state">Пока нет истории игр</div>';
            }
        }
    },

    showWordManager() {
        this.showScreen('words-screen');
    },

    updateWordsScreen() {
        // Реализация будет добавлена позже
        console.log('📝 Обновление экрана управления словами');
    },

    showSettings() {
        this.showScreen('settings-screen');
    },

    // ===== УПРАВЛЕНИЕ ЗВУКОМ И ВИБРАЦИЕЙ =====

    playSound(type) {
        if (!this.state.config.soundEnabled) return;
        
        // В реальном приложении здесь будет воспроизведение звуков
        console.log(`🔊 Воспроизведение звука: ${type}`);
        
        // Простая реализация через Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Настройки звука в зависимости от типа
            switch(type) {
                case 'success':
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // До
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Ми
                    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // Соль
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'start':
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;
                    
                case 'warning':
                    oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime); // Ми
                    oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.1); // Ре
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                case 'skip':
                case 'timeout':
                    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'gameover':
                    // Более сложная мелодия для окончания игры
                    const frequencies = [392, 349.23, 329.63, 293.66];
                    let currentTime = audioContext.currentTime;
                    
                    frequencies.forEach((freq, index) => {
                        oscillator.frequency.setValueAtTime(freq, currentTime + index * 0.15);
                    });
                    
                    gainNode.gain.setValueAtTime(0.1, currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
                    oscillator.start();
                    oscillator.stop(currentTime + 0.6);
                    break;
            }
        } catch (error) {
            console.warn('Не удалось воспроизвести звук:', error);
        }
    },

    toggleSound(enabled) {
        this.state.config.soundEnabled = enabled;
        this.saveSettings();
        
        GameUI.showNotification(
            enabled ? 'Звук включен' : 'Звук выключен',
            enabled ? 'success' : 'info'
        );
    },

    toggleVibration(enabled) {
        this.state.config.vibrations = enabled;
        this.saveSettings();
        
        // Тестируем вибрацию если включили
        if (enabled && navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        GameUI.showNotification(
            enabled ? 'Вибрация включена' : 'Вибрация выключена',
            enabled ? 'success' : 'info'
        );
    },

    toggleTheme(darkMode) {
        this.state.config.theme = darkMode ? 'dark' : 'light';
        this.saveSettings();
        
        // Применяем тему
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        
        GameUI.showNotification(
            darkMode ? 'Темная тема включена' : 'Светлая тема включена',
            'info'
        );
    },

    toggleAnimations(enabled) {
        this.state.config.animations = enabled;
        this.saveSettings();
        
        GameUI.showNotification(
            enabled ? 'Анимации включены' : 'Анимации выключены',
            'info'
        );
    },

    toggleAutoplay(enabled) {
        this.state.config.autoPlay = enabled;
        this.saveSettings();
        
        GameUI.showNotification(
            enabled ? 'Автопродолжение включено' : 'Автопродолжение выключено',
            'info'
        );
    },

    toggleHints(enabled) {
        this.state.config.showHints = enabled;
        this.saveSettings();
        
        GameUI.showNotification(
            enabled ? 'Подсказки включены' : 'Подсказки выключены',
            'info'
        );
    },

    toggleSkipPenalty(enabled) {
        this.state.config.skipPenalty = enabled;
        this.saveSettings();
        
        GameUI.showNotification(
            enabled ? 'Штраф за пропуск включен' : 'Штраф за пропуск выключен',
            'info'
        );
    },

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

    addTime(seconds) {
        if (this.state.gamePhase !== 'guess' || this.state.isPaused) return;
        
        this.state.timeLeft += seconds;
        this.state.tempData.timeAdded += seconds;
        this.state.totalTime += seconds;
        
        GameUI.updateTimer(this.state.timeLeft, this.state.totalTime);
        
        // Визуальная обратная связь
        GameUI.showTimeAdded(seconds);
        
        // Звуковой эффект
        if (this.state.config.soundEnabled) {
            this.playSound('start');
        }
    },

    pauseTimer() {
        if (this.state.gamePhase !== 'guess') return;
        
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
            GameUI.showNotification('Таймер на паузе', 'warning');
        } else {
            this.startTimer();
            GameUI.showNotification('Таймер возобновлен', 'success');
        }
    },

    showHint() {
        if (this.state.hintShown || !this.state.config.showHints) return;
        
        this.state.hintShown = true;
        GameUI.showWordHint(this.state.currentWord.hint);
        
        GameUI.showNotification('Подсказка показана!', 'info');
    },

    changeWord() {
        if (this.state.gamePhase !== 'word') return;
        
        // Убираем текущее слово из использованных
        this.state.usedWords.delete(this.state.currentWord.word);
        
        // Получаем новое слово
        this.state.currentWord = this.getRandomWord();
        this.state.usedWords.add(this.state.currentWord.word);
        
        // Обновляем отображение
        GameUI.updateWordDisplay(this.state.currentWord);
        
        GameUI.showNotification('Слово изменено', 'info');
    },

    skipPlayer() {
        if (this.state.gamePhase !== 'pass') return;
        
        // Добавляем голос за пропуск
        const playerId = this.state.players[this.state.currentPlayerIndex].id;
        this.state.tempData.skipVotes.add(playerId);
        
        // Проверяем, достаточно ли голосов
        const votesNeeded = Math.ceil(this.state.players.length / 2);
        
        if (this.state.tempData.skipVotes.size >= votesNeeded) {
            // Пропускаем игрока
            this.nextTurn();
            GameUI.showNotification('Игрок пропущен', 'warning');
        } else {
            // Показываем сколько голосов набрано
            const remaining = votesNeeded - this.state.tempData.skipVotes.size;
            GameUI.showNotification(`Голосов за пропуск: ${this.state.tempData.skipVotes.size}/${votesNeeded}`, 'info');
        }
    },

    // ===== ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ UI =====

    getCurrentState() {
        return { ...this.state };
    },

    getCurrentPlayer() {
        return this.state.players[this.state.currentPlayerIndex];
    },

    getPlayerScore(playerId) {
        const player = this.state.players.find(p => p.id === playerId);
        return player ? player.score : 0;
    },

    getTeamScore(teamId) {
        return this.state.teamScores[teamId] || 0;
    },

    isGameActive() {
        return this.state.gameActive;
    },

    isPaused() {
        return this.state.isPaused;
    },

    getGamePhase() {
        return this.state.gamePhase;
    },

    getTimeLeft() {
        return this.state.timeLeft;
    },

    getTotalTime() {
        return this.state.totalTime;
    }
};

// ===== ИНТЕРФЕЙС ПОЛЬЗОВАТЕЛЯ =====

const GameUI = {
    init() {
        console.log('🎨 Инициализация интерфейса...');
        
        // Инициализация темы
        this.initTheme();
        
        // Инициализация звуков
        this.initAudio();
        
        // Настройка обработчиков для UI элементов
        this.setupUIListeners();
    },

    initTheme() {
        const config = GameData.loadSettings();
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = config.theme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', theme);
    },

    initAudio() {
        // Инициализация Web Audio API при первом взаимодействии
        document.addEventListener('click', () => {
            if (window.AudioContext && !this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    },

    setupUIListeners() {
        // Закрытие уведомлений
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                e.target.closest('.notification').remove();
            }
        });
        
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close')) {
                this.hideModal();
            }
        });
        
        // Переключение вкладок в менеджере слов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            }
        });
    },

    // ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====

    showScreen(screenId) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Скрываем меню паузы и модальные окна
        this.hidePauseMenu();
        this.hideModal();
        
        // Показываем нужный экран
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
        
        // Добавляем анимацию появления
        setTimeout(() => {
            screen.classList.add('visible');
        }, 10);
    },

    // ===== ИГРОВОЙ ИНТЕРФЕЙС =====

    updateGamePhase(phase) {
        // Скрываем все фазы
        document.querySelectorAll('.game-phase').forEach(phaseEl => {
            phaseEl.classList.remove('active');
        });
        
        // Показываем нужную фазу
        const phaseEl = document.getElementById(`phase-${phase}`);
        if (phaseEl) {
            phaseEl.classList.add('active');
        }
        
        // Обновляем заголовок в зависимости от фазы
        this.updatePhaseTitle(phase);
    },

    updatePhaseTitle(phase) {
        const titles = {
            'pass': 'Передача телефона',
            'word': 'Посмотрите слово',
            'guess': 'Угадывание',
            'result': 'Результат',
            'gameover': 'Игра окончена'
        };
        
        // Можно обновлять заголовок страницы или другой элемент
    },

    updateCurrentPlayer(player, current, total) {
        document.getElementById('current-player-info').textContent = player.name;
        document.getElementById('current-score-info').textContent = player.score.toFixed(1);
        document.getElementById('round-info').textContent = `${current}/${total}`;
    },

    updatePlayersList(players, currentIndex) {
        const list = document.getElementById('game-players-list');
        if (!list) return;
        
        list.innerHTML = players.map((player, index) => `
            <div class="player-card ${index === currentIndex ? 'active' : ''}">
                <div class="player-card-avatar" style="background: ${player.color}">
                    <i class="${player.icon}"></i>
                </div>
                <div class="player-card-info">
                    <div class="player-card-name">${player.name}</div>
                    <div class="player-card-score">
                        ${player.score.toFixed(1)} очков
                        ${player.streak > 1 ? `<span class="streak">🔥 ${player.streak}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateWordDisplay(word) {
        document.getElementById('current-word').textContent = word.word;
        document.getElementById('word-category').textContent = word.category;
        
        // Обновляем звездочки сложности
        const stars = GameData.getDifficultyStars(word.difficulty);
        const starsElement = document.getElementById('word-difficulty');
        starsElement.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('i');
            star.className = i < GameData.getDifficultyInfo(word.difficulty).stars ? 'fas fa-star' : 'far fa-star';
            starsElement.appendChild(star);
        }
        
        // Обновляем подсказку
        document.getElementById('word-hint-text').textContent = 
            'Подсказка появится через 30 секунд';
    },

    updateTimer(timeLeft, totalTime) {
        const display = document.getElementById('timer-display');
        if (display) {
            display.textContent = timeLeft;
        }
        
        // Обновляем круговой прогресс
        const progress = document.getElementById('timer-progress');
        if (progress) {
            const circumference = 283; // 2 * π * r (r = 45)
            const offset = circumference - (timeLeft / totalTime * circumference);
            progress.style.strokeDashoffset = offset;
        }
    },

    updateTimerCritical(isCritical) {
        const timer = document.getElementById('timer-display');
        const progress = document.getElementById('timer-progress');
        
        if (isCritical) {
            timer?.classList.add('critical');
            progress?.classList.add('critical');
            progress?.style.setProperty('stroke', 'var(--danger-500)');
        } else {
            timer?.classList.remove('critical');
            progress?.classList.remove('critical');
            progress?.style.setProperty('stroke', 'var(--secondary-500)');
        }
    },

    showWordHint(hint) {
        const hintElement = document.getElementById('word-hint-text');
        if (hintElement) {
            hintElement.textContent = hint;
            hintElement.parentElement.classList.add('shown');
        }
    },

    showTimeAdded(seconds) {
        // Создаем всплывающее уведомление
        const notification = document.createElement('div');
        notification.className = 'time-added-notification';
        notification.textContent = `+${seconds}с`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--secondary-500);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeOut 1s forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1000);
    },

    // ===== МЕНЮ ПАУЗЫ =====

    showPauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.add('active');
        }
    },

    hidePauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.remove('active');
        }
    },

    // ===== ЭКРАН ОКОНЧАНИЯ ИГРЫ =====

    updateGameOverScreen(stats) {
        // Обновляем информацию о победителе
        document.getElementById('winner-name').innerHTML = `
            <div class="winner-avatar" style="background: ${stats.winner.color}">
                <i class="${stats.winner.icon}"></i>
            </div>
            <h3>${stats.winner.name}</h3>
        `;
        document.getElementById('winner-score').textContent = `${stats.winner.score.toFixed(1)} очков`;
        
        // Обновляем общую статистику
        document.getElementById('total-game-time').textContent = stats.gameDuration;
        document.getElementById('words-guessed-total').textContent = 
            `${stats.wordsGuessed}/${stats.totalWords} (${stats.guessedPercentage}%)`;
        document.getElementById('players-total').textContent = stats.players.length;
        
        // Обновляем таблицу лидеров
        const leaderboard = document.getElementById('final-leaderboard');
        if (leaderboard) {
            leaderboard.innerHTML = `
                <div class="leaderboard-header">
                    <span>Игрок</span>
                    <span>Очки</span>
                </div>
                ${stats.players.map((player, index) => `
                    <div class="leaderboard-item">
                        <div class="player-rank ${index < 3 ? ['gold', 'silver', 'bronze'][index] : ''}">
                            ${index + 1}
                        </div>
                        <div class="leaderboard-player">
                            <div class="leaderboard-avatar" style="background: ${player.color}">
                                <i class="${player.icon}"></i>
                            </div>
                            <span class="leaderboard-name">${player.name}</span>
                        </div>
                        <div class="leaderboard-score">${player.score.toFixed(1)}</div>
                    </div>
                `).join('')}
            `;
        }
    },

    // ===== УВЕДОМЛЕНИЯ =====

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${this.getNotificationTitle(type)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    },

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    getNotificationTitle(type) {
        const titles = {
            'success': 'Успех!',
            'error': 'Ошибка!',
            'warning': 'Внимание!',
            'info': 'Информация'
        };
        return titles[type] || 'Уведомление';
    },

    // ===== МОДАЛЬНЫЕ ОКНА =====

    showModal(title, content, buttons = []) {
        const modalContent = document.getElementById('modal-content');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${buttons.length > 0 ? `
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="modal-btn ${btn.type || 'secondary'}" data-action="${btn.action}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        document.getElementById('modal-overlay').classList.add('active');
        
        // Назначаем обработчики для кнопок
        modalContent.querySelectorAll('.modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleModalAction(action);
            });
        });
    },

    hideModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    handleModalAction(action) {
        this.hideModal();
        
        switch(action) {
            case 'confirm':
                // Действие при подтверждении
                break;
            case 'cancel':
                // Действие при отмене
                break;
            // Добавьте другие действия по мере необходимости
        }
    },

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

    switchTab(tabId) {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показываем выбранную вкладку
        document.getElementById(`tab-${tabId}`)?.classList.add('active');
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
    },

    // ===== ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ДВИЖКА =====

    toggleSound() {
        const config = GameData.loadSettings();
        const newState = !config.soundEnabled;
        GameEngine.toggleSound(newState);
        
        // Обновляем иконку
        const icon = document.getElementById('sound-icon');
        if (icon) {
            icon.className = newState ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    },

    pauseGame() {
        GameEngine.pauseGame();
    },

    resumeGame() {
        GameEngine.resumeGame();
    },

    restartGame() {
        GameEngine.restartGame();
    },

    showSettings() {
        GameEngine.showSettings();
    },

    showStats() {
        GameEngine.showStats();
    },

    addTime(seconds) {
        GameEngine.addTime(seconds);
    },

    pauseTimer() {
        GameEngine.pauseTimer();
    },

    showHint() {
        GameEngine.showHint();
    },

    changeWord() {
        GameEngine.changeWord();
    },

    skipPlayer() {
        GameEngine.skipPlayer();
    },

    // ===== СИСТЕМНЫЕ ФУНКЦИИ =====

    resetStats() {
        if (confirm('Вы уверены, что хотите сбросить всю статистику? Это действие нельзя отменить.')) {
            GameData.resetStats();
            this.showNotification('Статистика сброшена', 'success');
            GameEngine.updateStatsScreen();
        }
    },

    exportData() {
        const data = GameData.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `whoami-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Данные экспортированы', 'success');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = GameData.importData(e.target.result);
                    if (result.success) {
                        this.showNotification('Данные успешно импортированы', 'success');
                        GameEngine.updateMainMenuStats();
                    } else {
                        this.showNotification(result.message, 'error');
                    }
                } catch (error) {
                    this.showNotification('Ошибка при импорте данных', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },

    rateApp() {
        this.showModal('Оцените приложение', `
            <p>Если вам нравится игра "Кто я?", пожалуйста, оцените её!</p>
            <p>Ваша оценка поможет другим людям найти эту игру.</p>
        `, [
            { text: 'Позже', type: 'secondary', action: 'cancel' },
            { text: 'Оценить', type: 'primary', action: 'rate' }
        ]);
    },

    shareApp() {
        if (navigator.share) {
            navigator.share({
                title: 'Игра "Кто я?"',
                text: 'Играйте в увлекательную игру "Кто я?" с друзьями на одном устройстве!',
                url: window.location.href
            }).catch(console.error);
        } else {
            this.showNotification('Функция "Поделиться" недоступна в вашем браузере', 'info');
        }
    },

    sendFeedback() {
        const email = 'feedback@whoami-game.com';
        const subject = 'Отзыв об игре "Кто я?"';
        const body = `\n\n---\nВерсия приложения: ${GameData.version}\nБраузер: ${navigator.userAgent}`;
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },

    showHelp(context) {
        const helpTexts = {
            'setup': `
                <h4>Настройка игры</h4>
                <p><strong>Игроки:</strong> Добавьте всех участников игры. Минимум 2 игрока.</p>
                <p><strong>Режимы:</strong> Выберите тип игры. Классический - без очков, Соревновательный - с подсчетом очков.</p>
                <p><strong>Таймер:</strong> Установите время на угадывание одного слова.</p>
                <p><strong>Категории:</strong> Выберите темы слов для игры.</p>
            `,
            'game': `
                <h4>Как играть?</h4>
                <p>1. Передайте телефон так, чтобы угадывающий игрок не видел экран.</p>
                <p>2. Все остальные смотрят слово на экране.</p>
                <p>3. Угадывающий задает вопросы, на которые можно отвечать только "Да/Нет".</p>
                <p>4. Постарайтесь угадать слово до истечения времени!</p>
            `
        };
        
        this.showModal('Помощь', helpTexts[context] || 'Помощь недоступна для этого раздела', [
            { text: 'Закрыть', type: 'primary', action: 'cancel' }
        ]);
    }
};

// ===== ГЛОБАЛЬНЫЙ ЭКСПОРТ =====

// Делаем доступным из глобальной области видимости
window.GameEngine = GameEngine;
window.GameUI = GameUI;
window.GameData = GameData;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }
        }
        
        @keyframes slideOutRight {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .time-added-notification {
            animation: fadeOut 1s forwards;
        }
    `;
    document.head.appendChild(style);
    
    // Запускаем игру
    GameEngine.init();
});

// Добавляем обработчик для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Добавляем поддержку полноэкранного режима
document.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen().catch(console.error);
    }
});

// Сохраняем состояние при закрытии
window.addEventListener('beforeunload', (e) => {
    if (GameEngine.state.gameActive) {
        e.preventDefault();
        e.returnValue = 'Игра еще идет! Вы уверены, что хотите уйти?';
        
        // Сохраняем текущее состояние игры
        localStorage.setItem('whoami_game_state', JSON.stringify({
            state: GameEngine.state,
            timestamp: Date.now()
        }));
    }
});

// Восстанавливаем состояние при загрузке
window.addEventListener('load', () => {
    const savedState = localStorage.getItem('whoami_game_state');
    if (savedState) {
        try {
            const { state, timestamp } = JSON.parse(savedState);
            
            // Проверяем, не прошло ли слишком много времени
            const hoursPassed = (Date.now() - timestamp) / (1000 * 60 * 60);
            if (hoursPassed < 1) { // Восстанавливаем если прошло меньше часа
                if (confirm('Найдена незавершенная игра. Хотите продолжить?')) {
                    GameEngine.state = state;
                    GameEngine.showScreen('game-screen');
                    GameEngine.resumeGame();
                }
            }
            
            // Очищаем сохраненное состояние
            localStorage.removeItem('whoami_game_state');
        } catch (error) {
            console.error('Ошибка восстановления состояния:', error);
        }
    }
});