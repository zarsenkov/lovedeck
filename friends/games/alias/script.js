class AliasGame {
    constructor() {
        this.initializeElements();
        this.initializeGame();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeElements() {
        // Настройки
        this.teamCountSelect = document.getElementById('teamCount');
        this.roundTimeSelect = document.getElementById('roundTime');
        this.wordsPerRoundSelect = document.getElementById('wordsPerRound');
        this.categorySelect = document.getElementById('category');
        this.prohibitWordsToggle = document.getElementById('prohibitWords');
        
        // Команды
        this.teamsContainer = document.getElementById('teamsContainer');
        
        // Игровая область
        this.setupSection = document.getElementById('setupSection');
        this.gameSection = document.getElementById('gameSection');
        this.resultsSection = document.getElementById('resultsSection');
        
        // Текущее слово
        this.currentWordElement = document.getElementById('currentWord');
        this.wordHintElement = document.getElementById('wordHint');
        
        // Таймер
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerProgress = document.getElementById('timerProgress');
        
        // Кнопки
        this.startGameBtn = document.getElementById('startGame');
        this.correctBtn = document.getElementById('correct');
        this.skipBtn = document.getElementById('skip');
        this.prohibitBtn = document.getElementById('prohibit');
        this.pauseBtn = document.getElementById('pause');
        this.finishRoundBtn = document.getElementById('finishRound');
        this.newGameBtn = document.getElementById('newGame');
        this.backToMenuBtn = document.getElementById('backToMenu');
        
        // Модальные окна
        this.roundResultsModal = document.getElementById('roundResultsModal');
        this.gameResultsModal = document.getElementById('gameResultsModal');
        this.pauseModal = document.getElementById('pauseModal');
        
        // Результаты
        this.roundResultsList = document.getElementById('roundResultsList');
        this.finalResultsList = document.getElementById('finalResultsList');
        this.winnerTeamElement = document.getElementById('winnerTeam');
        
        // Переменные игры
        this.teams = [];
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.totalRounds = 3;
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.usedWords = new Set();
        this.timer = null;
        this.timeLeft = 0;
        this.totalTime = 60;
        this.isPaused = false;
        this.currentResults = [];
        this.gameStarted = false;
    }
    
    initializeGame() {
        // Инициализируем команды
        this.updateTeams();
        
        // Заполняем категории
        this.fillCategories();
    }
    
    fillCategories() {
        const categories = [
            { value: 'mixed', text: '🎲 Смешанная' },
            { value: 'animals', text: '🦁 Животные' },
            { value: 'objects', text: '📱 Предметы' },
            { value: 'professions', text: '👨‍⚕️ Профессии' },
            { value: 'movies', text: '🎬 Фильмы' },
            { value: 'food', text: '🍕 Еда' },
            { value: 'travel', text: '✈️ Путешествия' },
            { value: 'sports', text: '⚽ Спорт' },
            { value: 'nature', text: '🌳 Природа' }
        ];
        
        this.categorySelect.innerHTML = categories
            .map(cat => `<option value="${cat.value}">${cat.text}</option>`)
            .join('');
    }
    
    bindEvents() {
        this.teamCountSelect.addEventListener('change', () => this.updateTeams());
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.correctBtn.addEventListener('click', () => this.handleCorrect());
        this.skipBtn.addEventListener('click', () => this.handleSkip());
        this.prohibitBtn.addEventListener('click', () => this.handleProhibit());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.finishRoundBtn.addEventListener('click', () => this.finishRound());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.backToMenuBtn.addEventListener('click', () => window.location.href = 'https://lovecouple.ru/friends/');
        
        // Кнопки в модальных окнах
        document.querySelectorAll('[data-action="continue"]').forEach(btn => {
            btn.addEventListener('click', () => this.continueGame());
        });
        
        document.querySelectorAll('[data-action="nextRound"]').forEach(btn => {
            btn.addEventListener('click', () => this.startNextRound());
        });
        
        document.querySelectorAll('[data-action="closeModal"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });
        
        // Закрытие модальных окон по клику вне контента
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }
    
    updateTeams() {
        const teamCount = parseInt(this.teamCountSelect.value);
        this.teams = [];
        
        // Создаем команды
        for (let i = 0; i < teamCount; i++) {
            this.teams.push({
                name: `Команда ${i + 1}`,
                score: 0,
                color: this.getTeamColor(i),
                roundScore: 0,
                history: []
            });
        }
        
        // Обновляем UI команд
        this.teamsContainer.innerHTML = '';
        this.teams.forEach((team, index) => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';
            if (index === this.currentTeamIndex && this.gameStarted) {
                teamCard.classList.add('active');
            }
            
            teamCard.innerHTML = `
                <div class="team-header">
                    <div class="team-name">${team.name}</div>
                    <div class="team-score">${team.score}</div>
                </div>
                <div class="team-stats">
                    <span>Раунд: ${team.roundScore || 0}</span>
                    <span>Угадано: ${team.history.filter(r => r.success).length}</span>
                </div>
            `;
            
            this.teamsContainer.appendChild(teamCard);
        });
    }
    
    getTeamColor(index) {
        const colors = [
            'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            'linear-gradient(135deg, #ef4444, #f59e0b)',
            'linear-gradient(135deg, #10b981, #8b5cf6)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #06b6d4, #10b981)',
            'linear-gradient(135deg, #8b5cf6, #ef4444)'
        ];
        return colors[index % colors.length];
    }
    
    startGame() {
        const selectedCategory = this.categorySelect.value;
        const wordsPerRound = parseInt(this.wordsPerRoundSelect.value);
        
        // Генерируем слова для раунда
        this.generateWords(selectedCategory, wordsPerRound);
        
        // Настройки таймера
        this.totalTime = parseInt(this.roundTimeSelect.value);
        this.timeLeft = this.totalTime;
        
        // Сбрасываем результаты раунда
        this.currentResults = [];
        this.teams.forEach(team => team.roundScore = 0);
        
        // Показываем игровую область
        this.setupSection.style.display = 'none';
        this.gameSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
        
        this.gameStarted = true;
        this.updateTeams();
        this.showNextWord();
        this.startTimer();
    }
    
    generateWords(category, count) {
        let words = [...aliasWords[category]];
        
        // Удаляем использованные слова
        words = words.filter(word => !this.usedWords.has(word));
        
        // Если слов не хватает, очищаем использованные
        if (words.length < count) {
            this.usedWords.clear();
            words = [...aliasWords[category]];
        }
        
        // Перемешиваем
        words = this.shuffleArray(words);
        
        // Берем нужное количество
        this.currentWords = words.slice(0, count);
    }
    
    showNextWord() {
        if (this.currentWordIndex >= this.currentWords.length) {
            this.finishRound();
            return;
        }
        
        const word = this.currentWords[this.currentWordIndex];
        this.currentWordElement.textContent = word;
        
        // Подсказка: первая буква слова
        this.wordHintElement.textContent = `Начинается на "${word[0].toUpperCase()}"`;
        
        this.currentWordIndex++;
    }
    
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.timeOut();
                }
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Прогресс бар
        const progress = (this.timeLeft / this.totalTime) * 100;
        this.timerProgress.style.width = `${progress}%`;
        
        // Меняем цвет при малом времени
        if (this.timeLeft <= 10) {
            this.timerDisplay.style.color = '#ef4444';
            this.timerProgress.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (this.timeLeft <= 30) {
            this.timerDisplay.style.color = '#f59e0b';
            this.timerProgress.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            this.timerDisplay.style.color = '';
            this.timerProgress.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
        }
    }
    
    handleCorrect() {
        const currentTeam = this.teams[this.currentTeamIndex];
        const currentWord = this.currentWords[this.currentWordIndex - 1];
        
        // Добавляем результат
        this.currentResults.push({
            word: currentWord,
            success: true,
            team: currentTeam.name
        });
        
        // Обновляем счет команды
        currentTeam.score++;
        currentTeam.roundScore++;
        currentTeam.history.push({
            word: currentWord,
            success: true,
            round: this.currentRound
        });
        
        // Добавляем слово в использованные
        this.usedWords.add(currentWord);
        
        // Показываем следующее слово
        this.showNextWord();
    }
    
    handleSkip() {
        const currentTeam = this.teams[this.currentTeamIndex];
        const currentWord = this.currentWords[this.currentWordIndex - 1];
        
        // Добавляем результат
        this.currentResults.push({
            word: currentWord,
            success: false,
            reason: 'Пропущено',
            team: currentTeam.name
        });
        
        // Добавляем в историю команды
        currentTeam.history.push({
            word: currentWord,
            success: false,
            round: this.currentRound,
            reason: 'skip'
        });
        
        // Добавляем слово в использованные
        this.usedWords.add(currentWord);
        
        // Показываем следующее слово
        this.showNextWord();
    }
    
    handleProhibit() {
        if (this.prohibitWordsToggle.checked) {
            this.handleSkip(); // Пропускаем слово как запрещенное
        }
    }
    
    pauseGame() {
        this.isPaused = true;
        this.showModal(this.pauseModal);
    }
    
    continueGame() {
        this.isPaused = false;
        this.closeModal(this.pauseModal);
    }
    
    timeOut() {
        this.finishRound();
    }
    
    finishRound() {
        clearInterval(this.timer);
        
        // Показываем результаты раунда
        this.showRoundResults();
        
        // Переходим к следующей команде
        this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
        
        // Проверяем, закончился ли раунд для всех команд
        if (this.currentTeamIndex === 0) {
            this.currentRound++;
            
            // Проверяем, закончилась ли игра
            if (this.currentRound > this.totalRounds) {
                this.finishGame();
            } else {
                // Начинаем следующий раунд
                setTimeout(() => {
                    this.showModal(this.roundResultsModal);
                }, 500);
            }
        } else {
            // Продолжаем раунд с другой командой
            setTimeout(() => {
                this.showModal(this.roundResultsModal);
            }, 500);
        }
    }
    
    showRoundResults() {
        this.roundResultsList.innerHTML = '';
        
        this.currentResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${result.success ? 'success' : 'fail'}`;
            
            resultItem.innerHTML = `
                <div>
                    <strong>${result.word}</strong>
                    ${!result.success ? `<br><small>${result.reason || 'Не угадано'}</small>` : ''}
                </div>
                <div>
                    ${result.success ? 
                        '<span style="color: #10b981;">✓ +1</span>' : 
                        '<span style="color: #ef4444;">✗ 0</span>'
                    }
                </div>
            `;
            
            this.roundResultsList.appendChild(resultItem);
        });
    }
    
    startNextRound() {
        this.closeModal(this.roundResultsModal);
        
        // Сбрасываем для новой команды
        this.currentWordIndex = 0;
        this.currentResults = [];
        this.timeLeft = this.totalTime;
        
        // Генерируем новые слова
        const selectedCategory = this.categorySelect.value;
        const wordsPerRound = parseInt(this.wordsPerRoundSelect.value);
        this.generateWords(selectedCategory, wordsPerRound);
        
        // Обновляем UI
        this.updateTeams();
        this.showNextWord();
        this.startTimer();
    }
    
    finishGame() {
        // Определяем победителя
        let winner = null;
        let maxScore = -1;
        
        this.teams.forEach(team => {
            if (team.score > maxScore) {
                maxScore = team.score;
                winner = team;
            }
        });
        
        // Проверяем ничью
        const drawTeams = this.teams.filter(team => team.score === maxScore);
        const isDraw = drawTeams.length > 1;
        
        // Показываем финальные результаты
        this.showFinalResults(winner, isDraw, drawTeams);
    }
    
    showFinalResults(winner, isDraw, drawTeams) {
        this.finalResultsList.innerHTML = '';
        
        // Сортируем команды по очкам
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        
        sortedTeams.forEach((team, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <strong>${index + 1}</strong>
                    ${index === 0 ? ' 👑' : ''}
                </td>
                <td>${team.name}</td>
                <td><strong>${team.score}</strong></td>
                <td>
                    ${team.history.filter(h => h.success).length}/
                    ${team.history.length}
                </td>
            `;
            
            this.finalResultsList.appendChild(row);
        });
        
        // Текст победителя
        if (isDraw) {
            const teamNames = drawTeams.map(t => t.name).join(', ');
            this.winnerTeamElement.textContent = `Ничья между ${teamNames}!`;
            this.winnerTeamElement.style.color = '#f59e0b';
        } else {
            this.winnerTeamElement.textContent = `${winner.name} побеждает!`;
            this.winnerTeamElement.style.color = '#10b981';
        }
        
        // Показываем модальное окно
        this.showModal(this.gameResultsModal);
    }
    
    resetGame() {
        // Сбрасываем все состояния
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.currentWordIndex = 0;
        this.currentWords = [];
        this.currentResults = [];
        this.usedWords.clear();
        this.gameStarted = false;
        
        // Сбрасываем команды
        this.teams.forEach(team => {
            team.score = 0;
            team.roundScore = 0;
            team.history = [];
        });
        
        // Закрываем модальные окна
        this.closeModal(this.roundResultsModal);
        this.closeModal(this.gameResultsModal);
        this.closeModal(this.pauseModal);
        
        // Возвращаем к настройкам
        this.gameSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.setupSection.style.display = 'block';
        
        // Обновляем UI
        this.updateTeams();
        this.updateUI();
    }
    
    showModal(modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    updateUI() {
        // Обновляем заголовок раунда
        const roundTitle = document.getElementById('roundTitle');
        if (roundTitle) {
            roundTitle.textContent = `Раунд ${this.currentRound}`;
        }
        
        // Обновляем текущую команду
        const currentTeamElement = document.getElementById('currentTeam');
        if (currentTeamElement && this.gameStarted) {
            const team = this.teams[this.currentTeamIndex];
            currentTeamElement.textContent = `Сейчас объясняет: ${team.name}`;
            currentTeamElement.style.color = this.getTeamColor(this.currentTeamIndex);
        }
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.aliasGame = new AliasGame();
});
