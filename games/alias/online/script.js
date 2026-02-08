// // Подключаемся к твоему серверу на Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let canISwipe = false;

// // Функция: Создать комнату
function createGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя");
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoomId = id;
    socket.emit('alias-join', { roomId: id, playerName: name });
}

// // Функция: Войти в комнату
function joinGame() {
    const name = document.getElementById('player-name').value;
    const id = document.getElementById('room-id').value;
    if (!name || !id) return alert("Заполни поля");
    currentRoomId = id;
    socket.emit('alias-join', { roomId: id, playerName: name });
}

// // Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby'); // // Твоя стандартная функция смены экранов
    document.getElementById('display-id').innerText = data.roomId;
    
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    
    // // Генерируем боксы команд в твоем стиле Neo-Brutalism
    [1, 2].forEach(tId => {
        const teamPlayers = data.players.filter(p => p.team === tId).map(p => p.name).join(", ");
        list.innerHTML += `
            <div class="team-ready-box">
                <h4>КОМАНДА ${tId}</h4>
                <div style="font-weight:900">${teamPlayers || "Ждем игроков..."}</div>
            </div>
        `;
    });

    // // Если игрок — хост, показываем кнопку старта
    const me = data.players.find(p => p.id === socket.id);
    if (me && me.isHost) document.getElementById('start-btn').classList.remove('hidden');
});

// // Начало хода
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const wordDisplay = document.getElementById('word-display');
    const controls = document.getElementById('controls');
    
    // // Определяем роль игрока
    canISwipe = (data.swiperId === socket.id);
    controls.classList.toggle('hidden', !canISwipe); // // Кнопки видит только "Свайпер"

    if (data.activePlayerId === socket.id) {
        wordDisplay.innerText = data.word; // // Объясняющий видит слово
        document.getElementById('swipe-hint').innerText = "ОБЪЯСНЯЙ СЛОВО!";
    } else if (canISwipe) {
        wordDisplay.innerText = "СЛУШАЙ ДРУГА"; // // Свайпер слушает и жмет кнопки
        document.getElementById('swipe-hint').innerText = "ТЫ ОТМЕЧАЕШЬ ОЧКИ (СВАЙП/КНОПКИ)";
    } else {
        wordDisplay.innerText = "ЖДИТЕ...";
        document.getElementById('swipe-hint').innerText = "Слушайте объяснение";
    }
});

// // Отправка результата (Правильно/Пропуск)
function sendAction(isCorrect) {
    if (!canISwipe) return;
    socket.emit('alias-action', { roomId: currentRoomId, isCorrect });
}

// // Синхронизация таймера
socket.on('alias-timer-tick', data => {
    document.getElementById('timer').innerText = `00:${data.timeLeft < 10 ? '0'+data.timeLeft : data.timeLeft}`;
});
