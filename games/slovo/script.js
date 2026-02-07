let players = [];
let currentPlayerIndex = 0;
let score = 0;
let timeLeft = 60;
let timerId = null;

function addPlayer() {
    const input = document.getElementById('player-name');
    const name = input.value.trim();
    if (name) {
        players.push({ name: name, score: 0 });
        const li = document.createElement('li');
        // Рандомный наклон для стиля зина
        const randomRot = (Math.random() * 4 - 2).toFixed(1);
        li.style.setProperty('--r', randomRot);
        li.innerText = `>> ${name}`;
        document.getElementById('players-list').appendChild(li);
        input.value = '';
        if (players.length >= 1) document.getElementById('start-game-btn').style.display = 'block';
    }
}

function backToSetup() {
    clearInterval(timerId);
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

function startTurn() {
    if (currentPlayerIndex >= players.length) {
        showResults();
        return;
    }
    
    score = 0;
    timeLeft = 60;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    document.getElementById('active-player-name').innerText = players[currentPlayerIndex].name;
    document.getElementById('timer').innerText = timeLeft;
    updateCard();
    
    clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) endTurn();
    }, 1000);
}

function updateCard() {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    document.getElementById('target-word').innerText = randomWord;
    document.getElementById('target-letter').innerText = randomLetter;
}

function handleResult(isWin) {
    if (isWin) score++;
    updateCard();
}

function endTurn() {
    clearInterval(timerId);
    players[currentPlayerIndex].score = score;
    currentPlayerIndex++;
    
    if (currentPlayerIndex < players.length) {
        alert(`СТОП! ${players[currentPlayerIndex-1].name} набрал(а) ${score} очков. Следующий на очереди: ${players[currentPlayerIndex].name}`);
        startTurn();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const statsDiv = document.getElementById('final-stats');
    const sorted = [...players].sort((a, b) => b.score - a.score);
    statsDiv.innerHTML = sorted.map(p => `
        <div class="res-item">
            <strong>${p.name}</strong>: ${p.score} ОЧКОВ
        </div>
    `).join('');
}

document.getElementById('start-game-btn').addEventListener('click', startTurn);
