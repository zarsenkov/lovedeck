(function() {
    const ALPHABET_ONLINE = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling"],
        reconnection: true,
        reconnectionAttempts: 10
    });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;
    let gameInProgress = false; 

    // СРАЗУ ПРЯЧЕМ ОВЕРЛЕЙ ПРИ ЗАГРУЗКЕ
    window.addEventListener('load', () => {
        const overlay = document.getElementById('offline-overlay');
        if (overlay) overlay.classList.add('hidden');
    });

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

    window.updateRoundsConfig = function() {
        const r = document.getElementById('rounds-count').value;
        socket.emit('set-rounds', { roomId: myRoom, rounds: r });
    };

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    window.handleWin = function() { socket.emit('switch-turn', myRoom); };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom); };
    
    window.closeOverlay = function() {
        const overlay = document.getElementById('offline-overlay');
        if (overlay) overlay.classList.add('hidden');
    };

    socket.on('update-lobby', (data) => {
        gameInProgress = data.gameStarted; 
        const list = document.getElementById('online-players-list');

        if (list) {
            list.innerHTML = data.players.map(p => `
                <li style="${!p.online ? 'color: red; text-decoration: line-through;' : ''}">
                    • <strong>${p.name}</strong> ${p.id === socket.id ? "(ВЫ)" : ""} 
                    ${!p.online ? "[ВЫЛЕТЕЛ]" : ""}
                </li>
            `).join('');
        }
        
        const roundInput = document.getElementById('rounds-count');
        if (roundInput) roundInput.value = data.maxRounds;

        const startBtn = document.getElementById('start-btn');
        if (data.players[0] && data.players[0].id === socket.id && !data.gameStarted) {
            startBtn.classList.remove('hidden');
        }

        // Если игра не идет или все в сети — скрываем плашку
        const allOnline = data.players.every(p => p.online);
        if (!gameInProgress || allOnline) {
            window.closeOverlay();
        }
    });

    socket.on('player-offline', (data) => {
        // Показываем плашку ТОЛЬКО если игра активна
        if (gameInProgress) {
            const msg = document.getElementById('offline-msg');
            const overlay = document.getElementById('offline-overlay');
            if (msg) msg.innerText = `${data.name} ПОТЕРЯЛ СВЯЗЬ`;
            if (overlay) overlay.classList.remove('hidden');
        }
    });

    socket.on('game-started', (data) => {
        gameInProgress = true;
        syncTurn(data);
    });

    socket.on('turn-changed', syncTurn);

    socket.on('game-over', (data) => {
        gameInProgress = false;
        alert("ИГРА ОКОНЧЕНА! Все раунды пройдены.");
        location.reload(); 
    });

    function syncTurn(data) {
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        window.closeOverlay();
        
        isMyTurn = (socket.id === data.activePlayerId);
        const banner = document.getElementById('role-banner');
        if (banner) {
            banner.innerText = `КРУГ ${data.currentRound}/${data.maxRounds} | ВЕЩАЕТ: ${data.activePlayerName}`;
        }
        
        const info = document.getElementById('active-player-info');
        if (info) info.innerText = data.activePlayerName;
        
        updateUI();
        if (isMyTurn) generateCard();
    }

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
        const hostControls = document.getElementById('host-controls');
        const guestMsg = document.getElementById('guest-msg');
        const banner = document.getElementById('role-banner');

        if (isMyTurn) {
            if (banner) banner.style.background = "#ff3e00";
            if (hostControls) hostControls.style.display = "flex";
            if (guestMsg) guestMsg.style.display = "none";
        } else {
            if (banner) banner.style.background = "#000";
            if (hostControls) hostControls.style.display = "none";
            if (guestMsg) guestMsg.style.display = "block";
        }
    }

    function startTimer() {
        clearInterval(timerId);
        let time = 60;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.innerText = time;
        timerId = setInterval(() => {
            time--;
            if (timerEl) timerEl.innerText = time;
            if (time <= 0) {
                clearInterval(timerId);
                if (isMyTurn) window.handleSkip();
            }
        }, 1000);
    }
})();
