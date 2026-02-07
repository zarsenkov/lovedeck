(function() {
    const ALPHABET = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;
    let gameActive = false;

    window.closeOverlay = function() {
        document.getElementById('offline-overlay').style.display = 'none';
    };

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
        socket.emit('set-rounds', { roomId: myRoom, rounds: document.getElementById('rounds-count').value });
    };

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    socket.on('update-lobby', (data) => {
        gameActive = data.gameStarted;
        const list = document.getElementById('online-players-list');
        if (list) {
            list.innerHTML = data.players.map(p => `<li>• ${p.name} [${p.score || 0}]</li>`).join('');
        }
        if (data.players[0] && data.players[0].id === socket.id && !gameActive) {
            document.getElementById('start-btn').classList.remove('hidden');
        }
        if (!gameActive || data.players.every(p => p.online)) window.closeOverlay();
    });

    socket.on('player-offline', (data) => {
        if (gameActive) {
            document.getElementById('offline-msg').innerText = `${data.name} ВЫШЕЛ`;
            document.getElementById('offline-overlay').style.display = 'flex';
        }
    });

    socket.on('game-started', syncTurn);
    socket.on('turn-changed', syncTurn);

    function syncTurn(data) {
        gameActive = true;
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        window.closeOverlay();

        isMyTurn = (socket.id === data.activePlayerId);
        document.getElementById('role-banner').innerText = `КРУГ ${data.currentRound}/${data.maxRounds} | ХОД: ${data.activePlayerName}`;
        document.getElementById('active-player-info').innerText = data.activePlayerName;

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
                wordEl.style.opacity = "1";
                letterEl.innerText = data.letter;
            } else {
                wordEl.innerText = "???";
                wordEl.style.filter = "blur(10px)";
                wordEl.style.opacity = "0.3";
                letterEl.innerText = "?";
            }
            startTimer();
        }
    });

    function generateCard() {
        if (typeof words === 'undefined') return;
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        socket.emit('game-action', {
            roomId: myRoom,
            data: { type: 'SYNC_CARD', word: randomWord, letter: randomLetter }
        });
    }

    function updateUI() {
        document.getElementById('host-controls').style.display = isMyTurn ? "flex" : "none";
        document.getElementById('guest-msg').style.display = isMyTurn ? "none" : "block";
        document.getElementById('role-banner').style.background = isMyTurn ? "#ff3e00" : "#000";
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

    socket.on('game-over', (data) => {
        gameActive = false;
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        
        const stats = document.getElementById('final-stats');
        const sorted = [...data.players].sort((a,b) => b.score - a.score);
        stats.innerHTML = sorted.map(p => `
            <div class="res-item">
                <span>${p.name}</span>
                <strong>${p.score || 0} очков</strong>
            </div>
        `).join('');
    });
})();
