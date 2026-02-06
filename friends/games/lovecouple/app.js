let currentTheme = '';
let currentCardData = null;
let timerInt = null;

// ПАДЕЖИ (кому? чему?)
function declineName(name) {
    if (!name) return "";
    let n = name.trim();
    if (n.endsWith('а') || n.endsWith('я')) return n.slice(0, -1) + 'е';
    if (n.endsWith('й')) return n.slice(0, -1) + 'ю';
    if ("бвгджзклмнпрстфхцчшщ".includes(n[n.length-1].toLowerCase())) return n + 'у';
    return n;
}

function processText(text) {
    const n1 = localStorage.getItem('lc_name1') || 'Игрок 1';
    const n2 = localStorage.getItem('lc_name2') || 'Игрок 2';
    return text
        .replace(/\[Имя1\]/g, n1).replace(/\[Имя2\]/g, n2)
        .replace(/\[Имя1_кому\]/g, declineName(n1))
        .replace(/\[Имя2_кому\]/g, declineName(n2));
}

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
    if(!n1 || !n2) return alert("Введите имена ❤️");
    localStorage.setItem('lc_name1', n1); localStorage.setItem('lc_name2', n2);
    goToScreen('themes');
}

function resetNames() { if(confirm("Изменить имена?")) goToScreen('setup'); }

function selectTheme(t) {
    currentTheme = t;
    goToScreen('game');
    nextCard();
}

function nextCard() {
    let card = getRandomCard(currentTheme);
    currentCardData = card;
    const textEl = document.getElementById('card-text');
    textEl.style.opacity = '0';
    textEl.style.transform = 'scale(0.95)';

    setTimeout(() => {
        textEl.innerText = processText(card.text);
        document.getElementById('card-type').innerText = card.type.toUpperCase();
        
        const details = document.getElementById('card-details');
        if (card.tip) {
            details.style.display = 'block';
            document.getElementById('detail-tip').innerText = card.tip;
        } else { details.style.display = 'none'; }

        let favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
        const isFav = favs.some(f => f.text === card.text);
        document.querySelector('#fav-btn i').className = isFav ? 'fas fa-star' : 'far fa-star';
        document.getElementById('fav-btn').style.color = isFav ? '#ff758f' : '#ffccd5';

        textEl.style.opacity = '1';
        textEl.style.transform = 'scale(1)';
    }, 200);
}

function markAsDone() {
    if(currentCardData) window.usedCards.add(currentCardData.text);
    nextCard();
}

function toggleFavorite() {
    let favs = JSON.parse(localStorage.getItem('lc_favs') || '[]');
    const idx = favs.findIndex(f => f.text === currentCardData.text);
    if(idx > -1) favs.splice(idx, 1);
    else favs.push(currentCardData);
    localStorage.setItem('lc_favs', JSON.stringify(favs));
    nextCard(); // Перелистываем после добавления или просто обновляем иконку
}

function showModal(id) {
    document.getElementById('modal-' + id).classList.add('active');
    if(id === 'favs') {
        const list = JSON.parse(localStorage.getItem('lc_favs') || '[]');
        document.getElementById('favs-list').innerHTML = list.length ? list.map(f => `• ${f.text}<br><br>`).join('') : "Пусто...";
    }
}

function closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active')); }

function saveCustomCard() {
    const val = document.getElementById('custom-card-input').value;
    if(!val) return;
    let customs = JSON.parse(localStorage.getItem('lc_customs') || '[]');
    customs.push({ text: val, type: 'своё', custom: true });
    localStorage.setItem('lc_customs', JSON.stringify(customs));
    alert("Добавлено! ✨");
    document.getElementById('custom-card-input').value = '';
    closeModals();
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
