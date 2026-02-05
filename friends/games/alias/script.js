/**
 * Глобальное состояние игры
 */
let game = {
    mode: '',           // 'alias' или 'crocodile'
    category: '',       // ключ категории из cards.js
    teams: [
        { name: 'TEAM ONE', score: 0 },
        { name: 'TEAM TWO', score: 0 }
    ],
    currentTeamIndex: 0,
    roundTime: 60,
    timeLeft: 60,
    timerInterval: null,
    currentWord: '',
    usedWordsInGame: new Set(), // Чтобы слова не повторялись за всю сессию
};

/**
 * Инициализация и навигация
 */
document.addEventListener('DOMContentLoaded', () => {
    // Вешаем события на плитки режимов (Главный экран)
    document.querySelectorAll('.mode-tile').forEach(tile => {
        tile.addEventListener('click', () => {
            game.mode = tile.dataset.mode;
            renderCategories();
            showScreen('screen-categories');
            vibrate(10); // Легкий тактильный отклик
        });
    });

    // Обновление отображения времени в настройках
    const timeRange = document.getElementById('time-range');
    if (timeRange) {
        timeRange.addEventListener('input', (e) => {
            game.roundTime = parseInt(e.target.value);
            document.getElementById('time-display').textContent = `${game.roundTime} SEC`;
        });
    }
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

/**
 * Рендер категорий на основе выбранного режима
 */
function renderCategories() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = ''; 

    // Берем данные из объекта GAME_CARDS (из файла cards.js)
    const categories = GAME_CARDS[game.mode];
    
    Object.keys(categories).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'category-item'; // Стиль из нашего CSS
        btn.innerHTML = `<span>${categories[key].label}</span>`;
        btn.onclick = () => {
            game.category = key;
            showScreen('screen-setup');
            vibrate(10);
        };
        grid.appendChild(btn);
    });
}

/**
 * Запуск игровой сессии
 */
function startGame() {
    // Считываем имена команд
    const t1 = document.getElementById('team1-input').value.trim();
    const t2 = document.getElementById('team2-input').value.trim();
    
    game.teams[0].name = t1 || 'TEAM ONE';
    game.teams[1].name = t2 || 'TEAM TWO';
    game.teams[0].score = 0;
    game.teams[1].score = 0;
    game.currentTeamIndex = 0;
    game.usedWordsInGame.clear();

    prepareRound();
    showScreen('screen-game');
    vibrate([20, 50, 20]);
}

/**
 * Подготовка к раунду (Оверлей ожидания)
 */
function prepareRound() {
    clearInterval(game.timerInterval);
    game.timeLeft = game.roundTime;
    
    document.getElementById('game-timer').textContent = game.timeLeft;
    document.getElementById('game-score').textContent = '0';
    document.getElementById('intro-team-name').textContent = `${game.teams[game.currentTeamIndex].name}'S TURN`;
    
    // Показываем оверлей "Готовы?"
    document.getElementById('round-intro-overlay').classList.add('active');
}

/**
 * Старт таймера и выдача первого слова
 */
function startRound() {
    document.getElementById('round-intro-overlay').classList.remove('active');
    vibrate(30);
    setNextWord();
    
    game.timerInterval = setInterval(() => {
        game.timeLeft--;
        document.getElementById('game-timer').textContent = game.timeLeft;
        
        if (game.timeLeft <= 0) {
            endRound();
        }
    }, 1000);
}

/**
 * Логика выбора слова
 */
function setNextWord() {
    const categoryData = GAME_CARDS[game.mode][game.category];
    const allWords = categoryData.words;
    
    // Фильтруем те, что еще не были в этой игре
    let available = allWords.filter(w => !game.usedWordsInGame.has(w));
    
    // Если слова кончились — сбрасываем историю для этой категории
    if (available.length === 0) {
        allWords.forEach(w => game.usedWordsInGame.delete(w));
        available = allWords;
    }
    
    const word = available[Math.floor(Math.random() * available.length)];
    game.currentWord = word;
    game.usedWordsInGame.add(word);
    
    const card = document.getElementById('word-card');
    card.textContent = word.toUpperCase();
    
    // Анимация "всплытия" слова
    card.style.animation = 'none';
    card.offsetHeight; 
    card.style.animation = 'wordPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
}

/**
 * Обработка ответа
 */
function handleAnswer(isCorrect) {
    if (!game.timerInterval) return;

    if (isCorrect) {
        game.teams[game.currentTeamIndex].score++;
        vibrate(20);
    } else {
        game.teams[game.currentTeamIndex].score--; // Штраф
        vibrate([40, 30, 40]);
    }

    // Обновляем счет на экране
    document.getElementById('game-score').textContent = game.teams[game.currentTeamIndex].score;
    
    setNextWord();
}

/**
 * Завершение раунда
 */
function endRound() {
    clearInterval(game.timerInterval);
    game.timerInterval = null;
    vibrate([200, 100, 200]); // Длинная вибрация в конце

    setTimeout(() => {
        alert(`TIME'S UP!\n${game.teams[game.currentTeamIndex].name} SCORE: ${game.teams[game.currentTeamIndex].score}`);
        
        // Переход хода
        game.currentTeamIndex = (game.currentTeamIndex === 0) ? 1 : 0;
        prepareRound();
    }, 100);
}

/**
 * Утилита вибрации (работает на Android)
 */
function vibrate(pattern) {
    if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}