let config = { time: 60, cats: ['common'] };
let game = {
    teams: [],
    currentTeamIdx: 0,
    timer: null,
    timeLeft: 0,
    roundScore: 0,
    roundLog: [],
    wordsStack: []
};

// Настройки
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

// Запуск баттла
function initBattle() {
    const names = [...TEAM_NAMES].sort(() => 0.5 - Math.random());
    game.teams = [
        { name: names[0], score: 0 },
        { name: names[1], score: 0 }
    ];
    game.currentTeamIdx = 0;
    prepareTurn();
}

function prepareTurn() {
    const team = game.teams[game.currentTeamIdx];
    document.getElementById('ready-team-name').innerText = team.name.toUpperCase();
    toScreen('screen-ready');
}

function startGame() {
    game.timeLeft = config.time;
    game.roundScore = 0;
    game.roundLog = [];
    
    // Собираем слова
    let allWords = [];
    config.cats.forEach(c => allWords = allWords.concat(ALIAS_WORDS[c]));
    game.wordsStack = allWords.sort(() => 0.5 - Math.random());

    document.getElementById('live-score').innerText = '0';
    document.getElementById('timer').innerText = `00:${game.timeLeft}`;
    toScreen('screen-game');
    nextWord();

    game.timer = setInterval(() => {
        game.timeLeft--;
        const s = game.timeLeft;
        document.getElementById('timer').innerText = `00:${s < 10 ? '0'+s : s}`;
        if (game.timeLeft <= 0) endTurn();
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
    game.roundScore += isCorrect ? 1 : -1;
    game.roundLog.push({ word, isCorrect });
    document.getElementById('live-score').innerText = game.roundScore;

    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(350px) rotate(30deg)' : 'translateX(-350px) rotate(-30deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.opacity = '1';
        nextWord();
    }, 200);
}

function endTurn() {
    clearInterval(game.timer);
    game.teams[game.currentTeamIdx].score = game.roundScore;

    if (game.currentTeamIdx === 0) {
        // Если это была первая команда, передаем ход второй
        game.currentTeamIdx = 1;
        prepareTurn();
    } else {
        // Если походили оба — показываем финал
        showFinalResults();
    }
}

function showFinalResults() {
    toScreen('screen-results');
    const t1 = game.teams[0];
    const t2 = game.teams[1];
    
    let winnerText = "";
    if (t1.score > t2.score) winnerText = t1.name;
    else if (t2.score > t1.score) winnerText = t2.name;
    else winnerText = "НИЧЬЯ";

    document.getElementById('winner-title').innerText = winnerText === "НИЧЬЯ" ? "НИЧЬЯ!" : "ПОБЕДА!";
    document.getElementById('final-score-box').innerHTML = `
        ${t1.name}: ${t1.score}<br>
        ${t2.name}: ${t2.score}
    `;

    document.getElementById('results-list').innerHTML = game.roundLog
        .map(i => `<div class="word-row"><span>${i.word}</span><span>${i.isCorrect ? '✅' : '❌'}</span></div>`)
        .join('');
}

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('game-header').style.visibility = (id === 'screen-game') ? 'visible' : 'hidden';
}

function confirmExit() {
    if (confirm("Вернуться в меню? Текущий баттл будет сброшен.")) {
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
    card.style.transform = `translateX(${x}px) rotate(${x/25}deg)`;
});
card.addEventListener('touchend', e => {
    let x = e.changedTouches[0].clientX - startX;
    if (x > 110) handleWord(true);
    else if (x < -110) handleWord(false);
    else { card.style.transition = '0.2s'; card.style.transform = 'none'; }
});
