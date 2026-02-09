const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ['websocket', 'polling'] });

let myId, currentRoomId;

// --- НАВИГАЦИЯ ---

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleBack() {
    if (confirm("Выйти из игры?")) window.location.href = "https://lovecouple.ru";
}

function toggleModal(show) {
    document.getElementById('modal-rules').classList.toggle('active', show);
}

// --- СОБЫТИЯ ВХОДА ---

function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("ВВЕДИ ИМЯ!");
    socket.emit('whoami_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("ЗАПОЛНИ ПОЛЯ!");
    socket.emit('join_room', { roomId: code, playerName: name });
}

socket.on('whoami_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('lobby-code').innerText = data.roomId;
    showScreen('screen-lobby');
});

// --- ЛОББИ ---

socket.on('whoami_update', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="player-entry">
            <span>${p.name} ${p.id === socket.id ? '(ТЫ)' : ''}</span>
            <div class="ready-status ${p.isReady ? 'done' : ''}">
                ${p.isReady ? '<i class="fas fa-check"></i>' : ''}
            </div>
        </div>
    `).join('');

    const isHost = room.players[0].id === socket.id;
    document.getElementById('host-controls').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

function startNaming() {
    socket.emit('whoami_start_naming', currentRoomId);
}

// --- ЗАГАДЫВАНИЕ ---

socket.on('whoami_naming_phase', (room) => {
    showScreen('screen-naming');
    const me = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === me.assignedTo);
    document.getElementById('target-name').innerText = target.name;
});

function setCharacter() {
    const char = document.getElementById('character-input').value.trim();
    if (!char) return alert("ВВЕДИ ПЕРСОНАЖА!");
    
    socket.emit('whoami_set_character', { roomId: currentRoomId, character: char });
    
    // Блокируем кнопку после нажатия
    document.getElementById('btn-set-char').disabled = true;
    document.getElementById('btn-set-char').innerText = "ЖДЕМ ДРУГИХ...";
}

// --- ИГРА ---

socket.on('whoami_game_start', (room) => {
    showScreen('screen-game');
    const grid = document.getElementById('stickers-grid');
    
    grid.innerHTML = room.players.map(p => {
        // Если это не я, показываем стикер с персонажем
        if (p.id !== socket.id) {
            return `
                <div class="sticker-item">
                    <div class="sticker-name">${p.name}</div>
                    <div class="sticker-char">${p.character}</div>
                </div>
            `;
        }
        // Если это я, записываем моего персонажа в скрытое поле
        document.getElementById('my-character').innerText = p.character;
        return '';
    }).join('');
});

socket.on('error_msg', (msg) => alert(msg));