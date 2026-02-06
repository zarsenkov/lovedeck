let game = {
    players: [],
    currentPlayerIndex: 0,
    selectedCats: [],
    roundWords: [],
    currentWordIndex: 0,
    scores: {},
    timer: 60,
    interval: null,
    startX: 0,
    currentX: 0
};

const LABELS = {
    objects: 'ПРЕДМЕТЫ', animals: 'ЖИВОТНЫЕ', actions: 'ДЕЙСТВИЯ',
    professions: 'ПРОФЕССИИ', movies: 'КИНО', food: 'ЕДА', memnoe: 'МЕМНОЕ'
};

function init() {
    const grid = document.getElementById('categoriesGrid');
    Object.keys(crocodileWords).forEach(cat => {
        if (cat === 'adult') return;
        const div = document.createElement('div');
        div.className = 'cat-tag';
        div.innerText = LABELS[cat] || cat;
        div.onclick = () => {
            div.classList.toggle('active');
            game.selectedCats.includes(cat) ? 
                game.selectedCats = game.selectedCats.filter(c => c !== cat) : 
                game.selectedCats.push(cat);
        };
        grid.appendChild(div);
    });
    setupGestures();
}

function addPlayerField() {
    const list = document.getElementById('playerList');
    const div = document.createElement('div');
    div.className = 'player-bubble';
    div.innerHTML = `
        <input type="text" class="player-input" placeholder="ИМЯ">
        <button class="del-p" onclick="removePlayer(this)">×</button>
    `;
    list.insertBefore(div, list.lastElementChild);
}

function removePlayer(btn) {
    if (document.querySelectorAll('.player-bubble').length > 2) {
        btn.parentElement.remove();
    } else {
        alert("Минимум 2 игрока");
    }
}

function startGame() {
    const names = Array.from(document.querySelectorAll('.player-input')).map(i => i.value.trim()).filter(v => v);
    if (names.length < 2) return alert('Нужно 2 игрока');
    if (game.selectedCats.length === 0) return alert('Выбери тему');
    
    game.players = names;
    game.players.forEach(p => game.scores[p] = 0);
    game.currentPlayerIndex = 0;
    showTransfer();
}

function showTransfer() {
    if (game.currentPlayerIndex >= game.players.length) return showFinal();
    switchScreen('transfer');
    document.getElementById('currentPlayerName').innerText = game.players[game.currentPlayerIndex];
}

function startRound() {
    let pool = [];
    game.selectedCats.forEach(c => pool = pool.concat(crocodileWords[c]));
    game.roundWords = pool.sort(() => Math.random() - 0.5).slice(0, 15);
    game.currentWordIndex = 0;
    
    switchScreen('game');
    document.getElementById('gamePlayerName').innerText = game.players[game.currentPlayerIndex];
    updateWord();
    startTimer();
}

function updateWord() {
    if (game.currentWordIndex >= game.roundWords.length) return endRound();
    const w = game.roundWords[game.currentWordIndex];
    document.getElementById('currentWord').innerText = w.word;
    document.getElementById('wordCategory').innerText = LABELS[w.category];
}

function setupGestures() {
    const area = document.getElementById('swipeArea');
    const card = document.getElementById('wordCard');
    const sDone = document.querySelector('.swipe-label.done');
    const sSkip = document.querySelector('.swipe-label.skip');

    area.addEventListener('touchstart', e => { 
        game.startX = e.touches[0].clientX;
        card.style.transition = 'none';
    });
    
    area.addEventListener('touchmove', e => {
        game.currentX = e.touches[0].clientX - game.startX;
        let rotation = game.currentX / 10;
        card.style.transform = `translateX(${game.currentX}px) rotate(${rotation}deg)`;
        
        sDone.style.opacity = game.currentX > 50 ? game.currentX / 100 : 0;
        sSkip.style.opacity = game.currentX < -50 ? Math.abs(game.currentX) / 100 : 0;
    });

    area.addEventListener('touchend', e => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        if (game.currentX > 120) {
            handleAnswer(true);
        } else if (game.currentX < -120) {
            handleAnswer(false);
        }
        card.style.transform = '';
        sDone.style.opacity = 0;
        sSkip.style.opacity = 0;
        game.currentX = 0;
    });
}

function handleAnswer(isOk) {
    if (isOk) game.scores[game.players[game.currentPlayerIndex]]++;
    game.currentWordIndex++;
    updateWord();
}

function startTimer() {
    game.timer = 60;
    document.getElementById('timer').innerText = game.timer;
    clearInterval(game.interval);
    game.interval = setInterval(() => {
        game.timer--;
        document.getElementById('timer').innerText = game.timer;
        if (game.timer <= 0) endRound();
    }, 1000);
}

function endRound() {
    clearInterval(game.interval);
    game.currentPlayerIndex++;
    showTransfer();
}

function showFinal() {
    switchScreen('results');
    const res = document.getElementById('leaderboard');
    const sorted = Object.entries(game.scores).sort((a,b) => b[1]-a[1]);
    res.innerHTML = sorted.map(([n, s], i) => `
        <div class="score-row" style="display:flex; justify-content:space-between; padding:20px; border-bottom:1px solid #222;">
            <span>${i+1}. ${n}</span>
            <span style="color:var(--accent)">${s} очков</span>
        </div>
    `).join('');
}

function switchScreen(screen) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(screen + 'Screen').classList.add('active');
}

function showRules() { document.getElementById('rulesModal').classList.add('active'); }
function closeRules() { document.getElementById('rulesModal').classList.remove('active'); }
function exitToCluster() { window.location.href = '../../index.html'; }

document.addEventListener('DOMContentLoaded', init);
