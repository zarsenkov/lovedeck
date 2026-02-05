// client.js - Фронтенд логика для игры Бункер

// Конфигурация
const SERVER_URL = window.location.hostname === 'localhost' 
    ? 'ws://localhost:3000' 
    : `wss://${window.location.hostname}`;

// Состояние игры
const gameState = {
    connected: false,
    playerId: null,
    playerName: '',
    roomCode: null,
    isHost: false,
    gamePhase: 'lobby',
    timeLeft: 0,
    playerRole: null,
    resources: { food: 0, water: 0, medkit: 0, tools: 0 },
    players: [],
    currentVote: null,
    voteResults: null,
    eventLog: [],
    roundEvents: []
};

// WebSocket соединение
let socket = null;

// DOM элементы
const elements = {
    // Кнопки
    createGameBtn: document.getElementById('createGameBtn'),
    joinGameBtn: document.getElementById('joinGameBtn'),
    startGameBtn: document.getElementById('startGameBtn'),
    nextRoundBtn: document.getElementById('nextRoundBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    connectBtn: document.getElementById('connectBtn'),
    submitVoteBtn: document.getElementById('submitVoteBtn'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    showAllRolesBtn: document.getElementById('showAllRolesBtn'),
    
    // Формы
    playerName: document.getElementById('playerName'),
    roomCode: document.getElementById('roomCode'),
    
    // Панели
    lobbyPhase: document.getElementById('lobbyPhase'),
    nightPhase: document.getElementById('nightPhase'),
    dayPhase: document.getElementById('dayPhase'),
    
    // Информация
    phaseText: document.getElementById('phaseText'),
    timer: document.getElementById('timer'),
    playerCount: document.getElementById('playerCount'),
    connectionStatus: document.getElementById('connectionStatus'),
    gameStatus: document.getElementById('gameStatus'),
    
    // Роль и ресурсы
    playerRole: document.getElementById('playerRole'),
    roleDescription: document.getElementById('roleDescription'),
    foodCount: document.getElementById('foodCount'),
    waterCount: document.getElementById('waterCount'),
    medkitCount: document.getElementById('medkitCount'),
    toolCount: document.getElementById('toolCount'),
    
    // Игроки
    playersGrid: document.getElementById('playersGrid'),
    roomPlayersList: document.getElementById('roomPlayersList'),
    
    // Голосование
    votingOptions: document.getElementById('votingOptions'),
    voteResults: document.getElementById('voteResults'),
    
    // События
    eventLog: document.getElementById('eventLog'),
    roundEvents: document.getElementById('roundEvents'),
    
    // Действия
    nightActions: document.getElementById('nightActions'),
    
    // Модальные окна
    roleModal: document.getElementById('roleModal'),
    allRolesModal: document.getElementById('allRolesModal'),
    
    // Таймеры
    nightTimer: document.getElementById('nightTimer'),
    nightProgress: document.getElementById('nightProgress')
};

// Роли в игре
const ROLES = {
    survivor: {
        id: 'survivor',
        name: 'Выживший',
        description: 'Обычный житель бункера. Цель - выжить и изгнать антагонистов.',
        abilities: ['Голосование за изгнание игроков днём', 'Получение ресурсов каждый раунд'],
        isAntagonist: false,
        nightAction: null
    },
    leader: {
        id: 'leader',
        name: 'Лидер',
        description: 'Уважаемый член общины, может влиять на решения группы.',
        abilities: ['Может отменить одно голосование за игру', 'Получает +1 ресурс каждого типа каждый раунд'],
        isAntagonist: false,
        nightAction: 'cancel_vote'
    },
    doctor: {
        id: 'doctor',
        name: 'Доктор',
        description: 'Медик бункера, может лечить и спасать других игроков.',
        abilities: ['Ночью может спасти одного игрока от изгнания', 'Может лечить раненых игроков'],
        isAntagonist: false,
        nightAction: 'save_player'
    },
    intriguer: {
        id: 'intriguer',
        name: 'Интриган',
        description: 'Тайный антагонист, стремящийся устранить всех выживших.',
        abilities: ['Ночью может саботировать ресурсы одного игрока', 'Видит других антагонистов'],
        isAntagonist: true,
        nightAction: 'sabotage'
    },
    psychic: {
        id: 'psychic',
        name: 'Псих',
        description: 'Загадочная личность с особыми способностями.',
        abilities: ['Ночью может проверить роль другого игрока', 'Нельзя проверить дважды подряд одного игрока'],
        isAntagonist: false,
        nightAction: 'check_role'
    },
    traitor: {
        id: 'traitor',
        name: 'Предатель',
        description: 'Тайно работает на антагонистов, но выглядит как обычный выживший.',
        abilities: ['Выглядит как выживший при проверке', 'Ночью может украсть ресурсы'],
        isAntagonist: true,
        nightAction: 'steal_resources'
    },
    scavenger: {
        id: 'scavenger',
        name: 'Сборщик',
        description: 'Мастер по поиску ресурсов в разрушенном мире.',
        abilities: ['Получает +2 ресурса каждого типа каждый раунд', 'Может делиться ресурсами'],
        isAntagonist: false,
        nightAction: 'share_resources'
    }
};

// Инициализация
function init() {
    // Генерация случайного имени, если не указано
    if (!localStorage.getItem('playerName')) {
        const randomNames = ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена', 'Сергей', 'Ольга'];
        elements.playerName.value = randomNames[Math.floor(Math.random() * randomNames.length)];
    } else {
        elements.playerName.value = localStorage.getItem('playerName');
    }
    
    // Назначение обработчиков событий
    setupEventListeners();
    
    // Попытка автоматического подключения
    autoConnect();
    
    // Обновление интерфейса
    updateUI();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки управления игрой
    elements.createGameBtn.addEventListener('click', createGame);
    elements.joinGameBtn.addEventListener('click', joinGame);
    elements.startGameBtn.addEventListener('click', startGame);
    elements.nextRoundBtn.addEventListener('click', nextRound);
    elements.newGameBtn.addEventListener('click', newGame);
    elements.connectBtn.addEventListener('click', connectToGame);
    elements.submitVoteBtn.addEventListener('click', submitVote);
    elements.copyCodeBtn.addEventListener('click', copyRoomCode);
    elements.showAllRolesBtn.addEventListener('click', showAllRoles);
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Клик вне модального окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Ввод имени
    elements.playerName.addEventListener('change', function() {
        localStorage.setItem('playerName', this.value);
    });
}

// Автоматическое подключение к последней игре
function autoConnect() {
    const lastRoom = localStorage.getItem('lastRoom');
    const lastName = localStorage.getItem('playerName');
    
    if (lastRoom && lastName) {
        elements.roomCode.value = lastRoom;
        elements.playerName.value = lastName;
        
        // Автоподключение через 1 секунду
        setTimeout(() => {
            showNotification('Попытка подключения к последней игре...', 'info');
            connectToGame();
        }, 1000);
    }
}

// Подключение к игре
function connectToGame() {
    const playerName = elements.playerName.value.trim();
    const roomCode = elements.roomCode.value.trim().toUpperCase();
    
    if (!playerName) {
        showNotification('Введите ваше имя', 'error');
        return;
    }
    
    if (!roomCode) {
        showNotification('Введите код комнаты', 'error');
        return;
    }
    
    // Сохранение имени
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('lastRoom', roomCode);
    
    // Подключение к WebSocket
    connectWebSocket(playerName, roomCode);
}

// Подключение к WebSocket серверу
function connectWebSocket(playerName, roomCode) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
    
    socket = new WebSocket(`${SERVER_URL}?name=${encodeURIComponent(playerName)}&room=${roomCode}`);
    
    socket.onopen = function() {
        console.log('WebSocket соединение установлено');
        gameState.connected = true;
        updateConnectionStatus(true);
        showNotification('Подключено к серверу', 'success');
    };
    
    socket.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
        }
    };
    
    socket.onclose = function() {
        console.log('WebSocket соединение закрыто');
        gameState.connected = false;
        updateConnectionStatus(false);
        showNotification('Соединение с сервером потеряно', 'error');
        
        // Попытка переподключения через 5 секунд
        setTimeout(() => {
            if (!gameState.connected) {
                showNotification('Попытка переподключения...', 'warning');
                connectWebSocket(playerName, roomCode);
            }
        }, 5000);
    };
    
    socket.onerror = function(error) {
        console.error('WebSocket ошибка:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    };
}

// Обработка сообщений от сервера
function handleServerMessage(data) {
    console.log('Получено сообщение от сервера:', data);
    
    switch (data.type) {
        case 'room_joined':
            handleRoomJoined(data);
            break;
        case 'player_joined':
        case 'player_left':
            updatePlayersList(data.players);
            break;
        case 'game_started':
            handleGameStarted(data);
            break;
        case 'role_assigned':
            handleRoleAssigned(data);
            break;
        case 'phase_changed':
            handlePhaseChanged(data);
            break;
        case 'timer_update':
            handleTimerUpdate(data);
            break;
        case 'vote_started':
            handleVoteStarted(data);
            break;
        case 'vote_updated':
            handleVoteUpdated(data);
            break;
        case 'vote_result':
            handleVoteResult(data);
            break;
        case 'night_action':
            handleNightAction(data);
            break;
        case 'event':
            addEventToLog(data.event);
            break;
        case 'resource_update':
            updateResources(data.resources);
            break;
        case 'player_update':
            updatePlayer(data.player);
            break;
        case 'game_over':
            handleGameOver(data);
            break;
        case 'error':
            showNotification(data.message, 'error');
            break;
    }
    
    updateUI();
}

// Обработка присоединения к комнате
function handleRoomJoined(data) {
    gameState.playerId = data.playerId;
    gameState.roomCode = data.roomCode;
    gameState.isHost = data.isHost;
    
    updatePlayersList(data.players);
    
    // Показать информацию о комнате
    document.getElementById('currentRoomCode').textContent = data.roomCode;
    document.getElementById('roomInfo').style.display = 'block';
    document.getElementById('connectionForm').style.display = 'none';
    
    // Обновить кнопки
    elements.startGameBtn.disabled = !data.isHost;
    
    showNotification(`Вы присоединились к комнате ${data.roomCode}`, 'success');
}

// Обновление списка игроков
function updatePlayersList(players) {
    gameState.players = players;
    
    // Обновить список в лобби
    const roomPlayersList = elements.roomPlayersList;
    roomPlayersList.innerHTML = '';
    
    players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-user"></i> ${player.name} ${player.isHost ? '(Хост)' : ''}`;
        roomPlayersList.appendChild(li);
    });
    
    // Обновить счетчик игроков
    const playerCountElement = elements.playerCount.querySelector('span');
    playerCountElement.textContent = `${players.length}/8`;
    
    // Обновить сетку игроков в основной игре
    updatePlayersGrid();
}

// Обновление сетки игроков
function updatePlayersGrid() {
    const grid = elements.playersGrid;
    grid.innerHTML = '';
    
    gameState.players.forEach(player => {
        const playerCard = createPlayerCard(player);
        grid.appendChild(playerCard);
    });
}

// Создание карточки игрока
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.dataset.playerId = player.id;
    
    if (player.id === gameState.playerId) {
        card.classList.add('active');
    }
    
    if (player.status === 'dead') {
        card.classList.add('dead');
    }
    
    if (player.checked) {
        card.classList.add('checked');
    }
    
    // Определение цвета аватарки в зависимости от роли
    let avatarColor = 'var(--gradient-primary)';
    if (player.role && ROLES[player.role]) {
        if (ROLES[player.role].isAntagonist) {
            avatarColor = 'var(--gradient-danger)';
        } else if (player.role === 'doctor') {
            avatarColor = 'var(--gradient-success)';
        } else if (player.role === 'leader') {
            avatarColor = 'var(--gradient-warning)';
        }
    }
    
    // Первая буква имени для аватарки
    const firstLetter = player.name.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="player-avatar" style="background: ${avatarColor}">
            ${firstLetter}
        </div>
        <div class="player-name">${player.name}</div>
        <div class="player-status ${player.status === 'alive' ? 'status-alive' : 'status-dead'}">
            ${player.status === 'alive' ? 'Жив' : 'Выбыл'}
        </div>
        <div class="player-resources">
            <span class="resource-icon" title="Еда"><i class="fas fa-apple-alt"></i> ${player.resources?.food || 0}</span>
            <span class="resource-icon" title="Вода"><i class="fas fa-tint"></i> ${player.resources?.water || 0}</span>
        </div>
        ${player.voteTarget ? `<div class="vote-indicator" title="Голосует против ${player.voteTarget}"><i class="fas fa-vote-yea"></i></div>` : ''}
    `;
    
    // Добавление обработчика клика для голосования
    if (gameState.gamePhase === 'day' && player.id !== gameState.playerId && player.status === 'alive') {
        card.addEventListener('click', () => selectVoteTarget(player.id));
        card.style.cursor = 'pointer';
    }
    
    return card;
}

// Обработка начала игры
function handleGameStarted(data) {
    gameState.gamePhase = 'night';
    elements.lobbyPhase.style.display = 'none';
    elements.nightPhase.style.display = 'block';
    
    // Обновление кнопок
    elements.startGameBtn.disabled = true;
    elements.nextRoundBtn.disabled = true;
    
    showNotification('Игра началась! Наступает ночь...', 'success');
}

// Обработка назначения роли
function handleRoleAssigned(data) {
    gameState.playerRole = data.role;
    gameState.resources = data.resources || { food: 2, water: 2, medkit: 0, tools: 0 };
    
    // Обновление UI
    updatePlayerRoleUI();
    updateResourcesUI();
    
    // Показать модальное окно с ролью
    showRoleModal();
}

// Обновление UI роли игрока
function updatePlayerRoleUI() {
    const role = ROLES[gameState.playerRole];
    if (!role) return;
    
    elements.playerRole.textContent = role.name;
    elements.roleDescription.textContent = role.description;
}

// Показать модальное окно с ролью
function showRoleModal() {
    const role = ROLES[gameState.playerRole];
    if (!role) return;
    
    document.getElementById('modalRoleIcon').innerHTML = `<i class="fas fa-${getRoleIcon(role.id)}"></i>`;
    document.getElementById('modalRoleTitle').textContent = role.name;
    document.getElementById('modalRoleDescription').textContent = role.description;
    
    const abilitiesList = document.getElementById('modalRoleAbilities');
    abilitiesList.innerHTML = '';
    
    role.abilities.forEach(ability => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check-circle"></i> ${ability}`;
        abilitiesList.appendChild(li);
    });
    
    elements.roleModal.classList.add('active');
}

// Получить иконку для роли
function getRoleIcon(roleId) {
    const icons = {
        survivor: 'user-check',
        leader: 'user-tie',
        doctor: 'user-md',
        intriguer: 'user-secret',
        psychic: 'brain',
        traitor: 'user-ninja',
        scavenger: 'user-hard-hat'
    };
    
    return icons[roleId] || 'user';
}

// Обработка смены фазы
function handlePhaseChanged(data) {
    gameState.gamePhase = data.phase;
    gameState.timeLeft = data.duration || 60;
    
    // Скрыть все фазы
    elements.nightPhase.style.display = 'none';
    elements.dayPhase.style.display = 'none';
    
    // Показать текущую фазу
    if (data.phase === 'night') {
        elements.nightPhase.style.display = 'block';
        elements.phaseText.textContent = 'Ночь';
        showNotification('Наступает ночь. Выполните тайные действия.', 'info');
        
        // Обновить действия для ночной фазы
        updateNightActions();
        
        // Включить/выключить кнопки
        elements.nextRoundBtn.disabled = true;
        
    } else if (data.phase === 'day') {
        elements.dayPhase.style.display = 'block';
        elements.phaseText.textContent = 'День';
        showNotification('Наступает день. Начинается обсуждение и голосование.', 'info');
        
        // Сбросить голосование
        gameState.currentVote = null;
        elements.submitVoteBtn.disabled = true;
        
        // Включить/выключить кнопки
        elements.nextRoundBtn.disabled = !gameState.isHost;
    }
    
    // Обновить таймер
    updateTimerUI();
}

// Обновление действий для ночной фазы
function updateNightActions() {
    const actionsContainer = elements.nightActions;
    actionsContainer.innerHTML = '';
    
    const role = ROLES[gameState.playerRole];
    if (!role || !role.nightAction) {
        actionsContainer.innerHTML = '<p>У вашей роли нет ночных действий. Отдыхайте.</p>';
        return;
    }
    
    const actionTitle = document.createElement('h3');
    actionTitle.textContent = 'Ваши ночные действия:';
    actionsContainer.appendChild(actionTitle);
    
    // В зависимости от действия создаем соответствующий интерфейс
    switch (role.nightAction) {
        case 'save_player':
            createSavePlayerAction(actionsContainer);
            break;
        case 'check_role':
            createCheckRoleAction(actionsContainer);
            break;
        case 'sabotage':
            createSabotageAction(actionsContainer);
            break;
        case 'steal_resources':
            createStealResourcesAction(actionsContainer);
            break;
        default:
            actionsContainer.innerHTML += '<p>Действие в разработке.</p>';
    }
}

// Создание действия "спасти игрока" для доктора
function createSavePlayerAction(container) {
    const description = document.createElement('p');
    description.textContent = 'Выберите игрока, которого хотите спасти от изгнания или саботажа в этом раунде:';
    container.appendChild(description);
    
    const select = document.createElement('select');
    select.id = 'savePlayerSelect';
    
    // Добавить опцию по умолчанию
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите игрока';
    select.appendChild(defaultOption);
    
    // Добавить живых игроков (кроме себя)
    gameState.players.forEach(player => {
        if (player.id !== gameState.playerId && player.status === 'alive') {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            select.appendChild(option);
        }
    });
    
    container.appendChild(select);
    
    const button = document.createElement('button');
    button.className = 'btn btn-success';
    button.innerHTML = '<i class="fas fa-shield-alt"></i> Спасти игрока';
    button.addEventListener('click', () => {
        const playerId = select.value;
        if (!playerId) {
            showNotification('Выберите игрока для спасения', 'error');
            return;
        }
        
        sendNightAction('save', { targetId: playerId });
        button.disabled = true;
        showNotification(`Вы решили спасти игрока`, 'success');
    });
    
    container.appendChild(button);
}

// Создание действия "проверить роль" для психопата
function createCheckRoleAction(container) {
    const description = document.createElement('p');
    description.textContent = 'Выберите игрока, чью роль вы хотите проверить этой ночью:';
    container.appendChild(description);
    
    const select = document.createElement('select');
    select.id = 'checkPlayerSelect';
    
    // Добавить опцию по умолчанию
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите игрока';
    select.appendChild(defaultOption);
    
    // Добавить живых игроков (кроме себя)
    gameState.players.forEach(player => {
        if (player.id !== gameState.playerId && player.status === 'alive') {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            select.appendChild(option);
        }
    });
    
    container.appendChild(select);
    
    const button = document.createElement('button');
    button.className = 'btn btn-secondary';
    button.innerHTML = '<i class="fas fa-search"></i> Проверить роль';
    button.addEventListener('click', () => {
        const playerId = select.value;
        if (!playerId) {
            showNotification('Выберите игрока для проверки', 'error');
            return;
        }
        
        sendNightAction('check', { targetId: playerId });
        button.disabled = true;
        showNotification(`Вы проверяете игрока`, 'info');
    });
    
    container.appendChild(button);
}

// Отправка ночного действия на сервер
function sendNightAction(actionType, data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showNotification('Нет соединения с сервером', 'error');
        return;
    }
    
    const message = {
        type: 'night_action',
        action: actionType,
        ...data
    };
    
    socket.send(JSON.stringify(message));
}

// Обработка ночного действия
function handleNightAction(data) {
    if (data.success) {
        showNotification(data.message, 'success');
    } else {
        showNotification(data.message, 'error');
    }
}

// Обновление таймера
function handleTimerUpdate(data) {
    gameState.timeLeft = data.timeLeft;
    updateTimerUI();
}

// Обновление UI таймера
function updateTimerUI() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновить прогресс-бар для ночи
    if (gameState.gamePhase === 'night') {
        const totalNightTime = 60; // Предполагаемая длительность ночи
        const progress = ((totalNightTime - gameState.timeLeft) / totalNightTime) * 100;
        elements.nightProgress.style.width = `${progress}%`;
        elements.nightTimer.textContent = gameState.timeLeft;
    }
}

// Обработка начала голосования
function handleVoteStarted(data) {
    gameState.currentVote = null;
    elements.submitVoteBtn.disabled = true;
    
    // Очистить предыдущие варианты голосования
    elements.votingOptions.innerHTML = '';
    
    // Создать варианты для голосования
    gameState.players.forEach(player => {
        if (player.id !== gameState.playerId && player.status === 'alive') {
            const option = document.createElement('div');
            option.className = 'vote-option';
            option.dataset.playerId = player.id;
            
            option.innerHTML = `
                <i class="fas fa-user"></i>
                <div class="vote-info">
                    <div class="vote-name">${player.name}</div>
                    <div class="vote-role">${player.role ? 'Роль скрыта' : 'Игрок'}</div>
                </div>
            `;
            
            option.addEventListener('click', () => selectVoteTarget(player.id));
            elements.votingOptions.appendChild(option);
        }
    });
    
    showNotification('Голосование началось! Выберите, кто должен покинуть бункер.', 'info');
}

// Выбор цели для голосования
function selectVoteTarget(playerId) {
    // Снять выделение со всех вариантов
    document.querySelectorAll('.vote-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Выделить выбранный вариант
    const selectedOption = document.querySelector(`.vote-option[data-player-id="${playerId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        gameState.currentVote = playerId;
        elements.submitVoteBtn.disabled = false;
    }
}

// Отправка голоса
function submitVote() {
    if (!gameState.currentVote) {
        showNotification('Выберите игрока для голосования', 'error');
        return;
    }
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showNotification('Нет соединения с сервером', 'error');
        return;
    }
    
    const message = {
        type: 'vote',
        targetId: gameState.currentVote
    };
    
    socket.send(JSON.stringify(message));
    elements.submitVoteBtn.disabled = true;
    
    const targetPlayer = gameState.players.find(p => p.id === gameState.currentVote);
    showNotification(`Вы проголосовали против ${targetPlayer?.name || 'игрока'}`, 'success');
}

// Обработка обновления голосования
function handleVoteUpdated(data) {
    // Обновить отображение голосов у игроков
    gameState.players.forEach(player => {
        player.voteTarget = data.votes[player.id];
    });
    
    updatePlayersGrid();
}

// Обработка результатов голосования
function handleVoteResult(data) {
    gameState.voteResults = data;
    
    // Отобразить результаты
    let resultsHTML = '<h4>Результаты голосования:</h4>';
    
    data.results.forEach(result => {
        const player = gameState.players.find(p => p.id === result.playerId);
        if (player) {
            resultsHTML += `
                <div class="vote-result-item">
                    <strong>${player.name}:</strong> ${result.votes} голосов
                </div>
            `;
        }
    });
    
    if (data.exiledPlayer) {
        const exiledPlayer = gameState.players.find(p => p.id === data.exiledPlayer);
        resultsHTML += `<div class="vote-exiled"><strong>${exiledPlayer?.name || 'Игрок'} изгнан из бункера!</strong></div>`;
        showNotification(`${exiledPlayer?.name || 'Игрок'} изгнан из бункера!`, 'warning');
    } else {
        resultsHTML += `<div class="vote-exiled"><strong>Никто не изгнан.</strong></div>`;
    }
    
    elements.voteResults.innerHTML = resultsHTML;
    
    // Обновить статус игроков
    if (data.exiledPlayer) {
        const playerIndex = gameState.players.findIndex(p => p.id === data.exiledPlayer);
        if (playerIndex !== -1) {
            gameState.players[playerIndex].status = 'dead';
        }
    }
    
    updatePlayersGrid();
}

// Добавление события в лог
function addEventToLog(event) {
    gameState.eventLog.unshift(event);
    
    if (gameState.eventLog.length > 10) {
        gameState.eventLog.pop();
    }
    
    updateEventLogUI();
}

// Обновление лога событий
function updateEventLogUI() {
    const logContainer = elements.eventLog;
    logContainer.innerHTML = '';
    
    gameState.eventLog.forEach(event => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${event.type || 'event'}`;
        
        let icon = 'fa-info-circle';
        if (event.type === 'vote') icon = 'fa-vote-yea';
        if (event.type === 'action') icon = 'fa-bolt';
        if (event.type === 'death') icon = 'fa-skull-crossbones';
        
        logEntry.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="log-content">
                <div class="log-text">${event.text}</div>
                <div class="log-time">${new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        
        logContainer.appendChild(logEntry);
    });
}

// Обновление ресурсов
function updateResources(resources) {
    gameState.resources = resources;
    updateResourcesUI();
}

// Обновление UI ресурсов
function updateResourcesUI() {
    elements.foodCount.textContent = gameState.resources.food || 0;
    elements.waterCount.textContent = gameState.resources.water || 0;
    elements.medkitCount.textContent = gameState.resources.medkit || 0;
    elements.toolCount.textContent = gameState.resources.tools || 0;
}

// Обновление информации об игроке
function updatePlayer(playerData) {
    const playerIndex = gameState.players.findIndex(p => p.id === playerData.id);
    if (playerIndex !== -1) {
        gameState.players[playerIndex] = { ...gameState.players[playerIndex], ...playerData };
        
        // Если это текущий игрок
        if (playerData.id === gameState.playerId) {
            if (playerData.role) gameState.playerRole = playerData.role;
            if (playerData.resources) gameState.resources = playerData.resources;
            
            updatePlayerRoleUI();
            updateResourcesUI();
        }
        
        updatePlayersGrid();
    }
}

// Обработка окончания игры
function handleGameOver(data) {
    elements.gameStatus.textContent = data.message;
    
    // Показать результаты
    showNotification(data.message, data.winners === 'survivors' ? 'success' : 'error');
    
    // Активировать кнопку новой игры
    elements.newGameBtn.disabled = false;
    elements.nextRoundBtn.disabled = true;
}

// Создание игры
function createGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        showNotification('Введите ваше имя', 'error');
        return;
    }
    
    // Генерация кода комнаты
    const roomCode = generateRoomCode();
    elements.roomCode.value = roomCode;
    
    // Подключение к игре
    connectToGame();
}

// Присоединение к игре
function joinGame() {
    const playerName = elements.playerName.value.trim();
    const roomCode = elements.roomCode.value.trim().toUpperCase();
    
    if (!playerName) {
        showNotification('Введите ваше имя', 'error');
        return;
    }
    
    if (!roomCode) {
        showNotification('Введите код комнаты', 'error');
        return;
    }
    
    // Подключение к игре
    connectToGame();
}

// Начало игры
function startGame() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showNotification('Нет соединения с сервером', 'error');
        return;
    }
    
    if (!gameState.isHost) {
        showNotification('Только хост может начать игру', 'error');
        return;
    }
    
    if (gameState.players.length < 3) {
        showNotification('Необходимо минимум 3 игрока', 'error');
        return;
    }
    
    const message = {
        type: 'start_game'
    };
    
    socket.send(JSON.stringify(message));
}

// Следующий раунд
function nextRound() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showNotification('Нет соединения с сервером', 'error');
        return;
    }
    
    if (!gameState.isHost) {
        showNotification('Только хост может начать следующий раунд', 'error');
        return;
    }
    
    const message = {
        type: 'next_round'
    };
    
    socket.send(JSON.stringify(message));
}

// Новая игра
function newGame() {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        showNotification('Нет соединения с сервером', 'error');
        return;
    }
    
    const message = {
        type: 'new_game'
    };
    
    socket.send(JSON.stringify(message));
}

// Генерация кода комнаты
function generateRoomCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Исключаем похожие символы
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Копирование кода комнаты
function copyRoomCode() {
    const roomCode = document.getElementById('currentRoomCode').textContent;
    navigator.clipboard.writeText(roomCode).then(() => {
        showNotification('Код комнаты скопирован!', 'success');
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
        showNotification('Не удалось скопировать код', 'error');
    });
}

// Показать все роли
function showAllRoles() {
    const rolesGrid = document.getElementById('allRolesGrid');
    rolesGrid.innerHTML = '';
    
    Object.values(ROLES).forEach(role => {
        const roleCard = document.createElement('div');
        roleCard.className = 'role-help-card';
        
        roleCard.innerHTML = `
            <h4><i class="fas fa-${getRoleIcon(role.id)}"></i> ${role.name}</h4>
            <p>${role.description}</p>
            <div class="role-tags">
                <span class="role-tag ${role.isAntagonist ? 'antagonist' : 'survivor'}">
                    ${role.isAntagonist ? 'Антагонист' : 'Выживший'}
                </span>
            </div>
        `;
        
        rolesGrid.appendChild(roleCard);
    });
    
    elements.allRolesModal.classList.add('active');
}

// Обновление статуса подключения
function updateConnectionStatus(connected) {
    const statusElement = elements.connectionStatus;
    if (connected) {
        statusElement.classList.remove('disconnected');
        statusElement.classList.add('connected');
        statusElement.innerHTML = '<i class="fas fa-wifi"></i> <span>Подключено</span>';
    } else {
        statusElement.classList.remove('connected');
        statusElement.classList.add('disconnected');
        statusElement.innerHTML = '<i class="fas fa-wifi-slash"></i> <span>Не подключено</span>';
    }
}

// Обновление всего UI
function updateUI() {
    // Обновление статуса игры
    if (gameState.gamePhase === 'lobby') {
        elements.gameStatus.textContent = gameState.roomCode 
            ? `Ожидание игроков в комнате ${gameState.roomCode}`
            : 'Ожидание подключения игроков...';
    } else if (gameState.gamePhase === 'night') {
        elements.gameStatus.textContent = 'Ночь - фаза тайных действий';
    } else if (gameState.gamePhase === 'day') {
        elements.gameStatus.textContent = 'День - фаза обсуждения и голосования';
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    notificationArea.appendChild(notification);
    
    // Автоматическое удаление уведомления через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

// Добавление стилей для анимации исчезновения
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(fadeOutStyle);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', init);