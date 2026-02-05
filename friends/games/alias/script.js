const state = {
    mode: '',
    category: '',
    teams: [{ name: '', score: 0 }, { name: '', score: 0 }],
    activeTeam: 0,
    roundTime: 60,
    timeLeft: 60,
    timer: null,
    usedWords: new Set(),
    history: [], // Для Undo
    isDragging: false,
    startX: 0,
    currentX: 0
};

// --- Навигация ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectMode(m) {
    state.mode = m;
    renderCategories();
    showScreen('screen-categories');
    vibrate(20);
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    const packs = CARDS_DB[state.mode];
    Object.keys(packs).forEach(key => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerText = key;
        div.onclick = () => {
            state.category = key;
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            div.classList.add('active');
            showScreen('screen-setup');
            vibrate(15);
        };
        grid.appendChild(div);
    });
}

// --- Логика игры ---
function initGameSession() {
    state.teams[0].name = document.getElementById('team1-in').value || 'TEAM ONE';
    state.teams[1].name = document.getElementById('team2-in').value || 'TEAM TWO';
    state.roundTime = parseInt(document.getElementById('time-range').value);
    state.activeTeam = 0;
    state.teams[0].score = 0;
    state.teams[1].score = 0;
    state.usedWords.clear();
    prepareRound();
    showScreen('screen-game');
}

function prepareRound() {
    state.timeLeft = state.roundTime;
    state.history = [];
    document.getElementById('round-overlay').classList.add('active');
    document.getElementById('current-team-name').innerText = state.teams[state.activeTeam].name;
    document.getElementById('game-timer').innerText = state.timeLeft;
    document.getElementById('game-score').innerText = '00';
    document.getElementById('btn-undo').classList.add('hidden');
}

function startRound() {
    document.getElementById('round-overlay').classList.remove('active');
    setNextWord();
    state.timer = setInterval(() => {
        state.timeLeft--;
        document.getElementById('game-timer').innerText = state.timeLeft;
        if (state.timeLeft <= 0) endRound();
    }, 1000);
}

function setNextWord() {
    const pool = CARDS_DB[state.mode][state.category];
    const available = pool.filter(w => !state.usedWords.has(w));
    
    if (available.length === 0) state.usedWords.clear();
    
    const word = available[Math.floor(Math.random() * available.length)];
    document.getElementById('swipe-card').querySelector('.card-content').innerText = word;
    state.currentWord = word;
}

// --- Swipe Engine ---
const card = document.getElementById('swipe-card');
const indicatorLeft = document.querySelector('.indicator.left');
const indicatorRight = document.querySelector('.indicator.right');

card.addEventListener('touchstart', (e) => {
    state.isDragging = true;
    state.startX = e.touches[0].clientX;
    card.style.transition = 'none';
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!state.isDragging) return;
    state.currentX = e.touches[0].clientX;
    const diff = state.currentX - state.startX;
    const rotation = diff / 10;
    
    card.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
    
    // Индикаторы
    indicatorRight.style.opacity = Math.min(diff / 100, 1);
    indicatorLeft.style.opacity = Math.min(-diff / 100, 1);
}, { passive: true });

document.addEventListener('touchend', () => {
    if (!state.isDragging) return;
    state.isDragging = false;
    card.style.transition = '0.3s cubic-bezier(0.23, 1, 0.32, 1)';
    
    const diff = state.currentX - state.startX;
    if (Math.abs(diff) > 120) {
        handleAction(diff > 0);
    } else {
        resetCard();
    }
});

function resetCard() {
    card.style.transform = 'translateX(0) rotate(0)';
    indicatorLeft.style.opacity = 0;
    indicatorRight.style.opacity = 0;
}

function handleAction(isCorrect) {
    const points = isCorrect ? 1 : -1;
    state.teams[state.activeTeam].score += points;
    state.usedWords.add(state.currentWord);
    state.history.push({ word: state.currentWord, ok: isCorrect });
    
    // Анимация вылета
    card.style.transform = `translateX(${isCorrect ? 500 : -500}px) rotate(${isCorrect ? 45 : -45}deg)`;
    vibrate(isCorrect ? 20 : [30, 30]);

    document.getElementById('game-score').innerText = String(Math.max(0, state.teams[state.activeTeam].score)).padStart(2, '0');
    document.getElementById('btn-undo').classList.remove('hidden');

    setTimeout(() => {
        resetCard();
        setNextWord();
    }, 200);
}

function undoLastAction() {
    if (state.history.length === 0) return;
    const last = state.history.pop();
    state.teams[state.activeTeam].score -= (last.ok ? 1 : -1);
    state.usedWords.delete(last.word);
    
    document.getElementById('swipe-card').querySelector('.card-content').innerText = last.word;
    state.currentWord = last.word;
    document.getElementById('game-score').innerText = String(Math.max(0, state.teams[state.activeTeam].score)).padStart(2, '0');
    
    if (state.history.length === 0) document.getElementById('btn-undo').classList.add('hidden');
    vibrate(10);
}

function endRound() {
    clearInterval(state.timer);
    vibrate([100, 50, 100]);
    
    const list = document.getElementById('summary-list');
    list.innerHTML = state.history.map(h => `
        <div class="sum-item ${h.ok ? 'ok' : 'skip'}">
            <span>${h.word}</span>
            <span>${h.ok ? '+1' : '-1'}</span>
        </div>
    `).join('');
    
    showScreen('screen-summary');
}

function nextRoundPre() {
    state.activeTeam = state.activeTeam === 0 ? 1 : 0;
    prepareRound();
    showScreen('screen-game');
}

function vibrate(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// Запрет скролла и зума
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });