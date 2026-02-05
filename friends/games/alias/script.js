class AliasGame {
    constructor() {
        // Состояние игры
        this.gameMode = 'teams'; // 'teams' или 'players'
        this.teams = [];
        this.players = [];
        this.currentTeamIndex = 0;
        this.currentPlayerIndex = 0;
        this.currentRound = 1;
        this.totalRounds = 3;
        this.roundTime = 60;
        this.wordsPerRound = 10;
        this.selectedCategories = ['all'];
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.roundScore = 0;
        this.roundResults = [];
        this.timer = null;
        this.timeLeft = 0;
        this.isPaused = false;
        this.gameStarted = false;
        
        this.init();
    }
    
    // Инициализация игры
    init() {
        this.bindEvents();
        this.loadCategories();
        this.updateUI();
        this.showScreen('mainScreen');
    }
    
    // Привязка событий - УПРОЩЕННАЯ ЛОГИКА
    bindEvents() {
        // Переключение режима
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setGameMode(btn.dataset.mode));
        });
        
        // Настройки
        document.getElementById('teamCount').addEventListener('change', () => this.updateTeams());
        document.getElementById('playerCount').addEventListener('change', () => this.updatePlayers());
        document.getElementById('roundTime').addEventListener('change', (e) => {
            this.roundTime = parseInt(e.target.value);
        });
        document.getElementById('wordsPerRound').addEventListener('change', (e) => {
            this.wordsPerRound = parseInt(e.target.value);
        });
        document.getElementById('roundsCount').addEventListener('change', (e) => {
            this.totalRounds = parseInt(e.target.value);
        });
        
        // Кнопки
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('randomizeNames').addEventListener('click', () => this.randomizeNames());
        document.getElementById('correctBtn').addEventListener('click', () => this.handleCorrect());
        document.getElementById('skipBtn').addEventListener('click', () => this.handleSkip());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('endRoundBtn').addEventListener('click', () => this.endRound());
        document.getElementById('continueBtn').addEventListener('click', () => this.continueGame());
        document.getElementById('quitBtn').addEventListener('click', () => this.quitGame());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        
        // Кнопки правил
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRules());
        document.getElementById('closeRulesBtn').addEventListener('click', () => this.hideRules());
        document.getElementById('closeRulesBtn2').addEventListener('click', () => this.hideRules());
        
        // Категории - ПРОСТАЯ ЛОГИКА БЕЗ ДВОЙНЫХ СОБЫТИЙ
        this.setupSimpleCategoryHandlers();
        
        // Имена (делегирование)
        document.getElementById('teamsList').addEventListener('input', (e) => {
            if (e.target.classList.contains('name-input')) {
                const index = parseInt(e.target.dataset.index);
                if (!isNaN(index)) {
                    this.teams[index].name = e.target.value.trim() || `Команда ${index + 1}`;
                }
            }
        });
        
        document.getElementById('playersList').addEventListener('input', (e) => {
            if (e.target.classList.contains('name-input')) {
                const index = parseInt(e.target.dataset.index);
                if (!isNaN(index)) {
                    this.players[index].name = e.target.value.trim() || `Игрок ${index + 1}`;
                }
            }
        });
    }
    
    // Загрузка категорий
    loadCategories() {
        const grid = document.getElementById('categoriesGrid');
        let html = '';
        
        for (const category in aliasWords) {
            const cat = aliasWords[category];
            // Только "Все слова" выбраны по умолчанию
            const isChecked = category === 'all' ? 'checked' : '';
            const isSelected = category === 'all' ? 'selected' : '';
            
            html += `
                <div class="category-item">
                    <input type="checkbox" id="cat-${category}" class="category-checkbox" 
                           value="${category}" ${isChecked}>
                    <label for="cat-${category}" class="category-label ${isSelected}">
                        <i class="fas ${cat.icon}"></i>
                        ${cat.name}
                    </label>
                </div>
            `;
        }
        
        grid.innerHTML = html;
    }
    
    // ПРОСТАЯ обработка категорий без двойных событий
    setupSimpleCategoryHandlers() {
        // Даем время загрузиться DOM
        setTimeout(() => {
            const grid = document.getElementById('categoriesGrid');
            if (!grid) return;
            
            // ОДИН обработчик для всего
            grid.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                let checkbox = null;
                let category = '';
                
                // Определяем на какой элемент кликнули
                if (e.target.classList.contains('category-label')) {
                    const checkboxId = e.target.getAttribute('for');
                    checkbox = document.getElementById(checkboxId);
                } else if (e.target.classList.contains('category-checkbox')) {
                    checkbox = e.target;
                }
                
                if (!checkbox) return;
                
                category = checkbox.value;
                
                // Переключаем состояние
                checkbox.checked = !checkbox.checked;
                
                // Обновляем визуальное состояние
                this.updateCategoryVisualState();
                
                // Обновляем логику выбора
                this.updateCategoryLogic(category, checkbox.checked);
            });
        }, 100);
    }
    
    // Обновление визуального состояния категорий
    updateCategoryVisualState() {
        document.querySelectorAll('.category-label').forEach(label => {
            const checkboxId = label.getAttribute('for');
            const checkbox = document.getElementById(checkboxId);
            
            if (checkbox && checkbox.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    }
    
    // Обновление логики выбора категорий - ПРОСТАЯ ВЕРСИЯ
    updateCategoryLogic(category, isChecked) {
        // Собираем все выбранные checkbox
        const allCheckboxes = document.querySelectorAll('.category-checkbox:checked');
        this.selectedCategories = Array.from(allCheckboxes).map(cb => cb.value);
        
        // Если выбрали "Все слова"
        if (category === 'all' && isChecked) {
            // Снимаем все остальные категории
            document.querySelectorAll('.category-checkbox:not(#cat-all)').forEach(cb => {
                cb.checked = false;
                cb.closest('.category-item').querySelector('.category-label').classList.remove('selected');
            });
            this.selectedCategories = ['all'];
        }
        // Если выбрали другую категорию
        else if (isChecked) {
            // Снимаем "Все слова" если оно выбрано
            const allCheckbox = document.getElementById('cat-all');
            if (allCheckbox && allCheckbox.checked) {
                allCheckbox.checked = false;
                allCheckbox.closest('.category-item').querySelector('.category-label').classList.remove('selected');
            }
        }
        // Если сняли галочку и ничего не выбрано
        else if (this.selectedCategories.length === 0) {
            // Выбираем "Все слова"
            const allCheckbox = document.getElementById('cat-all');
            if (allCheckbox) {
                allCheckbox.checked = true;
                allCheckbox.closest('.category-item').querySelector('.category-label').classList.add('selected');
                this.selectedCategories = ['all'];
            }
        }
        
        // Обновляем selectedCategories на основе текущего состояния
        const currentCheckboxes = document.querySelectorAll('.category-checkbox:checked');
        this.selectedCategories = Array.from(currentCheckboxes).map(cb => cb.value);
        
        console.log('Выбраны категории:', this.selectedCategories);
    }
    
    // Установка режима игры
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Обновление UI кнопок
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Показ/скрытие соответствующих секций
        document.getElementById('teamsSetting').style.display = mode === 'teams' ? 'block' : 'none';
        document.getElementById('playersSetting').style.display = mode === 'players' ? 'block' : 'none';
        document.getElementById('namesSection').style.display = mode === 'teams' ? 'block' : 'none';
        document.getElementById('playersSection').style.display = mode === 'players' ? 'block' : 'none';
        
        // Инициализация соответствующих списков
        if (mode === 'teams') {
            this.updateTeams();
        } else {
            this.updatePlayers();
        }
    }
    
    // Обновление команд
    updateTeams() {
        const count = parseInt(document.getElementById('teamCount').value);
        const currentCount = this.teams.length;
        
        // Добавляем или удаляем команды
        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                this.teams.push({
                    id: i,
                    name: getRandomName('team'),
                    score: 0,
                    roundScores: [],
                    color: this.getTeamColor(i)
                });
            }
        } else if (count < currentCount) {
            this.teams = this.teams.slice(0, count);
        }
        
        // Обновление UI
        this.updateTeamsUI();
    }
    
    // Обновление игроков
    updatePlayers() {
        const count = parseInt(document.getElementById('playerCount').value);
        const currentCount = this.players.length;
        
        // Добавляем или удаляем игроков
        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                this.players.push({
                    id: i,
                    name: getRandomName('player'),
                    score: 0,
                    roundScores: [],
                    color: this.getTeamColor(i)
                });
            }
        } else if (count < currentCount) {
            this.players = this.players.slice(0, count);
        }
        
        // Обновление UI
        this.updatePlayersUI();
    }
    
    // Случайные имена
    randomizeNames() {
        if (this.gameMode === 'teams') {
            this.teams.forEach((team, index) => {
                team.name = getRandomName('team');
            });
            this.updateTeamsUI();
        } else {
            this.players.forEach((player, index) => {
                player.name = getRandomName('player');
            });
            this.updatePlayersUI();
        }
    }
    
    // Обновление UI команд
    updateTeamsUI() {
        const container = document.getElementById('teamsList');
        let html = '';
        
        this.teams.forEach((team, index) => {
            html += `
                <div class="name-item">
                    <input type="text" class="name-input" 
                           data-index="${index}"
                           value="${team.name}"
                           placeholder="Название команды">
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Обновление UI игроков
    updatePlayersUI() {
        const container = document.getElementById('playersList');
        let html = '';
        
        this.players.forEach((player, index) => {
            html += `
                <div class="name-item">
                    <input type="text" class="name-input" 
                           data-index="${index}"
                           value="${player.name}"
                           placeholder="Имя игрока">
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Получение цвета
    getTeamColor(index) {
        const colors = ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
        return colors[index % colors.length];
    }
    
    // Начало игры
    startGame() {
        this.gameStarted = true;
        this.currentRound = 1;
        this.currentTeamIndex = 0;
        this.currentPlayerIndex = 0;
        
        // Сброс счетов
        if (this.gameMode === 'teams') {
            this.teams.forEach(team => {
                team.score = 0;
                team.roundScores = [];
            });
        } else {
            this.players.forEach(player => {
                player.score = 0;
                player.roundScores = [];
            });
        }
        
        // Загрузка настроек
        this.loadSettings();
        
        // Начало первого раунда
        this.startRound();
    }
    
    // Загрузка настроек
    loadSettings() {
        this.roundTime = parseInt(document.getElementById('roundTime').value);
        this.wordsPerRound = parseInt(document.getElementById('wordsPerRound').value);
        this.totalRounds = parseInt(document.getElementById('roundsCount').value);
    }
    
    // Начало раунда
    startRound() {
        this.roundScore = 0;
        this.roundResults = [];
        this.currentWordIndex = 0;
        
        // Генерация слов ИЗ ВЫБРАННЫХ КАТЕГОРИЙ
        this.currentWords = getRandomWords(this.selectedCategories, this.wordsPerRound);
        
        // Определение объясняющего
        let explainerName;
        if (this.gameMode === 'teams') {
            const team = this.teams[this.currentTeamIndex];
            explainerName = team.name;
        } else {
            const player = this.players[this.currentPlayerIndex];
            explainerName = player.name;
        }
        
        // Обновление UI
        document.getElementById('currentRound').textContent = `${this.currentRound}/${this.totalRounds}`;
        document.getElementById('currentExplainer').textContent = explainerName;
        document.getElementById('currentScore').textContent = '0';
        document.getElementById('wordProgress').textContent = `0/${this.wordsPerRound}`;
        
        // Запуск таймера
        this.timeLeft = this.roundTime;
        this.updateTimer();
        this.startTimer();
        
        // Показ первого слова
        this.showNextWord();
        
        // Переход на экран игры
        this.showScreen('gameScreen');
    }
    
    // Показ следующего слова
    showNextWord() {
        if (this.currentWordIndex >= this.currentWords.length) {
            this.endRound();
            return;
        }
        
        const word = this.currentWords[this.currentWordIndex];
        const category = getWordCategory(word);
        
        document.getElementById('currentWord').textContent = word;
        document.getElementById('currentCategory').textContent = category;
        document.getElementById('wordProgress').textContent = `${this.currentWordIndex + 1}/${this.wordsPerRound}`;
        
        // Обновление списка слов
        this.updateWordsList();
        
        this.currentWordIndex++;
    }
    
    // Обновление списка слов
    updateWordsList() {
        const container = document.getElementById('wordsList');
        let html = '';
        
        for (let i = 0; i < this.currentWordIndex; i++) {
            const result = this.roundResults[i];
            const statusClass = result ? (result.success ? 'success' : 'fail') : '';
            const word = this.currentWords[i];
            
            html += `<div class="word-chip ${statusClass}">${word}</div>`;
        }
        
        container.innerHTML = html;
    }
    
    // Запуск таймера
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimer();
                
                if (this.timeLeft <= 0) {
                    this.endRound();
                }
            }
        }, 1000);
    }
    
    // Обновление таймера
    updateTimer() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Прогресс бар
        const progress = (this.timeLeft / this.roundTime) * 100;
        document.getElementById('timerProgress').style.width = `${progress}%`;
        
        // Цвет при малом времени
        if (this.timeLeft <= 10) {
            document.getElementById('timerDisplay').style.color = '#ef4444';
            document.getElementById('timerProgress').style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else {
            document.getElementById('timerDisplay').style.color = '';
            document.getElementById('timerProgress').style.background = 'linear-gradient(90deg, var(--primary), var(--primary-light))';
        }
    }
    
    // Слово угадано
    handleCorrect() {
        const word = this.currentWords[this.currentWordIndex - 1];
        this.roundScore++;
        
        // Сохраняем результат
        this.roundResults.push({
            word: word,
            success: true,
            time: this.timeLeft
        });
        
        // Обновляем UI
        document.getElementById('currentScore').textContent = this.roundScore;
        
        // Следующее слово
        this.showNextWord();
    }
    
    // Пропуск слова
    handleSkip() {
        const word = this.currentWords[this.currentWordIndex - 1];
        
        // Сохраняем результат
        this.roundResults.push({
            word: word,
            success: false,
            reason: 'Пропущено'
        });
        
        // Следующее слово
        this.showNextWord();
    }
    
    // Пауза игры
    pauseGame() {
        this.isPaused = true;
        
        // Обновление информации в паузе
        let explainerName;
        if (this.gameMode === 'teams') {
            const team = this.teams[this.currentTeamIndex];
            explainerName = team.name;
        } else {
            const player = this.players[this.currentPlayerIndex];
            explainerName = player.name;
        }
        
        document.getElementById('pauseRound').textContent = `${this.currentRound}/${this.totalRounds}`;
        document.getElementById('pauseExplainer').textContent = explainerName;
        document.getElementById('pauseScore').textContent = this.roundScore;
        document.getElementById('pauseTime').textContent = document.getElementById('timerDisplay').textContent;
        
        this.showScreen('pauseScreen');
    }
    
    // Продолжить игру
    continueGame() {
        this.isPaused = false;
        this.showScreen('gameScreen');
    }
    
    // Выйти в меню
    quitGame() {
        clearInterval(this.timer);
        this.isPaused = false;
        this.gameStarted = false;
        this.showScreen('mainScreen');
    }
    
    // Завершение раунда
    endRound() {
        clearInterval(this.timer);
        
        // Сохранение результатов
        if (this.gameMode === 'teams') {
            const team = this.teams[this.currentTeamIndex];
            team.score += this.roundScore;
            team.roundScores.push({
                round: this.currentRound,
                score: this.roundScore,
                words: [...this.roundResults]
            });
        } else {
            const player = this.players[this.currentPlayerIndex];
            player.score += this.roundScore;
            player.roundScores.push({
                round: this.currentRound,
                score: this.roundScore,
                words: [...this.roundResults]
            });
        }
        
        // Показ результатов
        this.showRoundResults();
    }
    
    // Показать результаты раунда
    showRoundResults() {
        let explainerName;
        if (this.gameMode === 'teams') {
            const team = this.teams[this.currentTeamIndex];
            explainerName = team.name;
        } else {
            const player = this.players[this.currentPlayerIndex];
            explainerName = player.name;
        }
        
        const guessed = this.roundResults.filter(r => r.success).length;
        const total = this.currentWords.length;
        
        document.getElementById('resultExplainer').textContent = explainerName;
        document.getElementById('resultScore').textContent = `${this.roundScore} очков`;
        document.getElementById('resultDetails').textContent = `Угадано ${guessed} из ${total} слов`;
        
        // Список результатов
        const container = document.getElementById('resultsList');
        let html = '';
        
        this.roundResults.forEach((result, index) => {
            const word = this.currentWords[index];
            const status = result.success ? '✓' : '✗';
            const statusClass = result.success ? 'success' : 'fail';
            
            html += `
                <div class="result-word ${statusClass}">
                    ${word}
                    <div class="status">${status}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        this.showScreen('resultsScreen');
    }
    
    // Следующий раунд
    nextRound() {
        // Переход к следующему объясняющему
        if (this.gameMode === 'teams') {
            this.currentTeamIndex++;
            if (this.currentTeamIndex >= this.teams.length) {
                this.currentTeamIndex = 0;
                this.currentRound++;
            }
        } else {
            this.currentPlayerIndex++;
            if (this.currentPlayerIndex >= this.players.length) {
                this.currentPlayerIndex = 0;
                this.currentRound++;
            }
        }
        
        // Проверка окончания игры
        if (this.currentRound > this.totalRounds) {
            this.showFinalResults();
        } else {
            this.startRound();
        }
    }
    
    // Показать финальные результаты
    showFinalResults() {
        // Определение победителя
        let participants;
        let winner;
        let maxScore = -1;
        let isDraw = false;
        
        if (this.gameMode === 'teams') {
            participants = this.teams;
        } else {
            participants = this.players;
        }
        
        participants.forEach(p => {
            if (p.score > maxScore) {
                maxScore = p.score;
                winner = p;
                isDraw = false;
            } else if (p.score === maxScore) {
                isDraw = true;
            }
        });
        
        // Победитель
        const winnerCard = document.getElementById('winnerCard');
        if (isDraw) {
            const drawParticipants = participants.filter(p => p.score === maxScore);
            const names = drawParticipants.map(p => p.name).join(', ');
            
            winnerCard.innerHTML = `
                <h3>🏆 НИЧЬЯ!</h3>
                <p>${names} набрали по ${maxScore} очков</p>
            `;
        } else {
            winnerCard.innerHTML = `
                <h3>🏆 ПОБЕДИТЕЛЬ</h3>
                <p>${winner.name} с результатом ${maxScore} очков</p>
            `;
        }
        
        // Таблица лидеров
        const sorted = [...participants].sort((a, b) => b.score - a.score);
        const container = document.getElementById('leaderboard');
        
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Место</th>
                        <th>${this.gameMode === 'teams' ? 'Команда' : 'Игрок'}</th>
                        <th>Очки</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sorted.forEach((p, index) => {
            const totalGuessed = p.roundScores.reduce((sum, round) => {
                return sum + round.words.filter(w => w.success).length;
            }, 0);
            
            const totalWords = p.roundScores.reduce((sum, round) => {
                return sum + round.words.length;
            }, 0);
            
            html += `
                <tr>
                    <td class="rank rank-${index + 1}">${index + 1}</td>
                    <td>${p.name}</td>
                    <td class="score-cell">${p.score}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
        
        this.showScreen('finalScreen');
    }
    
    // Играть снова
    playAgain() {
        this.gameStarted = false;
        this.showScreen('mainScreen');
    }
    
    // Показать правила
    showRules() {
        document.getElementById('rulesModal').classList.add('active');
    }
    
    // Скрыть правила
    hideRules() {
        document.getElementById('rulesModal').classList.remove('active');
    }
    
    // Переключение экранов
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }
    
    // Обновление UI
    updateUI() {
        // Загрузка настроек
        this.loadSettings();
    }
}

// Инициализация игры
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new AliasGame();
});
