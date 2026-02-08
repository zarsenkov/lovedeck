(function() {
    // Укажи здесь свою ссылку на сервер Amvera
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });

    let myName, myRoom, isMyTurn = false, gamePool = [], timerInterval;
    let categoriesData = {}, selectedCats = [];
    let wakeLock = null;

    // --- ФУНКЦИИ БЕЗОПАСНОСТИ ---

    // Предотвращение засыпания экрана (WakeLock)
    async function activateWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log("WakeLock активен: экран не погаснет");
            } catch (err) {
                console.error("WakeLock ошибка:", err);
            }
        }
    }

    // --- ЗАГРУЗКА ДАННЫХ ---

    fetch('../categories.json')
        .then(r => r.json())
        .then(data => {
            categoriesData = data.categories || data;
            renderCategories();
        });

    function renderCategories() {
        const grid = document.getElementById('categories-grid');
        if(!grid) return;
        grid.innerHTML = '';
        Object.keys(categoriesData).forEach(cat => {
            const d = document.createElement('div');
            d.className = 'cat-item';
            d.innerText = cat;
            d.onclick = () => {
                d.classList.toggle('selected');
                if(d.classList.contains('selected')) selectedCats.push(cat);
                else selectedCats = selectedCats.filter(c => c !== cat);
            };
            grid.appendChild(d);
        });
    }

    // --- ЛОГИКА ЛОББИ ---

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        
        if(myName && myRoom) {
            // Активируем WakeLock при клике (требование браузера)
            activateWakeLock();
            
            socket.emit('join-room', { 
                roomId: myRoom, 
                playerName: myName, 
                gameType: 'whoami' 
            });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `
            <div class="player-chip ${!p.online ? 'is-offline' : ''}">
                ${p.name} <span>[${p.score}]</span>
            </div>
        `).join('');
        
        // Показываем настройки и старт только первому игроку (хосту)
        if(data.players[0] && data.players[0].id === socket.id && !data.gameStarted) {
            document.getElementById('host-config').style.display = 'block';
            document.getElementById('start-btn').classList.remove('hidden');
        }
    });

    window.requestStart = function() {
        if(selectedCats.length === 0) return alert("Выбери хотя бы одну тему!");
        
        // Собираем пул слов
        gamePool = [];
        selectedCats.forEach(c => gamePool = [...gamePool, ...categoriesData[c]]);
        gamePool.sort(() => Math.random() - 0.5);
        
        socket.emit('start-game', myRoom);
    };

    // --- ИГРОВОЙ ПРОЦЕСС ---

    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        document.getElementById('round-counter').innerText = data.currentRound;
        
        const controls = document.getElementById('action-controls');
        const observerMsg = document.getElementById('observer-msg');
        const wordHint = document.getElementById('word-hint');

        if (isMyTurn) {
            // Игрок со смартфоном у лба: кнопок нет, слово размыто
            controls.style.display = 'none';
            observerMsg.style.display = 'none';
            wordHint.classList.remove('hidden');
            document.getElementById('role-banner').innerText = "ТВОЙ ХОД (ТЕЛЕФОН КО ЛБУ)";
            
            // Генерируем первое слово
            pickNewWord();
        } else {
            // Друзья: видят кнопки и слово
            controls.style.display = 'grid';
            observerMsg.style.display = 'block';
            wordHint.classList.add('hidden');
            document.getElementById('role-banner').innerText = `ОБЪЯСНЯЙТЕ: ${data.activePlayerName}`;
        }
        
        startTimer(90);
    });

    function pickNewWord() {
        if(gamePool.length === 0) {
            // Перемешиваем заново если слова кончились
            selectedCats.forEach(c => gamePool = [...gamePool, ...categoriesData[c]]);
            gamePool.sort(() => Math.random() - 0.5);
        }
        const word = gamePool.pop();
        socket.emit('game-action', { 
            roomId: myRoom, 
            data: { type: 'SYNC_WORD', word: word } 
        });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_WORD') {
            const el = document.getElementById('current-word');
            el.innerText = data.word;
            // Размываем слово только для того, кто угадывает
            el.style.filter = isMyTurn ? "blur(15px)" : "none";
        }
        // Если пришел сигнал на смену слова от друзей
        if(data.type === 'NEXT_WORD_REQ' && isMyTurn) {
            pickNewWord();
        }
    });

    // Эти кнопки нажимают ДРУЗЬЯ (Обсерверы)
    window.handleWin = function() {
        socket.emit('add-point', myRoom); // Сервер добавит +1 к активному игроку
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    window.handleSkip = function() {
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    // --- ТАЙМЕР И ФИНАЛ ---

    function startTimer(sec) {
        clearInterval(timerInterval);
        let timeLeft = sec;
        document.getElementById('timer-display').innerText = timeLeft;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('timer-display').innerText = timeLeft;
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                // По истечении времени только активный игрок просит сменить ход
                if(isMyTurn) socket.emit('switch-turn', myRoom);
            }
        }, 1000);
    }

    socket.on('game-over', (data) => {
        clearInterval(timerInterval);
        showScreen('result-screen');
        const stats = document.getElementById('final-stats');
        stats.innerHTML = data.players
            .sort((a,b) => b.score - a.score)
            .map((p, i) => `
                <div class="result-row">
                    <span>${i === 0 ? '🏆' : ''} ${p.name}</span>
                    <strong>${p.score}</strong>
                </div>
            `).join('');
    });

    // --- ВСПОМОГАТЕЛЬНОЕ ---

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    // Если связь пропала и восстановилась - переактивируем WakeLock
    document.addEventListener('visibilitychange', () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            activateWakeLock();
        }
    });

})();
