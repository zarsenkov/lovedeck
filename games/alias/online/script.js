// // Установка соединения с сервером Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Состояние текущей сессии
let currentRoom = "";   
let isHost = false;     
let selectedTime = 60; // // Время раунда по умолчанию

// --- УПРАВЛЕНИЕ ЛОББИ ---

// // Выбор времени (вызывается хостом)
function setOnlineTime(seconds, element) {
    selectedTime = seconds;
    // // Визуальное переключение активной кнопки
    document.querySelectorAll('#host-settings .pop-chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

// // Создание игры хостом
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoom = roomId;
    
    socket.emit('alias-join', { roomId, playerName: name });
}

// // Вход в существующую комнату
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Введите имя и ID комнаты!");
    
    currentRoom = room;
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// // Нажатие кнопки СТАРТ
function requestStart() {
    if (!currentRoom) return;
    if (typeof ALIAS_WORDS === 'undefined') return alert("Слова не загружены!");

    // // Перемешиваем базу слов (категория common)
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: selectedTime 
    });
}

// --- ОБРАБОТКА СОБЫТИЙ СЕРВЕРА ---

// // Обновление лобби и списка игроков
socket.on('alias-update-lobby', (data) => {
    toScreen('screen-lobby');
    currentRoom = data.roomId;
    document.getElementById('display-room-id').innerText = currentRoom;

    // // Проверяем, назначил ли сервер нас хостом
    const me = data.players.find(p => p.id === socket.id);
    if (me) isHost = me.isHost;

    updatePlayers(data.players);
});

// // Тиканье таймера
socket.on('alias-timer-tick', (data) => {
    const t = data.timeLeft;
    const timerDisplay = document.getElementById('timer');
    timerDisplay.innerText = `00:${t < 10 ? '0' + t : t}`;
    
    // // Делаем таймер красным в последние 5 секунд
    timerDisplay.style.color = t <= 5 ? '#ff4d4d' : 'var(--black)';
});

// // Оповещение о конце хода (результаты)
socket.on('alias-turn-ended', (data) => {
    // // Можно заменить на красивое модальное окно вместо alert
    alert(`Время вышло!\nИгрок: ${data.prevPlayer}\nНабрано очков: ${data.scoreGot}`);
});

// // Получение нового слова / Нового игрока
socket.on('alias-new-turn', (data) => {
    toScreen('screen-game');
    
    const isMyTurn = data.activePlayerId === socket.id;
    const wordDisplay = document.getElementById('word-display');
    const cardElement = document.getElementById('main-card');
    
    // // Если мой ход - показываю слово, если чужой - имя игрока
    if (isMyTurn) {
        wordDisplay.innerText = data.word;
        cardElement.style.pointerEvents = 'auto';
        cardElement.style.opacity = '1';
        document.getElementById('game-controls').style.display = 'flex';
    } else {
        wordDisplay.innerText = `${data.activePlayerName} объясняет...`;
        cardElement.style.pointerEvents = 'none';
        cardElement.style.opacity = '0.7';
        document.getElementById('game-controls').style.display = 'none';
    }
    
    document.getElementById('game-header').style.visibility = 'visible';
});

// // Живое обновление счета раунда
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill" style="background:var(--yellow)">HOST</span>' : ''}
        </div>
    `).join('');

    // // Показываем настройки и кнопку старта только хосту
    const settings = document.getElementById('host-settings');
    if (isHost) {
        if (settings) settings.style.display = 'block';
        document.getElementById('start-btn-online').style.display = 'block';
        document.getElementById('wait-msg').style.display = 'none';
    } else {
        if (settings) settings.style.display = 'none';
        document.getElementById('start-btn-online').style.display = 'none';
        document.getElementById('wait-msg').style.display = 'block';
    }
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toggleOnlineRules(show) {
    const modal = document.getElementById('modal-online-rules');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect: isCorrect });
    
    // // Анимация карточки (сдвиг и исчезновение)
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(300px) rotate(20deg)' : 'translateX(-300px) rotate(-20deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none'; 
        card.style.transform = 'none'; 
        card.style.opacity = '1';
    }, 200);
}
