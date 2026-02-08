// // Подключаем сокеты
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoom = "";

// // ФУНКЦИЯ: Скрывает все экраны и показывает один нужный
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // ФУНКЦИЯ: Создать комнату
function createOnlineGame() {
    const n = document.getElementById('player-name').value;
    if(!n) return alert("Имя!");
    const id = Math.floor(1000 + Math.random()*9000).toString();
    socket.emit('alias-join', { roomId: id, playerName: n });
}

// // ФУНКЦИЯ: Войти в комнату
function joinOnlineGame() {
    const n = document.getElementById('player-name').value;
    const r = document.getElementById('room-id').value;
    if(!n || !r) return alert("Заполни!");
    socket.emit('alias-join', { roomId: r, playerName: n });
}

// // СОБЫТИЕ: Сервер обновил лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby'); // // ПЕРЕКЛЮЧАЕМ ЭКРАН
    currentRoom = data.roomId;
    document.getElementById('display-room-id').innerText = currentRoom;
    
    // // Отрисовка списка команд через твои .team-box
    const list = document.getElementById('player-list');
    list.innerHTML = `
        <div class="team-box"><h4>КОМАНДА 1</h4>${data.players.filter(p=>p.team===1).map(p=>p.name).join(', ')}</div>
        <div class="team-box"><h4>КОМАНДА 2</h4>${data.players.filter(p=>p.team===2).map(p=>p.name).join(', ')}</div>
    `;

    // // Если ты хост — покажи кнопку старта
    const me = data.players.find(p => p.id === socket.id);
    if(me?.isHost) {
        document.getElementById('start-btn-online').classList.remove('hidden');
        document.getElementById('wait-msg').classList.add('hidden');
    }
});

// // ФУНКЦИЯ: Старт (для хоста)
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(()=>0.5-Math.random());
    socket.emit('alias-start', { roomId: currentRoom, words, timer: 60, maxRounds: 3 });
}

// // СОБЫТИЕ: Новое слово / начало хода
socket.on('alias-new-turn', data => {
    toScreen('screen-game'); // // ПЕРЕКЛЮЧАЕМ ЭКРАН
    document.getElementById('word-display').innerText = data.word;
    
    // // Показываем кнопки управления только тому, кто сейчас объясняет
    const isMe = data.activePlayerId === socket.id;
    document.getElementById('game-controls').classList.toggle('hidden', !isMe);
});

// // ФУНКЦИЯ: Нажатие УГАДАНО / ПРОПУСК
function handleOnlineWord(isCorrect) {
    socket.emit('alias-action', { roomId: currentRoom, isCorrect });
}

// // СОБЫТИЕ: Таймер
socket.on('alias-timer-tick', data => {
    document.getElementById('timer').innerText = `00:${data.timeLeft < 10 ? '0'+data.timeLeft : data.timeLeft}`;
});
