(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling"] });
    let myName, myRoom, isMyTurn = false, categoriesData = {}, selectedCats = [], gamePool = [];
    let offlineTimer;

    // Загрузка категорий
    async function loadCats() {
        const res = await fetch('../categories.json');
        const data = await res.json();
        categoriesData = data.categories || data;
        const grid = document.getElementById('categories-grid');
        Object.keys(categoriesData).forEach(cat => {
            const d = document.createElement('div');
            d.className = 'cat-item';
            d.innerText = cat;
            d.onclick = () => {
                d.classList.toggle('selected');
                selectedCats.includes(cat) ? selectedCats = selectedCats.filter(c => c !== cat) : selectedCats.push(cat);
            };
            grid.appendChild(d);
        });
    }
    loadCats();

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if(myName && myRoom) {
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    socket.on('update-lobby', (data) => {
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `<li>${p.name} [${p.score}] ${p.online?'':'⚠️'}</li>`).join('');
        
        if(data.players[0].id === socket.id && !data.gameStarted) {
            document.getElementById('host-controls').style.display = 'block';
            document.getElementById('start-btn').classList.remove('hidden');
        }
        if(data.players.every(p => p.online)) hideOverlay();
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
        document.getElementById('role-banner').innerText = isMyTurn ? "ТЫ УГАДЫВАЕШЬ!" : `УГАДЫВАЕТ: ${data.activePlayerName}`;
        
        document.getElementById('action-controls').style.display = isMyTurn ? 'grid' : 'none';
        document.getElementById('observer-msg').style.display = isMyTurn ? 'none' : 'block';

        if(isMyTurn) {
            // Ведущий берет слово из своего пула и шлет всем
            const word = gamePool.pop() || "Слова кончились";
            socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC_WORD', word: word } });
        }
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC_WORD') {
            const el = document.getElementById('current-word');
            el.innerText = data.word;
            // ГЛАВНАЯ ФИШКА: Ведущий не видит слово
            el.style.filter = isMyTurn ? "blur(15px)" : "none";
        }
    });

    window.handleWin = function() { socket.emit('switch-turn', myRoom, true); };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom, false); };

    socket.on('player-offline', (data) => {
        document.getElementById('offline-overlay').style.display = 'flex';
        let t = 60;
        clearInterval(offlineTimer);
        offlineTimer = setInterval(() => {
            t--;
            document.getElementById('wait-timer').innerText = t;
            if(t <= 0) skipOfflinePlayer();
        }, 1000);
    });

    function hideOverlay() {
        document.getElementById('offline-overlay').style.display = 'none';
        clearInterval(offlineTimer);
    }

    socket.on('game-over', (data) => {
        showScreen('result-screen');
        const stats = document.getElementById('final-stats');
        stats.innerHTML = data.players.sort((a,b)=>b.score-a.score).map(p => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <span>${p.name}</span><strong>${p.score}</strong>
            </div>
        `).join('');
    });

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
})();
