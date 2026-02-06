const DB = [
    { q: "Человек заходит в бар и просит воды. Бармен достает пистолет и целится в него. Человек говорит 'спасибо' и уходит.", a: "У него была икота. Бармен напугал его, и икота прошла." },
    { q: "Двое подошли к реке. У берега лодка на одного. Оба переправились.", a: "Они стояли на разных берегах реки." },
    { q: "Лежит мертвый человек в пустыне со сломанной спичкой в руке.", a: "Он прыгнул с падающего воздушного шара. Спичка была жребием — кому прыгать, чтобы облегчить шар." },
    { q: "Мужчина живет на 10 этаже. Вечером едет до 7-го, а дальше пешком. В дождь едет до 10-го. Почему?", a: "Он карлик. Достает только до кнопки 7, а в дождь нажимает на 10-ку зонтом." },
    { q: "Женщина купила новые туфли и умерла в тот же вечер. Что произошло?", a: "Она была ассистенткой метателя ножей. Новые каблуки сделали её выше, и нож попал ей в голову." },
    { q: "Мужчина выключил свет и лег спать. Утром он закричал и покончил с собой.", a: "Он был смотрителем маяка. Без света корабли разбились о рифы." },
    { q: "Водитель грузовика едет против движения по улице с односторонним движением. Полиция видит его, но не останавливает.", a: "Он идет пешком." },
    { q: "Женщина рожает двоих сыновей в один день, в один час и год, но они не близнецы. Как так?", a: "Это двое из тройни." },
    { q: "Бизнесмен купил лошадь за 10$, продал за 20$. Потом купил её же за 30$ и продал за 40$. Сколько он заработал?", a: "20 долларов." },
    { q: "Человек лежит мертвый в поле. Рядом с ним нераскрытый пакет. Ни одной живой души вокруг.", a: "Это парашютист, у которого не раскрылся парашют." },
    { q: "В комнате лежат двое мертвых. Вокруг осколки стекла и вода. Дверь и окна заперты.", a: "Это были рыбки, их аквариум разбился." }
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
    if (state.score >= 12) rank = "ИНСПЕКТОР";
    if (state.score >= 25) rank = "ШЕРЛОК";
    
    document.getElementById('rank-display').innerText = rank;
    localStorage.setItem('danetki_score', state.score);
    localStorage.setItem('danetki_used', JSON.stringify(state.used));
}

function startGame() {
    if (state.used.length >= DB.length) {
        if(confirm("Все дела в архиве раскрыты! Обнулить базу для повтора?")) {
            state.used = [];
            updateStats();
        } else return;
    }

    let idx;
    do { idx = Math.floor(Math.random() * DB.length); } 
    while (state.used.includes(idx));

    state.currentIdx = idx;
    document.getElementById('riddle-text').innerText = DB[idx].q;
    toScreen('game-screen');
}

function showSolution() {
    document.getElementById('solution-text').innerText = DB[state.currentIdx].a;
    toScreen('solution-screen');
}

function nextRiddle(isWin) {
    if (isWin) {
        state.score += 1;
        state.used.push(state.currentIdx);
    }
    updateStats();
    toScreen('setup-screen');
}

function toggleRules(s) { document.getElementById('rules-modal').classList.toggle('active', s); }
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Запуск статистики при старте
updateStats();
