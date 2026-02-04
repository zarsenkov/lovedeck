// ===== СОСТОЯНИЕ ИГРЫ =====
let gameState = {
    activeScreen: 'main',
    selectedCategories: ['objects', 'animals', 'actions'],
    difficulty: 'easy',
    gameMode: 'classic',
    timerSeconds: 60,
    isPlaying: false,
    currentWordIndex: 0,
    score: 0,
    wordsGuessed: 0,
    totalWords: 0,
    startTime: null,
    timerInterval: null,
    timeLeft: 60,
    words: [],
    customWords: [],
    teams: [
        { id: 1, name: 'Команда 1', score: 0 },
        { id: 2, name: 'Команда 2', score: 0 }
    ],
    currentTeam: 0
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initGame() {
    initCategories();
    initTimer();
    loadCustomWords();
    loadSettings();
    setupEventListeners();
    loadWords();
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
        { id: 'abstract', name: '18+', icon: 'fa-brain' },
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
            loadWords();
        });
    });
    
    // Сложность
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.difficulty = this.dataset.level;
            saveSettings();
            loadWords();
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

// ===== ЗАГРУЗКА СЛОВ =====
function loadWords() {
    gameState.words = [];
    
    // Слова из категорий
    gameState.selectedCategories.forEach(category => {
        if (crocodileWords[category]) {
            gameState.words = gameState.words.concat(crocodileWords[category]);
        }
    });
    
    // Свои слова
    if (gameState.customWords.length > 0) {
        gameState.customWords.forEach(word => {
            gameState.words.push({
                word: word,
                category: 'custom',
                difficulty: 'custom'
            });
        });
    }
    
    // Фильтрация по сложности
    if (gameState.difficulty !== 'all') {
        gameState.words = gameState.words.filter(w => 
            w.difficulty === gameState.difficulty || w.difficulty === 'custom'
        );
    }
    
    // Перемешивание
    shuffleArray(gameState.words);
    gameState.totalWords = gameState.words.length;
    
    // Обновление счетчика
    document.getElementById('totalWordsCount').textContent = gameState.totalWords;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ===== ИГРОВОЙ ПРОЦЕСС =====
function startGame() {
    if (gameState.words.length === 0) {
        alert('Выберите хотя бы одну категорию слов!');
        return;
    }
    
    gameState.isPlaying = true;
    gameState.currentWordIndex = 0;
    gameState.score = 0;
    gameState.wordsGuessed = 0;
    gameState.startTime = Date.now();
    gameState.timeLeft = gameState.timerSeconds;
    gameState.currentTeam = 0;
    
    // Сброс команд
    gameState.teams.forEach(team => team.score = 0);
    
    // Переключение экрана
    switchScreen('game');
    
    // Первое слово
    showNextWord();
    startTimer();
    
    // Обновление UI
    updateGameInfo();
    updateTeamScores();
}

function showNextWord() {
    if (gameState.currentWordIndex >= gameState.words.length) {
        // Если слова закончились, перемешиваем заново
        shuffleArray(gameState.words);
        gameState.currentWordIndex = 0;
    }
    
    const wordObj = gameState.words[gameState.currentWordIndex];
    document.getElementById('currentWord').textContent = wordObj.word;
    document.getElementById('wordCategory').textContent = getCategoryName(wordObj.category);
    document.getElementById('currentWordNum').textContent = gameState.currentWordIndex + 1;
    document.getElementById('totalWords').textContent = gameState.totalWords;
    
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
    const points = calculatePoints();
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
    if (gameState.gameMode === 'competition') {
        gameState.score = Math.max(0, gameState.score - 1);
    }
    
    if (gameState.gameMode === 'teams') {
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

function skipWord() {
    if (gameState.gameMode === 'competition') {
        gameState.score = Math.max(0, gameState.score - 2);
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

function calculatePoints() {
    const timeBonus = Math.floor(gameState.timeLeft / 10);
    const basePoints = 3;
    const quickBonus = gameState.timeLeft >= gameState.timerSeconds - 10 ? 2 : 0;
    return basePoints + timeBonus + quickBonus;
}

function resetTimer() {
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

// ===== УПРАВЛЕНИЕ ИГРОЙ =====
function pauseGame() {
    if (gameState.isPlaying) {
        clearInterval(gameState.timerInterval);
        gameState.isPlaying = false;
        alert('Игра на паузе. Нажмите OK для продолжения.');
        startTimer();
        gameState.isPlaying = true;
    }
}

function endGame() {
    if (confirm('Завершить игру?')) {
        clearInterval(gameState.timerInterval);
        gameState.isPlaying = false;
        showResults();
    }
}

function showResults() {
    switchScreen('results');
    
    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    // Статистика
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('wordsGuessed').textContent = gameState.wordsGuessed;
    document.getElementById('totalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Детали
    const details = document.getElementById('resultsDetails');
    details.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">Режим</span>
            <span class="detail-value">${getModeName(gameState.gameMode)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Сложность</span>
            <span class="detail-value">${getDifficultyName(gameState.difficulty)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Категории</span>
            <span class="detail-value">${gameState.selectedCategories.length}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Всего слов</span>
            <span class="detail-value">${gameState.totalWords}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Процент угаданных</span>
            <span class="detail-value">${gameState.totalWords > 0 ? Math.round((gameState.wordsGuessed / gameState.totalWords) * 100) : 0}%</span>
        </div>
    `;
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
    
    alert(`Сохранено ${words.length} слов!`);
    goToMain();
    loadWords();
}

function clearCustomWords() {
    if (confirm('Очистить все свои слова?')) {
        gameState.customWords = [];
        document.getElementById('customWordsInput').value = '';
        document.getElementById('wordCount').textContent = '0 слов';
        localStorage.removeItem('crocodileCustomWords');
        loadWords();
    }
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
            
        } catch (e) {
            console.log('Ошибка загрузки настроек');
        }
    }
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
        if (confirm('Выйти из игры?')) {
            switchScreen('main');
            clearInterval(gameState.timerInterval);
            gameState.isPlaying = false;
        }
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

function resetStats() {
    if (confirm('Сбросить статистику?')) {
        localStorage.removeItem('crocodileSettings');
        localStorage.removeItem('crocodileCustomWords');
        alert('Статистика сброшена!');
    }
}

function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: 'Крокодил - Игра для компании',
            text: 'Сыграйте в Крокодил! Объясняйте слова без слов.',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Ссылка скопирована!'))
            .catch(() => alert('Скопируйте ссылку: ' + window.location.href));
    }
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
        'abstract': '18+',
        'custom': 'Свои слова'
    };
    return names[category] || category;
}

function getDifficultyName(difficulty) {
    const names = {
        'easy': 'Легкая',
        'medium': 'Средняя',
        'hard': 'Сложная'
    };
    return names[difficulty] || difficulty;
}

function getModeName(mode) {
    const names = {
        'classic': 'Классика',
        'teams': 'Команды',
        'competition': 'Турнир'
    };
    return names[mode] || mode;
}

// ===== PWA И МОБИЛЬНЫЕ ФИКСЫ =====
function initPWA() {
    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../../sw.js')
            .catch(err => console.log('Service Worker не зарегистрирован:', err));
    }
    
    // Фикс для 100vh на мобильных
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    
    // Добавление класса для тач-устройств
    if ('ontouchstart' in window) {
        document.body.classList.add('touch');
    }
}

// Инициализация PWA
document.addEventListener('DOMContentLoaded', initPWA);


