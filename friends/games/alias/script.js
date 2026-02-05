// ==================== STATE ====================
const state = {
    mode: 'alias',
    categories: ['base'],
    teams: [
        { name: 'Команда 1', score: 0 },
        { name: 'Команда 2', score: 0 }
    ],
    roundTime: 60,
    winScore: 30,
    currentTeam: 0,
    roundPoints: 0,
    usedWords: new Set(),
    availableWords: [],
    timer: null,
    timeLeft: 0
};

// ==================== SCREEN MANAGER ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ==================== WORD POOL MANAGEMENT ====================
function buildWordPool() {
    state.availableWords = [];
    state.categories.forEach(category => {
        if (CARDS[category]) {
            state.availableWords.push(...CARDS[category]);
        }
    });
    // Shuffle word pool
    state.availableWords.sort(() => Math.random() - 0.5);
}

function getNextWord() {
    // Filter out used words
    const availableWords = state.availableWords.filter(word => !state.usedWords.has(word));
    
    if (availableWords.length === 0) {
        // Reset if all words have been used
        state.usedWords.clear();
        return getNextWord();
    }
    
    // Get random word from available pool
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    state.usedWords.add(word);
    return word;
}

// ==================== GAME LOGIC ====================
function startGame() {
    // Get settings
    state.mode = document.querySelector('.toggle-btn.active').dataset.mode;
    
    const selectedCategories = Array.from(
        document.querySelectorAll('.checkbox-label input:checked')
    ).map(input => input.value);
    
    if (selectedCategories.length === 0) {
        alert('Выберите хотя бы одну категорию');
        return;
    }
    
    state.categories = selectedCategories;
    state.teams[0].name = document.getElementById('team1-name').value || 'Команда 1';
    state.teams[1].name = document.getElementById('team2-name').value || 'Команда 2';
    state.roundTime = parseInt(document.getElementById('round-time').value) || 60;
    state.winScore = parseInt(document.getElementById('win-score').value) || 30;
    
    // Reset scores
    state.teams[0].score = 0;
    state.teams[1].score = 0;
    state.currentTeam = 0;
    state.usedWords.clear();
    
    buildWordPool();
    showTeamTurn();
}

function showTeamTurn() {
    const currentTeam = state.teams[state.currentTeam];
    document.getElementById('current-team-display').textContent = currentTeam.name;
    
    const instruction = state.mode === 'alias' 
        ? 'Объясните слова своей команде' 
        : 'Покажите слова жестами';
    document.getElementById('mode-instruction').textContent = instruction;
    
    updateScoreBoard();
    showScreen('team-turn-screen');
}

function startRound() {
    state.roundPoints = 0;
    state.timeLeft = state.roundTime;
    
    updateScoreBoard();
    document.getElementById('round-points').textContent = state.roundPoints;
    displayNextWord();
    startTimer();
    showScreen('game-screen');
}

function displayNextWord() {
    const word = getNextWord();
    document.getElementById('current-word').textContent = word;
}

function startTimer() {
    const timerFill = document.getElementById('timer-fill');
    const startTime = Date.now();
    const endTime = startTime + (state.roundTime * 1000);
    
    clearInterval(state.timer);
    
    state.timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        state.timeLeft = Math.ceil(remaining / 1000);
        
        const progress = (remaining / (state.roundTime * 1000)) * 100;
        timerFill.style.width = progress + '%';
        
        if (remaining <= 0) {
            endRound();
        }
    }, 100);
}

function correctWord() {
    state.roundPoints++;
    document.getElementById('round-points').textContent = state.roundPoints;
    displayNextWord();
}

function skipWord() {
    state.roundPoints = Math.max(0, state.roundPoints - 1);
    document.getElementById('round-points').textContent = state.roundPoints;
    displayNextWord();
}

function endRound() {
    clearInterval(state.timer);
    
    // Add round points to team score
    state.teams[state.currentTeam].score += state.roundPoints;
    
    // Check for winner
    if (state.teams[state.currentTeam].score >= state.winScore) {
        showWinScreen();
        return;
    }
    
    showRoundEnd();
}

function showRoundEnd() {
    const currentTeam = state.teams[state.currentTeam];
    
    document.getElementById('round-team-name').textContent = currentTeam.name;
    document.getElementById('round-earned-points').textContent = state.roundPoints;
    
    document.getElementById('team1-name-display').textContent = state.teams[0].name;
    document.getElementById('team1-final-score').textContent = state.teams[0].score;
    document.getElementById('team2-name-display').textContent = state.teams[1].name;
    document.getElementById('team2-final-score').textContent = state.teams[1].score;
    
    showScreen('round-end-screen');
}

function nextTurn() {
    state.currentTeam = (state.currentTeam + 1) % 2;
    showTeamTurn();
}

function showWinScreen() {
    const winner = state.teams[state.currentTeam];
    const loser = state.teams[(state.currentTeam + 1) % 2];
    
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('final-score-team1').textContent = 
        `${state.teams[0].name}: ${state.teams[0].score}`;
    document.getElementById('final-score-team2').textContent = 
        `${state.teams[1].name}: ${state.teams[1].score}`;
    
    showScreen('win-screen');
}

function updateScoreBoard() {
    document.getElementById('team1-label').textContent = state.teams[0].name;
    document.getElementById('team1-score').textContent = state.teams[0].score;
    document.getElementById('team2-label').textContent = state.teams[1].name;
    document.getElementById('team2-score').textContent = state.teams[1].score;
}

function newGame() {
    showScreen('home-screen');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Mode selection
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            
            switch(action) {
                case 'start-setup':
                    showScreen('setup-screen');
                    break;
                case 'start-game':
                    startGame();
                    break;
                case 'start-round':
                    startRound();
                    break;
                case 'correct-word':
                    correctWord();
                    break;
                case 'skip-word':
                    skipWord();
                    break;
                case 'next-turn':
                    nextTurn();
                    break;
                case 'new-game':
                    newGame();
                    break;
            }
        });
    });
});