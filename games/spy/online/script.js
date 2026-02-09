const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId, currentRoomId, timerInterval, wakeLock = null;

async function requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const badge = document.getElementById('room-badge');
    if (id === 'screen-login') badge.classList.add('hidden');
    else badge.classList.remove('hidden');
}

function goHome() {
    if (document.getElementById('screen-login').classList.contains('active')) {
        window.location.href = "https://lovecouple.ru";
    } else {
        if (confirm("Выйти из игры?")) {
            clearInterval(timerInterval);
            window.location.reload();
        }
    }
}

function copyCode() {
    const code = document.getElementById('room-badge').innerText.split(' ')[0];
    navigator.clipboard.writeText(code);
    alert("Код комнаты скопирован!");
}

// --- ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введите имя");
    requestWakeLock();
    socket.emit('spy_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Заполните поля");
    requestWakeLock();
    socket.emit('spy_join', { roomId: code, playerName: name });
}

function startGame() {
    socket.emit('spy_start', currentRoomId);
}

function endGame() {
    if(confirm("Завершить раунд и вернуться в лобби?")) {
        clearInterval(timerInterval);
        socket.emit('spy_end_round', currentRoomId); // Опционально: можно просто перезагрузить
        window.location.reload();
    }
}

// --- СОБЫТИЯ ---
socket.on('spy_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-badge').innerHTML = `${currentRoomId} <i class="far fa-copy"></i>`;
    showScreen('screen-lobby');
});

socket.on('spy_update', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="user-item">
            <span>${p.name} ${p.id === socket.id ? '(Вы)' : ''}</span>
        </div>
    `).join('');

    const isHost = room.players[0].id === socket.id;
    document.getElementById('start-btn').classList.toggle('hidden', !isHost || room.players.length < 3);
    document.getElementById('wait-msg').classList.toggle('hidden', isHost && room.players.length >= 3);
});

socket.on('spy_game_start', ({ location, players, time }) => {
    showScreen('screen-game');
    const me = players.find(p => p.id === socket.id);
    
    // Показываем локацию или Шпиона
    const locDisplay = document.getElementById('location-display');
    const spyAlert = document.getElementById('spy-alert');
    
    if (me.role === 'spy') {
        locDisplay.classList.add('hidden');
        spyAlert.classList.remove('hidden');
    } else {
        locDisplay.classList.remove('hidden');
        spyAlert.classList.add('hidden');
        locDisplay.innerText = location;
    }

    // Список игроков для всех
    document.getElementById('game-players').innerHTML = players.map(p => `
        <div class="player-tag">${p.name}</div>
    `).join('');

    // Таймер
    startTimer(time);
});

function startTimer(seconds) {
    let timeLeft = seconds;
    const display = document.getElementById('timer');
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (--timeLeft < 0) {
            clearInterval(timerInterval);
            alert("ВРЕМЯ ВЫШЛО! Пора разоблачать шпиона.");
        }
    }, 1000);
}

socket.on('error_msg', (m) => alert(m));