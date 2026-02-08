(function() {
    // Подключение к серверу
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling", "websocket"] 
    });

    let myName, myRoom, isMyTurn = false, timerInterval;
    let wakeLock = null;

    // Массив слов (можно вынести в отдельный cards.js или загружать через fetch)
    const wordsPool = ["ЯБЛОКО", "КОТ", "ТЕЛЕФОН", "СОЛНЦЕ", "ПИЦЦА", "КОСМОС", "ТАНК", "МУЗЫКА", "КИНО", "ИТАЛИЯ"];

    // Функция против засыпания экрана
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log("WakeLock активен");
            } catch (err) {
                console.error("Ошибка WakeLock:", err);
            }
        }
    }

    // 1. ВХОД В ЛОББИ
    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        
        if(myName && myRoom) {
            requestWakeLock();
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        } else {
            alert("Введите имя и номер комнаты!");
        }
    };

    // Обновление списка игроков
    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => 
            `<li>${p.name}: <b>${p.score}</b> ${p.online ? '🌐' : '🔴'}</li>`
        ).join('');

        // Показываем кнопку старта только первому игроку (хосту)
        if(data.players[0] && data.players[0].id === socket.id) {
            document.getElementById('start-btn').classList.remove('hidden');
            document.getElementById('start-btn').style.display = 'block';
        }
    });

    // 2. СТАРТ ИГРЫ
    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        // Настройка интерфейса в зависимости от роли
        const actionControls = document.getElementById('action-controls');
        const observerMsg = document.getElementById('observer-msg');
        const roleBanner = document.getElementById('role-banner');

        if (isMyTurn) {
            roleBanner.innerText = "ВАШ ХОД: ОТГАДЫВАЙТЕ!";
            actionControls.style.display = 'none';
            observerMsg.style.display = 'block';
            nextWord(); // Угадывающий запрашивает первое слово
        } else {
            roleBanner.innerText = `ОБЪЯСНЯЕТ: ${data.activePlayerName}`;
            actionControls.style.display = 'flex';
            observerMsg.style.display = 'none';
        }
        
        startTimer(90);
    });

    // 3. ЛОГИКА СЛОВ
    function nextWord() {
        const randomWord = wordsPool[Math.floor(Math.random() * wordsPool.length)];
        socket.emit('game-action', { 
            roomId: myRoom, 
            data: { type: 'SYNC_WORD', word: randomWord } 
        });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_WORD') {
            const el = document.getElementById('current-word');
            el.innerText = data.word;
            // Блюрим слово для угадывающего
            el.style.filter = isMyTurn ? "blur(15px)" : "none";
        }
        
        if(data.type === 'NEXT_WORD_REQ' && isMyTurn) {
            nextWord();
        }
    });

    // 4. КНОПКИ ДЛЯ ДРУЗЕЙ (ОБСЕРВЕРОВ)
    window.handleWin = function() {
        socket.emit('add-point', myRoom);
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    window.handleSkip = function() {
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    // 5. ТАЙМЕР И СЛУЖЕБНЫЕ ФУНКЦИИ
    function startTimer(sec) {
        clearInterval(timerInterval);
        let timeLeft = sec;
        const display = document.getElementById('timer-display');
        
        timerInterval = setInterval(() => {
            timeLeft--;
            display.innerText = timeLeft;
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                if(isMyTurn) socket.emit('switch-turn', myRoom);
            }
        }, 1000);
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if(target) target.classList.add('active');
    }

    // Обработка завершения игры
    socket.on('game-over', (data) => {
        showScreen('result-screen');
        const stats = document.getElementById('final-stats');
        const winner = [...data.players].sort((a,b) => b.score - a.score)[0];
        stats.innerHTML = `<h3>Победил: ${winner.name}!</h3>` + 
            data.players.map(p => `<p>${p.name}: ${p.score}</p>`).join('');
    });

    // Обработка вылета игрока
    socket.on('player-offline', (data) => {
        document.getElementById('offline-overlay').style.display = 'flex';
        document.getElementById('offline-msg').innerText = `${data.name} ОТКЛЮЧИЛСЯ`;
    });

    socket.on('hide-overlay', () => {
        document.getElementById('offline-overlay').style.display = 'none';
    });

})();
