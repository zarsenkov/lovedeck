// ===== КРОКОДИЛ - ОСНОВНОЙ СКРИПТ =====

// Состояние игры
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
    currentTeam: 0,
    stats: {
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        totalTime: 0
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadStats();
    loadCustomWords();
    setupEventListeners();
    updateWordCount();
});

// Инициализация игры
function initGame() {
    // Инициализация категорий
    initCategories();
    
    // Инициализация таймера
    initTimer();
    
    // Загрузка слов
    loadWords();
    
    // Восстановление настроек
    loadSettings();
}

// Инициализация категорий
function initCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    const categories = [
        { id: 'objects', name: 'Предметы', icon: 'fa-box' },
        { id: 'animals', name: 'Животные', icon: 'fa-paw' },
        { id: 'actions', name: 'Действия', icon: 'fa-running' },
        { id: 'professions', name: 'Профессии', icon: 'fa-user-tie' },
        { id: 'movies', name: 'Фильмы/Сериалы', icon: 'fa-film' },
        { id: 'celebrities', name: 'Знаменитости', icon: 'fa-star' },
        { id: 'food', name: 'Еда/Напитки', icon: 'fa-utensils' },
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
    
    // Обработчики категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleCategory(btn.dataset.category));
    });
}

// Переключение категории
function toggleCategory(categoryId) {
    const btn = document.querySelector(`.category-btn[data-category="${categoryId}"]`);
    
    if (categoryId === 'custom') {
        // Для категории "Свои слова" показываем экран редактирования
        showCustomCards();
        return;
    }
    
    const index = gameState.selectedCategories.indexOf(categoryId);
    
    if (index > -1) {
        // Удаляем категорию
        gameState.selectedCategories.splice(index, 1);
        btn.classList.remove('active');
    } else {
        // Добавляем категорию
        gameState.selectedCategories.push(categoryId);
        btn.classList.add('active');
    }
    
    saveSettings();
}

// Инициализация таймера
function initTimer() {
    const slider = document.getElementById('timerSlider');
    const value = document.getElementById('timerValue');
    const circle = document.querySelector('.timer-progress');
    
    // Установка начального значения
    slider.value = gameState.timerSeconds;
    value.textContent = gameState.timerSeconds;
    updateTimerCircle(circle, gameState.timerSeconds);
    
    // Обработчик слайдера
    slider.addEventListener('input', function() {
        const seconds = parseInt(this.value);
        gameState.timerSeconds = seconds;
        value.textContent = seconds;
        updateTimerCircle(circle, seconds);
        saveSettings();
    });
    
    // Обработчики пресетов
    document.querySelectorAll('.timer-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            const seconds = parseInt(this.dataset.seconds);
            slider.value = seconds;
            gameState.timerSeconds = seconds;
            value.textContent = seconds;
            updateTimerCircle(circle, seconds);
            
            // Обновление активного пресета
            document.querySelectorAll('.timer-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            saveSettings();
        });
        
        // Активация соответствующего пресета
        if (parseInt(preset.dataset.seconds) === gameState.timerSeconds) {
            preset.classList.add('active');
        }
    });
    
    // Обновление круга таймера
    function updateTimerCircle(circle, seconds) {
        const circumference = 2 * Math.PI * 45;
        const maxTime = 120;
        const offset = circumference - (seconds / maxTime) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки сложности
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.difficulty = this.dataset.level;
            saveSettings();
        });
    });
    
    // Кнопки режима
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.gameMode = this.dataset.mode;
            
            // Показываем/скрываем таблицу команд
            const teamScores = document.getElementById('teamScores');
            if (gameState.gameMode === 'teams') {
                teamScores.style.display = 'grid';
                updateTeamScores();
            } else {
                teamScores.style.display = 'none';
            }
            
            saveSettings();
        });
    });
}

// Загрузка слов
function loadWords() {
    // Объединяем слова из выбранных категорий
    gameState.words = [];
    
    gameState.selectedCategories.forEach(category => {
        if (crocodileWords[category]) {
            gameState.words = gameState.words.concat(crocodileWords[category]);
        }
    });
    
    // Добавляем свои слова
    if (gameState.customWords.length > 0) {
        gameState.words = gameState.words.concat(
            gameState.customWords.map(word => ({
                word,
                category: 'custom',
                difficulty: 'custom'
            }))
        );
    }
    
    // Фильтрация по сложности
    if (gameState.difficulty !== 'all') {
        gameState.words = gameState.words.filter(w => 
            w.difficulty === gameState.difficulty || w.difficulty === 'custom'
        );
    }
    
    // Перемешиваем слова
    shuffleArray(gameState.words);
    
    gameState.totalWords = gameState.words.length;
    document.getElementById('totalWords').textContent = gameState.totalWords;
}

// Начало игры
function startGame() {
    if (gameState.words.length === 0) {
        alert('Выберите хотя бы одну категорию слов!');
        return;
    }
    
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
    
    // Показать первое слово
    showNextWord();
    
    // Запуск таймера
    startTimer();
    
    // Обновление статистики
    updateGameInfo();
    updateTeamScores();
}

// Показать следующее слово
function showNextWord() {
    if (gameState.currentWordIndex >= gameState.words.length) {
        // Перемешиваем заново
        shuffleArray(gameState.words);
        gameState.currentWordIndex = 0;
    }
    
    const wordObj = gameState.words[gameState.currentWordIndex];
    document.getElementById('currentWord').textContent = wordObj.word;
    document.getElementById('wordCategory').textContent = getCategoryName(wordObj.category);
    document.getElementById('currentWordNum').textContent = gameState.currentWordIndex + 1;
    
    // Обновление индикатора сложности
    const dot = document.getElementById('difficultyDot');
    const text = document.getElementById('difficultyText');
    
    switch(wordObj.difficulty) {
        case 'easy':
            dot.style.background = '#10b981';
            text.textContent = 'Легкая';
            break;
        case 'medium':
            dot.style.background = '#f59e0b';
            text.textContent = 'Средняя';
            break;
        case 'hard':
            dot.style.background = '#ef4444';
            text.textContent = 'Сложная';
            break;
        default:
            dot.style.background = '#8b5cf6';
            text.textContent = 'Своя';
    }
    
    gameState.currentWordIndex++;
}

// Запуск таймера
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timeLeft = gameState.timerSeconds;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            timeoutWord();
        }
    }, 1000);
}

// Обновление отображения таймера
function updateTimerDisplay() {
    const timerText = document.getElementById('timerText');
    const progressCircle = document.querySelector('.timer-progress');
    
    timerText.textContent = gameState.timeLeft;
    
    // Обновление прогресс-круга
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (gameState.timeLeft / gameState.timerSeconds) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    
    // Изменение цвета при малом времени
    if (gameState.timeLeft <= 10) {
        progressCircle.style.stroke = '#ef4444';
        timerText.style.color = '#ef4444';
    } else if (gameState.timeLeft <= 30) {
        progressCircle.style.stroke = '#f59e0b';
        timerText.style.color = '#f59e0b';
    } else {
        progressCircle.style.stroke = '#10b981';
        timerText.style.color = 'var(--text-primary)';
    }
}

// Слово угадано
function correctGuess() {
    const points = calculatePoints();
    gameState.score += points;
    gameState.wordsGuessed++;
    
    // Начисление очков команде
    if (gameState.gameMode === 'teams') {
        gameState.teams[gameState.currentTeam].score += points;
        
        // Переход хода к следующей команде
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

// Слово не угадано
function wrongGuess() {
    // Штраф в турнирном режиме
    if (gameState.gameMode === 'competition') {
        gameState.score = Math.max(0, gameState.score - 1);
    }
    
    // Переход хода к следующей команде
    if (gameState.gameMode === 'teams') {
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

// Пропустить слово
function skipWord() {
    // Штраф в турнирном режиме
    if (gameState.gameMode === 'competition') {
        gameState.score = Math.max(0, gameState.score - 2);
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

// Время вышло
function timeoutWord() {
    // Штраф в турнирном режиме
    if (gameState.gameMode === 'competition') {
        gameState.score = Math.max(0, gameState.score - 1);
    }
    
    // Переход хода к следующей команде
    if (gameState.gameMode === 'teams') {
        gameState.currentTeam = (gameState.currentTeam + 1) % gameState.teams.length;
        updateTeamScores();
    }
    
    updateGameInfo();
    showNextWord();
    resetTimer();
}

// Расчет очков
function calculatePoints() {
    const timeBonus = Math.floor(gameState.timeLeft / 10); // 1 очко за каждые 10 секунд
    const basePoints = 3;
    
    // Бонус за угадывание в первые 10 секунд
    const quickGuessBonus = gameState.timeLeft >= gameState.timerSeconds - 10 ? 2 : 0;
    
    return basePoints + timeBonus + quickGuessBonus;
}

// Сброс таймера
function resetTimer() {
    gameState.timeLeft = gameState.timerSeconds;
    updateTimerDisplay();
}

// Обновление информации о игре
function updateGameInfo() {
    document.getElementById('currentScore').textContent = gameState.score;
    document.getElementById('totalWords').textContent = gameState.totalWords;
}

// Обновление очков команд
function updateTeamScores() {
    const teamScores = document.getElementById('teamScores');
    
    if (gameState.gameMode !== 'teams') return;
    
    teamScores.innerHTML = gameState.teams.map((team, index) => `
        <div class="team-score ${index === gameState.currentTeam ? 'active' : ''}">
            <h4>${team.name}</h4>
            <div class="score">${team.score}</div>
        </div>
    `).join('');
}

// Завершение игры
function endGame() {
    if (confirm('Завершить текущую игру?')) {
        clearInterval(gameState.timerInterval);
        showResults();
        saveStats();
    }
}

// Показать результаты
function showResults() {
    switchScreen('results');
    
    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    // Обновление статистики
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('wordsGuessed').textContent = gameState.wordsGuessed;
    document.getElementById('totalTime').textContent = `${minutes}м ${seconds}с`;
    
    // Обновление деталей
    const details = document.getElementById('resultsDetails');
    details.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">Режим игры</span>
            <span class="detail-value">${getModeName(gameState.gameMode)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Сложность</span>
            <span class="detail-value">${getDifficultyName(gameState.difficulty)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Категории</span>
            <span class="detail-value">${gameState.selectedCategories.map(getCategoryName).join(', ')}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Всего слов</span>
            <span class="detail-value">${gameState.totalWords}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Таймер</span>
            <span class="detail-value">${gameState.timerSeconds} сек</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Процент угаданных</span>
            <span class="detail-value">${gameState.totalWords > 0 ? Math.round((gameState.wordsGuessed / gameState.totalWords) * 100) : 0}%</span>
        </div>
    `;
}

// Пауза игры
function pauseGame() {
    if (gameState.isPlaying) {
        clearInterval(gameState.timerInterval);
        gameState.isPlaying = false;
        alert('Игра на паузе. Нажмите OK для продолжения.');
        startTimer();
        gameState.isPlaying = true;
    }
}

// Играть снова
function playAgain() {
    switchScreen('game');
    startGame();
}

// Переключение экранов
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenName + 'Screen').classList.add('active');
    gameState.activeScreen = screenName;
}

// Назад
function goBack() {
    if (gameState.activeScreen === 'game' && gameState.isPlaying) {
        if (confirm('Вы действительно хотите выйти из игры?')) {
            switchScreen('main');
            clearInterval(gameState.timerInterval);
            gameState.isPlaying = false;
        }
    } else {
        window.location.href = '../../index.html';
    }
}

// Переход на главный экран
function goToMain() {
    switchScreen('main');
}

// Показать свои слова
function showCustomCards() {
    switchScreen('custom');
    document.getElementById('customWordsInput').value = gameState.customWords.join('\n');
    updateWordCount();
}

// Сохранение своих слов
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

// Очистить свои слова
function clearCustomWords() {
    if (confirm('Очистить все свои слова?')) {
        gameState.customWords = [];
        document.getElementById('customWordsInput').value = '';
        localStorage.removeItem('crocodileCustomWords');
        updateWordCount();
        loadWords();
    }
}

// Обновление счетчика слов
function updateWordCount() {
    const count = document.getElementById('customWordsInput').value
        .split('\n')
        .filter(word => word.trim().length > 0).length;
    
    document.getElementById('wordCount').textContent = `${count} слов`;
}

// Загрузка своих слов
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

// Сохранение настроек
function saveSettings() {
    const settings = {
        categories: gameState.selectedCategories,
        difficulty: gameState.difficulty,
        gameMode: gameState.gameMode,
        timerSeconds: gameState.timerSeconds
    };
    
    localStorage.setItem('crocodileSettings', JSON.stringify(settings));
}

// Загрузка настроек
function loadSettings() {
    const saved = localStorage.getItem('crocodileSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            gameState.selectedCategories = settings.categories || gameState.selectedCategories;
            gameState.difficulty = settings.difficulty || gameState.difficulty;
            gameState.gameMode = settings.gameMode || gameState.gameMode;
            gameState.timerSeconds = settings.timerSeconds || gameState.timerSeconds;
            
            // Обновление UI
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                if (btn.dataset.level === gameState.difficulty) {
                    btn.classList.add('active');
                }
            });
            
            document.querySelectorAll('.mode-btn').forEach(btn => {
                if (btn.dataset.mode === gameState.gameMode) {
                    btn.classList.add('active');
                }
            });
            
            // Обновление категорий
            document.querySelectorAll('.category-btn').forEach(btn => {
                if (gameState.selectedCategories.includes(btn.dataset.category)) {
                    btn.classList.add('active');
                }
            });
            
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Сохранение статистики
function saveStats() {
    gameState.stats.gamesPlayed++;
    gameState.stats.totalScore += gameState.score;
    gameState.stats.bestScore = Math.max(gameState.stats.bestScore, gameState.score);
    gameState.stats.totalTime += Math.floor((Date.now() - gameState.startTime) / 1000);
    
    localStorage.setItem('crocodileStats', JSON.stringify(gameState.stats));
}

// Загрузка статистики
function loadStats() {
    const saved = localStorage.getItem('crocodileStats');
    if (saved) {
        try {
            gameState.stats = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading stats:', e);
        }
    }
}

// Сброс статистики
function resetStats() {
    if (confirm('Сбросить всю статистику?')) {
        gameState.stats = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            totalTime: 0
        };
        localStorage.removeItem('crocodileStats');
        alert('Статистика сброшена!');
    }
}

// Показать правила
function showRules() {
    document.getElementById('rulesModal').classList.add('active');
}

// Закрыть правила
function closeRules() {
    document.getElementById('rulesModal').classList.remove('active');
}

// Поделиться игрой
function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: 'Крокодил - Игра для компании',
            text: 'Сыграйте в Крокодил - веселую игру для компании!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Ссылка скопирована в буфер обмена!'))
            .catch(() => alert('Скопируйте ссылку вручную: ' + window.location.href));
    }
}

// Переключение меню
function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('active');
}

// Вспомогательные функции
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCategoryName(category) {
    const names = {
        'objects': 'Предметы',
        'animals': 'Животные',
        'actions': 'Действия',
        'professions': 'Профессии',
        'movies': 'Фильмы/Сериалы',
        'celebrities': 'Знаменитости',
        'food': 'Еда/Напитки',
        'places': 'Места',
        'abstract': 'Абстрактные',
        'custom': 'Свои слова'
    };
    return names[category] || category;
}

function getDifficultyName(difficulty) {
    const names = {
        'easy': 'Легкая',
        'medium': 'Средняя',
        'hard': 'Сложная',
        'all': 'Все'
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
// Инициализация PWA
function initPWA() {
    // Проверка поддержки Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('../../sw.js')
                .then(registration => {
                    console.log('ServiceWorker зарегистрирован:', registration.scope);
                })
                .catch(error => {
                    console.log('Ошибка регистрации ServiceWorker:', error);
                });
        });
    }
    
    // Предотвращение масштабирования на мобильных
    document.addEventListener('touchmove', function(e) {
        if(e.scale !== 1) e.preventDefault();
    }, { passive: false });
    
    // Предотвращение контекстного меню на длинный тап
    document.addEventListener('contextmenu', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
        }
    });
    
    // Фикс для iOS 100vh
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Добавление класса для тач-устройств
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
    }
}

// Добавить обработчики тапов для мобильных
function addMobileTouchEvents() {
    // Для всех интерактивных элементов добавляем класс для анимации тапа
    const interactiveElements = document.querySelectorAll(
        'button, .category-btn, .difficulty-btn, .mode-btn, .timer-preset, .control-btn, .menu-item'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('mobile-tap-feedback');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('mobile-tap-feedback');
        });
        
        element.addEventListener('touchcancel', function() {
            this.classList.remove('mobile-tap-feedback');
        });
    });
    
    // Предотвращение двойного тапа для масштабирования
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Оптимизация клавиатуры для мобильных
function optimizeMobileKeyboard() {
    const textarea = document.getElementById('customWordsInput');
    if (textarea) {
        // Автофокус с задержкой для мобильных
        textarea.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
        
        // Скрытие клавиатуры при нажатии вне поля
        document.addEventListener('click', function(e) {
            if (e.target !== textarea && !textarea.contains(e.target)) {
                textarea.blur();
            }
        });
    }
}

// Обновить функцию initGame() - добавить в начало:
function initGame() {
    initPWA(); // Добавить эту строку
    addMobileTouchEvents(); // Добавить эту строку
    optimizeMobileKeyboard(); // Добавить эту строку
    
    // Остальной существующий код...
    initCategories();
    initTimer();
    loadWords();
    loadSettings();
}

// Добавить проверку ориентации экрана
function checkOrientation() {
    if (window.innerWidth < window.innerHeight && window.innerWidth < 768) {
        // Вертикальная ориентация на мобильных
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
    } else {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
    }
}

// Вызывать при загрузке и изменении размера
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', function() {
    setTimeout(checkOrientation, 100);
});

// Добавить CSS классы для портретной/ландшафтной ориентации
const style = document.createElement('style');
style.textContent = `
    body.portrait .game-stats {
        grid-template-columns: repeat(3, 1fr);
    }
    
    body.landscape .game-stats {
        grid-template-columns: repeat(6, 1fr);
    }
    
    @media (max-height: 500px) and (orientation: landscape) {
        .word-display {
            min-height: 100px;
            padding: 10px;
        }
        
        .word-display h2 {
            font-size: 1.4rem;
        }
        
        .game-controls {
            padding: 10px;
        }
    }
`;
document.head.appendChild(style);

