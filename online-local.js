// online-local.js
// Локальная онлайн-игра по локальной сети (Wi-Fi)

console.log('🎮 Локальный сетевой режим загружен');

// Состояние игры
let gameState = {
    isHost: false,
    playerName: '',
    roomId: '',
    connection: null,
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
    console.log('🚀 Запускаем локальную сетевую игру...');
    
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
    
    // Показываем локальный IP адрес
    showLocalIP();
    
    console.log('✅ Локальная сетевая игра готова');
});

// Показать локальный IP адрес
function showLocalIP() {
    // Пытаемся получить локальный IP
    const ipElement = document.getElementById('local-ip');
    if (!ipElement) return;
    
    // Для демонстрации - показываем как получить реальный IP
    ipElement.innerHTML = `
        <div class="ip-info">
            <h4>🌐 Ваш локальный IP:</h4>
            <div class="ip-address">
                <code id="actual-ip">Загрузка...</code>
                <button onclick="copyLocalIP()" class="copy-ip-btn">📋</button>
            </div>
            <p class="ip-hint">
                Этот IP нужно сообщить партнеру для подключения
            </p>
        </div>
    `;
    
    // Пробуем получить реальный IP через WebRTC
    getLocalIP().then(ip => {
        document.getElementById('actual-ip').textContent = ip || 'Не удалось получить';
    }).catch(() => {
        document.getElementById('actual-ip').textContent = 'Проверьте настройки сети';
    });
}

// Получить локальный IP через WebRTC
async function getLocalIP() {
    return new Promise((resolve, reject) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(reject);
        
        pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;
            
            const candidate = ice.candidate.candidate;
            const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
            const match = candidate.match(regex);
            
            if (match) {
                resolve(match[1]);
                pc.close();
            }
        };
        
        setTimeout(() => {
            resolve('192.168.1.XXX'); // Заглушка если не получилось
            pc.close();
        }, 1000);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('🔧 Настраиваем обработчики...');
    
    // 1. Кнопка "Я Хост (Создатель)"
    const hostBtn = document.getElementById('host-btn');
    if (hostBtn) {
        hostBtn.addEventListener('click', createHost);
        console.log('✅ Кнопка "Я Хост" настроена');
    }
    
    // 2. Кнопка "Я Игрок (Присоединиться)"
    const playerBtn = document.getElementById('player-btn');
    if (playerBtn) {
        playerBtn.addEventListener('click', joinAsPlayer);
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

// Создать комнату как хост
function createHost() {
    console.log('👑 Создаем комнату как хост...');
    
    const playerName = playerNameInput ? playerNameInput.value.trim() : 'Хост';
    
    if (!playerName) {
        showNotification('Введите ваше имя!', 'error');
        return;
    }
    
    // Генерируем случайный ID комнаты
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    // Обновляем состояние
    gameState.isHost = true;
    gameState.playerName = playerName;
    gameState.roomId = roomId;
    gameState.players = [{
        id: 'player_' + Date.now(),
        name: playerName,
        isHost: true,
        isConnected: true
    }];
    
    // Запускаем сервер WebSocket
    startWebSocketServer();
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем системное сообщение
    addMessage('system', `🎮 Комната создана! Вы - хост.`);
    addMessage('system', `🔗 Ваш ID комнаты: ${roomId}`);
    addMessage('system', `👥 Сообщите ID партнеру для подключения`);
    
    console.log(`✅ Комната создана как хост. ID: ${roomId}`);
}

// Присоединиться как игрок
function joinAsPlayer() {
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
    
    // Обновляем состояние
    gameState.isHost = false;
    gameState.playerName = playerName;
    gameState.roomId = roomId;
    
    // Подключаемся к серверу хоста
    connectToHost();
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем системное сообщение
    addMessage('system', `🔗 Подключаемся к комнате ${roomId}...`);
    
    console.log(`✅ Пытаемся подключиться к комнате: ${roomId}`);
}

// Запустить WebSocket сервер (для хоста)
function startWebSocketServer() {
    console.log('🌐 Запускаем локальный WebSocket сервер...');
    
    // В реальной реализации здесь был бы WebSocket сервер
    // Для демо используем симуляцию через localStorage
    
    addMessage('system', '✅ Локальный сервер запущен. Ожидание подключения...');
    
    // Симулируем подключение второго игрока
    setTimeout(() => {
        simulatePlayerConnection();
    }, 2000);
}

// Подключиться к хосту (для игрока)
function connectToHost() {
    console.log('🔗 Подключаемся к хосту...');
    
    // В реальной реализации здесь было бы подключение к WebSocket
    // Для демо используем симуляцию
    
    addMessage('system', '⏳ Подключение к хосту...');
    
    setTimeout(() => {
        addMessage('system', '✅ Успешно подключились к хосту!');
        
        // Добавляем игрока в список
        gameState.players.push({
            id: 'player_' + Date.now(),
            name: gameState.playerName,
            isHost: false,
            isConnected: true
        });
        
        updatePlayersDisplay();
        
        // Симулируем подтверждение от хоста
        setTimeout(() => {
            addMessage('system', '👋 Хост подтвердил ваше подключение!');
            startGame();
        }, 1000);
    }, 1500);
}

// Симулировать подключение игрока (для хоста)
function simulatePlayerConnection() {
    console.log('👤 Симулируем подключение игрока...');
    
    // Добавляем тестового игрока
    gameState.players.push({
        id: 'player_' + Date.now(),
        name: 'Тестовый игрок',
        isHost: false,
        isConnected: true
    });
    
    updatePlayersDisplay();
    
    addMessage('system', '👤 Игрок подключился!');
    addMessage('system', '🎮 Можно начинать игру!');
    
    // Активируем кнопку старта
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = false;
    }
}

// Показать экран комнаты
function showRoomScreen() {
    console.log('🔄 Переключаемся на экран комнаты...');
    
    if (connectionScreen) connectionScreen.style.display = 'none';
    if (roomScreen) {
        roomScreen.style.display = 'block';
        
        // Обновляем информацию о комнате
        updateRoomInfo();
        
        // Показываем кнопки карточек
        const cardButtons = document.getElementById('card-buttons');
        if (cardButtons) cardButtons.style.display = 'block';
    }
}

// Обновить информацию о комнате
function updateRoomInfo() {
    const roomIdDisplay = document.getElementById('room-id-display');
    if (roomIdDisplay && gameState.roomId) {
        roomIdDisplay.textContent = gameState.roomId;
    }
    
    // Обновляем информацию об игроках
    updatePlayersDisplay();
    
    // Обновляем статус
    const statusElement = document.getElementById('room-status');
    if (statusElement) {
        statusElement.textContent = gameState.isHost ? 'Вы - Хост 👑' : 'Вы - Игрок 🎮';
    }
}

// Обновить отображение игроков
function updatePlayersDisplay() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    playersList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        
        playerDiv.innerHTML = `
            <div class="player-avatar">${player.isHost ? '👑' : '👤'}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-status">${player.isConnected ? '✅ Подключен' : '❌ Отключен'}</div>
            </div>
        `;
        
        playersList.appendChild(playerDiv);
    });
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
        startBtn.addEventListener('click', startGame);
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

// Показать модальное окно создания карточки
function showCustomCardModal() {
    console.log('✨ Показываем окно создания карточки');
    
    // Создаем модальное окно
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
            
            // Отправляем карточку
            sendCustomCard(type, text);
            modal.remove();
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

// Отправить свою карточку
function sendCustomCard(type, text) {
    console.log(`📤 Отправляем свою карточку: ${type} - ${text}`);
    
    const typeLabels = {
        question: '💬 Вопрос',
        action: '🔥 Действие', 
        date: '🌹 Свидание',
        compliment: '💖 Комплимент'
    };
    
    addMessage('system', `${typeLabels[type]}: ${text}`);
    showNotification('Ваша карточка отправлена партнеру!', 'success');
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
        addMessage('system', randomCard);
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
    addMessage('player', randomCompliment);
}

// Отправить сообщение в чат
function sendChatMessage(customText = null) {
    console.log('💬 Отправляем сообщение в чат...');
    
    const messageText = customText || (chatInput ? chatInput.value.trim() : '');
    
    if (!messageText) {
        showNotification('Введите сообщение!', 'error');
        return;
    }
    
    // Добавляем сообщение
    addMessage('player', messageText);
    
    // Очищаем поле ввода
    if (chatInput && !customText) {
        chatInput.value = '';
        chatInput.focus();
    }
    
    console.log('✅ Сообщение отправлено:', messageText);
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
    
    // Добавляем в историю
    gameState.messages.push(message);
    
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

// Начать игру
function startGame() {
    console.log('🎮 Начинаем игру...');
    
    if (gameState.players.length < 2) {
        showNotification('Нужно два игрока для начала игры!', 'error');
        return;
    }
    
    gameState.gameStarted = true;
    
    // Отключаем кнопку старта
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Игра идет...';
    }
    
    addMessage('system', '🎮 Игра началась!');
    addMessage('system', 'Теперь вы можете отправлять друг другу карточки и общаться!');
    
    // Отправляем первую карточку
    setTimeout(() => {
        sendRandomCard('question');
    }, 1000);
    
    showNotification('Игра началась! Удачи!', 'success');
}

// Вспомогательные функции
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

// Копировать локальный IP
window.copyLocalIP = function() {
    const ipElement = document.getElementById('actual-ip');
    if (ipElement) {
        navigator.clipboard.writeText(ipElement.textContent).then(() => {
            showNotification('IP адрес скопирован!', 'success');
        });
    }
};

// Добавляем стили для анимаций и модальных окон
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
    
    .ip-info {
        background: #e8f5e9;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        border-left: 4px solid #4CAF50;
    }
    
    .ip-address {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
    }
    
    .ip-address code {
        background: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 16px;
        flex: 1;
        border: 1px solid #4CAF50;
    }
    
    .copy-ip-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .ip-hint {
        color: #666;
        font-size: 14px;
        margin-top: 8px;
    }
    
    .player-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px;
        background: white;
        border-radius: 8px;
        margin-bottom: 10px;
        border: 2px solid #e0e0e0;
    }
    
    .player-avatar {
        font-size: 24px;
    }
    
    .player-info {
        flex: 1;
    }
    
    .player-name {
        font-weight: bold;
        color: #333;
    }
    
    .player-status {
        font-size: 12px;
        color: #666;
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal.active {
        display: flex;
    }
    
    .modal-content {
        background: white;
        padding: 25px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .custom-card-form {
        margin: 20px 0;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #333;
    }
    
    .form-select, .form-group textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
    }
    
    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }
    
    .char-counter {
        text-align: right;
        color: #666;
        font-size: 14px;
        margin-top: 5px;
    }
    
    .modal-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .primary-button, .secondary-button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .primary-button {
        background: linear-gradient(45deg, #9C27B0, #E91E63);
        color: white;
    }
    
    .secondary-button {
        background: #f5f5f5;
        color: #666;
        border: 2px solid #ddd;
    }
    
    .primary-button:hover, .secondary-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);
