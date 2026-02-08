// Глобальное подключение к сокету
const socket = io(); 

// Локальное состояние клиента
let gameState = {
    me: null,
    room: null,
    myRole: null
};

// Константы ролей (идентичны оригиналу)
const ROLES = {
    mafia: { title: "МАФИЯ", icon: "fas fa-user-ninja", desc: "Убивайте ночью, путайте днем." },
    citizen: { title: "МИРНЫЙ", icon: "fas fa-users", desc: "Найдите мафию в ходе обсуждения." },
    doctor: { title: "ДОКТОР", icon: "fas fa-medkit", desc: "Может спасти одного человека за ночь." },
    commissar: { title: "КОМИССАР", icon: "fas fa-search", desc: "Узнает роли игроков ночью." }
};

// --- СОБЫТИЯ ВХОДА ---
// Функция авторизации и входа в комнату
function joinGame() {
    const name = document.getElementById('playerName').value;
    const roomId = document.getElementById('roomId').value;
    if(!name || !roomId) return alert("Введите данные");

    socket.emit('mafia-join', { roomId, playerName: name });
    switchPage('lobby');
    document.getElementById('displayRoomId').innerText = roomId;
}

// --- СЛУШАТЕЛИ СОКЕТОВ ---
// Обновление состояния комнаты от сервера
socket.on('mafia-update-room', (room) => {
    gameState.room = room;
    renderLobby();
    
    // Если игра началась и мы в лобби — переходим к раздаче
    if(room.phase === 'distribution' && isCurrentPage('lobby')) {
        switchPage('distribute');
    }
});

// Получение персональной роли (безопасно)
socket.on('mafia-your-role', (roleKey) => {
    gameState.myRole = roleKey;
    const roleData = ROLES[roleKey];
    document.getElementById('roleTitle').innerText = roleData.title;
    document.getElementById('roleDesc').innerText = roleData.desc;
    document.getElementById('roleIcon').innerHTML = `<i class="${roleData.icon}"></i>`;
});

// Обновление таймера от сервера
socket.on('mafia-timer-tick', (timeLeft) => {
    const timerEl = document.getElementById('dayTimer');
    if(timerEl) timerEl.innerText = timeLeft;
});

// --- ЛОГИКА ИНТЕРФЕЙСА ---
// Отрисовка списка игроков в лобби
function renderLobby() {
    const list = document.getElementById('playerList');
    list.innerHTML = gameState.room.players.map(p => 
        `<div class="name-input">${p.name} ${p.id === socket.id ? '(ВЫ)' : ''}</div>`
    ).join('');

    // Показываем кнопки управления только хосту
    if(socket.id === gameState.room.hostId) {
        document.getElementById('hostControls').style.display = 'block';
        document.getElementById('startBtn').style.display = 'block';
    }
}

// Отправка команды на старт игры
function sendStart() {
    socket.emit('mafia-start-dist', { roomId: gameState.room.hostId });
}

// Вспомогательная функция переключения экранов
function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id + 'Screen').classList.add('active');
}

function isCurrentPage(id) {
    return document.getElementById(id + 'Screen').classList.contains('active');
}
