const DB = {
    easy: [
        { q: "Человек заходит в бар и просит воды. Бармен достает пистолет и целится в него. Человек говорит 'спасибо' и уходит.", a: "У него была икота. Испуг от вида оружия мгновенно ее вылечил." },
        { q: "Двое подошли к реке. У берега лодка на одного. Оба переправились.", a: "Они стояли на противоположных берегах." },
        { q: "В комнате никого, на столе разбитый стакан и лужа воды, на полу лежит Мэри мертвая. Рядом никого. От чего она умерла?", a: "Мэри — это золотая рыбка. Кот или сквозняк перевернул аквариум." }
    ],
    medium: [
        { q: "Мужчина живет на 10 этаже. Утром едет до 1-го. Вечером до 7-го, а дальше пешком. В дождливые дни едет до 10-го. Почему?", a: "Он карлик. Достает до кнопки 7 своим ростом, а до 10-й — только зонтиком в дождь." },
        { q: "В комнате лежат двое мертвых. Комната заперта изнутри, окна закрыты. Рядом только осколки стекла и вода.", a: "Это были рыбки, их аквариум разбился." }
    ],
    hard: [
        { q: "Человек в пустыне со сломанной спичкой в руке. Мертв.", a: "Он летел на воздушном шаре. Чтобы не упасть, они тянули жребий, кому прыгать. Ему досталась короткая спичка." }
    ]
};

let currentDiff = 'easy';
let used = { easy: [], medium: [], hard: [] };
let activeIdx = -1;

function startGame(diff) {
    currentDiff = diff;
    nextRiddle();
}

function nextRiddle() {
    const list = DB[currentDiff];
    if (used[currentDiff].length >= list.length) used[currentDiff] = [];

    let idx;
    do { idx = Math.floor(Math.random() * list.length); } 
    while (used[currentDiff].includes(idx));

    used[currentDiff].push(idx);
    activeIdx = idx;

    document.getElementById('riddle-text').innerText = list[idx].q;
    toScreen('game-screen');
}

function showSolution() {
    document.getElementById('solution-text').innerText = DB[currentDiff][activeIdx].a;
    toScreen('solution-screen');
}

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
