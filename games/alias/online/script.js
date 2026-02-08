// // Установка соединения с сервером Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Состояние текущей сессии
let currentRoom = localStorage.getItem('alias_room') || "";   
let isHost = false;     
let selectedTime = 60; // // Время раунда по умолчанию
let totalRounds = 3;   // // Количество раундов по умолчанию
let startX = 0;        // // Точка начала касания для свайпа

// --- ИНИЦИАЛИЗАЦИЯ ---

// // При загрузке страницы проверяем, не вылетел ли игрок из активной комнаты
window.onload = () => {
    const savedName = localStorage.getItem('alias_name');
    if (currentRoom && savedName) {
        // // Если данные есть, автоматически пробуем переподключиться
        socket.emit('alias-join', { roomId: currentRoom, playerName: savedName });
    }
};

// --- ФУНКЦИИ ХОСТА ---

// // Визуальное обновление счетчика раундов в лобби
function updateRoundsDisplay(val) {
    totalRounds = val;
    document.getElementById('round-val').innerText = val;
}

// // Выбор времени раунда
function setOnlineTime(seconds, element) {
    selectedTime = seconds;
    // // Сбрасываем активный класс у всех чипсов и ставим текущему
    document.querySelectorAll('.chip').forEach(c => c.style.background = '#fff');
    element.style.background = 'var(--purple)';
    element.style.color = '#fff';
}

// --- УПРАВЛЕНИЕ ВХОДОМ ---

// // Создание новой игры (для Хоста)
async function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    localStorage.setItem('alias_name', name);
    // // Генерация случайного ID комнаты
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    currentRoom = roomId;
    
    socket.emit('alias-join', { roomId, playerName: name });
}

// // Вход в существующую игру по ID
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Заполните имя и ID комнаты!");
    
    localStorage.setItem('alias_name', name);
    currentRoom = room;
    socket.emit('alias-join', { roomId: room, playerName: name });
}

// // Запуск игры (только для Хоста)
function requestStart() {
    if (typeof ALIAS_WORDS === 'undefined') return alert("Слова не загружены!");
    
    // // Берем слова и перемешиваем
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: selectedTime,
        maxRounds: totalRounds 
    });
}

// --- ЛОГИКА СВАЙПОВ И ИГРОВЫХ ДЕЙСТВИЙ ---

const card = document.getElementById('main-card');

// // Начало касания
card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    card.style.transition = 'none'; // // Отключаем анимацию при движении пальцем
});

// // Движение пальца по экрану
card.addEventListener('touchmove', (e) => {
    let moveX = e.touches[0].clientX - startX;
    // // Поворачиваем и сдвигаем карточку за пальцем
    card.style.transform = `translateX(${moveX}px) rotate(${moveX / 15}deg)`;
});

// // Окончание касания
card.addEventListener('touchend', (e) => {
    let diff = e.changedTouches[0].clientX - startX;
    
    // // Если свайп достаточно длинный (>120px)
    if (Math.abs(diff) > 120) {
        handleOnlineWord(diff > 0); // // Вправо = Угадано, Влево = Пропуск
    } else {
        // // Если свайп короткий — возвращаем карточку в центр
        card.style.transition = '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'none';
    }
});

// // Обработка результата слова (кнопки или свайп)
function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect: isCorrect });
    
    // // Анимация вылета карточки
    card.style.transition = '0.4s ease-out';
    card.style.transform = isCorrect ? 'translateX(600px) rotate(40deg)' : 'translateX(-600px) rotate(-40deg)';
    card.style.opacity = '0';

    // // Возвращаем карточку для следующего слова
    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.opacity = '1';
    }, 250);
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ СЕРВЕРА ---

// // Обновление лобби (игроки, команды, права хоста)
socket.on('alias-update-lobby', (data) => {
    toScreen('screen-lobby');
    currentRoom = data.roomId;
    localStorage.setItem('alias_room', currentRoom);
    document.getElementById('display-room-id').innerText = currentRoom;

    const me = data.players.find(p => p.id === socket.id);
    if (me) isHost = me.isHost;

    // // Показываем настройки только хосту
    if (isHost) {
        document.getElementById('host-settings').classList.remove('hidden');
        document.getElementById('start-btn-online').classList.remove('hidden');
        document.getElementById('wait-msg').classList.add('hidden');
    }

    renderPlayers(data.players, data.teams);
});

// // Экран подготовки ("Ходит Игрок...")
socket.on('alias-prep-screen', (data) => {
    toScreen('screen-game');
    document.getElementById('game-controls').classList.add('hidden');
    document.getElementById('word-display').innerHTML = `
        <div style="font-size: 0.5em; color: var(--purple); opacity: 0.7;">ПРИГОТОВЬТЕСЬ</div>
        <div style="margin: 10px 0;">${data.playerName}</div>
        <div style="font-size: 0.4em; opacity: 0.6;">Объясняет команде:<br><b>${data.teamName}</b></div>
    `;
});

// // Начало активного хода (получение слова)
socket.on('alias-new-turn', (data) => {
    const isMyTurn = (data.activePlayerId === socket.id);
    
    document.getElementById('game-header').classList.remove('hidden');
    document.getElementById('word-display').innerText = data.word;
    
    // // Кнопки управления видим только если мы объясняем
    document.getElementById('game-controls').classList.toggle('hidden', !isMyTurn);
    
    // // Подсвечиваем рамку карточки цветом команды
    card.style.borderColor = data.isMyTeam ? 'var(--mint)' : 'var(--purple)';
});

// // Обновление таймера
socket.on('alias-timer-tick', (data) => {
    const t = data.timeLeft;
    document.getElementById('timer').innerText = `00:${t < 10 ? '0' + t : t}`;
});

// // Живое обновление счета текущего хода
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// // Конец игры и вывод итогов
socket.on('alias-game-over', (data) => {
    toScreen('screen-results');
    document.getElementById('game-header').classList.add('hidden');
    
    document.getElementById('final-results-list').innerHTML = `
        <h3 style="color: var(--mint); margin-top:0;">Победили: ${data.winner}</h3>
        <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        <div style="display:flex; justify-content:space-between;">
            <span>${data.team1Name}:</span> <b>${data.team1Score}</b>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:10px;">
            <span>${data.team2Name}:</span> <b>${data.team2Score}</b>
        </div>
    `;
    
    // // Очищаем комнату из памяти, чтобы можно было начать новую
    localStorage.removeItem('alias_room');
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// // Отрисовка списка игроков в лобби
function renderPlayers(players, teams) {
    const list = document.getElementById('player-list');
    const t1 = players.filter(p => p.team === 1);
    const t2 = players.filter(p => p.team === 2);

    list.innerHTML = `
        <div class="team-box">
            <h4>${teams[1].name}</h4>
            <div>${t1.map(p => p.name + (p.isHost ? ' ★' : '')).join(', ') || 'Ожидание...'}</div>
        </div>
        <div class="team-box">
            <h4>${teams[2].name}</h4>
            <div>${t2.map(p => p.name).join(', ') || 'Ожидание...'}</div>
        </div>
    `;
}

// // Переключение экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Показ/скрытие правил
function toggleOnlineRules(show) {
    document.getElementById('modal-online-rules').style.display = show ? 'flex' : 'none';
}
