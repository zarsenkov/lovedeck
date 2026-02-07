// Проверка на случай повторного объявления
if (typeof alphabet === 'undefined') {
    var alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
}

// Инициализация сокета
const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
    transports: ["polling"] 
});

var myName = "", myRoom = "", isMyTurn = false, timerId = null;

// Делаем функцию глобальной явно
window.joinLobby = function() {
    myName = document.getElementById('player-name').value.trim();
    myRoom = document.getElementById('room-id').value.trim();
    
    if (myName && myRoom) {
        socket.emit('join-room', { roomId: myRoom, playerName: myName });
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('lobby-screen').classList.remove('hidden');
        document.getElementById('room-display').innerText = myRoom;
    } else {
        alert("Введите имя и код комнаты!");
    }
};

socket.on('update-lobby', (data) => {
    const list = document.getElementById('online-players-list');
    if (list) {
        list.innerHTML = data.players.map(p => `<li>• <strong>${p.name}</strong> ${p.id === socket.id ? "(ВЫ)" : ""}</li>`).join('');
    }
    
    // Показываем кнопку старта только первому игроку
    const startBtn = document.getElementById('start-btn');
    const waitMsg = document.getElementById('wait-msg');
    if (data.players[0].id === socket.id && !data.gameStarted) {
        if (startBtn) startBtn.classList.remove('hidden');
        if (waitMsg) waitMsg.classList.add('hidden');
    }
});

window.requestStart = function() {
    socket.emit('start-game', myRoom);
};

socket.on('game-started', (data) => syncTurn(data));
socket.on('turn-changed', (data) => syncTurn(data));

function syncTurn(data) {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    isMyTurn = (socket.id === data.activePlayerId);
    document.getElementById('active-player-info').innerText = data.activePlayerName;
    
    updateUI();
    if (isMyTurn) generateCard();
}

socket.on('game-event', (data) => {
    if (data.type === 'SYNC_CARD') {
        const wordEl = document.getElementById('target-word');
        document.getElementById('target-letter').innerText = data.letter;
        document.getElementById('guest-letter').innerText = data.letter;
        
        if (isMyTurn) {
            wordEl.innerText = data.word;
            wordEl.style.filter = "none";
        } else {
            wordEl.innerText = "???";
            wordEl.style.filter = "blur(10px)";
        }
        startTimer();
    }
});

function generateCard() {
    if (typeof words === 'undefined') return;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    socket.emit('game-action', {
        roomId: myRoom,
        data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
    });
}

function updateUI() {
    const banner = document.getElementById('role-banner');
    const hostControls = document.getElementById('host-controls');
    const guestMsg = document.getElementById('guest-msg');

    if (isMyTurn) {
        banner.innerText = "ТВОЙ ХОД: ОБЪЯСНЯЙ";
        banner.style.background = "#ff3e00";
        hostControls.style.display = "flex";
        guestMsg.style.display = "none";
    } else {
        banner.innerText = "УГАДЫВАЙТЕ!";
        banner.style.background = "#000";
        hostControls.style.display = "none";
        guestMsg.style.display = "block";
    }
}

window.handleWin = function() {
    socket.emit('switch-turn', myRoom);
};

window.handleSkip = function() {
    socket.emit('switch-turn', myRoom);
};

function startTimer() {
    clearInterval(timerId);
    let time = 60;
    document.getElementById('timer').innerText = time;
    timerId = setInterval(() => {
        time--;
        document.getElementById('timer').innerText = time;
        if (time <= 0) {
            clearInterval(timerId);
            if (isMyTurn) socket.emit('switch-turn', myRoom);
        }
    }, 1000);
}
