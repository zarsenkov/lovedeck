const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ["polling"]
});

let myName = "";
let myRoom = "";
let isMyTurn = false;
let timerId = null;
const alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";

function joinLobby() {
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
}

// Обновление лобби
socket.on('update-lobby', (data) => {
    const list = document.getElementById('online-players-list');
    list.innerHTML = data.players.map(p => `<li>• ${p.name} ${p.id === socket.id ? "(ВЫ)" : ""}</li>`).join('');
    
    // Если ты первый в списке (хост), показываем кнопку старта
    if (data.players[0].id === socket.id && !data.gameStarted) {
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('wait-msg').classList.add('hidden');
    }
});

function requestStart() {
    socket.emit('start-game', myRoom);
}

socket.on('game-started', (data) => {
    goToGame(data.activePlayerId, data.activePlayerName);
});

socket.on('turn-changed', (data) => {
    goToGame(data.activePlayerId, data.activePlayerName);
});

socket.on('game-event', (data) => {
    if (data.type === 'SYNC_CARD') {
        renderCard(data.word, data.letter);
        startTimer();
    }
});

function goToGame(activeId, activeName) {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    isMyTurn = (socket.id === activeId);
    document.getElementById('active-player-info').innerText = activeName;
    
    updateUI();
    
    // Если мой ход, генерирую карту для всех
    if (isMyTurn) {
        generateCard();
    }
}

function generateCard() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    
    socket.emit('game-action', {
        roomId: myRoom,
        data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
    });
}

function renderCard(word, letter) {
    document.getElementById('target-letter').innerText = letter;
    const wordDisplay = document.getElementById('target-word');
    
    if (isMyTurn) {
        wordDisplay.innerText = word;
        wordDisplay.style.filter = "none";
    } else {
        wordDisplay.innerText = "???";
        wordDisplay.style.filter = "blur(10px)";
    }
}

function updateUI() {
    const banner = document.getElementById('role-banner');
    const controls = document.getElementById('host-controls');
    const guestMsg = document.getElementById('guest-msg');

    if (isMyTurn) {
        banner.innerText = "ВЫ ВЕЩАЕТЕ";
        banner.style.background = "#ff3e00";
        controls.style.display = "flex";
        guestMsg.style.display = "none";
    } else {
        banner.innerText = "ВЫ УГАДЫВАЕТЕ";
        banner.style.background = "#222";
        controls.style.display = "none";
        guestMsg.style.display = "block";
    }
}

function handleOnlineAction() {
    if (isMyTurn) {
        socket.emit('switch-turn', myRoom);
    }
}

function startTimer() {
    clearInterval(timerId);
    let time = 60;
    document.getElementById('timer').innerText = time;
    timerId = setInterval(() => {
        time--;
        document.getElementById('timer').innerText = time;
        if (time <= 0) {
            clearInterval(timerId);
            if (isMyTurn) handleOnlineAction();
        }
    }, 1000);
}
