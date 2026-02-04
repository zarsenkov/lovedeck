// Основной объект игры
const game = {
    // Настройки
    teamCount: 3,
    roundTime: 60,
    wordsPerRound: 10,
    category: 'all',
    prohibitMode: false,
    
    // Состояние игры
    teams: [],
    currentTeamIndex: 0,
    currentRound: 1,
    totalRounds: 3,
    currentWords: [],
    currentWordIndex: 0,
    usedWords: new Set(),
    timer: null,
    timeLeft: 0,
    isPaused: false,
    roundScore: 0,
    roundResults: [],
    
    // Инициализация
    init() {
        this.loadSettings();
        this.createTeams();
        this.bindEvents();
        this.showScreen('setupScreen');
    },
    
    // Загрузка настроек из UI
    loadSettings() {
        this.teamCount = parseInt(document.getElementById('teamCount').value);
        this.roundTime = parseInt(document.getElementById('roundTime').value);
        this.wordsPerRound = parseInt(document.getElementById('wordsPerRound').value);
        this.category = document.getElementById('category').value;
        this.prohibitMode = document.getElementById('prohibitWords').checked;
    },
    
    // Создание команд
    createTeams() {
        this.teams = [];
        const colors = ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
        
        for (let i = 0; i < this.teamCount; i++) {
            this.teams.push({
                name: `Команда ${i + 1}`,
                score: 0,
                color: colors[i % colors.length],
                history: []
            });
        }
        
        this.updateTeamsUI();
    },
    
    // Обновление UI команд
    updateTeamsUI() {
        const container = document.getElementById('teamsContainer');
        container.innerHTML = '';
        
        this.teams.forEach((team, index) => {
            const teamElement = document.createElement('div');
            teamElement.className = 'team';
            if (index === this.currentTeamIndex) {
                teamElement.classList.add('active');
            }
            
            teamElement.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="team-score">${team.score}</div>
            `;
            
            container.appendChild(teamElement);
        });
    },
    
    // Привязка событий
    bindEvents() {
        // Настройки
        document.getElementById('teamCount').addEventListener('change', () => {
            this.loadSettings();
            this.createTeams();
        });
        
        document.getElementById('prohibitWords').addEventListener('change', () => {
            this.prohibitMode = document.getElementById('prohibitWords').checked;
            document.getElementById('prohibitBtn').style.display = 
                this.prohibitMode ? 'flex' : 'none';
        });
        
        // Кнопки
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('correctBtn').addEventListener('click', () => this.handleCorrect());
        document.getElementById('skipBtn').addEventListener('click', () => this.handleSkip());
        document.getElementById('prohibitBtn').addEventListener('click', () => this.handleProhibit());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('continueBtn').addEventListener('click', () => this.continueGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    },
    
    // Переключение экранов
    showScreen(screenId) {
        // Скрыть все экраны
        const screens = ['setupScreen', 'gameScreen', 'pauseScreen', 'resultsScreen', 'finalScreen'];
        screens.forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        
        // Показать нужный экран
        document.getElementById(screenId).style.display = 'block';
    },
    
    // Начало игры
    startGame() {
        this.loadSettings();
        this.createTeams();
        
        // Сброс состояния
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.roundScore = 0;
        this.roundResults = [];
        this.usedWords.clear();
        
        // Начинаем первый раунд
        this.startRound();
    },
    
    // Начало раунда
    startRound() {
        const team = this.teams[this.currentTeamIndex];
        
        // Генерация слов
        this.currentWords = getRandomWords(this.category, this.wordsPerRound);
        this.currentWordIndex = 0;
        this.roundScore = 0;
        this.roundResults = [];
        
        // Обновление UI
        document.getElementById('roundTitle').textContent = `РАУНД ${this.currentRound}`;
        document.getElementById('currentTeamInfo').textContent = team.name;
        document.getElementById('currentScore').textContent = '0';
        this.updateTeamsUI();
        
        // Таймер
        this.timeLeft = this.roundTime;
        this.updateTimer();
        
        // Показываем экран игры
        this.showScreen('gameScreen');
        
        // Показываем первое слово
        this.showNextWord();
        
        // Запускаем таймер
        this.startTimer();
    },
    
    // Показать следующее слово
    showNextWord() {
        if (this.currentWordIndex >= this.currentWords.length) {
            this.finishRound();
            return;
        }
        
        const word = this.currentWords[this.currentWordIndex];
        document.getElementById('currentWord').textContent = word;
        document.getElementById('wordHint').textContent = `Начинается на "${word[0].toUpperCase()}"`;
        document.getElementById('wordCount').textContent = `${this.currentWordIndex + 1}/${this.wordsPerRound}`;
        
        this.currentWordIndex++;
    },
    
    // Запуск таймера
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimer();
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.finishRound();
                }
            }
        }, 1000);
    },
    
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
        }
    },
    
    // Правильно угадано
    handleCorrect() {
        const word = this.currentWords[this.currentWordIndex - 1];
        this.roundScore++;
        
        // Обновляем счет
        document.getElementById('currentScore').textContent = this.roundScore;
        
        // Сохраняем результат
        this.roundResults.push({
            word: word,
            success: true,
            team: this.teams[this.currentTeamIndex].name
        });
        
        // Следующее слово
        this.showNextWord();
    },
    
    // Пропуск слова
    handleSkip() {
        const word = this.currentWords[this.currentWordIndex - 1];
        
        // Сохраняем результат
        this.roundResults.push({
            word: word,
            success: false,
            reason: 'Пропущено',
            team: this.teams[this.currentTeamIndex].name
        });
        
        // Следующее слово
        this.showNextWord();
    },
    
    // Запрещенное слово
    handleProhibit() {
        if (this.prohibitMode) {
            const word = this.currentWords[this.currentWordIndex - 1];
            
            // Сохраняем результат
            this.roundResults.push({
                word: word,
                success: false,
                reason: 'Запрещено',
                team: this.teams[this.currentTeamIndex].name
            });
            
            // Следующее слово
            this.showNextWord();
        }
    },
    
    // Пауза игры
    pauseGame() {
        this.isPaused = true;
        
        // Обновляем информацию в паузе
        const team = this.teams[this.currentTeamIndex];
        document.getElementById('pauseTeam').textContent = team.name;
        document.getElementById('pauseScore').textContent = this.roundScore;
        document.getElementById('pauseTime').textContent = document.getElementById('timerDisplay').textContent;
        
        this.showScreen('pauseScreen');
    },
    
    // Продолжить игру
    continueGame() {
        this.isPaused = false;
        this.showScreen('gameScreen');
    },
    
    // Перезапуск игры
    restartGame() {
        clearInterval(this.timer);
        this.showScreen('setupScreen');
        this.createTeams();
    },
    
    // Завершение раунда
    finishRound() {
        clearInterval(this.timer);
        
        const team = this.teams[this.currentTeamIndex];
        
        // Обновляем общий счет команды
        team.score += this.roundScore;
        
        // Сохраняем историю
        team.history.push({
            round: this.currentRound,
            score: this.roundScore,
            words: [...this.roundResults]
        });
        
        // Показываем результаты раунда
        this.showRoundResults();
    },
    
    // Показать результаты раунда
    showRoundResults() {
        const team = this.teams[this.currentTeamIndex];
        
        // Обновляем информацию
        document.getElementById('resultsTeam').textContent = team.name;
        document.getElementById('resultsScore').textContent = this.roundScore;
        document.getElementById('resultsGuessed').textContent = 
            `${this.roundResults.filter(r => r.success).length}/${this.wordsPerRound}`;
        
        // Список слов
        const wordsList = document.getElementById('wordsList');
        wordsList.innerHTML = '';
        
        this.roundResults.forEach(result => {
            const wordItem = document.createElement('div');
            wordItem.className = `word-item ${result.success ? 'success' : 'fail'}`;
            
            wordItem.innerHTML = `
                <div>
                    <strong>${result.word}</strong>
                    ${!result.success ? `<div class="reason">${result.reason}</div>` : ''}
                </div>
                <div class="status">
                    ${result.success ? '✓ +1' : '✗ 0'}
                </div>
            `;
            
            wordsList.appendChild(wordItem);
        });
        
        this.showScreen('resultsScreen');
    },
    
    // Следующий раунд
    nextRound() {
        // Переходим к следующей команде
        this.currentTeamIndex++;
        
        // Если все команды прошли раунд
        if (this.currentTeamIndex >= this.teams.length) {
            this.currentTeamIndex = 0;
            this.currentRound++;
            
            // Если все раунды пройдены
            if (this.currentRound > this.totalRounds) {
                this.finishGame();
                return;
            }
        }
        
        // Начинаем следующий раунд
        this.startRound();
    },
    
    // Завершение игры
    finishGame() {
        // Определяем победителя
        let winner = null;
        let maxScore = -1;
        let isDraw = false;
        
        this.teams.forEach(team => {
            if (team.score > maxScore) {
                maxScore = team.score;
                winner = team;
                isDraw = false;
            } else if (team.score === maxScore) {
                isDraw = true;
            }
        });
        
        // Показываем победителя
        const winnerInfo = document.getElementById('winnerInfo');
        if (isDraw) {
            const drawTeams = this.teams.filter(t => t.score === maxScore);
            winnerInfo.innerHTML = `
                <h3>НИЧЬЯ!</h3>
                <p>Несколько команд набрали ${maxScore} очков</p>
            `;
        } else {
            winnerInfo.innerHTML = `
                <h3>🏆 ПОБЕДИТЕЛЬ: ${winner.name}</h3>
                <p>Набрано ${maxScore} очков</p>
            `;
        }
        
        // Таблица лидеров
        const leaderboard = document.getElementById('leaderboard');
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        
        leaderboard.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Место</th>
                        <th>Команда</th>
                        <th>Очки</th>
                        <th>Угадано</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTeams.map((team, index) => {
                        const guessed = team.history.reduce((total, round) => {
                            return total + round.words.filter(w => w.success).length;
                        }, 0);
                        
                        const totalWords = team.history.reduce((total, round) => {
                            return total + round.words.length;
                        }, 0);
                        
                        return `
                            <tr>
                                <td class="rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">
                                    ${index + 1}
                                </td>
                                <td>${team.name}</td>
                                <td><strong>${team.score}</strong></td>
                                <td>${guessed}/${totalWords}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        this.showScreen('finalScreen');
    },
    
    // Новая игра
    newGame() {
        // Сброс всех данных
        this.teams.forEach(team => {
            team.score = 0;
            team.history = [];
        });
        
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.usedWords.clear();
        
        // Возврат к настройкам
        this.showScreen('setupScreen');
        this.createTeams();
    }
};

// Инициализация игры при загрузке
document.addEventListener('DOMContentLoaded', () => {
    game.init();
    
    // Показываем/скрываем кнопку запрещенных слов
    document.getElementById('prohibitWords').addEventListener('change', function() {
        document.getElementById('prohibitBtn').style.display = 
            this.checked ? 'flex' : 'none';
    });
});
