const socket = io("https://amvera-zarsenkov-run-lovecouple-server.amvera.io", {
    transports: ["polling", "websocket"] 
});

let isOnline = false;
let myRoom = "";

let players = [];
let currentPlayerIndex = 0;
let score = 0;
let timeLeft = 60;
let timerId = null;

// ОНЛАЙН: Слушаем сервер (если партнер сменил карту или начал игру)
socket.on('game-event', (data) => {
    if (data.type === 'SYNC_CARD') {
        // 1. Обновляем текст на экране
        document.getElementById('target-word').innerText = data.word;
        document.getElementById('target-letter').innerText = data.letter;
        
        // 2. Если партнер нажал "Старт", а у нас еще висит меню — переключаем экран
        if (!document.getElementById('setup-screen').classList.contains('hidden')) {
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
        }
        console.log("Карточка синхронизирована!");
    }
});

function startOnlineMode() {
    const roomInput = document.getElementById('room-id');
    const room = roomInput.value.trim(); // Берем текст из поля
    
    if (room) {
        myRoom = room;
        isOnline = true;
        socket.emit('join-room', room);
        
        // Визуальное подтверждение
        roomInput.style.borderColor = "#44ff44";
        roomInput.disabled = true;
        alert("ВЫ В СЕТИ! Теперь партнер должен ввести этот же код: " + room);
    } else {
        alert("Сначала введи код комнаты!");
    }
}

function addPlayer() {
    const input = document.getElementById('player-name');
    const name = input.value.trim();
    if (name) {
        players.push({ name: name, score: 0 });
        const li = document.createElement('li');
        const randomRot = (Math.random() * 4 - 2).toFixed(1);
        li.style.setProperty('--r', randomRot);
        li.innerText = `>> ${name}`;
        document.getElementById('players-list').appendChild(li);
        input.value = '';
        if (players.length >= 1) document.getElementById('start-game-btn').style.display = 'block';
    }
}

function backToSetup() {
    clearInterval(timerId);
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

function startTurn() {
    if (currentPlayerIndex >= players.length) {
        showResults();
        return;
    }
    
    score = 0;
    timeLeft = 60;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    document.getElementById('active-player-name').innerText = players[currentPlayerIndex].name;
    document.getElementById('timer').innerText = timeLeft;
    
    // При старте хода генерируем карту
    updateCard();
    
    clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) endTurn();
    }, 1000);
}

// МОДИФИЦИРОВАННАЯ ФУНКЦИЯ: меняет карту и отправляет её партнеру
function updateCard() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    
    document.getElementById('target-word').innerText = randomWord;
    document.getElementById('target-letter').innerText = randomLetter;

    // ОНЛАЙН: отправка данных
    if (isOnline) {
        socket.emit('game-action', {
            roomId: myRoom,
            data: {
                type: 'SYNC_CARD',
                word: randomWord,
                letter: randomLetter
            }
        });
    }
}

function handleResult(isWin) {
    if (isWin) score++;
    updateCard();
}

function endTurn() {
    clearInterval(timerId);
    players[currentPlayerIndex].score = score;
    currentPlayerIndex++;
    
    if (currentPlayerIndex < players.length) {
        alert(`СТОП! ${players[currentPlayerIndex-1].name} набрал(а) ${score} очков. Следующий на очереди: ${players[currentPlayerIndex].name}`);
        startTurn();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const statsDiv = document.getElementById('final-stats');
    const sorted = [...players].sort((a, b) => b.score - a.score);
    statsDiv.innerHTML = sorted.map(p => `
        <div class="res-item">
            <strong>${p.name}</strong>: ${p.score} ОЧКОВ
        </div>
    `).join('');
}

document.getElementById('start-game-btn').addEventListener('click', startTurn);









