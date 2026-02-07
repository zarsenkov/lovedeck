(function() {
    const ALPHABET_ONLINE = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
    
    // Подключение к серверу
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling"],
        reconnection: true
    });

    let myName = "", myRoom = "", isMyTurn = false, timerId = null;
    let gameActive = false; 

    // Функция для ГАРАНТИРОВАННОГО скрытия плашки
    window.closeOverlay = function() {
        const overlay = document.getElementById('offline-overlay');
        if (overlay) {
            overlay.style.setProperty('display', 'none', 'important');
        }
    };

    // 1. Инициализация (сразу прячем оверлей при загрузке страницы)
    document.addEventListener('DOMContentLoaded', window.closeOverlay);

    // 2. Логика входа
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

    // Настройка раундов (только хост)
    window.updateRoundsConfig = function() {
        const r = document.getElementById('rounds-count').value;
        socket.emit('set-rounds', { roomId: myRoom, rounds: r });
    };

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    // 3. Работа с Socket.io
    socket.on('update-lobby', (data) => {
        // Синхронизируем флаг активности игры с сервером
        gameActive = data.gameStarted; 

        const list = document.getElementById('online-players-list');
        if (list) {
            list.innerHTML = data.players.map(p => `
                <li style="${!p.online ? 'color: #ff3e00; text-decoration: line-through;' : ''}">
                    • <strong>${p.name}</strong> ${!p.online ? "[OFFLINE]" : ""}
                </li>
            `).join('');
        }

        // Прячем оверлей, если:
        // 1. Игра еще не началась
        // 2. Или все игроки в сети
        const anyoneOffline = data.players.some(p => !p.online);
        if (!gameActive || !anyoneOffline) {
            window.closeOverlay();
        }

        // Показываем кнопку старта только первому игроку (хосту)
        const startBtn = document.getElementById('start-btn');
        if (data.players[0] && data.players[0].id === socket.id && !gameActive) {
            startBtn.classList.remove('hidden');
        }
    });

    socket.on('player-offline', (data) => {
        // Показываем плашку ТОЛЬКО если игра уже в процессе
        if (gameActive) {
            const overlay = document.getElementById('offline-overlay');
            const msg = document.getElementById('offline-msg');
            if (overlay) {
                overlay.style.setProperty('display', 'flex', 'important');
                if (msg) msg.innerText = `${data.name} ВЫШЕЛ`;
            }
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
        alert("ФИНАЛ ИГРЫ! Все круги пройдены.");
        location.reload();
    });

    // 4. Игровой процесс
    function syncTurn(data) {
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        window.closeOverlay();
        
        isMyTurn = (socket.id === data.activePlayerId);
        
        const banner = document.getElementById('role-banner');
        banner.innerText = `КРУГ ${data.currentRound}/${data.maxRounds} | ВЕЩАЕТ: ${data.activePlayerName}`;
        
        const activeNameInfo = document.getElementById('active-player-info');
        if (activeNameInfo) activeNameInfo.innerText = data.activePlayerName;
        
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
            banner.style.background = "#ff3e00";
            hostControls.style.display = "flex";
            guestMsg.style.display = "none";
        } else {
            banner.style.background = "#000";
            hostControls.style.display = "none";
            guestMsg.style.display = "block";
        }
    }

    window.handleWin = function() { socket.emit('switch-turn', myRoom); };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom); };

    function startTimer() {
        clearInterval(timerId);
        let time = 60;
        const timerEl = document.getElementById('timer');
        timerEl.innerText = time;
        timerId = setInterval(() => {
            time--;
            timerEl.innerText = time;
            if (time <= 0) {
                clearInterval(timerId);
                if (isMyTurn) window.handleSkip();
            }
        }, 1000);
    }
})();
