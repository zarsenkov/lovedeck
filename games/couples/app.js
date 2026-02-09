// --- СОСТОЯНИЕ ИГРЫ ---
let state = {
    name1: '',
    name2: '',
    currentTheme: '',
    currentCard: null,
    usedCards: new Set(),
    favorites: JSON.parse(localStorage.getItem('lc_favs')) || [],
    stats: JSON.parse(localStorage.getItem('lc_stats')) || { completed: 0, sessions: 0, categories: {} },
    timer: null,
    startX: 0,
    currentX: 0
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    setupSwipeGestures();
    
    // Скрываем лоадер через 2 секунды
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 500);
    }, 2000);
});

// --- НАВИГАЦИЯ ---
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
}

// --- ПРОФИЛЬ И ИМЕНА ---
function saveNames() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();

    if (!n1 || !n2) {
        alert("Пожалуйста, введите оба имени ✨");
        return;
    }

    state.name1 = n1;
    state.name2 = n2;
    localStorage.setItem('lc_names', JSON.stringify({ name1: n1, name2: n2 }));
    
    // Увеличиваем счетчик сессий
    state.stats.sessions++;
    saveData();
    
    goToScreen('themes');
}

function loadProfile() {
    const saved = JSON.parse(localStorage.getItem('lc_names'));
    if (saved) {
        state.name1 = saved.name1;
        state.name2 = saved.name2;
        // Если имена есть, сразу идем к выбору тем
        goToScreen('themes');
    }
}

// --- ЛОГИКА ИГРЫ ---
function selectTheme(theme) {
    state.currentTheme = theme;
    state.usedCards.clear();
    nextCard();
    goToScreen('game');
}

function nextCard() {
    const pool = CARDS_DB[state.currentTheme];
    const available = pool.filter(c => !state.usedCards.has(c.id));

    if (available.length === 0) {
        state.usedCards.clear(); // Сбрасываем круг, если карты кончились
        nextCard();
        return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    state.currentCard = available[randomIndex];
    state.usedCards.add(state.currentCard.id);

    renderCard();
}

function renderCard() {
    const cardBody = document.getElementById('game-card-body');
    const cardText = document.getElementById('card-text');
    const cardType = document.getElementById('card-type');
    const intensity = document.getElementById('intensity-badge');
    const details = document.getElementById('card-details');

    // Плавная замена текста
    cardText.style.opacity = '0';
    
    setTimeout(() => {
        // Подстановка имен
        let text = state.currentCard.text
            .replace(/{name1}/g, `<b>${state.name1}</b>`)
            .replace(/{name2}/g, `<b>${state.name2}</b>`);
        
        cardText.innerHTML = text;
        intensity.innerText = state.currentCard.level;
        intensity.style.background = `var(--${state.currentCard.level.toLowerCase()})`;
        
        // Показываем тип и подсказки (для свиданий)
        cardType.innerText = state.currentTheme.toUpperCase();
        if (state.currentCard.tip) {
            details.style.display = 'flex';
            document.getElementById('detail-tip').innerText = state.currentCard.tip;
        } else {
            details.style.display = 'none';
        }

        // Обновляем кнопку избранного
        updateFavBtnUI();

        cardText.style.opacity = '1';
    }, 200);
}

// --- СВАЙПЫ (TINDER ЛОГИКА) ---
function setupSwipeGestures() {
    const card = document.getElementById('game-card-body');

    card.addEventListener('touchstart', (e) => {
        state.startX = e.touches[0].clientX;
        card.style.transition = 'none';
    });

    card.addEventListener('touchmove', (e) => {
        state.currentX = e.touches[0].clientX;
        const diff = state.currentX - state.startX;
        const rotation = diff / 10;
        card.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
        
        // Подсветка при свайпе
        if (diff > 50) card.style.background = '#e8f5e9'; // Зеленоватый (гуд)
        else if (diff < -50) card.style.background = '#ffebee'; // Красноватый (скип)
        else card.style.background = '#fff';
    });

    card.addEventListener('touchend', () => {
        const diff = state.currentX - state.startX;
        card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s';
        
        if (diff > 120) {
            animateSwipe('right');
        } else if (diff < -120) {
            animateSwipe('left');
        } else {
            card.style.transform = 'translateX(0) rotate(0)';
            card.style.background = '#fff';
        }
        state.startX = 0; state.currentX = 0;
    });
}

function animateSwipe(direction) {
    const card = document.getElementById('game-card-body');
    if (direction === 'right') {
        card.style.transform = 'translateX(1000px) rotate(45deg)';
        markAsDone();
    } else {
        card.style.transform = 'translateX(-1000px) rotate(-45deg)';
        skipCard();
    }

    // Возвращаем карту на место для следующего задания
    setTimeout(() => {
        card.style.opacity = '0';
        card.style.transition = 'none';
        card.style.transform = 'translateX(0) scale(0.95)';
        card.style.background = '#fff';
        
        setTimeout(() => {
            nextCard();
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 50);
    }, 300);
}

// --- СТАТИСТИКА И ДЕЙСТВИЯ ---
function markAsDone() {
    state.stats.completed++;
    const cat = state.currentTheme;
    state.stats.categories[cat] = (state.stats.categories[cat] || 0) + 1;
    saveData();
    if (window.navigator.vibrate) window.navigator.vibrate(30);
}

function skipCard() {
    if (window.navigator.vibrate) window.navigator.vibrate([10, 30]);
}

// --- ИЗБРАННОЕ ---
function toggleFavorite() {
    const idx = state.favorites.findIndex(f => f.id === state.currentCard.id);
    if (idx === -1) {
        state.favorites.push({ ...state.currentCard, category: state.currentTheme });
    } else {
        state.favorites.splice(idx, 1);
    }
    saveData();
    updateFavBtnUI();
}

function updateFavBtnUI() {
    const isFav = state.favorites.some(f => f.id === state.currentCard.id);
    const btn = document.getElementById('fav-btn');
    btn.innerHTML = isFav ? '<i class="fas fa-star" style="color:#ffb703"></i>' : '<i class="far fa-star"></i>';
}

// --- МОДАЛЬНЫЕ ОКНА ---
function showModal(type) {
    if (type === 'favs') renderFavorites();
    if (type === 'stats') renderStats();
    if (type === 'reset') {
        document.getElementById('current-name1').innerText = state.name1;
        document.getElementById('current-name2').innerText = state.name2;
    }
    document.getElementById(`modal-${type}`).classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function renderFavorites() {
    const container = document.getElementById('favs-list');
    if (state.favorites.length === 0) {
        container.innerHTML = "<p style='text-align:center; opacity:0.5'>Тут пока пусто...</p>";
        return;
    }

    container.innerHTML = state.favorites.map(f => `
        <div class="fav-item">
            <div class="fav-type">${f.category}</div>
            <p>${f.text.replace(/{name1}/g, state.name1).replace(/{name2}/g, state.name2)}</p>
            <i class="fas fa-trash del-fav" onclick="removeFav('${f.id}')"></i>
        </div>
    `).join('');
}

function removeFav(id) {
    state.favorites = state.favorites.filter(f => f.id !== id);
    saveData();
    renderFavorites();
    updateFavBtnUI();
}

function renderStats() {
    document.getElementById('stat-completed').innerText = state.stats.completed;
    document.getElementById('stat-sessions').innerText = state.stats.sessions;
    
    const detailed = document.getElementById('detailed-stats');
    detailed.innerHTML = `
        <div class="stats-subtitle">По категориям:</div>
        ${Object.entries(state.stats.categories).map(([cat, val]) => `
            <div class="category-stat-item">
                <span>${cat === 'romance' ? '❤️' : cat === 'adult' ? '🔥' : '🎲'} ${cat}</span>
                <span>${val}</span>
            </div>
        `).join('')}
    `;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ---
function saveData() {
    localStorage.setItem('lc_favs', JSON.stringify(state.favorites));
    localStorage.setItem('lc_stats', JSON.stringify(state.stats));
}

function confirmReset() {
    localStorage.removeItem('lc_names');
    location.reload();
}

function startTimer() {
    const display = document.getElementById('timer-display');
    let timeLeft = 60;
    
    if (state.timer) clearInterval(state.timer);
    
    state.timer = setInterval(() => {
        timeLeft--;
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        display.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        if (timeLeft <= 0) {
            clearInterval(state.timer);
            display.innerText = "01:00";
            alert("Время вышло! ❤️");
        }
    }, 1000);
}