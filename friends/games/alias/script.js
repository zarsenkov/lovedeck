// Состояние игры
let state = {
    score: 0,
    time: 60,
    currentTime: 60,
    history: [], // {word, isCorrect}
    words: [],
    currentCategory: 'base',
    timerInterval: null,
    isDragging: false,
    startX: 0,
    currentX: 0
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Клики по категориям
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.currentCategory = e.currentTarget.dataset.cat;
        });
    });
});

// Настройка времени
function adjustTime(amount) {
    state.time = Math.max(10, Math.min(180, state.time + amount));
    document.getElementById('time-val').textContent = state.time;
    document.getElementById('game-timer').textContent = state.time;
}

// Запуск игры
function initGame() {
    state.words = [...CARDS[state.currentCategory]].sort(() => Math.random() - 0.5);
    state.score = 0;
    state.currentTime = state.time;
    state.history = [];
    
    document.getElementById('score-val').textContent = '0';
    showScreen('screen-play');
    nextWord();
    startTimer();
    initSwipe();
}

function nextWord() {
    if (state.words.length === 0) return endGame();
    const word = state.words.pop();
    const display = document.getElementById('word-display');
    display.textContent = word;
    
    // Динамический размер шрифта для длинных слов
    display.style.fontSize = word.length > 10 ? '1.8rem' : '2.5rem';
}

function handleSwipe(direction) {
    const word = document.getElementById('word-display').textContent;
    const isCorrect = direction === 'right';
    
    state.history.push({ word, isCorrect });
    state.score += isCorrect ? 1 : -1;
    
    document.getElementById('score-val').textContent = state.score;
    
    // Мягкая индикация (подсветка карточки)
    const card = document.getElementById('card');
    card.style.borderColor = isCorrect ? 'var(--blue)' : 'var(--red)';
    setTimeout(() => card.style.borderColor = 'var(--black)', 200);

    if ('vibrate' in navigator) navigator.vibrate(isCorrect ? 30 : 60);
    nextWord();
}

function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    const timerEl = document.getElementById('game-timer');
    
    state.timerInterval = setInterval(() => {
        state.currentTime--;
        timerEl.textContent = state.currentTime;
        
        if (state.currentTime <= 10) timerEl.style.color = 'var(--red)';
        else timerEl.style.color = 'var(--white)';

        if (state.currentTime <= 0) {
            clearInterval(state.timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    showScreen('screen-results');
    document.getElementById('res-score').textContent = state.score;
    
    // Вывод списка слов в итогах
    const reviewEl = document.getElementById('words-review');
    reviewEl.innerHTML = state.history.map(item => `
        <div class="word-item ${item.isCorrect ? 'correct' : 'wrong'}">
            <span>${item.word}</span>
            <i class="fas ${item.isCorrect ? 'fa-check' : 'fa-times'}"></i>
        </div>
    `).join('');
}

function undoLast() {
    if (state.history.length === 0) return;
    const last = state.history.pop();
    state.words.push(document.getElementById('word-display').textContent);
    document.getElementById('word-display').textContent = last.word;
    state.score -= last.isCorrect ? 1 : -1;
    document.getElementById('score-val').textContent = state.score;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Физика свайпа (улучшенная)
function initSwipe() {
    const card = document.getElementById('card');
    
    card.addEventListener('touchstart', (e) => {
        state.startX = e.touches[0].clientX;
        state.isDragging = true;
        card.style.transition = 'none';
    });

    card.addEventListener('touchmove', (e) => {
        if (!state.isDragging) return;
        state.currentX = e.touches[0].clientX - state.startX;
        const rotate = state.currentX / 15;
        card.style.transform = `translateX(${state.currentX}px) rotate(${rotate}deg)`;
        
        // Легкая подсветка границ при тяге
        if (state.currentX > 50) card.style.boxShadow = '10px 10px 0 var(--blue)';
        else if (state.currentX < -50) card.style.boxShadow = '-10px 10px 0 var(--red)';
        else card.style.boxShadow = 'none';
    });

    card.addEventListener('touchend', () => {
        state.isDragging = false;
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        
        if (Math.abs(state.currentX) > 120) {
            handleSwipe(state.currentX > 0 ? 'right' : 'left');
        }
        
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.style.boxShadow = 'none';
        state.currentX = 0;
    });
}