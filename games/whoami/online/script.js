(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });
    let myName, myRoom, isMyTurn = false, categoriesData = {}, selectedCats = [], gamePool = [];
    let timerInterval, offlineTimer;

    // Загрузка категорий из корня
    fetch('../categories.json')
        .then(r => r.json())
        .then(data => {
            categoriesData = data.categories || data;
            renderCategories();
        });

    function renderCategories() {
        const grid = document.getElementById('categories-grid');
        if(!grid) return;
        Object.keys(categoriesData).forEach(cat => {
            const d = document.createElement('div');
            d.className = 'cat-item';
            d.style = "background:#eee; padding:5px; border-radius:8px; font-size:10px; cursor:pointer; font-weight:bold; text-align:center;";
            d.innerText = cat;
            d.onclick = () => {
                d.classList.toggle('selected');
                if(d.classList.contains('selected')) {
                    selectedCats.push(cat);
                    d.style.background = "#6C5CE7"; d.style.color = "white";
                } else {
                    selectedCats = selectedCats.filter(c => c !== cat);
                    d.style.background = "#eee"; d.style.color = "black";
                }
            };
            grid.appendChild(d);
        });
    }

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if(myName && myRoom) {
            socket.emit('join-room', { roomId: myRoom, playerName: myName, gameType: 'whoami' });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    window.updateRoundsConfig = function() {
        const r = document.getElementById('rounds-count').value;
        socket.emit('set-rounds', { roomId: myRoom, rounds: r });
    };

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `
            <div class="player-chip ${!p.online ? 'is-offline' : ''}">
                ${p.name} <span style="color:var(--primary)">${p.score}</span>
            </div>
        `).join('');
        
        if(data.players[0].id === socket.id && !data.gameStarted) {
            document.getElementById('host-config').style.display = 'block';
            document.getElementById('start-btn').classList.remove('hidden');
        }
    });

    window.requestStart = function() {
        if(selectedCats.length === 0) return alert("Выбери темы!");
        gamePool = [];
        selectedCats.forEach(c => gamePool = [...gamePool, ...categoriesData[c]]);
        gamePool.sort(() => Math.random() - 0.5);
        socket.emit('start-game', myRoom);
    };

    socket.on('game-started', syncTurn);
    socket.on('turn-changed', syncTurn);

    function syncTurn(data) {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        document.getElementById('round-counter').innerText = data.currentRound;
        document.getElementById('role-banner').innerText = isMyTurn ? "ТЫ УГАДЫВАЕШЬ!" : `ОТВЕЧАЙТЕ: ${data.activePlayerName}`;
        
        document.getElementById('action-controls').style.display = isMyTurn ? 'grid' : 'none';
        document.getElementById('observer-msg').style.display = isMyTurn ? 'none' : 'block';

        if(isMyTurn) {
            pickNewWord();
        }
        startTimer(90);
    }

    function pickNewWord() {
        // Если слова кончились в локальном пуле - берем заново из выбранных тем
        if(gamePool.length === 0) {
            selectedCats.forEach(c => gamePool = [...gamePool, ...categoriesData[c]]);
            gamePool.sort(() => Math.random() - 0.5);
        }
        const word = gamePool.pop();
        socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC_WORD', word: word } });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_WORD') {
            const el = document.getElementById('current-word');
            el.innerText = data.word;
            el.style.filter = isMyTurn ? "blur(12px)" : "none";
            document.getElementById('word-hint').classList.toggle('hidden', !isMyTurn);
        }
    });

    function startTimer(sec) {
        clearInterval(timerInterval);
        let timeLeft = sec;
        document.getElementById('timer-display').innerText = timeLeft;
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('timer-display').innerText = timeLeft;
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                if(isMyTurn) socket.emit('switch-turn', myRoom, false);
            }
        }, 1000);
    }

    window.handleWin = function() { pickNewWord(); socket.emit('game-action', { roomId: myRoom, data: { type: 'POINT_SCORED' } }); };
    window.handleSkip = function() { pickNewWord(); };

    socket.on('game-event', (data) => {
        if(data.type === 'POINT_SCORED') {
            // Визуальный эффект или звук можно тут
        }
    });

    // Очки в "Кто я" начисляются за каждое слово. 
    // Чтобы не перегружать сервер, мы просто шлем 'switch-turn' в конце времени 
    // с количеством набранных очков, НО сейчас для простоты оставим логику:
    // 1 угаданное слово = 1 балл.
    window.handleWin = function() {
        socket.emit('switch-turn-add-point', myRoom); // Специальное событие для добавления очка без смены хода
        pickNewWord();
    };

    socket.on('player-offline', (data) => {
        document.getElementById('offline-overlay').style.display = 'flex';
        let t = 60;
        document.getElementById('wait-timer').innerText = t;
        clearInterval(offlineTimer);
        offlineTimer = setInterval(() => {
            t--;
            document.getElementById('wait-timer').innerText = t;
            if(t <= 0) skipOfflinePlayer();
        }, 1000);
    });

    window.skipOfflinePlayer = function() {
        const offlineName = document.getElementById('offline-msg').innerText.split(' ')[0]; // Достаем имя если нужно
        socket.emit('kick-player', myRoom, myName === offlineName ? "" : "someone"); 
        // ВАЖНО: сервер должен просто убрать оффлайн игрока
        document.getElementById('offline-overlay').style.display = 'none';
        clearInterval(offlineTimer);
    };

    socket.on('game-over', (data) => {
        clearInterval(timerInterval);
        showScreen('result-screen');
        const stats = document.getElementById('final-stats');
        stats.innerHTML = data.players.sort((a,b)=>b.score-a.score).map(p => `
            <div style="display:flex; justify-content:space-between; padding:15px; background:#F1F2F6; border-radius:15px; margin-bottom:10px; font-weight:900">
                <span>${p.name}</span><strong>${p.score}</strong>
            </div>
        `).join('');
    });

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
})();
