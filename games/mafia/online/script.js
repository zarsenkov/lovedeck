const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId, currentRoomId, myRole, myStatus = 'alive', wakeLock = null;

// Предотвращение сна
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
        if (confirm("ВЫЙТИ ИЗ ДЕЛА?")) window.location.reload();
    }
}

function copyCode() {
    const code = document.getElementById('room-id-display').innerText;
    navigator.clipboard.writeText(code);
    alert("КОД КОПИРОВАН: " + code);
}

// --- ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("ВВЕДИТЕ ИМЯ");
    requestWakeLock();
    socket.emit('mafia_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("ВВЕДИТЕ ДАННЫЕ");
    requestWakeLock();
    socket.emit('mafia_join', { roomId: code, playerName: name });
}

function startGame() {
    socket.emit('mafia_start', currentRoomId);
}

// --- ОТВЕТЫ СЕРВЕРА ---
socket.on('mafia_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-id-display').innerText = currentRoomId;
    showScreen('screen-lobby');
});

socket.on('mafia_update_lobby', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `<div>• ${p.name} ${p.id === socket.id ? '<b>(ВЫ)</b>' : ''}</div>`).join('');
    
    // Показать кнопку старта только хосту
    const isHost = room.players[0].id === socket.id;
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

socket.on('mafia_role_reveal', (room) => {
    const me = room.players.find(p => p.id === socket.id);
    myRole = me.role;
    
    const roleData = {
        'mafia': { name: 'МАФИЯ', desc: 'УБЕЙТЕ ВСЕХ МИРНЫХ, ПОКА ВАС НЕ РАСКРЫЛИ.' },
        'doctor': { name: 'ДОКТОР', desc: 'КАЖДУЮ НОЧЬ ВЫ МОЖЕТЕ СПАСТИ ОДНУ ЖИЗНЬ.' },
        'sheriff': { name: 'ШЕРИФ', desc: 'ПРОВЕРЯЙТЕ ПОДОЗРЕВАЕМЫХ НОЧЬЮ.' },
        'citizen': { name: 'МИРНЫЙ', desc: 'ВЫЖИВИТЕ И НАЙДИТЕ ПРЕСТУПНИКОВ.' }
    };
    
    document.getElementById('role-display').innerText = roleData[myRole].name;
    document.getElementById('role-desc').innerText = roleData[myRole].desc;
    showScreen('screen-reveal');
});

socket.on('mafia_night_start', ({ players }) => {
    showScreen('screen-game');
    document.getElementById('phase-header').innerText = "НОЧЬ";
    document.getElementById('game-instruction').innerText = "ГОРОД ЗАСЫПАЕТ...";
    
    const isActiveRole = ['mafia', 'doctor', 'sheriff'].includes(myRole);
    const overlay = document.getElementById('night-overlay');
    
    if (isActiveRole && myStatus === 'alive') {
        overlay.classList.remove('active');
        document.getElementById('game-instruction').innerText = getNightInstruction();
        renderPlayers(players, 'night');
    } else {
        overlay.classList.add('active');
    }
});

socket.on('mafia_day_start', ({ deadId, players }) => {
    document.getElementById('night-overlay').classList.remove('active');
    showScreen('screen-game');
    document.getElementById('phase-header').innerText = "ДЕНЬ";
    
    if (deadId) {
        const victim = players.find(p => p.id === deadId);
        if (deadId === socket.id) {
            myStatus = 'dead';
            document.getElementById('dead-overlay').classList.remove('hidden');
        }
        alert("УТРОМ БЫЛО НАЙДЕНО ТЕЛО: " + victim.name);
    } else {
        alert("НОЧЬ ПРОШЛА БЕЗ ЖЕРТВ");
    }
    
    document.getElementById('game-instruction').innerText = "ГОЛОСОВАНИЕ: КТО ПРЕСТУПНИК?";
    renderPlayers(players, 'vote');
});

socket.on('mafia_sheriff_result', ({ name, isMafia }) => {
    alert(`ОТЧЕТ ШЕРИФА: ${name} ${isMafia ? '— ЭТО МАФИЯ!' : '— ЧИСТ.'}`);
});

socket.on('mafia_game_over', (msg) => {
    showScreen('screen-results');
    document.getElementById('winner-text').innerText = msg;
});

// --- ВСПОМОГАТЕЛЬНОЕ ---
function getNightInstruction() {
    if (myRole === 'mafia') return "ВЫБЕРИТЕ ЖЕРТВУ:";
    if (myRole === 'doctor') return "КОГО СПАСЕМ?";
    if (myRole === 'sheriff') return "КОГО ПРОВЕРИТЬ?";
    return "ЖДИТЕ...";
}

function renderPlayers(players, context) {
    const grid = document.getElementById('player-grid');
    grid.innerHTML = players.map(p => `
        <div class="player-card ${p.isAlive ? '' : 'dead'}" onclick="handlePlayerAction('${p.id}', '${context}')">
            ${p.name}
        </div>
    `).join('');
}

function handlePlayerAction(targetId, context) {
    if (myStatus === 'dead') return;
    
    if (context === 'night') {
        const action = myRole === 'mafia' ? 'kill' : (myRole === 'doctor' ? 'heal' : 'check');
        socket.emit('mafia_night_action', { roomId: currentRoomId, targetId, action });
        document.getElementById('night-overlay').classList.add('active');
    } else if (context === 'vote') {
        if (confirm("ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ ОБВИНИТЬ ЭТОГО ИГРОКА?")) {
            socket.emit('mafia_vote', { roomId: currentRoomId, targetId });
        }
    }
}

socket.on('mafia_error', (msg) => alert(msg));