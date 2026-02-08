(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling", "websocket"] });
    let myName, myRoom, isMyTurn = false, timerInterval, allPlayers = [];
    let wakeLock = null;

    async function toggleWakeLock() {
        if ('wakeLock' in navigator) { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {} }
    }

    function getCardData() {
        let alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
        let letters = "";
        for(let i=0; i<3; i++) letters += alphabet[Math.floor(Math.random()*alphabet.length)] + " ";
        
        let word = "СЛОВО";
        if (window.cards && Array.isArray(window.cards)) {
            word = window.cards[Math.floor(Math.random()*window.cards.length)];
            if(typeof word === 'object') word = word.word;
        }
        return { word: word.toUpperCase(), letters: letters.trim() };
    }

    window.joinLobby = function() {
        myName = document.getElementById('player-name').value.trim();
        myRoom = document.getElementById('room-id').value.trim();
        if(myName && myRoom) {
            toggleWakeLock();
            socket.emit('join-room', { roomId: myRoom, playerName: myName });
            showScreen('lobby-screen');
            document.getElementById('room-display').innerText = myRoom;
        }
    };

    socket.on('update-lobby', (data) => {
        allPlayers = data.players;
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `<li>${p.name} <span>${p.score}</span></li>`).join('');
        
        if(data.players[0].id === socket.id && !data.gameStarted) {
            document.getElementById('host-controls').style.display = 'block';
            document.getElementById('start-btn').classList.remove('hidden');
        }
    });

    window.requestStart = function() {
        const r = document.getElementById('rounds-count').value;
        const t = document.getElementById('timer-val').value;
        socket.emit('start-game', { roomId: myRoom, maxRounds: r, timer: t });
    };

    socket.on('turn-changed', (data) => {
        showScreen('game-screen');
        isMyTurn = (socket.id === data.activePlayerId);
        
        document.getElementById('host-action-controls').style.display = isMyTurn ? 'grid' : 'none';
        document.getElementById('guest-msg').style.display = isMyTurn ? 'none' : 'block';
        document.getElementById('role-banner').innerText = isMyTurn ? "ВЫ ВЕДУЩИЙ" : `ВЕДЕТ: ${data.activePlayerName}`;
        
        if (isMyTurn) nextWord();
        startTimer(data.timer);
    });

    function nextWord() {
        const d = getCardData();
        socket.emit('game-action', { roomId: myRoom, data: { type: 'SYNC', word: d.word, letters: d.letters } });
    }

    socket.on('game-event', (data) => {
        if(data.type === 'SYNC') {
            document.getElementById('target-letters').innerText = data.letters;
            // КЛЮЧЕВОЙ МОМЕНТ: гости видят прочерки
            document.getElementById('current-word').innerText = isMyTurn ? data.word : "---";
        }
    });

    window.showScoreModal = function() {
        const modal = document.getElementById('score-modal');
        const container = document.getElementById('potential-winners');
        container.innerHTML = allPlayers.filter(p => p.id !== socket.id)
            .map(p => `<button class="winner-btn" onclick="givePoint('${p.name}')">${p.name}</button>`).join('');
        modal.style.display = 'flex';
    };

    window.givePoint = function(name) {
        socket.emit('add-point-to', { roomId: myRoom, targetName: name });
        closeModal();
        socket.emit('switch-turn', myRoom);
    };

    window.closeModal = function() { document.getElementById('score-modal').style.display = 'none'; };
    window.handleSkip = function() { socket.emit('switch-turn', myRoom); };

    function startTimer(sec) {
        clearInterval(timerInterval);
        let left = sec;
        const el = document.getElementById('timer-display');
        timerInterval = setInterval(() => {
            left--; el.innerText = left;
            if(left <= 0) {
                clearInterval(timerInterval);
                if(isMyTurn) socket.emit('switch-turn', myRoom);
            }
        }, 1000);
    }

    socket.on('game-over', (data) => {
        showScreen('result-screen');
        const sorted = [...data.players].sort((a,b) => b.score - a.score);
        document.getElementById('final-stats').innerHTML = sorted.map(p => `<p><b>${p.name}</b>: ${p.score}</p>`).join('');
    });

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
})();
