// // Подключаемся к твоему серверу на Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let iAmSwiper = false; // // Флаг: могу ли я свайпать карту сейчас
let startX = 0;

// // Функция смены экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Вход или создание комнаты
function joinGame(isCreate) {
    const name = document.getElementById('player-name').value;
    const roomInput = document.getElementById('room-input').value;
    if (!name) return alert("Введи имя!");
    
    currentRoomId = isCreate ? Math.floor(1000 + Math.random() * 9000).toString() : roomInput;
    socket.emit('alias-join', { roomId: currentRoomId, playerName: name });
}

// // Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = data.roomId;
    
    const lobby = document.getElementById('lobby-teams');
    lobby.innerHTML = "";
    
    // // Отображаем команды
    [1, 2].forEach(tId => {
        const members = data.players.filter(p => p.team === tId).map(p => p.name).join(", ");
        lobby.innerHTML += `
            <div class="team-ready-box">
                <h4>КОМАНДА ${tId}</h4>
                <div style="font-weight:900">${members || "Ждем игроков..."}</div>
            </div>
        `;
    });

    // // Показываем кнопку старта только хосту (первому игроку)
    const me = data.players.find(p => p.id === socket.id);
    if (me && me.isHost) {
        document.getElementById('host-ui').classList.remove('hidden');
    }
});

// // Кнопка "ПОГНАЛИ"
function startGame() {
    // // Берем слова из cards.js (категория common)
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { roomId: currentRoomId, words: words });
}

// // Экран подготовки
socket.on('alias-prep-screen', data => {
    toScreen('screen-prep');
    document.getElementById('prep-player-name').innerText = data.playerName;
    document.getElementById('prep-team-name').innerText = data.teamName;
});

// // Игровой процесс
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const wordText = document.getElementById('word-text');
    const card = document.getElementById('word-card');
    
    // // Проверяем, назначен ли я судьёй (свайпером)
    iAmSwiper = (data.swiperId === socket.id);
    
    // // Сброс анимации карты
    card.style.transform = "translateX(0) rotate(0)";
    card.style.transition = "0.3s";

    // // Логика отображения контента
    if (data.activePlayerId === socket.id) {
        wordText.innerText = data.word; // // Объясняющий видит слово
        document.getElementById('role-text').innerText = "ОБЪЯСНЯЙ!";
    } else if (iAmSwiper) {
        wordText.innerText = "СЛУШАЙ И СВАЙПАЙ"; // // Судья видит инструкцию
        document.getElementById('role-text').innerText = "ТЫ СУДЬЯ";
    } else {
        wordText.innerText = "СМОТРИ";
        document.getElementById('role-text').innerText = "Ход противников";
    }
});

// // МЕХАНИКА СВАЙПА (Neo-Brutalism)
const card = document.getElementById('word-card');

card.addEventListener('touchstart', e => {
    if (!iAmSwiper) return;
    startX = e.touches[0].clientX;
    card.style.transition = "none";
});

card.addEventListener('touchmove', e => {
    if (!iAmSwiper) return;
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/20}deg)`;
});

card.addEventListener('touchend', e => {
    if (!iAmSwiper) return;
    let x = e.changedTouches[0].clientX - startX;
    if (Math.abs(x) > 100) {
        // // Отправляем результат на сервер: вправо (true), влево (false)
        socket.emit('alias-action', { roomId: currentRoomId, isCorrect: x > 0 });
    } else {
        card.style.transition = "0.3s";
        card.style.transform = "translateX(0) rotate(0)";
    }
});

// // Обновление счета и таймера (приходят от сервера)
socket.on('alias-update-score', d => { document.getElementById('score-val').innerText = d.score; });
