// LoveDeck Online - Настоящая сетевая игра
console.log('🚀 Запускаем настоящую сетевую игру...');

// Глобальное состояние игры
const gameState = {
    ws: null,
    playerName: '',
    isHost: false,
    roomId: null,
    playerId: null,
    isConnected: false,
    playersInRoom: 0,
    otherPlayerName: '',
    hostName: '',
    currentCard: null
};

// Настройка WebSocket обработчиков
function setupWebSocketHandlers() {
    if (!gameState.ws) return;

    gameState.ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 Получено от сервера:', data.type, data);
            
            switch (data.type) {
                case 'ROOM_CREATED':
                    handleRoomCreated(data);
                    break;
                    
                case 'ROOM_JOINED':
                    handleRoomJoined(data);
                    break;
                    
                case 'PLAYER_CONNECTED':
                    handlePlayerConnected(data);
                    break;
                    
                case 'PLAYER_DISCONNECTED':
                    handlePlayerDisconnected(data);
                    break;
                    
                case 'GAME_STARTED':
                    handleGameStarted(data);
                    break;
                    
                case 'NEW_CARD':
                    handleNewCard(data);
                    break;
                    
                case 'NEW_MESSAGE':
                    handleNewMessage(data);
                    break;
                    
                case 'PLAY_AGAIN':
                    handlePlayAgain(data);
                    break;
                    
                case 'YOU_ARE_HOST':
                    handleYouAreHost(data);
                    break;
                    
                case 'ERROR':
                    handleError(data);
                    break;
                    
                default:
                    console.warn('⚠️ Неизвестный тип сообщения:', data.type);
            }
        } catch (error) {
            console.error('❌ Ошибка обработки сообщения:', error);
        }
    };
}

// Подключение к серверу
function connectToServer() {
    return new Promise((resolve, reject) => {
        // 🔥 ЗАМЕНИ НА СВОЙ ДОМЕН С RAILWAY!
        const serverUrl = 'wss://lovedeck-server-production.up.railway.app';
        
        console.log('🔗 Подключаемся к облаку:', serverUrl);
        
        const ws = new WebSocket(serverUrl);
        
        ws.onopen = () => {
            console.log('✅ Подключение к облачному серверу установлено!');
            gameState.ws = ws;
            setupWebSocketHandlers();
            resolve(ws);
        };
        
        ws.onerror = (error) => {
            console.error('❌ Ошибка подключения к облаку:', error);
            showNotification(`Не удалось подключиться к облаку`, 'error');
            reject(error);
        };
        
        ws.onclose = () => {
            console.log('❌ Соединение с облаком закрыто');
            showNotification('Соединение потеряно', 'error');
        };
    });
}

// Обработчики сообщений
function handleRoomCreated(data) {
    console.log('🏠 Комната создана:', data);
    gameState.roomId = data.roomId;
    gameState.playerId = data.playerId;
    gameState.isConnected = true;
    
    // Показываем ID комнаты
    const roomIdElement = document.getElementById('roomId');
    if (roomIdElement) {
        roomIdElement.textContent = data.roomId;
    }
    
    addMessage('system', data.message || 'Комната создана!');
    showNotification('Комната создана!', 'success');
    
    // Сохраняем имя хоста
    if (gameState.isHost) {
        gameState.hostName = gameState.playerName;
    }
    
    // ПЕРЕКЛЮЧАЕМСЯ НА ЭКРАН КОМНАТЫ (ДОБАВЬ ЭТУ СТРОЧКУ!)
    showScreen('roomScreen');
    
    updatePlayerNames();
    updatePlayerCount();
}

// Функция копирования ID комнаты (ДОБАВЬ ЭТУ ФУНКЦИЮ!)
function copyRoomId() {
    if (gameState.roomId) {
        navigator.clipboard.writeText(gameState.roomId)
            .then(() => showNotification('ID комнаты скопирован!', 'success'))
            .catch(() => showNotification('Не удалось скопировать', 'error'));
    }
}

// Функция копирования ID комнаты
function copyRoomId() {
    if (gameState.roomId) {
        navigator.clipboard.writeText(gameState.roomId)
            .then(() => showNotification('ID комнаты скопирован!', 'success'))
            .catch(() => showNotification('Не удалось скопировать', 'error'));
    }
}

function handleRoomJoined(data) {
    console.log('🎯 Присоединились к комнате:', data);
    gameState.roomId = data.roomId;
    gameState.playerId = data.playerId;
    gameState.isConnected = true;
    
    addMessage('system', data.message || 'Вы присоединились к комнате!');
    showNotification('Вы в комнате!', 'success');
    
    // Сохраняем имя хоста (в реальном приложении сервер должен отправить имя хоста)
    gameState.hostName = 'Хост';
    
    // ОБЯЗАТЕЛЬНО ПЕРЕКЛЮЧАЕМСЯ НА ЭКРАН КОМНАТЫ!
    showScreen('roomScreen');
    
    updatePlayerNames();
    updatePlayerCount();
}

function handlePlayerConnected(data) {
    console.log('👤 Игрок подключился:', data);
    
    gameState.isConnected = true;
    gameState.playersInRoom = (gameState.playersInRoom || 0) + 1;
    
    // Сохраняем имя второго игрока
    if (data.playerName && data.playerName !== gameState.playerName) {
        gameState.otherPlayerName = data.playerName;
        updatePlayerNames();
    }
    
    // Показываем сообщение
    const message = data.playerName ? 
        `${data.playerName} присоединился к игре!` : 
        'Новый игрок подключился!';
    addMessage('system', message);
    
    // Если мы хост и есть второй игрок - активируем кнопку "Начать игру"
    if (gameState.isHost && gameState.playersInRoom >= 2) {
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = '🎮 Начать игру';
            startBtn.style.opacity = '1';
            showNotification('Второй игрок подключился! Можно начинать игру.', 'success');
        }
    }
    
    updatePlayerCount();
}

function handlePlayerDisconnected(data) {
    console.log('👋 Игрок отключился:', data);
    
    let message = 'Игрок отключился';
    if (data.playerName) {
        message = `${data.playerName} покинул игру`;
        // Очищаем имя отключившегося игрока
        if (data.playerName === gameState.otherPlayerName) {
            gameState.otherPlayerName = '';
        }
    }
    
    addMessage('system', message);
    showNotification(message, 'warning');
    
    gameState.playersInRoom = Math.max(0, (gameState.playersInRoom || 0) - 1);
    updatePlayerCount();
    updatePlayerNames();
}

function handleGameStarted(data) {
    console.log('🎮 Игра началась:', data);
    
    addMessage('system', data.message || 'Игра началась!');
    showNotification('Игра началась! Удачи!', 'success');
    
    // Активируем карточки
    setupCardButtons();
}

function handleNewCard(data) {
    console.log('🎴 Новая карточка от сервера:', data);
    
    let card = data.card;
    let cardType = data.cardType;
    let senderName = data.senderName || 'Игрок';
    
    // Если карта вложена в другой объект
    if (!card && data.cardData) {
        card = data.cardData.card;
        cardType = data.cardData.cardType;
    }
    
    if (!card) {
        console.error('Не удалось получить карточку:', data);
        return;
    }
    
    // Показываем карточку
    displayCard(card, cardType);
    
    // Уведомление в чат
    const typeNames = {
        'question': 'вопрос',
        'action': 'действие', 
        'date': 'свидание',
        'compliment': 'комплимент'
    };
    
    const typeName = typeNames[cardType] || cardType;
    addMessage('system', `${senderName} отправил(а) ${typeName}: "${card.text ? card.text.substring(0, 50) + '...' : 'карточку'}"`);
}

function handleNewMessage(data) {
    console.log('💬 Новое сообщение от сервера:', data);
    
    let messageText = '';
    let senderName = 'Игрок';
    
    // Обрабатываем разные форматы
    if (typeof data === 'string') {
        messageText = data;
    } else if (data.text) {
        messageText = data.text;
        senderName = data.senderName || 'Игрок';
    } else if (data.message && typeof data.message === 'string') {
        messageText = data.message;
        senderName = data.senderName || 'Игрок';
    } else if (data.message && data.message.text) {
        messageText = data.message.text;
        senderName = data.message.senderName || 'Игрок';
    } else {
        // Если непонятный формат
        messageText = 'Получено сообщение';
        console.warn('Непонятный формат сообщения:', data);
    }
    
    // Добавляем в чат
    addMessage('player', messageText, senderName);
}

function handlePlayAgain(data) {
    console.log('🔄 Перезапуск игры:', data);
    
    addMessage('system', data.message || 'Игра перезапущена!');
    showNotification('Игра перезапущена!', 'info');
    
    // Очищаем карточки
    const cardContainer = document.getElementById('cardContainer');
    if (cardContainer) {
        cardContainer.innerHTML = '';
    }
}

function handleYouAreHost(data) {
    console.log('👑 Теперь вы хост:', data);
    
    gameState.isHost = true;
    addMessage('system', data.message || 'Вы теперь хост комнаты!');
    showNotification('Вы теперь хост!', 'success');
}

function handleError(data) {
    console.error('❌ Ошибка от сервера:', data);
    
    addMessage('system', `Ошибка: ${data.message || 'Неизвестная ошибка'}`);
    showNotification(data.message || 'Произошла ошибка', 'error');
}

// Отправка сообщений на сервер
function sendToServer(type, data = {}) {
    if (!gameState.ws || gameState.ws.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket не подключен');
        showNotification('Нет подключения к серверу', 'error');
        return false;
    }
    
    const message = JSON.stringify({ type, ...data });
    console.log('📤 Отправлено на сервер:', type, data);
    gameState.ws.send(message);
    return true;
}

// Создание комнаты
async function createRoom() {
    console.log('👑 Создаем комнату как хост...');
    
    const nameInput = document.getElementById('hostNameInput');
    const playerName = nameInput ? nameInput.value.trim() : 'Хост';
    
    if (!playerName) {
        showNotification('Введите ваше имя', 'error');
        return;
    }
    
    showNotification('Подключаемся к серверу...', 'info');
    
    try {
        await connectToServer();
        gameState.playerName = playerName;
        gameState.isHost = true;
        
        sendToServer('CREATE_ROOM', { playerName });
    } catch (error) {
        console.error('❌ Не удалось создать комнату:', error);
    }
}

// Подключение к комнате
async function joinRoom() {
    console.log('👤 Подключаемся к комнате как игрок...');
    
    const nameInput = document.getElementById('playerNameInput');
    const roomInput = document.getElementById('roomIdInput');
    
    const playerName = nameInput ? nameInput.value.trim() : 'Игрок';
    const roomId = roomInput ? roomInput.value.trim() : '';
    
    if (!playerName) {
        showNotification('Введите ваше имя', 'error');
        return;
    }
    
    if (!roomId) {
        showNotification('Введите ID комнаты', 'error');
        return;
    }
    
    showNotification('Подключаемся к серверу...', 'info');
    
    try {
        await connectToServer();
        gameState.playerName = playerName;
        gameState.isHost = false;
        
        sendToServer('JOIN_ROOM', { roomId, playerName });
    } catch (error) {
        console.error('❌ Не удалось подключиться к комнате:', error);
    }
}

// Начало игры
function startGame() {
    console.log('🎮 Начинаем игру...');
    
    if (!gameState.isHost) {
        showNotification('Только хост может начать игру', 'error');
        return;
    }
    
    sendToServer('START_GAME');
}

// Отправка карточки
function sendCard(card, cardType) {
    console.log('🎴 Отправляем карточку:', cardType);
    
    if (!gameState.isConnected) {
        showNotification('Нет подключения', 'error');
        return;
    }
    
    sendToServer('SEND_CARD', { card, cardType });
}

// Отправка сообщения в чат
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    console.log('💬 Отправляем сообщение в чат...');
    
    sendToServer('SEND_MESSAGE', { message });
    
    input.value = '';
    
    // Показываем своё сообщение сразу
    addMessage('player', message, gameState.playerName || 'Вы');
}

// Отображение карточки
function displayCard(card, cardType) {
    console.log('🃏 Отображаем карточку:', cardType);
    
    const cardContainer = document.getElementById('cardContainer');
    if (!cardContainer) return;
    
    // Очищаем предыдущую карточку
    cardContainer.innerHTML = '';
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    const typeNames = {
        'question': '❓ ВОПРОС',
        'action': '🎬 ДЕЙСТВИЕ',
        'date': '❤️ СВИДАНИЕ',
        'compliment': '💖 КОМПЛИМЕНТ'
    };
    
    const typeName = typeNames[cardType] || cardType.toUpperCase();
    
    let cardContent = '';
    
    if (card.html) {
        cardContent = card.html;
    } else if (card.text) {
        cardContent = `<p>${card.text}</p>`;
    } else if (typeof card === 'string') {
        cardContent = `<p>${card}</p>`;
    } else {
        cardContent = `<p>${JSON.stringify(card)}</p>`;
    }
    
    cardElement.innerHTML = `
        <div class="card-header">
            <h3>${typeName}</h3>
            <span class="card-badge">${cardType === 'question' ? '❓' : cardType === 'action' ? '🎬' : cardType === 'date' ? '❤️' : '💖'}</span>
        </div>
        <div class="card-content">
            ${cardContent}
        </div>
    `;
    
    cardContainer.appendChild(cardElement);
    gameState.currentCard = card;
    
    // Прокручиваем к карточке
    cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Добавление сообщения в чат
function addMessage(type, text, sender = '') {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    
    let displayText = text;
    let displaySender = sender;
    
    // Обрабатываем системные сообщения
    if (type === 'system') {
        displaySender = '📢 Система';
        messageElement.style.backgroundColor = '#e3f2fd';
        messageElement.style.fontStyle = 'italic';
    } else if (type === 'player') {
        if (!displaySender) displaySender = 'Игрок';
    }
    
    messageElement.innerHTML = `
        ${displaySender ? `<strong>${displaySender}:</strong> ` : ''}
        ${displayText}
    `;
    
    messagesContainer.appendChild(messageElement);
    
    // Автопрокрутка
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Сохраняем в историю
    saveMessageToHistory(type, text, sender);
}

// Сохранение сообщений в историю
function saveMessageToHistory(type, text, sender) {
    if (!gameState.roomId) return;
    
    const key = `chat_${gameState.roomId}`;
    let history = JSON.parse(localStorage.getItem(key) || '[]');
    
    history.push({
        type,
        text,
        sender,
        timestamp: new Date().toISOString()
    });
    
    // Сохраняем только последние 50 сообщений
    if (history.length > 50) {
        history = history.slice(-50);
    }
    
    localStorage.setItem(key, JSON.stringify(history));
}

// Загрузка истории чата
function loadChatHistory() {
    if (!gameState.roomId) return;
    
    const key = `chat_${gameState.roomId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    
    history.forEach(msg => {
        addMessage(msg.type, msg.text, msg.sender);
    });
}

// Показать уведомление
function showNotification(message, type = 'info') {
    console.log(`📢 Уведомление (${type}): ${message}`);
    
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Устанавливаем цвет в зависимости от типа
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    };
    
    notification.textContent = message;
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.style.display = 'block';
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Обновление счетчика игроков
function updatePlayerCount() {
    const countElement = document.getElementById('playerCount');
    if (countElement) {
        const count = gameState.playersInRoom || 1;
        countElement.textContent = `Игроков в комнате: ${count}/2`;
        
        // Меняем цвет если полная комната
        if (count >= 2) {
            countElement.style.color = '#4CAF50';
            countElement.style.fontWeight = 'bold';
        }
    }
}

// Обновление имён игроков
function updatePlayerNames() {
    const hostNameEl = document.getElementById('hostName');
    const playerNameEl = document.getElementById('playerName');
    
    if (hostNameEl) {
        if (gameState.isHost) {
            hostNameEl.textContent = `${gameState.playerName} (Вы)`;
            hostNameEl.style.fontWeight = 'bold';
        } else {
            hostNameEl.textContent = gameState.hostName || 'Хост';
        }
    }
    
    if (playerNameEl) {
        if (gameState.isHost) {
            playerNameEl.textContent = gameState.otherPlayerName || 'Ожидание игрока...';
            if (gameState.otherPlayerName) {
                playerNameEl.style.color = '#4CAF50';
                playerNameEl.style.fontWeight = 'bold';
            }
        } else {
            // Для второго игрока показываем его имя как "Вы"
            playerNameEl.textContent = `${gameState.playerName} (Вы)`;
            playerNameEl.style.fontWeight = 'bold';
            playerNameEl.style.color = '#764ba2';
        }
    }
}

// Настройка кнопок карточек
function setupCardButtons() {
    console.log('🎴 Настраиваем кнопки карточек...');
    
    // Кнопка "Случайный вопрос"
    const randomQuestionBtn = document.getElementById('randomQuestionBtn');
    if (randomQuestionBtn) {
        randomQuestionBtn.onclick = () => {
            const card = getRandomQuestion();
            if (card) {
                sendCard(card, 'question');
                displayCard(card, 'question');
            }
        };
    }
    
    // Кнопка "Случайное действие"
    const randomActionBtn = document.getElementById('randomActionBtn');
    if (randomActionBtn) {
        randomActionBtn.onclick = () => {
            const card = getRandomAction();
            if (card) {
                sendCard(card, 'action');
                displayCard(card, 'action');
            }
        };
    }
    
    // Кнопка "Случайное свидание"
    const randomDateBtn = document.getElementById('randomDateBtn');
    if (randomDateBtn) {
        randomDateBtn.onclick = () => {
            const card = getRandomDate();
            if (card) {
                sendCard(card, 'date');
                displayCard(card, 'date');
            }
        };
    }
    
    // Кнопка "Случайный комплимент"
    const randomComplimentBtn = document.getElementById('randomComplimentBtn');
    if (randomComplimentBtn) {
        randomComplimentBtn.onclick = () => {
            const card = getRandomCompliment();
            if (card) {
                sendCard(card, 'compliment');
                displayCard(card, 'compliment');
            }
        };
    }
}

// Настройка кнопок в комнате
function setupRoomButtons() {
    console.log('🔧 Настраиваем кнопки в комнате...');
    
    // Кнопка "Начать игру"
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.onclick = startGame;
        if (!gameState.isHost) {
            startGameBtn.disabled = true;
            startGameBtn.textContent = 'Ожидаем хоста...';
        }
    }
    
    // Кнопка отправки сообщения
    const sendChatBtn = document.getElementById('sendChatBtn');
    if (sendChatBtn) {
        sendChatBtn.onclick = sendChatMessage;
    }
    
    // Отправка сообщения по Enter
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Кнопка "Новая игра"
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.onclick = () => {
            if (!gameState.isHost) {
                showNotification('Только хост может начать новую игру', 'error');
                return;
            }
            sendToServer('PLAY_AGAIN');
        };
    }
    
    // Кнопка "Покинуть комнату"
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    if (leaveRoomBtn) {
        leaveRoomBtn.onclick = () => {
            if (confirm('Покинуть комнату?')) {
                // Отключаемся от сервера
                if (gameState.ws) {
                    gameState.ws.close();
                }
                // Возвращаемся к выбору режима
                showScreen('modeSelectScreen');
                // Сбрасываем состояние
                gameState.roomId = null;
                gameState.isConnected = false;
                gameState.playersInRoom = 0;
                showNotification('Вы вышли из комнаты', 'info');
            }
        };
    }
} // ← ЗАКРЫВАЕМ ФУНКЦИЮ setupRoomButtons ЗДЕСЬ!

// Переключение экранов
function showScreen(screenId) {
    console.log(`🔄 Переключаемся на экран: ${screenId}`);
    
    // Скрываем все экраны
    const screens = ['modeSelectScreen', 'hostScreen', 'playerScreen', 'roomScreen'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.style.display = 'none';
        }
    });
    
    // Показываем нужный экран
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        console.log(`✅ Экран ${screenId} показан`);
        
        // Если это экран комнаты - обновляем данные
        if (screenId === 'roomScreen') {
            updateRoomScreen();
        }
    } else {
        console.error(`❌ Экран ${screenId} не найден!`);
    }
}

// Новая функция для обновления экрана комнаты
function updateRoomScreen() {
    console.log('🔄 Обновляем экран комнаты');
    
    // Обновляем ID комнаты
    const roomIdEl = document.getElementById('roomId');
    if (roomIdEl && gameState.roomId) {
        roomIdEl.textContent = gameState.roomId;
    }
    
    // Обновляем имена игроков
    updatePlayerNames();
    
    // Обновляем счетчик игроков
    updatePlayerCount();
    
    // Обновляем статус кнопки "Начать игру" (ТОЛЬКО ДЛЯ ХОСТА)
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        if (gameState.isHost) {
            if (gameState.playersInRoom >= 2) {
                startBtn.disabled = false;
                startBtn.textContent = '🎮 Начать игру';
                startBtn.style.opacity = '1';
            } else {
                startBtn.disabled = true;
                startBtn.textContent = '⏳ Ожидание второго игрока...';
            }
        } else {
            // У игрока скрываем кнопку "Начать игру" или меняем текст
            startBtn.style.display = 'none'; // или
            startBtn.textContent = '⏳ Ожидаем начала игры...';
            startBtn.disabled = true;
        }
    }
}

// Инициализация
function initializeOnlineGame() {
    console.log('🔧 Настраиваем обработчики...');
    
    // Кнопка "Я Хост"
    const hostModeBtn = document.getElementById('hostModeBtn');
    if (hostModeBtn) {
        hostModeBtn.onclick = () => {
            showScreen('hostScreen');
            // Очищаем поле имени если нужно
            const nameInput = document.getElementById('hostNameInput');
            if (nameInput && !nameInput.value) {
                nameInput.value = 'Евгений';
            }
        };
        console.log('✅ Кнопка "Я Хост" настроена');
    }
    
    // Кнопка "Я Игрок"
    const playerModeBtn = document.getElementById('playerModeBtn');
    if (playerModeBtn) {
        playerModeBtn.onclick = () => {
            showScreen('playerScreen');
            // Очищаем поле ID комнаты
            const roomInput = document.getElementById('roomIdInput');
            if (roomInput) {
                roomInput.value = '';
            }
        };
        console.log('✅ Кнопка "Я Игрок" настроена');
    }
    
    // Кнопка "Создать комнату"
    const createRoomBtn = document.getElementById('createRoomBtn');
    if (createRoomBtn) {
        createRoomBtn.onclick = createRoom;
    }
    
    // Кнопка "Подключиться"
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    if (joinRoomBtn) {
        joinRoomBtn.onclick = joinRoom;
    }
    
    // Кнопки "Назад" (ИСПРАВЛЕНО!)
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.onclick = () => {
            console.log('🔙 Возвращаемся к выбору режима');
            showScreen('modeSelectScreen');
        };
    });
    
    // Кнопка "Назад к игре" в modeSelectScreen (ИСПРАВЛЕНО!)
    const backToGameBtn = document.querySelector('.back-btn[onclick*="index.html"]');
    if (backToGameBtn) {
        // Убираем старый обработчик
        backToGameBtn.removeAttribute('onclick');
        // Добавляем новый
        backToGameBtn.onclick = () => {
            console.log('🎮 Возвращаемся к локальной игре');
            window.location.href = 'index.html';
        };
    }
    
    // Настраиваем карточки
    setupCardButtons();
    
    // Настраиваем кнопки комнаты
    setupRoomButtons();
    
    console.log('✅ Настоящая сетевая игра готова');
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', initializeOnlineGame);
