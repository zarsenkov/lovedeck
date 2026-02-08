// Устанавливаем соединение с сервером
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Состояние игры
let currentRoom = "";   // ID текущей комнаты
let isHost = false;     // Является ли пользователь хостом

// --- ФУНКЦИИ ОТПРАВКИ ---

// Функция создания игры (ID генерируется автоматически)
function createOnlineGame() {
    // Получаем только имя
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    // Генерируем 4-значный номер
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Запоминаем ID комнаты локально
    currentRoom = roomId;
    
    // Отправляем серверу
    socket.emit('alias-join', { roomId, playerName: name });
}

// Функция входа (имя и ID комнаты обязательны)
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Введите имя и ID комнаты!");
    
    // Запоминаем ID комнаты, в которую входим
    currentRoom = room;
    
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// Функция нажатия "Старт" (только для хоста)
function requestStart() {
    // Проверяем, что комната установлена
    if (!currentRoom) return alert("Ошибка: комната не определена");

    // Берем слова из cards.js (категория common)
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // Отправляем команду серверу
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: 60 
    });
}

// --- ОБРАБОТКА ОТВЕТОВ СЕРВЕРА ---

socket.on('alias-update-lobby', (data) => {
    // Переходим в лобби
    toScreen('screen-lobby');
    
    // ВАЖНО: Обновляем ROOM ID в интерфейсе
    document.getElementById('display-room-id').innerText = currentRoom;

    // Проверяем статус хоста по списку игроков от сервера
    const me = data.players.find(p => p.id === socket.id);
    if (me) {
        isHost = me.isHost;
    }

    // Обновляем список игроков и кнопки
    updatePlayers(data.players);
});

// Когда игра начинается
socket.on('alias-new-turn', (data) => {
    // Показываем игровой экран
    toScreen('screen-game');
    
    // Устанавливаем слово
    document.getElementById('word-display').innerText = data.word;
    
    // Если сейчас не мой ход — блокируем управление
    const isMyTurn = data.activePlayerId === socket.id;
    const cardElement = document.getElementById('main-card');
    cardElement.style.pointerEvents = isMyTurn ? 'auto' : 'none';
    cardElement.style.opacity = isMyTurn ? '1' : '0.7';
    
    // Убираем/показываем кнопки Угадано/Пропуск
    document.getElementById('game-controls').style.display = isMyTurn ? 'flex' : 'none';
});

// Обновление счета
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill" style="background:var(--yellow); padding:2px 8px; border-radius:8px; font-size:12px; border:2px solid var(--black);">HOST</span>' : ''}
        </div>
    `).join('');

    // Управление видимостью кнопки Старт и сообщения ожидания
    const startBtn = document.getElementById('start-btn-online');
    const waitMsg = document.getElementById('wait-msg');

    if (isHost) {
        startBtn.style.display = 'block';
        waitMsg.style.display = 'none';
    } else {
        startBtn.style.display = 'none';
        waitMsg.style.display = 'block';
    }
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
}

function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { 
        roomId: currentRoom, 
        isCorrect: isCorrect 
    });
    
    // Анимация карточки
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(350px) rotate(30deg)' : 'translateX(-350px) rotate(-30deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none'; 
        card.style.transform = 'none'; 
        card.style.opacity = '1';
    }, 200);
}
