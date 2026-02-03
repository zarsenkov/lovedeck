// online-local.js
// НАСТОЯЩАЯ ЛОКАЛЬНАЯ СЕТЕВАЯ ИГРА

console.log('🎮 Настоящая локальная сетевая игра загружена');

// Состояние игры
let gameState = {
    isHost: false,
    playerName: '',
    playerId: null,
    roomId: '',
    ws: null, // WebSocket соединение
    messages: [],
    players: [],
    gameStarted: false
};

// DOM элементы
let connectionScreen, roomScreen;
let playerNameInput, roomCodeInput;
let chatMessages, chatInput, chatSendBtn;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Запускаем настоящую сетевую игру...');
    
    // Находим все нужные элементы
    connectionScreen = document.getElementById('connection-screen');
    roomScreen = document.getElementById('room-screen');
    
    playerNameInput = document.getElementById('player-name');
    roomCodeInput = document.getElementById('room-code');
    
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    chatSendBtn = document.querySelector('.chat-send');
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    console.log('✅ Настоящая сетевая игра готова');
});

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('🔧 Настраиваем обработчики...');
    
    // 1. Кнопка "Я Хост (Создатель)"
    const hostBtn = document.getElementById('host-btn');
    if (hostBtn) {
        hostBtn.addEventListener('click', createRoomAsHost);
        console.log('✅ Кнопка "Я Хост" настроена');
    }
    
    // 2. Кнопка "Я Игрок (Присоединиться)"
    const playerBtn = document.getElementById('player-btn');
    if (playerBtn) {
        playerBtn.addEventListener('click', joinRoomAsPlayer);
        console.log('✅ Кнопка "Я Игрок" настроена');
    }
    
    // 3. Кнопка отправки сообщения
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendChatMessage);
    }
    
    // 4. Enter в поле чата
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // 5. Кнопки в комнате
    setupRoomButtons();
}

// Подключиться к WebSocket серверу
function connectToServer() {
    return new Promise((resolve, reject) => {
        // ==== ВАЖНО: ВСТАВЬ СВОЙ IP ЗДЕСЬ ====
        const hostIP = localStorage.getItem('loveDeck_hostIP') || '192.168.0.60';
        // ======================================
        
        // Создаем WebSocket соединение
        const ws = new WebSocket(`ws://${hostIP}:8080`);
        
        ws.onopen = () => {
            console.log('✅ Подключение к серверу установлено');
            gameState.ws = ws;
            setupWebSocketHandlers();
            resolve(ws);
        };
        
        ws.onerror = (error) => {
            console.error('❌ Ошибка подключения:', error);
            showNotification(`Не удалось подключиться к ${hostIP}:8080`, 'error');
            reject(error);
        };
        
        ws.onclose = () => {
            console.log('❌ Соединение закрыто');
            showNotification('Соединение с сервером потеряно', 'error');
        };
    });
}

// Настроить обработчики WebSocket
function setupWebSocketHandlers() {
    const ws = gameState.ws;
    
    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            console.log('📨 Получено от сервера:', message.type);
            
            switch (message.type) {
                case 'ROOM_CREATED':
                    handleRoomCreated(message.data);
                    break;
                    
                case 'JOINED_ROOM':
                    handleJoinedRoom(message.data);
                    break;
                    
                case 'PLAYER_CONNECTED':
                    handlePlayerConnected(message.data);
                    break;
                    
                case 'NEW_MESSAGE':
                    handleNewMessage(message.data);
                    break;
                    
                case 'NEW_CARD':
                    handleNewCard(message.data);
                    break;
                    
                case 'GAME_STARTED':
                    handleGameStarted(message.data);
                    break;
                    
                case 'ERROR':
                    handleError(message.data);
                    break;
            }
            
        } catch (error) {
            console.error('❌ Ошибка обработки сообщения:', error);
        }
    };
}

// Отправить сообщение на сервер
function sendToServer(type, data) {
    if (!gameState.ws || gameState.ws.readyState !== WebSocket.OPEN) {
        showNotification('Нет соединения с сервером!', 'error');
        return false;
    }
    
    const message = JSON.stringify({
        type: type,
        data: data
    });
    
    gameState.ws.send(message);
    console.log(`📤 Отправлено на сервер: ${type}`);
    return true;
}

// СОЗДАТЬ КОМНАТУ КАК ХОСТ
async function createRoomAsHost() {
    console.log('👑 Создаем комнату как хост...');
    
    const playerName = playerNameInput ? playerNameInput.value.trim() : 'Хост';
    
    if (!playerName) {
        showNotification('Введите ваше имя!', 'error');
        return;
    }
    
    // Показываем загрузку
    showNotification('Подключаемся к серверу...', 'info');
    
    try {
        // Подключаемся к серверу
        await connectToServer();
        
        // Генерируем ID комнаты
        const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        
        // Отправляем запрос на создание комнаты
        sendToServer('CREATE_ROOM', {
            roomId: roomId,
            playerName: playerName
        });
        
        // Сохраняем состояние
        gameState.isHost = true;
        gameState.playerName = playerName;
        gameState.roomId = roomId;
        
    } catch (error) {
        console.error('❌ Ошибка создания комнаты:', error);
        showNotification('Не удалось подключиться к серверу', 'error');
    }
}

// ПРИСОЕДИНИТЬСЯ К КОМНАТЕ КАК ИГРОК
async function joinRoomAsPlayer() {
    console.log('🎮 Присоединяемся как игрок...');
    
    const playerName = playerNameInput ? playerNameInput.value.trim() : 'Игрок';
    const roomId = roomCodeInput ? roomCodeInput.value.trim() : '';
    
    if (!playerName) {
        showNotification('Введите ваше имя!', 'error');
        return;
    }
    
    if (!roomId) {
        showNotification('Введите ID комнаты!', 'error');
        return;
    }
    
    // Показываем загрузку
    showNotification('Подключаемся к серверу...', 'info');
    
    try {
        // Подключаемся к серверу
        await connectToServer();
        
        // Отправляем запрос на присоединение
        sendToServer('JOIN_ROOM', {
            roomId: roomId,
            playerName: playerName
        });
        
        // Сохраняем состояние
        gameState.isHost = false;
        gameState.playerName = playerName;
        gameState.roomId = roomId;
        
    } catch (error) {
        console.error('❌ Ошибка присоединения:', error);
        showNotification('Не удалось подключиться к серверу', 'error');
    }
}

// ========== ОБРАБОТКА ОТВЕТОВ ОТ СЕРВЕРА ==========

// КОМНАТА СОЗДАНА
function handleRoomCreated(data) {
    console.log('🏠 Комната создана:', data);
    
    gameState.playerId = data.playerId;
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем сообщение
    addMessage('system', data.message);
    addMessage('system', `ID комнаты: ${gameState.roomId}`);
    addMessage('system', 'Сообщите этот ID партнеру для подключения');
    
    showNotification('Комната создана!', 'success');
}

// ПРИСОЕДИНИЛИСЬ К КОМНАТЕ
function handleJoinedRoom(data) {
    console.log('✅ Присоединились к комнате:', data);
    
    gameState.playerId = data.playerId;
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем сообщение
    addMessage('system', data.message);
    addMessage('system', 'Ожидайте подтверждения от хоста...');
    
    showNotification('Успешно подключились!', 'success');
}

// ИГРОК ПОДКЛЮЧИЛСЯ
function handlePlayerConnected(data) {
    console.log('👤 Игрок подключился:', data);
    
    addMessage('system', data.message);
    
    // Обновляем список игроков
    updatePlayersList();
    
    // Активируем кнопку старта
    if (gameState.isHost) {
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = '🎮 Начать игру';
        }
    }
}

// НОВОЕ СООБЩЕНИЕ
function handleNewMessage(data) {
    console.log('💬 Новое сообщение:', data);
    
    addMessage('player', data.text, data.sender || 'Игрок');
}

// НОВАЯ КАРТОЧКА
function handleNewCard(data) {
    console.log('🎴 Новая карточка:', data);
    
    const typeLabels = {
        question: '💬 Вопрос',
        action: '🔥 Действие',
        date: '🌹 Свидание',
        compliment: '💖 Комплимент'
    };
    
    addMessage('system', `${typeLabels[data.type]}: ${data.text}`);
}

// ИГРА НАЧАЛАСЬ
function handleGameStarted(data) {
    console.log('🎮 Игра началась:', data);
    
    gameState.gameStarted = true;
    
    // Обновляем список игроков
    gameState.players = data.players;
    updatePlayersList();
    
    // Отключаем кнопку старта
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Игра идет...';
    }
    
    // Добавляем сообщения
    addMessage('system', data.message);
    addMessage('system', 'Теперь вы можете отправлять карточки и общаться!');
    
    // Показываем кнопки карточек
    const cardButtons = document.getElementById('card-buttons');
    if (cardButtons) {
        cardButtons.style.display = 'block';
    }
    
    showNotification('Игра началась! Удачи!', 'success');
}

// ОШИБКА
function handleError(data) {
    console.error('❌ Ошибка от сервера:', data);
    showNotification(data.message, 'error');
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Показать экран комнаты
function showRoomScreen() {
    console.log('🔄 Переключаемся на экран комнаты...');
    
    if (connectionScreen) connectionScreen.style.display = 'none';
    if (roomScreen) {
        roomScreen.style.display = 'block';
        
        // Обновляем информацию о комнате
        updateRoomInfo();
    }
}

// Обновить информацию о комнате
function updateRoomInfo() {
    const roomIdDisplay = document.getElementById('room-id-display');
    if (roomIdDisplay && gameState.roomId) {
        roomIdDisplay.textContent = gameState.roomId;
    }
    
    const statusElement = document.getElementById('room-status');
    if (statusElement) {
        statusElement.textContent = gameState.isHost ? 'Вы - Хост 👑' : 'Вы - Игрок 🎮';
    }
}

// Обновить список игроков
function updatePlayersList() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    playersList.innerHTML = '';
    
    // Хост всегда есть
    const hostDiv = document.createElement('div');
    hostDiv.className = 'player-item';
    hostDiv.innerHTML = `
        <div class="player-avatar">👑</div>
        <div class="player-info">
            <div class="player-name">${gameState.isHost ? gameState.playerName : 'Хост'}</div>
            <div class="player-status">✅ Подключен</div>
        </div>
    `;
    playersList.appendChild(hostDiv);
    
    // Второй игрок (если есть)
    if (gameState.players.length > 1 || !gameState.isHost) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <div class="player-avatar">👤</div>
            <div class="player-info">
                <div class="player-name">${!gameState.isHost ? gameState.playerName : 'Игрок'}</div>
                <div class="player-status">✅ Подключен</div>
            </div>
        `;
        playersList.appendChild(playerDiv);
    }
}

// Настроить кнопки в комнате
function setupRoomButtons() {
    console.log('🔧 Настраиваем кнопки в комнате...');
    
    // 1. Кнопка "Копировать код"
    const copyBtn = document.querySelector('.btn-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (gameState.roomId) {
                navigator.clipboard.writeText(gameState.roomId).then(() => {
                    showNotification('ID комнаты скопирован!', 'success');
                });
            }
        });
    }
    
    // 2. Кнопка "Начать игру"
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (gameState.isHost && gameState.roomId) {
                sendToServer('START_GAME', {
                    roomId: gameState.roomId
                });
            }
        });
    }
    
    // 3. Кнопка создания своей карточки
    const createCardBtn = document.getElementById('create-card-btn');
    if (createCardBtn) {
        createCardBtn.addEventListener('click', showCustomCardModal);
    }
    
    // 4. Кнопки карточек
    setupCardButtons();
}

// Настроить кнопки карточек
function setupCardButtons() {
    console.log('🎴 Настраиваем кнопки карточек...');
    
    const questionBtn = document.querySelector('.card-question');
    const actionBtn = document.querySelector('.card-action');
    const dateBtn = document.querySelector('.card-date');
    const complimentBtn = document.querySelector('.card-compliment');
    
    if (questionBtn) {
        questionBtn.addEventListener('click', () => sendRandomCard('question'));
        console.log('✅ Кнопка "Случайный вопрос" настроена');
    }
    
    if (actionBtn) {
        actionBtn.addEventListener('click', () => sendRandomCard('action'));
        console.log('✅ Кнопка "Случайное действие" настроена');
    }
    
    if (dateBtn) {
        dateBtn.addEventListener('click', () => sendRandomCard('date'));
        console.log('✅ Кнопка "Случайное свидание" настроена');
    }
    
    if (complimentBtn) {
        complimentBtn.addEventListener('click', () => sendRandomCompliment());
        console.log('✅ Кнопка "Случайный комплимент" настроена');
    }
}

// Отправить случайную карточку
function sendRandomCard(type) {
    console.log(`🎴 Отправляем случайную карточку типа: ${type}`);
    
    const cards = {
        question: [
            "💬 Какой твой самый счастливый момент из детства?",
            "💬 Если бы у тебя был миллион долларов, что бы ты сделал(а) первым делом?",
            "💬 О чем ты чаще всего мечтаешь перед сном?",
            "💬 Какая твоя самая странная привычка?",
            "💬 Если бы мы оказались на необитаемом острове, что бы ты взял(а) с собой?"
        ],
        action: [
            "🔥 Сделай комплимент партнеру прямо сейчас!",
            "🔥 Обними партнера и прошепчи что-то приятное на ушко",
            "🔥 Сделайте совместное селфи с самой глупой рожицей",
            "🔥 Напиши партнеру любовную записку и спрячь в его вещах",
            "🔥 Сделайте массаж друг другу в течение 5 минут"
        ],
        date: [
            "🌹 Представь, что у нас сегодня свидание. Куда бы ты меня пригласил(а)?",
            "🌹 Какое самое романтичное место в нашем городе ты знаешь?",
            "🌹 Если бы мы поехали в путешествие, куда бы ты хотел(а)?",
            "🌹 Какой идеальный вечер на двоих ты представляешь?",
            "🌹 Хочешь сходить на пикник в парк в эти выходные?"
        ]
    };
    
    if (cards[type]) {
        const randomCard = cards[type][Math.floor(Math.random() * cards[type].length)];
        
        // Отправляем на сервер
        sendToServer('SEND_CARD', {
            roomId: gameState.roomId,
            cardType: type,
            cardText: randomCard
        });
    }
}

// Отправить случайный комплимент
function sendRandomCompliment() {
    console.log('💖 Отправляем случайный комплимент');
    
    const compliments = [
        "💖 Твоя улыбка делает мой день лучше!",
        "💖 С тобой я чувствую себя самым счастливым человеком на свете!",
        "💖 Ты вдохновляешь меня становиться лучше каждый день!",
        "💖 Мне так повезло, что ты есть в моей жизни!",
        "💖 Ты самый удивительный человек, которого я когда-либо встречал(а)!",
        "💖 Твой смех - моя любимая мелодия!",
        "💖 Я так горжусь тобой и всем, что ты делаешь!",
        "💖 Ты понимаешь меня без слов - это бесценно!",
        "💖 С тобой даже обычный вечер становится особенным!",
        "💖 Твои глаза такие красивые, когда ты улыбаешься!"
    ];
    
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    // Отправляем как сообщение
    sendToServer('SEND_MESSAGE', {
        roomId: gameState.roomId,
        text: randomCompliment,
        sender: gameState.playerName
    });
}

// Отправить сообщение в чат
function sendChatMessage(customText = null) {
    console.log('💬 Отправляем сообщение в чат...');
    
    const messageText = customText || (chatInput ? chatInput.value.trim() : '');
    
    if (!messageText) {
        showNotification('Введите сообщение!', 'error');
        return;
    }
    
    // Отправляем на сервер
    const success = sendToServer('SEND_MESSAGE', {
        roomId: gameState.roomId,
        text: messageText,
        sender: gameState.playerName
    });
    
    // Очищаем поле ввода
    if (success && chatInput && !customText) {
        chatInput.value = '';
        chatInput.focus();
    }
}

// Показать модальное окно создания карточки
function showCustomCardModal() {
    console.log('✨ Показываем окно создания карточки');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>✨ Создать свою карточку</h2>
            
            <div class="custom-card-form">
                <div class="form-group">
                    <label>Тип карточки:</label>
                    <select id="card-type" class="form-select">
                        <option value="question">💬 Вопрос</option>
                        <option value="action">🔥 Действие</option>
                        <option value="date">🌹 Свидание</option>
                        <option value="compliment">💖 Комплимент</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Текст карточки:</label>
                    <textarea id="custom-card-text" placeholder="Напишите вашу карточку..." maxlength="200" rows="4"></textarea>
                    <div class="char-counter">Осталось: <span id="char-count">200</span> символов</div>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button id="send-custom-card" class="primary-button">📤 Отправить карточку</button>
                <button id="close-custom-modal" class="secondary-button">✖️ Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики для модального окна
    const closeBtn = modal.querySelector('#close-custom-modal');
    const sendBtn = modal.querySelector('#send-custom-card');
    const textArea = modal.querySelector('#custom-card-text');
    const charCount = modal.querySelector('#char-count');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const type = modal.querySelector('#card-type').value;
            const text = textArea.value.trim();
            
            if (!text) {
                showNotification('Введите текст карточки!', 'error');
                return;
            }
            
            // Отправляем на сервер
            sendToServer('SEND_CARD', {
                roomId: gameState.roomId,
                cardType: type,
                cardText: text
            });
            
            modal.remove();
            showNotification('Ваша карточка отправлена!', 'success');
        });
    }
    
    if (textArea && charCount) {
        textArea.addEventListener('input', () => {
            const remaining = 200 - textArea.value.length;
            charCount.textContent = remaining;
            charCount.style.color = remaining < 30 ? '#f44336' : '#666';
        });
    }
    
    // Закрытие по клику вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Добавить сообщение
function addMessage(type, text, sender = null) {
    const message = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: text,
        type: type,
        sender: sender || (type === 'system' ? 'Система' : gameState.playerName),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    // Отображаем в чате
    displayMessage(message);
}

// Отобразить сообщение
function displayMessage(message) {
    if (!chatMessages) return;
    
    // Проверяем, не отображали ли уже это сообщение
    const existingMessage = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.dataset.messageId = message.id;
    
    messageDiv.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.text}</div>
        <div class="message-time">${message.time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    console.log(`📢 Уведомление (${type}): ${message}`);
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        font-family: Arial, sans-serif;
    }
`;
document.head.appendChild(style);
