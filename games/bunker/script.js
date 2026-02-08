let players = [];
let roles = ['mafia', 'doctor', 'sheriff', 'citizen'];
let currentPhase = 'setup'; // setup, reveal, night, day
let turnIndex = 0;
let nightActions = { mafia: null, doctor: null, sheriff: null };

// --- НАСТРОЙКА ---

function addPlayerInput() {
    const container = document.getElementById('players-input-list');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Имя игрока ${container.children.length + 1}`;
    container.appendChild(input);
}

function startGame() {
    const inputs = document.querySelectorAll('#players-input-list input');
    const names = Array.from(inputs).map(i => i.value.trim()).filter(n => n);

    if (names.length < 4) {
        alert('Нужно минимум 4 игрока!');
        return;
    }

    // Генерация ролей
    let availableRoles = ['mafia']; // Обязательно одна мафия
    if (names.length >= 5) availableRoles.push('doctor');
    if (names.length >= 6) availableRoles.push('sheriff');
    if (names.length >= 7) availableRoles.push('mafia'); // Вторая мафия для больших компаний
    
    // Заполняем остаток мирными жителями
    while (availableRoles.length < names.length) {
        availableRoles.push('citizen');
    }

    // Перемешиваем
    availableRoles.sort(() => Math.random() - 0.5);

    players = names.map((name, i) => ({
        id: i,
        name: name,
        role: availableRoles[i],
        isAlive: true
    }));

    turnIndex = 0;
    switchScreen('role-reveal-screen');
    showNextReveal();
}

// --- РАЗДАЧА РОЛЕЙ ---

function showNextReveal() {
    if (turnIndex >= players.length) {
        startNight();
        return;
    }
    document.getElementById('reveal-name').innerText = players[turnIndex].name;
    document.getElementById('role-info').classList.add('hidden');
    document.getElementById('show-role-btn').style.display = 'block';
}

function revealRole() {
    const player = players[turnIndex];
    const title = document.getElementById('role-title');
    const desc = document.getElementById('role-desc');

    title.innerText = getRoleName(player.role).toUpperCase();
    title.className = `role-${player.role}`;
    
    if (player.role === 'mafia') desc.innerText = 'Ваша цель: убить всех мирных. Ночью вы выбираете жертву.';
    else if (player.role === 'doctor') desc.innerText = 'Ваша цель: спасать людей. Ночью вы можете вылечить одного игрока.';
    else if (player.role === 'sheriff') desc.innerText = 'Ваша цель: найти мафию. Ночью вы проверяете одного игрока.';
    else desc.innerText = 'Ваша цель: вычислить мафию днем и выжить.';

    document.getElementById('role-info').classList.remove('hidden');
    document.getElementById('show-role-btn').style.display = 'none';
}

function nextRole() {
    turnIndex++;
    showNextReveal();
}

// --- НОЧЬ ---

function startNight() {
    currentPhase = 'night';
    nightActions = { mafia: null, doctor: null, sheriff: null };
    turnIndex = 0; // Используем как этап ночи (0: Мафия, 1: Доктор, 2: Шериф)
    processNightTurn();
}

function processNightTurn() {
    // Пропускаем этапы, если роль мертва или не существует
    const rolesOrder = ['mafia', 'doctor', 'sheriff'];
    
    // Ищем следующую активную роль
    while (turnIndex < rolesOrder.length) {
        const currentRole = rolesOrder[turnIndex];
        const rolePlayer = players.find(p => p.role === currentRole && p.isAlive);
        
        if (rolePlayer) {
            setupNightAction(currentRole, rolePlayer);
            return;
        }
        turnIndex++;
    }

    // Если все походили -> День
    calculateNightResults();
}

function setupNightAction(role, player) {
    switchScreen('night-screen');
    const title = document.getElementById('night-phase-title');
    const grid = document.getElementById('night-targets');
    grid.innerHTML = '';

    if (role === 'mafia') title.innerText = 'Мафия выбирает жертву';
    if (role === 'doctor') title.innerText = 'Доктор выбирает кого лечить';
    if (role === 'sheriff') title.innerText = 'Шериф выбирает кого проверить';

    players.forEach(p => {
        if (!p.isAlive) return;
        
        const btn = document.createElement('button');
        btn.className = 'target-btn';
        btn.innerText = p.name;
        btn.onclick = () => {
            if (role === 'sheriff') {
                alert(`${p.name} - это ${p.role === 'mafia' ? 'МАФИЯ!' : 'Мирный.'}`);
            }
            nightActions[role] = p.id;
            // Переход хода ночи (простая реализация: просто следующий этап)
            // В реальной игре нужно передавать устройство, тут для скорости просто меняем экран
            alert('Принято. Передайте устройство следующему (или ведущему).');
            turnIndex++;
            processNightTurn();
        };
        grid.appendChild(btn);
    });
}

function calculateNightResults() {
    let message = '';
    const victimId = nightActions.mafia;
    const healedId = nightActions.doctor;

    if (victimId !== null) {
        if (victimId === healedId) {
            message = 'Ночью мафия пыталась убить кого-то, но Доктор спас его!';
        } else {
            const victim = players.find(p => p.id === victimId);
            victim.isAlive = false;
            message = `Ночью был убит: ${victim.name}.`;
        }
    } else {
        message = 'Этой ночью никто не умер.';
    }

    startDay(message);
}

// --- ДЕНЬ ---

function startDay(msg) {
    checkWinCondition();
    if (currentPhase === 'gameover') return;

    currentPhase = 'day';
    switchScreen('day-screen');
    document.getElementById('day-log').innerText = msg;
    
    const grid = document.getElementById('voting-targets');
    grid.innerHTML = '';

    players.forEach(p => {
        if (!p.isAlive) return;
        const btn = document.createElement('button');
        btn.className = 'target-btn';
        btn.innerText = `Голосовать против: ${p.name}`;
        btn.onclick = () => executeVote(p.id);
        grid.appendChild(btn);
    });
}

function executeVote(id) {
    if (!confirm('Вы уверены, что хотите казнить этого игрока?')) return;
    
    const player = players.find(p => p.id === id);
    player.isAlive = false;
    alert(`${player.name} был казнен. Он был: ${getRoleName(player.role)}.`);
    
    if (!checkWinCondition()) {
        startNight();
    }
}

function skipVoting() {
    alert('Голосование пропущено.');
    startNight();
}

// --- УТИЛИТЫ ---

function checkWinCondition() {
    const mafiaCount = players.filter(p => p.role === 'mafia' && p.isAlive).length;
    const civilianCount = players.filter(p => p.role !== 'mafia' && p.isAlive).length;

    if (mafiaCount === 0) {
        endGame('Мирные жители');
        return true;
    }
    if (mafiaCount >= civilianCount) {
        endGame('Мафия');
        return true;
    }
    return false;
}

function endGame(winner) {
    currentPhase = 'gameover';
    switchScreen('game-over-screen');
    document.getElementById('winner-text').innerText = `Победили: ${winner}!`;
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function getRoleName(role) {
    const names = {
        'mafia': 'Мафия',
        'doctor': 'Доктор',
        'sheriff': 'Шериф',
        'citizen': 'Мирный житель'
    };
    return names[role];
}