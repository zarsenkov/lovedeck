const LOCATIONS = [
    "ОРБИТАЛЬНАЯ СТАНЦИЯ", "НОЧНОЙ КЛУБ", "БОЛЬНИЦА", "ТЕАТР", "ПОДВОДНАЯ ЛОДКА",
    "БАНК", "АЭРОПОРТ", "ЦЕРКОВЬ", "АРКТИЧЕСКАЯ СТАНЦИЯ", "ПИРАТСКИЙ КОРАБЛЬ",
    "ШКОЛА", "РЕСТОРАН", "ПОЛИЦЕЙСКИЙ УЧАСТОК", "ОТЕЛЬ", "ЦИРК ШАПИТО"
];

let state = {
    players: 3,
    spies: 1,
    time: 5,
    playerNames: ["Игрок 1", "Игрок 2", "Игрок 3"],
    roles: [],
    currentPlayer: 0,
    timerInterval: null
};

// Инициализация имен при загрузке
updateNameInputs();

function changeVal(key, delta) {
    if (key === 'players') {
        state.players = Math.max(3, Math.min(12, state.players + delta));
        
        // 1. ОГРАНИЧЕНИЕ ШПИОНОВ
        // 3-6 игроков: 1 шпион | 7-10: до 2 | 11-12: до 3
        let maxSpies = 1;
        if (state.players >= 7) maxSpies = 2;
        if (state.players >= 11) maxSpies = 3;
        
        if (state.spies > maxSpies) state.spies = maxSpies;
        updateNameInputs();
    } else if (key === 'spies') {
        let maxAllowed = (state.players >= 11) ? 3 : (state.players >= 7 ? 2 : 1);
        state.spies = Math.max(1, Math.min(maxAllowed, state.spies + delta));
    } else if (key === 'time') {
        state.time = Math.max(1, Math.min(15, state.time + delta));
    }
    updateUI();
}

function updateNameInputs() {
    const container = document.getElementById('player-names-list');
    container.innerHTML = '';
    for(let i = 0; i < state.players; i++) {
        const input = document.createElement('input');
        input.className = 'name-input';
        input.placeholder = `Имя игрока ${i+1}`;
        input.value = state.playerNames[i] || "";
        input.onchange = (e) => state.playerNames[i] = e.target.value;
        container.appendChild(input);
    }
}

function updateUI() {
    document.getElementById('player-count').innerText = state.players;
    document.getElementById('spy-count').innerText = state.spies;
    document.getElementById('time-limit').innerText = state.time;
}

function startDistribution() {
    // Собираем имена окончательно
    for(let i=0; i<state.players; i++) {
        if(!state.playerNames[i]) state.playerNames[i] = `Игрок ${i+1}`;
    }

    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    state.roles = new Array(state.players).fill(location);
    
    let assignedSpies = 0;
    while(assignedSpies < state.spies) {
        let idx = Math.floor(Math.random() * state.players);
        if(state.roles[idx] !== "ШПИОН") {
            state.roles[idx] = "ШПИОН";
            assignedSpies++;
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
    if (role === "ШПИОН") {
        document.getElementById('role-text').innerText = "ВЫ —";
        document.getElementById('location-name').innerText = "ШПИОН";
    } else {
        document.getElementById('role-text').innerText = "ЛОКАЦИЯ:";
        document.getElementById('location-name').innerText = role;
    }
}

function toggleRoleVisible() {
    document.getElementById('main-card').classList.toggle('flipped');
    document.getElementById('next-player-btn').classList.remove('hidden');
}

function nextPlayer() {
    state.currentPlayer++;
    if (state.currentPlayer < state.players) {
        showPlayerCard();
    } else {
        startTimer();
    }
}

function startTimer() {
    toScreen('game-screen');
    let timeLeft = state.time * 60;
    const totalTime = timeLeft;
    
    state.timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('countdown').innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
        document.getElementById('timer-progress').style.strokeDashoffset = 565 - (timeLeft / totalTime) * 565;

        if (timeLeft <= 0) {
            clearInterval(state.timerInterval);
            stopGame();
        }
    }, 1000);
}

function stopGame() {
    clearInterval(state.timerInterval);
    toScreen('vote-screen');
    const voteList = document.getElementById('vote-list');
    voteList.innerHTML = state.playerNames.map(name => 
        `<div class="vote-item" onclick="this.style.background='var(--neon-red)'">${name}</div>`
    ).join('');
}

function toggleRules(show) {
    document.getElementById('rules-modal').classList.toggle('active', show);
}

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
