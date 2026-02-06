let categoriesData = {};
let selectedCats = [];
let players = [];
let scores = {};
let gamePool = [];
let currentPlayerIdx = 0;
let currentScore = 0;
let timer = null;
let timeLeft = 0;
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try { wakeLock = await navigator.wakeLock.request('screen'); } 
        catch (err) { console.error("WakeLock failed:", err); }
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => wakeLock = null);
    }
}

async function init() {
    try {
        const res = await fetch('categories.json');
        const data = await res.json();
        categoriesData = data.categories || data;
        const list = document.getElementById('categories-box');
        Object.keys(categoriesData).forEach(cat => {
            const div = document.createElement('div');
            div.className = 'cat-item';
            div.innerText = cat;
            div.onclick = () => {
                div.classList.toggle('selected');
                selectedCats.includes(cat) ? selectedCats = selectedCats.filter(c => c !== cat) : selectedCats.push(cat);
            };
            list.appendChild(div);
        });
    } catch (e) { console.error("Init failed:", e); }
}

function goBack() {
    const activeScreen = document.querySelector('.screen.active').id;
    if (timer) clearInterval(timer);
    releaseWakeLock();

    switch(activeScreen) {
        case 'setup-screen':
            window.location.href = '../../index.html';
            break;
        case 'category-screen':
            showScreen('setup-screen');
            break;
        case 'transfer-screen':
        case 'game-screen':
        case 'result-screen':
            if (confirm("Вернуться в настройки?")) {
                showScreen('category-screen');
            }
            break;
    }
}

function toggleRules(show) {
    document.getElementById('rules-modal').classList.toggle('active', show);
}

function addPlayer() {
    const input = document.createElement('input');
    input.className = 'joy-input';
    input.placeholder = 'Имя игрока';
    document.getElementById('player-list').appendChild(input);
}

function confirmPlayers() {
    players = Array.from(document.querySelectorAll('.joy-input')).map(i => i.value.trim()).filter(v => v);
    if(players.length < 2) return alert("Нужно минимум 2 игрока!");
    players.forEach(p => scores[p] = 0);
    showScreen('category-screen');
}

function startGame() {
    if(!selectedCats.length) return alert("Выбери тему!");
    gamePool = [];
    selectedCats.forEach(c => gamePool = [...gamePool, ...categoriesData[c]]);
    gamePool.sort(() => Math.random() - 0.5);
    currentPlayerIdx = 0;
    preparePlayer();
}

function preparePlayer() {
    if(currentPlayerIdx >= players.length) return showResults();
    document.getElementById('next-player-name').innerText = players[currentPlayerIdx];
    showScreen('transfer-screen');
}

function startRound() {
    requestWakeLock();
    showScreen('game-screen');
    currentScore = 0;
    timeLeft = parseInt(document.getElementById('time-select').value);
    updateUI();
    nextWord();
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
            releaseWakeLock();
            scores[players[currentPlayerIdx]] += currentScore;
            currentPlayerIdx++;
            preparePlayer();
        }
    }, 1000);
}

function nextWord() {
    if(gamePool.length === 0) {
        clearInterval(timer);
        timer = null;
        showResults();
        return;
    }
    document.getElementById('current-word').innerText = gamePool.pop();
}

function correctWord() {
    currentScore++;
    updateUI();
    nextWord();
    if(window.navigator.vibrate) window.navigator.vibrate([40, 20, 40]);
}

function skipWord() {
    nextWord();
}

function updateUI() {
    document.getElementById('score-counter').innerText = currentScore;
    document.getElementById('timer-display').innerText = timeLeft;
}

function showResults() {
    showScreen('result-screen');
    const board = document.getElementById('final-results');
    board.innerHTML = `<h3 style="margin-bottom:15px">ИТОГИ:</h3>` + 
        Object.entries(scores)
        .sort((a,b) => b[1] - a[1])
        .map(([name, score], i) => `
            <div style="display:flex; justify-content:space-between; padding:15px; background:#F1F2F6; border-radius:15px; margin-bottom:10px; font-weight:900">
                <span>${i===0?'🏆 ':''}${name}</span>
                <span style="color:var(--primary)">${score}</span>
            </div>
        `).join('');
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

init();
