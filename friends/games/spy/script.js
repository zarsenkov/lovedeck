const LOCATIONS = [
    "ОРБИТАЛЬНАЯ СТАНЦИЯ", "НОЧНОЙ КЛУБ", "БОЛЬНИЦА", "ТЕАТР", "ПОДВОДНАЯ ЛОДКА",
    "БАНК", "АЭРОПОРТ", "ЦЕРКОВЬ", "АРКТИЧЕСКАЯ СТАНЦИЯ", "ПИРАТСКИЙ КОРАБЛЬ",
    "ШКОЛА", "РЕСТОРАН", "ПОЛИЦЕЙСКИЙ УЧАСТОК", "ОТЕЛЬ", "БАЗА ОТДЫХА"
];

let state = {
    players: 3,
    spies: 1,
    time: 5,
    roles: [],
    currentPlayer: 0,
    timerInterval: null
};

function changeVal(key, delta) {
    if (key === 'players') {
        state.players = Math.max(3, Math.min(12, state.players + delta));
        if (state.spies >= state.players) state.spies = state.players - 1;
    } else if (key === 'spies') {
        state.spies = Math.max(1, Math.min(state.players - 1, state.spies + delta));
    } else if (key === 'time') {
        state.time = Math.max(1, Math.min(15, state.time + delta));
    }
    updateUI();
}

function updateUI() {
    document.getElementById('player-count').innerText = state.players;
    document.getElementById('spy-count').innerText = state.spies;
    document.getElementById('time-limit').innerText = state.time;
}

function startDistribution() {
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    state.roles = new Array(state.players).fill(location);
    
    // Назначаем шпионов
    for (let i = 0; i < state.spies; i++) {
        let idx;
        do { idx = Math.floor(Math.random() * state.players); } 
        while (state.roles[idx] === "ШПИОН");
        state.roles[idx] = "ШПИОН";
    }

    state.currentPlayer = 0;
    showPlayerCard();
    toScreen('card-screen');
}

function showPlayerCard() {
    document.getElementById('current-player-num').innerText = state.currentPlayer + 1;
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
    const countdownEl = document.getElementById('countdown');
    const progressEl = document.getElementById('timer-progress');
    
    // Заполняем список локаций для подсказки
    const locList = document.getElementById('loc-list');
    locList.innerHTML = LOCATIONS.map(l => `<div class="loc-item">${l}</div>`).join('');

    state.timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        countdownEl.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
        
        // Анимация круга
        let offset = 565 - (timeLeft / totalTime) * 565;
        progressEl.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(state.timerInterval);
            alert("ВРЕМЯ ВЫШЛО! КТО ЖЕ ШПИОН?");
        }
    }, 1000);
}

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
