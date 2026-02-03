// online-local.js
// Локальный онлайн-режим для тестирования на одном компьютере
// Использует LocalStorage для общения между вкладками

console.log('✅ Локальный онлайн-режим загружен');

// Состояние игры
let gameState = {
    roomCode: null,
    playerName: '',
    playerId: generatePlayerId(),
    isHost: false,
    messages: [],
    players: []
};

// DOM элементы
let connectionScreen, roomScreen;
let player1NameInput, player2NameInput, roomCodeInput;
let chatMessages, chatInput, chatSendBtn;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Локальный онлайн-режим запускается...');
    
    // Генерируем уникальный ID игрока
    gameState.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
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
    
    // Проверяем, не открыта ли уже комната
    checkExistingRoom();
    
    // Запускаем слушатель сообщений
    startMessageListener();
    
    console.log('✅ Локальный режим готов. ID игрока:', gameState.playerId);
});

// Проверить, не открыта ли уже комната
function checkExistingRoom() {
    const savedRoom = localStorage.getItem('localRoomCode');
    const savedPlayer = localStorage.getItem('localPlayerName');
    
    if (savedRoom && savedPlayer) {
        console.log('📂 Найдена сохраненная комната:', savedRoom);
        gameState.roomCode = savedRoom;
        gameState.playerName = savedPlayer;
        showRoomScreen();
        loadRoomData();
    }
}

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
    
    // Сохраняем в LocalStorage
    localStorage.setItem('localRoomCode', roomCode);
    localStorage.setItem('localPlayerName', playerName);
    localStorage.setItem('localIsHost', 'true');
    
    // Обновляем состояние
    gameState.roomCode = roomCode;
    gameState.playerName = playerName;
    gameState.isHost = true;
    gameState.messages = [];
    
    // Создаем данные комнаты в LocalStorage
    const roomData = {
        roomCode: roomCode,
        hostName: playerName,
        hostId: gameState.playerId,
        hostReady: true,
        player2Name: '',
        player2Id: '',
        player2Ready: false,
        messages: [],
        players: [{id: gameState.playerId, name: playerName, isReady: true, isHost: true}],
        gameStarted: false
    };
    
    localStorage.setItem('localRoom_' + roomCode, JSON.stringify(roomData));
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем системное сообщение
    addMessageToStorage('system', `Комната создана! Код: ${roomCode}`);
    addMessageToStorage('system', 'Откройте вторую вкладку браузера и введите этот код');
    
    // Загружаем данные комнаты
    loadRoomData();
    
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
    
    // Проверяем, существует ли комната
    const roomData = localStorage.getItem('localRoom_' + roomCode);
    if (!roomData) {
        showNotification('Комната не найдена! Создайте комнату сначала', 'error');
        return;
    }
    
    // Сохраняем в LocalStorage
    localStorage.setItem('localRoomCode', roomCode);
    localStorage.setItem('localPlayerName', playerName);
    localStorage.setItem('localIsHost', 'false');
    
    // Обновляем состояние
    gameState.roomCode = roomCode;
    gameState.playerName = playerName;
    gameState.isHost = false;
    
    // Обновляем данные комнаты
    const room = JSON.parse(roomData);
    room.player2Name = playerName;
    room.player2Id = gameState.playerId;
    room.player2Ready = true;
    room.players.push({id: gameState.playerId, name: playerName, isReady: true, isHost: false});
    
    localStorage.setItem('localRoom_' + roomCode, JSON.stringify(room));
    
    // Показываем комнату
    showRoomScreen();
    
    // Добавляем системное сообщение
    addMessageToStorage('system', `Игрок ${playerName} присоединился к комнате`);
    
    // Загружаем данные комнаты
    loadRoomData();
    
    // Сообщаем хосту о подключении
    addMessageToStorage('system', `🎉 ${playerName} присоединился(ась) к игре!`);
    
    console.log(`✅ Игрок присоединился к комнате: ${roomCode}`);
}

// Загрузить данные комнаты
function loadRoomData() {
    if (!gameState.roomCode) return;
    
    const roomData = localStorage.getItem('localRoom_' + gameState.roomCode);
    if (!roomData) return;
    
    const room = JSON.parse(roomData);
    
    // Обновляем состояние
    gameState.messages = room.messages || [];
    gameState.players = room.players || [];
    
    // Обновляем UI
    updateRoomInfo();
    updatePlayersDisplay();
    displayAllMessages();
    
    // Показываем кнопки карточек
    const cardButtons = document.getElementById('card-buttons');
    if (cardButtons) cardButtons.style.display = 'block';
    
    // Обновляем кнопку старта
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = room.gameStarted || gameState.players.length < 2;
        if (room.gameStarted) {
            startBtn.textContent = 'Игра идет...';
        }
    }
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
    }
}

// Обновить информацию о комнате
function updateRoomInfo() {
    const roomIdDisplay = document.getElementById('room-id-display');
    if (roomIdDisplay && gameState.roomCode) {
        roomIdDisplay.textContent = gameState.roomCode;
    }
}

// Обновить отображение игроков
function updatePlayersDisplay() {
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const status1 = document.getElementById('status1');
    const status2 = document.getElementById('status2');
    
    if (player1Element) {
        const playerName = player1Element.querySelector('.player-name');
        if (playerName) {
            const host = gameState.players.find(p => p.isHost);
            playerName.textContent = host ? host.name : 'Хост';
        }
        if (status1) status1.textContent = '✅';
    }
    
    if (player2Element) {
        const playerName = player2Element.querySelector('.player-name');
        if (playerName) {
            const player2 = gameState.players.find(p => !p.isHost);
            playerName.textContent = player2 ? player2.name : 'Ожидание...';
        }
        if (status2) {
            const player2 = gameState.players.find(p => !p.isHost);
            status2.textContent = player2 ? '✅' : '❌';
        }
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

// ==================== РАБОТА С СООБЩЕНИЯМИ ====================

// Добавить сообщение в хранилище
function addMessageToStorage(type, text, senderName = null) {
    if (!gameState.roomCode) return;
    
    const message = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: text,
        type: type,
        sender: senderName || (type === 'system' ? 'Система' : gameState.playerName),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        playerId: gameState.playerId
    };
    
    // Загружаем текущие данные комнаты
    const roomData = localStorage.getItem('localRoom_' + gameState.roomCode);
    if (roomData) {
        const room = JSON.parse(roomData);
        room.messages = room.messages || [];
        room.messages.push(message);
        
        // Сохраняем обратно
        localStorage.setItem('localRoom_' + gameState.roomCode, JSON.stringify(room));
        
        // Обновляем локальное состояние
        gameState.messages = room.messages;
        
        // Отображаем сообщение
        displayMessage(message);
        
        // Триггерим событие для других вкладок
        localStorage.setItem('localMessageTrigger_' + gameState.roomCode, Date.now().toString());
    }
}

// Запустить слушатель сообщений
function startMessageListener() {
    // Слушаем изменения в LocalStorage
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('localRoom_')) {
            // Если изменились данные комнаты, загружаем их
            loadRoomData();
        }
        
        if (e.key && e.key === 'localMessageTrigger_' + gameState.roomCode) {
            // Если кто-то отправил сообщение, загружаем новые сообщения
            loadRoomData();
        }
    });
    
    // Также периодически проверяем обновления
    setInterval(() => {
        if (gameState.roomCode) {
            loadRoomData();
        }
    }, 1000);
}

// Отобразить все сообщения
function displayAllMessages() {
    if (!chatMessages) return;
    
    // Очищаем чат
    chatMessages.innerHTML = '';
    
    // Показываем все сообщения
    gameState.messages.forEach(message => {
        displayMessage(message);
    });
    
    // Прокручиваем вниз
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Отобразить одно сообщение
function displayMessage(message) {
    if (!chatMessages) return;
    
    // Проверяем, не отображали ли уже это сообщение
    const existingMessage = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.dataset.messageId = message.id;
    
    // Определяем отправителя
    let senderName = message.sender;
    if (message.type === 'player') {
        if (message.playerId === gameState.playerId) {
            senderName = gameState.playerName;
        } else {
            // Это сообщение от другого игрока
            const otherPlayer = gameState.players.find(p => p.id === message.playerId && p.id !== gameState.playerId);
            senderName = otherPlayer ? otherPlayer.name : 'Другой игрок';
        }
    }
    
    messageDiv.innerHTML = `
        <div class="message-sender">${senderName}</div>
        <div class="message-text">${message.text}</div>
        <div class="message-time">${message.time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==================== ФУНКЦИОНАЛ КАРТОЧЕК ====================

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
        addMessageToStorage('system', randomCard);
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
    addMessageToStorage('player', randomCompliment);
}

// Отправить сообщение в чат
function sendChatMessage(customText = null) {
    console.log('💬 Отправляем сообщение в чат...');
    
    const messageText = customText || (chatInput ? chatInput.value.trim() : '');
    
    if (!messageText) {
        showNotification('Введите сообщение!', 'error');
        return;
    }
    
    // Добавляем сообщение в хранилище
    addMessageToStorage('player', messageText);
    
    // Очищаем поле ввода
    if (chatInput && !customText) {
        chatInput.value = '';
        chatInput.focus();
    }
    
    console.log('✅ Сообщение отправлено:', messageText);
}

// ==================== УПРАВЛЕНИЕ ИГРОЙ ====================

// Управление игроками
function markSelfReady() {
    console.log('✅ Игрок готов');
    
    if (!gameState.roomCode) return;
    
    const roomData = localStorage.getItem('localRoom_' + gameState.roomCode);
    if (roomData) {
        const room = JSON.parse(roomData);
        
        // Обновляем статус игрока
        const playerIndex = room.players.findIndex(p => p.id === gameState.playerId);
        if (playerIndex !== -1) {
            room.players[playerIndex].isReady = true;
            localStorage.setItem('localRoom_' + gameState.roomCode, JSON.stringify(room));
            
            // Триггерим обновление
            localStorage.setItem('localMessageTrigger_' + gameState.roomCode, Date.now().toString());
        }
    }
    
    addMessageToStorage('system', `${gameState.playerName} готов(а) к игре`);
    showNotification('Вы готовы к игре!', 'success');
}

function confirmPartnerConnection() {
    console.log('👋 Подтверждаем подключение партнера');
    
    if (!gameState.roomCode || !gameState.isHost) return;
    
    const roomData = localStorage.getItem('localRoom_' + gameState.roomCode);
    if (roomData) {
        const room = JSON.parse(roomData);
        
        // Если нет второго игрока, добавляем тестового
        if (room.players.length < 2) {
            room.players.push({
                id: 'test_player_' + Date.now(),
                name: 'Тестовый партнер',
                isReady: true,
                isHost: false
            });
            
            localStorage.setItem('localRoom_' + gameState.roomCode, JSON.stringify(room));
            localStorage.setItem('localMessageTrigger_' + gameState.roomCode, Date.now().toString());
        }
    }
    
    loadRoomData();
    addMessageToStorage('system', 'Партнер подключился!');
    showNotification('Партнер подключен!', 'success');
}

function forceStartGame() {
    console.log('🚀 Принудительно начинаем игру');
    
    if (!gameState.roomCode) return;
    
    // Обновляем статус игры
    const roomData = localStorage.getItem('localRoom_' + gameState.roomCode);
    if (roomData) {
        const room = JSON.parse(roomData);
        room.gameStarted = true;
        localStorage.setItem('localRoom_' + gameState.roomCode, JSON.stringify(room));
        
        // Триггерим обновление
        localStorage.setItem('localMessageTrigger_' + gameState.roomCode, Date.now().toString());
    }
    
    startGame();
}

function startGame() {
    console.log('🎮 Начинаем игру...');
    
    if (!gameState.roomCode) return;
    
    // Проверяем, есть ли второй игрок
    const roomData = localStorage.getItem('localRoom_' + gameState.roomCode);
    if (roomData) {
        const room = JSON.parse(roomData);
        
        if (room.players.length < 2) {
            showNotification('Нужно два игрока для начала игры!', 'error');
            return;
        }
        
        // Обновляем статус игры
        room.gameStarted = true;
        localStorage.setItem('localRoom_' + gameState.roomCode, JSON.stringify(room));
    }
    
    // Обновляем UI
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Игра идет...';
    }
    
    addMessageToStorage('system', '🎮 Игра началась!');
    addMessageToStorage('system', 'Теперь вы можете отправлять друг другу карточки и общаться!');
    
    // Отправляем первую карточку
    setTimeout(() => {
        sendRandomCard('question');
    }, 1000);
    
    showNotification('Игра началась! Удачи!', 'success');
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function generateRoomCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
