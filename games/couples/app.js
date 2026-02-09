let state = {
    names: { n1: '', n2: '' },
    theme: '', 
    currentCard: null,
    used: new Set(),
    stats: JSON.parse(localStorage.getItem('lc_stats')) || { done: 0 },
    favs: JSON.parse(localStorage.getItem('lc_favs')) || [],
    custom: JSON.parse(localStorage.getItem('lc_custom')) || [],
    startX: 0
};

// --- СКЛОНЕНИЕ ИМЕН (ПОД КАПОТОМ) ---
function declineName(name, type) {
    if (!name) return "";
    let n = name.trim();
    const lastChar = n.slice(-1).toLowerCase();
    const beforeLastChar = n.slice(-2, -1).toLowerCase();

    // Очень упрощенная логика склонения для популярных русских имен
    if (type === 'v') { // Винительный (Кого?)
        if (lastChar === 'а') return n.slice(0, -1) + 'у'; // Мария -> Марию
        if (lastChar === 'я' && beforeLastChar !== 'и') return n.slice(0, -1) + 'ю'; // Настя -> Настю
        if (lastChar === 'й') return n.slice(0, -1) + 'я'; // Алексей -> Алексея
        if ("бвгджзклмнпрстфхцчшщ".includes(lastChar)) return n + 'а'; // Антон -> Антона
    }
    if (type === 'd') { // Дательный (Кому?)
        if (lastChar === 'а' || lastChar === 'я') return n.slice(0, -1) + 'е'; // Мария -> Марие (упрощ), Маша -> Маше
        if (lastChar === 'й') return n.slice(0, -1) + 'ю'; // Алексей -> Алексею
        if ("бвгджзклмнпрстфхцчшщ".includes(lastChar)) return n + 'у'; // Антон -> Антону
    }
    return n; // Именительный по умолчанию
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('lc_names_v2'));
    if (saved) {
        state.names = saved;
        goToScreen('themes');
    }
    setupSwipes();
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if(loader) loader.style.display = 'none';
    }, 1000);
});

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

function saveNames() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();
    if (!n1 || !n2) return alert("Введите имена партнёров ❤️");
    
    state.names = { n1, n2 };
    localStorage.setItem('lc_names_v2', JSON.stringify(state.names));
    goToScreen('themes');
}

function selectTheme(t) {
    state.theme = t;
    state.used.clear();
    nextCard();
}

function nextCard() {
    let pool = [];
    if (state.theme === 'favorites') pool = state.favs;
    else if (state.theme === 'custom') pool = state.custom;
    else pool = [...(CARDS_DB[state.theme] || []), ...state.custom.filter(c => c.category === state.theme)];

    if (pool.length === 0) {
        alert("В этой категории пока пусто!");
        return;
    }

    const available = pool.filter(c => !state.used.has(c.id));
    if (available.length === 0) { state.used.clear(); return nextCard(); }
    
    state.currentCard = available[Math.floor(Math.random() * available.length)];
    state.used.add(state.currentCard.id);
    renderCard();
    goToScreen('game');
}

function renderCard() {
    let text = state.currentCard.text;
    const n = state.names;
    
    // Заменяем теги на склоненные имена
    const replacements = {
        '{n1}': n.n1, 
        '{n1_v}': declineName(n.n1, 'v'), 
        '{n1_d}': declineName(n.n1, 'd'),
        '{n2}': n.n2, 
        '{n2_v}': declineName(n.n2, 'v'), 
        '{n2_d}': declineName(n.n2, 'd')
    };

    for (let key in replacements) {
        text = text.split(key).join(`<span class="name-span">${replacements[key]}</span>`);
    }
    
    document.getElementById('card-text').innerHTML = text;
    document.getElementById('intensity-badge').innerText = state.currentCard.level || 'USER';
    document.getElementById('card-type').innerText = state.theme.toUpperCase();
    updateFavUI();
}

// --- КНОПКИ И ДЕЙСТВИЯ ---
function swipe(dir) {
    const card = document.getElementById('game-card-body');
    if (dir === 'right') {
        card.classList.add('swipe-right');
        state.stats.done++;
        localStorage.setItem('lc_stats', JSON.stringify(state.stats));
    } else {
        card.classList.add('swipe-left');
    }
    
    setTimeout(() => {
        nextCard();
        card.classList.remove('swipe-right', 'swipe-left');
    }, 300);
}

function setupSwipes() {
    const card = document.getElementById('game-card-body');
    if(!card) return;
    card.addEventListener('touchstart', e => state.startX = e.touches[0].clientX);
    card.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - state.startX;
        if (diff > 100) swipe('right');
        else if (diff < -100) swipe('left');
    });
}

function toggleFavorite() {
    const idx = state.favs.findIndex(f => f.id === state.currentCard.id);
    if (idx === -1) state.favs.push(state.currentCard);
    else state.favs.splice(idx, 1);
    localStorage.setItem('lc_favs', JSON.stringify(state.favs));
    updateFavUI();
}

function updateFavUI() {
    const isFav = state.favs.some(f => f.id === state.currentCard.id);
    document.getElementById('fav-btn').innerHTML = isFav ? '<i class="fas fa-star" style="color: gold"></i>' : '<i class="far fa-star"></i>';
}

function addCustomCard() {
    const text = document.getElementById('custom-text').value.trim();
    const category = document.getElementById('custom-cat').value;
    if (!text) return;

    state.custom.push({ id: Date.now(), text, category, level: 'USER' });
    localStorage.setItem('lc_custom', JSON.stringify(state.custom));
    document.getElementById('custom-text').value = '';
    closeModals();
    alert("Карта добавлена!");
}

function showModal(id) {
    if (id === 'stats') {
        document.getElementById('stats-info').innerText = `Выполнено заданий: ${state.stats.done}\nСвоих карточек: ${state.custom.length}`;
    }
    document.getElementById(`modal-${id}`).classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function rollDice() {
    showModal('dice');
    const res = document.getElementById('dice-res');
    const who = document.getElementById('dice-who');
    res.innerText = "🎲";
    setTimeout(() => {
        const val = Math.floor(Math.random() * 6) + 1;
        res.innerText = val;
        who.innerText = val % 2 === 0 ? `Выполняет ${state.names.n2}` : `Выполняет ${state.names.n1}`;
    }, 600);
}

function confirmReset() {
    if (confirm("Сбросить имена?")) {
        localStorage.removeItem('lc_names_v2');
        location.reload();
    }
}

function startTimer() {
    let t = 60;
    const el = document.getElementById('timer-display');
    const interval = setInterval(() => {
        t--;
        let m = Math.floor(t/60), s = t%60;
        el.innerText = `${m}:${s < 10 ? '0' + s : s}`;
        if (t <= 0) { clearInterval(interval); alert("Время вышло!"); el.innerText = "01:00"; }
    }, 1000);
}