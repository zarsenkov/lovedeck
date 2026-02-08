const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId, currentRoomId, wakeLock = null;

// Анти-сон
async function requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const badge = document.getElementById('room-id-badge');
    if (id === 'screen-login') badge.classList.add('hidden');
    else badge.classList.remove('hidden');
}

function handleBack() {
    if (document.getElementById('screen-login').classList.contains('active')) {
        window.location.href = "https://lovecouple.ru";
    } else {
        if (confirm("Выйти из игры?")) window.location.reload();
    }
}

function copyCode() {
    const code = document.getElementById('room-id-badge').innerText.split(' ')[0];
    navigator.clipboard.writeText(code);
    alert("Код скопирован!");
}

// --- ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введите имя");
    requestWakeLock();
    socket.emit('whoami_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Введите данные");
    requestWakeLock();
    socket.emit('whoami_join', { roomId: code, playerName: name });
}

function startNaming() {
    socket.emit('whoami_start_naming', currentRoomId);
}

function setCharacter() {
    const char = document.getElementById('character-input').value.trim();
    if (!char) return alert("Введите персонажа!");
    socket.emit('whoami_set_character', { roomId: currentRoomId, character: char });
    document.getElementById('screen-naming').innerHTML = "<div class='glass-card'><h2>Принято!</h2><p>Ждем остальных...</p></div>";
}

// --- ОТВЕТЫ СЕРВЕРА ---
socket.on('whoami_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-id-badge').innerHTML = `${currentRoomId} <i class="far fa-copy"></i>`;
    showScreen('screen-lobby');
});

socket.on('whoami_update', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="user-item">
            <span>${p.name}</span>
            <span>${p.character ? '✅' : '⏳'}</span>
        </div>
    `).join('');

    const isHost = room.players[0].id === socket.id;
    document.getElementById('start-btn').classList.toggle('hidden', !isHost || room.players.length < 2);
    document.getElementById('wait-msg').classList.toggle('hidden', isHost && room.players.length >= 2);
});

socket.on('whoami_naming_phase', (room) => {
    showScreen('screen-naming');
    const me = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === me.assignedTo);
    document.getElementById('target-name').innerText = target.name;
});

socket.on('whoami_game_start', (room) => {
    showScreen('screen-game');
    const grid = document.getElementById('game-grid');
    // Показываем всех, кроме себя
    grid.innerHTML = room.players.map(p => {
        if (p.id === socket.id) return '';
        return `
            <div class="player-sticker">
                <span>${p.name}</span>
                <b>${p.character}</b>
            </div>
        `;
    }).join('');
});

socket.on('error_msg', (m) => alert(m));