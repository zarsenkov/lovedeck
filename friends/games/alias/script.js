let state = {
    score: 0,
    time: 60,
    currentT: 60,
    words: [],
    history: [],
    category: 'base',
    interval: null,
    startX: 0,
    currentX: 0
};

// Переключатель категорий
document.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.category = e.currentTarget.dataset.cat;
    });
});

function adjustTime(val) {
    state.time = Math.max(10, Math.min(180, state.time + val));
    document.getElementById('time-val').textContent = state.time;
}

function initGame() {
    state.words = [...CARDS[state.category]].sort(() => Math.random() - 0.5);
    state.score = 0;
    state.currentT = state.time;
    state.history = [];
    
    document.getElementById('score-val').textContent = '0';
    showScreen('screen-play');
    nextWord();
    startTimer();
    initSwipe();
}

function startTimer() {
    if (state.interval) clearInterval(state.interval);
    const timerEl = document.getElementById('game-timer');
    const bar = document.getElementById('progress-bar');
    
    state.interval = setInterval(() => {
        state.currentT--;
        timerEl.textContent = state.currentT;
        bar.style.width = (state.currentT / state.time * 100) + '%';
        
        if (state.currentT <= 0) {
            clearInterval(state.interval);
            endGame();
        }
    }, 1000);
}

function handleSwipe(dir) {
    const isOk = dir === 'right';
    const word = document.getElementById('word-display').textContent;
    
    state.history.push({ word, isOk });
    state.score += isOk ? 1 : -1;
    document.getElementById('score-val').textContent = state.score;
    
    // Мягкий фидбек: подсвечиваем рамку
    const card = document.getElementById('card');
    card.style.borderColor = isOk ? 'var(--soft-blue)' : 'var(--soft-red)';
    card.style.borderWidth = '3px';
    setTimeout(() => {
        card.style.borderColor = 'var(--gray)';
        card.style.borderWidth = '1px';
    }, 300);

    if ('vibrate' in navigator) navigator.vibrate(isOk ? 20 : 50);
    nextWord();
}

function undoLast() {
    if (state.history.length === 0) return;
    const last = state.history.pop();
    state.words.push(document.getElementById('word-display').textContent);
    document.getElementById('word-display').textContent = last.word;
    state.score -= last.isOk ? 1 : -1;
    document.getElementById('score-val').textContent = state.score;
}

function endGame() {
    showScreen('screen-results');
    document.getElementById('res-score').textContent = state.score;
    const rev = document.getElementById('words-review');
    rev.innerHTML = state.history.map(i => `
        <div class="word-item ${i.isOk ? 'correct' : 'wrong'}">
            <span>${i.word}</span>
            <span>${i.isOk ? '+1' : '0'}</span>
        </div>
    `).join('');
}

function nextWord() {
    if (state.words.length === 0) return endGame();
    document.getElementById('word-display').textContent = state.words.pop();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function initSwipe() {
    const card = document.getElementById('card');
    card.addEventListener('touchstart', e => { state.startX = e.touches[0].clientX; card.style.transition = 'none'; });
    card.addEventListener('touchmove', e => {
        state.currentX = e.touches[0].clientX - state.startX;
        card.style.transform = `translateX(${state.currentX}px) rotate(${state.currentX/20}deg)`;
    });
    card.addEventListener('touchend', () => {
        card.style.transition = '0.3s';
        if (Math.abs(state.currentX) > 120) handleSwipe(state.currentX > 0 ? 'right' : 'left');
        card.style.transform = '';
        state.currentX = 0;
    });
}

function goToMenu() { window.location.href = '../../index.html'; }