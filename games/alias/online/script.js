const socket = io("https://lovecouple-server-zarsenkov.amvera.io", { transports: ['websocket', 'polling'] });
let myId, currentRoomId, myRole, wakeLock = null;

// ПРЕДОТВРАЩЕНИЕ ГАСНУЩЕГО ЭКРАНА
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) { console.log(err); }
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goBack() {
    if (document.getElementById('screen-login').classList.contains('active')) {
        window.location.href = "https://lovecouple.ru";
    } else {
        if (confirm("Выйти из комнаты?")) location.reload();
    }
}

function copyCode() {
    const code = document.getElementById('room-id-display').innerText;
    navigator.clipboard.writeText(code);
    alert("Код скопирован: " + code);
}

// ЛОББИ
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введите имя");
    requestWakeLock();
    socket.emit('create_room', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Введите имя и код");
    requestWakeLock();
    socket.emit('join_room', { roomId: code, playerName: name });
}

function updateSettings() {
    if (!currentRoomId) return;
    const settings = {
        time: parseInt(document.getElementById('set-time').value),
        goal: parseInt(document.getElementById('set-goal').value)
    };
    socket.emit('update_settings', { roomId: currentRoomId, settings });
}

function startGame() { socket.emit('start_game', currentRoomId); }

// СОБЫТИЯ
socket.on('room_created', (data) => {
    currentRoomId = data.roomId;
    document.getElementById('room-id-display').innerText = currentRoomId;
    showScreen('screen-lobby');
});

socket.on('update_settings', (s) => {
    document.getElementById('set-time').value = s.time;
    document.getElementById('set-goal').value = s.goal;
});

socket.on('update_lobby', (room) => {
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => `
        <div class="player-item">
            <span>${p.name} ${p.id === socket.id ? '<b>(ВЫ)</b>' : ''}</span>
            <span class="score">${p.score}</span>
        </div>
    `).join('');

    const isHost = room.players[0].id === socket.id;
    document.getElementById('host-settings').classList.toggle('hidden', !isHost);
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

socket.on('round_start', ({ explainerId, judgeId, players }) => {
    showScreen('screen-game');
    const card = document.getElementById('word-card');
    document.getElementById('judge-controls').classList.add('hidden');
    
    const me = players.find(p => p.id === socket.id);
    document.getElementById('game-score').innerText = `Очки: ${me.score}`;

    if (socket.id === explainerId) {
        myRole = 'explainer';
        document.getElementById('role-name').innerText = "Вы объясняете";
        document.getElementById('hint-text').innerText = "Говорите слова!";
    } else if (socket.id === judgeId) {
        myRole = 'judge';
        document.getElementById('role-name').innerText = "Вы судья";
        document.getElementById('hint-text').innerText = "Свайпайте карточку!";
        document.getElementById('judge-controls').classList.remove('hidden');
        initSwipe(card);
    } else {
        myRole = 'guesser';
        document.getElementById('role-name').innerText = "Вы угадываете";
        document.getElementById('hint-text').innerText = "Слушайте объяснение";
    }
});

socket.on('new_word', (word) => {
    document.getElementById('current-word').innerText = (myRole === 'explainer' || myRole === 'judge') ? word : "???";
    const card = document.getElementById('word-card');
    card.style.transition = 'none'; card.style.transform = 'scale(0.8)'; card.style.opacity = '0';
    setTimeout(() => { card.style.transition = '0.3s'; card.style.transform = 'scale(1)'; card.style.opacity = '1'; }, 50);
});

socket.on('timer_update', (t) => {
    const el = document.getElementById('timer');
    el.innerText = t;
    el.style.color = t < 10 ? '#ff4b2b' : 'white';
});

socket.on('game_over', ({ message, players }) => {
    showScreen('screen-results');
    document.getElementById('result-title').innerText = message;
    document.getElementById('final-scores').innerHTML = players.map(p => `<p>${p.name}: ${p.score}</p>`).join('');
});

socket.on('round_end', () => alert("Раунд завершен!"));
socket.on('error_msg', (m) => alert(m));

// ЖЕСТЫ
function handleAction(action) {
    if (myRole !== 'judge') return;
    socket.emit('word_action', { roomId: currentRoomId, action });
    animateCard(action === 'guessed' ? 200 : -200);
}

function initSwipe(el) {
    let startX = 0;
    el.ontouchstart = (e) => { startX = e.touches[0].clientX; el.style.transition = 'none'; };
    el.ontouchmove = (e) => {
        let diff = e.touches[0].clientX - startX;
        el.style.transform = `translateX(${diff}px) rotate(${diff/15}deg)`;
    };
    el.ontouchend = (e) => {
        let diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 100) handleAction(diff > 0 ? 'guessed' : 'skip');
        else { el.style.transition = '0.3s'; el.style.transform = 'none'; }
    };
}

function animateCard(x) {
    const card = document.getElementById('word-card');
    card.style.transition = '0.3s';
    card.style.transform = `translateX(${x}px) rotate(${x/10}deg)`;
    card.style.opacity = '0';
}