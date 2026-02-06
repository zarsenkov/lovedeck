const DB = [
    { q: "Человек заходит в бар и просит воды. Бармен достает пистолет и целится в него. Человек говорит 'спасибо' и уходит.", a: "У него была икота. Бармен напугал его, и икота прошла." },
    { q: "Двое подошли к реке. У берега лодка на одного. Оба переправились.", a: "Они стояли на разных берегах реки и шли навстречу друг другу." },
    { q: "Лежит мертвый человек в пустыне со сломанной спичкой в руке.", a: "Он прыгнул с падающего воздушного шара. Спичка была жребием — кому прыгать, чтобы спасти остальных." },
    { q: "Мужчина живет на 10 этаже. Вечером едет до 7-го, а дальше пешком. В дождь едет до 10-го.", a: "Он карлик. Достает только до кнопки 7, а в дождь нажимает на 10-ку кончиком зонта." },
    { q: "Женщина купила новые туфли и умерла в тот же вечер.", a: "Она — ассистентка метателя ножей. Новые каблуки сделали её выше, и нож попал в неё." },
    { q: "Мужчина выключил свет и лег спать. Утром он закричал и покончил с собой.", a: "Он смотритель маяка. Из-за него ночью разбились корабли." },
    { q: "Водитель грузовика едет против движения. Полиция видит его, но не останавливает.", a: "Водитель идет пешком по тротуару." },
    { q: "Человек лежит мертвый в поле. Рядом с ним нераскрытый пакет.", a: "Это парашютист, у которого не раскрылся парашют." },
    { q: "В комнате лежат двое мертвых. Вокруг осколки стекла и вода. Дверь заперта.", a: "Это были рыбки, их аквариум разбился." },
    { q: "Человек съел в ресторане мясо альбатроса, вышел и застрелился.", a: "Раньше он был в крушении. Ему сказали, что его кормили альбатросом, но на самом деле это был его погибший товарищ. Попробовав настоящего альбатроса, он все понял." }
];

let state = {
    score: parseInt(localStorage.getItem('danetki_score')) || 0,
    used: JSON.parse(localStorage.getItem('danetki_used')) || [],
    currentIdx: -1
};

function updateStats() {
    document.getElementById('score-display').innerText = state.score;
    let rank = "НОВИЧОК";
    if (state.score >= 5) rank = "ДЕТЕКТИВ";
    if (state.score >= 15) rank = "ИНСПЕКТОР";
    if (state.score >= 30) rank = "ШЕРЛОК";
    
    document.getElementById('rank-display').innerText = rank;
    localStorage.setItem('danetki_score', state.score);
    localStorage.setItem('danetki_used', JSON.stringify(state.used));
}

function startGame() {
    // Если все загадки просмотрены - предлагаем сброс
    if (state.used.length >= DB.length) {
        if(confirm("Все дела в архиве изучены. Начать заново?")) {
            state.used = [];
            updateStats();
        } else return;
    }

    let idx;
    // Ищем загадку, которой еще не было
    do { 
        idx = Math.floor(Math.random() * DB.length); 
    } while (state.used.includes(idx));

    state.currentIdx = idx;
    document.getElementById('riddle-text').innerText = DB[idx].q;
    document.getElementById('solution-text').innerText = DB[idx].a;
    toScreen('game-screen');
}

function nextRiddle(isWin) {
    if (isWin) {
        state.score += 1;
        state.used.push(state.currentIdx);
        if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
    updateStats();
    toScreen('setup-screen');
}

function toggleRules(s) { document.getElementById('rules-modal').classList.toggle('active', s); }

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Инициализация при загрузке
updateStats();
