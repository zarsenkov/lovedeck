(function() {
    const ALPHABET = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null, offlineTimerId = null;
    let gameActive = false, offlinePlayerName = "";

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

    window.requestStart = function() { socket.emit('start-game', myRoom); };
    window.handleWin = function() { socket.emit('switch-turn', myRoom, true); };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom, false); };

    socket.on('update-lobby', (data) => {
        gameActive = data.gameStarted;
        const list = document.getElementById('online-players-list');
        list.innerHTML = data.players.map(p => `<li>• ${p.name} [${p.score}] ${!p.online ? '⚠️' : ''}</li>`).join('');
        
        if (data.players[0]?.id === socket.id && !gameActive) {
            document.getElementById('start-btn').classList.remove('hidden');
        }
        if (data.players.every(p => p.online)) hideOverlay();
    });

    socket.on('player-offline', (data) => {
        if (gameActive) {
            offlinePlayerName = data.name;
            showOfflineOverlay();
        }
    });

    socket.on('hide-overlay', hideOverlay);

    function showOfflineOverlay() {
        document.getElementById('offline-overlay').style.display = 'flex';
        let timeLeft = 60;
        document.getElementById('wait-timer').innerText = timeLeft;
        clearInterval(offlineTimerId);
        offlineTimerId = setInterval(() => {
            timeLeft--;
            document.getElementById('wait-timer').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(offlineTimerId);
                skipOfflinePlayer();
            }
        }, 1000);
    }

    window.skipOfflinePlayer = function() {
        socket.emit('kick-player', myRoom, offlinePlayerName);
        hideOverlay();
    };

    function hideOverlay() {
        document.getElementById('offline-overlay').style.display = 'none';
        clearInterval(offlineTimerId);
    }

    socket.on('game-started', syncTurn);
    socket.on('turn-changed', syncTurn);

    function syncTurn(data) {
        gameActive = true;
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        hideOverlay();

        isMyTurn = (socket.id === data.activePlayerId);
        document.getElementById('role-banner').innerText = `КРУГ ${data.currentRound}/${data.maxRounds} | ВЕДУЩИЙ: ${data.activePlayerName}`;
        
        document.getElementById('host-controls').style.display = isMyTurn ? "flex" : "none";
        document.getElementById('guest-msg').style.display = isMyTurn ? "none" : "block";
        
        if (isMyTurn) generateCard();
    }

    socket.on('game-event', (data) => {
        const wordEl = document.getElementById('target-word');
        const lettersEl = document.getElementById('target-letters');
        if (isMyTurn) {
            wordEl.innerText = data.word;
            wordEl.style.filter = "none";
            lettersEl.innerText = data.letters.join(' ');
        } else {
            wordEl.innerText = "???";
            wordEl.style.filter = "blur(8px)";
            lettersEl.innerText = "? ? ?";
        }
        startTimer();
    });

    function generateCard() {
        const letters = [];
        for(let i=0; i<3; i++) letters.push(ALPHABET[Math.floor(Math.random()*ALPHABET.length)]);
        const word = words[Math.floor(Math.random()*words.length)];
        socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC_CARD', word, letters } });
    }

    function startTimer() {
        clearInterval(timerId);
        let time = 60;
        document.getElementById('timer').innerText = time;
        timerId = setInterval(() => {
            time--;
            document.getElementById('timer').innerText = time;
            if (time <= 0 && isMyTurn) handleSkip();
        }, 1000);
    }

    socket.on('game-over', (data) => {
        gameActive = false;
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        const sorted = data.players.sort((a,b) => b.score - a.score);
        document.getElementById('final-stats').innerHTML = sorted.map(p => 
            `<div style="display:flex; justify-content:space-between; margin:5px 0;">
                <span>${p.name}</span><strong>${p.score}</strong>
            </div>`
        ).join('');
    });
})();
