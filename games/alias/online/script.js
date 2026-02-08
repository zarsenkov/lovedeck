// // Подключение к серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Состояние игры
let currentRoom = localStorage.getItem('alias_room') || "";
let isHost = false;
let selectedTime = 60;
let totalRounds = 3;
let startX = 0;

// // Функция: Переключение экранов (Убирает .active у всех, ставит одному)
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Создание игры
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if(!name) return alert("Введите имя!");
    localStorage.setItem('alias_name', name);
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    socket.emit('alias-join', { roomId, playerName: name });
}

// // Вход в игру
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    if(!name || !room) return alert("Заполните все поля!");
    localStorage.setItem('alias_name', name);
    socket.emit('alias-join', { roomId: room, playerName: name });
}

// // Событие: Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby'); // // Переключаемся на экран лобби
    currentRoom = data.roomId;
    document.getElementById('display-room-id').innerText = currentRoom;
    
    const me = data.players.find(p => p.id === socket.id);
    isHost = me?.isHost || false;
    
    if(isHost) {
        document.getElementById('host-settings').classList.remove('hidden');
        document.getElementById('start-btn-online').classList.remove('hidden');
        document.getElementById('wait-msg').classList.add('hidden');
    }
    renderPlayers(data.players, data.teams);
});

// // Логика свайпов карточки
const card = document.getElementById('main-card');
card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; card.style.transition = 'none'; });
card.addEventListener('touchmove', e => {
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
});
card.addEventListener('touchend', e => {
    let diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 120) handleOnlineWord(diff > 0);
    else { card.style.transition = '0.3s'; card.style.transform = 'none'; }
});

// // Обработка ответа
function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect });
    card.style.transition = '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = isCorrect ? 'translateX(600px) rotate(30deg)' : 'translateX(-600px) rotate(-30deg)';
    setTimeout(() => { 
        card.style.transition = 'none'; 
        card.style.transform = 'none'; 
    }, 250);
}

// // Событие: Начало хода (новое слово)
socket.on('alias-new-turn', data => {
    toScreen('screen-game'); // // Переключаемся на экран игры
    document.getElementById('game-header').classList.remove('hidden');
    document.getElementById('word-display').innerText = data.word;
    document.getElementById('game-controls').classList.toggle('hidden', data.activePlayerId !== socket.id);
    card.style.borderColor = data.isMyTeam ? 'var(--mint)' : 'var(--purple)';
});

// // Таймер и счет
socket.on('alias-timer-tick', data => {
    document.getElementById('timer').innerText = `00:${data.timeLeft < 10 ? '0'+data.timeLeft : data.timeLeft}`;
});

socket.on('alias-update-score', data => {
    document.getElementById('live-score').innerText = data.score;
});

// // Финал игры
socket.on('alias-game-over', data => {
    toScreen('screen-results');
    document.getElementById('game-header').classList.add('hidden');
    document.getElementById('final-results-list').innerHTML = `
        <h3 style="color:var(--purple)">Победили: ${data.winner}</h3>
        <p>${data.team1Name}: ${data.team1Score}</p>
        <p>${data.team2Name}: ${data.team2Score}</p>
    `;
    localStorage.removeItem('alias_room');
});

// // Вспомогательные функции
function renderPlayers(players, teams) {
    const list = document.getElementById('player-list');
    list.innerHTML = `
        <div class="team-box"><h4>${teams[1].name}</h4>${players.filter(p=>p.team===1).map(p=>p.name).join(', ')}</div>
        <div class="team-box"><h4>${teams[2].name}</h4>${players.filter(p=>p.team===2).map(p=>p.name).join(', ')}</div>
    `;
}

function toggleOnlineRules(show) {
    document.getElementById('modal-online-rules').classList.toggle('hidden', !show);
}

function updateRoundsDisplay(v) {
    document.getElementById('round-val').innerText = v;
    totalRounds = v;
}

function setOnlineTime(t, el) {
    selectedTime = t;
    document.querySelectorAll('.chip').forEach(c => c.style.background = '#fff');
    el.style.background = 'var(--purple)';
    el.style.color = '#fff';
}

function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { roomId: currentRoom, words, timer: selectedTime, maxRounds: totalRounds });
}
