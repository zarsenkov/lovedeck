const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";
const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId = null;
let currentRoomId = null;
let myRole = null;

socket.on('connect', () => { myId = socket.id; console.log("Connected:", myId); });

// --- ЛОГИКА КНОПКИ НАЗАД ---
function handleBack() {
    const isLogin = document.getElementById('screen-login').classList.contains('active');
    if (isLogin) {
        window.location.href = "https://lovedeck-arsenkov.amvera.io/"; // Ссылка на твой главный сайт
    } else {
        if (confirm("Выйти из комнаты?")) window.location.reload();
    }
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введите имя");
    socket.emit('create_room', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Введите имя и код");
    socket.emit('join_room', { roomId: code, playerName: name });
}

function startGame() {
    if (currentRoomId) socket.emit('start_game', currentRoomId);
}

// --- СОБЫТИЯ ---
socket.on('room_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('lobby-code').innerText = currentRoomId;
    showScreen('screen-lobby');
});

socket.on('update_lobby', (room) => {
    currentRoomId = room.id;
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <li style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
            <span>${p.name} ${p.id === myId ? '<b>(Вы)</b>' : ''}</span>
            <span>${p.score}</span>
        </li>
    `).join('');

    const isHost = room.players.length > 0 && room.players[0].id === myId;
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

socket.on('round_start', ({ explainerId, judgeId }) => {
    showScreen('screen-game');
    document.getElementById('judge-controls').classList.add('hidden');
    const card = document.getElementById('word-card');
    
    if (myId === explainerId) {
        myRole = 'explainer';
        document.getElementById('my-role').innerText = "🗣 Объясняй";
        document.getElementById('instruction').innerText = "Твоя команда должна угадать!";
    } else if (myId === judgeId) {
        myRole = 'judge';
        document.getElementById('my-role').innerText = "⚖️ Судья";
        document.getElementById('instruction').innerText = "Свайпай карточку!";
        document.getElementById('judge-controls').classList.remove('hidden');
        initSwipe(card);
    } else {
        myRole = 'guesser';
        document.getElementById('my-role').innerText = "🎧 Угадывай";
        document.getElementById('instruction').innerText = "Слушай объяснение!";
    }
});

socket.on('new_word', (word) => {
    const wordEl = document.getElementById('current-word');
    if (myRole === 'explainer' || myRole === 'judge') {
        wordEl.innerText = word;
        const card = document.getElementById('word-card');
        card.style.transform = 'scale(0.8)'; card.style.opacity = '0';
        setTimeout(() => {
            card.style.transition = 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
            card.style.transform = 'scale(1)'; card.style.opacity = '1';
        }, 50);
    } else {
        wordEl.innerText = "???";
    }
});

socket.on('timer_update', (t) => document.getElementById('timer').innerText = t);
socket.on('round_end', () => { alert("Время вышло!"); showScreen('screen-lobby'); });
socket.on('error_msg', (msg) => alert(msg));

// --- СВАЙПЫ ---
function sendAction(action) {
    if (myRole === 'judge') {
        socket.emit('word_action', { roomId: currentRoomId, action });
        animateSwipe(action === 'guessed' ? 'right' : 'left');
    }
}

function initSwipe(el) {
    let startX = 0;
    el.ontouchstart = (e) => { startX = e.touches[0].clientX; el.style.transition = 'none'; };
    el.ontouchmove = (e) => {
        let diff = e.touches[0].clientX - startX;
        el.style.transform = `translateX(${diff}px) rotate(${diff/15}deg)`;
    };
    el.ontouchend = (e) => {
        let diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 100) sendAction(diff > 0 ? 'guessed' : 'skip');
        else { el.style.transition = '0.3s'; el.style.transform = 'none'; }
    };
}

function animateSwipe(dir) {
    const card = document.getElementById('word-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = `translateX(${dir === 'right' ? 200 : -200}px) rotate(${dir === 'right' ? 20 : -20}deg)`;
    card.style.opacity = '0';
}