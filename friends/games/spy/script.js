// База данных локаций
const LOCATIONS = {
    city: [
        "Банк", "Полицейский участок", "Больница", "Школа", "Университет", 
        "Библиотека", "Музей", "Театр", "Кинотеатр", "Торговый центр",
        "Супермаркет", "Рынок", "Вокзал", "Аэропорт", "Автобусная остановка",
        "Парк", "Сквер", "Стадион", "Бассейн", "Спортзал",
        "Кафе", "Ресторан", "Бар", "Кофейня", "Пиццерия",
        "Гостиница", "Отель", "Хостел", "Квартира", "Дом",
        "Офис", "Завод", "Ферма", "Зоопарк", "Цирк",
        "Церковь", "Храм", "Мечеть", "Синанога", "Кладбище"
    ],
    entertainment: [
        "Кинотеатр", "Театр", "Концертный зал", "Ночной клуб", "Караоке",
        "Боулинг", "Бильярдная", "Казино", "Игровой зал", "Парк развлечений",
        "Аквапарк", "Зоопарк", "Цирк", "Музей", "Выставка",
        "Фестиваль", "Карнавал", "Ярмарка", "Конференция", "Семинар"
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
        "Боксерский ринг", "Гольф-клуб", "Боулинг", "Бильярдная", "Тир",
        "Велотрек", "Беговая дорожка", "Йога-студия", "Фитнес-клуб", "Спортивный зал"
    ],
    travel: [
        "Пляж", "Горы", "Лес", "Пустыня", "Остров",
        "Столица", "Деревня", "Курорт", "Отель", "Кемпинг",
        "Круизный лайнер", "Поезд", "Самолет", "Автобус", "Такси",
        "Метро", "Трамвай", "Фуникулер", "Канатная дорога", "Паром"
    ]
};

// Состояние игры
const gameState = {
    players: [],
    spies: [],
    location: "",
    category: "",
    currentPlayerIndex: 0,
    totalPlayers: 5,
    spyCount: 1,
    discussionTime: 5, // минуты
    timerInterval: null,
    timeLeft: 0,
    votes: {},
    gameStarted: false,
    selectedCategories: ['city', 'entertainment', 'food', 'professions', 'sports', 'travel']
};

// Статистика
const stats = JSON.parse(localStorage.getItem('spy_stats')) || {
    totalGames: 0,
    playerWins: 0,
    spyWins: 0,
    totalTime: 0,
    recentGames: []
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updatePlayerCount();
    updateSpyCount();
    
    // Восстановление выбранных категорий
    document.querySelectorAll('.category-checkbox input').forEach(checkbox => {
        const category = checkbox.dataset.category;
        checkbox.checked = gameState.selectedCategories.includes(category);
    });
});

// Функции навигации
function goBack() {
    if (confirm('Вернуться на главную страницу?')) {
        window.location.href = '../index.html';
    }
}

// Функции управления настройками
function changePlayerCount(change) {
    let count = parseInt(document.getElementById('playerCount').value);
    count += change;
    
    if (count < 3) count = 3;
    if (count > 12) count = 12;
    
    document.getElementById('playerCount').value = count;
    gameState.totalPlayers = count;
    
    // Автоматическая настройка количества шпионов
    updateSpyCount();
}

function updateSpyCount() {
    const playerCount = gameState.totalPlayers;
    let maxSpies = 1;
    
    if (playerCount >= 6) maxSpies = 2;
    if (playerCount >= 9) maxSpies = 3;
    
    const spyInput = document.getElementById('spyCount');
    let spyCount = parseInt(spyInput.value);
    
    if (spyCount > maxSpies) {
        spyCount = maxSpies;
        spyInput.value = spyCount;
    }
    
    spyInput.max = maxSpies;
    gameState.spyCount = spyCount;
}

function changeSpyCount(change) {
    let count = parseInt(document.getElementById('spyCount').value);
    count += change;
    
    const maxSpies = parseInt(document.getElementById('spyCount').max);
    if (count < 1) count = 1;
    if (count > maxSpies) count = maxSpies;
    
    document.getElementById('spyCount').value = count;
    gameState.spyCount = count;
}

function selectTime(minutes) {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    gameState.discussionTime = minutes;
}

function randomizeLocation() {
    const activeCategories = getActiveCategories();
    if (activeCategories.length === 0) {
        alert('Выберите хотя бы одну категорию!');
        return;
    }
    
    const randomCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
    const locations = LOCATIONS[randomCategory];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    alert(`🎯 Случайная локация: ${randomLocation}\nКатегория: ${getCategoryName(randomCategory)}`);
}

function getActiveCategories() {
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
    const activeCategories = getActiveCategories();
    if (activeCategories.length === 0) {
        alert('Выберите хотя бы одну категорию локаций!');
        return;
    }
    
    // Генерация локации
    const randomCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
    const locations = LOCATIONS[randomCategory];
    gameState.location = locations[Math.floor(Math.random() * locations.length)];
    gameState.category = randomCategory;
    
    // Сброс состояния
    gameState.players = Array.from({ length: gameState.totalPlayers }, (_, i) => ({
        id: i + 1,
        name: `Игрок ${i + 1}`,
        isSpy: false,
        hasSeenRole: false
    }));
    
    gameState.spies = [];
    gameState.currentPlayerIndex = 0;
    gameState.votes = {};
    gameState.gameStarted = true;
    
    // Выбор шпионов
    for (let i = 0; i < gameState.spyCount; i++) {
        let randomPlayer;
        do {
            randomPlayer = Math.floor(Math.random() * gameState.totalPlayers);
        } while (gameState.players[randomPlayer].isSpy);
        
        gameState.players[randomPlayer].isSpy = true;
        gameState.spies.push(randomPlayer + 1);
    }
    
    showScreen('roleScreen');
    updatePlayersList();
}

// Обновление списка игроков
function updatePlayersList() {
    const playersList = document.querySelector('.players-list');
    playersList.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = `player-item ${player.hasSeenRole ? 'completed' : ''} ${index === gameState.currentPlayerIndex ? 'current' : ''}`;
        
        playerDiv.innerHTML = `
            <div class="player-number">${player.id}</div>
            <div class="player-info">
                <h4>${player.name}</h4>
                <p>${player.hasSeenRole ? 'Уже посмотрел роль' : 'Ждет своей очереди'}</p>
            </div>
        `;
        
        playersList.appendChild(playerDiv);
    });
}

// Показать экран
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
}

// Назад к настройкам
function backToSetup() {
    if (gameState.gameStarted) {
        if (confirm('Вы уверены? Это сбросит текущую игру.')) {
            showScreen('setupScreen');
            gameState.gameStarted = false;
        }
    } else {
        showScreen('setupScreen');
    }
}

// Показать роль текущему игроку
function showRole() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.isSpy) {
        // Экран для шпиона
        showScreen('spyScreen');
    } else {
        // Экран для обычного игрока
        showScreen('playerScreen');
        document.getElementById('locationText').textContent = gameState.location;
    }
    
    // Отметить, что игрок посмотрел роль
    currentPlayer.hasSeenRole = true;
    updatePlayersList();
}

// Следующий игрок
function nextPlayer() {
    gameState.currentPlayerIndex++;
    
    if (gameState.currentPlayerIndex < gameState.totalPlayers) {
        // Показываем следующий экран
        if (gameState.players[gameState.currentPlayerIndex].hasSeenRole) {
            gameState.currentPlayerIndex++;
        }
        
        if (gameState.currentPlayerIndex < gameState.totalPlayers) {
            showRole();
        } else {
            startDiscussion();
        }
    } else {
        startDiscussion();
    }
}

// Начать обсуждение
function startDiscussion() {
    showScreen('discussionScreen');
    
    // Обновляем информацию на экране
    document.getElementById('discussionLocation').textContent = gameState.location;
    document.getElementById('statPlayers').textContent = gameState.totalPlayers;
    document.getElementById('statSpies').textContent = gameState.spyCount;
    document.getElementById('statTime').textContent = `${gameState.discussionTime} мин`;
    
    // Запуск таймера
    startTimer();
}

// Таймер
function startTimer() {
    const timerText = document.getElementById('timerText');
    const timerProgress = document.querySelector('.timer-progress');
    
    const totalSeconds = gameState.discussionTime * 60;
    gameState.timeLeft = totalSeconds;
    
    const circumference = 2 * Math.PI * 28;
    timerProgress.style.strokeDasharray = circumference;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        
        // Обновление времени
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Обновление прогресса
        const progress = (gameState.timeLeft / totalSeconds) * circumference;
        timerProgress.style.strokeDashoffset = circumference - progress;
        
        // Закончилось время
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            startVoting();
        }
    }, 1000);
}

function pauseTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        event.target.innerHTML = '<i class="fas fa-play"></i> Продолжить';
        event.target.onclick = resumeTimer;
    }
}

function resumeTimer() {
    if (!gameState.timerInterval) {
        startTimer();
        event.target.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        event.target.onclick = pauseTimer;
    }
}

// Начать голосование
function startVoting() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    showScreen('votingScreen');
    updateVotingList();
}

function updateVotingList() {
    const votingList = document.querySelector('.voting-list');
    votingList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const voteDiv = document.createElement('div');
        voteDiv.className = 'vote-item';
        voteDiv.dataset.playerId = player.id;
        
        voteDiv.innerHTML = `
            <div class="vote-info">
                <div class="vote-number">${player.id}</div>
                <div class="vote-name">${player.name}</div>
            </div>
            <div class="vote-controls">
                <button class="vote-btn" onclick="voteForPlayer(${player.id})">
                    <i class="fas fa-vote-yea"></i>
                </button>
                <div class="vote-count">${gameState.votes[player.id] || 0}</div>
            </div>
        `;
        
        votingList.appendChild(voteDiv);
    });
}

function voteForPlayer(playerId) {
    // В реальной игре каждый игрок голосует отдельно
    // Здесь для простоты можно добавить голос от текущего пользователя
    if (!gameState.votes[playerId]) {
        gameState.votes[playerId] = 0;
    }
    gameState.votes[playerId]++;
    
    // Обновляем отображение
    updateVotingList();
    
    // Показываем кнопку завершения голосования, если все проголосовали
    const totalVotes = Object.values(gameState.votes).reduce((a, b) => a + b, 0);
    if (totalVotes === gameState.totalPlayers) {
        showResults();
    }
}

// Показать результаты
function showResults() {
    showScreen('resultsScreen');
    
    // Найти игрока с максимальным количеством голосов
    let maxVotes = 0;
    let suspectedPlayers = [];
    
    for (const [playerId, votes] of Object.entries(gameState.votes)) {
        if (votes > maxVotes) {
            maxVotes = votes;
            suspectedPlayers = [parseInt(playerId)];
        } else if (votes === maxVotes && votes > 0) {
            suspectedPlayers.push(parseInt(playerId));
        }
    }
    
    // Определить, является ли подозреваемый шпионом
    const isSpyCaught = suspectedPlayers.some(playerId => 
        gameState.players[playerId - 1].isSpy
    );
    
    // Обновить статистику
    updateGameStats(isSpyCaught);
    
    // Показать результаты
    const resultsContent = document.getElementById('resultsContent');
    
    if (isSpyCaught) {
        // Игроки победили
        resultsContent.innerHTML = `
            <div class="results-content">
                <div class="results-icon win">
                    <i class="fas fa-trophy"></i>
                </div>
                <h2 class="results-title">🎉 Игроки победили!</h2>
                <p class="results-subtitle">Шпион был успешно раскрыт!</p>
                
                <div class="results-details">
                    <div class="detail-item">
                        <span class="detail-label">Локация:</span>
                        <span class="detail-value">${gameState.location}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Категория:</span>
                        <span class="detail-value">${getCategoryName(gameState.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Шпионы:</span>
                        <span class="detail-value spy">Игроки ${gameState.spies.join(', ')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Подозреваемый:</span>
                        <span class="detail-value ${suspectedPlayers.some(id => gameState.players[id-1].isSpy) ? 'spy' : 'player'}">
                            Игрок ${suspectedPlayers.join(', ')}
                        </span>
                    </div>
                </div>
                
                <div class="results-points">
                    <h4 class="points-title"><i class="fas fa-star"></i> Начисленные очки:</h4>
                    <ul class="points-list">
                        <li>
                            <span>Игроки за раскрытие шпиона:</span>
                            <span class="points-value">+1 каждому</span>
                        </li>
                        <li>
                            <span>Шпионы за поражение:</span>
                            <span class="points-value">0 очков</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        // Шпионы победили
        resultsContent.innerHTML = `
            <div class="results-content">
                <div class="results-icon lose">
                    <i class="fas fa-user-secret"></i>
                </div>
                <h2 class="results-title">🕵️ Шпионы победили!</h2>
                <p class="results-subtitle">Игроки не смогли найти шпиона...</p>
                
                <div class="results-details">
                    <div class="detail-item">
                        <span class="detail-label">Локация:</span>
                        <span class="detail-value">${gameState.location}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Категория:</span>
                        <span class="detail-value">${getCategoryName(gameState.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Шпионы:</span>
                        <span class="detail-value spy">Игроки ${gameState.spies.join(', ')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Подозреваемый:</span>
                        <span class="detail-value">Игрок ${suspectedPlayers.join(', ') || 'нет'}</span>
                    </div>
                </div>
                
                <div class="results-points">
                    <h4 class="points-title"><i class="fas fa-star"></i> Начисленные очки:</h4>
                    <ul class="points-list">
                        <li>
                            <span>Шпионы за победу:</span>
                            <span class="points-value">+3 каждому</span>
                        </li>
                        <li>
                            <span>Шпионы за нераскрытие:</span>
                            <span class="points-value">+1 дополнительно</span>
                        </li>
                        <li>
                            <span>Игроки за поражение:</span>
                            <span class="points-value">0 очков</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Назад к обсуждению
function backToDiscussion() {
    showScreen('discussionScreen');
    startTimer();
}

// Новая игра
function newGame() {
    gameState.gameStarted = false;
    showScreen('setupScreen');
}

// Модальные окна
function showRules() {
    document.getElementById('rulesModal').classList.add('active');
}

function showStats() {
    updateStatsDisplay();
    document.getElementById('statsModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Статистика
function loadStats() {
    const savedStats = localStorage.getItem('spy_stats');
    if (savedStats) {
        Object.assign(stats, JSON.parse(savedStats));
    }
}

function saveStats() {
    localStorage.setItem('spy_stats', JSON.stringify(stats));
}

function updateGameStats(isSpyCaught) {
    stats.totalGames++;
    
    if (isSpyCaught) {
        stats.playerWins++;
    } else {
        stats.spyWins++;
    }
    
    stats.totalTime += gameState.discussionTime;
    
    // Добавить запись о последней игре
    stats.recentGames.unshift({
        timestamp: new Date().toLocaleString(),
        players: gameState.totalPlayers,
        spies: gameState.spyCount,
        location: gameState.location,
        result: isSpyCaught ? 'player_win' : 'spy_win',
        time: gameState.discussionTime
    });
    
    // Ограничить историю
    if (stats.recentGames.length > 10) {
        stats.recentGames = stats.recentGames.slice(0, 10);
    }
    
    saveStats();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('totalGames').textContent = stats.totalGames;
    document.getElementById('playerWins').textContent = stats.playerWins;
    document.getElementById('spyWins').textContent = stats.spyWins;
    
    const avgTime = stats.totalGames > 0 ? Math.round(stats.totalTime / stats.totalGames) : 0;
    document.getElementById('avgTime').textContent = `${avgTime} мин`;
    
    // Обновить список последних игр
    const gamesList = document.getElementById('recentGamesList');
    gamesList.innerHTML = '';
    
    stats.recentGames.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = `game-record ${game.result === 'player_win' ? 'win' : 'lose'}`;
        
        gameDiv.innerHTML = `
            <div class="game-result">
                <i class="fas fa-${game.result === 'player_win' ? 'users' : 'user-secret'}"></i>
                <span>${game.result === 'player_win' ? 'Игроки' : 'Шпионы'}</span>
            </div>
            <div class="game-details">
                <span>${game.players} игр.</span>
                <span>${game.time} мин</span>
                <span>${game.timestamp}</span>
            </div>
        `;
        
        gamesList.appendChild(gameDiv);
    });
}

function showGameStats() {
    showStats();
}

function resetStats() {
    if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
        Object.assign(stats, {
            totalGames: 0,
            playerWins: 0,
            spyWins: 0,
            totalTime: 0,
            recentGames: []
        });
        
        saveStats();
        updateStatsDisplay();
    }
}
