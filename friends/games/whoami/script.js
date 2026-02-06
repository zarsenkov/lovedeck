let categoriesData = {};
let selectedCats = [];
let players = [];
let scores = {};
let gamePool = [];
let currentPlayerIdx = 0;
let currentScore = 0;
let timer;
let timeLeft;

async function init() {
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
}

function addPlayer() {
    const input = document.createElement('input');
    input.className = 'minimal-input';
    input.placeholder = 'Имя игрока';
    document.getElementById('player-list').appendChild(input);
}

function confirmPlayers() {
    players = Array.from(document.querySelectorAll('.minimal-input')).map(i => i.value.trim()).filter(v => v);
    if(players.length < 2) return alert("НУЖНО МИНИМУМ 2 ИГРОКА");
    players.forEach(p => scores[p] = 0);
    showScreen('category-screen');
}

function startGame() {
    if(!selectedCats.length) return alert("ВЫБЕРИТЕ КАТЕГОРИЮ");
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
    showScreen('game-screen');
    currentScore = 0;
    timeLeft = parseInt(document.getElementById('time-select').value);
    updateGameUI();
    nextWord();
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            scores[players[currentPlayerIdx]] += currentScore;
            currentPlayerIdx++;
            preparePlayer();
        }
    }, 1000);
}

function nextWord() {
    if(gamePool.length === 0) {
        clearInterval(timer);
        showResults();
        return;
    }
    document.getElementById('current-word').innerText = gamePool.pop();
}

function correctWord() {
    currentScore++;
    updateGameUI();
    nextWord();
    if(window.navigator.vibrate) window.navigator.vibrate(50);
}

function skipWord() {
    nextWord();
}

function updateGameUI() {
    document.getElementById('score-counter').innerText = `ОЧКИ: ${currentScore}`;
    document.getElementById('timer-display').innerText = timeLeft;
}

function showResults() {
    showScreen('result-screen');
    const board = document.getElementById('final-results');
    board.innerHTML = Object.entries(scores)
        .sort((a,b) => b[1] - a[1])
        .map(([name, score]) => `<div><span>${name}</span><b>${score}</b></div>`)
        .join('');
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

init();
