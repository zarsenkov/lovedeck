let categoriesData = {};
let selectedCategories = [];
let gamePool = [];
let players = [];
let scores = {};
let currentPlayerIdx = 0;
let currentAskerIdx = 0;
let timer;
let timeLeft;

// 1. Загрузка категорий из твоего файла
async function loadCats() {
    try {
        const response = await fetch('categories.json');
        const data = await response.json();
        categoriesData = data.categories || data;
        const list = document.getElementById('category-list');
        Object.keys(categoriesData).forEach(cat => {
            const div = document.createElement('div');
            div.className = 'cat-item';
            div.innerHTML = `<div>${cat.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || 'DATA'}</div>
                             <div style="font-size:9px">${cat.replace(/[\u{1F300}-\u{1F9FF}]/u, '').trim()}</div>`;
            div.onclick = () => {
                div.classList.toggle('selected');
                selectedCategories.includes(cat) ? 
                    selectedCategories = selectedCategories.filter(c => c !== cat) : 
                    selectedCategories.push(cat);
            };
            list.appendChild(div);
        });
    } catch (e) { console.error("LOAD_ERROR:", e); }
}

// 2. Управление игроками
function addPlayerInput() {
    const container = document.getElementById('player-list-inputs');
    const input = document.createElement('input');
    input.className = 'system-input';
    input.placeholder = `OBJECT_0${container.children.length + 1}`;
    container.appendChild(input);
}

function confirmPlayers() {
    const inputs = document.querySelectorAll('.system-input');
    players = Array.from(inputs).map(i => i.value.trim()).filter(v => v !== "");
    if (players.length < 2) return alert("MIN_2_OBJECTS_REQUIRED");
    players.forEach(p => scores[p] = 0);
    toScreen('category-screen');
}

// 3. Игровой цикл
function startGame() {
    if (selectedCategories.length === 0) return alert("SELECT_MODULES");
    gamePool = [];
    selectedCategories.forEach(cat => gamePool = [...gamePool, ...categoriesData[cat]]);
    gamePool.sort(() => Math.random() - 0.5);
    
    currentPlayerIdx = 0;
    showTransferScreen();
}

function showTransferScreen() {
    document.getElementById('next-player-name').innerText = players[currentPlayerIdx];
    toScreen('transfer-screen');
}

function prepareCountdown() {
    toScreen('countdown-screen');
    let count = 3;
    const el = document.getElementById('countdown-number');
    el.innerText = count;
    const cd = setInterval(() => {
        count--;
        el.innerText = count;
        if(count === 0) { clearInterval(cd); beginRound(); }
    }, 1000);
}

function beginRound() {
    toScreen('game-screen');
    timeLeft = parseInt(document.getElementById('time-input').value) || 60;
    document.getElementById('timer-display').innerText = timeLeft;
    document.getElementById('active-guesser-name').innerText = players[currentPlayerIdx];
    
    currentAskerIdx = (currentPlayerIdx + 1) % players.length;
    updateAskerUI();
    renderWord();
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if(timeLeft <= 0) finishRound();
    }, 1000);
}

function renderWord() {
    if(gamePool.length === 0) return endGame();
    document.getElementById('current-word').innerText = gamePool.pop();
}

function handleNo() {
    currentAskerIdx = (currentAskerIdx + 1) % players.length;
    if(currentAskerIdx === currentPlayerIdx) {
        currentAskerIdx = (currentAskerIdx + 1) % players.length;
    }
    updateAskerUI();
    if(window.navigator.vibrate) window.navigator.vibrate(30);
}

function updateAskerUI() {
    document.getElementById('current-asker-name').innerText = players[currentAskerIdx];
}

function handleYes() {
    scores[players[currentPlayerIdx]]++;
    if(window.navigator.vibrate) window.navigator.vibrate([50, 20, 50]);
    renderWord();
}

function finishRound() {
    clearInterval(timer);
    currentPlayerIdx++;
    if(currentPlayerIdx >= players.length) {
        endGame();
    } else {
        showTransferScreen();
    }
}

function endGame() {
    toScreen('result-screen');
    const board = document.getElementById('final-scoreboard');
    board.innerHTML = Object.entries(scores)
        .sort((a,b) => b[1]-a[1])
        .map(([name, score], i) => `
            <div style="display:flex; justify-content:space-between; padding:15px; border: 1px solid ${i===0?'var(--primary)':'var(--border)'}; margin-bottom:8px; background: ${i===0?'rgba(0,255,156,0.1)':'none'}">
                <span>${i===0?'>> ':''}${name}</span>
                <span style="color:var(--primary)">${score}</span>
            </div>
        `).join('');
}

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

loadCats();
