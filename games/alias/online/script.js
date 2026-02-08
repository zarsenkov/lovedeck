// // Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Состояние приложения
let currentRoom = "";   
let isHost = false;     
let selectedTime = 60; 
let wakeLock = null; // // Для функции "непотухающего экрана"

// --- ФУНКЦИИ БЛОКИРОВКИ СНА ---

// // Запрашиваем у браузера разрешение не выключать экран
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Wake Lock активен: экран не погаснет");
        }
    } catch (err) {
        console.error("Ошибка Wake Lock:", err);
    }
}

// --- УПРАВЛЕНИЕ ЛОББИ ---

// // Установка времени раунда (только для хоста)
function setOnlineTime(seconds, element) {
    selectedTime = seconds;
    document.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

// // Создание комнаты
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    requestWakeLock(); // // Включаем анти-сон
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoom = roomId;
    socket.emit('alias-join', { roomId, playerName: name });
}

// // Вход в комнату
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    if (!name || !room) return alert("Заполни поля!");
    requestWakeLock(); // // Включаем анти-сон
    currentRoom = room;
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// // Запуск игры хостом
function requestStart() {
    if (!currentRoom) return;
    if (typeof ALIAS_WORDS === 'undefined') return alert("cards.js не найден!");
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { roomId: currentRoom, words, timer: selectedTime });
}

// --- ИГРОВАЯ ЛОГИКА ---

function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect });
    // // Анимация свайпа
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s';
    card.style.transform = isCorrect ? 'translateX(300px) rotate(20deg)' : 'translateX(-300px) rotate(-20deg)';
    card.style.opacity = '0';
    setTimeout(() => {
        card.style.transition = 'none'; card.style.transform = 'none'; card.style.opacity = '1';
    }, 200);
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ СОКЕТОВ ---

socket.on('alias-update-lobby', (data) => {
    toScreen('screen-lobby');
    currentRoom = data.roomId;
    document.getElementById('display-room-id').innerText = currentRoom;
    const me = data.players.find(p => p.id === socket.id);
    if (me) isHost = me.isHost;
    updatePlayers(data.players, data.teams);
});

socket.on('alias-prep-screen', (data) => {
    toScreen('screen-game');
    document.getElementById('game-controls').style.display = 'none';
    document.getElementById('word-display').innerHTML = `
        <div style="font-size:0.6em; color:var(--purple)">ПРИГОТОВЬТЕСЬ</div>
        <div style="margin: 15px 0;">${data.playerName}</div>
        <div style="font-size:0.5em">Объясняет для команды:</div>
        <div style="color:var(--mint)">${data.teamName}</div>
    `;
});

socket.on('alias-new-turn', (data) => {
    const isMyTurn = (data.activePlayerId === socket.id);
    const wordDisplay = document.getElementById('word-display');
    const card = document.getElementById('main-card');

    wordDisplay.innerText = data.word;
    document.getElementById('game-controls').style.display = isMyTurn ? 'flex' : 'none';
    card.style.pointerEvents = isMyTurn ? 'auto' : 'none';
    card.style.border = data.isMyTeam ? '4px solid var(--mint)' : '4px solid var(--purple)';
    document.getElementById('game-header').style.visibility = 'visible';
});

socket.on('alias-timer-tick', (data) => {
    const t = data.timeLeft;
    document.getElementById('timer').innerText = `00:${t < 10 ? '0'+t : t}`;
});

socket.on('alias-turn-ended', (data) => {
    alert(`Время вышло!\nИгрок ${data.prevPlayer} набрал: ${data.scoreGot}`);
});

socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// --- UI ФУНКЦИИ ---

function updatePlayers(players, teams) {
    const t1 = players.filter(p => p.team === 1);
    const t2 = players.filter(p => p.team === 2);
    document.getElementById('player-list').innerHTML = `
        <div class="team-box" style="border: 2px solid var(--mint); padding: 10px; border-radius: 15px; margin-bottom: 10px;">
            <h4 style="font-size:0.7rem">${teams[1].name}</h4>
            <div style="font-size:0.8rem">${t1.map(p => p.name).join(', ')}</div>
        </div>
        <div class="team-box" style="border: 2px solid var(--purple); padding: 10px; border-radius: 15px;">
            <h4 style="font-size:0.7rem">${teams[2].name}</h4>
            <div style="font-size:0.8rem">${t2.map(p => p.name).join(', ')}</div>
        </div>
    `;
    if (isHost) {
        document.getElementById('host-settings').style.display = 'block';
        document.getElementById('start-btn-online').style.display = 'block';
        document.getElementById('wait-msg').style.display = 'none';
    }
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toggleOnlineRules(show) {
    document.getElementById('modal-online-rules').style.display = show ? 'flex' : 'none';
}
