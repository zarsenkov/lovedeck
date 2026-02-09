const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ['websocket', 'polling'] });
let myId, currentRoomId, gameData = null;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleBack() {
    if (confirm("ВЫЙТИ ИЗ СИСТЕМЫ?")) window.location.href = "https://lovecouple.ru";
}

// --- ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (name) socket.emit('bunker_create', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (name && code) socket.emit('bunker_join', { roomId: code, playerName: name });
}

function startGame() {
    socket.emit('bunker_start', currentRoomId);
}

// --- ИГРА ---
function reveal(trait) {
    socket.emit('bunker_reveal', { roomId: currentRoomId, trait });
}

function toggleDisaster() {
    if (!gameData) return;
    document.getElementById('modal-dis-name').innerText = gameData.disaster.name;
    document.getElementById('modal-dis-desc').innerText = gameData.disaster.desc;
    document.getElementById('modal-bunker-info').innerText = `БУНКЕР: Еда на ${gameData.bunker.food}, площадь ${gameData.bunker.area}`;
    document.getElementById('modal-disaster').classList.add('active');
}

function vote(targetId) {
    if (confirm("ИЗГНАТЬ ЭТОГО ВЫЖИВШЕГО?")) {
        socket.emit('bunker_vote', { roomId: currentRoomId, targetId });
    }
}

// --- СОБЫТИЯ ---
socket.on('bunker_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-id').innerText = `CODE: ${currentRoomId}`;
    showScreen('screen-lobby');
});

socket.on('bunker_update', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `<div>> ${p.name} ${p.id === socket.id ? '(ВЫ)' : ''}</div>`).join('');
    
    const isHost = room.players[0].id === socket.id;
    document.getElementById('start-btn').classList.toggle('hidden', !isHost || room.players.length < 2);
    document.getElementById('wait-msg').classList.toggle('hidden', isHost && room.players.length >= 2);
});

socket.on('bunker_game_start', (room) => {
    gameData = room;
    myId = socket.id;
    showScreen('screen-game');
    document.getElementById('dis-name').innerText = room.disaster.name;
    updateGameUI(room);
});

socket.on('bunker_update_data', (room) => {
    updateGameUI(room);
});

function updateGameUI(room) {
    const me = room.players.find(p => p.id === socket.id);
    
    // Обновляем мою карточку
    document.getElementById('my-prof').innerText = me.revealed.includes('prof') ? me.character.prof : "???";
    document.getElementById('my-bio').innerText = me.revealed.includes('bio') ? me.character.bio : "???";
    document.getElementById('my-health').innerText = me.revealed.includes('health') ? me.character.health : "???";
    document.getElementById('my-special').innerText = me.revealed.includes('special') ? me.character.special : "???";

    // Обновляем общий стол
    const table = document.getElementById('game-table');
    table.innerHTML = room.players.map(p => `
        <div class="player-card glass ${p.isOut ? 'is-out' : ''}">
            <div style="display:flex; justify-content:space-between">
                <b>${p.name}</b>
                ${!p.isOut && p.id !== socket.id ? `<span onclick="vote('${p.id}')" style="color:red; cursor:pointer">[ИЗГНАТЬ]</span>` : ''}
            </div>
            <div>Профессия: ${p.revealed.includes('prof') ? p.character.prof : 'СКРЫТО'}</div>
            <div>Био: ${p.revealed.includes('bio') ? p.character.bio : 'СКРЫТО'}</div>
            <div>Здоровье: ${p.revealed.includes('health') ? p.character.health : 'СКРЫТО'}</div>
            ${p.revealed.includes('special') ? `<div style="color:yellow">Карта: ${p.character.special}</div>` : ''}
        </div>
    `).join('');
}

socket.on('error_msg', (m) => alert(m));
socket.on('log_msg', (m) => alert(m));