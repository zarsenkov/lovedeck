// МОДЕРНИЗИРОВАННАЯ ИГРОВАЯ ЛОГИКА "КРОКОДИЛ" - ИСПРАВЛЕННАЯ ВЕРСИЯ

class CrocodileGame {
    constructor() {
        // Конфигурация игры
        this.config = {
            playerCount: 4,
            gameMode: 'classic', // classic, teams, hotseat
            timePerWord: 60,
            scoreLimit: 20,
            difficulty: 'medium', // easy, medium, hard, mixed
            categories: ['animals', 'objects', 'actions', 'professions'],
            customWords: [],
            noRepeatWords: true,
            showCategory: true,
            showDifficulty: true,
            autoSkip: true,
            soundEffects: true,
            vibration: true,
            autoTimer: 10,
            teamNames: ['Команда А', 'Команда Б']
        };

        // Состояние игры
        this.state = {
            phase: 'setup',
            players: [],
            teams: [],
            currentPlayerIndex: 0,
            currentWord: null,
            usedWords: [],
            scores: {},
            gameLog: [],
            timers: {},
            round: 1,
            turn: 1,
            wordsGuessed: 0,
            wordsShown: 0,
            hotseatStreak: 0,
            gameStartTime: null,
            actingStartTime: null,
            gameStats: {
                totalTime: 0,
                totalWords: 0,
                successRate: 0
            }
        };

        // Инициализация
        this.init();
    }

    // Инициализация игры
    init() {
        console.log('🔄 Инициализация игры "Крокодил"');
        
        // Загрузить сохранённые настройки
        this.loadConfig();
        
        // Привязать события
        this.bindEvents();
        
        // Загрузить категории
        this.loadCategories();
        
        // Инициализировать UI
        this.initUI();
        
        this.addLog('🎮 Игра "Крокодил" готова!');
    }

    // Загрузка сохранённой конфигурации
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('crocodile_config');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig };
                console.log('✅ Конфигурация загружена:', this.config);
            }
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки конфигурации:', error);
        }
    }

    // Сохранение конфигурации
    saveConfig() {
        try {
            localStorage.setItem('crocodile_config', JSON.stringify(this.config));
            console.log('💾 Конфигурация сохранена');
        } catch (error) {
            console.warn('⚠️ Ошибка сохранения конфигурации:', error);
        }
    }

    // Привязка событий
    bindEvents() {
        console.log('🔗 Привязка событий...');
        
        // Навигация
        document.getElementById('soundToggle')?.addEventListener('click', () => this.toggleSound());
        document.getElementById('helpBtn')?.addEventListener('click', () => this.showHelp());
        document.getElementById('closeHelpModal')?.addEventListener('click', () => this.hideHelp());
        document.getElementById('closeModalBtn')?.addEventListener('click', () => this.hideHelp());
        
        // Настройка игроков
        document.getElementById('decreasePlayers')?.addEventListener('click', () => this.updatePlayerCount(-1));
        document.getElementById('increasePlayers')?.addEventListener('click', () => this.updatePlayerCount(1));
        document.getElementById('playerRange')?.addEventListener('input', (e) => this.updatePlayerCount(parseInt(e.target.value)));
        
        // Режимы игры
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectGameMode(e.currentTarget.dataset.mode));
        });
        
        // Время на слово
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTimePreset(e.currentTarget));
        });
        document.getElementById('customTime')?.addEventListener('input', (e) => this.updateCustomTime(e.target.value));
        
        // Лимит очков
        document.querySelectorAll('.limit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectLimitPreset(e.currentTarget));
        });
        document.getElementById('customLimit')?.addEventListener('input', (e) => this.updateCustomLimit(e.target.value));
        
        // Сложность
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.selectDifficulty(e.target.value));
        });
        
        // Категории
        document.getElementById('selectAllCategories')?.addEventListener('change', (e) => this.toggleAllCategories(e.target.checked));
        document.getElementById('addCategoryBtn')?.addEventListener('click', () => this.showAddCategoryModal());
        
        // Свои слова
        document.getElementById('customWordsInput')?.addEventListener('input', (e) => this.updateCustomWords(e.target.value));
        
        // Дополнительные настройки
        document.getElementById('noRepeatWords')?.addEventListener('change', (e) => this.config.noRepeatWords = e.target.checked);
        document.getElementById('showCategory')?.addEventListener('change', (e) => this.config.showCategory = e.target.checked);
        document.getElementById('showDifficulty')?.addEventListener('change', (e) => this.config.showDifficulty = e.target.checked);
        document.getElementById('autoSkip')?.addEventListener('change', (e) => this.config.autoSkip = e.target.checked);
        document.getElementById('soundEffects')?.addEventListener('change', (e) => this.config.soundEffects = e.target.checked);
        document.getElementById('vibration')?.addEventListener('change', (e) => this.config.vibration = e.target.checked);
        
        // Старт игры
        document.getElementById('startGameBtn')?.addEventListener('click', () => this.startGame());
        
        // Игровой процесс
        document.getElementById('showWordBtn')?.addEventListener('click', () => this.showWord());
        document.getElementById('skipTurnBtn')?.addEventListener('click', () => this.skipTurn());
        document.getElementById('startActingBtn')?.addEventListener('click', () => this.startActing());
        document.getElementById('skipWordBtn')?.addEventListener('click', () => this.skipWord());
        document.getElementById('successBtn')?.addEventListener('click', () => this.wordSuccess());
        document.getElementById('nextWordBtn')?.addEventListener('click', () => this.nextWord());
        document.getElementById('failBtn')?.addEventListener('click', () => this.wordFail());
        document.getElementById('nextTurnBtn')?.addEventListener('click', () => this.nextTurn());
        document.getElementById('viewScoreboardBtn')?.addEventListener('click', () => this.showScoreboard());
        
        // Таблица очков
        document.getElementById('continueGameBtn')?.addEventListener('click', () => this.continueGame());
        document.getElementById('endGameBtn')?.addEventListener('click', () => this.endGame());
        
        // Итоги
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.playAgain());
        document.getElementById('newSettingsBtn')?.addEventListener('click', () => this.newSettings());
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => window.location.href = '../../index.html');
        
        console.log('✅ События привязаны');
    }

    // Загрузка категорий в UI
    loadCategories() {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        const categories = CrocodileDatabase.getAllCategories();
        
        categories.forEach(category => {
            const wordCount = CrocodileDatabase.getCategoryWordCount(category.id);
            const isSelected = this.config.categories.includes(category.id);
            
            const categoryElement = document.createElement('div');
            categoryElement.className = `category-item ${isSelected ? 'selected' : ''}`;
            categoryElement.dataset.category = category.id;
            
            categoryElement.innerHTML = `
                <div class="category-icon" style="background: ${category.color}">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-count">${wordCount} слов</div>
                </div>
                <div class="category-checkbox ${isSelected ? 'checked' : ''}">
                    <i class="fas fa-check"></i>
                </div>
            `;
            
            categoryElement.addEventListener('click', () => this.toggleCategory(category.id));
            container.appendChild(categoryElement);
        });
        
        console.log(`📁 Загружено ${categories.length} категорий`);
    }

    // Инициализация UI
    initUI() {
        // Обновить количество игроков
        this.updatePlayerCountDisplay();
        
        // Выбрать первый режим
        this.selectGameMode('classic');
        
        // Выбрать время по умолчанию
        this.selectTimePreset(document.querySelector('.time-btn.active'));
        
        // Выбрать лимит по умолчанию
        this.selectLimitPreset(document.querySelector('.limit-btn.active'));
        
        // Обновить кастомные слова
        this.updateCustomWordsCount();
        
        console.log('✅ UI инициализирован');
    }

    // Обновить отображение количества игроков
    updatePlayerCountDisplay() {
        const playerCountElement = document.getElementById('playerCount');
        const playerRange = document.getElementById('playerRange');
        
        if (playerCountElement) {
            playerCountElement.textContent = this.config.playerCount;
        }
        
        if (playerRange) {
            playerRange.value = this.config.playerCount;
        }
        
        // Обновить распределение по командам
        this.updateTeamDistribution();
    }

    // Обновить количество игроков
    updatePlayerCount(changeOrValue) {
        let newCount;
        
        if (typeof changeOrValue === 'number') {
            if (Math.abs(changeOrValue) === 1) {
                // Изменение на ±1
                newCount = this.config.playerCount + changeOrValue;
            } else {
                // Прямое значение
                newCount = changeOrValue;
            }
        } else {
            newCount = parseInt(changeOrValue);
        }
        
        // Проверка границ
        newCount = Math.max(CrocodileDatabase.constants.MIN_PLAYERS, 
                          Math.min(CrocodileDatabase.constants.MAX_PLAYERS, newCount));
        
        this.config.playerCount = newCount;
        this.updatePlayerCountDisplay();
        
        console.log(`👥 Количество игроков: ${newCount}`);
    }

    // Обновить распределение по командам
    updateTeamDistribution() {
        if (this.config.gameMode !== 'teams') return;
        
        const teamACount = Math.floor(this.config.playerCount / 2);
        const teamBCount = this.config.playerCount - teamACount;
        
        document.querySelectorAll('.team-count .count-value').forEach((span, index) => {
            span.textContent = index === 0 ? teamACount : teamBCount;
        });
    }

    // Выбор режима игры
    selectGameMode(mode) {
        this.config.gameMode = mode;
        
        // Обновить UI
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.toggle('active', card.dataset.mode === mode);
        });
        
        // Показать/скрыть настройку команд
        const teamSetup = document.getElementById('teamSetup');
        if (teamSetup) {
            teamSetup.style.display = mode === 'teams' ? 'block' : 'none';
        }
        
        // Обновить статус
        this.updateStatus('mode', this.getModeName(mode));
        
        console.log(`🎮 Режим игры: ${this.getModeName(mode)}`);
    }

    // Выбор времени на слово
    selectTimePreset(button) {
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const time = parseInt(button.dataset.time);
        this.config.timePerWord = time;
        
        // Обновить кастомное поле
        const customTimeInput = document.getElementById('customTime');
        if (customTimeInput) {
            customTimeInput.value = time;
        }
        
        // Обновить статус
        this.updateStatus('time', `${time} сек`);
        
        console.log(`⏱️ Время на слово: ${time} сек`);
    }

    // Обновить кастомное время
    updateCustomTime(value) {
        const time = parseInt(value) || 60;
        this.config.timePerWord = Math.max(10, Math.min(300, time));
        
        // Обновить активную кнопку
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === this.config.timePerWord) {
                btn.classList.add('active');
            }
        });
        
        console.log(`⏱️ Кастомное время: ${this.config.timePerWord} сек`);
    }

    // Выбор лимита очков
    selectLimitPreset(button) {
        document.querySelectorAll('.limit-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const limit = parseInt(button.dataset.limit);
        this.config.scoreLimit = limit;
        
        // Обновить кастомное поле
        const customLimitInput = document.getElementById('customLimit');
        if (customLimitInput) {
            customLimitInput.value = limit || 20;
        }
        
        console.log(`🎯 Лимит очков: ${limit === 0 ? 'Без лимита' : limit}`);
    }

    // Обновить кастомный лимит
    updateCustomLimit(value) {
        const limit = parseInt(value) || 20;
        this.config.scoreLimit = Math.max(5, Math.min(100, limit));
        
        // Обновить активную кнопку
        document.querySelectorAll('.limit-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.limit) === this.config.scoreLimit) {
                btn.classList.add('active');
            }
        });
    }

    // Выбор сложности
    selectDifficulty(difficulty) {
        this.config.difficulty = difficulty;
        console.log(`📊 Сложность: ${this.getDifficultyName(difficulty)}`);
    }

    // Переключение всех категорий
    toggleAllCategories(checked) {
        const categories = CrocodileDatabase.getAllCategories();
        
        if (checked) {
            this.config.categories = categories.map(cat => cat.id);
        } else {
            this.config.categories = [];
        }
        
        // Обновить UI
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.toggle('selected', checked);
            item.querySelector('.category-checkbox').classList.toggle('checked', checked);
        });
        
        console.log(`📁 ${checked ? 'Выбраны' : 'Сняты'} все категории`);
    }

    // Переключение категории
    toggleCategory(categoryId) {
        const index = this.config.categories.indexOf(categoryId);
        const isSelected = index > -1;
        
        if (isSelected) {
            this.config.categories.splice(index, 1);
        } else {
            this.config.categories.push(categoryId);
        }
        
        // Обновить UI
        const categoryElement = document.querySelector(`.category-item[data-category="${categoryId}"]`);
        if (categoryElement) {
            categoryElement.classList.toggle('selected');
            categoryElement.querySelector('.category-checkbox').classList.toggle('checked');
        }
        
        console.log(`📁 Категория "${categoryId}": ${isSelected ? 'снята' : 'выбрана'}`);
    }

    // Показать модальное окно добавления категории
    showAddCategoryModal() {
        // В будущей версии можно реализовать добавление своих категорий
        alert('В будущих обновлениях вы сможете добавлять свои категории слов! 🎉');
    }

    // Обновить пользовательские слова
    updateCustomWords(text) {
        this.config.customWords = CrocodileDatabase.parseCustomWords(text);
        this.updateCustomWordsCount();
    }

    // Обновить счётчик пользовательских слов
    updateCustomWordsCount() {
        const countElement = document.getElementById('customWordsCount');
        if (countElement) {
            countElement.textContent = this.config.customWords.length;
        }
    }

    // Начать игру
    startGame() {
        console.log('🚀 Начало игры...');
        
        // Валидация
        if (!this.validateSettings()) {
            return;
        }
        
        // Сохранить конфигурацию
        this.saveConfig();
        
        // Создать игроков и команды
        this.createPlayersAndTeams();
        
        // Инициализировать состояние игры
        this.state.gameStartTime = Date.now();
        this.state.round = 1;
        this.state.turn = 1;
        this.state.usedWords = [];
        this.state.wordsGuessed = 0;
        this.state.wordsShown = 0;
        this.state.hotseatStreak = 0;
        
        // Перейти к экрану передачи телефона
        this.showScreen('handoff');
        this.prepareNextTurn();
        
        // Обновить статус
        this.updateStatusPanel();
        
        this.addLog('🎮 Игра началась!');
        this.addLog(`👥 Игроков: ${this.config.playerCount}`);
        this.addLog(`🎮 Режим: ${this.getModeName(this.config.gameMode)}`);
    }

    // Проверка настроек перед началом игры
    validateSettings() {
        // Количество игроков
        if (this.config.playerCount < CrocodileDatabase.constants.MIN_PLAYERS) {
            this.showError(`Минимальное количество игроков: ${CrocodileDatabase.constants.MIN_PLAYERS}`);
            return false;
        }
        
        // Категории
        if (this.config.categories.length === 0 && this.config.customWords.length === 0) {
            this.showError('Выберите хотя бы одну категорию или добавьте свои слова');
            return false;
        }
        
        // Время на слово
        if (this.config.timePerWord < 10) {
            this.showError('Минимальное время на слово: 10 секунд');
            return false;
        }
        
        return true;
    }

    // Создать игроков и команды
    createPlayersAndTeams() {
        // Создать игроков
        this.state.players = [];
        for (let i = 1; i <= this.config.playerCount; i++) {
            this.state.players.push({
                id: i,
                name: `Игрок ${i}`,
                score: 0,
                wordsGuessed: 0,
                wordsShown: 0,
                teamId: null,
                active: true
            });
        }
        
        // Создать команды
        this.state.teams = [];
        
        switch (this.config.gameMode) {
            case 'teams':
                // Распределить игроков по командам
                this.state.players.forEach((player, index) => {
                    player.teamId = index % 2;
                });
                
                // Создать команды
                for (let i = 0; i < 2; i++) {
                    const teamPlayers = this.state.players.filter(p => p.teamId === i);
                    this.state.teams.push({
                        id: i,
                        name: this.config.teamNames[i] || `Команда ${i + 1}`,
                        score: 0,
                        players: teamPlayers.map(p => p.id)
                    });
                }
                break;
                
            case 'classic':
                // В классическом режиме у каждого своя "команда"
                this.state.teams = this.state.players.map(player => ({
                    id: player.id,
                    name: player.name,
                    score: 0,
                    players: [player.id]
                }));
                break;
                
            case 'hotseat':
                // В hotseat режиме только одна "команда" для ведущего
                this.state.teams = [{
                    id: 0,
                    name: 'Ведущий',
                    score: 0,
                    players: []
                }];
                break;
        }
        
        console.log(`👥 Создано ${this.state.players.length} игроков`);
        console.log(`🏆 Создано ${this.state.teams.length} команд`);
    }

    // Подготовить следующий ход
    prepareNextTurn() {
        // Найти следующего активного игрока
        let nextIndex = this.findNextPlayerIndex();
        
        if (nextIndex === -1) {
            // Все игроки неактивны (теоретически невозможно)
            this.endGame();
            return;
        }
        
        this.state.currentPlayerIndex = nextIndex;
        const currentPlayer = this.getCurrentPlayer();
        
        // Выбрать новое слово
        this.selectNewWord();
        
        // Обновить UI
        this.updateHandoffScreen(currentPlayer);
        
        // Обновить статус
        this.updateStatus('round', `Раунд ${this.state.round}`);
        this.updateStatus('player', currentPlayer.name);
        
        this.addLog(`👤 Ход переходит к: ${currentPlayer.name}`);
    }

    // Найти индекс следующего игрока
    findNextPlayerIndex() {
        const totalPlayers = this.state.players.length;
        
        for (let i = 1; i <= totalPlayers; i++) {
            const checkIndex = (this.state.currentPlayerIndex + i) % totalPlayers;
            const player = this.state.players[checkIndex];
            
            if (player.active) {
                return checkIndex;
            }
        }
        
        return -1;
    }

    // Получить текущего игрока
    getCurrentPlayer() {
        return this.state.players[this.state.currentPlayerIndex] || this.state.players[0];
    }

    // Выбрать новое слово
    selectNewWord() {
        let availableWords = [];
        
        // Собрать слова из выбранных категорий
        if (this.config.categories.length > 0) {
            this.config.categories.forEach(categoryId => {
                const words = CrocodileDatabase.getCategoryWords(
                    categoryId, 
                    this.config.difficulty
                );
                const category = CrocodileDatabase.getCategoryInfo(categoryId);
                
                words.forEach(word => {
                    availableWords.push({
                        ...word,
                        category: categoryId,
                        categoryName: category?.name || categoryId
                    });
                });
            });
        }
        
        // Добавить пользовательские слова
        if (this.config.customWords.length > 0) {
            availableWords = availableWords.concat(this.config.customWords);
        }
        
        // Исключить использованные слова
        if (this.config.noRepeatWords && this.state.usedWords.length > 0) {
            availableWords = availableWords.filter(word => 
                !this.state.usedWords.includes(word.word)
            );
        }
        
        // Если слова закончились, очистить список использованных
        if (availableWords.length === 0 && this.config.noRepeatWords) {
            this.state.usedWords = [];
            // Повторить выбор
            this.selectNewWord();
            return;
        }
        
        // Выбрать случайное слово
        if (availableWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableWords.length);
            this.state.currentWord = availableWords[randomIndex];
            
            // Добавить в использованные
            if (this.config.noRepeatWords) {
                this.state.usedWords.push(this.state.currentWord.word);
            }
        } else {
            // Запасное слово
            this.state.currentWord = {
                word: "Крокодил",
                hint: "Игра, в которую вы играете",
                difficulty: "easy",
                category: "animals",
                categoryName: "Животные"
            };
        }
        
        console.log(`🎲 Выбрано слово: ${this.state.currentWord.word}`);
    }

    // Обновить экран передачи телефона
    updateHandoffScreen(player) {
        // Имя игрока
        document.getElementById('currentPlayerName').textContent = player.name;
        
        // Очки и статистика
        document.getElementById('playerScore').textContent = player.score;
        document.getElementById('playerGuessed').textContent = player.wordsGuessed;
        document.getElementById('playerShown').textContent = player.wordsShown;
        
        // Информация о команде
        const teamBadge = document.getElementById('teamBadge');
        if (this.config.gameMode === 'teams' && player.teamId !== null) {
            const team = this.state.teams[player.teamId];
            if (team) {
                document.getElementById('currentTeam').textContent = team.name;
                teamBadge.style.display = 'flex';
            }
        } else {
            teamBadge.style.display = 'none';
        }
    }

    // Показать слово
    showWord() {
        if (!this.state.currentWord) {
            this.selectNewWord();
        }
        
        this.showScreen('word');
        
        // Обновить слово
        this.updateWordDisplay();
        
        // Запустить таймер автоперехода
        if (this.config.autoSkip) {
            this.startAutoTimer();
        }
        
        this.addLog(`👤 ${this.getCurrentPlayer().name} увидел слово`);
    }

    // Обновить отображение слова
    updateWordDisplay() {
        const word = this.state.currentWord;
        if (!word) return;
        
        // Текст слова
        document.getElementById('wordText').textContent = word.word;
        
        // Категория
        const categoryDisplay = document.getElementById('categoryDisplay');
        if (this.config.showCategory) {
            document.getElementById('wordCategory').textContent = word.categoryName;
            categoryDisplay.style.display = 'flex';
        } else {
            categoryDisplay.style.display = 'none';
        }
        
        // Сложность
        const difficultyDisplay = document.getElementById('difficultyDisplay');
        if (this.config.showDifficulty) {
            document.getElementById('wordDifficulty').textContent = 
                this.getDifficultyName(word.difficulty);
            difficultyDisplay.style.display = 'flex';
        } else {
            difficultyDisplay.style.display = 'none';
        }
    }

    // Таймер автоперехода
    startAutoTimer() {
        this.stopTimer('auto');
        
        let timeLeft = this.config.autoTimer;
        const timerElement = document.getElementById('autoTimer');
        const secondsElement = document.getElementById('autoSeconds');
        const progressBar = document.querySelector('.progress-bar');
        
        // Обновить отображение
        if (timerElement) timerElement.textContent = timeLeft;
        if (secondsElement) secondsElement.textContent = timeLeft;
        
        if (progressBar) {
            const circumference = 2 * Math.PI * 54;
            progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
            progressBar.style.strokeDashoffset = circumference;
        }
        
        // Запустить таймер
        this.state.timers.auto = setInterval(() => {
            timeLeft--;
            
            // Обновить отображение
            if (timerElement) timerElement.textContent = timeLeft;
            if (secondsElement) secondsElement.textContent = timeLeft;
            
            // Обновить прогресс-бар
            if (progressBar) {
                const circumference = 2 * Math.PI * 54;
                const offset = circumference - (timeLeft / this.config.autoTimer) * circumference;
                progressBar.style.strokeDashoffset = offset;
            }
            
            // Конец таймера
            if (timeLeft <= 0) {
                this.stopTimer('auto');
                this.startActing();
            }
        }, 1000);
    }

    // Пропустить ход
    skipTurn() {
        const player = this.getCurrentPlayer();
        this.addLog(`⏭️ ${player.name} пропустил ход`);
        
        // Перейти к следующему игроку
        this.state.turn++;
        this.prepareNextTurn();
    }

    // Начать показ жестами
    startActing() {
        this.showScreen('acting');
        
        // Обновить секретное слово
        this.updateSecretWordDisplay();
        
        // Показать/скрыть счётчик серии для hotseat
        this.updateHotseatDisplay();
        
        // Запустить таймер показа
        this.startActingTimer();
        
        // Запомнить время начала
        this.state.actingStartTime = Date.now();
        this.state.wordsShown++;
        
        // Обновить статистику игрока
        const player = this.getCurrentPlayer();
        player.wordsShown++;
        
        this.addLog(`🎭 ${player.name} начал показывать слово`);
    }

    // Обновить отображение секретного слова
    updateSecretWordDisplay() {
        const word = this.state.currentWord;
        if (!word) return;
        
        document.getElementById('secretWord').textContent = word.word;
        document.getElementById('secretCategory').textContent = word.categoryName;
        document.getElementById('secretDifficulty').textContent = this.getDifficultyName(word.difficulty);
    }

    // Обновить отображение для hotseat режима
    updateHotseatDisplay() {
        const streakCounter = document.getElementById('streakCounter');
        
        if (this.config.gameMode === 'hotseat') {
            streakCounter.style.display = 'block';
            document.getElementById('hotseatStreak').textContent = this.state.hotseatStreak;
        } else {
            streakCounter.style.display = 'none';
        }
    }

    // Таймер показа жестами
    startActingTimer() {
        this.stopTimer('acting');
        
        let timeLeft = this.config.timePerWord;
        const timerElement = document.getElementById('actingTimeLeft');
        const progressBar = document.querySelector('.timer-progress');
        
        // Обновить отображение
        if (timerElement) timerElement.textContent = timeLeft;
        
        if (progressBar) {
            const circumference = 2 * Math.PI * 90;
            progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
            progressBar.style.strokeDashoffset = circumference;
        }
        
        // Запустить таймер
        this.state.timers.acting = setInterval(() => {
            timeLeft--;
            
            // Обновить отображение
            if (timerElement) timerElement.textContent = timeLeft;
            
            // Обновить прогресс-бар
            if (progressBar) {
                const circumference = 2 * Math.PI * 90;
                const offset = circumference - (timeLeft / this.config.timePerWord) * circumference;
                progressBar.style.strokeDashoffset = offset;
            }
            
            // Звуковые и вибрационные эффекты
            if (timeLeft === 10 && this.config.soundEffects) {
                this.playSound('warning');
            }
            
            if (timeLeft === 5 && this.config.vibration) {
                this.vibrate(200);
            }
            
            // Конец времени
            if (timeLeft <= 0) {
                this.stopTimer('acting');
                this.wordFail();
            }
        }, 1000);
    }

    // Пропустить слово
    skipWord() {
        this.stopTimer('acting');
        
        // Выбрать новое слово
        this.selectNewWord();
        
        // Вернуться к показу слова
        this.showScreen('word');
        this.updateWordDisplay();
        
        if (this.config.autoSkip) {
            this.startAutoTimer();
        }
        
        this.addLog(`⏭️ ${this.getCurrentPlayer().name} пропустил слово`);
    }

    // Успешное угадывание слова
    wordSuccess() {
        this.stopTimer('acting');
        
        const player = this.getCurrentPlayer();
        const timeUsed = Date.now() - this.state.actingStartTime;
        const secondsUsed = Math.floor(timeUsed / 1000);
        
        // Рассчитать очки
        let points = this.calculatePoints(secondsUsed);
        
        // Начислить очки
        this.addScore(player.id, points);
        
        // Обновить статистику
        player.wordsGuessed++;
        this.state.wordsGuessed++;
        
        // В hotseat режиме увеличить серию
        if (this.config.gameMode === 'hotseat') {
            this.state.hotseatStreak++;
        }
        
        // Показать результат
        this.showResult('success', points, secondsUsed);
        
        this.addLog(`✅ ${player.name} угадал слово "${this.state.currentWord.word}" (+${points} очков)`);
    }

    // Рассчитать очки
    calculatePoints(secondsUsed) {
        const word = this.state.currentWord;
        let points = CrocodileDatabase.constants.SCORE_WEIGHTS[word.difficulty] || 1;
        
        // Бонус за скорость
        const timeBonus = Math.max(0, this.config.timePerWord - secondsUsed);
        points += timeBonus * CrocodileDatabase.constants.SPEED_BONUS;
        
        // Множитель для hotseat
        if (this.config.gameMode === 'hotseat') {
            points *= (1 + (this.state.hotseatStreak * 0.5));
        }
        
        // Округлить
        return Math.round(points * 10) / 10;
    }

    // Неудачное угадывание
    wordFail() {
        this.stopTimer('acting');
        
        // В hotseat режиме сбросить серию
        if (this.config.gameMode === 'hotseat') {
            this.state.hotseatStreak = 0;
        }
        
        // Показать результат
        this.showResult('fail', 0, 0);
        
        this.addLog(`❌ ${this.getCurrentPlayer().name} не угадал слово "${this.state.currentWord.word}"`);
    }

    // Показать следующий раунд (для hotseat)
    nextWord() {
        this.stopTimer('acting');
        
        // Выбрать новое слово
        this.selectNewWord();
        
        // Обновить отображение
        this.updateSecretWordDisplay();
        this.updateHotseatDisplay();
        
        // Перезапустить таймер
        this.startActingTimer();
        
        // Обновить время начала
        this.state.actingStartTime = Date.now();
        this.state.wordsShown++;
        
        const player = this.getCurrentPlayer();
        player.wordsShown++;
        
        this.addLog(`🔄 ${player.name} взял новое слово`);
    }

    // Показать результат раунда
    showResult(type, points, secondsUsed) {
        this.showScreen('result');
        
        // Обновить заголовок
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultSubtitle = document.getElementById('resultSubtitle');
        
        if (type === 'success') {
            resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            resultTitle.textContent = '🎉 Успех!';
            resultSubtitle.textContent = 'Слово угадано!';
        } else {
            resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            resultTitle.textContent = '😔 Не угадали';
            resultSubtitle.textContent = 'Попробуйте ещё раз!';
        }
        
        // Обновить показанное слово
        this.updateRevealedWord();
        
        // Обновить начисленные очки
        this.updateScoreAward(type, points, secondsUsed);
        
        // Обновить статистику игрока
        this.updatePlayerStats();
        
        // Обновить общую статистику
        this.updateGameStats();
    }

    // Обновить показанное слово
    updateRevealedWord() {
        const word = this.state.currentWord;
        if (!word) return;
        
        document.getElementById('revealedWord').textContent = word.word;
        document.getElementById('revealedCategory').textContent = word.categoryName;
        document.getElementById('revealedDifficulty').textContent = this.getDifficultyName(word.difficulty);
    }

    // Обновить начисленные очки
    updateScoreAward(type, points, secondsUsed) {
        const awardAmount = document.getElementById('scoreAward');
        const awardReason = document.getElementById('awardReason');
        const awardTime = document.getElementById('awardTime');
        
        if (type === 'success') {
            awardAmount.textContent = `+${points} очков`;
            awardReason.textContent = `За угаданное слово (${this.getDifficultyName(this.state.currentWord.difficulty)})`;
            awardTime.textContent = `За ${secondsUsed} секунд`;
            awardTime.style.display = 'block';
        } else {
            awardAmount.textContent = '0 очков';
            awardReason.textContent = 'Слово не было угадано';
            awardTime.style.display = 'none';
        }
    }

    // Обновить статистику игрока
    updatePlayerStats() {
        const player = this.getCurrentPlayer();
        
        document.getElementById('currentScore').textContent = player.score;
        document.getElementById('wordsGuessed').textContent = player.wordsGuessed;
        document.getElementById('wordsShown').textContent = player.wordsShown;
        
        const successRate = player.wordsShown > 0 
            ? Math.round((player.wordsGuessed / player.wordsShown) * 100)
            : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;
    }

    // Обновить общую статистику
    updateGameStats() {
        document.getElementById('currentRound').textContent = this.state.round;
        document.getElementById('totalWordsShown').textContent = this.state.wordsShown;
        document.getElementById('totalWordsGuessed').textContent = this.state.wordsGuessed;
    }

    // Следующий ход
    nextTurn() {
        // Проверить лимит очков
        if (this.checkScoreLimit()) {
            this.endGame();
            return;
        }
        
        // Увеличить номер хода
        this.state.turn++;
        
        // Если прошли всех игроков, увеличить раунд
        if (this.state.currentPlayerIndex >= this.state.players.length - 1) {
            this.state.round++;
        }
        
        // Перейти к передаче телефона
        this.showScreen('handoff');
        this.prepareNextTurn();
    }

    // Проверить достижение лимита очков
    checkScoreLimit() {
        if (this.config.scoreLimit <= 0) return false;
        
        switch (this.config.gameMode) {
            case 'teams':
                return this.state.teams.some(team => team.score >= this.config.scoreLimit);
                
            case 'classic':
                return this.state.players.some(player => player.score >= this.config.scoreLimit);
                
            case 'hotseat':
                const currentPlayer = this.getCurrentPlayer();
                return currentPlayer.score >= this.config.scoreLimit;
        }
        
        return false;
    }

    // Показать таблицу очков
    showScoreboard() {
        this.showScreen('scoreboard');
        this.updateScoreboard();
    }

    // Обновить таблицу очков
    updateScoreboard() {
        // Общая информация
        document.getElementById('currentRoundInfo').textContent = `Раунд ${this.state.round}`;
        document.getElementById('timeLimitInfo').textContent = `${this.config.timePerWord} сек`;
        document.getElementById('modeInfo').textContent = this.getModeName(this.config.gameMode);
        
        // Общая статистика
        this.updateTotalStats();
        
        // Рейтинг
        this.updateRanking();
        
        // Следующий игрок
        this.updateNextPlayer();
    }

    // Обновить общую статистику
    updateTotalStats() {
        const gameTime = this.state.gameStartTime 
            ? Math.floor((Date.now() - this.state.gameStartTime) / 60000)
            : 0;
        
        document.getElementById('totalTime').textContent = gameTime;
        document.getElementById('totalWords').textContent = this.state.wordsShown;
        document.getElementById('guessedWords').textContent = this.state.wordsGuessed;
        
        const successPercentage = this.state.wordsShown > 0 
            ? Math.round((this.state.wordsGuessed / this.state.wordsShown) * 100)
            : 0;
        document.getElementById('successPercentage').textContent = `${successPercentage}%`;
    }

    // Обновить рейтинг
    updateRanking() {
        // Скрыть оба рейтинга
        document.getElementById('classicScoreboard').style.display = 'none';
        document.getElementById('teamsScoreboard').style.display = 'none';
        
        // Показать нужный рейтинг
        if (this.config.gameMode === 'teams') {
            this.updateTeamsRanking();
        } else {
            this.updatePlayersRanking();
        }
    }

    // Обновить рейтинг игроков
    updatePlayersRanking() {
        const container = document.getElementById('playersRanking');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Отсортировать игроков по очкам
        const sortedPlayers = [...this.state.players]
            .filter(p => p.active)
            .sort((a, b) => b.score - a.score);
        
        sortedPlayers.forEach((player, index) => {
            const isCurrent = player.id === this.getCurrentPlayer().id;
            
            const playerElement = document.createElement('div');
            playerElement.className = `player-rank ${isCurrent ? 'current' : ''} rank-${index + 1}`;
            
            playerElement.innerHTML = `
                <div class="rank-number">${index + 1}</div>
                <div class="player-info-small">
                    <div class="player-name">${player.name}</div>
                    <div class="player-stats-small">
                        <span>Слова: ${player.wordsShown}</span>
                        <span>Угадано: ${player.wordsGuessed}</span>
                    </div>
                </div>
                <div class="player-score">${player.score}</div>
            `;
            
            container.appendChild(playerElement);
        });
        
        document.getElementById('classicScoreboard').style.display = 'block';
    }

    // Обновить рейтинг команд
    updateTeamsRanking() {
        const container = document.getElementById('teamsRanking');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.teams.forEach((team, index) => {
            const teamPlayers = this.state.players.filter(p => team.players.includes(p.id));
            const currentPlayer = this.getCurrentPlayer();
            const isCurrent = team.players.includes(currentPlayer.id);
            
            const teamElement = document.createElement('div');
            teamElement.className = `team-rank ${isCurrent ? 'current' : ''}`;
            
            teamElement.innerHTML = `
                <div class="team-header">
                    <div class="team-color-circle" style="background: ${index === 0 ? '#3b82f6' : '#ef4444'}"></div>
                    <div class="team-name">${team.name}</div>
                </div>
                <div class="team-score">${team.score}</div>
                <div class="team-members">${teamPlayers.map(p => p.name).join(', ')}</div>
            `;
            
            container.appendChild(teamElement);
        });
        
        document.getElementById('teamsScoreboard').style.display = 'block';
    }

    // Обновить информацию о следующем игроке
    updateNextPlayer() {
        const nextPlayer = this.getCurrentPlayer();
        
        document.getElementById('nextPlayerName').textContent = nextPlayer.name;
        document.getElementById('nextPlayerScore').textContent = nextPlayer.score;
        document.getElementById('nextPlayerWords').textContent = nextPlayer.wordsShown;
    }

    // Продолжить игру
    continueGame() {
        this.showScreen('handoff');
    }

    // Завершить игру
    endGame() {
        this.showScreen('final');
        this.updateFinalResults();
    }

    // Обновить итоговые результаты
    updateFinalResults() {
        // Определить победителя
        const winner = this.determineWinner();
        
        // Обновить отображение победителя
        this.updateWinnerDisplay(winner);
        
        // Обновить итоговый рейтинг
        this.updateFinalRanking();
        
        // Обновить итоговую статистику
        this.updateFinalStats();
        
        // Обновить сложные слова
        this.updateDifficultWords();
    }

    // Определить победителя
    determineWinner() {
        let winner = null;
        let maxScore = -1;
        
        switch (this.config.gameMode) {
            case 'teams':
                this.state.teams.forEach(team => {
                    if (team.score > maxScore) {
                        maxScore = team.score;
                        winner = { type: 'team', ...team };
                    }
                });
                break;
                
            case 'classic':
            case 'hotseat':
                this.state.players.forEach(player => {
                    if (player.score > maxScore) {
                        maxScore = player.score;
                        winner = { type: 'player', ...player };
                    }
                });
                break;
        }
        
        return winner;
    }

    // Обновить отображение победителя
    updateWinnerDisplay(winner) {
        const winnerCard = document.getElementById('winnerCard');
        if (!winnerCard || !winner) return;
        
        let html = '';
        
        if (winner.type === 'team') {
            html = `
                <div class="winner-title">🏆 Победила команда!</div>
                <div class="winner-name">${winner.name}</div>
                <div class="winner-score">${winner.score} очков</div>
                <div class="winner-message">
                    Поздравляем команду с победой! Отличная работа!
                </div>
            `;
        } else {
            html = `
                <div class="winner-title">🏆 Победитель!</div>
                <div class="winner-name">${winner.name}</div>
                <div class="winner-score">${winner.score} очков</div>
                <div class="winner-message">
                    Поздравляем с победой в игре Крокодил! Отличная игра!
                </div>
            `;
        }
        
        winnerCard.innerHTML = html;
        
        // Обновить заголовок
        document.getElementById('finalTitle').textContent = 'Игра завершена!';
        document.getElementById('finalSubtitle').textContent = 'Победители определены';
    }

    // Обновить итоговый рейтинг
    updateFinalRanking() {
        const container = document.getElementById('finalRanking');
        if (!container) return;
        
        container.innerHTML = '';
        
        let rankingItems = [];
        
        // Собрать данные для рейтинга
        if (this.config.gameMode === 'teams') {
            const sortedTeams = [...this.state.teams].sort((a, b) => b.score - a.score);
            rankingItems = sortedTeams.map(team => ({
                type: 'team',
                name: team.name,
                score: team.score,
                details: `${team.players.length} игроков`
            }));
        } else {
            const sortedPlayers = [...this.state.players].sort((a, b) => b.score - a.score);
            rankingItems = sortedPlayers.map(player => ({
                type: 'player',
                name: player.name,
                score: player.score,
                details: `Слова: ${player.wordsShown}, Угадано: ${player.wordsGuessed}`
            }));
        }
        
        // Отобразить рейтинг
        rankingItems.forEach((item, index) => {
            const isWinner = index === 0;
            
            const rankElement = document.createElement('div');
            rankElement.className = `final-player-rank ${isWinner ? 'winner' : ''}`;
            
            rankElement.innerHTML = `
                <div class="rank-number">${index + 1}</div>
                <div class="final-player-info">
                    <div class="final-player-name">${item.name}</div>
                    <div class="final-player-details">${item.details}</div>
                </div>
                <div class="final-player-score">${item.score}</div>
            `;
            
            container.appendChild(rankElement);
        });
    }

    // Обновить итоговую статистику
    updateFinalStats() {
        document.getElementById('finalPlayerCount').textContent = this.config.playerCount;
        
        const gameTime = this.state.gameStartTime 
            ? Math.floor((Date.now() - this.state.gameStartTime) / 60000)
            : 0;
        document.getElementById('finalGameTime').textContent = gameTime;
        
        document.getElementById('finalTotalWords').textContent = this.state.wordsShown;
        
        // Найти лучший счёт
        let bestScore = 0;
        if (this.config.gameMode === 'teams') {
            bestScore = Math.max(...this.state.teams.map(t => t.score));
        } else {
            bestScore = Math.max(...this.state.players.map(p => p.score));
        }
        document.getElementById('finalBestScore').textContent = bestScore;
    }

    // Обновить сложные слова
    updateDifficultWords() {
        // В этой версии просто показываем последние 5 слов
        const container = document.getElementById('difficultWordsList');
        if (!container) return;
        
        const recentWords = this.state.usedWords.slice(-5).reverse();
        
        container.innerHTML = '';
        
        recentWords.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'difficult-word';
            wordElement.textContent = word;
            container.appendChild(wordElement);
        });
    }

    // Играть снова
    playAgain() {
        this.resetGame();
        this.startGame();
    }

    // Новые настройки
    newSettings() {
        this.resetGame();
        this.showScreen('setup');
    }

    // Сбросить игру
    resetGame() {
        this.state = {
            phase: 'setup',
            players: [],
            teams: [],
            currentPlayerIndex: 0,
            currentWord: null,
            usedWords: [],
            scores: {},
            gameLog: [],
            timers: {},
            round: 1,
            turn: 1,
            wordsGuessed: 0,
            wordsShown: 0,
            hotseatStreak: 0,
            gameStartTime: null,
            actingStartTime: null,
            gameStats: {
                totalTime: 0,
                totalWords: 0,
                successRate: 0
            }
        };
        
        this.stopAllTimers();
        
        console.log('🔄 Игра сброшена');
    }

    // Вспомогательные методы
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(`${screenName}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.state.phase = screenName;
        }
    }

    stopTimer(timerName) {
        if (this.state.timers[timerName]) {
            clearInterval(this.state.timers[timerName]);
            delete this.state.timers[timerName];
        }
    }

    stopAllTimers() {
        Object.values(this.state.timers).forEach(timer => {
            clearInterval(timer);
        });
        this.state.timers = {};
    }

    addScore(playerId, points) {
        const player = this.state.players.find(p => p.id === playerId);
        if (player) {
            player.score += points;
            
            // Обновить счёт команды
            if (this.config.gameMode === 'teams' && player.teamId !== null) {
                const team = this.state.teams[player.teamId];
                if (team) {
                    team.score += points;
                }
            }
        }
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        this.state.gameLog.unshift(`${timestamp} ${message}`);
        
        // Ограничить лог
        if (this.state.gameLog.length > 20) {
            this.state.gameLog = this.state.gameLog.slice(0, 20);
        }
        
        console.log(`📝 ${message}`);
    }

    getModeName(mode) {
        const names = {
            classic: 'Классический',
            teams: 'Командный',
            hotseat: 'Горячий стул'
        };
        return names[mode] || mode;
    }

    getDifficultyName(difficulty) {
        return CrocodileDatabase.constants.DIFFICULTY_NAMES[difficulty] || difficulty;
    }

    updateStatus(type, value) {
        const element = document.getElementById(`status${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (element) {
            element.querySelector('span').textContent = value;
        }
    }

    updateStatusPanel() {
        this.updateStatus('mode', this.getModeName(this.config.gameMode));
        this.updateStatus('players', `${this.config.playerCount} игроков`);
        this.updateStatus('round', `Раунд ${this.state.round}`);
        this.updateStatus('time', `${this.config.timePerWord} сек`);
    }

    showError(message) {
        alert(`❌ ${message}`);
        console.error(`❌ ${message}`);
    }

    showHelp() {
        document.getElementById('helpModal').classList.add('active');
    }

    hideHelp() {
        document.getElementById('helpModal').classList.remove('active');
    }

    toggleSound() {
        this.config.soundEffects = !this.config.soundEffects;
        const button = document.getElementById('soundToggle');
        if (button) {
            button.innerHTML = this.config.soundEffects 
                ? '<i class="fas fa-volume-up"></i>' 
                : '<i class="fas fa-volume-mute"></i>';
        }
    }

    playSound(soundName) {
        if (!this.config.soundEffects) return;
        
        // Здесь можно добавить реальные звуковые эффекты
        console.log(`🔊 Воспроизводится звук: ${soundName}`);
    }

    vibrate(duration) {
        if (!this.config.vibration || !navigator.vibrate) return;
        
        try {
            navigator.vibrate(duration);
        } catch (error) {
            console.warn('⚠️ Вибрация не поддерживается');
        }
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверить поддержку вибрации
    if (!navigator.vibrate) {
        console.log('⚠️ Вибрация не поддерживается в этом браузере');
    }
    
    // Создать и запустить игру
    window.crocodileGame = new CrocodileGame();
    
    console.log('✅ Игра "Крокодил" загружена и готова!');
});