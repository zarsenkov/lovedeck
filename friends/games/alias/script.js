// Настройки по умолчанию
let config = { time: 60, diff: 'easy' };
let gameState = { score: 0, timer: null, timeLeft: 0, wordsLog: [] };

const wordsBase = {
    easy: ["Кошка", "Арбуз", "Пицца", "Школа", "Гитара", "Космос", "Лимон", "Кино", "Облако", "Море"],
    hard: ["Синхрофазотрон", "Дефолт", "Когнитивность", "Аскетизм", "Метафора", "Эфемерность"]
};

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('game-header').style.display = (id === 'screen-game') ? 'flex' : 'none';
}

function setOpt(key, val, el) {
    config[key] = val;
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function startGame() {
    gameState.score = 0;
    gameState.wordsLog = [];
    gameState.timeLeft = config.time;
    document.getElementById('live-score').innerText = '0';
    
    toScreen('screen-game');
    nextWord();
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        let m = Math.floor(gameState.timeLeft / 60);
        let s = gameState.timeLeft % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        
        if (gameState.timeLeft <= 0) finishGame();
    }, 1000);
}

function nextWord() {
    const pool = wordsBase[config.diff];
    const word = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById('word-display').innerText = word;
}

function handleWord(isCorrect) {
    const currentWord = document.getElementById('word-display').innerText;
    gameState.score += isCorrect ? 1 : -1;
    gameState.wordsLog.push({ word: currentWord, status: isCorrect });
    document.getElementById('live-score').innerText = gameState.score;
    
    // Эффект "прыжка" карточки
    const card = document.querySelector('.word-card');
    card.style.transform = "scale(0.95)";
    setTimeout(() => { card.style.transform = "scale(1)"; nextWord(); }, 100);
}

function finishGame() {
    clearInterval(gameState.timer);
    toScreen('screen-results');
    document.getElementById('final-score').innerText = gameState.score;
    
    const list = document.getElementById('results-list');
    list.innerHTML = gameState.wordsLog.map(item => `
        <div class="word-row">
            <span>${item.word}</span>
            <span style="color: ${item.status ? 'var(--mint)' : '#FEB2B2'}">${item.status ? '✓' : '✕'}</span>
        </div>
    `).join('');
}