// Устанавливаем соединение с сервером Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Состояние текущей сессии
let currentRoom = "";   // ID комнаты
let isHost = false;     // Флаг хоста

// --- ФУНКЦИИ ОТПРАВКИ ---

// Создание игры: генерируем ID и шлем серверу
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    // Генерируем временный ID для создания
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Отправляем запрос. Сервер вернет подтверждение в alias-update-lobby
    socket.emit('alias-join', { roomId, playerName: name });
}

// Вход в игру: используем введенный ID
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Нужно имя и ID комнаты!");
    
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// Запуск игры хостом
function requestStart() {
    // Проверяем наличие комнаты и слов
    if (!currentRoom) return alert("Ошибка: ID комнаты не найден!");
    if (!ALIAS_WORDS || !ALIAS_WORDS.common) return alert("Ошибка: База слов не загружена!");

    // Перемешиваем слова (общая категория)
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // Отправляем команду старта
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: 60 
    });
}

// --- ОБРАБОТКА ОТВЕТОВ СЕРВЕРА ---

// Обновление лобби (вызывается при входе и каждом новом игроке)
socket.on('alias-update-lobby', (data) => {
    // Сохраняем актуальный roomId, который подтвердил сервер
    if (data.roomId) {
        currentRoom = data.roomId;
    } else if (!currentRoom) {
        // Если сервер не прислал roomId в объекте, попробуем взять из инпута (для вошедших)
        currentRoom = document.getElementById('room-id').value;
    }

    toScreen('screen-lobby');
    
    // Обновляем текст в HTML
    document.getElementById('display-room-id').innerText = currentRoom;

    // Проверяем, являемся ли мы хостом
    const me = data.players.find(p => p.id === socket.id);
    if (me) isHost = me.isHost;

    updatePlayers(data.players);
});

// Начало игры / Новое слово
socket.on('alias-new-turn', (data) => {
    toScreen('screen-game');
    document.getElementById('word-display').innerText = data.word;
    
    const isMyTurn = data.activePlayerId === socket.id;
    const cardElement = document.getElementById('main-card');
    
    // Блокировка для тех, кто не объясняет
    cardElement.style.pointerEvents = isMyTurn ? 'auto' : 'none';
    cardElement.style.opacity = isMyTurn ? '1' : '0.7';
    document.getElementById('game-controls').style.display = isMyTurn ? 'flex' : 'none';
    
    // Показываем шапку с таймером
    document.getElementById('game-header').style.visibility = 'visible';
});

// Обновление счета
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Отрисовка списка игроков
function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill" style="background:var(--yellow); padding:2px 8px; border-radius:8px; font-size:12px; border:2px solid var(--black);">HOST</span>' : ''}
        </div>
    `).join('');

    // Показываем кнопку только хосту
    document.getElementById('start-btn-online').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect: isCorrect });
    
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
