// Соединение с сервером
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Глобальные переменные сессии
let currentRoom = "";   // // Хранит ID комнаты
let isHost = false;     // // Статус создателя игры

// --- ФУНКЦИИ ОТПРАВКИ ---

// // Функция создания новой комнаты хостом
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    // // Генерируем случайный ID
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoom = roomId; 
    
    // // Отправляем запрос серверу
    socket.emit('alias-join', { roomId, playerName: name });
}

// // Функция входа в существующую комнату
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Введите имя и ID!");
    
    currentRoom = room;
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// // Функция запуска игры (нажатие кнопки СТАРТ)
function requestStart() {
    console.log("Кнопка СТАРТ нажата для комнаты:", currentRoom); // // Отладка

    // // Проверка на наличие данных перед стартом
    if (!currentRoom) return alert("Комната не найдена");
    if (typeof ALIAS_WORDS === 'undefined') return alert("Ошибка: База слов не загружена");

    // // Берем слова и перемешиваем
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // // Отправляем сигнал старта на сервер
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: 60 
    });
}

// --- ОБРАБОТКА ОТВЕТОВ СЕРВЕРА ---

// // Обновление списка игроков и статуса лобби
socket.on('alias-update-lobby', (data) => {
    toScreen('screen-lobby');
    
    // // Отображаем номер комнаты
    document.getElementById('display-room-id').innerText = currentRoom;

    // // Определяем, являемся ли мы хостом в этой сессии
    const me = data.players.find(p => p.id === socket.id);
    if (me) isHost = me.isHost;

    updatePlayers(data.players);
});

// // Получение нового слова и начало раунда
socket.on('alias-new-turn', (data) => {
    console.log("Новый ход получен:", data); // // Отладка
    toScreen('screen-game');
    document.getElementById('word-display').innerText = data.word;
    
    // // Проверка очереди: мой ход или нет
    const isMyTurn = data.activePlayerId === socket.id;
    const cardElement = document.getElementById('main-card');
    
    // // Блокировка действий для зрителей
    cardElement.style.pointerEvents = isMyTurn ? 'auto' : 'none';
    cardElement.style.opacity = isMyTurn ? '1' : '0.7';
    document.getElementById('game-controls').style.display = isMyTurn ? 'flex' : 'none';
    
    document.getElementById('game-header').style.visibility = 'visible';
});

// --- ИНТЕРФЕЙСНЫЕ ФУНКЦИИ ---

// // Показать/скрыть правила
function toggleOnlineRules(show) {
    const modal = document.getElementById('modal-online-rules');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

// // Отрисовка игроков в лобби
function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill">HOST</span>' : ''}
        </div>
    `).join('');

    // // Показываем кнопку Старт только хосту
    document.getElementById('start-btn-online').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
}

// // Переключение экранов
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Логика ответа по слову
function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect: isCorrect });
    
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s';
    card.style.transform = isCorrect ? 'translateX(200px) rotate(20deg)' : 'translateX(-200px) rotate(-20deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.opacity = '1';
    }, 200);
}
