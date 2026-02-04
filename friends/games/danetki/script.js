// Конфигурация игры
const gameConfig = {
    players: ['Игрок 1', 'Игрок 2'],
    scores: {},
    currentDanetka: 0,
    selectedDifficulty: 'all',
    timer: null,
    timeLeft: 0,
    danetkiList: []
};

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    setupPWA();
});

function initGame() {
    // Загрузка сохраненных данных
    const saved = localStorage.getItem('danetkiGame');
    if (saved) {
        const data = JSON.parse(saved);
        gameConfig.scores = data.scores || {};
        gameConfig.players = data.players || ['Игрок 1', 'Игрок 2'];
    }
    
    // Инициализация счетов
    gameConfig.players.forEach(player => {
        if (!gameConfig.scores[player]) {
            gameConfig.scores[player] = 0;
        }
    });
    
    updateScoreDisplay();
    filterDanetki('all');
}

function setupEventListeners() {
    // Добавление PWA установки
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => {
            document.getElementById('install-prompt').classList.add('show');
        }, 3000);
    });
}

// PWA функционал
function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../sw.js').then(() => {
            console.log('Service Worker зарегистрирован');
        }).catch(err => {
            console.log('Service Worker ошибка:', err);
        });
    }
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA установлено');
            }
            deferredPrompt = null;
            document.getElementById('install-prompt').classList.remove('show');
        });
    }
}

function cancelInstall() {
    document.getElementById('install-prompt').classList.remove('show');
}

// Управление сложностью
function selectDifficulty(level) {
    gameConfig.selectedDifficulty = level;
    filterDanetki(level);
    
    // Обновление кнопок
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function filterDanetki(difficulty) {
    if (difficulty === 'all') {
        gameConfig.danetkiList = [...danetkiData];
    } else {
        gameConfig.danetkiList = danetkiData.filter(d => d.difficulty === difficulty);
    }
    
    // Перемешиваем
    gameConfig.danetkiList = gameConfig.danetkiList.sort(() => Math.random() - 0.5);
    
    // Обновляем счетчик
    document.getElementById('card-counter').textContent = `1/${gameConfig.danetkiList.length}`;
}

// Управление игрой
function startGame() {
    if (gameConfig.danetkiList.length === 0) {
        alert('Выберите другую сложность - для выбранной нет данеток!');
        return;
    }
    
    gameConfig.currentDanetka = 0;
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    loadDanetka();
    startTimer(600); // 10 минут
}

function loadDanetka() {
    if (gameConfig.currentDanetka >= gameConfig.danetkiList.length) {
        endGame();
        return;
    }
    
    const danetka = gameConfig.danetkiList[gameConfig.currentDanetka];
    
    // Обновляем интерфейс
    document.getElementById('danetka-text').textContent = danetka.question;
    document.getElementById('card-counter').textContent = 
        `${gameConfig.currentDanetka + 1}/${gameConfig.danetkiList.length}`;
    
    // Категория сложности
    const categoryEl = document.getElementById('category');
    const difficultyText = {
        easy: 'Легкая',
        medium: 'Средняя',
        hard: 'Сложная'
    };
    
    categoryEl.textContent = `Сложность: ${difficultyText[danetka.difficulty]}`;
    categoryEl.className = `category ${danetka.difficulty}`;
    
    // Сохраняем решение для экрана результата
    document.getElementById('solution-text').textContent = danetka.solution;
}

function startTimer(seconds) {
    clearInterval(gameConfig.timer);
    gameConfig.timeLeft = seconds;
    
    gameConfig.timer = setInterval(() => {
        gameConfig.timeLeft--;
        
        const minutes = Math.floor(gameConfig.timeLeft / 60);
        const secs = gameConfig.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (gameConfig.timeLeft <= 0) {
            clearInterval(gameConfig.timer);
            showSolution();
        }
    }, 1000);
}

// Управление игроками
function addPlayer() {
    const playerName = prompt('Введите имя игрока:');
    if (playerName && playerName.trim()) {
        const name = playerName.trim();
        if (!gameConfig.players.includes(name)) {
            gameConfig.players.push(name);
            gameConfig.scores[name] = 0;
            updateScoreDisplay();
            saveGame();
        }
    }
}

function updateScoreDisplay() {
    const display = document.getElementById('score-display');
    const winnerButtons = document.getElementById('winner-buttons');
    
    display.innerHTML = '';
    winnerButtons.innerHTML = '';
    
    gameConfig.players.forEach(player => {
        // Отображение счета
        const scoreEl = document.createElement('div');
        scoreEl.className = 'player-score';
        scoreEl.innerHTML = `
            <span>${player}</span>
            <span style="color: var(--primary); font-weight: 700;">${gameConfig.scores[player]}</span>
            <button class="remove" onclick="removePlayer('${player}')">&times;</button>
        `;
        display.appendChild(scoreEl);
        
        // Кнопки для победителей
        const winnerBtn = document.createElement('button');
        winnerBtn.className = 'winner-btn';
        winnerBtn.textContent = player;
        winnerBtn.onclick = () => addPoint(player);
        winnerButtons.appendChild(winnerBtn);
    });
}

function removePlayer(playerName) {
    if (gameConfig.players.length <= 2) {
        alert('Должно быть минимум 2 игрока!');
        return;
    }
    
    if (confirm(`Удалить игрока ${playerName}?`)) {
        gameConfig.players = gameConfig.players.filter(p => p !== playerName);
        delete gameConfig.scores[playerName];
        updateScoreDisplay();
        saveGame();
    }
}

function addPoint(playerName) {
    gameConfig.scores[playerName]++;
    updateScoreDisplay();
    saveGame();
    
    // Автоматически переходим к следующей данетке через 2 секунды
    setTimeout(() => {
        nextDanetka();
    }, 2000);
}

function noOneGuessed() {
    // Никто не получает очков, просто переходим дальше
    nextDanetka();
}

// Основные действия игры
function showAnswer(answer) {
    // В реальной игре ведущий отвечает устно
    // Здесь просто показываем кнопку, как напоминание
    alert(`Ответьте игрокам: ${answer === 'yes' ? 'ДА' : answer === 'no' ? 'НЕТ' : 'НЕ ИМЕЕТ ЗНАЧЕНИЯ'}`);
}

function showHint() {
    const currentDanetka = gameConfig.danetkiList[gameConfig.currentDanetka];
    
    if (currentDanetka.hints && currentDanetka.hints.length > 0) {
        const randomHint = currentDanetka.hints[Math.floor(Math.random() * currentDanetka.hints.length)];
        document.getElementById('hint-text').textContent = randomHint;
        document.getElementById('hint-screen').classList.add('active');
    } else {
        alert('Для этой данетки нет подсказок');
    }
}

function closeHint() {
    document.getElementById('hint-screen').classList.remove('active');
}

function showSolution() {
    clearInterval(gameConfig.timer);
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
}

function nextDanetka() {
    gameConfig.currentDanetka++;
    
    if (gameConfig.currentDanetka >= gameConfig.danetkiList.length) {
        endGame();
        return;
    }
    
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    loadDanetka();
    startTimer(600); // Снова 10 минут
}

function backToMenu() {
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}

function endGame() {
    // Определяем победителя
    let winner = null;
    let maxScore = -1;
    
    for (const [player, score] of Object.entries(gameConfig.scores)) {
        if (score > maxScore) {
            maxScore = score;
            winner = player;
        }
    }
    
    alert(`Игра завершена! Победитель: ${winner} с ${maxScore} очками!`);
    backToMenu();
    
    // Сброс игры
    gameConfig.currentDanetka = 0;
    Object.keys(gameConfig.scores).forEach(player => {
        gameConfig.scores[player] = 0;
    });
    updateScoreDisplay();
}

function saveGame() {
    const saveData = {
        players: gameConfig.players,
        scores: gameConfig.scores,
        lastPlayed: new Date().toISOString()
    };
    
    localStorage.setItem('danetkiGame', JSON.stringify(saveData));
}

// Обработка offline/online
window.addEventListener('online', () => {
    console.log('Приложение онлайн');
});

window.addEventListener('offline', () => {
    console.log('Приложение оффлайн - игра продолжается!');
});

// Предотвращение закрытия при игре
window.addEventListener('beforeunload', (e) => {
    if (document.getElementById('game-screen').classList.contains('active')) {
        e.preventDefault();
        e.returnValue = 'Вы уверены, что хотите выйти? Ведущий игры будет потерян!';
        return e.returnValue;
    }
});
