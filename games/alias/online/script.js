// // Подключение к серверу Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let iAmSwiper = false; // // Флаг: может ли этот игрок нажимать на кнопки Угадано/Пропуск
let startX = 0; // // Для фиксации начала касания (свайп)

// // Функция смены экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Логика входа или создания комнаты
function joinGame(isCreate) {
    const name = document.getElementById('player-name').value;
    const roomInput = document.getElementById('room-input').value;
    
    if (!name) return alert("Введите имя!");
    
    // // Если создаем — генерируем ID, если входим — берем из инпута
    currentRoomId = isCreate ? Math.floor(1000 + Math.random() * 9000).toString() : roomInput;
    
    if (!currentRoomId) return alert("Введите ID комнаты!");
    
    socket.emit('alias-join', { roomId: currentRoomId, playerName: name });
}

// // Обновление лобби (событие от сервера)
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = data.roomId;
    
    const lobby = document.getElementById('lobby-teams');
    lobby.innerHTML = "";
    
    // // Группируем игроков по командам и выводим в лобби
    [1, 2].forEach(tId => {
        const members = data.players.filter(p => p.team === tId).map(p => p.name).join(", ");
        lobby.innerHTML += `
            <div class="team-ready-box">
                <h4>КОМАНДА ${tId}</h4>
                <div style="font-weight:900">${members || "Ждем игроков..."}</div>
            </div>
        `;
    });

    // // Если текущий игрок — хост, показываем ему настройки и кнопку старта
    const me = data.players.find(p => p.id === socket.id);
    if (me && me.isHost) {
        document.getElementById('host-ui').classList.remove('hidden');
        document.getElementById('client-msg').classList.add('hidden');
    }
});

// // ФУНКЦИЯ НАЖАТИЯ НА КНОПКУ "НАЧАТЬ ИГРУ"
function requestStart() {
    // // Проверяем наличие слов из cards.js
    if (typeof ALIAS_WORDS === 'undefined') return alert("Ошибка: слова не загружены!");
    
    const timer = document.getElementById('set-timer').value;
    const rounds = document.getElementById('set-rounds').value;
    
    // // Перемешиваем слова перед отправкой
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // // Отправляем серверу сигнал к началу
    socket.emit('alias-start', { 
        roomId: currentRoomId, 
        words: words,
        timer: parseInt(timer),
        maxRounds: parseInt(rounds)
    });
}

// // Показ экрана подготовки (кто объясняет)
socket.on('alias-prep-screen', data => {
    toScreen('screen-prep');
    document.getElementById('prep-player-name').innerText = data.playerName;
    document.getElementById('prep-team-name').innerText = data.teamName || "ВАША КОМАНДА";
});

// // Новый ход (получение слова)
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const wordText = document.getElementById('word-text');
    const card = document.getElementById('word-card');
    
    iAmSwiper = (data.swiperId === socket.id);
    
    // // Показываем кнопки управления только "Свайперу" (судье)
    document.getElementById('game-btns').classList.toggle('hidden', !iAmSwiper);
    
    // // Возвращаем карту в центр
    card.style.transform = "translateX(0) rotate(0)";
    card.style.transition = "0.3s";

    if (data.activePlayerId === socket.id) {
        wordText.innerText = data.word; // // Объясняющий видит слово
        document.getElementById('role-text').innerText = "ОБЪЯСНЯЙ!";
    } else if (iAmSwiper) {
        wordText.innerText = "СЛУШАЙ И ОТМЕЧАЙ"; // // Судья видит инструкцию
        document.getElementById('role-text').innerText = "ТЫ СУДЬЯ (СВАЙПАЙ КАРТУ)";
    } else {
        wordText.innerText = "СМОТРИ";
        document.getElementById('role-text').innerText = "Ход противника...";
    }
});

// // Обработка кнопок Угадано/Пропуск
function handleAction(isCorrect) {
    if (!iAmSwiper) return;
    socket.emit('alias-action', { roomId: currentRoomId, isCorrect: isCorrect });
}

// // Обновление таймера и счета в реальном времени
socket.on('alias-timer-tick', d => { 
    document.getElementById('timer-val').innerText = `00:${d.timeLeft < 10 ? '0'+d.timeLeft : d.timeLeft}`; 
});
socket.on('alias-update-score', d => { 
    document.getElementById('score-val').innerText = d.score; 
});
