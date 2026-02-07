const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ["polling"]
});

let myRoom = "";
let isMyTurn = false;
let timerId = null;

function startOnlineMode() {
    const room = document.getElementById('room-id').value.trim();
    if (room) {
        myRoom = room;
        socket.emit('join-room', room);
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    }
}

socket.on('init-state', (data) => {
    isMyTurn = data.isMyTurn;
    if (isMyTurn && !data.currentWord) updateCard(); 
    else if (data.currentWord) renderCard(data.currentWord, data.currentLetter);
    updateUI();
});

socket.on('game-event', (data) => {
    if (data.type === 'SYNC_CARD') {
        renderCard(data.word, data.letter);
        resetTimer();
    }
});

socket.on('turn-changed', (data) => {
    isMyTurn = (data.activePlayer === socket.id);
    updateUI();
    if (isMyTurn) updateCard();
});

function updateCard() {
    if (!isMyTurn) return;
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
        wordDisplay.style.filter = "blur(4px)";
    }
}

function updateUI() {
    const banner = document.getElementById('role-banner');
    const hostControls = document.getElementById('host-controls');
    const guestWait = document.getElementById('guest-wait');

    if (isMyTurn) {
        banner.innerText = "ТВОЙ ХОД: ОБЪЯСНЯЙ";
        banner.style.background = "#ff4757";
        hostControls.style.display = "flex";
        guestWait.style.display = "none";
    } else {
        banner.innerText = "ХОД ПАРТНЕРА: УГАДЫВАЙ";
        banner.style.background = "#2f3542";
        hostControls.style.display = "none";
        guestWait.style.display = "block";
    }
}

function handleResult(isWin) {
    if (!isMyTurn) return;
    // После нажатия кнопки передаем ход другому
    socket.emit('switch-turn', myRoom);
}

function resetTimer() {
    clearInterval(timerId);
    let timeLeft = 60;
    document.getElementById('timer').innerText = timeLeft;
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) clearInterval(timerId);
    }, 1000);
}
