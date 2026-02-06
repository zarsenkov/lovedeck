let currentTheme = '';
let currentCardData = null;
let timerInt = null;

// Статистика
function updateStats() {
    let stats = JSON.parse(localStorage.getItem('lc_stats') || '{"completed": 0, "sessions": 0, "romance": 0, "fun": 0, "adult": 0, "dates": 0}');
    
    document.getElementById('stat-completed').innerText = stats.completed || 0;
    document.getElementById('stat-sessions').innerText = stats.sessions || 0;
    document.getElementById('stat-favorites').innerText = JSON.parse(localStorage.getItem('lc_favs') || '[]').length;
    document.getElementById('stat-custom').innerText = JSON.parse(localStorage.getItem('lc_customs') || '[]').length;
    
    document.getElementById('stat-romance').innerText = stats.romance || 0;
    document.getElementById('stat-fun').innerText = stats.fun || 0;
    document.getElementById('stat-adult').innerText = stats.adult || 0;
    document.getElementById('stat-dates').innerText = stats.dates || 0;
}

function incrementStat(category) {
    let stats = JSON.parse(localStorage.getItem('lc_stats') || '{"completed": 0, "sessions": 0, "romance": 0, "fun": 0, "adult": 0, "dates": 0}');
    stats.completed = (stats.completed || 0) + 1;
    if (category) {
        stats[category] = (stats[category] || 0) + 1;
    }
    localStorage.setItem('lc_stats', JSON.stringify(stats));
}

function incrementSession() {
    let stats = JSON.parse(localStorage.getItem('lc_stats') || '{"completed": 0, "sessions": 0, "romance": 0, "fun": 0, "adult": 0, "dates": 0}');
    stats.sessions = (stats.sessions || 0) + 1;
    localStorage.setItem('lc_stats', JSON.stringify(stats));
}

// Склонение имен
function declineName(name, caseType = 'dative') {
    if (!name) return "";
    let n = name.trim();
    const vowels = "аяеёиоуыэю";
    
    if (caseType === 'dative') { // Кому?
        if (n.endsWith('а')) return n.slice(0, -1) + 'е';
        if (n.endsWith('я')) return n.slice(0, -1) + 'е';
        if (n.endsWith('й')) return n.slice(0, -1) + 'ю';
        if (n.endsWith('ь')) return n.slice(0, -1) + 'и';
        if (!vowels.includes(n[n.length-1].toLowerCase())) return n + 'у';
    }
    return n;
}

function processText(text) {
    const n1 = localStorage.getItem('lc_name1') || 'Игрок 1';
    const n2 = localStorage.getItem('lc_name2') || 'Игрок 2';
    return text
        .replace(/\[Имя1\]/g, n1)
        .replace(/\[Имя2\]/g, n2)
        .replace(/\[Имя1_кому\]/g, declineName(n1))
        .replace(/\[Имя2_кому\]/g, declineName(n2));
}

document.addEventListener('DOMContentLoaded', () => {
    const quotes = [
        "💖 Любовь — это тишина, которую приятно делить", 
        "🌸 Счастье — это вы вдвоем", 
        "✨ Сегодня идеальный день для нежности",
        "💕 В каждой паре есть своя магия",
        "🌟 Любовь начинается с малого",
        "💝 Вы создаете свою историю"
    ];
    document.getElementById('loading-quote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
    
    setTimeout(() => { 
        document.getElementById('loading-screen').style.opacity = '0'; 
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500); 
    }, 2500);

    // Проверка имен
    if(localStorage.getItem('lc_name1')) {
        goToScreen('themes');
    }
    
    // Предотвращение скролла при свайпах
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const touchDiff = touchY - touchStartY;
        
        // Разрешаем скролл только внутри скроллируемых контейнеров
        const scrollableElement = e.target.closest('.screen, .modal-content, .favs-scroll-area');
        if (!scrollableElement) {
            e.preventDefault();
        }
    }, { passive: false });
});

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    
    // Скролл наверх при смене экрана
    document.querySelector('.app-container').scrollTop = 0;
}

function saveNames() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();
    if(!n1 || !n2) return alert("Пожалуйста, введите оба имени ✨");
    localStorage.setItem('lc_name1', n1); 
    localStorage.setItem('lc_name2', n2);
    goToScreen('themes');
}

function confirmReset() {
    localStorage.removeItem('lc_name1');
    localStorage.removeItem('lc_name2');
    closeModals();
    goToScreen('setup');
}

function selectTheme(t) {
    currentTheme = t;
    incrementSession();
    goToScreen('game');
    nextCard();
}

function nextCard() {
    let card = getRandomCard(currentTheme);
    currentCardData = card;
    const textEl = document.getElementById('card-text');
    
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
        textEl.innerText = processText(card.text);
        document.getElementById('card-type').innerText = (card.type || 'ЗАДАНИЕ').toUpperCase();
        
        // Уровни сложности (визуальный эффект)
        const levels = ['#80ed99', '#ffb703', '#ff4d6d'];
        const levelNames = ['SOFT', 'MEDIUM', 'HARD'];
        const rndIdx = Math.floor(Math.random() * 3);
        const badge = document.getElementById('intensity-badge');
        badge.innerText = levelNames[rndIdx];
        badge.style.background = levels[rndIdx];

        const details = document.getElementById('card-details');
        if (card.tip) {
            details.style.display = 'flex';
            document.getElementById('detail-tip').innerText = card.tip;
        } else { 
            details.style.display = 'none'; 
        }

        updateFavIcon();
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
        
        // Сброс таймера
        resetTimer();
    }, 200);
}

function skipCard() {
    nextCard();
}

function updateFavIcon() {
    let favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    const isFav = favs.some(f => f.text === currentCardData.text);
    const btn = document.querySelector('#fav-btn i');
    btn.className = isFav ? 'fas fa-star' : 'far fa-star';
    btn.parentElement.style.color = isFav ? '#ff758f' : '#ddd';
}

function toggleFavorite() {
    let favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    const idx = favs.findIndex(f => f.text === currentCardData.text);
    if(idx > -1) {
        favs.splice(idx, 1);
    } else {
        // Обработка текста перед сохранением
        const processedCard = {
            text: processText(currentCardData.text),
            originalText: currentCardData.text,
            type: currentCardData.type,
            category: currentTheme,
            tip: currentCardData.tip
        };
        favs.push(processedCard);
    }
    localStorage.setItem('lc_favs', JSON.stringify(favs));
    updateFavIcon();
}

function showModal(id) {
    document.getElementById('modal-' + id).classList.add('active');
    if(id === 'favs') renderFavs();
    if(id === 'stats') updateStats();
    if(id === 'reset') {
        document.getElementById('current-name1').innerText = localStorage.getItem('lc_name1') || 'Игрок 1';
        document.getElementById('current-name2').innerText = localStorage.getItem('lc_name2') || 'Игрок 2';
    }
}

function renderFavs() {
    const list = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    const container = document.getElementById('favs-list');
    if(!list.length) {
        container.innerHTML = "<p style='text-align:center; color:#a38a8e; padding: 40px 20px;'>Пока ничего не добавлено в избранное 💫<br><br>Нажимайте на звездочку на карточках, чтобы сохранить любимые!</p>";
        return;
    }
    
    const categoryEmoji = {
        'romance': '❤️',
        'fun': '😄',
        'adult': '🔥',
        'dates': '📍'
    };
    
    const categoryNames = {
        'romance': 'Романтика',
        'fun': 'Веселье',
        'adult': 'HOT 18+',
        'dates': 'Свидания'
    };
    
    container.innerHTML = list.map((f, i) => `
        <div class="fav-item">
            <span class="fav-tag">${categoryEmoji[f.category] || '✨'} ${categoryNames[f.category] || f.category}</span>
            <div class="fav-type">${f.type || 'задание'}</div>
            <p>${f.text}</p>
            ${f.tip ? `<div style="font-size: 12px; color: #a38a8e; margin-top: 8px;"><i class="fas fa-lightbulb"></i> ${f.tip}</div>` : ''}
            <i class="fas fa-trash-alt del-fav" onclick="removeFav(${i})"></i>
        </div>
    `).join('');
}

function removeFav(index) {
    let favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    favs.splice(index, 1);
    localStorage.setItem('lc_favs', JSON.stringify(favs));
    renderFavs();
    updateFavIcon();
}

function closeModals() { 
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active')); 
}

function saveCustomCard() {
    const val = document.getElementById('custom-card-input').value.trim();
    const cat = document.getElementById('custom-category').value;
    if(!val) {
        alert("Пожалуйста, напишите задание! ✨");
        return;
    }
    let customs = JSON.parse(localStorage.getItem('lc_customs') || '[]');
    customs.push({ 
        text: val, 
        type: 'своё', 
        category: cat,
        originalText: val
    });
    localStorage.setItem('lc_customs', JSON.stringify(customs));
    document.getElementById('custom-card-input').value = '';
    alert("Карточка добавлена! 🎉");
    closeModals();
}

function markAsDone() {
    if(currentCardData) {
        window.usedCards.add(currentCardData.text);
        incrementStat(currentTheme);
    }
    nextCard();
}

function resetTimer() {
    clearInterval(timerInt);
    const display = document.getElementById('timer-display');
    display.innerText = '01:00';
    display.style.background = 'white';
    display.style.color = '#ff758f';
}

function startTimer() {
    clearInterval(timerInt);
    let s = 60;
    const display = document.getElementById('timer-display');
    display.style.background = '#ffccd5';
    display.style.color = '#592d33';
    
    timerInt = setInterval(() => {
        s--;
        let m = Math.floor(s/60);
        let sec = s % 60;
        display.innerText = `${m < 10 ? '0'+m : m}:${sec < 10 ? '0'+sec : sec}`;
        
        if(s <= 10 && s > 0) {
            display.style.background = '#ffb703';
        }
        
        if(s <= 0) { 
            clearInterval(timerInt); 
            display.style.background = '#ff4d6d';
            display.style.color = 'white';
            display.innerText = 'ВРЕМЯ!';
            
            // Вибрация если доступна
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
            // Возврат через 3 секунды
            setTimeout(() => {
                resetTimer();
            }, 3000);
        }
    }, 1000);
}

// Предотвращение случайного закрытия на мобильных
window.addEventListener('beforeunload', (e) => {
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id === 'screen-game') {
        e.preventDefault();
        e.returnValue = '';
    }
});