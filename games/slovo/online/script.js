(function() {
    const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ["polling", "websocket"] });
    let myName, myRoom, isMyTurn = false, timerInterval, allPlayers = [];

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if(target) target.classList.add('active');
    }

// ИСПРАВЛЕННАЯ ФУНКЦИЯ: берет данные из ваших переменных words и alphabet
function getCard() {
        // 1. Устанавливаем запасные значения
        let word = "ОШИБКА"; 
        let lets = "? ? ?";

        // 2. Берем СЛОВО из твоего файла cards.js (переменная words)
        // Проверяем window.words, так как cards.js объявляет её глобально
        if (window.words && window.words.length > 0) {
            const randomIndex = Math.floor(Math.random() * window.words.length);
            word = window.words[randomIndex];
        } else {
            console.error("Файл cards.js не загружен или массив words пуст!");
            word = "НЕТ СЛОВ";
        }

        // 3. Берем БУКВЫ из твоего алфавита в cards.js
        if (window.alphabet) {
            const alphaArray = window.alphabet.split("");
            const randomLetters = [];
            for (let i = 0; i < 3; i++) {
                const char = alphaArray[Math.floor(Math.random() * alphaArray.length)];
                randomLetters.push(char);
            }
            lets = randomLetters.join(" ");
        } else {
            // Если алфавита нет, генерируем стандартный
            lets = "А Б В"; 
        }

        return { 
            word: word.toUpperCase(), 
            letters: lets.toUpperCase() 
        };
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
        list.innerHTML = data.players.map(p => `<li style="display:flex; justify-content:space-between;"><span>${p.name}</span><b>${p.score}</b></li>`).join('');
        
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
            .map(p => `<button class="btn-zinc" style="margin-bottom:5px; box-shadow:2px 2px 0 #000;" onclick="givePoint('${p.name}')">${p.name}</button>`).join('');
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
        document.getElementById('final-stats').innerHTML = sorted.map(p => `<div style="display:flex; justify-content:space-between;"><span>${p.name}</span><b>${p.score}</b></div>`).join('');
    });
})();
