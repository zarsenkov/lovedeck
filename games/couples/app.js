let state = {
    names: { n1: '', n1_v: '', n1_d: '', n2: '', n2_v: '', n2_d: '' },
    theme: '',
    currentCard: null,
    used: new Set(),
    sync: 20,
    timer: null
};

// Функция склонения имён
function decline(name, type) {
    if (!name) return "";
    let n = name.trim();
    const last = n.slice(-1).toLowerCase();
    if (type === 'v') { // Кого?
        if (last === 'а') return n.slice(0, -1) + 'у';
        if (last === 'я') return n.slice(0, -1) + 'ю';
        if (last === 'й') return n.slice(0, -1) + 'я';
        if ("бвгджзклмнпрстфхцчшщ".includes(last)) return n + 'а';
    }
    if (type === 'd') { // Кому?
        if (last === 'а' || last === 'я') return n.slice(0, -1) + 'е';
        if (last === 'й') return n.slice(0, -1) + 'ю';
        if ("бвгджзклмнпрстфхцчшщ".includes(last)) return n + 'у';
    }
    return n;
}

function saveNames() {
    const name1 = document.getElementById('name1').value;
    const name2 = document.getElementById('name2').value;
    if (!name1 || !name2) return alert("Введите оба имени");

    state.names = {
        n1: name1, n1_v: decline(name1, 'v'), n1_d: decline(name1, 'd'),
        n2: name2, n2_v: decline(name2, 'v'), n2_d: decline(name2, 'd')
    };
    
    localStorage.setItem('sync_names', JSON.stringify(state.names));
    goToScreen('themes');
}

function selectTheme(t) {
    state.theme = t;
    nextCard();
    goToScreen('game');
}

function unlockCard() {
    if (navigator.vibrate) navigator.vibrate(100);
    document.getElementById('blind-lock').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('blind-lock').classList.add('hidden');
    }, 300);
}

function nextCard() {
    const pool = CARDS_DB[state.theme];
    state.currentCard = pool[Math.floor(Math.random() * pool.length)];
    
    renderCard();
    document.getElementById('blind-lock').classList.remove('hidden');
    document.getElementById('blind-lock').style.opacity = '1';
}

function renderCard() {
    let text = state.currentCard.text;
    const n = state.names;
    const reps = {
        '{n1}': n.n1, '{n1_v}': n.n1_v, '{n1_d}': n.n1_d,
        '{n2}': n.n2, '{n2_v}': n.n2_v, '{n2_d}': n.n2_d
    };

    for (let key in reps) text = text.split(key).join(`<span style="color:var(--primary)">${reps[key]}</span>`);

    document.getElementById('card-text').innerHTML = text;
    document.getElementById('task-type').innerText = state.currentCard.type.toUpperCase();
    document.getElementById('task-subtext').innerText = state.currentCard.task || "";
    
    if (state.currentCard.timer) {
        startTimer(state.currentCard.timer);
    } else {
        document.getElementById('game-timer').innerText = "00";
    }
}

function finishTask() {
    state.sync = Math.min(100, state.sync + 5);
    document.getElementById('sync-progress').style.width = state.sync + '%';
    nextCard();
}

function startTimer(seconds) {
    let left = seconds;
    const el = document.getElementById('game-timer');
    if (state.timer) clearInterval(state.timer);
    
    state.timer = setInterval(() => {
        left--;
        el.innerText = left < 10 ? '0' + left : left;
        if (left <= 0) {
            clearInterval(state.timer);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    }, 1000);
}

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

// Загрузка
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('sync_names');
    if (saved) {
        state.names = JSON.parse(saved);
        goToScreen('themes');
    }
});