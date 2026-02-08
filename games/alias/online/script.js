// Устанавливаем соединение с сервером Amvera по порту 80
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Переменные для хранения состояния текущей сессии
let currentRoom = "";   // ID комнаты, в которой находится игрок
let isHost = false;     // Флаг, является ли игрок создателем (хостом)

// --- ФУНКЦИИ ВЗАИМОДЕЙСТВИЯ (ОТПРАВКА НА СЕРВЕР) ---

// Функция для создания новой игровой комнаты
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    // Генерируем случайный ID комнаты из 4 цифр
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // ВАЖНО: Сохраняем ID комнаты локально перед отправкой
    currentRoom = roomId; 
    
    // Отправляем серверу запрос на создание
    socket.emit('alias-join', { roomId, playerName: name });
}

// Функция для входа в уже существующую комнату по её ID
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Заполни все поля!");
    
    // Сохраняем ID комнаты, которую ввели вручную
    currentRoom = room; 
    
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// Функция запуска игры
function requestStart() {
    // Берем слова из cards.js
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // Отправляем сигнал старта
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: 60 
    });
}

// --- ОБРАБОТКА ОТВЕТОВ СЕРВЕРА (ПРИЕМ ДАННЫХ) ---

// Обработка обновления данных о комнате
socket.on('alias-update-lobby', (data) => {
    // Переключаем экран на лобби
    toScreen('screen-lobby');
    
    // Выводим ID комнаты на экран
    document.getElementById('display-room-id').innerText = currentRoom;

    // Ищем себя в списке игроков, чтобы проверить статус хоста
    const me = data.players.find(p => p.id === socket.id);
    if (me) {
        isHost = me.isHost; // Берем статус хоста напрямую от сервера
    }

    // Обновляем визуальный список игроков
    updatePlayers(data.players);
});

// Событие начала хода
socket.on('alias-new-turn', (data) => {
    toScreen('screen-game');
    document.getElementById('word-display').innerText = data.word;
    
    // Логика блокировки карточки для тех, кто не водит
    const isMyTurn = data.activePlayerId === socket.id;
    const cardElement = document.getElementById('main-card');
    cardElement.style.pointerEvents = isMyTurn ? 'auto' : 'none';
    cardElement.style.opacity = isMyTurn ? '1' : '0.7';
    
    // Скрываем/показываем кнопки управления в зависимости от хода
    document.getElementById('game-controls').style.display = isMyTurn ? 'flex' : 'none';
});

// Обновление текущего счета
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Отрисовка игроков и управление кнопкой СТАРТ
function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill" style="background:var(--yellow); padding:2px 8px; border-radius:8px; font-size:12px; border:2px solid var(--black);">HOST</span>' : ''}
        </div>
    `).join('');

    // Показываем кнопку старта и скрываем текст "Ждем хоста", если мы хост
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

// Переключение экранов
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Обработка результата (свайп/клик)
function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { 
        roomId: currentRoom, 
        isCorrect: isCorrect 
    });
    
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
