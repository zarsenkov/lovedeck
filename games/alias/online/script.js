// // Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let iAmSwiper = false;
let startX = 0;

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Вход/Создание
function joinGame(isCreate) {
    const name = document.getElementById('player-name').value;
    const rInput = document.getElementById('room-input').value;
    if(!name) return alert("Имя!");
    currentRoomId = isCreate ? Math.floor(1000 + Math.random()*9000).toString() : rInput;
    socket.emit('alias-join', { roomId: currentRoomId, playerName: name });
}

// // Старт (нажать "НАЧАТЬ ИГРУ")
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    const t = document.getElementById('set-timer').value;
    const r = document.getElementById('set-rounds').value;
    socket.emit('alias-start', { roomId: currentRoomId, words, timer: t, maxRounds: r });
}

// // Лобби
socket.on('alias-update-lobby', d => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = d.roomId;
    const me = d.players.find(p => p.id === socket.id);
    if(me?.isHost) document.getElementById('host-ui').classList.remove('hidden');
});

// // Игровой экран и свайпы
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const card = document.getElementById('word-card');
    iAmSwiper = (data.swiperId === socket.id);
    
    // // Управление (кнопки) видно только судье
    document.getElementById('game-btns').classList.toggle('hidden', !iAmSwiper);
    card.style.transform = "translateX(0) rotate(0)";

    if (data.activePlayerId === socket.id) {
        document.getElementById('word-text').innerText = data.word;
        document.getElementById('role-text').innerText = "ОБЪЯСНЯЙ!";
    } else if (iAmSwiper) {
        document.getElementById('word-text').innerText = "СЛУШАЙ И СВАЙПАЙ";
        document.getElementById('role-text').innerText = "ТЫ СУДЬЯ";
    } else {
        document.getElementById('word-text').innerText = "СМОТРИ";
        document.getElementById('role-text').innerText = "Ход другой команды";
    }
});

// // Логика СВАЙПА (Neo-Brutalism)
const card = document.getElementById('word-card');
card.addEventListener('touchstart', e => {
    if(!iAmSwiper) return;
    startX = e.touches[0].clientX;
    card.style.transition = 'none';
});
card.addEventListener('touchmove', e => {
    if(!iAmSwiper) return;
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/25}deg)`;
});
card.addEventListener('touchend', e => {
    if(!iAmSwiper) return;
    let x = e.changedTouches[0].clientX - startX;
    if (Math.abs(x) > 100) {
        socket.emit('alias-action', { roomId: currentRoomId, isCorrect: x > 0 });
    } else {
        card.style.transition = '0.3s';
        card.style.transform = 'translateX(0) rotate(0)';
    }
});

// // Кнопки (дублируют свайп)
function handleAction(isOk) {
    if(iAmSwiper) socket.emit('alias-action', { roomId: currentRoomId, isCorrect: isOk });
}

// // Таймер и Очки
socket.on('alias-timer-tick', d => {
    document.getElementById('timer-val').innerText = `00:${d.timeLeft < 10 ? '0'+d.timeLeft : d.timeLeft}`;
});
socket.on('alias-update-score', d => { document.getElementById('score-val').innerText = d.score; });

// // Финал игры
socket.on('alias-game-over', d => {
    toScreen('screen-results');
    const res = document.getElementById('results-list');
    res.innerHTML = `<h2>КОМАНДА 1: ${d.teams[1].score}</h2><h2>КОМАНДА 2: ${d.teams[2].score}</h2>`;
});
