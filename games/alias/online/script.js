// Адрес твоего сервера
const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";

const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true
});

let myId = null;
let currentRoomId = null;
let myRole = null;

// --- СОЕДИНЕНИЕ ---
socket.on('connect', () => {
    console.log("✅ Подключено! ID:", socket.id);
    myId = socket.id;
});

// --- UI ФУНКЦИИ ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function getPlayerName() {
    const input = document.getElementById('username');
    return input ? input.value.trim() : null;
}

// Новая функция выхода
function exitGame() {
    if (confirm("Выйти в меню?")) {
        location.reload(); // Самый надежный способ сбросить состояние
    }
}

// --- ЛОГИКА ЛОББИ ---
function createRoom() {
    const name = getPlayerName();
    if (!name) return alert('Введи имя!');
    socket.emit('create_room', { playerName: name });
}

function joinRoom() {
    const name = getPlayerName();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    if (!name || !code) return alert('Введи имя и код!');
    socket.emit('join_room', { roomId: code, playerName: name });
}

// Кнопка "ПОГНАЛИ"
function startGame() {
    if (!currentRoomId) return console.error("Нет ID комнаты");
    console.log("▶️ Отправляю start_game для комнаты:", currentRoomId);
    socket.emit('start_game', currentRoomId);
}

// --- СОБЫТИЯ ОТ СЕРВЕРА ---

socket.on('room_created', (data) => {
    // data = { roomId: "...", players: [...] }
    const rId = data.roomId || data;
    currentRoomId = rId;
    document.getElementById('lobby-code').innerText = rId;
    showScreen('screen-lobby');
});

socket.on('update_lobby', (room) => {
    console.log("Обновление лобби:", room);
    currentRoomId = room.id;

    if (room.state === 'lobby') {
        if (!document.getElementById('screen-lobby').classList.contains('active')) {
            showScreen('screen-lobby');
        }
    }

    // Рендер списка
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <li>
            <span>${p.name} ${p.id === myId ? '(Вы)' : ''}</span>
            <span class="score-badge">${p.score}</span>
        </li>
    `).join('');

    // ЛОГИКА ПОКАЗА КНОПКИ СТАРТА
    const startBtn = document.getElementById('start-btn');
    const waitMsg = document.getElementById('wait-msg');

    // Находим себя в списке игроков, чтобы понять, хост ли мы
    // Сервер теперь присылает флаг isHost, но для надежности проверим по первому игроку
    const amIHost = room.players.length > 0 && room.players[0].id === myId;

    if (amIHost) {
        startBtn.style.display = 'block';
        waitMsg.style.display = 'none';
    } else {
        startBtn.style.display = 'none';
        waitMsg.style.display = 'block';
    }
});

socket.on('round_start', ({ explainerId, judgeId }) => {
    showScreen('screen-game');
    
    // Сброс UI
    const rolePill = document.getElementById('my-role');
    const instruction = document.getElementById('instruction-text');
    const controls = document.getElementById('judge-controls');
    const wordCard = document.getElementById('word-card');
    
    controls.classList.add('hidden');
    document.getElementById('current-word').innerText = "...";

    // Роли
    if (myId === explainerId) {
        myRole = 'explainer';
        rolePill.innerText = '🗣 Объясняющий';
        rolePill.style.background = 'rgba(50, 50, 255, 0.2)';
        instruction.innerText = "Объясняй слова!";
    } else if (myId === judgeId) {
        myRole = 'judge';
        rolePill.innerText = '⚖️ Судья';
        rolePill.style.background = 'rgba(255, 50, 50, 0.2)';
        instruction.innerText = "Свайпай!";
        controls.classList.remove('hidden');
        initSwipe(wordCard);
    } else {
        myRole = 'guesser';
        rolePill.innerText = '🎧 Угадывающий';
        rolePill.style.background = 'rgba(50, 255, 100, 0.2)';
        instruction.innerText = "Угадывай!";
    }
});

socket.on('new_word', (word) => {
    const wordEl = document.getElementById('current-word');
    if (myRole === 'explainer' || myRole === 'judge') {
        wordEl.innerText = word;
        // Анимация появления
        const card = document.getElementById('word-card');
        card.style.transition = 'none';
        card.style.transform = 'scale(0.8) translateY(20px)';
        card.style.opacity = '0';
        setTimeout(() => {
             card.style.transition = 'all 0.4s ease-out';
             card.style.transform = 'scale(1) translateY(0)';
             card.style.opacity = '1';
        }, 50);
    } else {
        wordEl.innerText = "???";
    }
});

socket.on('timer_update', (time) => {
    document.getElementById('timer').innerText = time;
});

socket.on('round_end', () => {
    alert('Время вышло!');
    showScreen('screen-lobby');
});

socket.on('error_msg', (msg) => alert(msg));

// --- ДЕЙСТВИЯ ---
function sendAction(action) {
    if (myRole !== 'judge') return;
    if (action === 'guessed') animateSwipe('right');
    if (action === 'skip') animateSwipe('left');
    socket.emit('word_action', { roomId: currentRoomId, action });
}

function initSwipe(element) {
    let startX = 0;
    element.ontouchstart = (e) => startX = e.touches[0].clientX;
    element.ontouchend = (e) => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 50) diff > 0 ? sendAction('guessed') : sendAction('skip');
    };
}

function animateSwipe(dir) {
    const card = document.getElementById('word-card');
    const deg = dir === 'right' ? 15 : -15;
    const x = dir === 'right' ? 150 : -150;
    
    card.style.transition = 'all 0.3s ease-in';
    card.style.transform = `translateX(${x}px) rotate(${deg}deg)`;
    card.style.opacity = '0';
}