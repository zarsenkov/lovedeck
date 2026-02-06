// Проверка загрузки словаря
const dictionary = typeof ALIAS_WORDS !== 'undefined' ? ALIAS_WORDS : {
    common: ["Ошибка загрузки", "Проверьте cards.js"],
    movies: ["Ошибка"], hard: ["Ошибка"]
};

let config = { time: 60, cat: 'common', teams: 2 };
let state = { 
    score: 0, 
    timer: null, 
    timeLeft: 0, 
    roundLog: [], 
    currentTeam: 1, 
    scores: { 1: 0, 2: 0, 3: 0 },
    availableWords: []
};

// Переключение настроек (время и категория)
function setOpt(key, val, el) {
    config[key] = val;
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

// Выбор количества команд
function setTeams(val, el) {
    config.teams = val;
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

// Навигация по экранам
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const header = document.getElementById('game-header');
    header.style.visibility = (id === 'screen-game') ? 'visible' : 'hidden';
    
    if(id === 'screen-start') {
        document.getElementById('team-info').innerText = `ОЧЕРЕДЬ: КОМАНДА ${state.currentTeam}`;
    }
}

// Запуск раунда
function startGame() {
    state.score = 0;
    state.roundLog = [];
    state.timeLeft = config.time;
    state.availableWords = [...dictionary[config.cat]];
    
    document.getElementById('live-score').innerText = '0';
    document.getElementById('timer').innerText = `00:${state.timeLeft}`;
    
    toScreen('screen-game');
    nextWord();
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        let s = state.timeLeft;
        document.getElementById('timer').innerText = `00:${s < 10 ? '0'+s : s}`;
        if (state.timeLeft <= 0) finishGame();
    }, 1000);
}

// Выдача следующего слова
function nextWord() {
    if (state.availableWords.length === 0) {
        state.availableWords = [...dictionary[config.cat]];
    }
    const idx = Math.floor(Math.random() * state.availableWords.length);
    const word = state.availableWords.splice(idx, 1)[0];
    document.getElementById('word-display').innerText = word;
}

// Обработка кнопки/свайпа
function handleWord(isCorrect) {
    const word = document.getElementById('word-display').innerText;
    state.score += isCorrect ? 1 : -1;
    state.roundLog.push({ word, isCorrect });
    document.getElementById('live-score').innerText = state.score;
    
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = isCorrect ? 'translateX(250px) rotate(25deg)' : 'translateX(-250px) rotate(-25deg)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'translateX(0) rotate(0)';
        card.style.opacity = '1';
        nextWord();
    }, 250);
}

// Конец раунда
function finishGame() {
    clearInterval(state.timer);
    state.scores[state.currentTeam] += state.score;
    toScreen('screen-results');
    
    let summary = "СЧЕТ: ";
    for(let i=1; i<=config.teams; i++) {
        summary += `К${i} [${state.scores[i]}]   `;
    }
    document.getElementById('team-scores-summary').innerText = summary;

    const list = document.getElementById('results-list');
    list.innerHTML = state.roundLog.map(i => `
        <div class="word-row">
            <span>${i.word}</span>
            <span style="color: ${i.isCorrect ? '#48BB78' : '#F56565'}">${i.isCorrect ? '✓' : '✕'}</span>
        </div>
    `).join('');
}

// Передача хода следующей команде
function prepareNextTurn() {
    state.currentTeam = state.currentTeam >= config.teams ? 1 : state.currentTeam + 1;
    toScreen('screen-start');
}

// Выход из игры
function confirmExit() {
    if(confirm("Выйти в меню? Очки этого раунда сгорят!")) {
        clearInterval(state.timer);
        toScreen('screen-start');
    }
}

// ЛОГИКА СВАЙПОВ (для мобильных)
let startX = 0;
const gameCard = document.getElementById('main-card');

gameCard.addEventListener('touchstart', e => { 
    startX = e.touches[0].clientX; 
    gameCard.style.transition = 'none'; 
}, {passive: true});

gameCard.addEventListener('touchmove', e => {
    let x = e.touches[0].clientX - startX;
    if(Math.abs(x) > 5) {
        gameCard.style.transform = `translateX(${x}px) rotate(${x/15}deg)`;
    }
}, {passive: true});

gameCard.addEventListener('touchend', e => {
    let x = e.changedTouches[0].clientX - startX;
    if (x > 120) {
        handleWord(true);
    } else if (x < -120) {
        handleWord(false);
    } else {
        gameCard.style.transition = '0.3s';
        gameCard.style.transform = 'translateX(0) rotate(0)';
    }
});