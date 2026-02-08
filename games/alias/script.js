// // Инициализация сокетов
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let currentRoom = "";
let isHost = false;
let canControl = false; // // Флаг: может ли игрок свайпать/жать кнопки

// // Утилита смены экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// // 1. Вход в игру
function joinGame(create) {
    const name = document.getElementById('player-name').value;
    const room = create ? Math.floor(1000 + Math.random() * 9000).toString() : document.getElementById('room-input').value;
    if (!name || !room) return alert("Заполни поля!");
    
    currentRoom = room;
    isHost = create;
    socket.emit('alias-join', { roomId: room, playerName: name });
}

// // 2. Обновление лобби
socket.on('alias-update-lobby', data => {
    toScreen('screen-lobby');
    document.getElementById('room-id-display').innerText = currentRoom;
    
    const container = document.getElementById('lobby-teams');
    container.innerHTML = "";
    
    [1, 2].forEach(tNum => {
        const team = data.teams[tNum];
        const pList = data.players.filter(p => p.team === tNum).map(p => p.name).join(", ");
        container.innerHTML += `
            <div class="team-ready-box">
                <h4>${team.name}</h4>
                <div style="font-weight:900">${pList || "Ожидание..."}</div>
            </div>
        `;
    });

    if (isHost) {
        document.getElementById('host-ui').classList.remove('hidden');
        document.getElementById('client-msg').classList.add('hidden');
    }
});

// // 3. Запуск (Хост)
function requestStart() {
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    const t = document.getElementById('set-timer').value;
    const r = document.getElementById('set-rounds').value;
    socket.emit('alias-start', { roomId: currentRoom, words, timer: t, maxRounds: r });
}

// // 4. Подготовка
socket.on('alias-prep-screen', d => {
    toScreen('screen-prep');
    document.getElementById('prep-team-name').innerText = d.teamName;
    document.getElementById('prep-player-name').innerText = d.playerName;
});

// // 5. Игровой цикл
socket.on('alias-new-turn', d => {
    toScreen('screen-game');
    const wordEl = document.getElementById('word-text');
    const roleEl = document.getElementById('role-text');
    const btns = document.getElementById('game-btns');
    
    // // Свайпать/жать кнопки может один случайный игрок из ПРОТИВОПОЛОЖНОЙ команды
    canControl = d.isSwiper;
    btns.classList.toggle('hidden', !canControl);

    if (d.activePlayerId === socket.id) {
        wordEl.innerText = d.word;
        roleEl.innerText = "ОБЪЯСНЯЙ СЛОВО!";
    } else if (canControl) {
        wordEl.innerText = "СЛУШАЙ ВНИМАТЕЛЬНО";
        roleEl.innerText = "ТЫ УГАДЫВАЕШЬ (ЖМИ/СВАЙПАЙ)";
    } else {
        wordEl.innerText = "ЖДЕМ...";
        roleEl.innerText = "Смотри за игрой";
    }
});

// // 6. Действия (Кнопки или Свайп)
function handleAction(isOk) {
    if (!canControl) return;
    socket.emit('alias-action', { roomId: currentRoom, isCorrect: isOk });
}

// // Логика Свайпа
let startX = 0;
const card = document.getElementById('word-card');
card.addEventListener('touchstart', e => { if(canControl) startX = e.touches[0].clientX; });
card.addEventListener('touchmove', e => {
    if(!canControl) return;
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
});
card.addEventListener('touchend', e => {
    if(!canControl) return;
    let x = e.changedTouches[0].clientX - startX;
    if (Math.abs(x) > 100) handleAction(x > 0);
    card.style.transform = "";
});

// // 7. Таймер и очки
socket.on('alias-timer-tick', d => {
    const m = Math.floor(d.timeLeft / 60);
    const s = d.timeLeft % 60;
    document.getElementById('timer-val').innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
});
socket.on('alias-update-score', d => document.getElementById('score-val').innerText = d.score);

// // 8. Финал
socket.on('alias-game-over', d => {
    toScreen('screen-results');
    document.getElementById('results-list').innerHTML = `
        <div class="team-ready-box">🏆 ПОБЕДА: ${d.winner}</div>
        <p style="font-weight:900">${d.team1Name}: ${d.team1Score}</p>
        <p style="font-weight:900">${d.team2Name}: ${d.team2Score}</p>
    `;
});
