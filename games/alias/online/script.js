// // Соединение с сервером
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// // Глобальные переменные состояния
let currentRoom = localStorage.getItem('alias_room') || "";
let isHost = false;
let selectedTime = 60;
let totalRounds = 3;
let startX = 0;

// // Функция переключения экранов (скрывает старый, показывает новый)
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // Логика входа и создания игры
function createOnlineGame() {
    const n = document.getElementById('player-name').value;
    if(!n) return alert("Имя!");
    localStorage.setItem('alias_name', n);
    const id = Math.floor(1000 + Math.random()*9000).toString();
    socket.emit('alias-join', { roomId: id, playerName: n });
}

function joinOnlineGame() {
    const n = document.getElementById('player-name').value;
    const r = document.getElementById('room-id').value;
    if(!n || !r) return alert("Данные!");
    localStorage.setItem('alias_name', n);
    socket.emit('alias-join', { roomId: r, playerName: n });
}

// // Ответ сервера: Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby'); // // Прячем вход, показываем лобби
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

// // Логика игры и свайпов
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

function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect });
    card.style.transition = '0.4s';
    card.style.transform = isCorrect ? 'translateX(600px)' : 'translateX(-600px)';
    setTimeout(() => { card.style.transition = 'none'; card.style.transform = 'none'; }, 200);
}

// // Остальные события (таймер, новые слова, финал)
socket.on('alias-new-turn', data => {
    toScreen('screen-game'); // // Переход к игре
    document.getElementById('game-header').classList.remove('hidden');
    document.getElementById('word-display').innerText = data.word;
    document.getElementById('game-controls').classList.toggle('hidden', data.activePlayerId !== socket.id);
    card.style.borderColor = data.isMyTeam ? 'var(--mint)' : 'var(--purple)';
});

socket.on('alias-timer-tick', data => {
    document.getElementById('timer').innerText = `00:${data.timeLeft < 10 ? '0'+data.timeLeft : data.timeLeft}`;
});

socket.on('alias-game-over', data => {
    toScreen('screen-results'); // // Переход к результатам
    document.getElementById('final-results-list').innerHTML = `<h3>${data.winner} победили!</h3>`;
});

// // Вспомогательные функции
function renderPlayers(players, teams) {
    const list = document.getElementById('player-list');
    list.innerHTML = `<div class="team-box"><h4>${teams[1].name}</h4>${players.filter(p=>p.team===1).map(p=>p.name).join(', ')}</div>
                      <div class="team-box"><h4>${teams[2].name}</h4>${players.filter(p=>p.team===2).map(p=>p.name).join(', ')}</div>`;
}
function toggleOnlineRules(s) { document.getElementById('modal-online-rules').style.display = s ? 'flex' : 'none'; }
function updateRoundsDisplay(v) { document.getElementById('round-val').innerText = v; totalRounds = v; }
function setOnlineTime(t, el) { selectedTime = t; }
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(()=>0.5-Math.random());
    socket.emit('alias-start', { roomId: currentRoom, words, timer: selectedTime, maxRounds: totalRounds });
}
