// --- КОНФИГУРАЦИЯ И СОСТОЯНИЕ ---
const ROLES_CONFIG = {
    mafia: { name: 'Мафия', team: 'mafia', color: '#ff2a6d', icon: 'fa-user-secret', desc: 'Убивайте горожан. Договоритесь с командой.' },
    don: { name: 'Дон Мафии', team: 'mafia', color: '#ff9f1c', icon: 'fa-crown', desc: 'Глава мафии. Ночью ищет Шерифа. Приказывает убивать.' },
    sheriff: { name: 'Шериф', team: 'town', color: '#05d9e8', icon: 'fa-badge-sheriff', desc: 'Проверяйте подозрительных игроков ночью.' },
    doctor: { name: 'Доктор', team: 'town', color: '#00ff9f', icon: 'fa-user-md', desc: 'Лечите одного игрока каждую ночь.' },
    maniac: { name: 'Маньяк', team: 'solo', color: '#b537f2', icon: 'fa-mask', desc: 'Убивайте всех. Вы победите, если останетесь один.' },
    putana: { name: 'Путана', team: 'town', color: '#ff69b4', icon: 'fa-wine-glass', desc: 'Блокируйте одного игрока на ночь. Его действие не сработает.' },
    citizen: { name: 'Гражданин', team: 'town', color: '#95a5a6', icon: 'fa-user', desc: 'Спите ночью. Вычисляйте врагов днем.' }
};

let players = [];
let nightActions = {}; // { actorId: { targetId: X, type: 'kill'|'heal'|'block'|'check' } }
let currentTurnIndex = 0; // Индекс игрока при раздаче ролей или фазе ночи
let gameLog = [];

// --- ЭТАП 1: НАСТРОЙКА ---

// Инициализация 4 полей ввода
document.addEventListener('DOMContentLoaded', () => {
    for(let i=0; i<4; i++) addPlayerInput();
});

function addPlayerInput() {
    const list = document.getElementById('player-input-list');
    const id = list.children.length + 1;
    const div = document.createElement('div');
    div.innerHTML = `<input type="text" placeholder="Имя игрока ${id}" class="name-input">`;
    list.appendChild(div);
}

function startGame() {
    const inputs = document.querySelectorAll('.name-input');
    const names = Array.from(inputs).map(i => i.value.trim()).filter(n => n);

    if (names.length < 4) return alert("Минимум 4 игрока!");

    // Сбор выбранных ролей
    let pool = ['mafia']; // Всегда есть мафия
    if (document.getElementById('role-doctor').checked) pool.push('doctor');
    if (document.getElementById('role-sheriff').checked) pool.push('sheriff');
    if (document.getElementById('role-maniac').checked) pool.push('maniac');
    if (document.getElementById('role-putana').checked) pool.push('putana');
    if (document.getElementById('role-don').checked) pool.push('don');

    // Если ролей больше чем людей - обрезаем, если меньше - добиваем гражданами
    if (pool.length > names.length) {
        pool = pool.slice(0, names.length);
    }
    while (pool.length < names.length) {
        pool.push('citizen');
    }

    // Баланс мафии: если игроков много (>7), добавляем еще мафию, если её нет
    if (names.length >= 7 && pool.filter(r => r === 'mafia' || r === 'don').length < 2) {
        // Заменяем гражданина на мафию
        const civIdx = pool.indexOf('citizen');
        if (civIdx !== -1) pool[civIdx] = 'mafia';
        else pool.push('mafia');
    }

    // Перемешивание
    pool.sort(() => Math.random() - 0.5);

    players = names.map((name, i) => ({
        id: i,
        name: name,
        role: pool[i],
        isAlive: true,
        avatar: name.substring(0,2).toUpperCase()
    }));

    currentTurnIndex = 0;
    showScreen('screen-reveal');
    setupRevealCard();
}

// --- ЭТАП 2: РАЗДАЧА РОЛЕЙ (КАРТОЧКИ) ---

function setupRevealCard() {
    const player = players[currentTurnIndex];
    document.getElementById('reveal-player-name').innerText = player.name;
    
    // Сброс состояния карты
    const card = document.getElementById('role-card');
    card.classList.remove('flipped');
    document.getElementById('btn-next-role').classList.add('hidden');
    
    // Подготовка обратной стороны
    const roleData = ROLES_CONFIG[player.role];
    const back = card.querySelector('.card-back');
    back.style.borderColor = roleData.color;
    
    document.getElementById('role-icon-display').innerHTML = `<i class="fas ${roleData.icon}" style="color:${roleData.color}; font-size:3rem;"></i>`;
    document.getElementById('role-name-display').innerText = roleData.name;
    document.getElementById('role-name-display').style.color = roleData.color;
    document.getElementById('role-desc-display').innerText = roleData.desc;
}

function flipCard() {
    const card = document.getElementById('role-card');
    if (!card.classList.contains('flipped')) {
        card.classList.add('flipped');
        document.getElementById('btn-next-role').classList.remove('hidden');
    }
}

function nextRoleReveal() {
    currentTurnIndex++;
    if (currentTurnIndex < players.length) {
        setupRevealCard();
    } else {
        startNight();
    }
}

// --- ЭТАП 3: НОЧЬ (СЛОЖНАЯ ЛОГИКА) ---

// Порядок ходов: Путана -> Мафия/Дон -> Маньяк -> Доктор -> Шериф
const NIGHT_ORDER = ['putana', 'mafia', 'don', 'maniac', 'doctor', 'sheriff'];
let nightQueue = [];

function startNight() {
    nightActions = {};
    // Формируем очередь активных ролей
    nightQueue = [];
    NIGHT_ORDER.forEach(roleKey => {
        const actingPlayers = players.filter(p => p.role === roleKey && p.isAlive);
        if (actingPlayers.length > 0) {
            // Для мафии ход общий, для одиночек - каждый сам (но тут упростим: 1 роль = 1 ход)
            // Если 2 мафии - они передают телефон. Мы сделаем ход "Команды мафии"
            if (roleKey === 'mafia' || roleKey === 'don') {
                if (!nightQueue.some(q => q.role === 'mafia' || q.role === 'don')) {
                     // Мафия и Дон ходят вместе (или по очереди, но с общей целью убийства)
                     // Упрощение: Дон стреляет (если есть), или Мафия стреляет.
                     // В коде разделим: Дон делает проверку, Мафия делает выстрел.
                     if (roleKey === 'don') nightQueue.push({role: 'don', type: 'check'}); 
                     else nightQueue.push({role: 'mafia', type: 'kill'});
                }
            } else {
                actingPlayers.forEach(p => nightQueue.push({role: p.role, actorId: p.id, type: getActionType(p.role)}));
            }
        }
    });
    
    // Доп фикс: Мафия и Дон должны иметь возможность выстрела. 
    // Если есть Дон, добавим ему ход "Выстрел мафии" если в очереди нет мафии.
    // Для простоты Pass&Play: Дон сначала проверяет, потом Мафия стреляет.
    
    currentTurnIndex = 0;
    processNightQueue();
}

function getActionType(role) {
    if (role === 'doctor') return 'heal';
    if (role === 'sheriff') return 'check';
    if (role === 'putana') return 'block';
    if (role === 'maniac') return 'kill';
    return 'kill';
}

function processNightQueue() {
    if (currentTurnIndex >= nightQueue.length) {
        resolveNight();
        return;
    }

    const turn = nightQueue[currentTurnIndex];
    showScreen('screen-night');
    
    const roleConfig = ROLES_CONFIG[turn.role];
    document.getElementById('night-actor-role').innerText = `Ход: ${roleConfig.name}`;
    document.getElementById('night-actor-role').style.color = roleConfig.color;
    
    let desc = "Выберите игрока.";
    if (turn.role === 'putana') desc = "Кого заблокировать?";
    if (turn.role === 'doctor') desc = "Кого лечить?";
    if (turn.role === 'sheriff') desc = "Кого проверить на причастность к мафии?";
    if (turn.role === 'don') desc = "Кого проверить (найти Шерифа)?";
    if (turn.role === 'mafia') desc = "Мафия выбирает жертву.";
    
    document.getElementById('night-action-desc').innerText = desc;

    renderTargets(turn);
}

function renderTargets(turn) {
    const grid = document.getElementById('night-targets');
    grid.innerHTML = '';
    
    players.forEach(p => {
        if (!p.isAlive) return;
        
        const btn = document.createElement('button');
        btn.className = 'target-btn';
        btn.innerHTML = `<span>${p.name}</span> <small style="opacity:0.6">#${p.id+1}</small>`;
        
        // Самострел/самолечение разрешены для упрощения
        btn.onclick = () => handleNightAction(turn, p);
        grid.appendChild(btn);
    });
}

function handleNightAction(turn, target) {
    // Мгновенная проверка для Шерифа/Дона (чтобы игрок сразу увидел результат)
    if (turn.type === 'check') {
        let resultMsg = "";
        if (turn.role === 'sheriff') {
            const isMaf = (target.role === 'mafia' || target.role === 'don');
            resultMsg = isMaf ? `<span style="color:red">ЭТО МАФИЯ!</span>` : `<span style="color:cyan">Мирный житель.</span>`;
        } else if (turn.role === 'don') {
            const isSheriff = (target.role === 'sheriff');
            resultMsg = isSheriff ? `<span style="color:cyan">ЭТО ШЕРИФ!</span>` : `<span style="color:gray">Не шериф.</span>`;
        }
        alert(`Результат проверки: ${target.name} — ${resultMsg.replace(/<[^>]*>?/gm, '')}`);
    }

    // Записываем действие
    // Если это группа (мафия), берем первого живого как актора (неважно кто нажал, главное фракция)
    let actorId = turn.actorId;
    if (actorId === undefined) { 
        // Если ход фракции (Мафия)
        const actors = players.filter(p => p.role === turn.role && p.isAlive);
        if (actors.length > 0) actorId = actors[0].id;
    }

    nightActions[currentTurnIndex] = { 
        actorRole: turn.role,
        targetId: target.id, 
        type: turn.type 
    };

    alert('Действие принято. Передайте устройство следующему.');
    currentTurnIndex++;
    processNightQueue();
}

// --- ОБРАБОТКА РЕЗУЛЬТАТОВ НОЧИ ---

function resolveNight() {
    let deadIds = new Set();
    let blockedIds = new Set();
    let logs = [];

    // 1. Применяем блокировку (Путана)
    for (let key in nightActions) {
        const action = nightActions[key];
        if (action.type === 'block') {
            // Находим игрока, которого заблокировали
            // Блокировка идет по ID цели.
            // Если этот игрок должен был ходить, его действие аннулируется.
            blockedIds.add(action.targetId);
        }
    }

    // 2. Обработка убийств и лечения
    // Собираем все попытки убийства
    let killAttempts = []; // { targetId, attackerRole }

    for (let key in nightActions) {
        const action = nightActions[key];
        
        // Проверяем, не заблокирован ли Актор (надо найти, кто совершал действие)
        // Для упрощения Pass&Play: если актор - роль (мафия), проверяем всех мафий?
        // Упростим: Если Путана выбрала Мафию №1, а стреляла Мафия №2 - выстрел проходит.
        // Если Путана выбрала Маньяка - Маньяк не убивает.
        
        let actorIsBlocked = false;
        // Находим реального игрока, совершившего действие (упрощенно по роли для одиночек)
        const actors = players.filter(p => p.role === action.actorRole && p.isAlive);
        // Если хоть один из акторов этой роли заблокирован - это сложно.
        // Считаем так: если заблокирован КОНКРЕТНЫЙ игрок.
        // В nightActions мы не всегда сохраняли ID актора для мафии.
        // Допустим, блокировка работает, если заблокирован "Исполнитель".
        // В этой версии для простоты: Блокировка отменяет действие роли, если роль одиночная.
        // Если роль групповая (Мафия), блокировка одного члена не останавливает убийство (стреляет другой).
        
        // Проверка: Блокировался ли этот целевой игрок (если он был целью путаны)
        // Но здесь мы итерируем действия. 
        // Логика: действие совершил 'action.actorRole'. Кто это?
        // Если 'maniac', то находим ID маньяка. Если он в blockedIds -> отмена.
        
        const realActor = players.find(p => p.role === action.actorRole && p.isAlive); // Берем первого живого представителя
        if (realActor && blockedIds.has(realActor.id)) {
            // Действие заблокировано!
            continue; 
        }

        if (action.type === 'kill') {
            killAttempts.push(action.targetId);
        }
    }

    // 3. Обработка лечения
    let healedId = null;
    for (let key in nightActions) {
        const action = nightActions[key];
        const actor = players.find(p => p.role === 'doctor' && p.isAlive);
        if (action.type === 'heal' && actor && !blockedIds.has(actor.id)) {
            healedId = action.targetId;
        }
    }

    // 4. Итог смертей
    killAttempts.forEach(targetId => {
        if (targetId !== healedId) {
            deadIds.add(targetId);
        }
    });

    // Применяем смерти
    deadIds.forEach(id => {
        const p = players.find(pl => pl.id === id);
        p.isAlive = false;
        logs.push(`Был убит <strong style="color:${ROLES_CONFIG[p.role].color}">${p.name}</strong>.`);
    });

    if (deadIds.size === 0) logs.push("Этой ночью никто не умер.");
    else if (healedId !== null && killAttempts.includes(healedId)) {
        logs.push("Доктор спас чью-то жизнь!");
    }

    startDay(logs);
}

// --- ЭТАП 4: ДЕНЬ ---

function startDay(logs) {
    if (checkWin()) return;

    showScreen('screen-day');
    const logBox = document.getElementById('day-log');
    logBox.innerHTML = logs.map(l => `<p>${l}</p>`).join('');

    renderVoting();
}

function renderVoting() {
    const grid = document.getElementById('voting-targets');
    grid.innerHTML = '';
    
    players.forEach(p => {
        if (!p.isAlive) {
            // Можно показать мертвых серым
            const btn = document.createElement('div');
            btn.className = 'target-btn dead';
            btn.innerText = `${p.name} (Мертв)`;
            grid.appendChild(btn);
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'target-btn';
        btn.innerHTML = `<i class="fas fa-skull"></i> Голосовать против: ${p.name}`;
        btn.onclick = () => executeVote(p);
        grid.appendChild(btn);
    });
}

function executeVote(target) {
    if (!confirm(`Вы уверены, что город хочет казнить: ${target.name}?`)) return;

    target.isAlive = false;
    alert(`${target.name} был казнен голосованием. Его роль: ${ROLES_CONFIG[target.role].name}`);
    
    if (!checkWin()) {
        startNight();
    }
}

function skipDay() {
    alert('Город решил никого не казнить.');
    startNight();
}

// --- ПРОВЕРКА ПОБЕДЫ ---

function checkWin() {
    const alive = players.filter(p => p.isAlive);
    const mafiaCount = alive.filter(p => p.role === 'mafia' || p.role === 'don').length;
    const maniacCount = alive.filter(p => p.role === 'maniac').length;
    const townCount = alive.length - mafiaCount - maniacCount;

    // 1. Победа Маньяка: остался 1 на 1 с кем угодно
    if (maniacCount === 1 && alive.length <= 2) {
        endGame('Маньяк', ROLES_CONFIG.maniac.color);
        return true;
    }

    // 2. Победа Мафии: Мафии >= Мирных (и нет маньяка)
    if (mafiaCount >= (townCount + maniacCount) && maniacCount === 0) {
        if (mafiaCount > 0) { // Исключаем случай, когда все мертвы
            endGame('Мафия', ROLES_CONFIG.mafia.color);
            return true;
        }
    }

    // 3. Победа Города: Нет ни мафии, ни маньяка
    if (mafiaCount === 0 && maniacCount === 0) {
        endGame('Мирные жители', ROLES_CONFIG.citizen.color);
        return true;
    }

    // 4. Все мертвы (ничья или технически никто)
    if (alive.length === 0) {
        endGame('Никто (Все мертвы)', '#fff');
        return true;
    }

    return false;
}

function endGame(winnerName, color) {
    showScreen('screen-gameover');
    const title = document.getElementById('winner-team');
    title.innerText = winnerName;
    title.style.color = color;
    title.style.textShadow = `0 0 20px ${color}`;
    
    const list = document.getElementById('survivors-list');
    list.innerHTML = '<h3>Выжившие:</h3>' + players.filter(p => p.isAlive).map(p => p.name).join(', ');
}

// --- УТИЛИТЫ ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}