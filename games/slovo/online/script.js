const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
    transports: ["polling", "websocket"] 
});

let currentRoomId = null;
let isMyTurn = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function createRoom() {
    const name = document.getElementById('player-name').value.trim();
    if (!name) return alert('Введи ник!');
    socket.emit('slovo-create', name);
}

function joinRoom() {
    const name = document.getElementById('player-name').value.trim();
    const roomId = document.getElementById('room-id-input').value.trim().toUpperCase();
    if (!name || !roomId) return alert('Заполни все поля!');
    socket.emit('slovo-join', { roomId, playerName: name });
}

function startGame() {
    socket.emit('slovo-start', currentRoomId);
}

function sendResult(isWin) {
    if (!isMyTurn) return;
    socket.emit('slovo-score-update', { roomId: currentRoomId, isWin });
}

// Socket события
socket.on('slovo-room-data', (room) => {
    currentRoomId = room.id;
    showScreen('lobby-screen');
    document.getElementById('lobby-id-display').innerText = `КОД: ${room.id}`;
    
    const list = document.getElementById('players-list');
    list.innerHTML = room.players.map(p => `<li>>> ${p.name}</li>`).join('');
    
    // Кнопка пуска только для хоста
    if (socket.id === room.players[0].id) {
        document.getElementById('start-btn').style.display = 'block';
    }
});

socket.on('slovo-new-turn', (data) => {
    showScreen('game-screen');
    isMyTurn = (socket.id === data.activePlayer.id);
    
    const display = document.getElementById('current-player-display');
    display.innerText = isMyTurn ? "ТВОЙ ХОД! ОБЪЯСНЯЙ!" : `ВЕЩАЕТ: ${data.activePlayer.name}`;
    display.style.color = isMyTurn ? "#ff3e00" : "#1a1a1a";
    
    document.getElementById('speaker-controls').classList.toggle('hidden', !isMyTurn);
    document.getElementById('listener-msg').classList.toggle('hidden', isMyTurn);
});

socket.on('slovo-card-update', (data) => {
    document.getElementById('target-letter').innerText = data.letter;
    document.getElementById('target-word').innerText = data.word;
});

socket.on('slovo-timer-tick', (time) => {
    document.getElementById('timer').innerText = time;
});

socket.on('slovo-game-over', (players) => {
    showScreen('result-screen');
    const statsDiv = document.getElementById('final-stats');
    const sorted = [...players].sort((a, b) => b.score - a.score);
    statsDiv.innerHTML = sorted.map(p => `
        <div class="res-item">
            <strong>${p.name}</strong>: ${p.score} ОЧКОВ
        </div>
    `).join('');
});

socket.on('slovo-error', (msg) => alert(msg));
