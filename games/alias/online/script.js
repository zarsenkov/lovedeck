// // Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Состояние
let currentRoom = localStorage.getItem('alias_room') || "";   
let isHost = false;     
let selectedTime = 60; 
let totalRounds = 3;
let wakeLock = null;

// // Переменные для свайпа
let startX = 0;
let isDragging = false;

// --- ИНИЦИАЛИЗАЦИЯ (Защита от вылета) ---
window.onload = () => {
    const savedName = localStorage.getItem('alias_name');
    if (currentRoom && savedName) {
        // // Если есть данные в памяти, пробуем переподключиться
        socket.emit('alias-join', { roomId: currentRoom, playerName: savedName });
    }
};

// --- ФУНКЦИИ ХОСТА ---
function updateRoundsDisplay(val) {
    totalRounds = val;
    document.getElementById('round-val').innerText = val;
}

async function requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
}

// // Создание/Вход
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Имя!");
    localStorage.setItem('alias_name', name);
    requestWakeLock();
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    socket.emit('alias-join', { roomId, playerName: name });
}

function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    if (!name || !room) return alert("Заполни поля!");
    localStorage.setItem('alias_name', name);
    requestWakeLock();
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// // Старт с настройками раундов
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words, 
        timer: selectedTime,
        maxRounds: totalRounds 
    });
}

// --- СВАЙПЫ (ЛОГИКА) ---
const card = document.getElementById('main-card');
card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    card.style.transition = 'none';
});

card.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    let moveX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${moveX}px) rotate(${moveX/10}deg)`;
});

card.addEventListener('touchend', (e) => {
    isDragging = false;
    let endX = e.changedTouches[0].clientX;
    let diff = endX - startX;

    if (Math.abs(diff) > 100) {
        handleOnlineWord(diff > 0); // // Вправо = true (Угадано)
    } else {
        card.style.transition = '0.3s';
        card.style.transform = 'none';
    }
});

// --- СОБЫТИЯ СЕРВЕРА ---
socket.on('alias-update-lobby', (data) => {
    toScreen('screen-lobby');
    currentRoom = data.roomId;
    localStorage.setItem('alias_room', currentRoom);
    document.getElementById('display-room-id').innerText = currentRoom;
    
    // // Скрываем иконку правил, если мы уже в игре
    document.getElementById('rules-icon').style.display = data.gameStarted ? 'none' : 'block';

    const me = data.players.find(p => p.id === socket.id);
    if (me) isHost = me.isHost;
    updatePlayers(data.players, data.teams);
});

socket.on('alias-new-turn', (data) => {
    toScreen('screen-game');
    document.getElementById('rules-icon').style.display = 'none'; // // Убираем правила в игре
    const isMyTurn = (data.activePlayerId === socket.id);
    document.getElementById('word-display').innerText = data.word;
    document.getElementById('game-controls').style.display = isMyTurn ? 'flex' : 'none';
    document.getElementById('game-header').style.visibility = 'visible';
});

socket.on('alias-game-over', (data) => {
    toScreen('screen-results');
    document.getElementById('game-header').style.visibility = 'hidden';
    const resList = document.getElementById('final-results-list');
    resList.innerHTML = `
        <h3>ПОБЕДА: ${data.winner}</h3>
        <p>${data.team1Name}: ${data.team1Score}</p>
        <p>${data.team2Name}: ${data.team2Score}</p>
    `;
    localStorage.removeItem('alias_room'); // // Чистим память после конца игры
});

// // Остальные функции (timer-tick, update-score) остаются такими же
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
