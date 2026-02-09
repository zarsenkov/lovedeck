let game = {
    team1: "Команда 1",
    team2: "Команда 2",
    score1: 0,
    score2: 0,
    activeTeam: 1,
    timer: null,
    timeLeft: 60,
    currentWord: "",
    difficulty: 'easy',
    roundPoints: 0
};

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

function startGame(diff) {
    game.difficulty = diff;
    game.roundPoints = 0;
    game.timeLeft = 60;
    
    // Обновляем имена команд
    game.team1 = document.getElementById('team1-name').value || "Команда 1";
    game.team2 = document.getElementById('team2-name').value || "Команда 2";
    
    document.getElementById('active-team-name').innerText = game.activeTeam === 1 ? game.team1 : game.team2;
    
    nextWord(null); // Генерируем первое слово
    startTimer();
    goToScreen('game');
}

function startTimer() {
    const timerEl = document.getElementById('timer');
    timerEl.innerText = game.timeLeft;
    
    game.timer = setInterval(() => {
        game.timeLeft--;
        timerEl.innerText = game.timeLeft;
        
        if (game.timeLeft <= 0) {
            endRound();
        }
    }, 1000);
}

function nextWord(isCorrect) {
    if (isCorrect === true) {
        game.roundPoints++;
        if (navigator.vibrate) navigator.vibrate(50);
    }
    
    const words = WORD_DATABASE[game.difficulty];
    game.currentWord = words[Math.floor(Math.random() * words.length)];
    
    const wordEl = document.getElementById('current-word');
    wordEl.style.opacity = 0;
    setTimeout(() => {
        wordEl.innerText = game.currentWord;
        wordEl.style.opacity = 1;
    }, 150);
}

function endRound() {
    clearInterval(game.timer);
    
    // Начисляем очки команде
    if (game.activeTeam === 1) {
        game.score1 += game.roundPoints;
        document.getElementById('score1').innerText = game.score1;
    } else {
        game.score2 += game.roundPoints;
        document.getElementById('score2').innerText = game.score2;
    }

    document.getElementById('round-points').innerText = `+${game.roundPoints} очков`;
    document.getElementById('round-winner').innerText = game.activeTeam === 1 ? game.team1 : game.team2;

    // Меняем ход
    game.activeTeam = game.activeTeam === 1 ? 2 : 1;
    
    goToScreen('results');
}

// Инициализация имен при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Можно добавить анимации листьев на фон
});