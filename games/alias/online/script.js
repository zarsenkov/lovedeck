const socket = io();

// Состояние клиента
let myId = null;
let currentRoomId = null;
let myRole = null; // 'explainer', 'judge', 'guesser'

// --- НАВИГАЦИЯ ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- СОБЫТИЯ ВХОДА ---
function createRoom() {
    const name = document.getElementById('username').value;
    if (!name) return alert('ВВЕДИ ИМЯ!');
    socket.emit('create_room', name);
}

function joinRoom() {
    const name = document.getElementById('username').value;
    const code = document.getElementById('room-code-input').value.toUpperCase();
    if (!name || !code) return alert('ЗАПОЛНИ ВСЕ ПОЛЯ!');
    socket.emit('join_room', { roomId: code, playerName: name });
}

// --- SOCKET LISTENERS ---

socket.on('connect', () => {
    myId = socket.id;
});

socket.on('room_created', (roomId) => {
    currentRoomId = roomId;
    document.getElementById('lobby-code').innerText = roomId;
    showScreen('screen-lobby');
    document.getElementById('start-btn').style.display = 'block'; // Хост видит кнопку старт
});

socket.on('update_lobby', (room) => {
    currentRoomId = room.id;
    if (room.state === 'lobby') showScreen('screen-lobby');
    
    document.getElementById('lobby-code').innerText = room.id;
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `<li>${p.name} <span style="background:black; color:white; padding:2px 5px;">${p.score}</span></li>`).join('');

    // Скрываем/показываем кнопку старта (только для первого игрока - хоста)
    if (room.players[0].id !== myId) {
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('wait-msg').style.display = 'block';
    }
});

socket.on('round_start', ({ explainerId, judgeId }) => {
    showScreen('screen-game');
    const roleBadge = document.getElementById('my-role');
    const wordCard = document.getElementById('word-card');
    const controls = document.getElementById('judge-controls');
    const instruction = document.getElementById('instruction-text');

    // Сброс UI
    controls.classList.add('hidden');
    instruction.innerText = "";
    document.getElementById('current-word').innerText = "...";

    // Определение роли
    if (myId === explainerId) {
        myRole = 'explainer';
        roleBadge.innerText = 'ОБЪЯСНЯЮЩИЙ';
        roleBadge.style.background = '#3333ff';
        instruction.innerText = "Объясняй слова!";
    } else if (myId === judgeId) {
        myRole = 'judge';
        roleBadge.innerText = 'СУДЬЯ';
        roleBadge.style.background = '#ff3333';
        controls.classList.remove('hidden'); // Показываем кнопки
        instruction.innerText = "Свайпай или жми кнопки!";
        initSwipe(wordCard); // Включаем свайпы
    } else {
        myRole = 'guesser';
        roleBadge.innerText = 'УГАДЫВАЮЩИЙ';
        roleBadge.style.background = '#33ff33';
        instruction.innerText = "Слушай и угадывай!";
        document.getElementById('current-word').innerText = "СКРЫТО";
    }
});

socket.on('new_word', (word) => {
    if (myRole === 'explainer' || myRole === 'judge') {
        document.getElementById('current-word').innerText = word;
        // Анимация появления
        const card = document.getElementById('word-card');
        card.style.transform = 'scale(1.05)';
        setTimeout(() => card.style.transform = 'scale(1)', 100);
    } else {
        document.getElementById('current-word').innerText = "???";
    }
});

socket.on('timer_update', (time) => {
    document.getElementById('timer').innerText = time;
    if (time <= 10) document.getElementById('timer').style.color = 'red';
    else document.getElementById('timer').style.color = 'white';
});

socket.on('round_end', () => {
    alert('Время вышло!');
    showScreen('screen-lobby'); // Возврат в лобби
});

socket.on('error_msg', (msg) => alert(msg));

// --- ACTIONS & SWIPES ---

function startGame() {
    socket.emit('start_game', currentRoomId);
}

function sendAction(action) {
    if (myRole !== 'judge') return;
    socket.emit('word_action', { roomId: currentRoomId, action });
}

// Логика свайпа (для мобильных)
function initSwipe(element) {
    let startX = 0;
    
    element.ontouchstart = (e) => {
        startX = e.touches[0].clientX;
    };

    element.ontouchend = (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (Math.abs(diff) > 50) { // Если свайп достаточно длинный
            if (diff > 0) {
                // Вправо -> Угадано
                sendAction('guessed');
                animateSwipe('right');
            } else {
                // Влево -> Пропуск
                sendAction('skip');
                animateSwipe('left');
            }
        }
    };
}

function animateSwipe(dir) {
    const card = document.getElementById('word-card');
    const deg = dir === 'right' ? 20 : -20;
    const x = dir === 'right' ? 100 : -100;
    
    card.style.transition = '0.3s';
    card.style.transform = `translateX(${x}px) rotate(${deg}deg)`;
    
    setTimeout(() => {
        card.style.transition = '0s';
        card.style.transform = 'translateX(0) rotate(0)';
    }, 300);
}