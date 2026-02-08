(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });
    let myName, myRoom, isMyTurn = false, gamePool = [], timerInterval;
    let wakeLock = null;

    // Функция против засыпания экрана
    async function requestWakeLock() {
        try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
    }

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if(myName && myRoom) {
            requestWakeLock();
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `<li>${p.name}: ${p.score} ${p.online ? '🌐' : '🔴'}</li>`).join('');
        if(data.players[0].id === socket.id) document.getElementById('start-btn').style.display = 'block';
    });

    window.requestStart = function() { socket.emit('start-game', myRoom); };

    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        // КНОПКИ: Видят все, КРОМЕ угадывающего
        document.getElementById('action-controls').style.display = isMyTurn ? 'none' : 'grid';
        document.getElementById('observer-msg').style.display = isMyTurn ? 'block' : 'none';
        
        if(isMyTurn) {
            // Угадывающий просто ждет и шлет сигнал смены слова
            nextWord();
        }
        startTimer(90);
    });

    function nextWord() {
        // Логика выбора слова (у хоста) и рассылка всем
        const word = "ПРИМЕР СЛОВА"; // Тут твоя логика из categories.json
        socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC_WORD', word: word } });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_WORD') {
            const el = document.getElementById('current-word');
            el.innerText = data.word;
            el.style.filter = isMyTurn ? "blur(15px)" : "none";
        }
    });

    // Эти функции вызывают ОБСЕРВЕРЫ (друзья)
    window.handleWin = function() {
        socket.emit('add-point', myRoom);
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    window.handleSkip = function() {
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    socket.on('game-event', (data) => {
        if(data.type === 'NEXT_WORD_REQ' && isMyTurn) {
            nextWord(); // Угадывающий генерирует новое слово
        }
    });

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

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
})();
