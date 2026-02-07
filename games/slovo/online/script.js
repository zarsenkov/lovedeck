// Используем самоисполняющуюся функцию, чтобы избежать конфликтов имен
(function() {
    // 1. Объявляем алфавит так, чтобы он не конфликтовал
    const ALPHABET_ONLINE = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";

    // 2. Инициализация сокета
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling"] 
    });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;

    // 3. Явно привязываем функции к window, чтобы onclick в HTML их нашел
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

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    window.handleWin = function() {
        socket.emit('switch-turn', myRoom);
    };

    window.handleSkip = function() {
        socket.emit('switch-turn', myRoom);
    };

    // 4. Логика обработки событий
    socket.on('update-lobby', (data) => {
        const list = document.getElementById('online-players-list');
        if (list) {
            list.innerHTML = data.players.map(p => `<li>• <strong>${p.name}</strong> ${p.id === socket.id ? "(ВЫ)" : ""}</li>`).join('');
        }
        
        const startBtn = document.getElementById('start-btn');
        const waitMsg = document.getElementById('wait-msg');
        if (data.players[0].id === socket.id && !data.gameStarted) {
            if (startBtn) startBtn.classList.remove('hidden');
            if (waitMsg) waitMsg.classList.add('hidden');
        }
    });

    socket.on('game-started', syncTurn);
    socket.on('turn-changed', syncTurn);

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
        if (typeof words === 'undefined') {
            console.error("База слов cards.js не загружена!");
            return;
        }
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const randomLetter = ALPHABET_ONLINE[Math.floor(Math.random() * ALPHABET_ONLINE.length)];
        socket.emit('game-action', {
            roomId: myRoom,
            data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
        });
    }

    function updateUI() {
        const banner = document.getElementById('role-banner');
        if (isMyTurn) {
            banner.innerText = "ТВОЙ ХОД: ОБЪЯСНЯЙ";
            banner.style.background = "#ff3e00";
            document.getElementById('host-controls').style.display = "flex";
            document.getElementById('guest-msg').style.display = "none";
        } else {
            banner.innerText = "УГАДЫВАЙТЕ!";
            banner.style.background = "#000";
            document.getElementById('host-controls').style.display = "none";
            document.getElementById('guest-msg').style.display = "block";
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
                if (isMyTurn) window.handleSkip();
            }
        }, 1000);
    }
})();
