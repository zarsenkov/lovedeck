const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ['websocket', 'polling'] });
let myId, currentRoomId;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleBack() { if (confirm("Выйти из игры?")) location.href='index.html'; }
function toggleModal(s) { document.getElementById('modal-rules').classList.toggle('active', s); }

function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введи имя!");
    socket.emit('whoami_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Заполни поля!");
    socket.emit('join_room', { roomId: code, playerName: name });
}

socket.on('whoami_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('lobby-code').innerText = data.roomId;
    showScreen('screen-lobby');
});

socket.on('whoami_update', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="player-entry">
            <span>${p.name} ${p.id === socket.id ? '(ТЫ)' : ''}</span>
            <div class="ready-status ${p.isReady ? 'done' : ''}">${p.isReady ? '✓' : ''}</div>
        </div>`).join('');
    const isHost = room.players[0].id === socket.id;
    document.getElementById('host-controls').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

function startNaming() { socket.emit('whoami_start_naming', currentRoomId); }

socket.on('whoami_naming_phase', (room) => {
    showScreen('screen-naming');
    const me = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === me.assignedTo);
    document.getElementById('target-name').innerText = target.name;
});

function setCharacter() {
    const char = document.getElementById('character-input').value.trim();
    if (!char) return alert("Введи персонажа!");
    socket.emit('whoami_set_character', { roomId: currentRoomId, character: char });
    document.getElementById('btn-set-char').disabled = true;
    document.getElementById('btn-set-char').innerText = "ЖДЕМ ДРУГИХ...";
}

socket.on('whoami_game_start', (room) => {
    showScreen('screen-game');
    const grid = document.getElementById('stickers-grid');
    grid.innerHTML = "";
    room.players.forEach(p => {
        if (p.id !== socket.id) {
            const item = document.createElement('div');
            item.className = 'sticker-item';
            item.innerHTML = `<div class="sticker-name">${p.name}</div><div class="sticker-char">${p.character}</div>`;
            grid.appendChild(item);
        } else {
            document.getElementById('my-character').innerText = p.character;
        }
    });
});

socket.on('error_msg', (msg) => alert(msg));
