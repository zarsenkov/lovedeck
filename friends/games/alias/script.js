// ==================== GLOBAL STATE ====================
const state = {
    mode: null,
    categories: [],
    teams: [
        { name: 'RED SQUAD', score: 0 },
        { name: 'BLUE SQUAD', score: 0 }
    ],
    roundTime: 60,
    currentTeam: 0,
    roundScore: 0,
    usedWords: new Set(),
    availableWords: [],
    currentWord: null,
    timer: null,
    timeLeft: 0,
    roundHistory: [],
    lastAction: null
};

// ==================== UTILITIES ====================
function haptic(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

function flashScreen(color) {
    const flash = document.getElementById('flash');
    flash.className = `flash-overlay flash-${color}`;
    setTimeout(() => flash.className = 'flash-overlay', 100);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ==================== WORD MANAGEMENT ====================
function buildWordPool() {
    state.availableWords = [];
    state.categories.forEach(cat => {
        if (CARDS[cat]) {
            state.availableWords.push(...CARDS[cat]);
        }
    });
    // Shuffle
    for (let i = state.availableWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.availableWords[i], state.availableWords[j]] = [state.availableWords[j], state.availableWords[i]];
    }
}

function getNextWord() {
    const available = state.availableWords.filter(w => !state.usedWords.has(w));
    
    if (available.length === 0) {
        state.usedWords.clear();
        return getNextWord();
    }
    
    const word = available[Math.floor(Math.random() * available.length)];
    state.usedWords.add(word);
    state.currentWord = word;
    return word;
}

function displayWord() {
    const word = getNextWord();
    document.getElementById('card-word').textContent = word;
}

// ==================== SWIPE ENGINE ====================
let swipeStartX = 0;
let swipeStartY = 0;
let swipeCurrentX = 0;
let swipeCurrentY = 0;
let isDragging = false;

function initSwipeCard() {
    const card = document.getElementById('swipe-card');
    
    const onStart = (e) => {
        isDragging = true;
        const touch = e.type.includes('touch') ? e.touches[0] : e;
        swipeStartX = touch.clientX;
        swipeStartY = touch.clientY;
        card.classList.add('dragging');
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        
        const touch = e.type.includes('touch') ? e.touches[0] : e;
        swipeCurrentX = touch.clientX;
        swipeCurrentY = touch.clientY;
        
        const deltaX = swipeCurrentX - swipeStartX;
        const deltaY = swipeCurrentY - swipeStartY;
        
        // Enhanced rotation: 15-20 degrees based on swipe distance
        const rotation = Math.min(Math.max(deltaX * 0.15, -20), 20);
        
        card.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;
        
        // Lower threshold for better sensitivity (30px instead of 50px)
        if (deltaX < -30) {
            card.classList.add('swiping-left');
            card.classList.remove('swiping-right');
        } else if (deltaX > 30) {
            card.classList.add('swiping-right');
            card.classList.remove('swiping-left');
        } else {
            card.classList.remove('swiping-left', 'swiping-right');
        }
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        const deltaX = swipeCurrentX - swipeStartX;
        
        card.classList.remove('dragging', 'swiping-left', 'swiping-right');
        
        // Lower threshold for swipe completion (80px instead of 100px)
        if (deltaX < -80) {
            // Swipe LEFT - SKIP
            skipWord();
        } else if (deltaX > 80) {
            // Swipe RIGHT - CORRECT
            correctWord();
        }
        
        // Elastic return to center
        card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform = '';
        
        setTimeout(() => {
            card.style.transition = '';
        }, 400);
    };
    
    // Touch events
    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove', onMove, { passive: true });
    card.addEventListener('touchend', onEnd);
    
    // Mouse events
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
}

// ==================== GAME ACTIONS ====================
function correctWord() {
    haptic(50);
    flashScreen('green');
    state.roundScore++;
    state.roundHistory.push({ word: state.currentWord, action: 'correct' });
    state.lastAction = { word: state.currentWord, action: 'correct', score: state.roundScore };
    updateScore();
    displayWord();
    showUndo();
}

function skipWord() {
    haptic([50, 50, 50]);
    flashScreen('red');
    state.roundScore = Math.max(0, state.roundScore - 1);
    state.roundHistory.push({ word: state.currentWord, action: 'skip' });
    state.lastAction = { word: state.currentWord, action: 'skip', score: state.roundScore };
    updateScore();
    displayWord();
    showUndo();
}

function undoLast() {
    if (!state.lastAction) return;
    
    haptic(30);
    
    // Remove last word from history
    state.roundHistory.pop();
    
    // Remove word from used words
    state.usedWords.delete(state.lastAction.word);
    
    // Restore previous score
    if (state.lastAction.action === 'correct') {
        state.roundScore = Math.max(0, state.roundScore - 1);
    } else {
        state.roundScore++;
    }
    
    // Restore the word
    state.currentWord = state.lastAction.word;
    document.getElementById('card-word').textContent = state.currentWord;
    
    // Update score
    updateScore();
    
    // Clear last action
    state.lastAction = null;
    hideUndo();
}

function updateScore() {
    document.getElementById('score-value').textContent = state.roundScore;
}

// ==================== UNDO BUTTON ====================
let undoTimeout;

function showUndo() {
    const btn = document.getElementById('btn-undo');
    btn.classList.add('visible');
    
    clearTimeout(undoTimeout);
    undoTimeout = setTimeout(() => {
        hideUndo();
    }, 3000);
}

function hideUndo() {
    const btn = document.getElementById('btn-undo');
    btn.classList.remove('visible');
}

// ==================== TIMER ====================
function startTimer() {
    const fill = document.getElementById('timer-fill');
    const text = document.getElementById('timer-text');
    
    state.timeLeft = state.roundTime;
    const startTime = Date.now();
    const endTime = startTime + (state.roundTime * 1000);
    
    clearInterval(state.timer);
    
    state.timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        state.timeLeft = Math.ceil(remaining / 1000);
        
        const progress = (remaining / (state.roundTime * 1000)) * 100;
        fill.style.width = progress + '%';
        text.textContent = state.timeLeft;
        
        if (remaining <= 0) {
            endRound();
        }
    }, 100);
}

function stopTimer() {
    clearInterval(state.timer);
}

// ==================== GAME FLOW ====================
function selectMode(mode) {
    haptic(30);
    state.mode = mode;
    showScreen('screen-categories');
}

function confirmCategories() {
    const selected = Array.from(
        document.querySelectorAll('.category-card input:checked')
    ).map(i => i.value);
    
    if (selected.length === 0) {
        haptic([50, 50, 50]);
        alert('ВЫБЕРИ ХОТЯ БЫ ОДНУ КАТЕГОРИЮ');
        return;
    }
    
    haptic(30);
    state.categories = selected;
    showScreen('screen-settings');
}

function startGame() {
    haptic(50);
    
    state.teams[0].name = document.getElementById('team1').value.toUpperCase() || 'КРАСНЫЕ';
    state.teams[1].name = document.getElementById('team2').value.toUpperCase() || 'СИНИЕ';
    state.roundTime = parseInt(document.getElementById('round-time').value) || 60;
    
    state.teams[0].score = 0;
    state.teams[1].score = 0;
    state.currentTeam = 0;
    state.usedWords.clear();
    
    buildWordPool();
    showTurnScreen();
}

function showTurnScreen() {
    const team = state.teams[state.currentTeam];
    document.getElementById('turn-team-name').textContent = team.name;
    
    const modeText = state.mode === 'alias' ? 'ОБЪЯСНЯЙ СЛОВАМИ' : 'ПОКАЗЫВАЙ ЖЕСТАМИ';
    document.getElementById('turn-mode-text').textContent = modeText;
    
    showScreen('screen-turn');
}

function beginRound() {
    haptic(100);
    
    state.roundScore = 0;
    state.roundHistory = [];
    state.lastAction = null;
    
    document.getElementById('score-value').textContent = '0';
    displayWord();
    startTimer();
    hideUndo();
    showScreen('screen-game');
}

function endRound() {
    stopTimer();
    haptic([50, 100, 50]);
    
    state.teams[state.currentTeam].score += state.roundScore;
    
    showSummary();
}

function showSummary() {
    const team = state.teams[state.currentTeam];
    
    document.getElementById('summary-result').textContent = 'РАУНД ЗАВЕРШЁН';
    document.getElementById('summary-team').textContent = team.name;
    document.getElementById('summary-score').textContent = `+${state.roundScore}`;
    
    // Display words
    const container = document.getElementById('words-container');
    container.innerHTML = '';
    
    state.roundHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'word-item';
        
        const word = document.createElement('span');
        word.textContent = item.word;
        
        const status = document.createElement('span');
        status.className = item.action === 'correct' ? 'word-correct' : 'word-skip';
        status.textContent = item.action === 'correct' ? '✓' : '✗';
        
        div.appendChild(word);
        div.appendChild(status);
        container.appendChild(div);
    });
    
    showScreen('screen-summary');
}

function goHome() {
    haptic(50);
    stopTimer();
    showScreen('screen-home');
}

function nextTeam() {
    haptic(50);
    state.currentTeam = (state.currentTeam + 1) % 2;
    showTurnScreen();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', (e) => {
        if (e.target.closest('.screen-inner') && 
            e.target.closest('.screen-inner').scrollTop === 0 && 
            e.touches[0].clientY > e.touches[0].pageY) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            e.preventDefault();
        }
        lastTap = now;
    });
    
    // Mode selection
    document.querySelectorAll('.mode-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            selectMode(mode);
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            
            switch(action) {
                case 'confirm-categories':
                    confirmCategories();
                    break;
                case 'start-game':
                    startGame();
                    break;
                case 'begin-round':
                    beginRound();
                    break;
                case 'go-home':
                    goHome();
                    break;
                case 'next-team':
                    nextTeam();
                    break;
            }
        });
    });
    
    // Undo button
    document.getElementById('btn-undo').addEventListener('click', undoLast);
    
    // Initialize swipe engine
    initSwipeCard();
});