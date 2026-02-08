// // Подключение к серверу Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let room = "";

// // Функция смены экранов (как pop-screen.active в оригинале)
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Создание игры
function createGame() {
    const n = document.getElementById('player-name').value;
    if(!n) return;
    const id = Math.floor(1000 + Math.random()*9000).toString();
    socket.emit('alias-join', { roomId: id, playerName: n });
}

// // Вход в игру
function joinGame() {
    const n = document.getElementById('player-name').value;
    const r = document.getElementById('room-id').value;
    if(!n || !r) return;
    socket.emit('alias-join', { roomId: r, playerName: n });
}

// // Обновление лобби (используем твой стиль team-ready-box)
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    room = data.roomId;
    document.getElementById('display-id').innerText = room;
    
    const list = document.getElementById('player-list');
    list.innerHTML = `
        <div class="team-ready-box"><h4>КОМАНДА 1</h4>${data.players.filter(p=>p.team===1).map(p=>p.name).join(', ')}</div>
        <div class="team-ready-box" style="border-color:var(--accent)"><h4>КОМАНДА 2</h4>${data.players.filter(p=>p.team===2).map(p=>p.name).join(', ')}</div>
    `;

    const me = data.players.find(p => p.id === socket.id);
    if(me?.isHost) document.getElementById('start-btn').classList.remove('hidden');
});

// // Запуск раунда
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(()=>0.5-Math.random());
    socket.emit('alias-start', { roomId: room, words, timer: 60, maxRounds: 3 });
}

// // Получение слова (экран игры)
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    document.getElementById('live-header').classList.remove('hidden');
    document.getElementById('word-display').innerText = data.word;
    
    // // Кнопки видит только тот, кто объясняет
    const isMe = data.activePlayerId === socket.id;
    document.getElementById('controls').classList.toggle('hidden', !isMe);
});

// // Действие (Угадал/Пропустил)
function sendAction(ok) {
    socket.emit('alias-action', { roomId: room, isCorrect: ok });
}

// // Таймер
socket.on('alias-timer-tick', data => {
    const t = data.timeLeft;
    document.getElementById('timer').innerText = `00:${t < 10 ? '0'+t : t}`;
});
