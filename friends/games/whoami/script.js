let categoriesData = {};
let selectedCategories = [];
let gamePool = [];
let gameState = {
    players: ['ИГРОК 1', 'ИГРОК 2'],
    scores: {},
    currentPlayerIdx: 0,
    currentRound: 1,
    maxRounds: 1,
    timeLeft: 60,
    timer: null
};

// 1. Загрузка категорий из JSON
async function loadCats() {
    try {
        const response = await fetch('categories.json');
        const data = await response.json();
        categoriesData = data.categories || data;
        
        const list = document.getElementById('category-list');
        list.innerHTML = '';

        Object.keys(categoriesData).forEach(catName => {
            const div = document.createElement('div');
            div.className = 'cat-item';
            
            const emojiMatch = catName.match(/[\u{1F300}-\u{1F9FF}]/u);
            const textOnly = catName.replace(/[\u{1F300}-\u{1F9FF}]/u, '').trim();

            div.innerHTML = `
                <div style="font-size: 20px; margin-bottom: 4px;">${emojiMatch ? emojiMatch[0] : '🏷️'}</div>
                <div style="font-size: 10px; line-height: 1.1; font-weight: 800; text-transform: uppercase;">${textOnly}</div>
            `;

            div.onclick = () => {
                div.classList.toggle('selected');
                if (selectedCategories.includes(catName)) {
                    selectedCategories = selectedCategories.filter(c => c !== catName);
                } else {
                    selectedCategories.push(catName);
                }
            };
            list.appendChild(div);
        });
    } catch (e) {
        console.error("Ошибка загрузки:", e);
    }
}

// 2. Старт Игры
function startGame() {
    if (selectedCategories.length === 0) return alert("Выбери категории!");
    
    // Сбор слов
    gamePool = [];
    selectedCategories.forEach(cat => {
        gamePool = [...gamePool, ...categoriesData[cat]];
    });
    gamePool.sort(() => Math.random() - 0.5);

    // Настройки
    gameState.maxRounds = parseInt(document.getElementById('rounds-input').value);
    gameState.currentPlayerIdx = 0;
    gameState.currentRound = 1;
    gameState.scores = {};
    gameState.players.forEach(p => gameState.scores[p] = 0);

    prepareRound();
}

// 3. Подготовка раунда
function prepareRound() {
    const player = gameState.players[gameState.currentPlayerIdx];
    document.getElementById('player-turn-name').innerText = player;
    document.getElementById('countdown').innerText = '3';
    
    toScreen('ready-screen');
    
    let count = 3;
    const interval = setInterval(() => {
        count--;
        if (count === 0) {
            clearInterval(interval);
            beginRound();
        } else {
            document.getElementById('countdown').innerText = count;
        }
    }, 1000);
}

// 4. Активная игра
function beginRound() {
    toScreen('game-screen');
    gameState.timeLeft = parseInt(document.getElementById('time-input').value) || 60;
    updateTimerDisplay();
    
    renderNextWord();
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        if (gameState.timeLeft <= 0) finishRound();
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer-display').innerText = gameState.timeLeft;
}

function renderNextWord() {
    if (gamePool.length === 0) return endGame();
    document.getElementById('current-word').innerText = gamePool.pop();
}

function nextWord(isCorrect) {
    if (isCorrect) {
        const player = gameState.players[gameState.currentPlayerIdx];
        gameState.scores[player]++;
        if (window.navigator.vibrate) window.navigator.vibrate(40);
    }
    renderNextWord();
}

// 5. Завершение раунда / Смена игрока
function finishRound() {
    clearInterval(gameState.timer);
    
    gameState.currentPlayerIdx++;
    if (gameState.currentPlayerIdx >= gameState.players.length) {
        gameState.currentPlayerIdx = 0;
        gameState.currentRound++;
    }

    if (gameState.currentRound > gameState.maxRounds) {
        endGame();
    } else {
        alert("ВРЕМЯ ВЫШЛО! ПЕРЕДАЙ ТЕЛЕФОН.");
        prepareRound();
    }
}

// 6. Итоги
function endGame() {
    clearInterval(gameState.timer);
    toScreen('result-screen');
    
    const board = document.getElementById('final-scoreboard');
    board.innerHTML = "";
    
    const results = Object.entries(gameState.scores).sort((a, b) => b[1] - a[1]);
    
    results.forEach(([name, score], i) => {
        const medal = i === 0 ? '🏆' : (i === 1 ? '🥈' : '🥉');
        board.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 15px; background: var(--bg); border-radius: 12px; margin-bottom: 8px;">
                <span style="font-weight: 900;">${medal} ${name}</span>
                <span style="color: var(--accent); font-family: 'Unbounded';">${score}</span>
            </div>
        `;
    });
}

function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', loadCats);
