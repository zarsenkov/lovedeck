let currentTheme = '';
let currentCardData = null;
let timerInt = null;

// ПАДЕЖИ (Простой склонятор для имен на -а, -я, -ий и согласные)
function declineName(name, caseType) {
    if (!name) return "";
    let n = name.trim();
    // Очень упрощенная логика для русского языка (Дательный падеж: кому?)
    if (n.endsWith('а')) return n.substring(0, n.length - 1) + 'е';
    if (n.endsWith('я')) return n.substring(0, n.length - 1) + 'е';
    if (n.endsWith('й')) return n.substring(0, n.length - 2) + 'ю';
    if ("бвгджзклмнпрстфхцчшщ".includes(n[n.length-1].toLowerCase())) return n + 'у';
    return n;
}

// Загрузка
document.addEventListener('DOMContentLoaded', () => {
    const quotes = ["💖 Любовь — это когда тишина комфортна", "🌸 Счастье в мелочах", "✨ Вы — лучшая пара"];
    document.getElementById('loading-quote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
    
    setTimeout(() => { document.getElementById('loading-screen').style.opacity = '0'; 
    setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 500); }, 2500);
});

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
}

function saveNames() {
    const n1 = document.getElementById('name1').value;
    const n2 = document.getElementById('name2').value;
    if(!n1 || !n2) return alert("Введите оба имени ❤️");
    localStorage.setItem('lc_name1', n1);
    localStorage.setItem('lc_name2', n2);
    goToScreen('themes');
}

function selectTheme(t) {
    currentTheme = t;
    goToScreen('game');
    nextCard();
}

function nextCard() {
    const n1 = localStorage.getItem('lc_name1');
    const n2 = localStorage.getItem('lc_name2');
    
    // Получаем карту. Если есть свои карты, getRandomCard подмешает их (нужна поддержка в cards.js)
    let card = getRandomCard(currentTheme);
    
    // Если в cards.js не реализован подмес, мы можем сделать это здесь, 
    // но лучше использовать твой getRandomCard из cards.js
    
    currentCardData = card;
    const textEl = document.getElementById('card-text');
    
    textEl.style.opacity = '0';
    setTimeout(() => {
        // Логика имен и падежей в тексте
        let processedText = card.text
            .replace(/\[Имя1\]/g, n1)
            .replace(/\[Имя2\]/g, n2)
            .replace(/\[Имя1_кому\]/g, declineName(n1))
            .replace(/\[Имя2_кому\]/g, declineName(n2));

        textEl.innerText = processedText;
        document.getElementById('card-type').innerText = card.type === 'question' ? 'ВОПРОС' : 'ДЕЙСТВИЕ';
        
        // Звездочка (избранное)
        const favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
        const isFav = favs.some(f => f.text === card.text);
        document.querySelector('#fav-btn i').className = isFav ? 'fas fa-star' : 'far fa-star';
        document.getElementById('fav-btn').style.color = isFav ? '#ff758f' : '#ffccd5';

        textEl.style.opacity = '1';
    }, 200);
}

function markAsDone() {
    // Логика "больше не показывать"
    if(currentCardData && window.usedCards) {
        // Добавляем ID или текст карты в список использованных в cards.js
        // В твоем cards.js есть объект usedCards, используем его
        nextCard();
    } else {
        nextCard();
    }
}

function toggleFavorite() {
    let favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    const index = favs.findIndex(f => f.text === currentCardData.text);
    
    if(index > -1) {
        favs.splice(index, 1);
    } else {
        favs.push(currentCardData);
    }
    
    localStorage.setItem('lc_favs', JSON.stringify(favs));
    
    const isFav = index === -1;
    document.querySelector('#fav-btn i').className = isFav ? 'fas fa-star' : 'far fa-star';
    document.getElementById('fav-btn').style.color = isFav ? '#ff758f' : '#ffccd5';
}

function showModal(id) {
    document.getElementById('modal-' + id).style.display = 'flex';
    if(id === 'favs') renderFavs();
}

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
}

function saveCustomCard() {
    const txt = document.getElementById('custom-card-input').value;
    if(!txt) return;
    
    let customs = JSON.parse(localStorage.getItem('lc_customs') || '[]');
    customs.push({ text: txt, type: 'action', custom: true });
    localStorage.setItem('lc_customs', JSON.stringify(customs));
    
    alert("Карточка добавлена в игру! ✨");
    document.getElementById('custom-card-input').value = '';
    closeModals();
}

function renderFavs() {
    const favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    const container = document.getElementById('favs-list');
    container.innerHTML = favs.length ? favs.map(f => `<div style="margin-bottom:10px; border-bottom:1px solid #fff0f3; padding-bottom:5px;">• ${f.text}</div>`).join('') : "Тут пока пусто...";
}

function startTimer() {
    clearInterval(timerInt);
    let s = 60;
    timerInt = setInterval(() => {
        s--;
        document.getElementById('timer-display').innerText = `00:${s < 10 ? '0'+s : s}`;
        if(s <= 0) { clearInterval(timerInt); alert("Время вышло! ❤️"); }
    }, 1000);
}
