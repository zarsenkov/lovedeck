(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling", "websocket"] 
    });

    let myName, myRoom, isMyTurn = false, timerInterval;
    let wakeLock = null;

    // Работа с карточками
    function getNewData() {
        try {
            let word = "СЛОВО", letters = "? ? ?";
            if (window.cards && Array.isArray(window.cards)) {
                const card = window.cards[Math.floor(Math.random() * window.cards.length)];
                word = card.word || card;
                letters = card.letters || "";
            } else if (window.CATEGORIES) {
                const cats = Object.keys(window.CATEGORIES);
                const words = window.CATEGORIES[cats[Math.floor(Math.random() * cats.length)]];
                word = words[Math.floor(Math.random() * words.length)];
                letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ"[Math.floor(Math.random() * 27)];
            }
            return { word: word.toUpperCase(), letters: letters.toUpperCase() };
        } catch (e) { return { word: "ОШИБКА", letters: "!" }; }
    }

    async function requestWakeLock() {
        if ('wakeLock' in navigator) { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} }
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if(target) target.classList.add('active');
    }

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if(myName && myRoom) {
            document.getElementById('offline-overlay').style.display = 'none';
            requestWakeLock();
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `<li>${p.name}: <b>${p.score}</b> ${p.online ? '🌐' : '🔴'}</li>`).join('');
        const startBtn = document.getElementById('start-btn');
        if(data.players[0] && data.players[0].id === socket.id && !data.gameStarted) {
            startBtn.style.display = 'block';
            startBtn.classList.remove('hidden');
        } else {
            startBtn.style.display = 'none';
        }
    });

    window.requestStart = function() { socket.emit('start-game', myRoom); };

    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        document.getElementById('action-controls').style.display = isMyTurn ? 'none' : 'grid';
        document.getElementById('observer-msg').style.display = isMyTurn ? 'block' : 'none';
        document.getElementById('role-banner').innerText = isMyTurn ? "ТВОЙ ХОД" : `ОБЪЯСНЯЕТ: ${data.activePlayerName}`;
        if (isMyTurn) nextWord();
        startTimer(90);
    });

    function nextWord() {
        const d = getNewData();
        socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC_GAME', word: d.word, letters: d.letters } });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_GAME') {
            const wordEl = document.getElementById('current-word');
            wordEl.innerText = data.word;
            document.getElementById('target-letters').innerText = data.letters;
            wordEl.style.filter = isMyTurn ? "blur(15px)" : "none";
        }
        if(data.type === 'NEXT_WORD_REQ' && isMyTurn) nextWord();
    });

    window.handleWin = function() {
        socket.emit('add-point', myRoom);
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    window.handleSkip = function() {
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    function startTimer(sec) {
        clearInterval(timerInterval);
        let timeLeft = sec;
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('timer-display').innerText = timeLeft;
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                if(isMyTurn) socket.emit('switch-turn', myRoom);
            }
        }, 1000);
    }

    socket.on('player-offline', (data) => {
        const gameActive = document.getElementById('game-screen').classList.contains('active');
        if (gameActive) {
            const overlay = document.getElementById('offline-overlay');
            overlay.style.display = 'flex';
            document.getElementById('offline-msg').innerText = `${data.name} ВЫЛЕТЕЛ`;
        }
    });

    socket.on('hide-overlay', () => { document.getElementById('offline-overlay').style.display = 'none'; });

    socket.on('game-over', (data) => {
        showScreen('result-screen');
        const sorted = [...data.players].sort((a,b) => b.score - a.score);
        document.getElementById('final-stats').innerHTML = `<h2>${sorted[0].name} ПОБЕДИЛ!</h2>` + 
            sorted.map(p => `<p>${p.name}: ${p.score}</p>`).join('');
    });
})();;
