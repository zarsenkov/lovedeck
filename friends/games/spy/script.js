// База данных локаций
const LOCATIONS = {
    city: [
        "Банк", "Полицейский участок", "Больница", "Школа", "Университет", 
        "Библиотека", "Музей", "Театр", "Кинотеатр", "Торговый центр",
        "Супермаркет", "Рынок", "Вокзал", "Аэропорт", "Автобусная остановка",
        "Парк", "Сквер", "Стадион", "Бассейн", "Спортзал",
        "Кафе", "Ресторан", "Бар", "Кофейня", "Пиццерия",
        "Гостиница", "Отель", "Хостел", "Квартира", "Дом"
    ],
    entertainment: [
        "Кинотеатр", "Театр", "Концертный зал", "Ночной клуб", "Караоке",
        "Боулинг", "Бильярдная", "Казино", "Игровой зал", "Парк развлечений",
        "Аквапарк", "Зоопарк", "Цирк", "Музей", "Выставка",
        "Фестиваль", "Карнавал", "Ярмарка", "Квест-комната", "Пейнтбол"
    ],
    food: [
        "Ресторан", "Кафе", "Бар", "Паб", "Кофейня",
        "Пиццерия", "Бургерная", "Суши-бар", "Столовая", "Буфет",
        "Кондитерская", "Мороженое", "Пекарня", "Фаст-фуд", "Фуд-корт",
        "Винный бар", "Пивоварня", "Чайная", "Стэйк-хаус", "Рыбный ресторан"
    ],
    professions: [
        "Врач", "Полицейский", "Учитель", "Программист", "Повар",
        "Официант", "Таксист", "Пилот", "Строитель", "Парикмахер",
        "Юрист", "Бухгалтер", "Журналист", "Актер", "Певец",
        "Спортсмен", "Фермер", "Водитель", "Продавец", "Менеджер"
    ],
    sports: [
        "Футбольное поле", "Баскетбольная площадка", "Теннисный корт", "Бассейн",
        "Спортзал", "Стадион", "Каток", "Лыжная база", "Скалодром",
        "Боксерский ринг", "Гольф-клуб", "Боулинг", "Бильярдная", "Тир"
    ],
    travel: [
        "Пляж", "Горы", "Лес", "Пустыня", "Остров",
        "Столица", "Деревня", "Курорт", "Отель", "Кемпинг",
        "Круизный лайнер", "Поезд", "Самолет", "Автобус", "Такси"
    ]
};

// Состояние игры
let gameState = {
    players: [],
    spies: [],
    location: "",
    category: "",
    currentPlayer: 0,
    totalPlayers: 5,
    spyCount: 1,
    discussionTime: 5,
    timerInterval: null,
    timeLeft: 0,
    votes: {},
    gameStarted: false
};

// Статистика
let stats = {
    totalGames: 0,
    playerWins: 0,
    spyWins: 0,
    recentGames: []
};

// Инициализация
function init() {
    loadStats();
    updatePlayerCount();
}

// Функции навигации
function goBack() {
    if (confirm('Вернуться на главную страницу?')) {
        window.location.href = 'https://lovecouple.ru/friends/';
    }
}

function showNotification(message, type = 'info') {
    // Создаем простое уведомление
    alert(message);
}

// Управление настройками
function changeValue(inputId, change) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) + change;
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (value < min) value = min;
    if (value > max) value = max;
    
    input.value = value;
    
    if (inputId === 'playerCount') {
        gameState.totalPlayers = value;
        updateSpyCount();
    } else if (inputId === 'spyCount') {
        gameState.spyCount = value;
    }
}

function updatePlayerCount() {
    document.getElementById('playerCount').value = gameState.totalPlayers;
    updateSpyCount();
}

function updateSpyCount() {
    const playerCount = gameState.totalPlayers;
    let maxSpies = 1;
    
    if (playerCount >= 6) maxSpies = 2;
    if (playerCount >= 9) maxSpies = 3;
    
    const spyInput = document.getElementById('spyCount');
    spyInput.max = maxSpies;
    
    if (parseInt(spyInput.value) > maxSpies) {
        spyInput.value = maxSpies;
        gameState.spyCount = maxSpies;
    }
}

function selectTime(minutes) {
    // Убрать активный класс у всех кнопок
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Добавить активный класс нажатой кнопке
    event.target.classList.add('active');
    gameState.discussionTime = minutes;
}

function showRandomLocation() {
    const categories = getSelectedCategories();
    if (categories.length === 0) {
        alert('Выберите хотя бы одну категорию!');
        return;
    }
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const locations = LOCATIONS[randomCategory];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    alert(`🎯 Случайная локация: ${randomLocation}\nКатегория: ${getCategoryName(randomCategory)}`);
}

function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('.category-checkbox input:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.category);
}

function getCategoryName(key) {
    const names = {
        city: 'Город',
        entertainment: 'Развлечения',
        food: 'Еда и напитки',
        professions: 'Профессии',
        sports: 'Спорт',
        travel: 'Путешествия'
    };
    return names[key] || key;
}

// Начало игры
function startGame() {
    const categories = getSelectedCategories();
    if (categories.length === 0) {
        alert('Выберите хотя бы одну категорию!');
        return;
    }
    
    // Выбрать случайную категорию и локацию
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const locations = LOCATIONS[randomCategory];
    gameState.location = locations[Math.floor(Math.random() * locations.length)];
    gameState.category = randomCategory;
    
    // Создать игроков
    gameState.players = [];
    gameState.spies = [];
    
    for (let i = 0; i < gameState.totalPlayers; i++) {
        gameState.players.push({
            id: i + 1,
            name: `Игрок ${i + 1}`,
            isSpy: false,
            hasSeenRole: false
        });
    }
    
    // Выбрать шпионов
    for (let i = 0; i < gameState.spyCount; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * gameState.totalPlayers);
        } while (gameState.players[randomIndex].isSpy);
        
        gameState.players[randomIndex].isSpy = true;
        gameState.spies.push(randomIndex + 1);
    }
    
    gameState.currentPlayer = 0;
    gameState.votes = {};
    gameState.gameStarted = true;
    
    showScreen('roleScreen');
    updatePlayersList();
}

function updatePlayersList() {
    const playersList = document.querySelector('.players-list');
    playersList.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = `player-item ${player.hasSeenRole ? 'completed' : ''}`;
        div.onclick = () => showPlayerRole(index);
        
        div.innerHTML = `
            <div class="player-number">${player.id}</div>
            <div class="player-info">
                <h3>${player.name}</h3>
                <p>${player.hasSeenRole ? 'Уже посмотрел роль ✓' : 'Нажмите, чтобы посмотреть роль'}</p>
            </div>
        `;
        
        playersList.appendChild(div);
    });
}

function showPlayerRole(playerIndex) {
    const player = gameState.players[playerIndex];
    
    if (player.isSpy) {
        showScreen('spyRoleScreen');
    } else {
        document.getElementById('locationText').textContent = gameState.location;
        showScreen('playerRoleScreen');
    }
    
    player.hasSeenRole = true;
    updatePlayersList();
}

function hideRole() {
    // Проверить, все ли посмотрели роли
    const allSeen = gameState.players.every(p => p.hasSeenRole);
    
    if (allSeen) {
        startDiscussion();
    } else {
        showScreen('roleScreen');
        alert('Передайте устройство следующему игроку');
    }
}

function hideSpyRole() {
    hideRole();
}

function startDiscussion() {
    showScreen('discussionScreen');
    
    // Обновить информацию
    document.getElementById('currentLocation').textContent = gameState.location;
    document.getElementById('infoPlayers').textContent = gameState.totalPlayers;
    document.getElementById('infoSpies').textContent = gameState.spyCount;
    document.getElementById('infoTime').textContent = `${gameState.discussionTime} мин`;
    
    // Запустить таймер
    startTimer();
}

function startTimer() {
    gameState.timeLeft = gameState.discussionTime * 60;
    const timerText = document.getElementById('timerText');
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Обновить прогресс
        const progress = document.querySelector('.timer-progress');
        const circumference = 2 * Math.PI * 36;
        const offset = circumference - (gameState.timeLeft / (gameState.discussionTime * 60)) * circumference;
        progress.style.strokeDashoffset = offset;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            startVoting();
        }
    }, 1000);
}

function toggleTimer() {
    const btn = document.getElementById('pauseBtn');
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        btn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
    } else {
        startTimer();
        btn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
    }
}

function startVoting() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    showScreen('votingScreen');
    updateVotingList();
}

function updateVotingList() {
    const votingList = document.querySelector('.voting-list');
    votingList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'vote-item';
        
        div.innerHTML = `
            <div class="vote-info">
                <div class="vote-number">${player.id}</div>
                <div class="vote-name">${player.name}</div>
            </div>
            <div class="vote-controls">
                <button class="vote-btn" onclick="addVote(${player.id})">
                    <i class="fas fa-vote-yea"></i>
                </button>
                <div class="vote-count">${gameState.votes[player.id] || 0}</div>
            </div>
        `;
        
        votingList.appendChild(div);
    });
    
    updateVotingSummary();
}

function addVote(playerId) {
    if (!gameState.votes[playerId]) {
        gameState.votes[playerId] = 0;
    }
    gameState.votes[playerId]++;
    
    updateVotingList();
}

function updateVotingSummary() {
    const totalVotes = Object.values(gameState.votes).reduce((a, b) => a + b, 0);
    const remaining = gameState.totalPlayers - totalVotes;
    
    document.getElementById('totalVotes').textContent = totalVotes;
    document.getElementById('remainingVotes').textContent = remaining;
}

function finishVoting() {
    if (Object.keys(gameState.votes).length === 0) {
        alert('Нужно хотя бы одно голосование!');
        return;
    }
    
    // Найти игрока с максимальным количеством голосов
    let maxVotes = 0;
    let suspectedPlayer = null;
    
    for (const [playerId, votes] of Object.entries(gameState.votes)) {
        if (votes > maxVotes) {
            maxVotes = votes;
            suspectedPlayer = parseInt(playerId);
        }
    }
    
    // Определить результат
    const isSpyCaught = gameState.players[suspectedPlayer - 1]?.isSpy || false;
    
    // Обновить статистику
    updateStats(isSpyCaught);
    
    // Показать результаты
    showResults(isSpyCaught, suspectedPlayer);
}

function showResults(isSpyCaught, suspectedPlayer) {
    const resultsContent = document.getElementById('resultsContent');
    
    if (isSpyCaught) {
        resultsContent.innerHTML = `
            <div class="results-win">
                <div class="results-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h2>🎉 Игроки победили!</h2>
                <p>Шпион (Игрок ${suspectedPlayer}) был разоблачен!</p>
                
                <div class="results-details">
                    <p><strong>Локация:</strong> ${gameState.location}</p>
                    <p><strong>Шпионы:</strong> ${gameState.spies.join(', ')}</p>
                    <p><strong>Голосов за шпиона:</strong> ${gameState.votes[suspectedPlayer] || 0}</p>
                </div>
            </div>
        `;
    } else {
        resultsContent.innerHTML = `
            <div class="results-lose">
                <div class="results-icon">
                    <i class="fas fa-user-secret"></i>
                </div>
                <h2>🕵️ Шпионы победили!</h2>
                <p>Игроки не смогли найти шпиона...</p>
                
                <div class="results-details">
                    <p><strong>Локация:</strong> ${gameState.location}</p>
                    <p><strong>Настоящие шпионы:</strong> ${gameState.spies.join(', ')}</p>
                    <p><strong>Подозреваемый:</strong> Игрок ${suspectedPlayer || 'не определен'}</p>
                </div>
            </div>
        `;
    }
    
    showScreen('resultsScreen');
}

function backToSetup() {
    if (confirm('Вернуться к настройкам? Текущая игра будет сброшена.')) {
        gameState.gameStarted = false;
        showScreen('setupScreen');
    }
}

function backToDiscussion() {
    showScreen('discussionScreen');
    startTimer();
}

function newGame() {
    gameState.gameStarted = false;
    showScreen('setupScreen');
}

// Статистика
function loadStats() {
    const saved = localStorage.getItem('spy_stats');
    if (saved) {
        stats = JSON.parse(saved);
    }
}

function saveStats() {
    localStorage.setItem('spy_stats', JSON.stringify(stats));
}

function updateStats(isSpyCaught) {
    stats.totalGames++;
    
    if (isSpyCaught) {
        stats.playerWins++;
    } else {
        stats.spyWins++;
    }
    
    // Добавить в историю
    stats.recentGames.unshift({
        date: new Date().toLocaleDateString(),
        players: gameState.totalPlayers,
        spies: gameState.spyCount,
        location: gameState.location,
        result: isSpyCaught ? 'Игроки' : 'Шпионы'
    });
    
    // Ограничить историю
    if (stats.recentGames.length > 5) {
        stats.recentGames = stats.recentGames.slice(0, 5);
    }
    
    saveStats();
}

function showStats() {
    document.getElementById('totalGames').textContent = stats.totalGames;
    document.getElementById('playerWins').textContent = stats.playerWins;
    document.getElementById('spyWins').textContent = stats.spyWins;
    
    // Обновить список игр
    const gamesList = document.getElementById('recentGamesList');
    gamesList.innerHTML = '';
    
    stats.recentGames.forEach(game => {
        const div = document.createElement('div');
        div.className = `game-record ${game.result === 'Игроки' ? 'win' : 'lose'}`;
        
        div.innerHTML = `
            <div class="game-info">
                <span>${game.date}</span>
                <span>${game.players} игроков</span>
            </div>
            <div class="game-result">
                <span>${game.result} победили</span>
            </div>
        `;
        
        gamesList.appendChild(div);
    });
    
    showModal('statsModal');
}

function showGameStats() {
    showStats();
}

function resetStats() {
    if (confirm('Сбросить всю статистику?')) {
        stats = {
            totalGames: 0,
            playerWins: 0,
            spyWins: 0,
            recentGames: []
        };
        saveStats();
        showStats();
    }
}

// Утилиты
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showRules() {
    showModal('rulesModal');
}

// Инициализация при загрузке
window.onload = init;
