// online-local.js
// Локальный онлайн-режим для тестирования на одном компьютере

console.log('✅ Локальный онлайн-режим загружен');

// Состояние игры
let gameState = {
    roomCode: null,
    players: [],
    currentPlayer: null,
    messages: [],
    isHost: false,
    gameStarted: false
};

// DOM элементы
let connectionScreen, roomScreen;
let player1NameInput, player2NameInput, roomCodeInput;
let chatMessages, chatInput, chatSendBtn;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Локальный онлайн-режим запускается...');
    
    // Находим все нужные элементы
    connectionScreen = document.getElementById('connection-screen');
    roomScreen = document.getElementById('room-screen');
    
    player1NameInput = document.getElementById('player1-name');
    player2NameInput = document.getElementById('player2-name');
    roomCodeInput = document.getElementById('room-code');
    
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    chatSendBtn = document.querySelector('.chat-send');
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    console.log('✅ Локальный режим готов');
});

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('🔧 Настраиваем обработчики...');
    
    // 1. Кнопка "Создать игру"
    const createBtn = document.querySelector('.player-card.create-room .btn-primary');
    if (createBtn) {
        createBtn.addEventListener('click', createRoom);
        console.log('✅ Кнопка "Создать игру" настроена');
    }
    
    // 2. Кнопка "Присоединиться"
    const joinBtn = document.querySelector('.player-card.join-room .btn-secondary');
    if (joinBtn) {
        joinBtn.addEventListener('click', joinRoom);
        console.log('✅ Кнопка "Присоединиться" настроена');
    }
    
    // 3. Кнопка "Быстрый старт"
    const quickBtn = document.querySelector('.btn-quick-start');
    if (quickBtn) {
        quickBtn.addEventListener('click', quickStartGame);
        console.log('✅ Кнопка "Быстрый старт" настроена');
    }
    
    // 4. Кнопка отправки сообщения
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendChatMessage);
    }
    
    // 5. Enter в поле чата
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // 6. Кнопки в комнате
    setupRoomButtons();
}

// Создание комнаты
function createRoom() {
    console.log('🎮 Создаем комнату...');
    
    const playerName = player1NameInput.value.trim() || 'Игрок 1';
    
    if (!playerName) {
        showNotification('Введите ваше имя!', 'error');
        return;
    }
    
    // Генерируем случайный код комнаты (4 буквы)
    const roomCode = generateRoomCode();
    
    // Обновляем состояние
    gameState.roomCode = roomCode;
    gameState.isHost = true;
    gameState.players = [{
        id: 'player1',
        name: playerName,
        isReady: true,
        isHost: true
    }];
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем системное сообщение
    addSystemMessage(`Комната создана! Код: ${roomCode}`);
    addSystemMessage('Откройте вторую вкладку браузера и введите этот код');
    
    console.log(`✅ Комната создана: ${roomCode}`);
}

// Присоединение к комнате
function joinRoom() {
    console.log('🎮 Присоединяемся к комнате...');
    
    const playerName = player2NameInput.value.trim() || 'Игрок 2';
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    
    if (!playerName) {
        showNotification('Введите ваше имя!', 'error');
        return;
    }
    
    if (!roomCode || roomCode.length !== 4) {
        showNotification('Введите код комнаты (4 символа)', 'error');
        return;
    }
    
    // В локальном режиме всегда успешное подключение
    gameState.roomCode = roomCode;
    gameState.isHost = false;
    gameState.players = [
        {
            id: 'player1',
            name: 'Хост',
            isReady: true,
            isHost: true
        },
        {
            id: 'player2',
            name: playerName,
            isReady: true,
            isHost: false
        }
    ];
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем системное сообщение
    addSystemMessage(`Вы присоединились к комнате ${roomCode}`);
    addSystemMessage('Теперь вы можете общаться и играть!');
    
    console.log(`✅ Игрок присоединился к комнате: ${roomCode}`);
}

// Быстрый старт
function quickStartGame() {
    console.log('⚡ Быстрый старт...');
    
    const playerName = player1NameInput.value.trim() || 'Игрок 1';
    const roomCode = generateRoomCode();
    
    // Создаем комнату
    createRoom();
    
    // Показываем QR код
    setTimeout(() => {
        showQRCode(roomCode);
        showNotification('Покажите QR-код партнеру для быстрого подключения', 'success');
    }, 500);
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
    if (roomIdDisplay && gameState.roomCode) {
        roomIdDisplay.textContent = gameState.roomCode;
    }
    
    // Обновляем информацию об игроках
    updatePlayersDisplay();
}

// Обновить отображение игроков
function updatePlayersDisplay() {
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const status1 = document.getElementById('status1');
    const status2 = document.getElementById('status2');
    
    if (player1Element && gameState.players[0]) {
        const playerName = player1Element.querySelector('.player-name');
        if (playerName) playerName.textContent = gameState.players[0].name;
        if (status1) status1.textContent = '✅';
    }
    
    if (player2Element && gameState.players[1]) {
        const playerName = player2Element.querySelector('.player-name');
        if (playerName) playerName.textContent = gameState.players[1].name;
        if (status2) status2.textContent = '✅';
    } else if (player2Element) {
        const playerName = player2Element.querySelector('.player-name');
        if (playerName) playerName.textContent = 'Ожидание...';
        if (status2) status2.textContent = '❌';
    }
    
    // Активируем кнопку "Начать игру" если есть оба игрока
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = gameState.players.length < 2;
    }
}

// Настроить кнопки в комнате
function setupRoomButtons() {
    console.log('🔧 Настраиваем кнопки в комнате...');
    
    // 1. Кнопка "Копировать код"
    const copyBtn = document.querySelector('.btn-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (gameState.roomCode) {
                navigator.clipboard.writeText(gameState.roomCode).then(() => {
                    showNotification('Код комнаты скопирован!', 'success');
                });
            }
        });
    }
    
    // 2. Кнопка "Показать QR-код"
    const qrBtn = document.querySelector('.btn-qr');
    if (qrBtn) {
        qrBtn.addEventListener('click', function() {
            if (gameState.roomCode) {
                showQRCode(gameState.roomCode);
            }
        });
    }
    
    // 3. Кнопка "Начать игру"
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    // 4. Кнопки управления игроками
    const readyBtn = document.querySelector('.btn-ready');
    const partnerBtn = document.querySelector('.btn-partner');
    const forceBtn = document.querySelector('.btn-force-start');
    
    if (readyBtn) readyBtn.addEventListener('click', markSelfReady);
    if (partnerBtn) partnerBtn.addEventListener('click', confirmPartnerConnection);
    if (forceBtn) forceBtn.addEventListener('click', forceStartGame);
    
    // 5. Кнопки карточек
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
        sendChatMessage(randomCard, 'system');
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
    sendChatMessage(randomCompliment, 'player');
}

// Отправить сообщение в чат
function sendChatMessage(customText = null, senderType = 'player') {
    console.log('💬 Отправляем сообщение в чат...');
    
    const messageText = customText || chatInput.value.trim();
    
    if (!messageText) {
        showNotification('Введите сообщение!', 'error');
        return;
    }
    
    // Создаем сообщение
    const message = {
        text: messageText,
        sender: senderType === 'player' ? (gameState.isHost ? 'Игрок 1' : 'Игрок 2') : 'Система',
        type: senderType,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    // Добавляем в историю
    gameState.messages.push(message);
    
    // Отображаем в чате
    displayMessage(message);
    
    // Очищаем поле ввода (только если это не системное сообщение)
    if (!customText && chatInput) {
        chatInput.value = '';
        chatInput.focus();
    }
    
    console.log('✅ Сообщение отправлено:', messageText);
}

// Отобразить сообщение в чате
function displayMessage(message) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    messageDiv.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.text}</div>
        <div class="message-time">${message.time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Добавить системное сообщение
function addSystemMessage(text) {
    sendChatMessage(text, 'system');
}

// Управление игроками
function markSelfReady() {
    console.log('✅ Игрок готов');
    showNotification('Вы готовы к игре!', 'success');
    addSystemMessage('Игрок отметился как готовый к игре');
}

function confirmPartnerConnection() {
    console.log('👋 Подтверждаем подключение партнера');
    
    // В локальном режиме просто добавляем второго игрока
    if (gameState.players.length === 1) {
        gameState.players.push({
            id: 'player2',
            name: 'Игрок 2',
            isReady: true,
            isHost: false
        });
        updatePlayersDisplay();
        addSystemMessage('Партнер подключился!');
    }
    
    showNotification('Партнер подключен!', 'success');
}

function forceStartGame() {
    console.log('🚀 Принудительно начинаем игру');
    
    if (gameState.players.length === 1) {
        confirmPartnerConnection();
    }
    
    startGame();
}

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
    
    addSystemMessage('🎮 Игра началась!');
    addSystemMessage('Теперь вы можете отправлять друг другу карточки и общаться!');
    
    // Отправляем первую карточку
    setTimeout(() => {
        sendRandomCard('question');
    }, 1000);
    
    showNotification('Игра началась! Удачи!', 'success');
}

// Вспомогательные функции
function generateRoomCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

function showQRCode(roomCode) {
    console.log('📱 Показываем QR-код для комнаты:', roomCode);
    
    const qrModal = document.getElementById('qr-modal');
    const qrCodeDiv = document.getElementById('qr-code');
    
    if (!qrModal || !qrCodeDiv) return;
    
    // Используем Google Charts API для генерации QR кода
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(roomCode)}&choe=UTF-8`;
    
    qrCodeDiv.innerHTML = `
        <div style="text-align: center;">
            <img src="${qrUrl}" alt="QR Code" style="border: 10px solid white; border-radius: 10px;">
            <p style="margin-top: 15px; font-weight: bold; color: #9C27B0;">${roomCode}</p>
            <p style="color: #666; font-size: 14px;">Отсканируйте QR-код или введите код вручную</p>
        </div>
    `;
    
    qrModal.style.display = 'flex';
    
    // Кнопка закрытия
    const closeBtn = qrModal.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            qrModal.style.display = 'none';
        };
    }
    
    // Закрытие по клику вне окна
    qrModal.onclick = function(e) {
        if (e.target === qrModal) {
            qrModal.style.display = 'none';
        }
    };
}

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

// Добавляем стили для анимаций
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
