(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling", "websocket"] });
    let myName, myRoom, isMyTurn = false, timerInterval, allPlayers = [];

    // Функция переключения экранов
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    function getCard() {
        let alpha = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
        let lets = Array.from({length:3}, () => alpha[Math.floor(Math.random()*alpha.length)]).join(" ");
        let word = "СЛОВО";
        if (window.cards) {
            const c = window.cards[Math.floor(Math.random()*window.cards.length)];
            word = (typeof c === 'object') ? c.word : c;
        }
        return { word: word.toUpperCase(), letters: lets };
    }

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if(myName && myRoom) {
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = `КОМНАТА: ${myRoom}`;
        }
    };

    socket.on('update-lobby', (data) => {
        allPlayers = data.players;
        const list = document.getElementById('players-list');
        list.innerHTML = data.players.map(p => `<li>${p.name}: ${p.score}</li>`).join('');
        
        if(data.players[0].id === socket.id && !data.gameStarted) {
            document.getElementById('host-controls').style.display = 'block';
            document.getElementById('start-btn').classList.remove('hidden');
        }
    });

    window.requestStart = function() {
        socket.emit('start-game', { 
            roomId: myRoom, 
            maxRounds: document.getElementById('rounds-count').value,
            timer: document.getElementById('timer-val').value 
        });
    };

    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        document.getElementById('host-actions').style.display = isMyTurn ? 'flex' : 'none';
        document.getElementById('guest-msg').style.display = isMyTurn ? 'none' : 'block';
        document.getElementById('role-banner').innerText = isMyTurn ? "ТВОЙ ХОД (ОБЪЯСНЯЙ)" : `ВЕДЕТ: ${data.activePlayerName}`;
        
        if(isMyTurn) sendNewWord();
        startTimer(data.timer);
    });

    function sendNewWord() {
        const c = getCard();
        socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC', word: c.word, letters: c.letters } });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC') {
            document.getElementById('target-letters').innerText = data.letters;
            document.getElementById('current-word').innerText = isMyTurn ? data.word : "???";
        }
    });

    window.showScoreModal = function() {
        const container = document.getElementById('winner-buttons');
        container.innerHTML = allPlayers.filter(p => p.id !== socket.id)
            .map(p => `<button class="btn-zinc" style="margin-bottom:5px;" onclick="givePoint('${p.name}')">${p.name}</button>`).join('');
        document.getElementById('score-modal').style.display = 'flex';
    };

    window.givePoint = function(name) {
        socket.emit('add-point-to', { roomId: myRoom, targetName: name });
        closeModal();
        socket.emit('switch-turn', myRoom);
    };

    window.closeModal = () => document.getElementById('score-modal').style.display = 'none';
    window.handleSkip = () => socket.emit('switch-turn', myRoom);

    function startTimer(sec) {
        clearInterval(timerInterval);
        let left = sec;
        const el = document.getElementById('timer');
        timerInterval = setInterval(() => {
            left--; el.innerText = left;
            if(left <= 0) { clearInterval(timerInterval); if(isMyTurn) socket.emit('switch-turn', myRoom); }
        }, 1000);
    }

    socket.on('game-over', (data) => {
        showScreen('result-screen');
        const sorted = [...data.players].sort((a,b) => b.score - a.score);
        document.getElementById('final-stats').innerHTML = sorted.map(p => `<p>${p.name}: ${p.score}</p>`).join('');
    });
})();
