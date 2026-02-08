const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let iAmSwiper = false;
let startX = 0;

// // Переключение экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Вход
function joinGame(isCreate) {
    const name = document.getElementById('player-name').value;
    const room = isCreate ? Math.floor(1000 + Math.random()*9000).toString() : document.getElementById('room-input').value;
    if(!name) return alert("Имя!");
    currentRoomId = room;
    socket.emit('alias-join', { roomId: room, playerName: name });
}

// // Лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = data.roomId;
    const list = document.getElementById('lobby-teams');
    list.innerHTML = "";
    [1,2].forEach(num => {
        const ps = data.players.filter(p => p.team === num).map(p => p.name).join(", ");
        list.innerHTML += `<div class="team-ready-box"><h4>КОМАНДА ${num}</h4>${ps || "Ждем..."}</div>`;
    });
    const me = data.players.find(p => p.id === socket.id);
    if(me?.isHost) document.getElementById('host-ui').classList.remove('hidden');
});

// // Старт (от Хоста)
function startGame() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { roomId: currentRoomId, words, timer: 60, maxRounds: 3 });
}

// // Подготовка
socket.on('alias-prep-screen', d => {
    toScreen('screen-prep');
    document.getElementById('prep-player-name').innerText = d.playerName;
    document.getElementById('prep-team-name').innerText = d.teamName;
});

// // Игровой процесс
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const card = document.getElementById('word-card');
    const wordText = document.getElementById('word-text');
    
    iAmSwiper = (data.swiperId === socket.id);
    document.getElementById('game-btns').classList.toggle('hidden', !iAmSwiper);

    if (data.activePlayerId === socket.id) {
        wordText.innerText = data.word;
        document.getElementById('role-text').innerText = "ОБЪЯСНЯЙ!";
    } else if (iAmSwiper) {
        wordText.innerText = "СЛУШАЙ И СВАЙПАЙ";
        document.getElementById('role-text').innerText = "ТЫ СУДЬЯ (УГАДЫВАЕШЬ)";
    } else {
        wordText.innerText = "СМОТРИ";
        document.getElementById('role-text').innerText = "Ход другой команды";
    }
    // // Сброс позиции карты
    card.style.transform = "translateX(0) rotate(0)";
});

// // ЛОГИКА СВАЙПА
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
        card.style.transform = `translateX(0) rotate(0)`;
    }
});

// // Таймер и счет
socket.on('alias-timer-tick', d => { document.getElementById('timer-val').innerText = `00:${d.timeLeft}`; });
socket.on('alias-update-score', d => { document.getElementById('score-val').innerText = d.score; });
