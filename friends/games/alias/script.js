let state = {
    score: 0,
    time: 60,
    history: [],
    words: [],
    isDragging: false,
    startX: 0,
    currentX: 0
};

// Инициализация
function initGame() {
    const cat = document.querySelector('.cat-btn.active').dataset.cat;
    state.words = [...CARDS[cat]].sort(() => Math.random() - 0.5);
    state.score = 0;
    showScreen('screen-play');
    nextWord();
    startTimer();
    initSwipe();
}

function nextWord() {
    if (state.words.length === 0) return endGame();
    const word = state.words.pop();
    document.getElementById('word-display').textContent = word;
}

function handleSwipe(direction) {
    const word = document.getElementById('word-display').textContent;
    const isCorrect = direction === 'right';
    
    state.history.push({ word, isCorrect });
    state.score += isCorrect ? 1 : -1;
    
    document.getElementById('score-val').textContent = state.score;
    flash(isCorrect ? 'blue' : 'red');
    if ('vibrate' in navigator) navigator.vibrate(isCorrect ? 30 : [50, 50]);
    
    nextWord();
}

function undoLast() {
    if (state.history.length === 0) return;
    const last = state.history.pop();
    state.words.push(document.getElementById('word-display').textContent);
    document.getElementById('word-display').textContent = last.word;
    state.score -= last.isCorrect ? 1 : -1;
    document.getElementById('score-val').textContent = state.score;
}

// ФИЗИКА СВАЙПА
function initSwipe() {
    const card = document.getElementById('card');
    
    card.addEventListener('touchstart', (e) => {
        state.startX = e.touches[0].clientX;
        state.isDragging = true;
    });

    card.addEventListener('touchmove', (e) => {
        if (!state.isDragging) return;
        state.currentX = e.touches[0].clientX - state.startX;
        const rotation = state.currentX / 10;
        card.style.transform = `translateX(${state.currentX}px) rotate(${rotation}deg)`;
    });

    card.addEventListener('touchend', () => {
        state.isDragging = false;
        if (Math.abs(state.currentX) > 100) {
            handleSwipe(state.currentX > 0 ? 'right' : 'left');
        }
        card.style.transform = '';
        state.currentX = 0;
    });
}

// ВСПОМОГАТЕЛЬНОЕ
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function flash(type) {
    const f = document.getElementById('flash');
    f.className = `flash-overlay flash-${type}`;
    f.style.opacity = '1';
    setTimeout(() => f.style.opacity = '0', 150);
}

function startTimer() {
    const interval = setInterval(() => {
        state.time--;
        document.getElementById('game-timer').textContent = state.time;
        if (state.time <= 0) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    showScreen('screen-results');
    document.getElementById('res-score').textContent = state.score;
}

function goToMenu() {
    window.location.href = '../../index.html';
}