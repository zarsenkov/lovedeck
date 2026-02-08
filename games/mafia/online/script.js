[span_0](start_span)// Инициализация соединения с сервером Amvera[span_0](end_span)
// Мы используем переменную 'const', чтобы предотвратить повторную инициализацию
const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ["websocket", "polling"] // Поддержка разных типов соединения для стабильности
});

// Глобальный объект для хранения текущего состояния игры на клиенте
let gameState = {
    room: null,
    myRole: null
};

// --- ОБРАБОТЧИКИ СОБЫТИЙ СЕРВЕРА ---

// Функция выполняется при успешном подключении к серверу
socket.on("connect", () => {
    console.log("Соединение установлено. Мой ID:", socket.id);
});

// Функция обновления данных о комнате (синхронизация с сервером)
socket.on("mafia-update-room", (roomData) => {
    gameState.room = roomData; // Сохраняем актуальные данные комнаты
    renderLobby(); // Вызываем перерисовку интерфейса лобби
});

[span_1](start_span)// Функция получения индивидуальной роли от сервера[span_1](end_span)
socket.on("mafia-your-role", (roleKey) => {
    gameState.myRole = roleKey; // Сохраняем роль (безопасно, другие игроки её не видят)
    console.log("Ваша роль:", roleKey);
});

// --- ГЕЙМПЛЕЙНЫЕ ФУНКЦИИ ---

// Функция входа в игру: собирает данные и отправляет запрос на сервер
function joinGame() {
    // Получаем значения из полей ввода в HTML
    const name = document.getElementById('playerName').value.trim();
    const room = document.getElementById('roomId').value.trim();

    // Простая валидация данных перед отправкой
    if (!name || !room) {
        alert("Введите имя и номер комнаты!");
        return;
    }

    [span_2](start_span)// Отправка события 'mafia-join' на сервер с данными игрока[span_2](end_span)
    socket.emit('mafia-join', { roomId: room, playerName: name });

    // Визуальное переключение на экран лобби
    switchPage('lobby');
    document.getElementById('displayRoomId').innerText = `КОМНАТА: ${room}`;
}

// Функция для отображения списка игроков в лобби
function renderLobby() {
    const listContainer = document.getElementById('playerList');
    if (!gameState.room) return;

    // Очищаем контейнер и создаем элементы для каждого игрока из массива сервера
    listContainer.innerHTML = gameState.room.players.map(p => `
        <div class="name-input" style="text-align: center;">
            ${p.name} ${p.id === socket.id ? '<span style="color:var(--red)"> (ВЫ)</span>' : ''}
        </div>
    `).join('');

    // Проверка: является ли текущий пользователь хостом комнаты
    const startBtn = document.getElementById('startBtn');
    if (socket.id === gameState.room.hostId) {
        startBtn.style.display = 'block'; // Показываем кнопку старта только владельцу
    } else {
        startBtn.style.display = 'none';
    }
}

// Функция отправки команды на начало раздачи ролей (только для хоста)
function sendStart() {
    if (gameState.room && socket.id === gameState.room.hostId) {
        [span_3](start_span)// Запрос к серверу на запуск фазы распределения ролей[span_3](end_span)
        socket.emit('mafia-start-dist', { roomId: gameState.room.roomId || document.getElementById('roomId').value });
    }
}

// Универсальная функция для переключения активных экранов (экраны UI)
function switchPage(pageId) {
    // Удаляем класс 'active' у всех страниц
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Добавляем класс 'active' нужной странице по её ID
    const target = document.getElementById(pageId + 'Screen');
    if (target) target.classList.add('active');
}
