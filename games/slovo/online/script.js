// Инициализация сокета
const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ["polling"]
});

var onlineAlphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
var myRoom = "";
var isMyTurn = false;
var timerId = null;

// Эта функция теперь точно видна из HTML
function startOnlineMode() {
    const roomInput = document.getElementById('room-id');
    if (roomInput && roomInput.value.trim() !== "") {
        myRoom = roomInput.value.trim();
        socket.emit('join-room', myRoom);
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    } else {
        alert("Пожалуйста, введите код комнаты");
    }
}

socket.on('init-state', (data) => {
    isMyTurn = data.isMyTurn;
    if (isMyTurn && !data.currentWord) {
        generateNewOnlineCard(); 
    } else if (data.currentWord) {
        renderOnlineCard(data.currentWord, data.currentLetter);
    }
    updateOnlineUI();
});

socket.on('game-event', (data) => {
    if (data.type === 'SYNC_CARD') {
        renderOnlineCard(data.word, data.letter);
        startOnlineTimer();
    }
});

socket.on('turn-changed', (data) => {
    isMyTurn = (data.activePlayer === socket.id);
    updateOnlineUI();
    if (isMyTurn) generateNewOnlineCard();
});

function generateNewOnlineCard() {
    if (typeof words === 'undefined') return;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLetter = onlineAlphabet[Math.floor(Math.random() * onlineAlphabet.length)];
    
    socket.emit('game-action', {
        roomId: myRoom,
        data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
    });
}

function renderOnlineCard(word, letter) {
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

function updateOnlineUI() {
    const banner = document.getElementById('role-banner');
    const controls = document.getElementById('host-controls');
    const guestMsg = document.getElementById('guest-msg');

    if (isMyTurn) {
        banner.innerText = "ВЫ ОБЪЯСНЯЕТЕ";
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

function handleOnlineResult() {
    if (isMyTurn) socket.emit('switch-turn', myRoom);
}

function startOnlineTimer() {
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
