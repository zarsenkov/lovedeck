const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId, currentRoomId, myRole, myStatus = 'alive', wakeLock = null;

// Не даем экрану гаснуть
async function requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const navRoom = document.getElementById('room-badge');
    if (id === 'screen-login') navRoom.classList.add('hidden');
    else navRoom.classList.remove('hidden');
}

function handleBack() {
    if (document.getElementById('screen-login').classList.contains('active')) {
        window.location.href = "https://lovecouple.ru";
    } else {
        if (confirm("Покинуть игру?")) window.location.reload();
    }
}

function copyCode() {
    const code = document.getElementById('room-id-display').innerText;
    navigator.clipboard.writeText(code);
    alert("Код скопирован: " + code);
}

// --- ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введите имя");
    requestWakeLock();
    socket.emit('mafia_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Заполните поля");
    requestWakeLock();
    socket.emit('mafia_join', { roomId: code, playerName: name });
}

function startGame() {
    socket.emit('mafia_start', currentRoomId);
}

// --- СОБЫТИЯ СЕРВЕРА ---
socket.on('mafia_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-id-display').innerText = currentRoomId;
    showScreen('screen-lobby');
});

socket.on('mafia_update_lobby', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="player-row">
            <span>${p.name}</span>
            ${p.id === socket.id ? '<span style="color:var(--primary)">Вы</span>' : ''}
        </div>
    `).join('');
    
    const isHost = room.players[0].id === socket.id;
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

socket.on('mafia_role_reveal', (room) => {
    const me = room.players.find(p => p.id === socket.id);
    myRole = me.role;
    
    const config = {
        'mafia': { name: 'МАФИЯ', icon: 'fa-user-secret', color: '#ff3d71', desc: 'Ваша цель: устранить мирных жителей ночью и не выдать себя днем.' },
        'doctor': { name: 'ДОКТОР', icon: 'fa-user-md', color: '#00e5ff', desc: 'Ваша цель: спасти город. Каждую ночь вы лечите одного человека.' },
        'sheriff': { name: 'ШЕРИФ', icon: 'fa-shield-halved', color: '#ffaa00', desc: 'Ваша цель: найти мафию. Каждую ночь вы проверяете одного подозреваемого.' },
        'citizen': { name: 'МИРНЫЙ', icon: 'fa-users', color: '#ffffff', desc: 'Ваша цель: вычислить мафию в ходе дневного обсуждения и выжить.' }
    };
    
    const ui = config[myRole];
    const card = document.getElementById('role-card-ui');
    document.getElementById('role-display').innerText = ui.name;
    document.getElementById('role-display').style.color = ui.color;
    document.getElementById('role-icon-i').className = `fas ${ui.icon}`;
    document.getElementById('role-icon-i').style.color = ui.color;
    document.getElementById('role-desc').innerText = ui.desc;
    card.style.borderColor = ui.color;

    showScreen('screen-reveal');
});

socket.on('mafia_night_start', ({ players }) => {
    showScreen('screen-game');
    document.getElementById('phase-title').innerText = "НОЧЬ";
    document.getElementById('phase-title').style.color = "var(--primary)";
    
    const isActive = ['mafia', 'doctor', 'sheriff'].includes(myRole);
    const overlay = document.getElementById('night-overlay');
    
    if (isActive && myStatus === 'alive') {
        overlay.classList.remove('active');
        document.getElementById('game-instruction').innerText = "Ваш ход. Выберите цель:";
        renderGrid(players, 'night');
    } else {
        overlay.classList.add('active');
    }
});

socket.on('mafia_day_start', ({ deadId, players }) => {
    document.getElementById('night-overlay').classList.remove('active');
    showScreen('screen-game');
    document.getElementById('phase-title').innerText = "ДЕНЬ";
    document.getElementById('phase-title').style.color = "#ffffff";
    
    if (deadId) {
        const victim = players.find(p => p.id === deadId);
        if (deadId === socket.id) {
            myStatus = 'dead';
            document.getElementById('dead-status').classList.remove('hidden');
        }
        alert("Этой ночью погиб: " + victim.name);
    } else {
        alert("Ночь прошла спокойно.");
    }
    
    document.getElementById('game-instruction').innerText = "ОБСУЖДЕНИЕ И ГОЛОСОВАНИЕ";
    renderGrid(players, 'vote');
});

socket.on('mafia_sheriff_result', ({ name, isMafia }) => {
    alert(`Проверка: ${name} — ${isMafia ? 'МАФИЯ' : 'МИРНЫЙ'}`);
});

socket.on('mafia_game_over', (msg) => {
    showScreen('screen-results');
    document.getElementById('winner-text').innerText = msg;
});

function renderGrid(players, context) {
    const grid = document.getElementById('player-grid');
    grid.innerHTML = players.map(p => `
        <div class="p-btn ${p.isAlive ? '' : 'hidden'}" onclick="handleGameClick('${p.id}', '${context}')">
            ${p.name}
        </div>
    `).join('');
}

function handleGameClick(targetId, context) {
    if (myStatus === 'dead') return;
    
    if (context === 'night') {
        const action = myRole === 'mafia' ? 'kill' : (myRole === 'doctor' ? 'heal' : 'check');
        socket.emit('mafia_night_action', { roomId: currentRoomId, targetId, action });
        document.getElementById('night-overlay').classList.add('active');
    } else {
        if (confirm("Вы уверены, что хотите проголосовать против этого игрока?")) {
            socket.emit('mafia_vote', { roomId: currentRoomId, targetId });
        }
    }
}