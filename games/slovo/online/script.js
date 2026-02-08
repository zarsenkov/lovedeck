(function() {
    // 1. ПОДКЛЮЧЕНИЕ
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { 
        transports: ["polling", "websocket"] 
    });

    let myName, myRoom, isMyTurn = false, timerInterval;
    let wakeLock = null;

    // 2. РАБОТА С КАРТОЧКАМИ (из cards.js)
    function getNewData() {
        try {
            let word = "ОШИБКА";
            let letters = "? ? ?";

            // Если cards.js — это массив объектов {word, letters}
            if (window.cards && Array.isArray(window.cards)) {
                const card = window.cards[Math.floor(Math.random() * window.cards.length)];
                word = card.word || card;
                letters = card.letters || "";
            } 
            // Если CATEGORIES (как в ZINE)
            else if (window.CATEGORIES) {
                const cats = Object.keys(window.CATEGORIES);
                const randomCat = cats[Math.floor(Math.random() * cats.length)];
                const words = window.CATEGORIES[randomCat];
                word = words[Math.floor(Math.random() * words.length)];
                // Генерация случайной буквы для ZINE, если её нет в базе
                letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ"[Math.floor(Math.random() * 27)];
            }
            return { word: word.toUpperCase(), letters: letters.toUpperCase() };
        } catch (e) {
            console.error("Ошибка при получении данных из cards.js:", e);
            return { word: "СЛОВО", letters: "!" };
        }
    }

    // 3. СЕРВИСНЫЕ ФУНКЦИИ
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log("WakeLock активен");
            } catch (err) {}
        }
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if(target) target.classList.add('active');
    }

    // 4. ЛОББИ И ВХОД
window.joinLobby = function() {
    myName = document.getElementById('player-name').value.trim();
    myRoom = document.getElementById('room-id').value.trim();
    
    if(myName && myRoom) {
        // Скрываем оверлей при попытке входа
        const overlay = document.getElementById('offline-overlay');
        if(overlay) overlay.style.display = 'none';

        requestWakeLock();
        socket.emit('join-room', { roomId: myRoom, playerName: myName });
        showScreen('lobby-screen');
        document.getElementById('room-display').innerText = myRoom;
    } else {
        alert("Заполни имя и комнату!");
    }
};

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => 
            `<li>${p.name}: <b>${p.score}</b> ${p.online ? '🌐' : '🔴'}</li>`
        ).join('');

        const startBtn = document.getElementById('start-btn');
        if(data.players[0] && data.players[0].id === socket.id) {
            startBtn.style.display = 'block';
            startBtn.classList.remove('hidden');
        }
    });

    window.requestStart = function() {
        socket.emit('start-game', myRoom);
    };

    // 5. ИГРОВОЙ ПРОЦЕСС
    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        const actionControls = document.getElementById('action-controls');
        const observerMsg = document.getElementById('observer-msg');
        const roleBanner = document.getElementById('role-banner');

        if (isMyTurn) {
            roleBanner.innerHTML = `<span style="color:red">ТВОЙ ХОД!</span> ДЕРЖИ ТЕЛЕФОН У ЛБА`;
            actionControls.style.display = 'none';
            observerMsg.style.display = 'block';
            nextWord(); // Угадывающий запрашивает слово для всех
        } else {
            roleBanner.innerText = `ОБЪЯСНЯЕТ: ${data.activePlayerName}`;
            actionControls.style.display = 'flex';
            observerMsg.style.display = 'none';
        }
        
        startTimer(90);
    });

    function nextWord() {
        const data = getNewData();
        socket.emit('game-action', { 
            roomId: myRoom, 
            data: { type: 'SYNC_GAME', word: data.word, letters: data.letters } 
        });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_GAME') {
            const wordEl = document.getElementById('current-word');
            const lettersEl = document.getElementById('target-letters');
            
            wordEl.innerText = data.word;
            if(lettersEl) lettersEl.innerText = data.letters;
            
            // Блюр только для угадывающего
            wordEl.style.filter = isMyTurn ? "blur(15px)" : "none";
        }
        
        if(data.type === 'NEXT_WORD_REQ' && isMyTurn) {
            nextWord();
        }
    });

    // Кнопки друзей
    window.handleWin = function() {
        socket.emit('add-point', myRoom);
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    window.handleSkip = function() {
        socket.emit('game-action', { roomId: myRoom, data: { type: 'NEXT_WORD_REQ' } });
    };

    // 6. ТАЙМЕР И ФИНАЛ
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
        const stats = document.getElementById('final-stats');
        const sorted = [...data.players].sort((a,b) => b.score - a.score);
        stats.innerHTML = `<h2>ПОБЕДИЛ: ${sorted[0].name}!</h2>` + 
            sorted.map(p => `<p>${p.name}: ${p.score}</p>`).join('');
    });

socket.on('player-offline', (data) => {
    // Показываем оверлей только если мы уже в игре (на экране игры)
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen && gameScreen.classList.contains('active')) {
        const overlay = document.getElementById('offline-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.getElementById('offline-msg').innerText = `${data.name} ВЫЛЕТЕЛ`;
        }
    }
});

    socket.on('hide-overlay', () => {
        const overlay = document.getElementById('offline-overlay');
        if(overlay) overlay.style.display = 'none';
    });

})();
