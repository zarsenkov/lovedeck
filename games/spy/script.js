const LOCATIONS = [
    "ОРБИТАЛЬНАЯ СТАНЦИЯ", "НОЧНОЙ КЛУБ", "БОЛЬНИЦА", "ТЕАТР", "ПОДВОДНАЯ ЛОДКА",
    "БАНК", "АЭРОПОРТ", "ЦЕРКОВЬ", "АРКТИЧЕСКАЯ СТАНЦИЯ", "ПИРАТСКИЙ КОРАБЛЬ",
    "ШКОЛА", "РЕСТОРАН", "ПОЛИЦЕЙСКИЙ УЧАСТОК", "ОТЕЛЬ", "ЦИРК ШАПИТО"
];

let state = {
    players: 3, spies: 1, time: 5,
    playerNames: [], roles: [],
    currentPlayer: 0, timerInterval: null,
    votes: {}, currentVoterIdx: 0, currentLoc: ""
};

// Инициализация имен
updateNameInputs();

function changeVal(key, delta) {
    if (key === 'players') {
        state.players = Math.max(3, Math.min(12, state.players + delta));
        let maxS = state.players >= 11 ? 3 : (state.players >= 7 ? 2 : 1);
        if (state.spies > maxS) state.spies = maxS;
        updateNameInputs();
    } else if (key === 'spies') {
        let maxS = state.players >= 11 ? 3 : (state.players >= 7 ? 2 : 1);
        state.spies = Math.max(1, Math.min(maxS, state.spies + delta));
    } else if (key === 'time') {
        state.time = Math.max(1, Math.min(15, state.time + delta));
    }
    updateUI();
}

function updateNameInputs() {
    const container = document.getElementById('player-names-list');
    container.innerHTML = '';
    for (let i = 0; i < state.players; i++) {
        const input = document.createElement('input');
        input.className = 'name-input';
        input.placeholder = `Имя ${i + 1}`;
        input.value = state.playerNames[i] || "";
        input.oninput = (e) => state.playerNames[i] = e.target.value;
        container.appendChild(input);
    }
}

function updateUI() {
    document.getElementById('player-count').innerText = state.players;
    document.getElementById('spy-count').innerText = state.spies;
    document.getElementById('time-limit').innerText = state.time;
}

function startDistribution() {
    state.playerNames.length = state.players; 
    for (let i = 0; i < state.players; i++) {
        if (!state.playerNames[i]) state.playerNames[i] = `Игрок ${i + 1}`;
    }

    state.currentLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    state.roles = new Array(state.players).fill(state.currentLoc);
    
    let sCount = state.spies;
    while (sCount > 0) {
        let idx = Math.floor(Math.random() * state.players);
        if (state.roles[idx] !== "ШПИОН") {
            state.roles[idx] = "ШПИОН";
            sCount--;
        }
    }

    state.currentPlayer = 0;
    showPlayerCard();
    toScreen('card-screen');
}

function showPlayerCard() {
    document.getElementById('current-player-display').innerText = state.playerNames[state.currentPlayer].toUpperCase();
    document.getElementById('main-card').classList.remove('flipped');
    document.getElementById('next-player-btn').classList.add('hidden');
    
    const role = state.roles[state.currentPlayer];
    document.getElementById('role-text').innerText = (role === "ШПИОН") ? "ВЫ —" : "ЛОКАЦИЯ:";
    document.getElementById('location-name').innerText = role;
}

function toggleRoleVisible() {
    document.getElementById('main-card').classList.add('flipped');
    document.getElementById('next-player-btn').classList.remove('hidden');
}

function nextPlayer() {
    state.currentPlayer++;
    if (state.currentPlayer < state.players) showPlayerCard();
    else startTimer();
}

function startTimer() {
    toScreen('game-screen');
    let total = state.time * 60;
    let left = total;
    
    state.timerInterval = setInterval(() => {
        left--;
        let m = Math.floor(left / 60), s = left % 60;
        document.getElementById('countdown').innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
        document.getElementById('timer-progress').style.strokeDashoffset = 565 - (left / total) * 565;
        if (left <= 0) stopGame();
    }, 1000);
}

function stopGame() {
    clearInterval(state.timerInterval);
    state.currentVoterIdx = 0;
    state.votes = {};
    state.playerNames.forEach(n => state.votes[n] = 0);
    renderVoting();
}

function renderVoting() {
    toScreen('vote-screen');
    document.getElementById('voter-name-display').innerText = state.playerNames[state.currentVoterIdx].toUpperCase();
    const list = document.getElementById('vote-list');
    list.innerHTML = state.playerNames.map((n, i) => 
        (i === state.currentVoterIdx) ? '' : `<div class="vote-item" onclick="castVote('${n}', this)">${n}</div>`
    ).join('');
}

function castVote(name, element) {
    element.classList.add('selected');
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(40);

    setTimeout(() => {
        state.votes[name]++;
        state.currentVoterIdx++;
        if (state.currentVoterIdx < state.players) renderVoting();
        else showFinal();
    }, 300);
}

function showFinal() {
    toScreen('results-screen');
    let target = Object.keys(state.votes).reduce((a, b) => state.votes[a] > state.votes[b] ? a : b);
    let targetIdx = state.playerNames.indexOf(target);
    let win = state.roles[targetIdx] === "ШПИОН";

    const label = document.getElementById('winner-status');
    label.innerText = win ? "ПОБЕДА ИГРОКОВ!" : "ПОБЕДА ШПИОНА!";
    label.style.background = win ? "var(--neon-cyan)" : "var(--neon-red)";

    document.getElementById('true-spies-list').innerText = state.playerNames.filter((n, i) => state.roles[i] === "ШПИОН").join(", ");
    document.getElementById('true-location').innerText = state.currentLoc;

    document.getElementById('vote-stats').innerHTML = state.playerNames.map(n => `
        <div class="stat-line"><span>${n}</span><span>${state.votes[n]} 👤</span></div>
    `).join('');
}

function toggleRules(s) { document.getElementById('rules-modal').classList.toggle('active', s); }
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
