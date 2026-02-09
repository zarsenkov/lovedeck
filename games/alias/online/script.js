const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ['websocket', 'polling'] });

let myId, currentRoomId, myRole, gameSettings = { time: 60 };
let startX = 0;

// --- ИНИЦИАЛИЗАЦИЯ ---

socket.on('connect', () => {
    myId = socket.id;
    console.log("Connected to Neo-Pop Server");
});

function showScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Скрываем/показываем хедер в зависимости от экрана
    const header = document.getElementById('game-header');
    if (id === 'screen-game' || id === 'screen-summary') {
        header.style.visibility = 'visible';
    } else {
        header.style.visibility = 'hidden';
    }
}

// --- ЛОГИКА КОМНАТ ---

function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("ВВЕДИ ИМЯ!");
    socket.emit('create_room', { playerName: name, gameType: 'alias' });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("ЗАПОЛНИ ПОЛЯ!");
    socket.emit('join_room', { roomId: code, playerName: name });
}

socket.on('room_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('lobby-code').innerText = data.roomId;
    showScreen('screen-lobby');
});

socket.on('update_lobby', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="player-row">
            <span>${p.name} ${p.id === myId ? '(ТЫ)' : ''}</span>
            ${p.isHost ? '<span class="host-badge">HOST</span>' : ''}
            <span class="score-pill" style="box-shadow: 2px 2px 0 var(--black)">${p.score}</span>
        </div>
    `).join('');

    const isHost = room.players[0].id === myId;
    document.getElementById('host-settings').classList.toggle('hidden', !isHost);
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

// --- ГЕЙМПЛЕЙ ---

function startGame() {
    socket.emit('start_game', currentRoomId);
}

socket.on('round_start', ({ explainerId, judgeId, players }) => {
    const explainer = players.find(p => p.id === explainerId);
    const judge = players.find(p => p.id === judgeId);
    
    document.getElementById('player-turn-name').innerText = explainer.name;
    
    if (myId === explainerId) {
        myRole = 'explainer';
        document.getElementById('role-name').innerText = "ТЫ ОБЪЯСНЯЕШЬ!";
    } else if (myId === judgeId) {
        myRole = 'judge';
        document.getElementById('role-name').innerText = "ТЫ СУДЬЯ!";
    } else {
        myRole = 'guesser';
        document.getElementById('role-name').innerText = "ТЫ УГАДЫВАЕШЬ!";
    }
    
    showScreen('screen-ready');
});

function playerReady() {
    showScreen('screen-game');
    initSwipe(); // Включаем свайпы для тех, кому можно
}

socket.on('new_word', (word) => {
    const display = document.getElementById('word-display');
    if (myRole === 'explainer' || myRole === 'judge') {
        display.innerText = word;
    } else {
        display.innerText = "???";
    }
    resetCard();
});

socket.on('timer_update', (time) => {
    const el = document.getElementById('timer-display');
    el.innerText = time;
    if (time <= 10) el.style.background = '#FEB2B2';
    else el.style.background = 'var(--yellow)';
});

// --- СВАЙПЫ И ДЕЙСТВИЯ ---

function initSwipe() {
    const card = document.getElementById('word-card');
    if (myRole !== 'judge') return;

    card.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    card.addEventListener('touchmove', (e) => {
        const moveX = e.touches[0].clientX - startX;
        const rotation = moveX / 15;
        card.style.transform = `translateX(${moveX}px) rotate(${rotation}deg)`;
    });

    card.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (diff > 100) {
            handleAction('guessed');
        } else if (diff < -100) {
            handleAction('skip');
        } else {
            resetCard();
        }
    });
}

function handleAction(action) {
    if (myRole !== 'judge') return;
    
    const card = document.getElementById('word-card');
    card.classList.add(action === 'guessed' ? 'swipe-right-anim' : 'swipe-left-anim');
    
    setTimeout(() => {
        socket.emit('word_action', { roomId: currentRoomId, action });
    }, 200);
}

function resetCard() {
    const card = document.getElementById('word-card');
    card.classList.remove('swipe-right-anim', 'swipe-left-anim');
    card.style.transform = 'translateX(0) rotate(0)';
}

// --- УТИЛИТЫ ---

function handleBack() {
    if (confirm("Выйти из игры?")) window.location.href = "https://lovecouple.ru";
}

function toggleModal(id) {
    document.getElementById(`modal-${id}`).classList.toggle('active');
}

function setSetting(type, val, el) {
    // Визуальное переключение чипсов
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    gameSettings[type] = val;
    // Можно добавить socket.emit('update_settings'...)
}