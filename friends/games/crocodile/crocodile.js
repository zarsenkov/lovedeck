let game = {
    players: [],
    currentPlayerIndex: 0,
    selectedCategories: [],
    roundWords: [],
    currentWordIndex: 0,
    score: {},
    timer: 60,
    interval: null,
    touchStart: 0,
    touchEnd: 0
};

const CAT_NAMES = {
    objects: 'ПРЕДМЕТЫ', animals: 'ЖИВОТНЫЕ', actions: 'ДЕЙСТВИЯ',
    professions: 'ПРОФЕССИИ', movies: 'КИНО', food: 'ЕДА', memnoe: 'МЕМНОЕ'
};

function init() {
    const grid = document.getElementById('categoriesGrid');
    Object.keys(crocodileWords).forEach(cat => {
        if (cat === 'adult') return;
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerText = CAT_NAMES[cat] || cat;
        div.onclick = () => {
            div.classList.toggle('active');
            game.selectedCategories.includes(cat) ? 
                game.selectedCategories = game.selectedCategories.filter(c => c !== cat) : 
                game.selectedCategories.push(cat);
        };
        grid.appendChild(div);
    });
    setupSwipe();
}

function addPlayerField() {
    const stack = document.getElementById('playerList');
    const div = document.createElement('div');
    div.className = 'chip';
    div.innerHTML = `
        <input type="text" class="player-input" placeholder="Игрок">
        <button class="chip-remove" onclick="this.parentElement.remove()">×</button>
    `;
    stack.appendChild(div);
}

function startGame() {
    const inputs = document.querySelectorAll('.player-input');
    game.players = Array.from(inputs).map(i => i.value.trim()).filter(v => v);
    if (game.players.length < 2) return alert('Минимум 2 игрока!');
    if (game.selectedCategories.length === 0) return alert('Выбери тему!');

    game.players.forEach(p => game.score[p] = 0);
    game.currentPlayerIndex = 0;
    showTransfer();
}

function showTransfer() {
    if (game.currentPlayerIndex >= game.players.length) return showResults();
    switchScreen('transferScreen');
    document.getElementById('currentPlayerName').innerText = game.players[game.currentPlayerIndex];
}

function startRound() {
    let pool = [];
    game.selectedCategories.forEach(c => pool = pool.concat(crocodileWords[c]));
    game.roundWords = pool.sort(() => Math.random() - 0.5).slice(0, 15);
    game.currentWordIndex = 0;
    
    switchScreen('gameScreen');
    document.getElementById('gamePlayerName').innerText = game.players[game.currentPlayerIndex];
    setWord();
    startTimer();
}

function setWord() {
    if (game.currentWordIndex >= game.roundWords.length) return endRound();
    const w = game.roundWords[game.currentWordIndex];
    document.getElementById('currentWord').innerText = w.word;
    document.getElementById('wordCategory').innerText = CAT_NAMES[w.category];
}

function nextWord(ok) {
    if (ok) game.score[game.players[game.currentPlayerIndex]] += 1;
    game.currentWordIndex++;
    
    // Анимация карточки при переключении
    const card = document.getElementById('wordCard');
    card.style.transform = 'scale(0.8)';
    setTimeout(() => {
        setWord();
        card.style.transform = 'scale(1)';
    }, 100);
}

function setupSwipe() {
    const area = document.getElementById('swipeArea');
    const card = document.getElementById('wordCard');
    const hLeft = document.querySelector('.swipe-hint.left');
    const hRight = document.querySelector('.swipe-hint.right');

    area.addEventListener('touchstart', e => {
        game.touchStart = e.changedTouches[0].screenX;
    });

    area.addEventListener('touchmove', e => {
        let diff = e.changedTouches[0].screenX - game.touchStart;
        card.style.transform = `translateX(${diff}px) rotate(${diff/10}deg)`;
        hLeft.style.opacity = diff < 0 ? Math.abs(diff/100) : 0;
        hRight.style.opacity = diff > 0 ? Math.abs(diff/100) : 0;
    });

    area.addEventListener('touchend', e => {
        game.touchEnd = e.changedTouches[0].screenX;
        let diff = game.touchEnd - game.touchStart;
        
        card.style.transform = '';
        hLeft.style.opacity = 0;
        hRight.style.opacity = 0;

        if (diff > 100) nextWord(true); // Вправо - Угадано
        else if (diff < -100) nextWord(false); // Влево - Пас
    });
}

function startTimer() {
    game.timer = 60;
    document.getElementById('timer').innerText = game.timer;
    clearInterval(game.interval);
    game.interval = setInterval(() => {
        game.timer--;
        document.getElementById('timer').innerText = game.timer;
        if (game.timer <= 0) endRound();
    }, 1000);
}

function endRound() {
    clearInterval(game.interval);
    game.currentPlayerIndex++;
    showTransfer();
}

function showResults() {
    switchScreen('resultsScreen');
    const board = document.getElementById('leaderboard');
    const sorted = Object.entries(game.score).sort((a,b) => b[1] - a[1]);
    board.innerHTML = sorted.map(([n, s], i) => `
        <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--glass-border);">
            <span>${i+1}. ${n}</span>
            <span style="color:var(--accent-blue)">${s} очков</span>
        </div>
    `).join('');
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goBack() { if (confirm('Выйти?')) location.reload(); }

document.addEventListener('DOMContentLoaded', init);
