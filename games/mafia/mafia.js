let mafiaGame = {
    players: [],
    currentPlayer: 0,
    nightActions: { killed: "", healed: "", blocked: "", checked: "", maniacKilled: "" },
    timerInterval: null,
    selectedForVote: null,
    speakerIndex: 0
};

const ROLE_DATA = {
    mafia: { title: "МАФИЯ", icon: "fas fa-user-ninja", desc: "Скрывайтесь днем, убивайте ночью." },
    citizen: { title: "МИРНЫЙ", icon: "fas fa-users", desc: "Найдите преступников силой логики." },
    doctor: { title: "ДОКТОР", icon: "fas fa-medkit", desc: "Лечите одного игрока каждую ночь." },
    commissar: { title: "КОМИССАР", icon: "fas fa-search", desc: "Проверяйте роли игроков ночью." },
    prostitute: { title: "ПУТАНА", icon: "fas fa-glass-cheers", desc: "Блокируйте способности игрока." },
    maniac: { title: "МАНЬЯК", icon: "fas fa-skull", desc: "Одинокий убийца. Сам за себя." }
};

const SCRIPTS = {
    morning: [
        "«Город просыпается, но не для всех это утро стало добрым... {result}»",
        "«Кровавая заря над нашим городом. Жители в панике обсуждают новости: {result}»",
        "«Этой ночью тишину нарушали лишь выстрелы и крики. {result}»"
    ],
    execution: [
        "«Толпа неумолима. Под крики и обвинения город покидает {name}. Был ли он виновен? Мы узнаем это позже...»",
        "«Правосудие совершилось. {name} отправляется в изгнание. Посмотрим, станет ли в городе спокойнее...»"
    ],
    night_start: "«Наступает ночь. Весь город засыпает... Спите крепко, ведь не все увидят рассвет.»"
};

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
    mafiaGame.tempRoles = roles.slice(0, val);
    document.getElementById('rolesGrid').innerHTML = mafiaGame.tempRoles.map(r => `<span class="p-tag">${ROLE_DATA[r].title}</span>`).join('');
}

function startDistribution() {
    let shuffled = [...mafiaGame.tempRoles].sort(() => Math.random() - 0.5);
    mafiaGame.players = shuffled.map((r, i) => ({
        id: i,
        name: document.getElementById(`pname-${i+1}`).value.trim() || `Игрок ${i+1}`,
        role: r,
        alive: true
    }));
    mafiaGame.currentPlayer = 0;
    updateCard();
    switchPage('distribute');
}

function updateCard() {
    const p = mafiaGame.players[mafiaGame.currentPlayer];
    document.getElementById('distributeName').innerText = p.name;
    const data = ROLE_DATA[p.role];
    document.getElementById('roleTitle').innerText = data.title;
    document.getElementById('roleDesc').innerText = data.desc;
    document.getElementById('roleIcon').innerHTML = `<i class="${data.icon}"></i>`;
    document.getElementById('cardInner').classList.remove('is-flipped');
}

function revealRole() { document.getElementById('cardInner').classList.add('is-flipped'); }

function nextPlayer() {
    mafiaGame.currentPlayer++;
    if(mafiaGame.currentPlayer < mafiaGame.players.length) updateCard();
    else startNight();
}

// === НОЧЬ ===
function startNight() {
    mafiaGame.nightActions = { killed: "", healed: "", blocked: "", checked: "", maniacKilled: "" };
    switchPage('night');
    const alive = mafiaGame.players.filter(p => p.alive);
    const list = document.getElementById('nightActionList');
    
    // Генерируем опции: Имя (Роль)
    const optionsHtml = alive.map(p => `<option value="${p.id}">${p.name} (${ROLE_DATA[p.role].title})</option>`).join('');

    let html = `<div class="night-step"><span class="script-hint">${SCRIPTS.night_start}</span></div>`;
    
    const steps = [
        { id: 'prostitute', key: 'blocked', label: 'ПУТАНА', hint: '«Просыпается путана. Кого она лишит хода?»' },
        { id: 'mafia', key: 'killed', label: 'МАФИЯ', hint: '«Просыпается мафия. Кто сегодня не проснется?»' },
        { id: 'commissar', key: 'checked', label: 'КОМИССАР', hint: '«Просыпается комиссар. Чьи документы проверим?»', special: true },
        { id: 'doctor', key: 'healed', label: 'ДОКТОР', hint: '«Просыпается доктор. Кого будем спасать?»' },
        { id: 'maniac', key: 'maniacKilled', label: 'МАНЬЯК', hint: '«Просыпается маньяк. Кто его новая цель?»' }
    ];

    steps.forEach(s => {
        if(s.id !== 'mafia' && !mafiaGame.players.some(p => p.role === s.id && p.alive)) return;
        
        html += `<div class="night-step">
            <span class="script-hint">${s.hint}</span>
            <p>${s.label}:</p>`;
            
        if(s.special) {
            html += `<div class="check-row">
                <select id="commissarSelect" onchange="mafiaGame.nightActions.checked = this.value">
                    <option value="">Никто</option>${optionsHtml}
                </select>
                <button class="check-btn" onclick="runCommissarCheck()">УЗНАТЬ</button>
            </div><div id="checkResult" class="check-result"></div>`;
        } else {
            html += `<select onchange="mafiaGame.nightActions.${s.key} = this.value">
                <option value="">Никто</option>${optionsHtml}
            </select>`;
        }
        html += `</div>`;
    });
    list.innerHTML = html;
}

function runCommissarCheck() {
    const id = document.getElementById('commissarSelect').value;
    const res = document.getElementById('checkResult');
    if(id === "") return;
    res.innerHTML = mafiaGame.players[id].role === 'mafia' ? 
        '<span class="res-bad">МАФИЯ! <i class="fas fa-skull"></i></span>' : 
        '<span class="res-good">ЧИСТ <i class="fas fa-check"></i></span>';
}

function processNight() {
    let { killed, healed, blocked, maniacKilled } = mafiaGame.nightActions;
    let deaths = [];

    if(blocked !== "") {
        const role = mafiaGame.players[blocked].role;
        if(role === 'mafia') killed = "";
        if(role === 'doctor') healed = "";
        if(role === 'maniac') maniacKilled = "";
    }

    if(killed !== "" && killed !== healed) deaths.push(parseInt(killed));
    if(maniacKilled !== "" && maniacKilled !== healed && !deaths.includes(parseInt(maniacKilled))) deaths.push(parseInt(maniacKilled));

    let resultMsg = deaths.length === 0 ? "Никто не пострадал. Все живы!" : 
        "Убиты: " + deaths.map(id => `<b>${mafiaGame.players[id].name}</b>`).join(', ');

    deaths.forEach(id => mafiaGame.players[id].alive = false);
    document.getElementById('morningReport').innerHTML = SCRIPTS.morning[Math.floor(Math.random()*SCRIPTS.morning.length)].replace("{result}", resultMsg);
    switchPage('morning');
}

// === ДЕНЬ ===
function startDay() {
    if(checkVictory()) return;
    switchPage('day');
    mafiaGame.selectedForVote = null;
    mafiaGame.speakerIndex = 0;
    renderDayList();
}

function renderDayList() {
    const list = document.getElementById('dayPlayerList');
    list.innerHTML = mafiaGame.players.map(p => `
        <div class="vote-card ${!p.alive ? 'dead' : ''} ${mafiaGame.selectedForVote == p.id ? 'selected' : ''}" onclick="selectVote(${p.id})">
            <div>
                <div style="font-weight:900">${p.name} ${!p.alive ? `(${ROLE_DATA[p.role].title})` : ''}</div>
                <div style="font-size:9px; color:#666">${p.alive ? 'ЖИВ' : 'ПОКИНУЛ ГОРОД'}</div>
            </div>
            ${p.alive ? `<button class="timer-trigger" onclick="runTimer(event, '${p.name}')">СЛОВО</button>` : ''}
        </div>
    `).join('');
}

function runTimer(e, name) {
    e.stopPropagation();
    document.getElementById('timerLabel').innerText = `ГОВОРИТ: ${name}`;
    let t = 60;
    const box = document.getElementById('dayTimer');
    clearInterval(mafiaGame.timerInterval);
    mafiaGame.timerInterval = setInterval(() => {
        t--;
        box.innerText = t;
        if(t <= 0) { clearInterval(mafiaGame.timerInterval); box.innerText = "0"; }
    }, 1000);
}

function selectVote(id) {
    if(!mafiaGame.players[id].alive) return;
    mafiaGame.selectedForVote = id;
    renderDayList();
}

function confirmVote() {
    if(mafiaGame.selectedForVote === null) return alert("Выберите жертву голосования");
    const p = mafiaGame.players[mafiaGame.selectedForVote];
    const script = SCRIPTS.execution[Math.floor(Math.random()*SCRIPTS.execution.length)].replace("{name}", `<b>${p.name}</b>`);
    
    if(confirm(`Город решил казнить ${p.name}?`)) {
        p.alive = false;
        alert(script);
        if(!checkVictory()) startNight();
    }
}

function checkVictory() {
    const alive = mafiaGame.players.filter(p => p.alive);
    const mCount = alive.filter(p => p.role === 'mafia').length;
    const cCount = alive.length - mCount;

    if(mCount === 0) return finishGame("МИРНЫЕ ВЫИГРАЛИ", "fas fa-shield-alt");
    if(mCount >= cCount) return finishGame("МАФИЯ ВЫИГРАЛА", "fas fa-user-ninja");
    return false;
}

function finishGame(txt, icon) {
    switchPage('final');
    document.getElementById('winText').innerText = txt;
    document.getElementById('winIcon').innerHTML = `<i class="${icon}"></i>`;
    return true;
}

function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id + 'Screen').classList.add('active');
    clearInterval(mafiaGame.timerInterval);
    document.getElementById('dayTimer').innerText = "60";
    document.getElementById('timerLabel').innerText = "ВРЕМЯ ИГРОКА";
}

initPlayerInputs();
