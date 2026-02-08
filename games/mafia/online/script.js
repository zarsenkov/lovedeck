// --- ИНИЦИАЛИЗАЦИЯ СОЕДИНЕНИЯ ---
// Создаем подключение к серверу. Если библиотека загружена из CDN, io будет доступен.
const socket = io("https://lovecouple.ru", {
    transports: ["websocket", "polling"]
});

// Глобальный объект состояния игры на клиенте
let gameState = {
    room: null,
    me: null
};

// --- ОБРАБОТЧИКИ СОБЫТИЙ СЕРВЕРА ---

// Функция срабатывает при успешном подключении к серверу
socket.on("connect", () => {
    console.log("Подключено к серверу. Мой ID:", socket.id);
});

// Функция получает обновление данных о комнате от сервера
socket.on("mafia-update-room", (roomData) => {
    gameState.room = roomData;
    renderLobby(); // Перерисовываем список игроков
});

// --- ФУНКЦИИ ИНТЕРФЕЙСА ---

// Функция для входа в игру: отправляет данные игрока на сервер
function joinGame() {
    // Получаем значения из полей ввода
    const name = document.getElementById('playerName').value;
    const room = document.getElementById('roomId').value;

    // Проверка на заполнение полей
    if (!name || !room) {
        alert("Пожалуйста, введите имя и номер комнаты");
        return;
    }

    // Отправляем событие входа на сервер с префиксом mafia-
    socket.emit('mafia-join', { roomId: room, playerName: name });

    // Визуально переключаем экран на лобби
    switchPage('lobby');
    document.getElementById('displayRoomId').innerText = `КОМНАТА: ${room}`;
}

// Функция для отрисовки списка игроков в лобби
function renderLobby() {
    const listContainer = document.getElementById('playerList');
    if (!gameState.room) return;

    // Очищаем и заполняем список заново на основе данных с сервера
    listContainer.innerHTML = gameState.room.players.map(p => `
        <div class="name-input" style="text-align: center;">
            ${p.name} ${p.id === socket.id ? '<span style="color:var(--red)">(ВЫ)</span>' : ''}
        </div>
    `).join('');

    // Если текущий игрок — создатель комнаты (host), показываем кнопку старта
    const startBtn = document.getElementById('startBtn');
    if (socket.id === gameState.room.hostId) {
        startBtn.style.display = 'block';
    } else {
        startBtn.style.display = 'none';
    }
}

// Функция для запуска игры хостом
function sendStart() {
    if (gameState.room) {
        // Отправляем команду на сервер начать раздачу ролей
        socket.emit('mafia-start-dist', { roomId: gameState.room.id });
    }
}

// Вспомогательная функция для переключения видимости экранов
function switchPage(pageId) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Показываем нужную страницу по ID
    const target = document.getElementById(pageId + 'Screen');
    if (target) target.classList.add('active');
}
