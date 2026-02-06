let mafiaGame = {
    players: [],
    currentPlayer: 0,
    nightActions: { killed: "", healed: "", blocked: "", maniacKilled: "" },
    selectedForVote: null,
    timerInterval: null
};

const ROLE_DATA = {
    mafia: { title: "МАФИЯ", icon: "fas fa-user-ninja", desc: "Главная цель — устранить всех мирных." },
    citizen: { title: "МИРНЫЙ", icon: "fas fa-users", desc: "Ищите мафию и голосуйте днем." },
    doctor: { title: "ДОКТОР", icon: "fas fa-medkit", desc: "Лечите одного игрока ночью." },
    commissar: { title: "КОМИССАР", icon: "fas fa-search", desc: "Проверяйте роли игроков." },
    prostitute: { title: "ПУТАНА", icon: "fas fa-glass-cheers", desc: "Блокируйте способности игрока." },
    maniac: { title: "МАНЬЯК", icon: "fas fa-skull", desc: "Убивает всех. Играет за себя." }
};

// 1. Инициализация ввода имен
function initPlayerInputs() {
    const val = parseInt(document.getElementById('playerRange').value);
    document.getElementById('playerCountLabel').innerText = val;
    const grid = document.getElementById('playerInputsGrid');
    
    let html = "";
    for(let i=1; i<=val; i++) {
        html += `<input type="text" class="name-input" placeholder="Игрок ${i}" id="pname-${i}">`;
    }
    grid.innerHTML = html;
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
    if(roles.length > val) roles = roles.slice(0, val);

    mafiaGame.tempRoles = roles;
    document.getElementById('rolesGrid').innerHTML = roles.map(r => `<span class="p-tag">${ROLE_DATA[r].title}</span>`).join('');
}

// 2. Раздача
function startDistribution() {
    const val = parseInt(document.getElementById('playerRange').value);
    let shuffled = [...mafiaGame.tempRoles].sort(() => Math.random() - 0.5);
    
    mafiaGame.players = [];
    for(let i=1; i<=val; i++) {
        let name = document.getElementById(`pname-${i}`).value.trim();
        mafiaGame.players.push({
            id: i-1,
            name: name || `Игрок ${i}`,
            role: shuffled[i-1],
            alive: true
        });
    }
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

// 3. Ночь
function startNight() {
    mafiaGame.nightActions = { killed: "", healed: "", blocked: "", maniacKilled: "" };
    switchPage('night');
    const list = document.getElementById('nightActionList');
    const alive = mafiaGame.players.filter(p => p.alive);
    
    const steps = [
        { role: 'prostitute', key: 'blocked', label: 'ПУТАНА БЛОКИРУЕТ', script: '«Просыпается путана... Кого она лишит дара речи сегодня?»' },
        { role: 'mafia', key: 'killed', label: 'МАФИЯ УБИВАЕТ', script: '«Город засыпает. Мафия выходит на охоту. Чей сегодня будет последний вздох?»' },
        { role: 'doctor', key: 'healed', label: 'ДОКТОР ЛЕЧИТ', script: '«Мафия сделала выбор. Просыпается доктор и спешит на помощь...»' },
        { role: 'maniac', key: 'maniacKilled', label: 'МАНЬЯК УБИВАЕТ', script: '«Просыпается маньяк. Ему не нужны сообщники, только жертвы...»' }
    ];

    list.innerHTML = steps.map(s => {
        if (s.role !== 'mafia' && !mafiaGame.players.some(p => p.role === s.role)) return '';
        return `
            <div class="night-step">
                <span class="script-hint">${s.script}</span>
                <p>${s.label}:</p>
                <select onchange="mafiaGame.nightActions.${s.key} = this.value">
                    <option value="">Никто / Пропуск</option>
                    ${alive.map(p => `<option value="${p.id}">${p.name} (${ROLE_DATA[p.role].title})</option>`).join('')}
                </select>
            </div>
        `;
    }).join('');
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

    let report = "«Город просыпается... ";
    if(deaths.length === 0) {
        report += "Ночь была тихой. Ни одного выстрела, ни одного крика. Все живы!»";
    } else {
        report += "Этой ночью было совершено преступление. " + 
                  deaths.map(id => `<b>${mafiaGame.players[id].name}</b>`).join(' и ') + 
                  " больше не с нами. Город ждет объяснений.»";
    }

    deaths.forEach(id => mafiaGame.players[id].alive = false);
    document.getElementById('morningReport').innerHTML = report;
    switchPage('morning');
}

// 4. День
function startDay() {
    if(checkWinCondition()) return;
    switchPage('day');
    mafiaGame.selectedForVote = null;
    const list = document.getElementById('dayPlayerList');
    
    list.innerHTML = mafiaGame.players.map(p => `
        <div class="vote-card ${!p.alive ? 'dead' : ''}" id="voter-${p.id}" onclick="selectForVote(${p.id})">
            <div>
                <div style="font-weight:700; font-size:13px">${p.name}</div>
                <div style="font-size:9px; color:var(--muted)">${p.alive ? 'В ИГРЕ' : 'ВЫБЫЛ'}</div>
            </div>
            ${p.alive ? `<button class="timer-trigger" onclick="startTimer(event)">1 МИН</button>` : ''}
        </div>
    `).join('');
}

function startTimer(e) {
    e.stopPropagation();
    let time = 60;
    const box = document.getElementById('dayTimer');
    clearInterval(mafiaGame.timerInterval);
    
    mafiaGame.timerInterval = setInterval(() => {
        time--;
        box.innerText = time;
        if(time <= 0) {
            clearInterval(mafiaGame.timerInterval);
            box.innerText = "0";
            alert("Время игрока истекло!");
        }
    }, 1000);
}

function selectForVote(id) {
    if(!mafiaGame.players[id].alive) return;
    document.querySelectorAll('.vote-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`voter-${id}`).classList.add('selected');
    mafiaGame.selectedForVote = id;
}

function confirmVote() {
    if(mafiaGame.selectedForVote === null) return alert("Выберите, кто покинет город");
    const p = mafiaGame.players[mafiaGame.selectedForVote];
    if(confirm(`Город уверен, что ${p.name} — Мафия?`)) {
        p.alive = false;
        if(!checkWinCondition()) startNight();
    }
}

function checkWinCondition() {
    const alive = mafiaGame.players.filter(p => p.alive);
    const mCount = alive.filter(p => p.role === 'mafia').length;
    const cCount = alive.length - mCount;

    if(mCount === 0) return showWin("МИРНЫЕ ПОБЕДИЛИ", "fas fa-shield-alt");
    if(mCount >= cCount) return showWin("МАФИЯ ПОБЕДИЛА", "fas fa-user-ninja");
    return false;
}

function showWin(txt, icon) {
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
}

// Запуск
initPlayerInputs();