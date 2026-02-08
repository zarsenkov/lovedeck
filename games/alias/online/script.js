// // Подключение к твоему серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let iAmSwiper = false;
let startX = 0;

// // Смена экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Вход или Создание
function joinGame(isCreate) {
    const name = document.getElementById('player-name').value;
    const roomInput = document.getElementById('room-input').value;
    if (!name) return alert("Введите имя");
    
    currentRoomId = isCreate ? Math.floor(1000 + Math.random() * 9000).toString() : roomInput;
    socket.emit('alias-join', { roomId: currentRoomId, playerName: name });
}

// // Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = data.roomId;
    
    const lobby = document.getElementById('lobby-teams');
    lobby.innerHTML = "";
    
    // // Рисуем команды
    [1, 2].forEach(tId => {
        const names = data.players.filter(p => p.team === tId).map(p => p.name).join(", ");
        lobby.innerHTML += `<div class="team-ready-box"><h4>КОМАНДА ${tId}</h4>${names || "Ждем..."}</div>`;
    });

    // // Если я хост — показываю кнопку
    const me = data.players.find(p => p.id === socket.id);
    if (me?.isHost) document.getElementById('host-ui').classList.remove('hidden');
});

// // ФУНКЦИЯ КОТОРАЯ НЕ СРАБАТЫВАЛА:
function startGame() {
    console.log("Нажимаю ПОГНАЛИ...");
    if (typeof ALIAS_WORDS === 'undefined') return alert("Слова еще не загружены!");
    
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { 
        roomId: currentRoomId, 
        words: words 
    });
}

// // Получение слова и роль
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    iAmSwiper = (data.swiperId === socket.id);
    const card = document.getElementById('word-card');
    const wordText = document.getElementById('word-text');
    
    card.style.transform = "translateX(0) rotate(0)";

    if (data.activePlayerId === socket.id) {
        wordText.innerText = data.word;
        document.getElementById('role-text').innerText = "ОБЪЯСНЯЙ!";
    } else if (iAmSwiper) {
        wordText.innerText = "СЛУШАЙ И СВАЙПАЙ";
        document.getElementById('role-text').innerText = "ТЫ СУДЬЯ";
    } else {
        wordText.innerText = "СМОТРИ";
        document.getElementById('role-text').innerText = "Ход врагов";
    }
});

// // Механика свайпа
const card = document.getElementById('word-card');
card.addEventListener('touchstart', e => { if(iAmSwiper) startX = e.touches[0].clientX; });
card.addEventListener('touchmove', e => {
    if(!iAmSwiper) return;
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/20}deg)`;
});
card.addEventListener('touchend', e => {
    if(!iAmSwiper) return;
    let x = e.changedTouches[0].clientX - startX;
    if (Math.abs(x) > 100) {
        socket.emit('alias-action', { roomId: currentRoomId, isCorrect: x > 0 });
    } else {
        card.style.transform = "translateX(0) rotate(0)";
    }
});

// // Обновление данных
socket.on('alias-update-score', d => { document.getElementById('score-val').innerText = d.score; });
socket.on('alias-timer-tick', d => { document.getElementById('timer-val').innerText = `00:${d.timeLeft < 10 ? '0'+d.timeLeft : d.timeLeft}`; });
