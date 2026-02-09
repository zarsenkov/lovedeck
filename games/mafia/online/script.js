const socket = io("https://lovecouple-server-zarsenkov.amvera.io", {
    transports: ['websocket', 'polling']
});

const app = {
    roomId: null,
    myId: null,
    myRole: null,
    isAlive: true,
    selectedVote: null,

    init() {
        socket.on('connect', () => { this.myId = socket.id; });
        socket.on('room_data', (data) => this.updateLobby(data));
        socket.on('game_start', (role) => this.revealRole(role));
        socket.on('night_phase', (players) => this.startNight(players));
        socket.on('day_phase', (data) => this.startDay(data));
        socket.on('timer_tick', (time) => this.updateTimer(time));
        socket.on('sheriff_result', (isMafia) => this.alert(isMafia ? "ОН МАФИЯ!" : "ОН МИРНЫЙ"));
        socket.on('game_over', (winner) => this.showResults(winner));
        socket.on('error', (msg) => this.alert(msg));
    },

    showPage(id) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    alert(text) {
        const modal = document.getElementById('modal-overlay');
        document.getElementById('modal-text').innerHTML = text;
        modal.style.display = 'flex';
    },

    createRoom() {
        const name = document.getElementById('username').value.trim();
        if (!name) return this.alert("Введите имя!");
        socket.emit('mafia_create', { name });
    },

    joinRoom() {
        const name = document.getElementById('username').value.trim();
        const code = document.getElementById('room-input').value.trim().toUpperCase();
        if (!name || !code) return this.alert("Заполните поля!");
        socket.emit('mafia_join', { name, roomId: code });
    },

    updateLobby(data) {
        this.roomId = data.roomId;
        document.getElementById('display-room-code').innerText = data.roomId;
        const list = document.getElementById('player-list');
        list.innerHTML = data.players.map(p => `
            <div class="player-item-row">
                <span>${p.name} ${p.id === this.myId ? '(ТЫ)' : ''}</span>
                ${p.isHost ? '<span class="host-badge">HOST</span>' : ''}
            </div>
        `).join('');

        const isHost = data.players.find(p => p.id === this.myId)?.isHost;
        document.getElementById('host-controls').style.display = isHost ? 'block' : 'none';
        document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
        this.showPage('screen-lobby');
    },

    requestStart() { socket.emit('mafia_start_game', { roomId: this.roomId }); },

    revealRole(role) {
        this.myRole = role;
        const rData = {
            'mafia': { n: 'МАФИЯ', i: 'fa-user-secret', d: 'Договоритесь с другими мафиози и устраните город.' },
            'doctor': { n: 'ДОКТОР', i: 'fa-user-md', d: 'Вы можете спасти одного человека каждую ночь.' },
            'sheriff': { n: 'ШЕРИФ', i: 'fa-shield-halved', d: 'Проверяйте игроков. Цель — найти мафию.' },
            'citizen': { n: 'МИРНЫЙ', i: 'fa-users', d: 'Найдите мафию днем и отправьте их за решетку.' }
        };
        document.getElementById('role-name').innerText = rData[role].n;
        document.getElementById('role-icon').className = `fas ${rData[role].i} role-icon`;
        document.getElementById('role-desc').innerText = rData[role].d;
        this.showPage('screen-reveal');
    },

    startNight(players) {
        this.showPage('screen-night');
        const container = document.getElementById('night-actions');
        container.innerHTML = '';

        if (!this.isAlive) {
            container.innerHTML = '<div class="center-content"><p>Мертвые не видят снов...</p></div>';
            return;
        }

        if (this.myRole === 'citizen') {
            container.innerHTML = '<div class="center-content"><i class="fas fa-moon giant-icon"></i><p>Город спит. Ждите утра.</p></div>';
            return;
        }

        // Кнопки действий для активных ролей
        const label = this.myRole === 'mafia' ? "КОГО УБРАТЬ?" : (this.myRole === 'doctor' ? "КОГО СПАСТИ?" : "КОГО ПРОВЕРИТЬ?");
        let html = `<div class="night-step"><p>${label}</p><div class="voting-grid">`;
        
        players.forEach(p => {
            if (p.id === this.myId && this.myRole !== 'doctor') return;
            html += `<button class="action-btn" onclick="app.sendNightAction('${p.id}')">${p.name}</button>`;
        });
        
        html += `</div></div>`;
        container.innerHTML = html;
    },

    sendNightAction(targetId) {
        socket.emit('mafia_night_action', { roomId: this.roomId, targetId, action: this.myRole });
        document.getElementById('night-actions').innerHTML = '<div class="center-content"><p>Действие принято. Ждем остальных...</p></div>';
    },

    startDay(data) {
        const report = data.deadName ? `Утро началось с плохих новостей. Был убит <b>${data.deadName}</b>.` : "Утро началось спокойно. Жертв нет.";
        if (data.deadId === this.myId) this.isAlive = false;
        
        document.getElementById('morning-report').innerHTML = report;
        this.showPage('screen-morning');
    },

    confirmMorning() {
        socket.emit('mafia_ready_day', { roomId: this.roomId });
        this.renderVoting();
    },

    renderVoting() {
        this.showPage('screen-day');
        socket.emit('mafia_get_alive', { roomId: this.roomId }, (players) => {
            const list = document.getElementById('voting-list');
            list.innerHTML = players.map(p => `
                <div class="vote-card ${!this.isAlive ? 'disabled' : ''}" id="v-${p.id}" onclick="app.selectVote('${p.id}')">
                    <span>${p.name}</span>
                    <i class="fas fa-gavel"></i>
                </div>
            `).join('');
        });
    },

    selectVote(id) {
        if (!this.isAlive) return;
        document.querySelectorAll('.vote-card').forEach(c => c.classList.remove('selected'));
        document.getElementById(`v-${id}`).classList.add('selected');
        this.selectedVote = id;
        document.getElementById('btn-vote').disabled = false;
    },

    submitVote() {
        socket.emit('mafia_vote', { roomId: this.roomId, targetId: this.selectedVote });
        document.getElementById('btn-vote').disabled = true;
        document.getElementById('voting-list').classList.add('disabled');
    },

    updateTimer(t) { document.getElementById('game-timer').innerText = t; },

    showResults(winner) {
        const text = winner === 'mafia' ? "МАФИЯ ПОБЕДИЛА" : "ГОРОД ПОБЕДИЛ";
        document.getElementById('winner-text').innerText = text;
        this.showPage('screen-results');
    }
};

app.init();
