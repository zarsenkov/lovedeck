// // Подключение и глобальные переменные
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let myRoom = "";
let isHost = false;
let canSwipe = false;

// // Предотвращение засыпания экрана
async function keepAwake() {
    try { if ('wakeLock' in navigator) await navigator.wakeLock.request('screen'); } catch (err) {}
}

// // Смена экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    keepAwake();
}

// // Авторизация
function auth(create) {
    const name = document.getElementById('player-name').value;
    const roomInput = document.getElementById('join-room-id').value;
    if (!name) return alert("Введите имя");
    
    myRoom = create ? Math.floor(1000 + Math.random() * 9000).toString() : roomInput;
    isHost = create;
    
    socket.emit('alias-join', { roomId: myRoom, playerName: name });
}

// // Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-number').innerText = myRoom;
    
    const list = document.getElementById('team-list');
    list.innerHTML = "";
    
    [1, 2].forEach(tNum => {
        const team = data.teams[tNum];
        const players = data.players.filter(p => p.team === tNum).map(p => p.name).join(", ");
        
        const box = document.createElement('div');
        box.className = "team-ready-box";
        box.innerHTML = `
            ${isHost ? `<input value="${team.name}" onchange="updateTeamName(${tNum}, this.value)">` : `<h4>${team.name}</h4>`}
            <div>${players || "Пусто"}</div>
        `;
        list.appendChild(box);
    });

    if(isHost) {
        document.getElementById('host-controls').classList.remove('hidden');
        document.getElementById('wait-msg').classList.add('hidden');
    }
});

// // Хост меняет название команды
function updateTeamName(num, name) {
    // В данной версии упрощено: можно добавить emit, если нужно сохранять названия на сервере
}

// // Хост запускает игру
function startGame() {
    const t = document.getElementById('setup-timer').value;
    const r = document.getElementById('setup-rounds').value;
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    socket.emit('alias-start', { roomId: myRoom, words, timer: t, maxRounds: r });
}

// // Экран подготовки
socket.on('alias-prep-screen', data => {
    toScreen('screen-prep');
    document.getElementById('prep-team').innerText = data.teamName;
    document.getElementById('prep-player').innerText = data.playerName;
});

// // Новый ход (слово)
socket.on('alias-new-turn', data => {
    toScreen('screen-game');
    const card = document.getElementById('word-display');
    const info = document.getElementById('swipe-info');
    
    // Свайпать может только один человек из команды угадывающих (назначается сервером)
    // В этой версии упростим: активный игрок объясняет, а ВТОРОЙ игрок команды (или случайный из другой) свайпает
    // Чтобы не усложнять, сервер шлет флаг isSwiper
    
    if (data.activePlayerId === socket.id) {
        card.innerText = data.word;
        info.innerText = "ТЫ ОБЪЯСНЯЕШЬ!";
        canSwipe = false;
    } else if (data.isSwiper) {
        card.innerText = "СЛУШАЙ И СВАЙПАЙ";
        info.innerText = "ТЫ УГАДЫВАЕШЬ (СВАЙП)";
        canSwipe = true;
    } else {
        card.innerText = "ЖДИ...";
        info.innerText = "Смотри на экран друга";
        canSwipe = false;
    }
});

// // Логика свайпа
let startX = 0;
const card = document.getElementById('main-card');

card.addEventListener('touchstart', e => { if(!canSwipe) return; startX = e.touches[0].clientX; });
card.addEventListener('touchmove', e => {
    if(!canSwipe) return;
    let move = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${move}px) rotate(${move/10}deg)`;
});
card.addEventListener('touchend', e => {
    if(!canSwipe) return;
    let move = e.changedTouches[0].clientX - startX;
    if (Math.abs(move) > 100) {
        socket.emit('alias-action', { roomId: myRoom, isCorrect: move > 0 });
    }
    card.style.transform = "";
});

// // Таймер и счет
socket.on('alias-timer-tick', d => document.getElementById('timer').innerText = `00:${d.timeLeft}`);
socket.on('alias-update-score', d => document.getElementById('current-points').innerText = d.score);

// // Финал
socket.on('alias-game-over', data => {
    toScreen('screen-results');
    document.getElementById('final-results').innerHTML = `
        <div class="team-ready-box"> ПОБЕДИТЕЛЬ: ${data.winner} </div>
        <p>${data.team1Name}: ${data.team1Score}</p>
        <p>${data.team2Name}: ${data.team2Score}</p>
    `;
});
