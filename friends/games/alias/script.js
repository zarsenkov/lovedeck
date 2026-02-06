const dictionary = {
    common: ["Арбуз", "Телефон", "Школа", "Космос", "Пицца", "Гитара", "Облако", "Кенгуру", "Повар", "Зубная паста", "Парашют", "Хомяк"],
    movies: ["Гарри Поттер", "Титаник", "Джокер", "Мстители", "Шрек", "Матрица", "Аватар", "Звездные войны"],
    adult: ["Ипотека", "Дедлайн", "Винишко", "Свидание", "Бессонница", "Корпоратив", "Кризис среднего возраста"]
};

let config = { time: 30, cat: 'common' };
let state = { score: 0, timer: null, timeLeft: 0, usedWords: [], roundLog: [] };

// Инициализация рекорда при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('alias_best');
    if (saved) document.getElementById('best-result').innerText = saved;
});

function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('game-header').style.visibility = (id === 'screen-game') ? 'visible' : 'hidden';
}

function setOpt(key, val, el) {
    config[key] = val;
    el.parentElement.querySelectorAll('.pop-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function startGame() {
    state.score = 0;
    state.roundLog = [];
    state.timeLeft = config.time;
    state.usedWords = [...dictionary[config.cat]];
    document.getElementById('live-score').innerText = '0';
    
    toScreen('screen-game');
    nextWord();
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        if (state.timeLeft <= 0) finishGame();
    }, 1000);
}

function updateTimerDisplay() {
    let s = state.timeLeft;
    document.getElementById('timer').innerText = `00:${s < 10 ? '0'+s : s}`;
    if (s <= 5) document.getElementById('timer').style.background = '#FEB2B2'; // Краснеет в конце
    else document.getElementById('timer').style.background = 'var(--yellow)';
}

function nextWord() {
    if (state.usedWords.length === 0) state.usedWords = [...dictionary[config.cat]];
    const idx = Math.floor(Math.random() * state.usedWords.length);
    const word = state.usedWords.splice(idx, 1)[0];
    document.getElementById('word-display').innerText = word;
}

function handleWord(isCorrect) {
    const word = document.getElementById('word-display').innerText;
    state.score += isCorrect ? 1 : -1;
    state.roundLog.push({ word, isCorrect });
    document.getElementById('live-score').innerText = state.score;
    
    // Визуальный отклик
    const card = document.getElementById('main-card');
    card.style.transform = isCorrect ? "rotate(3deg) translateY(-10px)" : "rotate(-3deg) translateY(10px)";
    setTimeout(() => {
        card.style.transform = "rotate(0) translateY(0)";
        nextWord();
    }, 150);
}

function finishGame() {
    clearInterval(state.timer);
    toScreen('screen-results');
    document.getElementById('final-score').innerText = state.score;
    
    // Сохранение рекорда
    const best = localStorage.getItem('alias_best') || 0;
    if (state.score > best) {
        localStorage.setItem('alias_best', state.score);
        document.getElementById('best-result').innerText = state.score;
    }

    const list = document.getElementById('results-list');
    list.innerHTML = state.roundLog.map(i => `
        <div class="word-row">
            <span>${i.word}</span>
            <span style="background: ${i.isCorrect ? 'var(--mint)' : '#FEB2B2'}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--black);">
                ${i.isCorrect ? '✓' : '✕'}
            </span>
        </div>
    `).join('');
}

function confirmExit() {
    if (confirm("Прервать игру?")) {
        clearInterval(state.timer);
        toScreen('screen-start');
    }
}