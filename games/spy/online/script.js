// Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Состояние игрока
let myData = { room: '', name: '', isHost: false, role: '', location: '', isSpy: false };

// Переключение экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Вход в игру
function joinGame() {
    const n = document.getElementById('player-name').value.trim();
    const r = document.getElementById('room-id').value.trim();
    if(n && r) {
        myData.name = n;
        myData.room = r;
        socket.emit('spy-join', { roomId: r, playerName: n });
    }
}

// Запрос на старт (только хост)
function startGameRequest() {
    socket.emit('spy-start-request', myData.room);
}

// Подтверждение прочтения роли
function confirmReady() {
    document.getElementById('ready-btn').disabled = true;
    document.getElementById('ready-btn').innerText = "ОЖИДАНИЕ...";
    socket.emit('spy-player-ready', myData.room);
}

// Голосование за игрока
function castVote(targetId) {
    socket.emit('spy-cast-vote', { roomId: myData.room, targetId });
    toScreen('screen-game'); // Возвращаемся на экран ожидания до конца голосования
    document.getElementById('game-timer').innerText = "ЖДЕМ ДРУГИХ...";
}

// --- СОБЫТИЯ СЕРВЕРА ---

// Обновление лобби
socket.on('spy-update-lobby', (data) => {
    toScreen('screen-lobby');
    document.getElementById('display-room-id').innerText = data.roomId;
    const list = document.getElementById('lobby-players');
    list.innerHTML = data.players.map(p => `
        <div class="player-badge ${p.id === socket.id ? 'me' : ''}">
            ${p.isHost ? '👑' : '👤'} ${p.name}
        </div>
    `).join('');
    
    const me = data.players.find(p => p.id === socket.id);
    myData.isHost = me.isHost;
    document.getElementById('host-panel').classList.toggle('hidden', !me.isHost);
    document.getElementById('wait-msg').classList.toggle('hidden', me.isHost);
});

// Получение ролей
socket.on('spy-init-roles', (data) => {
    myData.role = data.role;
    myData.location = data.location;
    myData.isSpy = data.isSpy;
    
    document.getElementById('my-role-name').innerText = data.role;
    document.getElementById('my-location-name').innerText = data.isSpy ? "УЗНАЙТЕ ГДЕ ВЫ" : "ЛОКАЦИЯ: " + data.location;
    document.getElementById('reminder-loc').innerText = data.isSpy ? "ВЫ ШПИОН" : "ЛОКАЦИЯ: " + data.location;
    
    toScreen('screen-role');
});

// Обновление счетчика готовых
socket.on('spy-ready-update', (data) => {
    document.getElementById('ready-count').innerText = `Ожидание игроков: ${data.ready}/${data.total}`;
});

// Старт таймера игры
socket.on('spy-game-begin', (time) => {
    toScreen('screen-game');
    startTimer(time);
});

// Начало голосования
socket.on('spy-start-voting', (players) => {
    toScreen('screen-vote');
    const grid = document.getElementById('vote-grid');
    grid.innerHTML = players
        .filter(p => p.id !== socket.id) // Нельзя голосовать за себя
        .map(p => `<button class="neon-btn" onclick="castVote('${p.id}')">${p.name}</button>`)
        .join('');
});

// Финал
socket.on('spy-results', (data) => {
    toScreen('screen-results');
    document.getElementById('res-location').innerText = data.location;
    document.getElementById('winner-text').innerText = data.spyWin ? "ПОБЕДА ШПИОНОВ! 💀" : "ШПИОН ПОЙМАН! 👮";
    
    const resList = document.getElementById('vote-results-list');
    resList.innerHTML = "<h3>ГОЛОСА:</h3>" + Object.entries(data.votes).map(([id, count]) => {
        const p = data.players.find(pl => pl.id === id);
        const isSpy = data.spies.includes(id);
        return `<p>${p.name}: ${count} 👤 ${isSpy ? ' (БЫЛ ШПИОНОМ)' : ''}</p>`;
    }).join('');
});

// Таймер (визуальный)
function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('game-timer');
    const int = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        display.innerText = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        if (--timer < 0) clearInterval(int);
    }, 1000);
}
