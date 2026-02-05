let game = {
    mode: '',
    category: '',
    teams: [],
    activeTeamIdx: 0,
    timePerRound: 60,
    timer: null,
    timeLeft: 0,
    currentRoundWords: [], // Храним историю раунда {word: '...', points: 1/-1}
    usedWords: new Set()
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function initGame(mode) {
    game.mode = mode;
    const select = document.getElementById('category-select');
    select.innerHTML = '';
    Object.keys(CARD_DATA[mode]).forEach(cat => {
        let opt = new Option(CATEGORY_NAMES[cat], cat);
        select.add(opt);
    });
    showScreen('screen-setup');
}

document.getElementById('time-range').oninput = function() {
    game.timePerRound = this.value;
    document.getElementById('time-display').innerText = this.value;
}

function startFullGame() {
    const t1 = document.getElementById('t1-in').value || 'Команда 1';
    const t2 = document.getElementById('t2-in').value || 'Команда 2';
    game.teams = [
        { name: t1, score: 0 },
        { name: t2, score: 0 }
    ];
    game.activeTeamIdx = 0;
    showScreen('screen-game');
    prepareNewRound();
}

function prepareNewRound() {
    game.timeLeft = game.timePerRound;
    game.currentRoundWords = [];
    document.getElementById('ready-overlay').classList.add('active');
    document.getElementById('next-team-name').innerText = game.teams[game.activeTeamIdx].name;
}

function startRound() {
    document.getElementById('ready-overlay').classList.remove('active');
    document.getElementById('game-score').innerText = '0';
    renderWord();
    
    game.timer = setInterval(() => {
        game.timeLeft--;
        document.getElementById('game-timer').innerText = game.timeLeft;
        if (game.timeLeft <= 0) endRound();
    }, 1000);
}

function renderWord() {
    const pool = CARD_DATA[game.mode][document.getElementById('category-select').value];
    const available = pool.filter(w => !game.usedWords.has(w));
    
    // Если слова кончились - чистим кэш
    if (available.length === 0) { game.usedWords.clear(); return renderWord(); }
    
    const word = available[Math.floor(Math.random() * available.length)];
    const card = document.getElementById('word-card');
    card.innerText = word;
    game.currentWord = word;
}

function handleAnswer(isCorrect) {
    if (!game.timer) return; // Чтобы нельзя было кликать до начала

    const points = isCorrect ? 1 : -1;
    game.currentRoundWords.push({ word: game.currentWord, points: points });
    game.usedWords.add(game.currentWord);
    
    // Анимация
    const card = document.getElementById('word-card');
    card.style.transform = isCorrect ? 'translateY(-20px)' : 'translateX(20px)';
    setTimeout(() => card.style.transform = 'translateY(0)', 100);

    // Обновляем текущий счет раунда (визуально)
    const currentScore = game.currentRoundWords.reduce((acc, curr) => acc + curr.points, 0);
    document.getElementById('game-score').innerText = currentScore;

    renderWord();
}

function endRound() {
    clearInterval(game.timer);
    game.timer = null;
    
    const roundTotal = game.currentRoundWords.reduce((acc, curr) => acc + curr.points, 0);
    game.teams[game.activeTeamIdx].score += roundTotal;
    
    // Рендерим лог слов
    const log = document.getElementById('round-words-list');
    log.innerHTML = game.currentRoundWords.map(item => `
        <div class="log-item ${item.points > 0 ? 'plus' : 'minus'}">
            <span>${item.word}</span>
            <span>${item.points > 0 ? '+1' : '-1'}</span>
        </div>
    `).join('');
    
    document.getElementById('round-total-points').innerText = roundTotal;
    showScreen('screen-summary');
}

function nextRoundPre() {
    game.activeTeamIdx = game.activeTeamIdx === 0 ? 1 : 0;
    showScreen('screen-game');
    prepareNewRound();
}