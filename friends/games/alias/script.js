let score = 0;
let timeLeft = 60;
let gameActive = false;
let currentWords = [];
let usedWords = [];

// Инициализация
function startGame() {
    const selectedCat = document.querySelector('.cat-btn.active').dataset.cat;
    currentWords = [...CARDS[selectedCat]];
    score = 0;
    document.getElementById('screen-setup').classList.remove('active');
    document.getElementById('screen-play').classList.add('active');
    nextWord();
    startTimer();
}

function nextWord() {
    if (currentWords.length === 0) return endGame();
    const randomIndex = Math.floor(Math.random() * currentWords.length);
    const word = currentWords.splice(randomIndex, 1)[0];
    document.getElementById('word-text').textContent = word;
}

// Простая логика свайпа (для примера кнопками, но можно добавить тач)
function handleAction(isCorrect) {
    if (isCorrect) {
        score++;
        document.body.style.background = '#0057FF';
    } else {
        score--;
        document.body.style.background = '#FF0000';
    }
    setTimeout(() => document.body.style.background = '#FFFFFF', 100);
    document.getElementById('current-score').textContent = score;
    nextWord();
}

function startTimer() {
    const timerEl = document.getElementById('timer-display');
    const interval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    document.getElementById('screen-play').classList.remove('active');
    document.getElementById('screen-results').classList.add('active');
    document.getElementById('final-score').textContent = score;
}