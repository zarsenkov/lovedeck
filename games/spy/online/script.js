const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId, currentRoomId, wakeLock = null;
let totalTime = 480;

// Защита от сна
async function requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleBack() {
    if (document.getElementById('screen-login').classList.contains('active')) {
        window.location.href = "https://lovecouple.ru";
    } else {
        if (confirm("ПРЕРВАТЬ ТЕКУЩУЮ СЕССИЮ?")) window.location.reload();
    }
}

function copyCode() {
    const code = document.getElementById('room-id').innerText;
    navigator.clipboard.writeText(code);
    alert("КОД СКОПИРОВАН");
}

// --- СОБЫТИЯ ---

function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("ВВЕДИТЕ ИМЯ АГЕНТА");
    requestWakeLock();
    socket.emit('spy_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("ВВЕДИТЕ ДАННЫЕ");
    requestWakeLock();
    socket.emit('join_room', { roomId: code, playerName: name });
}

function startGame() {
    socket.emit('spy_start', currentRoomId);
}

function flipCard() {
    document.getElementById('spy-card').classList.toggle('flipped');
}

function goToGame() {
    showScreen('screen-game');
}

// --- ОТВЕТЫ СЕРВЕРА ---

socket.on('spy_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-id').innerText = currentRoomId;
    showScreen('screen-lobby');
});

socket.on('spy_update_lobby', (room) => {
    currentRoomId = room.id;
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="name-input" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${p.name}</span>
            ${p.id === socket.id ? '<span style="color:var(--neon-cyan); font-size:10px;">ВЫ</span>' : ''}
        </div>
    `).join('');
    
    document.getElementById('player-count').innerText = room.players.length;
    
    const isHost = room.players[0].id === socket.id;
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

socket.on('spy_game_start', (data) => {
    // data = { location, players, totalTime }
    const me = data.players.find(p => p.id === socket.id);
    totalTime = data.totalTime;

    const locName = document.getElementById('location-name');
    const roleText = document.getElementById('role-text');
    const roleIcon = document.getElementById('role-icon');

    if (me.role === 'SPY') {
        locName.innerText = "ВЫ ШПИОН";
        locName.style.color = "var(--neon-red)";
        roleText.innerText = "ВАША ЦЕЛЬ: НЕ ВЫДАТЬ СЕБЯ И УЗНАТЬ ЛОКАЦИЮ";
        roleIcon.innerText = "🕵️‍♂️";
    } else {
        locName.innerText = data.location;
        locName.style.color = "black";
        roleText.innerText = "ВАША ЦЕЛЬ: ВЫЧИСЛИТЬ ШПИОНА, ЗАДАВАЯ ВОПРОСЫ";
        roleIcon.innerText = "📍";
    }

    showScreen('screen-reveal');
});

socket.on('spy_timer_tick', (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('countdown').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Обновление кругового прогресса
    const progress = document.getElementById('timer-progress');
    const offset = 565 - (seconds / totalTime) * 565;
    progress.style.strokeDashoffset = offset;

    if (seconds < 30) {
        progress.style.stroke = "var(--neon-red)";
        document.getElementById('countdown').style.color = "var(--neon-red)";
    }
});

socket.on('error_msg', (m) => alert(m));