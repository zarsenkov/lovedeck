const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ["polling"]
});

let myRoom = "";
let isMyTurn = false;
let timerId = null;
const alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";

function startOnlineMode() {
    const roomInput = document.getElementById('room-id').value.trim();
    if (roomInput) {
        myRoom = roomInput;
        socket.emit('join-room', myRoom);
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    }
}

socket.on('init-state', (data) => {
    isMyTurn = data.isMyTurn;
    if (isMyTurn && !data.currentWord) {
        generateNewCard(); 
    } else if (data.currentWord) {
        renderCard(data.currentWord, data.currentLetter);
    }
    updateUI();
});

socket.on('game-event', (data) => {
    if (data.type === 'SYNC_CARD') {
        renderCard(data.word, data.letter);
        startTimer();
    }
});

socket.on('turn-changed', (data) => {
    isMyTurn = (data.activePlayer === socket.id);
    updateUI();
    if (isMyTurn) generateNewCard();
});

function generateNewCard() {
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
        wordDisplay.style.filter = "blur(8px)"; 
    }
}

function updateUI() {
    const banner = document.getElementById('role-banner');
    const controls = document.getElementById('host-controls');
    const guestMsg = document.getElementById('guest-msg');

    if (isMyTurn) {
        banner.innerText = "ТВОЙ ХОД: ОБЪЯСНЯЙ";
        banner.style.background = "#ff3e00";
        controls.style.display = "flex";
        guestMsg.style.display = "none";
    } else {
        banner.innerText = "ХОД ПАРТНЕРА: УГАДЫВАЙ";
        banner.style.background = "#222";
        controls.style.display = "none";
        guestMsg.style.display = "block";
    }
}

function handleOnlineResult(isWin) {
    if (isMyTurn) socket.emit('switch-turn', myRoom);
}

function startTimer() {
    clearInterval(timerId);
    let timeLeft = 60;
    document.getElementById('timer').innerText = timeLeft;
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            if (isMyTurn) socket.emit('switch-turn', myRoom);
        }
    }, 1000);
}
