(function() {
    // 1. Константы и состояние
    const ALPHABET_ONLINE = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling"],
        reconnection: true,
        reconnectionAttempts: 10
    });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;
    let currentMaxRounds = 5;

    // 2. Вход и настройки
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

    // Синхронизация количества раундов (только для хоста)
    window.updateRoundsConfig = function() {
        const r = document.getElementById('rounds-count').value;
        socket.emit('set-rounds', { roomId: myRoom, rounds: r });
    };

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    // 3. Игровые действия
    window.handleWin = function() {
        socket.emit('switch-turn', myRoom);
    };

    window.handleSkip = function() {
        socket.emit('switch-turn', myRoom);
    };

    window.closeOverlay = function() {
        document.getElementById('offline-overlay').classList.add('hidden');
    };

    // 4. Обработка событий Socket.io
    socket.on('update-lobby', (data) => {
        const list = document.getElementById('online-players-list');
        if (list) {
            list.innerHTML = data.players.map(p => `
                <li style="${!p.online ? 'color: red; text-decoration: line-through;' : ''}">
                    • <strong>${p.name}</strong> ${p.id === socket.id ? "(ВЫ)" : ""} 
                    ${!p.online ? "[ВЫЛЕТЕЛ]" : ""}
                </li>
            `).join('');
        }
        
        // Синхро раундов в инпуте
        const roundInput = document.getElementById('rounds-count');
        if (roundInput) roundInput.value = data.maxRounds;

        // Кнопка старта для первого в списке
        const startBtn = document.getElementById('start-btn');
        if (data.players[0] && data.players[0].id === socket.id && !data.gameStarted) {
            startBtn.classList.remove('hidden');
        }

        // Если все вернулись, прячем плашку вылета
        const allOnline = data.players.every(p => p.online);
        if (allOnline) window.closeOverlay();
    });

    socket.on('player-offline', (data) => {
        document.getElementById('offline-msg').innerText = `${data.name} ПОТЕРЯЛ СВЯЗЬ`;
        document.getElementById('offline-overlay').classList.remove('hidden');
    });

    socket.on('game-started', syncTurn);
    socket.on('turn-changed', syncTurn);

    socket.on('game-over', (data) => {
        alert("ИГРА ОКОНЧЕНА! Все раунды пройдены.");
        location.reload(); 
    });

    function syncTurn(data) {
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        window.closeOverlay();
        
        isMyTurn = (socket.id === data.activePlayerId);
        
        // Показываем раунд и имя
        const banner = document.getElementById('role-banner');
        banner.innerText = `КРУГ ${data.currentRound}/${data.maxRounds} | ВЕЩАЕТ: ${data.activePlayerName}`;
        
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
                letterEl.innerText = data.letter;
            } else {
                wordEl.innerText = "???";
                wordEl.style.filter = "blur(10px)";
                letterEl.innerText = "?";
            }
            startTimer();
        }
    });

    // 5. Вспомогательные функции
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
        const banner = document.getElementById('role-banner');
        const hostControls = document.getElementById('host-controls');
        const guestMsg = document.getElementById('guest-msg');

        if (isMyTurn) {
            banner.style.background = "#ff3e00";
            hostControls.style.display = "flex";
            guestMsg.style.display = "none";
        } else {
            banner.style.background = "#000";
            hostControls.style.display = "none";
            guestMsg.style.display = "block";
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
