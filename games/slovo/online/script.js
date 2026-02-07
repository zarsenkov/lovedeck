(function() {
    const ALPHABET_ONLINE = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling"] 
    });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;

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

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    window.handleWin = function() { socket.emit('switch-turn', myRoom); };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom); };

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('online-players-list');
        if (list) {
            list.innerHTML = data.players.map(p => `<li>• <strong>${p.name}</strong> ${p.id === socket.id ? "(ВЫ)" : ""}</li>`).join('');
        }
        if (data.players[0].id === socket.id && !data.gameStarted) {
            document.getElementById('start-btn').classList.remove('hidden');
            document.getElementById('wait-msg').classList.add('hidden');
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
            const letterEl = document.getElementById('target-letter');
            const guestLetterContainer = document.getElementById('guest-msg');

            if (isMyTurn) {
                // Ведущий видит всё
                wordEl.innerText = data.word;
                wordEl.style.filter = "none";
                letterEl.innerText = data.letter;
            } else {
                // Угадывающие не видят ничего
                wordEl.innerText = "???";
                wordEl.style.filter = "blur(10px)";
                letterEl.innerText = "?"; // Скрываем букву
            }
            startTimer();
        }
    });

    function generateCard() {
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
            banner.innerText = "ТВОЙ ХОД: ОБЪЯСНЯЙ";
            banner.style.background = "#ff3e00";
            hostControls.style.display = "flex";
            guestMsg.style.display = "none";
        } else {
            banner.innerText = "УГАДЫВАЙТЕ БУКВУ И СЛОВО";
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
