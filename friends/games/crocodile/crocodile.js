let game = {
    players: [],
    currentPlayerIndex: 0,
    selectedCats: [],
    roundWords: [],
    currentWordIndex: 0,
    scores: {},
    timer: 60,
    interval: null,
    startX: 0
};

const LABELS = {
    objects: 'ПРЕДМЕТЫ', animals: 'ЖИВОТНЫЕ', actions: 'ДЕЙСТВИЯ',
    professions: 'ПРОФЕССИИ', movies: 'КИНО', food: 'ЕДА', memnoe: 'МЕМНОЕ'
};

function init() {
    const grid = document.getElementById('categoriesGrid');
    Object.keys(crocodileWords).forEach(cat => {
        if (cat === 'adult') return;
        const div = document.createElement('div');
        div.className = 'cat-tag';
        div.innerText = LABELS[cat] || cat;
        div.onclick = () => {
            div.classList.toggle('active');
            game.selectedCats.includes(cat) ? 
                game.selectedCats = game.selectedCats.filter(c => c !== cat) : 
                game.selectedCats.push(cat);
        };
        grid.appendChild(div);
    });
    setupGestures();
}

function addPlayerField() {
    const list = document.getElementById('playerList');
    const div = document.createElement('div');
    div.className = 'player-bubble';
    div.innerHTML = `<input type="text" placeholder="ИМЯ">`;
    list.insertBefore(div, list.lastElementChild);
}

function startGame() {
    const names = Array.from(document.querySelectorAll('.player-input, .player-bubble input')).map(i => i.value.trim()).filter(v => v);
    if (names.length < 2 || game.selectedCats.length === 0) return alert('Добавь игроков и выбери темы');
    
    game.players = names;
    game.players.forEach(p => game.scores[p] = 0);
    game.currentPlayerIndex = 0;
    showTransfer();
}

function showTransfer() {
    if (game.currentPlayerIndex >= game.players.length) return showFinal();
    switchScreen('transferScreen');
    document.getElementById('currentPlayerName').innerText = game.players[game.currentPlayerIndex];
}

function startRound() {
    let pool = [];
    game.selectedCats.forEach(c => pool = pool.concat(crocodileWords[c]));
    game.roundWords = pool.sort(() => Math.random() - 0.5).slice(0, 20);
    game.currentWordIndex = 0;
    
    switchScreen('gameScreen');
    document.getElementById('gamePlayerName').innerText = game.players[game.currentPlayerIndex];
    updateWord();
    startTimer();
}

function updateWord() {
    if (game.currentWordIndex >= game.roundWords.length) return endRound();
    const w = game.roundWords[game.currentWordIndex];
    document.getElementById('currentWord').innerText = w.word;
    document.getElementById('wordCategory').innerText = LABELS[w.category];
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

function setupGestures() {
    const area = document.getElementById('swipeArea');
    const card = document.getElementById('wordCard');
    const sDone = document.querySelector('.swipe-label.done');
    const sSkip = document.querySelector('.swipe-label.skip');

    area.addEventListener('touchstart', e => { game.startX = e.touches[0].clientX; });
    
    area.addEventListener('touchmove', e => {
        let diff = e.touches[0].clientX - game.startX;
        card.style.transform = `translateX(${diff}px) rotate(${diff/15}deg)`;
        sDone.style.opacity = diff > 50 ? diff/150 : 0;
        sSkip.style.opacity = diff < -50 ? Math.abs(diff/150) : 0;
    });

    area.addEventListener('touchend', e => {
        let diff = e.changedTouches[0].clientX - game.startX;
        card.style.transform = '';
        sDone.style.opacity = 0;
        sSkip.style.opacity = 0;

        if (diff > 120) handleAnswer(true);
        else if (diff < -120) handleAnswer(false);
    });
}

function handleAnswer(isOk) {
    if (isOk) game.scores[game.players[game.currentPlayerIndex]]++;
    game.currentWordIndex++;
    updateWord();
}

function endRound() {
    clearInterval(game.interval);
    game.currentPlayerIndex++;
    showTransfer();
}

function showFinal() {
    switchScreen('resultsScreen');
    const res = document.getElementById('leaderboard');
    const sorted = Object.entries(game.scores).sort((a,b) => b[1]-a[1]);
    res.innerHTML = sorted.map(([n, s]) => `
        <div class="score-row"><span>${n}</span><span>${s}</span></div>
    `).join('');
}

function switchScreen(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goBack() { if (confirm('Выйти?')) location.reload(); }

document.addEventListener('DOMContentLoaded', init);
