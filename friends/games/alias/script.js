// Основной объект игры
const Game = {
    // Настройки по умолчанию
    settings: {
        teamCount: 3,
        timePerRound: 60,
        difficulty: 'medium',
        themes: ['all'],
        skipLimit: 3,
        oneWordRule: false
    },
    
    // Состояние игры
    state: {
        teams: [],
        currentTeam: 0,
        currentPlayer: 0,
        words: [],
        usedWords: new Set(),
        currentWordIndex: 0,
        timer: null,
        timeLeft: 60,
        roundActive: false,
        currentRound: {
            words: [],
            guessed: [],
            skipped: [],
            wrong: []
        },
        stats: {
            gamesPlayed: 0,
            totalWords: 0,
            bestScore: 0,
            avgScore: 0
        }
    },
    
    // Инициализация
    init() {
        this.loadStats();
        this.bindEvents();
        this.updateMenuStats();
        this.showScreen('menuScreen');
    },
    
    // Загрузка статистики
    loadStats() {
        const saved = localStorage.getItem('aliasStats');
        if (saved) {
            this.state.stats = JSON.parse(saved);
        }
    },
    
    // Сохранение статистики
    saveStats() {
        localStorage.setItem('aliasStats', JSON.stringify(this.state.stats));
    },
    
    // Обновление статистики в меню
    updateMenuStats() {
        document.getElementById('gamesPlayed').textContent = this.state.stats.gamesPlayed;
        document.getElementById('bestScore').textContent = this.state.stats.bestScore;
    },
    
    // Привязка событий
    bindEvents() {
        // Кнопки настроек
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const group = e.target.closest('.option-group');
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const setting = e.target.closest('.setting-group').querySelector('h3').textContent;
                const value = e.target.dataset.value;
                
                switch(true) {
                    case setting.includes('команд'):
                        this.settings.teamCount = parseInt(value);
                        break;
                    case setting.includes('Время'):
                        this.settings.timePerRound = parseInt(value);
                        break;
                    case setting.includes('Сложность'):
                        this.settings.difficulty = value;
                        break;
                }
            });
        });
        
        // Чекбоксы тем
        document.querySelectorAll('.theme-checkbox input').forEach(cb => {
            cb.addEventListener('change', () => {
                const themes = [];
                document.querySelectorAll('.theme-checkbox input:checked').forEach(checked => {
                    const theme = checked.nextElementSibling.textContent.toLowerCase();
                    if (theme === 'все слова') {
                        themes.push('all');
                    } else {
                        themes.push(checked.nextElementSibling.textContent);
                    }
                });
                this.settings.themes = themes;
            });
        });
        
        // Чекбоксы правил
        document.getElementById('skipLimit').addEventListener('change', (e) => {
            this.settings.skipLimit = e.target.checked ? 3 : 999;
        });
        
        document.getElementById('oneWordRule').addEventListener('change', (e) => {
            this.settings.oneWordRule = e.target.checked;
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (!this.state.roundActive) return;
            
            switch(e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.correctWord();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.correctWord();
                    break;
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    this.skipWord();
                    break;
                case 'ArrowLeft':
                case 'x':
                    e.preventDefault();
                    this.wrongWord();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.pauseGame();
                    break;
            }
        });
    },
    
    // Показать экран
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },
    
    // Показать меню настроек
    showSetupScreen() {
        this.showScreen('setupScreen');
    },
    
    // Начать игру
    startGame() {
        // Создаем команды
        this.state.teams = [];
        for (let i = 0; i < this.settings.teamCount; i++) {
            this.state.teams.push({
                name: `Команда ${i + 1}`,
                score: 0,
                color: `team-${i + 1}`
            });
        }
        
        // Генерируем слова
        this.generateWords();
        
        // Сбрасываем состояние раунда
        this.state.currentTeam = 0;
        this.state.currentPlayer = 0;
        this.state.currentRound = {
            words: [],
            guessed: [],
            skipped: [],
            wrong: []
        };
        this.state.timeLeft = this.settings.timePerRound;
        this.state.roundActive = false;
        
        // Обновляем интерфейс
        this.updateScores();
        this.updateCurrentTeam();
        this.showScreen('gameScreen');
        
        // Показываем первое слово через секунду
        setTimeout(() => {
            this.state.roundActive = true;
            this.startTimer();
            this.showNextWord();
        }, 1000);
    },
    
    // Генерация слов
    generateWords() {
        let words = [];
        
        // Добавляем слова по сложности
        if (this.settings.difficulty === 'mix') {
            words = [
                ...ALIAS_WORDS.easy,
                ...ALIAS_WORDS.medium,
                ...ALIAS_WORDS.hard
            ];
        } else {
            words = [...ALIAS_WORDS[this.settings.difficulty]];
        }
        
        // Добавляем тематические слова
        if (!this.settings.themes.includes('all')) {
            const themeWords = [];
            this.settings.themes.forEach(theme => {
                if (ALIAS_WORDS.themes[theme]) {
                    themeWords.push(...ALIAS_WORDS.themes[theme]);
                }
            });
            
            if (themeWords.length > 0) {
                // Смешиваем 50% тематических и 50% обычных
                const mixCount = Math.min(words.length, themeWords.length);
                words = [...words.slice(0, mixCount), ...themeWords.slice(0, mixCount)];
            }
        }
        
        // Перемешиваем
        this.state.words = this.shuffleArray(words);
        this.state.usedWords.clear();
        this.state.currentWordIndex = 0;
    },
    
    // Перемешивание массива
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    // Показать следующее слово
    showNextWord() {
        if (this.state.currentWordIndex >= this.state.words.length) {
            this.generateWords();
        }
        
        let word;
        do {
            word = this.state.words[this.state.currentWordIndex];
            this.state.currentWordIndex = (this.state.currentWordIndex + 1) % this.state.words.length;
        } while (this.state.usedWords.has(word) && this.state.usedWords.size < this.state.words.length * 0.7);
        
        this.state.usedWords.add(word);
        this.state.currentRound.words.push(word);
        
        const wordElement = document.getElementById('currentWord');
        wordElement.style.opacity = '0';
        wordElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            wordElement.textContent = word;
            wordElement.style.opacity = '1';
            wordElement.style.transform = 'translateY(0)';
            this.updateWordCounter();
        }, 200);
    },
    
    // Обновить счетчик слов
    updateWordCounter() {
        const total = this.state.currentRound.words.length;
        document.getElementById('wordCounter').textContent = total;
    },
    
    // Обновить счетчик пропусков
    updateSkipCounter() {
        const used = this.state.currentRound.skipped.length;
        document.getElementById('skipCounter').textContent = `${used}/${this.settings.skipLimit}`;
    },
    
    // Обновить таймер
    updateTimer() {
        const timerElement = document.getElementById('timer');
        const progressFill = document.getElementById('progressFill');
        
        timerElement.textContent = this.state.timeLeft;
        
        // Меняем цвет при низком времени
        if (this.state.timeLeft <= 10) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }
        
        // Обновляем прогресс-бар
        if (progressFill) {
            const percent = (this.state.timeLeft / this.settings.timePerRound) * 100;
            progressFill.style.width = `${percent}%`;
        }
    },
    
    // Запустить таймер
    startTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimer();
            
            if (this.state.timeLeft <= 0) {
                this.endRound();
            }
        }, 1000);
    },
    
    // Остановить таймер
    stopTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    },
    
    // Слово угадано
    correctWord() {
        if (!this.state.roundActive) return;
        
        const currentWord = document.getElementById('currentWord').textContent;
        this.state.currentRound.guessed.push(currentWord);
        this.state.teams[this.state.currentTeam].score++;
        
        this.updateScores();
        this.showNextWord();
        this.showNotification('+1 очко!', 'success');
        
        // Анимация
        const wordElement = document.getElementById('currentWord');
        wordElement.classList.add('correct-animation');
        setTimeout(() => wordElement.classList.remove('correct-animation'), 300);
    },
    
    // Пропустить слово
    skipWord() {
        if (!this.state.roundActive) return;
        
        // Проверяем лимит пропусков
        if (this.state.currentRound.skipped.length >= this.settings.skipLimit) {
            this.showNotification('Лимит пропусков исчерпан!', 'warning');
            return;
        }
        
        const currentWord = document.getElementById('currentWord').textContent;
        this.state.currentRound.skipped.push(currentWord);
        
        this.updateSkipCounter();
        this.showNextWord();
        this.showNotification('Слово пропущено', 'warning');
        
        // Анимация
        const wordElement = document.getElementById('currentWord');
        wordElement.classList.add('skip-animation');
        setTimeout(() => wordElement.classList.remove('skip-animation'), 300);
    },
    
    // Ошибка в слове
    wrongWord() {
        if (!this.state.roundActive) return;
        
        const currentWord = document.getElementById('currentWord').textContent;
        this.state.currentRound.wrong.push(currentWord);
        
        // Штраф за ошибку
        if (this.state.teams[this.state.currentTeam].score > 0) {
            this.state.teams[this.state.currentTeam].score--;
        }
        
        this.updateScores();
        this.showNextWord();
        this.showNotification('Ошибка! -1 очко', 'error');
        
        // Анимация
        const wordElement = document.getElementById('currentWord');
        wordElement.classList.add('wrong-animation');
        setTimeout(() => wordElement.classList.remove('wrong-animation'), 300);
    },
    
    // Обновить счёт команд
    updateScores() {
        const scoresGrid = document.getElementById('scoresGrid');
        scoresGrid.innerHTML = '';
        
        this.state.teams.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = `team-score-card ${team.color}`;
            card.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="team-points">${team.score}</div>
            `;
            scoresGrid.appendChild(card);
        });
    },
    
    // Обновить текущую команду
    updateCurrentTeam() {
        const team = this.state.teams[this.state.currentTeam];
        const teamElement = document.getElementById('currentTeam');
        const playerElement = document.getElementById('currentPlayer');
        
        teamElement.textContent = team.name;
        teamElement.className = team.color;
        
        // Простая ротация игроков
        const playerNumber = (this.state.currentPlayer % 4) + 1;
        playerElement.textContent = `Игрок ${playerNumber}`;
    },
    
    // Завершить раунд
    endRound() {
        this.state.roundActive = false;
        this.stopTimer();
        
        // Обновляем статистику
        const guessedCount = this.state.currentRound.guessed.length;
        this.state.stats.totalWords += this.state.currentRound.words.length;
        this.state.stats.gamesPlayed++;
        
        if (guessedCount > this.state.stats.bestScore) {
            this.state.stats.bestScore = guessedCount;
        }
        
        this.state.stats.avgScore = Math.round(
            (this.state.stats.avgScore * (this.state.stats.gamesPlayed - 1) + guessedCount) / 
            this.state.stats.gamesPlayed
        );
        
        this.saveStats();
        
        // Показываем результаты
        this.showResults();
    },
    
    // Показать результаты
    showResults() {
        // Обновляем статистику раунда
        document.getElementById('guessedWords').textContent = this.state.currentRound.guessed.length;
        document.getElementById('skippedWords').textContent = this.state.currentRound.skipped.length;
        document.getElementById('pointsEarned').textContent = 
            this.state.currentRound.guessed.length - this.state.currentRound.wrong.length;
        
        // Обновляем общий счёт
        const teamsResults = document.getElementById('teamsResults');
        teamsResults.innerHTML = '';
        
        this.state.teams.forEach((team, index) => {
            const result = document.createElement('div');
            result.className = `team-result ${team.color}`;
            result.innerHTML = `
                <span class="team-result-name">${team.name}</span>
                <span class="team-result-score">${team.score}</span>
            `;
            teamsResults.appendChild(result);
        });
        
        // Показываем слова раунда
        const wordsGrid = document.getElementById('roundWords');
        wordsGrid.innerHTML = '';
        
        this.state.currentRound.words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.textContent = word;
            
            if (this.state.currentRound.guessed.includes(word)) {
                wordItem.classList.add('guessed');
            } else if (this.state.currentRound.skipped.includes(word)) {
                wordItem.classList.add('skipped');
            } else {
                wordItem.classList.add('wrong');
            }
            
            wordsGrid.appendChild(wordItem);
        });
        
        this.showScreen('resultsScreen');
    },
    
    // Следующий раунд
    nextRound() {
        // Переходим к следующей команде
        this.state.currentTeam = (this.state.currentTeam + 1) % this.state.teams.length;
        this.state.currentPlayer++;
        
        // Сбрасываем состояние раунда
        this.state.currentRound = {
            words: [],
            guessed: [],
            skipped: [],
            wrong: []
        };
        this.state.timeLeft = this.settings.timePerRound;
        
        // Обновляем интерфейс
        this.updateCurrentTeam();
        this.updateSkipCounter();
        this.updateTimer();
        this.showScreen('gameScreen');
        
        // Начинаем новый раунд
        setTimeout(() => {
            this.state.roundActive = true;
            this.startTimer();
            this.showNextWord();
        }, 1000);
    },
    
    // Пауза
    pauseGame() {
        if (!this.state.roundActive) return;
        
        this.state.roundActive = false;
        this.stopTimer();
        this.showModal('pauseModal');
    },
    
    // Продолжить игру
    resumeGame() {
        this.state.roundActive = true;
        this.startTimer();
        this.closeModal('pauseModal');
    },
    
    // Показать статистику
    showStats() {
        document.getElementById('totalGames').textContent = this.state.stats.gamesPlayed;
        document.getElementById('totalWords').textContent = this.state.stats.totalWords;
        document.getElementById('avgScore').textContent = this.state.stats.avgScore;
        document.getElementById('recordScore').textContent = this.state.stats.bestScore;
        
        this.showScreen('statsScreen');
    },
    
    // Сбросить статистику
    resetStats() {
        if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
            this.state.stats = {
                gamesPlayed: 0,
                totalWords: 0,
                bestScore: 0,
                avgScore: 0
            };
            this.saveStats();
            this.showStats();
        }
    },
    
    // Показать правила
    showHowToPlay() {
        this.showModal('rulesModal');
    },
    
    // Показать модальное окно
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    },
    
    // Закрыть модальное окно
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },
    
    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
};

// Глобальные функции для HTML
function goToMainMenu() {
    if (confirm('Вернуться в главное меню? Прогресс текущей игры будет потерян.')) {
        window.location.href = 'https://lovecouple.ru/friends/';
    }
}

function backToMenu() {
    Game.showScreen('menuScreen');
    Game.updateMenuStats();
}

function backToMenuFromPause() {
    Game.closeModal('pauseModal');
    backToMenu();
}

function showSettings() {
    Game.showSetupScreen();
}

function startGame() {
    Game.startGame();
}

function pauseGame() {
    Game.pauseGame();
}

function resumeGame() {
    Game.resumeGame();
}

function endRound() {
    Game.endRound();
}

function endRoundFromPause() {
    Game.closeModal('pauseModal');
    Game.endRound();
}

function correctWord() {
    Game.correctWord();
}

function skipWord() {
    Game.skipWord();
}

function wrongWord() {
    Game.wrongWord();
}

function nextRound() {
    Game.nextRound();
}

function showStats() {
    Game.showStats();
}

function resetStats() {
    Game.resetStats();
}

function showHowToPlay() {
    Game.showHowToPlay();
}

function showRules() {
    Game.showHowToPlay();
}

function closeModal(modalId) {
    Game.closeModal(modalId);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
    
    // Закрытие модальных окон по клику на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
