let game = {
    team1: "Хищники",
    team2: "Травоядные",
    score1: 0,
    score2: 0,
    activeTeam: 1, // 1 или 2
    currentRound: 1,
    maxRounds: 5,
    roundTime: 60,
    timeLeft: 60,
    timer: null,
    isPaused: false,
    selectedCats: ["objects", "actions"], // Категории по умолчанию
    currentWordPool: [],
    skipsCount: 0, // Счетчик пропусков для проклятия
    roundPoints: 0
};

// --- НАВИГАЦИЯ ---
function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

// --- НАСТРОЙКИ ---
function updateVal(type) {
    const val = document.getElementById(`setup-${type}`).value;
    document.getElementById(`val-${type}`).innerText = val;
    if(type === 'time') game.roundTime = parseInt(val);
    if(type === 'rounds') game.maxRounds = parseInt(val);
}

function toggleCat(el) {
    const cat = el.dataset.cat;
    if (game.selectedCats.includes(cat)) {
        // Нельзя убрать последнюю категорию
        if (game.selectedCats.length > 1) {
            game.selectedCats = game.selectedCats.filter(c => c !== cat);
            el.classList.remove('active');
        }
    } else {
        game.selectedCats.push(cat);
        el.classList.add('active');
    }
}

// --- СТАРТ ИГРЫ ---
function initGame() {
    // Сброс очков
    game.score1 = 0;
    game.score2 = 0;
    game.activeTeam = 1;
    game.currentRound = 1;
    
    // Считывание имен
    game.team1 = document.getElementById('team1-name').value || "Команда 1";
    game.team2 = document.getElementById('team2-name').value || "Команда 2";
    
    // Сбор слов
    game.currentWordPool = [];
    game.selectedCats.forEach(cat => {
        if(WORD_DATABASE[cat]) {
            game.currentWordPool = [...game.currentWordPool, ...WORD_DATABASE[cat]];
        }
    });
    
    // Перемешивание слов
    game.currentWordPool.sort(() => Math.random() - 0.5);
    
    startTurn();
}

// --- НАЧАЛО ХОДА ---
function startTurn() {
    game.timeLeft = game.roundTime;
    game.skipsCount = 0;
    game.roundPoints = 0;
    game.isPaused = false;
    
    document.getElementById('active-team-name').innerText = game.activeTeam === 1 ? game.team1 : game.team2;
    document.getElementById('current-round-display').innerText = game.currentRound;
    document.getElementById('curse-banner').classList.add('hidden');
    
    nextWord(null); // Первое слово
    goToScreen('game');
    startTimer();
}

function startTimer() {
    clearInterval(game.timer);
    // Обновляем UI сразу
    document.getElementById('timer').innerText = game.timeLeft;
    
    game.timer = setInterval(() => {
        if (!game.isPaused) {
            game.timeLeft--;
            document.getElementById('timer').innerText = game.timeLeft;
            
            if (game.timeLeft <= 0) {
                endTurn();
            }
        }
    }, 1000);
}

function togglePause() {
    game.isPaused = !game.isPaused;
    const btnIcon = document.querySelector('.pause-btn i');
    // Можно добавить визуальный эффект паузы
    if (game.isPaused) alert("ПАУЗА! Нажми ОК, чтобы продолжить.");
    else startTimer(); // Перезапуск не нужен, интервал работает, просто флаг меняется
}

// --- ЛОГИКА СЛОВ ---
function nextWord(isCorrect) {
    // Обработка предыдущего слова
    if (isCorrect === true) {
        game.roundPoints++;
        if (navigator.vibrate) navigator.vibrate(50);
    } else if (isCorrect === false) {
        game.skipsCount++;
        // Механика проклятия: если 3 пропуска подряд
        if (game.skipsCount >= 3) {
            document.getElementById('curse-banner').classList.remove('hidden');
        }
    }

    // Выбор нового слова
    if (game.currentWordPool.length === 0) {
        // Если слова кончились, регенерируем (редкий кейс)
        initGame(); 
        return; 
    }
    
    const word = game.currentWordPool.pop(); // Берем последнее, так как мы их перемешали
    
    // Анимация смены слова
    const el = document.getElementById('current-word');
    el.style.opacity = "0";
    el.style.transform = "scale(0.8)";
    
    setTimeout(() => {
        el.innerText = word.toUpperCase();
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
    }, 200);
}

// --- КОНЕЦ ХОДА ---
function endTurn() {
    clearInterval(game.timer);
    
    // Зачисляем очки
    if (game.activeTeam === 1) game.score1 += game.roundPoints;
    else game.score2 += game.roundPoints;

    // Показываем итоги
    document.getElementById('res-team-name').innerText = game.activeTeam === 1 ? game.team1 : game.team2;
    document.getElementById('round-points').innerText = (game.roundPoints > 0 ? "+" : "") + game.roundPoints;
    
    goToScreen('results');
}

function startNextTurn() {
    // Логика смены раундов
    if (game.activeTeam === 2) {
        // Если только что сыграла вторая команда, значит раунд закончен
        if (game.currentRound >= game.maxRounds) {
            showFinal();
            return;
        }
        game.currentRound++;
        game.activeTeam = 1;
    } else {
        game.activeTeam = 2;
    }
    
    startTurn();
}

function showFinal() {
    let winner = "НИЧЬЯ!";
    if (game.score1 > game.score2) winner = game.team1;
    if (game.score2 > game.score1) winner = game.team2;
    
    document.getElementById('final-winner-name').innerText = winner;
    document.getElementById('final-scores').innerText = `${game.score1} : ${game.score2}`;
    goToScreen('final');
}