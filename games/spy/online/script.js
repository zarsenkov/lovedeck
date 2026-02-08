// Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Состояние игрока
let myData = { room: '', name: '', isHost: false };
let wakeLock = null;

// // ЗАЩИТА ОТ ПОТУХАНИЯ ЭКРАНА
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock активен!');
        }
    } catch (err) {
        console.log('Wake Lock не поддерживается или ошибка');
    }
}

// // СМЕНА ЭКРАНОВ
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

// // ВХОД В ИГРУ
function joinGame() {
    const n = document.getElementById('player-name').value.trim();
    const r = document.getElementById('room-id').value.trim();
    if(n && r) {
        myData.name = n;
        myData.room = r;
        requestWakeLock(); // Активируем защиту при входе в лобби
        socket.emit('spy-join', { roomId: r, playerName: n });
    } else {
        alert("Введите имя и код!");
    }
}

// // СТАРТ (ХОСТ)
function startGameRequest() {
    socket.emit('spy-start-request', myData.room);
}

// // ГОТОВНОСТЬ
function confirmReady() {
    document.getElementById('ready-btn').style.display = 'none';
    socket.emit('spy-player-ready', myData.room);
}

// // ГОЛОСОВАНИЕ
function castVote(targetId) {
    socket.emit('spy-cast-vote', { roomId: myData.room, targetId });
    document.getElementById('vote-grid').innerHTML = "<p style='text-align:center'>Голос учтен...</p>";
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---

socket.on('spy-update-lobby', (data) => {
    toScreen('screen-lobby');
    document.getElementById('display-room-id').innerText = data.roomId;
    const grid = document.getElementById('lobby-players');
    grid.innerHTML = data.players.map(p => `
        <div class="player-badge ${p.id === socket.id ? 'me' : ''}">
            ${p.isHost ? '👑' : '👤'} ${p.name}
        </div>
    `).join('');
    
    const me = data.players.find(p => p.id === socket.id);
    myData.isHost = me?.isHost;
    document.getElementById('host-panel').style.display = myData.isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = myData.isHost ? 'none' : 'block';
});

socket.on('spy-init-roles', (data) => {
    document.getElementById('my-role-name').innerText = data.role;
    document.getElementById('my-role-name').style.color = data.isSpy ? 'var(--neon-red)' : 'var(--neon-cyan)';
    document.getElementById('my-location-name').innerText = data.isSpy ? "УЗНАЙТЕ ГДЕ ВЫ" : "ГДЕ: " + data.location;
    document.getElementById('reminder-loc').innerText = data.isSpy ? "ВЫ ШПИОН 💀" : "ЛОКАЦИЯ: " + data.location;
    document.getElementById('ready-btn').style.display = 'block';
    toScreen('screen-role');
});

socket.on('spy-ready-update', (data) => {
    document.getElementById('ready-count').innerText = `Готовы: ${data.ready}/${data.total}`;
});

socket.on('spy-game-begin', (time) => {
    toScreen('screen-game');
    let timer = time;
    const display = document.getElementById('game-timer');
    const interval = setInterval(() => {
        let m = Math.floor(timer / 60);
        let s = timer % 60;
        display.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
        if (--timer < 0) {
            clearInterval(interval);
        }
    }, 1000);
});

socket.on('spy-start-voting', (players) => {
    toScreen('screen-vote');
    const grid = document.getElementById('vote-grid');
    grid.innerHTML = players
        .filter(p => p.id !== socket.id)
        .map(p => `<button class="neon-btn" onclick="castVote('${p.id}')">${p.name}</button>`)
        .join('');
});

socket.on('spy-results', (data) => {
    toScreen('screen-results');
    document.getElementById('winner-text').innerText = data.spyWin ? "💀 ШПИОНЫ ВЫИГРАЛИ" : "👮 ШПИОН ПОЙМАН";
    document.getElementById('res-location').innerText = data.location;
    
    const stats = document.getElementById('vote-results-list');
    stats.innerHTML = Object.entries(data.votes).map(([id, count]) => {
        const p = data.players.find(pl => pl.id === id);
        const isSpy = data.spies.includes(id);
        return `<div style="margin-bottom:5px;">${p?.name || 'Игрок'}: ${count} голосов ${isSpy ? '<b>(ШПИОН)</b>' : ''}</div>`;
    }).join('');
});
