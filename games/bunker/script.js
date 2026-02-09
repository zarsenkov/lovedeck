const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ['websocket', 'polling'] });

const app = {
    myId: null,
    roomId: null,
    gameData: null,

    init() {
        socket.on('connect', () => this.myId = socket.id);
        socket.on('bunker-room-data', (data) => this.updateLobby(data));
        socket.on('bunker-game-start', (data) => this.startGame(data));
        socket.on('bunker-update-data', (data) => this.refreshUI(data));
        socket.on('log_msg', (msg) => alert(msg));
        socket.on('error_msg', (msg) => alert(msg));
    },

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    createRoom() {
        const name = document.getElementById('username').value.trim();
        if (name) socket.emit('bunker-create', { playerName: name });
    },

    joinRoom() {
        const name = document.getElementById('username').value.trim();
        const code = document.getElementById('room-input').value.trim().toUpperCase();
        if (name && code) socket.emit('bunker-join', { roomId: code, playerName: name });
    },

    updateLobby(room) {
        this.roomId = room.id;
        document.getElementById('display-code').innerText = room.id;
        document.getElementById('room-badge').classList.remove('hidden');
        
        const list = document.getElementById('player-list');
        list.innerHTML = room.players.map(p => `<div>> ${p.name} ${p.id === this.myId ? '(ВЫ)' : ''}</div>`).join('');
        
        const isHost = room.hostId === this.myId;
        document.getElementById('start-btn').classList.toggle('hidden', !isHost || room.players.length < 2);
        document.getElementById('wait-msg').classList.toggle('hidden', isHost && room.players.length >= 2);
        
        this.showScreen('screen-lobby');
    },

    startGame() {
        socket.emit('bunker-start', this.roomId);
    },

    startGame(data) {
        this.gameData = data;
        this.showScreen('screen-game');
        document.getElementById('dis-name').innerText = data.disaster.name;
        this.refreshUI(data);
    },

    reveal(trait) {
        socket.emit('bunker-reveal', { roomId: this.roomId, trait });
    },

    showWorldInfo() {
        const d = this.gameData.disaster;
        const b = this.gameData.bunker;
        document.getElementById('modal-title').innerText = d.name;
        document.getElementById('modal-desc').innerText = d.desc;
        document.getElementById('modal-extra').innerHTML = `
            <hr style="margin:15px 0; opacity:0.2">
            <p>> ЕДА: ${b.food}</p>
            <p>> ПЛОЩАДЬ: ${b.area}</p>
            <p>> ДОП: ${b.extra}</p>
        `;
        document.getElementById('modal-info').classList.add('active');
    },

    refreshUI(room) {
        this.gameData = room;
        const me = room.players.find(p => p.id === this.myId);
        
        // Личные данные
        const traits = ['prof', 'bio', 'health', 'hobby', 'phobia', 'luggage', 'special'];
        traits.forEach(t => {
            const el = document.getElementById(`my-${t}`);
            if (me.revealed.includes(t)) {
                el.innerText = me.character[t];
                el.parentElement.style.borderColor = "var(--primary)";
            } else {
                el.innerText = me.character[t] + " (СКРЫТО)";
                el.parentElement.style.borderColor = "rgba(255,140,0,0.2)";
            }
        });

        // Общий стол
        const table = document.getElementById('game-table');
        table.innerHTML = room.players.map(p => `
            <div class="player-card ${p.isOut ? 'is-out' : ''}">
                <b>${p.name}</b>
                ${!p.isOut && p.id !== this.myId ? `<div class="vote-btn" onclick="app.vote('${p.id}')">ИЗГНАТЬ</div>` : ''}
                <div style="font-size:11px; margin-top:5px; line-height:1.4">
                    <p>Профессия: ${p.revealed.includes('prof') ? p.character.prof : '???'}</p>
                    <p>Био: ${p.revealed.includes('bio') ? p.character.bio : '???'}</p>
                    <p>Здоровье: ${p.revealed.includes('health') ? p.character.health : '???'}</p>
                    <p>Хобби: ${p.revealed.includes('hobby') ? p.character.hobby : '???'}</p>
                    ${p.revealed.includes('luggage') ? `<p>Багаж: ${p.character.luggage}</p>` : ''}
                    ${p.revealed.includes('special') ? `<p style="color:yellow">Карта: ${p.character.special}</p>` : ''}
                </div>
            </div>
        `).join('');
    },

    vote(targetId) {
        if (confirm("Выгнать этого игрока из бункера навсегда?")) {
            socket.emit('bunker-vote', { roomId: this.roomId, targetId });
        }
    },

    exit() {
        if (confirm("Выйти в главное меню? Прогресс будет потерян.")) location.href = "https://lovecouple.ru";
    },

    copyCode() {
        navigator.clipboard.writeText(this.roomId);
        alert("Код скопирован: " + this.roomId);
    }
};

app.init();
