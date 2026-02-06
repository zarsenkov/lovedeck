// Конфигурация и состояние
let config = { time: 60, cat: 'common', goal: 25 };
let game = {
    teams: [],
    currentTeamIdx: 0,
    timeLeft: 0,
    timer: null,
    roundLog: [],
    availableWords: [],
    sessionWords: []
};

// 1. Инициализация команд при загрузке
function initTeams() {
    let shuffled = [...TEAM_NAMES].sort(() => 0.5 - Math.random());
    game.teams = [
        { name: shuffled[0], score: 0 },
        { name: shuffled[1], score: 0 }
    ];
    updateUI();
}

function updateUI() {
    const info = document.getElementById('team-info');
    const current = game.teams[game.currentTeamIdx];
    info.innerText = `СЕЙЧАС ХОДИТ: ${current.name.toUpperCase()}`;
}

function setOpt(key, val, el) {
    config[key] = val;
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

// 2. Логика Раунда
function startGame() {
    game.timeLeft = config.time;
    game.roundLog = [];
    game.sessionWords = [...ALIAS_WORDS[config.cat]].sort(() => 0.5 - Math.random());
    
    document.getElementById('live-score').innerText = '0';
    document.getElementById('timer').innerText = `00:${game.timeLeft}`;
    
    toScreen('screen-game');
    nextWord();
    
    game.timer = setInterval(() => {
        game.timeLeft--;
        const s = game.timeLeft;
        document.getElementById('timer').innerText = `00:${s < 10 ? '0' + s : s}`;
        if (game.timeLeft <= 0) finishRound();
    }, 1000);
}

function nextWord() {
    if (game.sessionWords.length === 0) {
        game.sessionWords = [...ALIAS_WORDS[config.cat]].sort(() => 0.5 - Math.random());
    }
    document.getElementById('word-display').innerText = game.sessionWords.pop();
}

function handleWord(isCorrect) {
    const word = document.getElementById('word-display').innerText;
    const team = game.teams[game.currentTeamIdx];
    
    isCorrect ? team.score++ : team.score--;
    game.roundLog.push({ word, isCorrect });
    document.getElementById('live-score').innerText = team.score;
    
    // Анимация карточки
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = isCorrect ? 'translateX(350px) rotate(30deg)' : 'translateX(-350px) rotate(-30deg)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.opacity = '1';
        nextWord();
    }, 300);
}

// 3. Результаты и переключение
function finishRound() {
    clearInterval(game.timer);
    const team = game.teams[game.currentTeamIdx];

    // Проверка на победу
    if (team.score >= config.goal) {
        showWin(team.name);
        return;
    }

    toScreen('screen-results');
    
    // Лидерборд
    document.getElementById('leaderboard').innerHTML = game.teams
        .map(t => `<div style="display:flex; justify-content:space-between"><span>${t.name}</span> <span>${t.score}</span></div>`)
        .join('');

    // Лог раунда
    document.getElementById('results-list').innerHTML = game.roundLog
        .map(i => `<div class="word-row"><span>${i.word}</span><span>${i.isCorrect ? '✅' : '❌'}</span></div>`)
        .join('');
}

function nextTurn() {
    game.currentTeamIdx = (game.currentTeamIdx + 1) % game.teams.length;
    toScreen('screen-start');
    updateUI();
}

function showWin(name) {
    toScreen('screen-win');
    document.getElementById('winner-name').innerText = name.toUpperCase();
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('game-header').style.visibility = (id === 'screen-game') ? 'visible' : 'hidden';
}

function confirmExit() {
    if (confirm("Выйти в настройки? Раунд будет сброшен!")) {
        clearInterval(game.timer);
        toScreen('screen-start');
    }
}

// 4. Плавные Свайпы
let startX = 0;
const card = document.getElementById('main-card');

card.addEventListener('touchstart', e => { 
    startX = e.touches[0].clientX; 
    card.style.transition = 'none'; 
}, {passive: true});

card.addEventListener('touchmove', e => {
    let x = e.touches[0].clientX - startX;
    if(Math.abs(x) > 5) {
        card.style.transform = `translateX(${x}px) rotate(${x/25}deg)`;
    }
}, {passive: true});

card.addEventListener('touchend', e => {
    let x = e.changedTouches[0].clientX - startX;
    if (x > 120) handleWord(true);
    else if (x < -120) handleWord(false);
    else {
        card.style.transition = '0.3s ease-out';
        card.style.transform = 'none';
    }
});

// Старт
initTeams();