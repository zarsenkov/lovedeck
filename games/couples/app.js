let state = {
    name1: '', name2: '',
    theme: '', currentCard: null,
    used: new Set(),
    stats: JSON.parse(localStorage.getItem('lc_stats')) || { done: 0, sessions: 0 },
    favs: JSON.parse(localStorage.getItem('lc_favs')) || [],
    startX: 0,
    streak: parseInt(localStorage.getItem('lc_streak')) || 0
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('lc_names'));
    if (saved) {
        state.name1 = saved.name1; state.name2 = saved.name2;
        updateStreak();
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

function saveNames() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();
    if (!n1 || !n2) return alert("Введите оба имени для начала ❤️");
    
    state.name1 = n1; state.name2 = n2;
    localStorage.setItem('lc_names', JSON.stringify({name1: n1, name2: n2}));
    
    state.stats.sessions++;
    saveData();
    goToScreen('themes');
}

function selectTheme(t) {
    state.theme = t;
    state.used.clear();
    nextCard();
    goToScreen('game');
}

function nextCard() {
    const pool = CARDS_DB[state.theme];
    const available = pool.filter(c => !state.used.has(c.id));
    if (available.length === 0) { state.used.clear(); return nextCard(); }
    
    state.currentCard = available[Math.floor(Math.random() * available.length)];
    state.used.add(state.currentCard.id);
    
    renderCard();
}

function renderCard() {
    const text = state.currentCard.text
        .replace(/{name1}/g, `<span>${state.name1}</span>`)
        .replace(/{name2}/g, `<span>${state.name2}</span>`);
    
    const cardText = document.getElementById('card-text');
    cardText.style.opacity = 0;
    
    setTimeout(() => {
        cardText.innerHTML = text;
        document.getElementById('card-type').innerText = state.theme.toUpperCase();
        document.getElementById('intensity-badge').innerText = state.currentCard.level;
        updateFavUI();
        cardText.style.opacity = 1;
    }, 200);
}

// --- СВАЙПЫ ---
function setupSwipes() {
    const card = document.getElementById('game-card-body');
    card.addEventListener('touchstart', e => state.startX = e.touches[0].clientX);
    card.addEventListener('touchmove', e => {
        const x = e.touches[0].clientX - state.startX;
        if (Math.abs(x) > 10) {
            card.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
        }
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
        state.streak++;
        saveData();
        updateStreak();
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

// --- МИНИ-ИГРЫ ---
function rollDice() {
    const modal = document.getElementById('modal-dice');
    const res = document.getElementById('dice-result');
    const txt = document.getElementById('dice-text');
    
    modal.classList.add('active');
    res.innerText = "?";
    txt.innerText = "Кубик катится...";
    
    setTimeout(() => {
        const val = Math.floor(Math.random() * 6) + 1;
        res.innerText = val;
        txt.innerText = val % 2 === 0 ? `Ходит ${state.name2}` : `Ходит ${state.name1}`;
    }, 1000);
}

function toggleMood(type) {
    if (navigator.vibrate) navigator.vibrate(20);
    alert(`Режим "${type}" активирован (имитация звука)`);
}

// --- УТИЛИТЫ ---
function updateStreak() {
    document.getElementById('streak-val').innerText = state.streak;
    localStorage.setItem('lc_streak', state.streak);
}

function updateFavUI() {
    const isFav = state.favs.some(f => f.id === state.currentCard.id);
    document.getElementById('fav-btn').innerHTML = isFav ? '<i class="fas fa-star" style="color: #ffb703"></i>' : '<i class="far fa-star"></i>';
}

function toggleFavorite() {
    const idx = state.favs.findIndex(f => f.id === state.currentCard.id);
    if (idx === -1) state.favs.push({...state.currentCard, theme: state.theme});
    else state.favs.splice(idx, 1);
    saveData();
    updateFavUI();
}

function showModal(id) {
    if (id === 'stats') {
        document.getElementById('stats-content').innerHTML = `
            <div class="stat-item">Выполнено: <b>${state.stats.done}</b></div>
            <div class="stat-item">Сессий: <b>${state.stats.sessions}</b></div>
            <div class="stat-item">Огонь: <b>${state.streak}</b></div>
        `;
    }
    if (id === 'favs') {
        const list = document.getElementById('favs-list');
        list.innerHTML = state.favs.length 
            ? state.favs.map(f => `<div class="fav-card clay-card" style="margin-bottom:10px; padding:15px; font-size:12px;">${f.text.replace(/{name1}/g, state.name1).replace(/{name2}/g, state.name2)}</div>`).join('')
            : '<p style="text-align:center; opacity:0.5">Тут будут ваши любимые задания</p>';
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
    if (confirm("Сбросить прогресс и имена?")) {
        localStorage.clear();
        location.reload();
    }
}