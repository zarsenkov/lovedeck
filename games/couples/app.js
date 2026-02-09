let state = {
    names: {
        n1: { nom: '', vin: '', dat: '' },
        n2: { nom: '', vin: '', dat: '' }
    },
    theme: '', 
    currentCard: null,
    used: new Set(),
    stats: JSON.parse(localStorage.getItem('lc_stats')) || { done: 0, sessions: 0 },
    favs: JSON.parse(localStorage.getItem('lc_favs')) || [],
    custom: JSON.parse(localStorage.getItem('lc_custom')) || [],
    startX: 0
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    const savedNames = JSON.parse(localStorage.getItem('lc_names_p3'));
    if (savedNames) {
        state.names = savedNames;
        goToScreen('themes');
    }
    setupSwipes();
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 800);
    }, 1500);
});

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

// --- ИМЕНА И ПАДЕЖИ ---
function saveNames() {
    const data = {
        n1: {
            nom: document.getElementById('n1_nom').value.trim(),
            vin: document.getElementById('n1_vin').value.trim(),
            dat: document.getElementById('n1_dat').value.trim()
        },
        n2: {
            nom: document.getElementById('n2_nom').value.trim(),
            vin: document.getElementById('n2_vin').value.trim(),
            dat: document.getElementById('n2_dat').value.trim()
        }
    };

    if (!data.n1.nom || !data.n2.nom) return alert("Введите хотя бы имена в именительном падеже!");
    
    state.names = data;
    localStorage.setItem('lc_names_p3', JSON.stringify(data));
    state.stats.sessions++;
    saveData();
    goToScreen('themes');
}

// --- ЛОГИКА ИГРЫ ---
function selectTheme(t) {
    state.theme = t;
    state.used.clear();
    nextCard();
    goToScreen('game');
}

function nextCard() {
    let pool = [];
    
    if (state.theme === 'favorites') {
        pool = state.favs;
    } else if (state.theme === 'custom') {
        pool = state.custom;
    } else {
        // Объединяем встроенные карты и свои карты этой категории
        const builtIn = CARDS_DB[state.theme] || [];
        const userCards = state.custom.filter(c => c.category === state.theme);
        pool = [...builtIn, ...userCards];
    }

    if (!pool || pool.length === 0) {
        alert("В этой категории пока пусто!");
        return goToScreen('themes');
    }

    const available = pool.filter(c => !state.used.has(c.id));
    if (available.length === 0) {
        state.used.clear();
        return nextCard();
    }
    
    state.currentCard = available[Math.floor(Math.random() * available.length)];
    state.used.add(state.currentCard.id);
    renderCard();
}

function renderCard() {
    // Функция замены тегов на падежи
    let text = state.currentCard.text;
    const n = state.names;
    
    const replaces = {
        '{n1}': n.n1.nom, '{n1_v}': n.n1.vin || n.n1.nom, '{n1_d}': n.n1.dat || n.n1.nom,
        '{n2}': n.n2.nom, '{n2_v}': n.n2.vin || n.n2.nom, '{n2_d}': n.n2.dat || n.n2.nom
    };

    Object.keys(replaces).forEach(key => {
        text = text.split(key).join(`<span>${replaces[key]}</span>`);
    });
    
    const cardText = document.getElementById('card-text');
    cardText.style.opacity = 0;
    
    setTimeout(() => {
        cardText.innerHTML = text;
        document.getElementById('card-type').innerText = (state.theme === 'favorites' ? 'ИЗБРАННОЕ' : state.theme.toUpperCase());
        document.getElementById('intensity-badge').innerText = state.currentCard.level || 'USER';
        updateFavUI();
        cardText.style.opacity = 1;
    }, 200);
}

// --- СВОИ КАРТОЧКИ ---
function addCustomCard() {
    const text = document.getElementById('custom-text').value.trim();
    const category = document.getElementById('custom-cat-select').value;
    
    if (!text) return alert("Введите текст задания!");

    const newCard = {
        id: 'user_' + Date.now(),
        text: text,
        category: category,
        level: 'USER'
    };

    state.custom.push(newCard);
    localStorage.setItem('lc_custom', JSON.stringify(state.custom));
    document.getElementById('custom-text').value = '';
    closeModals();
    alert("Карточка добавлена в колоду!");
}

// --- ОСТАЛЬНАЯ ЛОГИКА (Свайпы, Кубик, Статистика) ---
function setupSwipes() {
    const card = document.getElementById('game-card-body');
    card.addEventListener('touchstart', e => state.startX = e.touches[0].clientX);
    card.addEventListener('touchmove', e => {
        const x = e.touches[0].clientX - state.startX;
        if (Math.abs(x) > 10) card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
    });
    card.addEventListener('touchend', e => {
        const x = e.changedTouches[0].clientX - state.startX;
        if (x > 120) swipe('right');
        else if (x < -120) swipe('left');
        else card.style.transform = '';
    });
}

function swipe(dir) {
    const card = document.getElementById('game-card-body');
    if (dir === 'right') {
        card.classList.add('swipe-right');
        state.stats.done++;
        saveData();
        if (navigator.vibrate) navigator.vibrate(40);
    } else {
        card.classList.add('swipe-left');
    }
    
    setTimeout(() => {
        nextCard();
        card.classList.remove('swipe-right', 'swipe-left');
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.style.transform = '', 50);
    }, 300);
}

function rollDice() {
    const modal = document.getElementById('modal-dice');
    modal.classList.add('active');
    document.getElementById('dice-result').innerText = "?";
    
    setTimeout(() => {
        const val = Math.floor(Math.random() * 6) + 1;
        document.getElementById('dice-result').innerText = val;
        document.getElementById('dice-text').innerText = val % 2 === 0 ? `Ходит ${state.names.n2.nom}` : `Ходит ${state.names.n1.nom}`;
    }, 800);
}

function updateFavUI() {
    const isFav = state.favs.some(f => f.id === state.currentCard.id);
    document.getElementById('fav-btn').innerHTML = isFav ? '<i class="fas fa-star" style="color: #ffb703"></i>' : '<i class="far fa-star"></i>';
}

function toggleFavorite() {
    const idx = state.favs.findIndex(f => f.id === state.currentCard.id);
    if (idx === -1) state.favs.push(state.currentCard);
    else state.favs.splice(idx, 1);
    saveData();
    updateFavUI();
}

function showModal(id) {
    if (id === 'stats') {
        document.getElementById('stats-content').innerHTML = `
            <div class="stat-item">Выполнено: <b>${state.stats.done}</b></div>
            <div class="stat-item">Сессий: <b>${state.stats.sessions}</b></div>
            <div class="stat-item">Своих карт: <b>${state.custom.length}</b></div>
        `;
    }
    document.getElementById(`modal-${id}`).classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function saveData() {
    localStorage.setItem('lc_favs', JSON.stringify(state.favs));
    localStorage.setItem('lc_stats', JSON.stringify(state.stats));
}

function confirmReset() {
    if (confirm("Изменить имена?")) {
        localStorage.removeItem('lc_names_p3');
        location.reload();
    }
}

function startTimer() {
    let timeLeft = 60;
    const el = document.getElementById('timer-display');
    const timer = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft/60);
        const s = timeLeft%60;
        el.innerText = `${m}:${s<10?'0':''}${s}`;
        if(timeLeft<=0) { clearInterval(timer); el.innerText="01:00"; alert("Время вышло!"); }
    }, 1000);
}