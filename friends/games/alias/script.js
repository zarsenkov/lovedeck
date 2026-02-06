let config = { time: 60, cats: ['common'] };
let game = {
    teams: [],
    currentTeamIdx: 0,
    timer: null,
    timeLeft: 0,
    roundLog: [], // Сюда сохраняем объекты {word, isCorrect}
    wordsStack: []
};

// 1. ИНИЦИАЛИЗАЦИЯ
function setOpt(key, val, el) {
    config[key] = val;
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function toggleCat(cat, el) {
    if (el.classList.contains('active')) {
        if (config.cats.length > 1) {
            config.cats = config.cats.filter(c => c !== cat);
            el.classList.remove('active');
        }
    } else {
        config.cats.push(cat);
        el.classList.add('active');
    }
}

function initBattle() {
    const names = [...TEAM_NAMES].sort(() => 0.5 - Math.random());
    game.teams = [
        { name: names[0], score: 0, roundLog: [] },
        { name: names[1], score: 0, roundLog: [] }
    ];
    game.currentTeamIdx = 0;
    prepareTurn();
}

function prepareTurn() {
    const team = game.teams[game.currentTeamIdx];
    document.getElementById('ready-team-name').innerText = team.name.toUpperCase();
    toScreen('screen-ready');
}

// 2. ИГРОВОЙ ПРОЦЕСС
function startGame() {
    game.timeLeft = config.time;
    game.roundLog = [];
    
    let allWords = [];
    config.cats.forEach(c => allWords = allWords.concat(ALIAS_WORDS[c]));
    game.wordsStack = allWords.sort(() => 0.5 - Math.random());

    document.getElementById('live-score').innerText = '0';
    toScreen('screen-game');
    nextWord();

    game.timer = setInterval(() => {
        game.timeLeft--;
        document.getElementById('timer').innerText = `00:${game.timeLeft < 10 ? '0'+game.timeLeft : game.timeLeft}`;
        if (game.timeLeft <= 0) showRoundReview();
    }, 1000);
}

function nextWord() {
    if (game.wordsStack.length === 0) {
        config.cats.forEach(c => game.wordsStack = game.wordsStack.concat(ALIAS_WORDS[c]));
        game.wordsStack.sort(() => 0.5 - Math.random());
    }
    document.getElementById('word-display').innerText = game.wordsStack.pop();
}

function handleWord(isCorrect) {
    const word = document.getElementById('word-display').innerText;
    game.roundLog.push({ word, isCorrect });
    
    // Мгновенный счет на экране
    let currentTempScore = game.roundLog.reduce((acc, item) => acc + (item.isCorrect ? 1 : -1), 0);
    document.getElementById('live-score').innerText = currentTempScore;

    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(350px) rotate(30deg)' : 'translateX(-350px) rotate(-30deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none'; card.style.transform = 'none'; card.style.opacity = '1';
        nextWord();
    }, 200);
}

// 3. ЭКРАН ПРОВЕРКИ СЛОВ
function showRoundReview() {
    clearInterval(game.timer);
    toScreen('screen-results');
    
    const team = game.teams[game.currentTeamIdx];
    document.getElementById('res-team-name').innerText = team.name;
    
    renderReviewList();
    
    // Если походил второй игрок, меняем текст кнопки
    document.getElementById('res-continue-btn').innerText = (game.currentTeamIdx === 0) ? "ПЕРЕДАТЬ ХОД" : "К ИТОГАМ БАТТЛА";
}

function renderReviewList() {
    const list = document.getElementById('results-list');
    list.innerHTML = game.roundLog.map((item, index) => `
        <div class="word-row">
            <span>${item.word}</span>
            <span class="status-icon" onclick="toggleWordStatus(${index})">
                ${item.isCorrect ? '✅' : '❌'}
            </span>
        </div>
    `).join('');
    
    // Считаем итоговый балл
    let score = game.roundLog.reduce((acc, item) => acc + (item.isCorrect ? 1 : -1), 0);
    document.getElementById('res-team-score').innerText = score;
    game.teams[game.currentTeamIdx].score = score;
}

function toggleWordStatus(index) {
    game.roundLog[index].isCorrect = !game.roundLog[index].isCorrect;
    renderReviewList();
}

function handleResultContinue() {
    if (game.currentTeamIdx === 0) {
        game.currentTeamIdx = 1;
        prepareTurn();
    } else {
        showFinalWinner();
    }
}

// 4. ФИНАЛ
function showFinalWinner() {
    toScreen('screen-results'); // Используем тот же экран, но с финальным оформлением
    const t1 = game.teams[0];
    const t2 = game.teams[1];
    
    let winMsg = "";
    if (t1.score > t2.score) winMsg = `ПОБЕДИЛИ ${t1.name.toUpperCase()}!`;
    else if (t2.score > t1.score) winMsg = `ПОБЕДИЛИ ${t2.name.toUpperCase()}!`;
    else winMsg = "НИЧЬЯ! ВОТ ЭТО БИТВА!";

    document.querySelector('#screen-results h2').innerText = "ФИНАЛ";
    document.getElementById('results-list').innerHTML = `
        <div class="summary-box" style="background:var(--mint); margin: 20px 0;">
            ${t1.name}: ${t1.score}<br>
            ${t2.name}: ${t2.score}
        </div>
        <h3 style="text-align:center; font-weight:900;">${winMsg}</h3>
    `;
    document.getElementById('res-continue-btn').innerText = "НОВЫЙ БАТТЛ";
    document.getElementById('res-continue-btn').onclick = () => location.reload();
}

// 5. ВСПОМОГАТЕЛЬНОЕ
function toggleRules(show) {
    document.getElementById('modal-rules').classList.toggle('active', show);
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('game-header').style.visibility = (id === 'screen-game') ? 'visible' : 'hidden';
}

function confirmExit() {
    if (confirm("Выйти в меню? Прогресс будет потерян.")) location.reload();
}

// Свайпы (без изменений)
let startX = 0;
const card = document.getElementById('main-card');
card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; card.style.transition = 'none'; }, {passive:true});
card.addEventListener('touchmove', e => {
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/25}deg)`;
}, {passive:true});
card.addEventListener('touchend', e => {
    let x = e.changedTouches[0].clientX - startX;
    if (x > 110) handleWord(true);
    else if (x < -110) handleWord(false);
    else { card.style.transition = '0.2s'; card.style.transform = 'none'; }
});

initBattle(); // Предзагрузка имен
