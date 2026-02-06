let game = {
    score: 0,
    time: 60,
    currentT: 60,
    history: [],
    words: [],
    cat: 'base',
    timer: null,
    startX: 0
};

// Выбор категории
document.querySelectorAll('.pop-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.pop-chip').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        game.cat = e.currentTarget.dataset.cat;
    });
});

function adjustTime(v) {
    game.time = Math.max(10, Math.min(180, game.time + v));
    document.getElementById('time-val').textContent = game.time;
}

function initGame() {
    game.words = [...CARDS[game.cat]].sort(() => Math.random() - 0.5);
    game.score = 0;
    game.currentT = game.time;
    game.history = [];
    
    document.getElementById('score-val').textContent = '0';
    showScreen('screen-play');
    nextWord();
    startTimer();
    initSwipe();
}

function nextWord() {
    if (game.words.length === 0) return endGame();
    document.getElementById('word-display').textContent = game.words.pop();
}

function handleSwipe(isRight) {
    const word = document.getElementById('word-display').textContent;
    game.history.push({ word, isRight });
    game.score += isRight ? 1 : -1;
    document.getElementById('score-val').textContent = game.score;
    
    // Визуальный отклик
    const card = document.getElementById('card');
    card.style.background = isRight ? 'var(--mint)' : 'var(--pink)';
    setTimeout(() => card.style.background = 'white', 200);

    if ('vibrate' in navigator) navigator.vibrate(isRight ? 25 : 50);
    nextWord();
}

function initSwipe() {
    const card = document.getElementById('card');
    card.addEventListener('touchstart', e => { game.startX = e.touches[0].clientX; card.style.transition = 'none'; });
    card.addEventListener('touchmove', e => {
        let x = e.touches[0].clientX - game.startX;
        card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
    });
    card.addEventListener('touchend', (e) => {
        card.style.transition = '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        let x = e.changedTouches[0].clientX - game.startX;
        if (Math.abs(x) > 100) handleSwipe(x > 0);
        card.style.transform = '';
    });
}

function startTimer() {
    if (game.timer) clearInterval(game.timer);
    game.timer = setInterval(() => {
        game.currentT--;
        document.getElementById('game-timer').textContent = game.currentT;
        if (game.currentT <= 0) endGame();
    }, 1000);
}

function endGame() {
    clearInterval(game.timer);
    showScreen('screen-results');
    document.getElementById('res-score').textContent = game.score;
    const list = document.getElementById('words-review');
    list.innerHTML = game.history.map(i => `
        <div class="word-row" style="border-color: ${i.isRight ? '#B2F5EA' : '#FED7E2'}">
            <span>${i.word}</span>
            <span>${i.isRight ? '👍' : '👎'}</span>
        </div>
    `).join('');
}

function showScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function undoLast() {
    if (game.history.length === 0) return;
    const last = game.history.pop();
    game.words.push(document.getElementById('word-display').textContent);
    document.getElementById('word-display').textContent = last.word;
    game.score -= last.isRight ? 1 : -1;
    document.getElementById('score-val').textContent = game.score;
}