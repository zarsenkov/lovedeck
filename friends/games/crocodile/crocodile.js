// ===== СОСТОЯНИЕ ИГРЫ =====
let gameState = {
    activeScreen: 'main',
    selectedCategories: ['objects', 'animals', 'actions'],
    difficulty: 'easy',
    gameMode: 'classic',
    wordsCount: 10,
    timerSeconds: 60,
    isPlaying: false,
    currentWordIndex: 0,
    score: 0,
    wordsGuessed: 0,
    wordsList: [],
    startTime: null,
    timerInterval: null,
    timeLeft: 60,
    customWords: [],
    teams: [
        { id: 1, name: 'Команда 1', score: 0 },
        { id: 2, name: 'Команда 2', score: 0 }
    ],
    currentTeam: 0,
    modalCallback: null
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initGame() {
    initCategories();
    initWordsCount();
    initTimer();
    loadCustomWords();
    loadSettings();
    setupEventListeners();
}

function initCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    const categories = [
        { id: 'objects', name: 'Предметы', icon: 'fa-box' },
        { id: 'animals', name: 'Животные', icon: 'fa-paw' },
        { id: 'actions', name: 'Действия', icon: 'fa-running' },
        { id: 'professions', name: 'Профессии', icon: 'fa-user-tie' },
        { id: 'movies', name: 'Фильмы', icon: 'fa-film' },
        { id: 'celebrities', name: 'Знаменитости', icon: 'fa-star' },
        { id: 'food', name: 'Еда', icon: 'fa-utensils' },
        { id: 'places', name: 'Места', icon: 'fa-globe' },
        { id: 'abstract', name: 'Абстрактные', icon: 'fa-brain' },
        { id: 'custom', name: 'Свои слова', icon: 'fa-edit' }
    ];
    
    categoriesGrid.innerHTML = categories.map(category => `
        <button class="category-btn ${gameState.selectedCategories.includes(category.id) ? 'active' : ''}" 
                data-category="${category.id}">
            <i class="fas ${category.icon}"></i>
            <div>${category.name}</div>
        </button>
    `).join('');
}

function initWordsCount() {
    const slider = document.getElementById('wordsCountSlider');
    const value = document.getElementById('wordsCountValue');
    
    slider.value = gameState.wordsCount;
    value.textContent = gameState.wordsCount;
    
    slider.addEventListener('input', function() {
        gameState.wordsCount = parseInt(this.value);
        value.textContent = gameState.wordsCount;
        saveSettings();
    });
    
    document.querySelectorAll('.count-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            const count = parseInt(this.dataset.count);
            gameState.wordsCount = count;
            slider.value = count;
            value.textContent = count;
            
            document.querySelectorAll('.count-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            saveSettings();
        });
    });
}

function initTimer() {
    const slider = document.getElementById('timerSlider');
    const value = document.getElementById('timerValue');
    
    slider.value = gameState.timerSeconds;
    value.textContent = gameState.timerSeconds;
    
    slider.addEventListener('input', function() {
        gameState.timerSeconds = parseInt(this.value);
        value.textContent = gameState.timerSeconds;
        saveSettings();
    });
    
    document.querySelectorAll('.timer-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            const seconds = parseInt(this.dataset.seconds);
            gameState.timerSeconds = seconds;
            slider.value = seconds;
            value.textContent = seconds;
            
            document.querySelectorAll('.timer-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            saveSettings();
        });
    });
}

function setupEventListeners() {
    // Категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            if (category === 'custom') {
                showCustomCards();
                return;
            }
            
            const index = gameState.selectedCategories.indexOf(category);
            if (index > -1) {
                gameState.selectedCategories.splice(index, 1);
                this.classList.remove('active');
            } else {
                gameState.selectedCategories.push(category);
                this.classList.add('active');
            }
            
            saveSettings();
        });
    });
    
    // Сложность
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.difficulty = this.dataset.level;
            saveSettings();
        });
    });
    
    // Режимы
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.gameMode = this.dataset.mode;
            saveSettings();
        });
    });
    
    // Свои слова - счетчик
    const wordsInput = document.getElementById('customWordsInput');
    if (wordsInput) {
        wordsInput.addEventListener('input', function() {
            const count = this.value.split('\n').filter(w => w.trim().length > 0).length;
            document.getElementById('wordCount').textContent = `${count} слов`;
        });
    }
}

// ===== ПОДГОТОВКА ИГРЫ =====
function startGame() {
    if (gameState.selectedCategories.length === 0) {
        showAlert('Выберите хотя бы одну категорию слов!');
        return;
    }
    
    // Собираем слова из выбранных категорий
    gameState.wordsList = [];
    
    // Слова из категорий
    gameState.selectedCategories.forEach(category => {
        if (crocodileWords[category]) {
            gameState.wordsList = gameState.wordsList.concat(crocodileWords[category]);
        }
    });
    
    // Добавляем свои слова
    if (gameState.customWords.length > 0) {
        gameState.customWords.forEach(word => {
            gameState.wordsList.push({
                word: word,
                category: 'custom',
                difficulty: 'custom'
            });
        });
    }
    
    // Фильтрация по сложности
    if (gameState.difficulty !== 'all') {
        gameState.wordsList = gameState.wordsList.filter(w => 
            w.difficulty === gameState.difficulty || w.difficulty === 'custom'
        );
    }
    
    if (gameState.wordsList.length === 0) {
        showAlert('Нет слов по выбранным настройкам! Выберите другие категории или сложность.');
        return;
    }
    
    // Перемешиваем и берем нужное количество слов
    shuffleArray(gameState.wordsList);
    gameState.wordsList = gameState.wordsList.slice(0, gameState.wordsCount);
    
    // Сброс состояния
    gameState.isPlaying = true;
    gameState.currentWordIndex = 0;
    gameState.score = 0;
    gameState.wordsGuessed = 0;
    gameState.startTime = Date.now();
    gameState.timeLeft = gameState.timerSeconds;
    gameState.currentTeam = 0;
    
    // Сброс очков команд
    gameState.teams.forEach(team => team.score = 0);
    
    // Переключение экрана
    switchScreen('game');
    
    // Обновление информации
    document.getElementById('totalWords').textContent = gameState.wordsList.length;
    document.getElementById('currentScore').textContent = '0';
    
    // Показать первое слово
    showNextWord();
    startTimer();
    
    // Обновление команд
    updateTeamScores();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ===== ИГРОВОЙ ПРОЦЕСС =====
function showNextWord() {
    // Проверяем, закончились ли слова
    if (gameState.currentWordIndex >= gameState.wordsList.length) {
        // Игра завершена, показываем результаты
        endGame();
        return;
    }
    
    const wordObj = gameState.wordsList[gameState.currentWordIndex];
    document.getElementById('currentWord').textContent = wordObj.word;
    document.getElementById('wordCategory').textContent = getCategoryName(wordObj.category);
    document.getElementById('currentWordNum').textContent = gameState.currentWordIndex + 1;
    
    // Сложность
    const dot = document.getElementById('difficultyDot');
    const text = document.getElementById('difficultyText');
    
    switch(wordObj.difficulty) {
        case 'easy':
            dot.style.background = '#10b981';
            text.textContent = 'Легко';
            break;
        case 'medium':
            dot.style.background = '#f59e0b';
            text.textContent = 'Средне';
            break;
        case 'hard':
            dot.style.background = '#ef4444';
            text.textContent = 'Сложно';
            break;
        default:
            dot.style.background = '#8b5cf6';
            text.textContent = 'Свое';
    }
    
    gameState.currentWordIndex++;
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timeLeft = gameState.timerSeconds;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            skipWord();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerText = document.getElementById('timerText');
    const progressCircle = document.querySelector('.timer-progress');
    
    timerText.textContent = gameState.timeLeft;
    
    // Прогресс
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (gameState.timeLeft / gameState.timerSeconds) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    
    // Цвет таймера
    if (gameState.timeLeft <= 10) {
        progressCircle.style.stroke = '#ef4444';
        timerText.style.color = '#ef4444';
    } else if (gameState.timeLeft <= 30) {
        progressCircle.style.stroke = '#f59e0b';
        timerText.style.color = '#f59e0b';
    } else {
        progressCircle.style.stroke = '#10b981';
        timerText.style.color = '#0f172a';
    }
}

function correctGuess() {
    const points = 3; // Фиксированные очки за угаданное слово
    gameState.score += points;
    gameState.wordsGuessed++;
    
    if (gameState.gameMode === 'teams') {
        gameState.teams[gameState.currentTeam].score += points;
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

function wrongGuess() {
    if (gameState.gameMode === 'teams') {
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

function skipWord() {
    if (gameState.gameMode === 'teams') {
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

function resetTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timeLeft = gameState.timerSeconds;
    updateTimerDisplay();
    startTimer();
}

function updateGameInfo() {
    document.getElementById('currentScore').textContent = gameState.score;
}

function updateTeamScores() {
    const teamScores = document.getElementById('teamScores');
    
    if (gameState.gameMode !== 'teams') {
        teamScores.style.display = 'none';
        return;
    }
    
    teamScores.style.display = 'grid';
    teamScores.innerHTML = gameState.teams.map((team, index) => `
        <div class="team-score ${index === gameState.currentTeam ? 'active' : ''}">
            <h4>${team.name}</h4>
            <div class="score">${team.score}</div>
        </div>
    `).join('');
}

// ===== ЗАВЕРШЕНИЕ ИГРЫ И РЕЗУЛЬТАТЫ =====
function endGame() {
    if (gameState.isPlaying) {
        clearInterval(gameState.timerInterval);
        gameState.isPlaying = false;
        showResults();
    }
}

function showResults() {
    switchScreen('results');
    
    // Общая статистика
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('wordsGuessed').textContent = gameState.wordsGuessed;
    document.getElementById('totalWordsPlayed').textContent = gameState.wordsList.length;
    
    // Обработка режима команд
    const winnerInfo = document.getElementById('winnerInfo');
    const teamResults = document.getElementById('teamResults');
    
    if (gameState.gameMode === 'teams') {
        // Определяем победителя
        let winner = null;
        let maxScore = -1;
        let draw = false;
        
        gameState.teams.forEach(team => {
            if (team.score > maxScore) {
                maxScore = team.score;
                winner = team;
                draw = false;
            } else if (team.score === maxScore) {
                draw = true;
            }
        });
        
        // Показываем победителя
        winnerInfo.style.display = 'block';
        if (draw) {
            document.getElementById('winnerText').textContent = 'Ничья!';
        } else {
            document.getElementById('winnerText').textContent = `Победитель: ${winner.name}`;
        }
        
        // Показываем результаты команд
        teamResults.style.display = 'block';
        const teamResultsGrid = document.getElementById('teamResultsGrid');
        
        // Сортируем команды по очкам
        const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);
        const maxTeamScore = sortedTeams[0].score;
        
        teamResultsGrid.innerHTML = sortedTeams.map(team => `
            <div class="team-result ${team.score === maxTeamScore ? 'winner' : ''}">
                <h4>${team.name}</h4>
                <div class="score">${team.score}</div>
            </div>
        `).join('');
    } else {
        winnerInfo.style.display = 'none';
        teamResults.style.display = 'none';
    }
}

function playAgain() {
    switchScreen('game');
    startGame();
}

// ===== СВОИ СЛОВА =====
function showCustomCards() {
    switchScreen('custom');
    const input = document.getElementById('customWordsInput');
    input.value = gameState.customWords.join('\n');
    
    // Обновить счетчик
    const count = input.value.split('\n').filter(w => w.trim().length > 0).length;
    document.getElementById('wordCount').textContent = `${count} слов`;
    
    // Фокус на поле ввода
    setTimeout(() => input.focus(), 100);
}

function saveCustomWords() {
    const input = document.getElementById('customWordsInput').value;
    const words = input.split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);
    
    gameState.customWords = words;
    localStorage.setItem('crocodileCustomWords', JSON.stringify(words));
    
    showAlert(`Сохранено ${words.length} слов!`);
    goToMain();
}

function clearCustomWords() {
    showConfirm('Очистить все свои слова?', function() {
        gameState.customWords = [];
        document.getElementById('customWordsInput').value = '';
        document.getElementById('wordCount').textContent = '0 слов';
        localStorage.removeItem('crocodileCustomWords');
    });
}

function loadCustomWords() {
    const saved = localStorage.getItem('crocodileCustomWords');
    if (saved) {
        try {
            gameState.customWords = JSON.parse(saved);
        } catch (e) {
            gameState.customWords = [];
        }
    }
}

// ===== НАСТРОЙКИ =====
function saveSettings() {
    const settings = {
        categories: gameState.selectedCategories,
        difficulty: gameState.difficulty,
        gameMode: gameState.gameMode,
        wordsCount: gameState.wordsCount,
        timerSeconds: gameState.timerSeconds
    };
    localStorage.setItem('crocodileSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('crocodileSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            gameState.selectedCategories = settings.categories || ['objects', 'animals', 'actions'];
            gameState.difficulty = settings.difficulty || 'easy';
            gameState.gameMode = settings.gameMode || 'classic';
            gameState.wordsCount = settings.wordsCount || 10;
            gameState.timerSeconds = settings.timerSeconds || 60;
            
            // Обновление UI
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.level === gameState.difficulty);
            });
            
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === gameState.gameMode);
            });
            
            document.querySelectorAll('.timer-preset').forEach(preset => {
                preset.classList.toggle('active', parseInt(preset.dataset.seconds) === gameState.timerSeconds);
            });
            
            document.querySelectorAll('.count-preset').forEach(preset => {
                preset.classList.toggle('active', parseInt(preset.dataset.count) === gameState.wordsCount);
            });
            
        } catch (e) {
            console.log('Ошибка загрузки настроек');
        }
    }
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function showAlert(message) {
    showModal('Внимание', message, null, function() {
        closeCustomModal();
    });
}

function showConfirm(message, callback) {
    showModal('Подтверждение', message, callback);
}

function showModal(title, message, confirmCallback, cancelCallback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    gameState.modalCallback = confirmCallback;
    
    if (cancelCallback) {
        gameState.modalCallbackCancel = cancelCallback;
    }
    
    document.getElementById('customModal').classList.add('active');
}

function closeCustomModal() {
    document.getElementById('customModal').classList.remove('active');
}

function modalConfirm() {
    if (gameState.modalCallback) {
        gameState.modalCallback();
    }
    closeCustomModal();
}

function modalCancel() {
    if (gameState.modalCallbackCancel) {
        gameState.modalCallbackCancel();
    }
    closeCustomModal();
}

// ===== УТИЛИТЫ =====
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName + 'Screen').classList.add('active');
    gameState.activeScreen = screenName;
}

function goBack() {
    if (gameState.activeScreen === 'game' && gameState.isPlaying) {
        showConfirm('Выйти из игры? Текущий прогресс будет потерян.', function() {
            switchScreen('main');
            clearInterval(gameState.timerInterval);
            gameState.isPlaying = false;
        });
    } else {
        window.location.href = '../../index.html';
    }
}

function goToMain() {
    switchScreen('main');
}

function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('active');
}

function showRules() {
    document.getElementById('rulesModal').classList.add('active');
}

function closeRules() {
    document.getElementById('rulesModal').classList.remove('active');
}

function getCategoryName(category) {
    const names = {
        'objects': 'Предметы',
        'animals': 'Животные',
        'actions': 'Действия',
        'professions': 'Профессии',
        'movies': 'Фильмы',
        'celebrities': 'Знаменитости',
        'food': 'Еда',
        'places': 'Места',
        'abstract': 'Абстрактные',
        'custom': 'Свои слова'
    };
    return names[category] || category;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initGame);
