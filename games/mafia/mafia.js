// 1. Глобальный объект игры (теперь точно 'game')
let game = {
    players: [],
    currentPlayer: 0,
    nightActions: { killed: "", healed: "", blocked: "", checked: "", maniacKilled: "" },
    timer: 60,
    timerActive: false,
    interval: null,
    selectedForVote: null,
    speakerIdx: -1
};

const ROLES = {
    mafia: { title: "МАФИЯ", icon: "fas fa-user-ninja", desc: "Убивайте ночью, путайте днем." },
    citizen: { title: "МИРНЫЙ", icon: "fas fa-users", desc: "Найдите мафию в ходе обсуждения." },
    doctor: { title: "ДОКТОР", icon: "fas fa-medkit", desc: "Может спасти одного человека за ночь." },
    commissar: { title: "КОМИССАР", icon: "fas fa-search", desc: "Узнает роли игроков ночью." },
    prostitute: { title: "ПУТАНА", icon: "fas fa-glass-cheers", desc: "Блокирует способности игрока." },
    maniac: { title: "МАНЬЯК", icon: "fas fa-skull", desc: "Убивает всех. Играет за себя." }
};

// --- ПОДГОТОВКА ---
function initPlayerInputs() {
    const val = parseInt(document.getElementById('playerRange').value);
    document.getElementById('playerCountLabel').innerText = val;
    const grid = document.getElementById('playerInputsGrid');
    grid.innerHTML = Array.from({length: val}, (_, i) => 
        `<input type="text" class="name-input" placeholder="Игрок ${i+1}" id="pname-${i+1}">`
    ).join('');
    updateRolesPreview();
}

function updateRolesPreview() {
    const val = parseInt(document.getElementById('playerRange').value);
    let roles = [];
    let mCount = Math.max(1, Math.floor(val / 3));
    for(let i=0; i<mCount; i++) roles.push('mafia');
    if(document.getElementById('check-doctor').checked) roles.push('doctor');
    if(document.getElementById('check-commissar').checked) roles.push('commissar');
    if(document.getElementById('check-prostitute').checked) roles.push('prostitute');
    if(document.getElementById('check-maniac').checked) roles.push('maniac');
    while(roles.length < val) roles.push('citizen');
    game.tempRoles = roles.slice(0, val);
    document.getElementById('rolesGrid').innerHTML = game.tempRoles.map(r => `<span class="p-tag">${ROLES[r].title}</span>`).join('');
}

function startDistribution() {
    let shuffled = [...game.tempRoles].sort(() => Math.random() - 0.5);
    game.players = shuffled.map((r, i) => ({
        id: i,
        name: document.getElementById(`pname-${i+1}`).value.trim() || `Игрок ${i+1}`,
        role: r,
        alive: true
    }));
    game.currentPlayer = 0;
    updateCard();
    switchPage('distribute');
}

// --- КАРТОЧКИ (С ТАПОМ ДЛЯ ПЕРЕВОРОТА) ---
function toggleCard() {
    const card = document.getElementById('cardInner');
    const nextBtn = document.getElementById('nextPlayerBtn');
    card.classList.toggle('is-flipped');
    nextBtn.style.display = card.classList.contains('is-flipped') ? 'block' : 'none';
}

// Обновление данных внутри карты
function updateCard() {
    const p = game.players[game.currentPlayer];
    document.getElementById('distributeName').innerText = p.name;
    const data = ROLES[p.role];
    document.getElementById('roleTitle').innerText = data.title;
    document.getElementById('roleDesc').innerText = data.desc;
    document.getElementById('roleIcon').innerHTML = `<i class="${data.icon}"></i>`;
}

function nextPlayer(event) {
    if(event) event.stopPropagation();
    
    const cardInner = document.getElementById('cardInner');
    const nextBtn = document.getElementById('nextPlayerBtn');

    // 1. Сначала визуально закрываем карту
    cardInner.classList.remove('is-flipped');
    nextBtn.style.display = 'none';

    // 2. Ждем завершения анимации переворота (0.6s в CSS), прежде чем менять данные
    setTimeout(() => {
        game.currentPlayer++;
        
        if(game.currentPlayer < game.players.length) {
            updateCard(); // Обновляем текст, когда карта уже закрыта
        } else {
            startNight();
        }
    }, 400); // 400ms достаточно, чтобы смена текста произошла в "невидимой" фазе
}

// --- НОЧЬ ---
function startNight() {
    game.nightActions = { killed: "", healed: "", blocked: "", checked: "", maniacKilled: "" };
    switchPage('night');
    const alive = game.players.filter(p => p.alive);
    const list = document.getElementById('nightActionList');
    const options = alive.map(p => `<option value="${p.id}">${p.name} (${ROLES[p.role].title})</option>`).join('');

    const steps = [
        { id: 'prostitute', key: 'blocked', h: 'Просыпается путана...' },
        { id: 'mafia', key: 'killed', h: 'Мафия выбирает жертву...' },
        { id: 'commissar', key: 'checked', h: 'Комиссар проверяет...', special: true },
        { id: 'doctor', key: 'healed', h: 'Доктор идет на помощь...' },
        { id: 'maniac', key: 'maniacKilled', h: 'Маньяк ищет цель...' }
    ];

    list.innerHTML = steps.map(s => {
        if(s.id !== 'mafia' && !game.players.some(p => p.role === s.id && p.alive)) return '';
        return `
            <div class="night-step">
                <span class="script-hint">${s.h}</span>
                <p>${s.id.toUpperCase()}:</p>
                ${s.special ? `
                    <div class="check-row"><select id="commCheck" onchange="game.nightActions.checked = this.value"><option value="">Никто</option>${options}</select>
                    <button class="check-btn" onclick="doCheck()">УЗНАТЬ</button></div><div id="checkRes" class="check-result"></div>
                ` : `<select onchange="game.nightActions.${s.key} = this.value"><option value="">Никто</option>${options}</select>`}
            </div>`;
    }).join('');
}

function doCheck() {
    const id = document.getElementById('commCheck').value;
    if(!id) return;
    const isMafia = game.players[id].role === 'mafia';
    document.getElementById('checkRes').innerHTML = isMafia ? '<span class="res-bad">МАФИЯ!</span>' : '<span class="res-good">ЧИСТ</span>';
}

function processNight() {
    let { killed, healed, blocked, maniacKilled } = game.nightActions;
    let deaths = [];
    if(blocked !== "") {
        const r = game.players[blocked].role;
        if(r === 'mafia') killed = ""; if(r === 'doctor') healed = ""; if(r === 'maniac') maniacKilled = "";
    }
    if(killed !== "" && killed !== healed) deaths.push(parseInt(killed));
    if(maniacKilled !== "" && maniacKilled !== healed && !deaths.includes(parseInt(maniacKilled))) deaths.push(parseInt(maniacKilled));

    let msg = deaths.length === 0 ? "Ночь прошла спокойно, все живы." : "Город понес потери: " + deaths.map(id => `<b>${game.players[id].name}</b>`).join(', ');
    deaths.forEach(id => game.players[id].alive = false);
    document.getElementById('morningReport').innerHTML = msg;
    switchPage('morning');
}

// --- ДЕНЬ И ТАЙМЕР ---
function startDay() {
    if(checkWin()) return;
    switchPage('day');
    game.speakerIdx = -1;
    game.selectedForVote = null;
    resetTimer();
    renderDayList();
}

function renderDayList() {
    const list = document.getElementById('dayPlayerList');
    list.innerHTML = game.players.map(p => `
        <div class="vote-card ${!p.alive ? 'dead' : ''} ${game.selectedForVote == p.id ? 'selected' : ''}" onclick="game.selectedForVote = ${p.id}; renderDayList()">
            <div style="font-weight:900">${p.name}</div>
            <div style="font-size:9px; color:#666">${p.alive ? 'В ИГРЕ' : 'ПОКИНУЛ ГОРОД (' + ROLES[p.role].title + ')'}</div>
        </div>
    `).join('');
}

function toggleTimer() {
    const btn = document.getElementById('playPauseBtn');
    if(game.timerActive) {
        clearInterval(game.interval);
        btn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        game.interval = setInterval(() => {
            game.timer--;
            document.getElementById('dayTimer').innerText = game.timer;
            if(game.timer <= 0) { clearInterval(game.interval); showModal('fas fa-clock', 'Время игрока истекло!'); }
        }, 1000);
        btn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    game.timerActive = !game.timerActive;
}

function resetTimer() {
    clearInterval(game.interval);
    game.timer = 60;
    game.timerActive = false;
    document.getElementById('dayTimer').innerText = "60";
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
}

function nextSpeaker() {
    const alivePlayers = game.players.filter(p => p.alive);
    game.speakerIdx++;
    if(game.speakerIdx >= alivePlayers.length) game.speakerIdx = 0;
    
    document.getElementById('timerLabel').innerText = `ГОВОРИТ: ${alivePlayers[game.speakerIdx].name}`;
    resetTimer();
    toggleTimer(); 
}

// --- КРАСИВОЕ УВЕДОМЛЕНИЕ О КАЗНИ ---
function confirmVote() {
    if (game.selectedForVote === null) return;
    const p = game.players[game.selectedForVote];
    
    if (confirm(`Выгнать игрока ${p.name}?`)) {
        p.alive = false;
        const templates = [
            `Толпа неумолима. Под крики город покидает <b>${p.name}</b>.`,
            `Правосудие свершилось. <b>${p.name}</b> отправляется в изгнание.`,
            `Город сделал выбор. <b>${p.name}</b> больше не с нами.`
        ];
        const resText = templates[Math.floor(Math.random() * templates.length)] + `<br><br>ОН БЫЛ: <b>${ROLES[p.role].title}</b>`;
        showModal('fas fa-gavel', resText);
    }
}

// --- ФИНАЛ И МОДАЛКИ ---
function checkWin() {
    const alive = game.players.filter(p => p.alive);
    const m = alive.filter(p => p.role === 'mafia').length;
    const c = alive.length - m;
    if(m === 0) return showWin("МИРНЫЕ ВЫИГРАЛИ", "fas fa-shield-alt");
    if(m >= c) return showWin("МАФИЯ ВЫИГРАЛА", "fas fa-user-ninja");
    return false;
}

function showWin(t, i) {
    switchPage('final');
    document.getElementById('winText').innerText = t;
    document.getElementById('winIcon').innerHTML = `<i class="${i}"></i>`;
    return true;
}

function showModal(icon, text) {
    document.getElementById('modalIcon').className = 'modal-icon ' + icon;
    document.getElementById('modalText').innerHTML = text;
    document.getElementById('gameModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('gameModal').style.display = 'none';
    if(!checkWin()) {
        if (document.getElementById('dayScreen').classList.contains('active')) {
            startNight(); // Если закрыли после казни — идем в ночь
        }
    }
}

function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id + 'Screen').classList.add('active');
}

initPlayerInputs();