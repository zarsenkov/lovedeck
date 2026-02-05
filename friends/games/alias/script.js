let gameState = {
    mode: '',
    category: '',
    teams: [{name: '', score: 0}, {name: '', score: 0}],
    activeTeam: 0,
    roundTime: 60,
    currentTime: 60,
    wordsToWin: 20,
    currentWord: '',
    usedWords: [],
    timerId: null
};

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Инициализация настроек
function setupGame(mode) {
    gameState.mode = mode;
    const catSelect = document.getElementById('select-category');
    catSelect.innerHTML = '';
    
    Object.keys(CARD_DATA[mode]).forEach(cat => {
        let opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = CATEGORY_NAMES[cat];
        catSelect.appendChild(opt);
    });

    document.getElementById('round-time').addEventListener('input', (e) => {
        document.getElementById('time-val').innerText = e.target.value;
    });

    showScreen('screen-setup');
}

// Старт игры
function startGame() {
    gameState.category = document.getElementById('select-category').value;
    gameState.teams[0].name = document.getElementById('team1-name').value || "Тигры";
    gameState.teams[1].name = document.getElementById('team2-name').value || "Львы";
    gameState.roundTime = parseInt(document.getElementById('round-time').value);
    
    gameState.activeTeam = 0;
    gameState.teams[0].score = 0;
    gameState.teams[1].score = 0;
    
    prepareRound();
}

function prepareRound() {
    gameState.currentTime = gameState.roundTime;
    document.getElementById('current-team-display').innerText = gameState.teams[gameState.activeTeam].name;
    document.getElementById('timer').innerText = gameState.currentTime;
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('word-card').innerText = 'Нажми "Готово" для начала';
    
    showScreen('screen-game');
}

function nextWord(isCorrect) {
    // Если раунд еще не начат (первое нажатие)
    if (!gameState.timerId) {
        startTimer();
    } else {
        // Подсчет очков
        if (isCorrect) {
            gameState.teams[gameState.activeTeam].score++;
        } else {
            gameState.teams[gameState.activeTeam].score--; // Штраф
        }
    }

    const words = CARD_DATA[gameState.mode][gameState.category];
    const availableWords = words.filter(w => !gameState.usedWords.includes(w));
    
    if (availableWords.length === 0) {
        gameState.usedWords = []; // Сброс, если слова кончились
        return nextWord(isCorrect);
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    gameState.currentWord = randomWord;
    gameState.usedWords.push(randomWord);
    document.getElementById('word-card').innerText = randomWord;
}

function startTimer() {
    gameState.timerId = setInterval(() => {
        gameState.currentTime--;
        document.getElementById('timer').innerText = gameState.currentTime;
        const percent = (gameState.currentTime / gameState.roundTime) * 100;
        document.getElementById('progress-fill').style.width = percent + '%';

        if (gameState.currentTime <= 0) {
            endRound();
        }
    }, 1000);
}

function endRound() {
    clearInterval(gameState.timerId);
    gameState.timerId = null;
    
    document.getElementById('res-team1-name').innerText = gameState.teams[0].name;
    document.getElementById('res-team1-score').innerText = gameState.teams[0].score;
    document.getElementById('res-team2-name').innerText = gameState.teams[1].name;
    document.getElementById('res-team2-score').innerText = gameState.teams[1].score;

    showScreen('screen-results');
}

function nextStep() {
    // Проверка на победу (например, до 20 очков)
    if (gameState.teams[gameState.activeTeam].score >= 20) {
        alert("Победа команды " + gameState.teams[gameState.activeTeam].name + "!");
        location.reload();
        return;
    }

    // Смена команды
    gameState.activeTeam = gameState.activeTeam === 0 ? 1 : 0;
    prepareRound();
}