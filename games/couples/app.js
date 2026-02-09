let state = {
    name1: '', name2: '',
    theme: '', currentCard: null,
    used: new Set(),
    stats: JSON.parse(localStorage.getItem('lc_stats')) || { done: 0 },
    favs: JSON.parse(localStorage.getItem('lc_favs')) || [],
    startX: 0
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('lc_names'));
    if (saved) {
        state.name1 = saved.name1; state.name2 = saved.name2;
        goToScreen('themes');
    }
    setupSwipes();
    setTimeout(() => document.getElementById('loading-screen').style.opacity = '0', 1500);
    setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 2000);
});

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
}

function saveNames() {
    const n1 = document.getElementById('name1').value;
    const n2 = document.getElementById('name2').value;
    if (!n1 || !n2) return alert("Введите имена!");
    state.name1 = n1; state.name2 = n2;
    localStorage.setItem('lc_names', JSON.stringify({name1: n1, name2: n2}));
    goToScreen('themes');
}

function selectTheme(t) {
    state.theme = t; state.used.clear();
    nextCard();
    goToScreen('game');
}

function nextCard() {
    const pool = CARDS_DB[state.theme];
    const available = pool.filter(c => !state.used.has(c.id));
    if (available.length === 0) { state.used.clear(); return nextCard(); }
    
    state.currentCard = available[Math.floor(Math.random() * available.length)];
    state.used.add(state.currentCard.id);
    
    const text = state.currentCard.text
        .replace(/{name1}/g, `<b>${state.name1}</b>`)
        .replace(/{name2}/g, `<b>${state.name2}</b>`);
    
    document.getElementById('card-text').innerHTML = text;
    document.getElementById('intensity-badge').innerText = state.currentCard.level;
    updateFavUI();
}

// --- СВАЙПЫ ---
function setupSwipes() {
    const card = document.getElementById('game-card-body');
    card.addEventListener('touchstart', e => state.startX = e.touches[0].clientX);
    card.addEventListener('touchmove', e => {
        const x = e.touches[0].clientX - state.startX;
        card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
    });
    card.addEventListener('touchend', e => {
        const x = e.changedTouches[0].clientX - state.startX;
        if (x > 120) swipe('right');
        else if (x < -120) swipe('left');
        else {
            card.style.transform = '';
        }
    });
}

function swipe(dir) {
    const card = document.getElementById('game-card-body');
    if (dir === 'right') {
        card.classList.add('swipe-right');
        state.stats.done++;
        localStorage.setItem('lc_stats', JSON.stringify(state.stats));
        if (navigator.vibrate) navigator.vibrate(40);
    } else {
        card.classList.add('swipe-left');
    }
    
    setTimeout(() => {
        nextCard();
        card.classList.remove('swipe-right', 'swipe-left');
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.style.transform = '', 50);
    }, 400);
}

// --- ИЗБРАННОЕ ---
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

function showModal(id) {
    if (id === 'stats') document.getElementById('stats-content').innerHTML = `Выполнено заданий: <b>${state.stats.done}</b>`;
    if (id === 'favs') {
        document.getElementById('favs-list').innerHTML = state.favs.map(f => `<p style="font-size:14px; border-bottom:1px solid #eee; padding:10px 0;">${f.text.replace(/{name1}/g, state.name1).replace(/{name2}/g, state.name2)}</p>`).join('') || 'Тут пока пусто';
    }
    document.getElementById(`modal-${id}`).classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function confirmReset() {
    if (confirm("Сбросить имена?")) {
        localStorage.removeItem('lc_names');
        location.reload();
    }
}