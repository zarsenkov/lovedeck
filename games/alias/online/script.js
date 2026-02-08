// // Установка соединения с сервером Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Состояние текущей сессии
let currentRoom = "";   
let isHost = false;     
let myTeam = 1;        // // По умолчанию игрок в первой команде
let selectedTime = 60; // // Время раунда по умолчанию

// --- ФУНКЦИИ ОТПРАВКИ (CLIENT -> SERVER) ---

// // Выбор времени (только для хоста)
function setOnlineTime(seconds, element) {
    selectedTime = seconds;
    // // Визуальное переключение активной кнопки в UI
    document.querySelectorAll('#host-settings .pop-chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

// // Смена команды игроком в лобби
function changeTeam(teamId) {
    myTeam = teamId;
    socket.emit('alias-change-team', { roomId: currentRoom, teamId: teamId });
}

// // Создание игры хостом
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    // // Генерируем ID и запоминаем
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoom = roomId;
    
    socket.emit('alias-join', { roomId, playerName: name });
}

// // Вход в существующую комнату по ID
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Введите имя и ID комнаты!");
    
    currentRoom = room;
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// // Нажатие кнопки СТАРТ хостом
function requestStart() {
    if (!currentRoom) return;
    if (typeof ALIAS_WORDS === 'undefined') return alert("Слова не загружены!");

    // // Берем стандартный набор слов из cards.js
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // // Отправляем настройки раунда серверу
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: selectedTime 
    });
}

// // Клик по кнопкам "Угадано" или "Пропуск"
function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect: isCorrect });
    
    // // Анимация карточки (сдвиг в сторону)
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(300px) rotate(20deg)' : 'translateX(-300px) rotate(-20deg)';
    card.style.opacity = '0';

    // // Возвращаем карточку в центр через 200мс
    setTimeout(() => {
        card.style.transition = 'none'; 
        card.style.transform = 'none'; 
        card.style.opacity = '1';
    }, 200);
}

// --- ОБРАБОТКА СОБЫТИЙ (SERVER -> CLIENT) ---

// // Обновление данных лобби (игроки, команды)
socket.on('alias-update-lobby', (data) => {
    toScreen('screen-lobby');
    currentRoom = data.roomId;
    document.getElementById('display-room-id').innerText = currentRoom;

    // // Определяем наш статус (хост или нет)
    const me = data.players.find(p => p.id === socket.id);
    if (me) {
        isHost = me.isHost;
        myTeam = me.team;
    }

    updatePlayers(data.players, data.teams);
});

// // Экран подготовки (показывает, кто сейчас будет объяснять)
socket.on('alias-prep-screen', (data) => {
    toScreen('screen-game');
    
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerHTML = `
        <div style="font-size: 0.6em; color: var(--purple); margin-bottom: 10px;">ПРИГОТОВЬТЕСЬ</div>
        <div style="font-size: 1.1em;">${data.playerName}</div>
        <div style="font-size: 0.5em; margin-top: 15px; opacity: 0.8;">Объясняет для команды:</div>
        <div style="font-size: 0.7em; color: var(--mint);">${data.teamName}</div>
    `;

    // // Скрываем управление и сбрасываем счет в UI на время заставки
    document.getElementById('game-controls').style.display = 'none';
    document.getElementById('live-score').innerText = "0";
});

// // Получение слова и начало активного раунда
socket.on('alias-new-turn', (data) => {
    const wordDisplay = document.getElementById('word-display');
    const isExplainer = data.activePlayerId === socket.id;
    const cardElement = document.getElementById('main-card');
    
    // // Отображаем текст: само слово (если твоя команда) или заглушку (если чужая)
    wordDisplay.innerText = data.word;
    
    // // Кнопки видит только тот, кто объясняет
    document.getElementById('game-controls').style.display = isExplainer ? 'flex' : 'none';
    
    // // Визуальные эффекты карточки
    cardElement.style.opacity = '1';
    cardElement.style.pointerEvents = isExplainer ? 'auto' : 'none';
    
    // // Красим рамку карточки: Зеленый — ваша команда, Фиолетовый — чужая
    cardElement.style.border = data.isMyTeam ? '4px solid var(--mint)' : '4px solid var(--purple)';
    
    document.getElementById('game-header').style.visibility = 'visible';
});

// // Тиканье таймера (каждую секунду от сервера)
socket.on('alias-timer-tick', (data) => {
    const t = data.timeLeft;
    const timerDisplay = document.getElementById('timer');
    timerDisplay.innerText = `00:${t < 10 ? '0' + t : t}`;
    
    // // Таймер становится красным, если осталось меньше 5 секунд
    timerDisplay.style.color = t <= 5 ? '#ff4d4d' : 'var(--black)';
});

// // Результаты после каждого раунда
socket.on('alias-turn-ended', (data) => {
    // // Пока используем простой alert, можно заменить на модальное окно
    alert(`РАУНД ЗАКОНЧЕН!\nИгрок: ${data.prevPlayer}\nРезультат команды: ${data.scoreGot}`);
});

// // Живое обновление счета текущего игрока
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// // Отрисовка списка игроков по командам в лобби
function updatePlayers(players, teams) {
    const list = document.getElementById('player-list');
    
    // // Фильтруем игроков по ID команды
    const t1 = players.filter(p => p.team === 1);
    const t2 = players.filter(p => p.team === 2);

    list.innerHTML = `
        <div class="team-box ${myTeam === 1 ? 'active-team' : ''}" onclick="changeTeam(1)" style="border: 2px dashed var(--mint); padding: 10px; border-radius: 15px; margin-bottom: 15px;">
            <h3 style="font-size: 0.8rem; margin-bottom: 5px;">${teams[1].name}</h3>
            <div style="font-size: 0.9rem;">${t1.map(p => p.name + (p.isHost ? ' ★' : '')).join(', ') || 'Пусто'}</div>
        </div>
        <div class="team-box ${myTeam === 2 ? 'active-team' : ''}" onclick="changeTeam(2)" style="border: 2px dashed var(--purple); padding: 10px; border-radius: 15px;">
            <h3 style="font-size: 0.8rem; margin-bottom: 5px;">${teams[2].name}</h3>
            <div style="font-size: 0.9rem;">${t2.map(p => p.name).join(', ') || 'Пусто'}</div>
        </div>
    `;

    // // Настройка видимости кнопок хоста
    const hostSettings = document.getElementById('host-settings');
    if (isHost) {
        if (hostSettings) hostSettings.style.display = 'block';
        document.getElementById('start-btn-online').style.display = 'block';
        document.getElementById('wait-msg').style.display = 'none';
    } else {
        if (hostSettings) hostSettings.style.display = 'none';
        document.getElementById('start-btn-online').style.display = 'none';
        document.getElementById('wait-msg').style.display = 'block';
    }
}

// // Переключение между экранами
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

// // Открыть/закрыть модальное окно правил
function toggleOnlineRules(show) {
    const modal = document.getElementById('modal-online-rules');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}
