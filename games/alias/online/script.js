// // Подключение
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoomId = "";
let iAmSwiper = false;
let startX = 0;

// // Смена экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Вход
function joinGame(isCreate) {
    const name = document.getElementById('player-name').value;
    const rInput = document.getElementById('room-input').value;
    if(!name) return alert("Имя!");
    currentRoomId = isCreate ? Math.floor(1000 + Math.random()*9000).toString() : rInput;
    socket.emit('alias-join', { roomId: currentRoomId, playerName: name });
}

// // Лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = data.roomId;
    const me = data.players.find(p => p.id === socket.id);
    if(me?.isHost) document.getElementById('host-ui').classList.remove('hidden');
    document.getElementById('lobby-teams').innerHTML = data.players.map(p => `<div>${p.name} (Т-${p.team})</div>`).join('');
});

// // КНОПКА НАЧАТЬ ИГРУ
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    const t = document.getElementById('set-timer').value;
    const r = document.getElementById('set-rounds').value;
    socket.emit('alias-start', { roomId: currentRoomId, words, timer: t, maxRounds: r });
}

// // Игровой процесс
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const card = document.getElementById('word-card');
    iAmSwiper = (data.swiperId === socket.id);
    
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
        document.getElementById('role-text').innerText = "Ход противника";
    }
});

// // СВАЙПЫ
const card = document.getElementById('word-card');
card.addEventListener('touchstart', e => { 
    if(!iAmSwiper) return;
    startX = e.touches[0].clientX; 
    card.style.transition = 'none';
}, {passive: true});

card.addEventListener('touchmove', e => {
    if(!iAmSwiper) return;
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/25}deg)`;
}, {passive: true});

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

// // Кнопки
function handleAction(isOk) {
    if(iAmSwiper) socket.emit('alias-action', { roomId: currentRoomId, isCorrect: isOk });
}

// // Таймер и Очки
socket.on('alias-timer-tick', d => { document.getElementById('timer-val').innerText = `00:${d.timeLeft < 10 ? '0'+d.timeLeft : d.timeLeft}`; });
socket.on('alias-update-score', d => { document.getElementById('score-val').innerText = d.score; });
socket.on('alias-prep-screen', d => { toScreen('screen-prep'); document.getElementById('prep-player-name').innerText = d.playerName; });
socket.on('alias-game-over', d => { toScreen('screen-results'); });
