(function() {
    const ALPHABET_ONLINE = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling"],
        reconnection: true
    });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;
    let gameActive = false; // Строгий флаг состояния игры

    // 1. Принудительная очистка при старте
    window.closeOverlay = function() {
        const overlay = document.getElementById('offline-overlay');
        if (overlay) overlay.classList.add('hidden');
    };

    // Прячем всё сразу при загрузке скрипта
    window.closeOverlay();

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if (myName && myRoom) {
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('lobby-screen').classList.remove('hidden');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    window.updateRoundsConfig = function() {
        const r = document.getElementById('rounds-count').value;
        socket.emit('set-rounds', { roomId: myRoom, rounds: r });
    };

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    // 2. Логика Socket.io
    socket.on('update-lobby', (data) => {
        // Синхронизируем статус игры с сервером
        gameActive = data.gameStarted; 

        const list = document.getElementById('online-players-list');
        if (list) {
            list.innerHTML = data.players.map(p => `
                <li style="${!p.online ? 'color: red; opacity: 0.5;' : ''}">
                    • <strong>${p.name}</strong> ${!p.online ? "[OFFLINE]" : ""}
                </li>
            `).join('');
        }

        // Если все в сети ИЛИ игра еще не начата — плашка НЕ ДОЛЖНА висеть
        const anyoneOffline = data.players.some(p => !p.online);
        if (!gameActive || !anyoneOffline) {
            window.closeOverlay();
        }
    });

    socket.on('player-offline', (data) => {
        // Показываем плашку только если раунд в процессе
        if (gameActive) {
            document.getElementById('offline-msg').innerText = `${data.name} ВЫШЕЛ`;
            document.getElementById('offline-overlay').classList.remove('hidden');
        }
    });

    socket.on('game-started', (data) => {
        gameActive = true;
        syncTurn(data);
    });

    socket.on('turn-changed', (data) => {
        gameActive = true;
        syncTurn(data);
    });

    socket.on('game-over', () => {
        gameActive = false;
        window.closeOverlay();
        alert("ФИНАЛ ИГРЫ!");
        location.reload();
    });

    function syncTurn(data) {
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        window.closeOverlay(); // Убираем плашку при смене хода
        
        isMyTurn = (socket.id === data.activePlayerId);
        document.getElementById('role-banner').innerText = `КРУГ ${data.currentRound}/${data.maxRounds} | ВЕЩАЕТ: ${data.activePlayerName}`;
        
        updateUI();
        if (isMyTurn) generateCard();
    }

    // 3. Остальные функции
    socket.on('game-event', (data) => {
        if (data.type === 'SYNC_CARD') {
            const wordEl = document.getElementById('target-word');
            const letterEl = document.getElementById('target-letter');
            if (isMyTurn) {
                wordEl.innerText = data.word;
                wordEl.style.filter = "none";
                letterEl.innerText = data.letter;
            } else {
                wordEl.innerText = "???";
                wordEl.style.filter = "blur(10px)";
                letterEl.innerText = "?";
            }
            startTimer();
        }
    });

    function generateCard() {
        if (typeof words === 'undefined') return;
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const randomLetter = ALPHABET_ONLINE[Math.floor(Math.random() * ALPHABET_ONLINE.length)];
        socket.emit('game-action', {
            roomId: myRoom,
            data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
        });
    }

    function updateUI() {
        const isHost = isMyTurn;
        document.getElementById('host-controls').style.display = isHost ? "flex" : "none";
        document.getElementById('guest-msg').style.display = isHost ? "none" : "block";
        document.getElementById('role-banner').style.background = isHost ? "#ff3e00" : "#000";
    }

    window.handleWin = function() { socket.emit('switch-turn', myRoom); };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom); };

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
