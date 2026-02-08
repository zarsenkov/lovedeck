(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling", "websocket"] 
    });

    let myName, myRoom, isMyTurn = false, timerInterval;
    let wakeLock = null;
    let allPlayers = [];

    // 1. Блокировка экрана
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
        }
    }

    // 2. Получение данных (слово + 3 буквы)
    function getNewData() {
        try {
            let word = "СЛОВО", letters = "";
            if (window.cards && Array.isArray(window.cards)) {
                const card = window.cards[Math.floor(Math.random() * window.cards.length)];
                word = card.word || card;
            }
            // Генерируем 3 случайные буквы
            const alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
            for(let i=0; i<3; i++) letters += alphabet[Math.floor(Math.random() * alphabet.length)] + " ";
            return { word: word.toUpperCase(), letters: letters.trim() };
        } catch (e) { return { word: "ОШИБКА", letters: "А Б В" }; }
    }

    // 3. Вход
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

    // 4. Лобби
    socket.on('update-lobby', (data) => {
        allPlayers = data.players;
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `<li>${p.name} <span>${p.score} pts</span></li>`).join('');
        
        // Если я первый в списке — я хост
        if(data.players[0].id === socket.id) {
            document.getElementById('host-controls').style.display = 'block';
            document.getElementById('start-btn').classList.remove('hidden');
        }
    });

    window.requestStart = function() {
        const r = document.getElementById('rounds-count').value;
        const t = document.getElementById('timer-val').value;
        socket.emit('start-game', { roomId: myRoom, maxRounds: r, timer: t });
    };

    // 5. Игровой процесс
    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        document.getElementById('host-action-controls').style.display = isMyTurn ? 'grid' : 'none';
        document.getElementById('guest-msg').style.display = isMyTurn ? 'none' : 'block';
        document.getElementById('role-banner').innerText = isMyTurn ? "ТВОЙ ХОД" : `ОБЪЯСНЯЕТ: ${data.activePlayerName}`;
        
        if (isMyTurn) nextWord();
        startTimer(data.timer || 60);
    });

    function nextWord() {
        const d = getNewData();
        socket.emit('game-action', { 
            roomId: myRoom, 
            data: { type: 'SYNC_GAME', word: d.word, letters: d.letters } 
        });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_GAME') {
            const wordEl = document.getElementById('current-word');
            const lettersEl = document.getElementById('target-letters');
            
            lettersEl.innerText = data.letters;
            // ГОСТИ ВИДЯТ ТОЛЬКО БУКВЫ, ВЕДУЩИЙ ВИДИТ СЛОВО
            wordEl.innerText = isMyTurn ? data.word : "???";
        }
    });

    // 6. Управление баллами
    window.showScoreModal = function() {
        const modal = document.getElementById('score-modal');
        const container = document.getElementById('potential-winners');
        modal.style.display = 'flex';
        
        // Список всех игроков кроме меня
        container.innerHTML = allPlayers
            .filter(p => p.id !== socket.id)
            .map(p => `<button class="winner-btn" onclick="givePoint('${p.name}')">${p.name}</button>`)
            .join('');
    }

    window.givePoint = function(targetName) {
        socket.emit('add-point-to', { roomId: myRoom, targetName: targetName });
        closeModal();
        socket.emit('switch-turn', myRoom); // Передаем ход после успеха
    }

    window.closeModal = function() { document.getElementById('score-modal').style.display = 'none'; }

    window.handleSkip = function() {
        socket.emit('switch-turn', myRoom); // Просто передаем ход
    }

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

    socket.on('game-over', (data) => {
        showScreen('result-screen');
        const sorted = [...data.players].sort((a,b) => b.score - a.score);
        document.getElementById('final-stats').innerHTML = sorted.map(p => 
            `<div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:900;">
                <span>${p.name}</span><span>${p.score}</span>
            </div>`
        ).join('');
    });

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
})();
