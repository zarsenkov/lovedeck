let config = { time: 60, goal: 25, cats: ['common'] };
let game = {
    teams: [],
    currentTeamIdx: 0,
    timer: null,
    timeLeft: 0,
    roundLog: [],
    wordsStack: [],
    isLastTurn: false
};

// Инициализация
function init() {
    const names = [...TEAM_NAMES].sort(() => 0.5 - Math.random());
    game.teams = [
        { name: names[0], score: 0 },
        { name: names[1], score: 0 }
    ];
}

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

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('game-header').style.visibility = (id === 'screen-game') ? 'visible' : 'hidden';
}

// Подготовка к ходу
function prepareTurn() {
    const team = game.teams[game.currentTeamIdx];
    
    // Проверка победы ПОСЛЕ того как все походили
    if (game.currentTeamIdx === 0 && game.isLastTurn) {
        checkWinner();
        return;
    }

    document.getElementById('ready-team-name').innerText = team.name.toUpperCase();
    document.getElementById('ready-leaderboard').innerHTML = game.teams
        .map(t => `${t.name}: ${t.score}`).join(' | ');
    toScreen('screen-ready');
}

function startGame() {
    game.timeLeft = config.time;
    game.roundLog = [];
    
    // Собираем слова из всех выбранных категорий
    let allWords = [];
    config.cats.forEach(c => allWords = allWords.concat(ALIAS_WORDS[c]));
    game.wordsStack = allWords.sort(() => 0.5 - Math.random());

    document.getElementById('live-score').innerText = '0';
    toScreen('screen-game');
    nextWord();

    game.timer = setInterval(() => {
        game.timeLeft--;
        const s = game.timeLeft;
        document.getElementById('timer').innerText = `00:${s < 10 ? '0'+s : s}`;
        if (game.timeLeft <= 0) endRound();
    }, 1000);
}

function nextWord() {
    if (game.wordsStack.length === 0) startGame(); // Ресет если слова кончились
    document.getElementById('word-display').innerText = game.wordsStack.pop();
}

function handleWord(isCorrect) {
    const word = document.getElementById('word-display').innerText;
    const team = game.teams[game.currentTeamIdx];
    
    isCorrect ? team.score++ : team.score--;
    game.roundLog.push({ word, isCorrect });
    document.getElementById('live-score').innerText = team.score;

    if (team.score >= config.goal) game.isLastTurn = true;

    // Плавная анимация улета
    const card = document.getElementById('main-card');
    card.style.transition = '0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    card.style.transform = isCorrect ? 'translateX(400px) rotate(40deg)' : 'translateX(-400px) rotate(-40deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.opacity = '1';
        nextWord();
    }, 250);
}

function endRound() {
    clearInterval(game.timer);
    toScreen('screen-results');
    
    document.getElementById('leaderboard').innerHTML = game.teams
        .map(t => `${t.name}: ${t.score}`).join(' | ');
    
    document.getElementById('results-list').innerHTML = game.roundLog
        .map(i => `<div class="word-row"><span>${i.word}</span><span>${i.isCorrect ? '✅' : '❌'}</span></div>`)
        .join('');
    
    // Переход хода
    game.currentTeamIdx = (game.currentTeamIdx + 1) % game.teams.length;
}

function checkWinner() {
    const t1 = game.teams[0];
    const t2 = game.teams[1];
    let winner = null;

    if (t1.score >= config.goal || t2.score >= config.goal) {
        if (t1.score > t2.score) winner = t1;
        else if (t2.score > t1.score) winner = t2;
        else { alert("Ничья! Играем доп. раунд!"); game.isLastTurn = false; prepareTurn(); return; }
        
        toScreen('screen-win');
        document.getElementById('winner-name').innerText = winner.name.toUpperCase();
    } else {
        prepareTurn();
    }
}

function confirmExit() {
    if (confirm("Сбросить игру и вернуться в настройки?")) {
        clearInterval(game.timer);
        location.reload();
    }
}

// Свайпы
let startX = 0;
const card = document.getElementById('main-card');
card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; card.style.transition = 'none'; });
card.addEventListener('touchmove', e => {
    let x = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${x}px) rotate(${x/20}deg)`;
});
card.addEventListener('touchend', e => {
    let x = e.changedTouches[0].clientX - startX;
    if (x > 100) handleWord(true);
    else if (x < -100) handleWord(false);
    else { card.style.transition = '0.2s'; card.style.transform = 'none'; }
});

init();