let game = {
    team1: "Тролли",
    team2: "Обезьяны",
    score1: 0,
    score2: 0,
    activeTeam: 1,
    currentRound: 1,
    maxRounds: 5,
    roundTime: 60,
    timeLeft: 60,
    timer: null,
    isPaused: false,
    selectedCats: ["objects", "actions"],
    currentWordPool: [],
    skipsCount: 0
};

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

function updateVal(type) {
    const val = document.getElementById(`setup-${type}`).value;
    document.getElementById(`val-${type}`).innerText = val;
    if(type === 'time') game.roundTime = parseInt(val);
    if(type === 'rounds') game.maxRounds = parseInt(val);
}

function toggleCat(el) {
    const cat = el.dataset.cat;
    if (game.selectedCats.includes(cat)) {
        if (game.selectedCats.length > 1) {
            game.selectedCats = game.selectedCats.filter(c => c !== cat);
            el.classList.remove('active');
        }
    } else {
        game.selectedCats.push(cat);
        el.classList.add('active');
    }
}

function initGame() {
    game.score1 = 0;
    game.score2 = 0;
    game.activeTeam = 1;
    game.currentRound = 1;
    game.team1 = document.getElementById('team1-name').value || "Команда 1";
    game.team2 = document.getElementById('team2-name').value || "Команда 2";
    
    // Собираем слова
    game.currentWordPool = [];
    game.selectedCats.forEach(cat => {
        game.currentWordPool = [...game.currentWordPool, ...WORD_DATABASE[cat]];
    });
    
    startTurn();
}

function startTurn() {
    game.timeLeft = game.roundTime;
    game.skipsCount = 0;
    game.roundPoints = 0;
    game.isPaused = false;
    
    document.getElementById('active-team-name').innerText = game.activeTeam === 1 ? game.team1 : game.team2;
    document.getElementById('current-round-display').innerText = game.currentRound;
    document.getElementById('curse-banner').classList.add('hidden');
    
    nextWord(null);
    goToScreen('game');
    startTimer();
}

function startTimer() {
    clearInterval(game.timer);
    game.timer = setInterval(() => {
        if (!game.isPaused) {
            game.timeLeft--;
            document.getElementById('timer').innerText = game.timeLeft;
            if (game.timeLeft <= 0) endTurn();
        }
    }, 1000);
}

function togglePause() {
    game.isPaused = !game.isPaused;
    alert(game.isPaused ? "Игра на паузе" : "Продолжаем!");
}

function nextWord(isCorrect) {
    if (isCorrect === true) {
        game.roundPoints++;
        if (navigator.vibrate) navigator.vibrate(50);
    } else if (isCorrect === false) {
        game.skipsCount++;
        // Если пропустили 3 слова - включаем проклятие
        if (game.skipsCount >= 3) {
            document.getElementById('curse-banner').classList.remove('hidden');
        }
    }

    const randomIndex = Math.floor(Math.random() * game.currentWordPool.length);
    const word = game.currentWordPool[randomIndex];
    
    const el = document.getElementById('current-word');
    el.style.transform = "scale(0.5)";
    el.style.opacity = "0";
    
    setTimeout(() => {
        el.innerText = word.toUpperCase();
        el.style.transform = "scale(1)";
        el.style.opacity = "1";
    }, 150);
}

function endTurn() {
    clearInterval(game.timer);
    
    if (game.activeTeam === 1) {
        game.score1 += game.roundPoints;
    } else {
        game.score2 += game.roundPoints;
    }

    document.getElementById('res-team-name').innerText = game.activeTeam === 1 ? game.team1 : game.team2;
    document.getElementById('round-points').innerText = `+${game.roundPoints}`;
    
    goToScreen('results');
}

function startNextTurn() {
    if (game.activeTeam === 2) {
        if (game.currentRound >= game.maxRounds) {
            showFinal();
            return;
        }
        game.currentRound++;
    }
    
    game.activeTeam = game.activeTeam === 1 ? 2 : 1;
    startTurn();
}

function showFinal() {
    const winnerName = game.score1 > game.score2 ? game.team1 : (game.score2 > game.score1 ? game.team2 : "НИЧЬЯ!");
    document.getElementById('final-winner-name').innerText = winnerName;
    document.getElementById('final-scores').innerText = `${game.score1} : ${game.score2}`;
    goToScreen('final');
}