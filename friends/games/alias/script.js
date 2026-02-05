let state = {
    mode: '',
    category: '',
    teams: [{name: '', score: 0}, {name: '', score: 0}],
    currentTeam: 0,
    time: 60,
    timeLeft: 60,
    timer: null,
    usedWords: []
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectMode(m) {
    state.mode = m;
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    
    Object.keys(CARDS_DB[m]).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'menu-card';
        btn.innerHTML = `<strong>${CATEGORY_LABELS[cat]}</strong>`;
        btn.onclick = () => {
            state.category = cat;
            showScreen('screen-setup');
        };
        list.appendChild(btn);
    });
    showScreen('screen-categories');
}

function startApp() {
    state.teams[0].name = document.getElementById('t1-name').value;
    state.teams[1].name = document.getElementById('t2-name').value;
    state.time = parseInt(document.getElementById('time-range').value);
    
    prepareRound();
    showScreen('screen-game');
}

function prepareRound() {
    clearInterval(state.timer);
    state.timeLeft = state.time;
    document.getElementById('timer-box').innerText = state.timeLeft;
    document.getElementById('score-box').innerText = state.teams[state.currentTeam].score;
    document.getElementById('current-team-name').innerText = state.teams[state.currentTeam].name;
    document.getElementById('round-overlay').classList.add('active');
}

function startTimer() {
    document.getElementById('round-overlay').classList.remove('active');
    nextWord();
    state.timer = setInterval(() => {
        state.timeLeft--;
        document.getElementById('timer-box').innerText = state.timeLeft;
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            alert(`Раунд окончен! Очки команды: ${state.teams[state.currentTeam].score}`);
            state.currentTeam = state.currentTeam === 0 ? 1 : 0;
            prepareRound();
        }
    }, 1000);
}

function nextWord() {
    const words = CARDS_DB[state.mode][state.category];
    const available = words.filter(w => !state.usedWords.includes(w));
    const finalPool = available.length > 0 ? available : words;
    
    const word = finalPool[Math.floor(Math.random() * finalPool.length)];
    document.getElementById('word-card').innerText = word;
    state.currentWord = word;
    state.usedWords.push(word);
}

function answer(isCorrect) {
    if (isCorrect) {
        state.teams[state.currentTeam].score++;
    } else {
        state.teams[state.currentTeam].score--;
    }
    document.getElementById('score-box').innerText = state.teams[state.currentTeam].score;
    nextWord();
}

// Слушатель для ползунка времени
document.getElementById('time-range').oninput = function() {
    document.getElementById('time-val').innerText = this.value;
};