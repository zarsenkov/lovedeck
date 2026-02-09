const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ['websocket', 'polling']
});

const app = {
    myId: null,
    roomId: null,
    isHost: false,
    score: 0,
    canAnswer: false,

    init() {
        socket.on('connect', () => {
            this.myId = socket.id;
        });

        // Слушатели событий
        socket.on('room_data', (data) => this.updateLobby(data));
        socket.on('game_start', (questions) => this.startGame(questions));
        socket.on('next_question', (data) => this.renderQuestion(data));
        socket.on('timer_tick', (time) => this.updateTimer(time));
        socket.on('round_ended', (results) => this.showFeedback(results));
        socket.on('game_over', (results) => this.showResults(results));
        socket.on('error', (msg) => alert(msg));
    },

    // Навигация
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    toggleRules(show) {
        document.getElementById('modal-rules').classList.toggle('active', show);
    },

    // Действия с комнатой
    createRoom() {
        const name = document.getElementById('username').value.trim();
        if (!name) return alert("Введи ник!");
        socket.emit('quiz_create', { name });
    },

    joinRoom() {
        const name = document.getElementById('username').value.trim();
        const code = document.getElementById('room-input').value.trim().toUpperCase();
        if (!name || !code) return alert("Введи ник и код!");
        socket.emit('quiz_join', { name, roomId: code });
    },

    updateLobby(data) {
        this.roomId = data.roomId;
        this.isHost = data.hostId === this.myId;
        
        document.getElementById('display-room-code').innerText = this.roomId;
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `
            <div class="player-item ${p.id === this.myId ? 'is-me' : ''}">
                <span>${p.name}</span>
                ${p.id === data.hostId ? '<span class="host-badge">HOST</span>' : ''}
            </div>
        `).join('');

        document.getElementById('start-game-btn').style.display = this.isHost ? 'block' : 'none';
        document.getElementById('wait-msg').style.display = this.isHost ? 'none' : 'block';
        this.showScreen('screen-lobby');
    },

    requestStart() {
        socket.emit('quiz_start_request', { roomId: this.roomId });
    },

    // Игровой процесс
    startGame() {
        this.score = 0;
        document.getElementById('my-score').innerText = `Очки: 0`;
        this.showScreen('screen-game');
    },

    renderQuestion(data) {
        this.canAnswer = true;
        document.getElementById('current-question-num').innerText = `Вопрос ${data.index + 1} из ${data.total}`;
        document.getElementById('question-text').innerText = data.question;
        
        const grid = document.getElementById('answers-grid');
        grid.innerHTML = data.answers.map((ans, i) => `
            <button class="answer-btn" id="ans-${i}" onclick="app.sendAnswer(${i})">${ans}</button>
        `).join('');
    },

    sendAnswer(index) {
        if (!this.canAnswer) return;
        this.canAnswer = false;
        
        // Визуальный выбор
        document.getElementById(`ans-${index}`).classList.add('selected');
        
        // Блокируем остальные
        const btns = document.querySelectorAll('.answer-btn');
        btns.forEach(btn => btn.disabled = true);

        socket.emit('quiz_submit_answer', {
            roomId: this.roomId,
            answerIndex: index
        });
    },

    updateTimer(time) {
        const el = document.getElementById('game-timer');
        el.innerText = time;
        el.style.color = time <= 5 ? 'var(--accent)' : 'var(--text)';
    },

    showFeedback(data) {
        // data.correctIndex - правильный ответ
        // data.playerResults - кто как ответил
        const correctBtn = document.getElementById(`ans-${data.correctIndex}`);
        if (correctBtn) correctBtn.classList.add('correct');

        const myResult = data.playerResults.find(r => r.id === this.myId);
        if (myResult) {
            this.score = myResult.totalScore;
            document.getElementById('my-score').innerText = `Очки: ${this.score}`;
            
            // Если ответил неверно, подсветим свой выбор красным
            if (!myResult.isCorrect && myResult.lastAnswer !== null) {
                const wrongBtn = document.getElementById(`ans-${myResult.lastAnswer}`);
                if (wrongBtn) wrongBtn.classList.add('wrong');
            }
        }
    },

    showResults(results) {
        this.showScreen('screen-results');
        const list = document.getElementById('leaderboard');
        // Сортировка по очкам
        results.sort((a,b) => b.score - a.score);
        list.innerHTML = results.map((r, i) => `
            <div class="leader-row">
                <span>${i+1}. ${r.name}</span>
                <span>${r.score}</span>
            </div>
        `).join('');
    },

    leaveRoom() {
        if (confirm("Выйти из игры?")) location.reload();
    }
};

app.init();
