// Подключение к твоему серверу Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Глобальное состояние игры для игрока
let myData = { room: '', name: '', isHost: false, role: '', location: '', isSpy: false };
let gameTimerInterval;

// Функция: Смена экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

// Функция: Вход в игру
function joinGame() {
    const n = document.getElementById('player-name').value.trim();
    const r = document.getElementById('room-id').value.trim();
    if(n && r) {
        myData.name = n;
        myData.room = r;
        socket.emit('spy-join', { roomId: r, playerName: n });
    } else {
        alert("Заполни имя и ID комнаты!");
    }
}

// Функция: Запрос на запуск (только для хоста)
function startGameRequest() {
    socket.emit('spy-start-request', myData.room);
}

// Функция: Кнопка "Ознакомился"
function confirmReady() {
    const btn = document.getElementById('ready-btn');
    btn.disabled = true;
    btn.innerText = "ЖДЕМ ОСТАЛЬНЫХ...";
    socket.emit('spy-player-ready', myData.room);
}

// Функция: Голос за игрока
function castVote(targetId) {
    socket.emit('spy-cast-vote', { roomId: myData.room, targetId });
    // Чтобы не голосовать дважды, очищаем список
    document.getElementById('vote-grid').innerHTML = "<p>Голос принят. Ждем финала...</p>";
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ СЕРВЕРА ---

// Обновление списка в лобби
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
    if (me) {
        myData.isHost = me.isHost;
        document.getElementById('host-panel').classList.toggle('hidden', !me.isHost);
        document.getElementById('wait-msg').classList.toggle('hidden', me.isHost);
    }
});

// Раздача ролей
socket.on('spy-init-roles', (data) => {
    myData.role = data.role;
    myData.location = data.location;
    myData.isSpy = data.isSpy;
    
    document.getElementById('my-role-name').innerText = data.role;
    document.getElementById('my-location-name').innerText = data.isSpy ? "УЗНАЙТЕ ГДЕ ВЫ" : "ГДЕ: " + data.location;
    document.getElementById('reminder-loc').innerText = data.isSpy ? "ВЫ ШПИОН 💀" : "ЛОКАЦИЯ: " + data.location;
    
    // Сброс кнопки готовности
    const btn = document.getElementById('ready-btn');
    btn.disabled = false;
    btn.innerText = "Я ОЗНАКОМИЛСЯ";
    
    toScreen('screen-role');
});

// Обновление счетчика готовности
socket.on('spy-ready-update', (data) => {
    document.getElementById('ready-count').innerText = `Ожидание игроков: ${data.ready}/${data.total}`;
});

// Старт таймера игры
socket.on('spy-game-begin', (time) => {
    toScreen('screen-game');
    startVisualTimer(time);
});

// Переход к голосованию
socket.on('spy-start-voting', (players) => {
    toScreen('screen-vote');
    const grid = document.getElementById('vote-grid');
    // Голосуем за любого, кроме себя
    grid.innerHTML = players
        .filter(p => p.id !== socket.id)
        .map(p => `<button class="neon-btn" onclick="castVote('${p.id}')">${p.name}</button>`)
        .join('');
});

// Финал и итоги
socket.on('spy-results', (data) => {
    toScreen('screen-results');
    const winLabel = document.getElementById('winner-status');
    winLabel.innerText = data.spyWin ? "ПОБЕДА ШПИОНОВ!" : "ШПИОН ПОЙМАН!";
    winLabel.style.background = data.spyWin ? "var(--neon-red)" : "var(--neon-cyan)";
    
    document.getElementById('res-location').innerText = data.location;
    const resList = document.getElementById('vote-results-list');
    
    resList.innerHTML = "<h3>ИТОГИ ГОЛОСОВАНИЯ:</h3>" + Object.entries(data.votes).map(([id, count]) => {
        const p = data.players.find(pl => pl.id === id);
        const isSpy = data.spies.includes(id);
        return `<div class="stat-line"><span>${p ? p.name : '???'} ${isSpy ? '💀' : ''}</span><span>${count} 👤</span></div>`;
    }).join('');
});

// Функция визуального таймера
function startVisualTimer(duration) {
    clearInterval(gameTimerInterval);
    let timer = duration;
    const display = document.getElementById('game-timer');
    
    gameTimerInterval = setInterval(() => {
        let m = Math.floor(timer / 60);
        let s = timer % 60;
        display.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
        if (--timer < 0) clearInterval(gameTimerInterval);
    }, 1000);
}
