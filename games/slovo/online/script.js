const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });

let myName = "", myRoom = "", isMyTurn = false;
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
        alert("Заполни имя и код!");
    }
}

socket.on('update-lobby', (data) => {
    const list = document.getElementById('online-players-list');
    list.innerHTML = data.players.map(p => `<li><strong>${p.name}</strong> ${p.id === socket.id ? "(ТЫ)" : ""}</li>`).join('');
    
    // Если ты первый в списке, ты — хост
    if (data.players[0].id === socket.id && !data.gameStarted) {
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('wait-msg').classList.add('hidden');
    }
});

function requestStart() {
    socket.emit('start-game', myRoom);
}

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
            wordEl.classList.remove('word-blur');
        } else {
            wordEl.innerText = "???";
            wordEl.classList.add('word-blur');
        }
        startTimer();
    }
});

function generateCard() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    socket.emit('game-action', {
        roomId: myRoom,
        data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
    });
}

function updateUI() {
    const banner = document.getElementById('role-banner');
    document.getElementById('host-controls').style.display = isMyTurn ? "flex" : "none";
    document.getElementById('guest-msg').style.display = isMyTurn ? "none" : "block";
    
    if (isMyTurn) {
        banner.innerText = "ТВОЙ ХОД: ОБЪЯСНЯЙ";
        banner.style.background = "#ff3e00";
    } else {
        banner.innerText = "СЛУШАЙ И УГАДЫВАЙ";
        banner.style.background = "#222";
    }
}

function handleWin() {
    // Здесь можно добавить socket.emit('add-score') если нужно
    socket.emit('switch-turn', myRoom);
}

function handleSkip() {
    socket.emit('switch-turn', myRoom);
}

function startTimer() {
    clearInterval(timerId);
    let time = 60;
    document.getElementById('timer').innerText = time;
    timerId = setInterval(() => {
        time--;
        document.getElementById('timer').innerText = time;
        if (time <= 0) clearInterval(timerId);
    }, 1000);
}
