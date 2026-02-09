// --- БАЗА ДАННЫХ ИГРЫ ---
const DATA = {
    disasters: [
        { name: "ЯДЕРНАЯ ВОЙНА", desc: "Обмен ударами уничтожил все крупные города. Радиационный фон превышен в 500 раз." },
        { name: "ПАНДЕМИЯ Z", desc: "Вирус превращает людей в агрессивных каннибалов. 99% населения заражены." },
        { name: "ЛЕДНИКОВЫЙ ПЕРИОД", desc: "Температура на поверхности упала до -70°C. Океаны замерзли." },
        { name: "ВОССТАНИЕ ИИ", desc: "Дроны охотятся на любое тепловое излучение. Человечество — цель №1." },
        { name: "СТОЛКНОВЕНИЕ С АСТЕРОИДОМ", desc: "Удар цунами смыл прибрежные зоны, пыль закрыла солнце на десятилетия." }
    ],
    professions: ["Врач-хирург", "Физик-ядерщик", "Повар", "Полицейский", "Программист", "Фермер", "Слесарь", "Психолог", "Военный", "Учитель", "Актер", "Стриптизерша", "Безработный", "Священник"],
    health: ["Полностью здоров", "Диабет 1 типа", "Легкое безумие", "Бесплодие", "Астма", "Слабое зрение", "Перелом ноги", "Депрессия", "Крепкий иммунитет"],
    hobbies: ["Рисование", "Бокс", "Игра на гитаре", "Огородничество", "Паркур", "Чтение", "Йога", "Охота", "Кулинария"],
    phobias: ["Темнота", "Пауки", "Замкнутое пространство", "Кровь", "Одиночество", "Высота", "Громкие звуки"],
    luggage: ["Дробовик (3 патрона)", "Аптечка", "Семена овощей", "Губная гармошка", "Бутылка виски", "Набор инструментов", "Презервативы (10шт)", "Дневник"],
    specialCards: [
        "ОБМЕН: Вы можете обменяться профессией с любым игроком.",
        "ЛЕЧЕНИЕ: Излечите свою болезнь или болезнь другого игрока.",
        "РЕВИЗИЯ: Узнайте багаж любого игрока.",
        "ВТОРОЙ ШАНС: Ваш голос на голосовании считается за два.",
        "ДЕТЕКТОР: Узнайте реальное состояние здоровья одного игрока."
    ],
    bunker: {
        facilities: ["Кухня", "Спортзал", "Лаборатория", "Оружейная", "Гидропоника", "Библиотека", "Медпункт"],
        items: ["Запас еды на год", "Фильтр воды", "Генератор", "Рация", "Книги по выживанию"]
    }
};

let game = {
    playerCount: 6,
    players: [],
    currentPlayerIdx: 0,
    disaster: null,
    bunkerStats: []
};

// --- ЛОГИКА ---

function changePlayers(val) {
    game.playerCount = Math.max(4, Math.min(12, game.playerCount + val));
    document.getElementById('player-count').innerText = game.playerCount;
}

function startGeneration() {
    // Генерация Сценария
    game.disaster = DATA.disasters[Math.floor(Math.random() * DATA.disasters.length)];
    
    // Генерация Бункера
    game.bunkerStats = [
        `Площадь: ${game.playerCount * 10} кв.м.`,
        `Запас еды: на ${Math.floor(Math.random() * 20) + 5} месяцев`,
        `Оборудование: ${DATA.bunker.facilities[Math.floor(Math.random() * DATA.bunker.facilities.length)]}`
    ];

    // Генерация игроков
    game.players = [];
    for (let i = 0; i < game.playerCount; i++) {
        game.players.push({
            id: i + 1,
            prof: DATA.professions[Math.floor(Math.random() * DATA.professions.length)],
            bio: `${Math.random() > 0.5 ? 'Мужчина' : 'Женщина'}, ${Math.floor(Math.random() * 50) + 18} лет`,
            health: DATA.health[Math.floor(Math.random() * DATA.health.length)],
            hobby: DATA.hobbies[Math.floor(Math.random() * DATA.hobbies.length)],
            phobia: DATA.phobias[Math.floor(Math.random() * DATA.phobias.length)],
            info: "Обычный человек",
            luggage: DATA.luggage[Math.floor(Math.random() * DATA.luggage.length)],
            special: DATA.specialCards[Math.floor(Math.random() * DATA.specialCards.length)],
            isOut: false
        });
    }

    renderDisaster();
}

function renderDisaster() {
    showScreen('screen-disaster');
    document.getElementById('disaster-name').innerText = game.disaster.name;
    document.getElementById('disaster-desc').innerText = game.disaster.desc;
    document.getElementById('bunker-stats').innerHTML = game.bunkerStats.map(s => `<li>${s}</li>`).join('');
}

function startPlayerReveal() {
    game.currentPlayerIdx = 0;
    showScreen('screen-reveal');
    updateRevealScreen();
}

function updateRevealScreen() {
    const p = game.players[game.currentPlayerIdx];
    document.getElementById('player-title').innerText = `ИГРОК #${p.id}`;
    toggleCard(false);
    
    document.getElementById('t-prof').innerText = p.prof;
    document.getElementById('t-bio').innerText = p.bio;
    document.getElementById('t-health').innerText = p.health;
    document.getElementById('t-hobby').innerText = p.hobby;
    document.getElementById('t-phobia').innerText = p.phobia;
    document.getElementById('t-info').innerText = p.info;
    document.getElementById('t-luggage').innerText = p.luggage;
    document.getElementById('t-special').innerText = p.special;
}

function toggleCard(show) {
    document.getElementById('character-card').classList.toggle('hidden', !show);
    document.getElementById('show-btn').classList.toggle('hidden', show);
    document.getElementById('next-btn').classList.toggle('hidden', !show);
}

function nextPlayer() {
    game.currentPlayerIdx++;
    if (game.currentPlayerIdx < game.playerCount) {
        updateRevealScreen();
    } else {
        renderTable();
    }
}

function renderTable() {
    showScreen('screen-table');
    const grid = document.getElementById('players-grid');
    grid.innerHTML = game.players.map(p => `
        <div class="p-badge ${p.isOut ? 'out' : ''}">
            <b>ИГРОК #${p.id}</b><br>
            ${p.prof}
        </div>
    `).join('');
}

function startVoting() {
    showScreen('screen-voting');
    const list = document.getElementById('voting-list');
    list.innerHTML = game.players.filter(p => !p.isOut).map(p => `
        <button class="action-btn" onclick="eliminate(${p.id})">ИГРОК #${p.id}</button>
    `).join('');
}

function eliminate(id) {
    const p = game.players.find(pl => pl.id === id);
    p.isOut = true;
    alert(`Игрок #${id} изгнан из бункера!`);
    renderTable();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleBack() {
    if(confirm("Выйти в меню? Прогресс будет потерян.")) location.reload();
}

function goToOnline() {
    alert("Перенаправление на сервер Бункера...");
    // Здесь будет переход на online версию
}