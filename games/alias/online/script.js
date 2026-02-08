// // Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let myRoom = "";
let canControl = false;

// // Переключение экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Вход в игру
function auth(isCreate) {
    const name = document.getElementById('player-name').value;
    const room = isCreate ? Math.floor(1000 + Math.random()*9000).toString() : document.getElementById('join-room-id').value;
    if(!name) return alert("Введи имя!");
    
    myRoom = room;
    socket.emit('alias-join', { roomId: room, playerName: name });
}

// // Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = myRoom;
    
    const teamDiv = document.getElementById('team-list');
    teamDiv.innerHTML = "";
    
    [1, 2].forEach(num => {
        const team = data.teams[num];
        const players = data.players.filter(p => p.team === num).map(p => p.name).join(", ");
        teamDiv.innerHTML += `
            <div class="team-ready-box">
                <h4>${team.name}</h4>
                <div style="font-weight:900">${players || "Ожидаем игроков..."}</div>
            </div>
        `;
    });

    const me = data.players.find(p => p.id === socket.id);
    if(me?.isHost) document.getElementById('host-controls').classList.remove('hidden');
});

// // Запуск (Хост)
function startGame() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    const t = document.getElementById('set-timer').value;
    const r = document.getElementById('set-rounds').value;
    socket.emit('alias-start', { roomId: myRoom, words, timer: t, maxRounds: r });
}

// // Экран подготовки
socket.on('alias-prep-screen', d => {
    toScreen('screen-prep');
    document.getElementById('prep-player').innerText = d.playerName;
    document.getElementById('prep-team').innerText = d.teamName;
});

// // Начало хода
socket.on('alias-new-turn', d => {
    toScreen('screen-game');
    const wordDisplay = document.getElementById('word-display');
    const controls = document.getElementById('game-controls');
    
    canControl = d.isSwiper;
    controls.classList.toggle('hidden', !canControl);

    if (d.activePlayerId === socket.id) {
        wordDisplay.innerText = d.word;
        document.getElementById('role-hint').innerText = "ОБЪЯСНЯЙ!";
    } else if (canControl) {
        wordDisplay.innerText = "СЛУШАЙ И ЖМИ";
        document.getElementById('role-hint').innerText = "ТЫ УГАДЫВАЕШЬ";
    } else {
        wordDisplay.innerText = "СМОТРИ";
        document.getElementById('role-hint').innerText = "Ждем окончания хода";
    }
});

// // Действие (Кнопки)
function sendAction(isOk) {
    if(!canControl) return;
    socket.emit('alias-action', { roomId: myRoom, isCorrect: isOk });
}

// // Таймер и счет
socket.on('alias-timer-tick', d => {
    document.getElementById('timer-val').innerText = d.timeLeft;
});
socket.on('alias-update-score', d => {
    document.getElementById('score-val').innerText = d.score;
});

// // Финал
socket.on('alias-game-over', d => {
    toScreen('screen-results');
    document.getElementById('results-data').innerHTML = `
        <h2 style="margin-bottom:20px">ПОБЕДА: ${d.winner}</h2>
        <p>Счет: ${d.team1Score} vs ${d.team2Score}</p>
    `;
});
