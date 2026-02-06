let game = {
    players: [],
    currentPlayerIndex: 0,
    selectedCategories: [],
    roundWords: [],
    currentWordIndex: 0,
    score: {},
    timer: 60,
    interval: null
};

const CAT_NAMES = {
    objects: 'ПРЕДМЕТЫ', animals: 'ЖИВОТНЫЕ', actions: 'ДЕЙСТВИЯ',
    professions: 'ПРОФЕССИИ', movies: 'КИНО', food: 'ЕДА', memnoe: 'МЕМНОЕ'
};

function initCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
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
}

function addPlayerField() {
    const stack = document.getElementById('playerList');
    const div = document.createElement('div');
    div.className = 'player-chip';
    div.innerHTML = `
        <input type="text" class="player-input" placeholder="Игрок">
        <button class="chip-del" onclick="this.parentElement.remove()">×</button>
    `;
    stack.appendChild(div);
}

function startGame() {
    const inputs = document.querySelectorAll('.player-input');
    game.players = Array.from(inputs).map(i => i.value.trim()).filter(v => v);
    
    if (game.players.length < 2) return alert('Нужно минимум 2 игрока!');
    if (game.selectedCategories.length === 0) return alert('Выберите категорию!');

    game.players.forEach(p => game.score[p] = 0);
    game.currentPlayerIndex = 0;
    showTransferScreen();
}

function showTransferScreen() {
    if (game.currentPlayerIndex >= game.players.length) return showResults();
    switchScreen('transferScreen');
    document.getElementById('currentPlayerName').innerText = game.players[game.currentPlayerIndex];
}

function startRound() {
    let allWords = [];
    game.selectedCategories.forEach(cat => allWords = allWords.concat(crocodileWords[cat]));
    game.roundWords = allWords.sort(() => Math.random() - 0.5).slice(0, 10);
    game.currentWordIndex = 0;
    
    switchScreen('gameScreen');
    document.getElementById('gamePlayerName').innerText = game.players[game.currentPlayerIndex];
    setWord();
    startTimer();
}

function setWord() {
    if (game.currentWordIndex >= game.roundWords.length) return endRound();
    const wordObj = game.roundWords[game.currentWordIndex];
    document.getElementById('currentWord').innerText = wordObj.word;
    document.getElementById('wordCategory').innerText = CAT_NAMES[wordObj.category];
}

function nextWord(isSuccess) {
    if (isSuccess) game.score[game.players[game.currentPlayerIndex]] += 1;
    game.currentWordIndex++;
    setWord();
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
    showTransferScreen();
}

function showResults() {
    switchScreen('resultsScreen');
    const board = document.getElementById('leaderboard');
    const sorted = Object.entries(game.score).sort((a,b) => b[1] - a[1]);
    board.innerHTML = sorted.map(([name, score], i) => `
        <div style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid #2d2d44;">
            <span>${i+1}. ${name}</span>
            <span style="color:var(--neon-blue)">${score} очков</span>
        </div>
    `).join('');
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showRules() { document.getElementById('rulesModal').classList.add('active'); }
function closeRules() { document.getElementById('rulesModal').classList.remove('active'); }
function goBack() { if (confirm('Выйти?')) location.reload(); }

document.addEventListener('DOMContentLoaded', initCategories);
