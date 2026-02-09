let state = {
    names: { n1: '', n2: '' },
    theme: '', 
    currentCard: null,
    used: new Set(),
    stats: JSON.parse(localStorage.getItem('garden_stats')) || { growth: 0 },
    diary: JSON.parse(localStorage.getItem('garden_diary')) || [],
    favs: JSON.parse(localStorage.getItem('garden_favs')) || [],
    startX: 0
};

// Функция склонения (улучшенная под капотом)
function decline(name, type) {
    if (!name) return "";
    let n = name.trim();
    const last = n.slice(-1).toLowerCase();
    if (type === 'v') { // Винительный (Кого?)
        if (last === 'а') return n.slice(0, -1) + 'у';
        if (last === 'я') return n.slice(0, -1) + 'ю';
        if (last === 'й') return n.slice(0, -1) + 'я';
        if ("бвгджзклмнпрстфхцчшщ".includes(last)) return n + 'а';
    }
    if (type === 'd') { // Дательный (Кому?)
        if (last === 'а' || last === 'я') return n.slice(0, -1) + 'е';
        if (last === 'й') return n.slice(0, -1) + 'ю';
        if ("бвгджзклмнпрстфхцчшщ".includes(last)) return n + 'у';
    }
    return n;
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('garden_names'));
    if (saved) {
        state.names = saved;
        updateGrowthUI();
        goToScreen('themes');
    }
    setupSwipes();
    setTimeout(() => document.getElementById('loading-screen').style.opacity = '0', 1500);
    setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 2500);
});

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

function saveNames() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();
    if (!n1 || !n2) return alert("Введите имена партнеров");
    state.names = { n1, n2 };
    localStorage.setItem('garden_names', JSON.stringify(state.names));
    goToScreen('themes');
}

function selectTheme(t) {
    state.theme = t;
    state.used.clear();
    nextCard();
    goToScreen('game');
}

function nextCard() {
    let pool = state.theme === 'favs' ? state.favs : CARDS_DB[state.theme];
    if (!pool || pool.length === 0) return alert("Тут пока пусто!");
    
    let available = pool.filter(c => !state.used.has(c.id));
    if (available.length === 0) { state.used.clear(); available = pool; }
    
    state.currentCard = available[Math.floor(Math.random() * available.length)];
    state.used.add(state.currentCard.id);
    renderCard();
}

function renderCard() {
    const n = state.names;
    let text = state.currentCard.text;
    const reps = {
        '{n1}': n.n1, '{n1_v}': decline(n.n1, 'v'), '{n1_d}': decline(n.n1, 'd'),
        '{n2}': n.n2, '{n2_v}': decline(n.n2, 'v'), '{n2_d}': decline(n.n2, 'd')
    };
    for (let k in reps) text = text.split(k).join(`<span>${reps[k]}</span>`);
    document.getElementById('card-text').innerHTML = text;
    document.getElementById('task-cat-name').innerText = state.theme.toUpperCase();
    updateFavUI();
}

function swipe(dir) {
    const card = document.getElementById('game-card-body');
    card.classList.add(dir === 'right' ? 'swipe-right' : 'swipe-left');
    
    setTimeout(() => {
        if (dir === 'right') {
            state.stats.growth = Math.min(100, state.stats.growth + 2);
            updateGrowthUI();
            document.getElementById('modal-memory').classList.add('active');
        } else {
            finishAction();
        }
    }, 400);
}

function saveMemory() {
    const val = document.getElementById('memory-input').value.trim();
    if (val) state.diary.push({ date: new Date().toLocaleDateString(), text: val });
    localStorage.setItem('garden_diary', JSON.stringify(state.diary));
    document.getElementById('memory-input').value = '';
    document.getElementById('modal-memory').classList.remove('active');
    finishAction();
}

function finishAction() {
    const card = document.getElementById('game-card-body');
    card.classList.remove('swipe-right', 'swipe-left');
    nextCard();
}

function updateGrowthUI() {
    document.getElementById('growth-val').innerText = state.stats.growth;
    document.getElementById('growth-fill').style.width = state.stats.growth + '%';
    localStorage.setItem('garden_stats', JSON.stringify(state.stats));
}

function setupSwipes() {
    const card = document.getElementById('game-card-body');
    card.addEventListener('touchstart', e => state.startX = e.touches[0].clientX);
    card.addEventListener('touchmove', e => {
        const x = e.touches[0].clientX - state.startX;
        card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
    });
    card.addEventListener('touchend', e => {
        const x = e.changedTouches[0].clientX - state.startX;
        if (x > 100) swipe('right');
        else if (x < -100) swipe('left');
        else card.style.transform = '';
    });
}

function showModal(id) {
    if (id === 'diary') {
        const list = document.getElementById('diary-list');
        list.innerHTML = state.diary.map(d => `<div class="diary-item"><b>${d.date}</b><p>${d.text}</p></div>`).join('') || "Дневник пуст";
    }
    document.getElementById(`modal-${id}`).classList.add('active');
}

function closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active')); }

function confirmReset() { if(confirm("Начать заново? Сад будет очищен.")) { localStorage.clear(); location.reload(); } }