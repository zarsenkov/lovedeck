const TRANSLATIONS = {
    general: "ОБЩЕЕ", science: "НАУКА", history: "ИСТОРИЯ", 
    culture: "КУЛЬТУРА", sport: "СПОРТ", geography: "ГЕОГРАФИЯ", 
    movies: "КИНО", music: "МУЗЫКА", literature: "ЛИТЕРАТУРА"
};

let players = [];
let playerScores = {};
let selectedCats = [];
let currentPool = [];
let currentPlayerIdx = 0;
let questionsPerPlayer = 5;
let currentQIdx = 0;
let timer = null;
let timeLeft = 30;
let wakeLock = null;

function init() {
    const list = document.getElementById('categories-box');
    // Берем категории из всех уровней сложности
    const allQs = [...QUIZ_QUESTIONS.easy, ...QUIZ_QUESTIONS.medium, ...QUIZ_QUESTIONS.hard];
    const uniqueCats = [...new Set(allQs.map(q => q.category))];
    
    uniqueCats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerText = TRANSLATIONS[cat] || cat.toUpperCase();
        div.onclick = () => {
            div.classList.toggle('selected');
            selectedCats.includes(cat) ? selectedCats = selectedCats.filter(c => c !== cat) : selectedCats.push(cat);
        };
        list.appendChild(div);
    });
}

// Функция НАЗАД
function goBack() {
    const activeScreen = document.querySelector('.screen.active').id;
    
    if (timer) clearInterval(timer);
    if (wakeLock) { wakeLock.release(); wakeLock = null; }

    if (activeScreen === 'setup-screen') {
        // Назад к списку игр
        window.location.href = '../../index.html';
    } else if (activeScreen === 'transfer-screen' || activeScreen === 'game-screen' || activeScreen === 'result-screen') {
        // Во время игры — назад в настройки
        if (confirm("Выйти в настройки? Текущий прогресс будет потерян.")) {
            location.reload(); 
        }
    }
}

function addPlayer() {
    const input = document.createElement('input');
    input.className = 'joy-input';
    input.placeholder = 'Имя игрока';
    document.getElementById('player-list').appendChild(input);
}

function confirmSetup() {
    players = Array.from(document.querySelectorAll('.joy-input')).map(i => i.value.trim()).filter(v => v);
    if(players.length < 1) return alert("Введите имя игрока!");
    if(selectedCats.length === 0) return alert("Выберите хотя бы одну тему!");
    
    players.forEach(p => playerScores[p] = 0);
    currentPlayerIdx = 0;
    prepareNextPlayer();
}

function prepareNextPlayer() {
    if(currentPlayerIdx >= players.length) return showFinalResults();
    
    // Сбор вопросов
    const allAvailable = [...QUIZ_QUESTIONS.easy, ...QUIZ_QUESTIONS.medium]
        .filter(q => selectedCats.includes(q.category));
    currentPool = allAvailable.sort(() => Math.random() - 0.5).slice(0, questionsPerPlayer);
    
    currentQIdx = 0;
    document.getElementById('next-player-name').innerText = players[currentPlayerIdx];
    showScreen('transfer-screen');
}

async function startTurn() {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    showScreen('game-screen');
    document.getElementById('current-active-player').innerText = `ОТВЕЧАЕТ: ${players[currentPlayerIdx]}`;
    renderQuestion();
}

function renderQuestion() {
    if(currentQIdx >= currentPool.length) {
        currentPlayerIdx++;
        if (wakeLock) { wakeLock.release(); wakeLock = null; }
        return prepareNextPlayer();
    }

    const q = currentPool[currentQIdx];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('score-counter').innerText = playerScores[players[currentPlayerIdx]];
    
    const box = document.getElementById('answers-box');
    box.innerHTML = '';
    
    q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        btn.onclick = () => checkAnswer(idx, btn);
        box.appendChild(btn);
    });

    startTimer();
}

function checkAnswer(idx, btn) {
    clearInterval(timer);
    const q = currentPool[currentQIdx];
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');

    if(idx === q.correct) {
        btn.classList.add('correct');
        playerScores[players[currentPlayerIdx]] += (10 + Math.floor(timeLeft/2));
        if(window.navigator.vibrate) window.navigator.vibrate(40);
    } else {
        if(btn) {
            btn.classList.add('wrong');
            if(window.navigator.vibrate) window.navigator.vibrate([50, 50]);
        }
        btns[q.correct].classList.add('correct');
    }

    setTimeout(() => {
        currentQIdx++;
        renderQuestion();
    }, 1500);
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    document.getElementById('timer-display').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if(timeLeft <= 0) { clearInterval(timer); checkAnswer(-1, null); }
    }, 1000);
}

function showFinalResults() {
    showScreen('result-screen');
    const board = document.getElementById('final-results');
    const sorted = Object.entries(playerScores).sort((a,b) => b[1] - a[1]);
    
    board.innerHTML = `<h3 style="text-align:center; margin-bottom:20px">ИТОГИ БАТТЛА</h3>` + 
        sorted.map(([name, score], i) => `
            <div style="display:flex; justify-content:space-between; padding:15px; background:#F1F2F6; border-radius:15px; margin-bottom:10px; font-weight:900; border: 2px solid ${i===0?'var(--bg)':'#eee'}">
                <span>${i===0?'🏆 ':''}${name}</span>
                <span style="color:var(--bg)">${score}</span>
            </div>
        `).join('');
}

function toggleRules(show) { document.getElementById('rules-modal').classList.toggle('active', show); }
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active'); 
}

init();
