// firebase-mode.js - Реальный онлайн-режим через Firebase

// ТВОЯ КОНФИГУРАЦИЯ (ВСТАВЬ ЕЁ СЮДА!)
const firebaseConfig = {
  apiKey: "AIzaSyAIsICrK63Q9umIuFHyu7zted9kBiCIne8",
  authDomain: "lovedeck-71787.firebaseapp.com",
  databaseURL: "https://lovedeck-71787-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lovedeck-71787",
  storageBucket: "lovedeck-71787.firebasestorage.app",
  messagingSenderId: "867802574115",
  appId: "1:867802574115:web:1458f7ded97cdf6824b096"
};

console.log('🔥 Firebase конфигурация загружена');

// Глобальные переменные
let currentRoomId = null;
let playerName = '';
let isHost = false;
let playerId = '';
let database = null;
let roomRef = null;
let messagesRef = null;

// Проверка инициализации Firebase
let firebaseInitialized = false;

// Инициализация Firebase
function initFirebase() {
    if (firebaseInitialized) return true;
    
    try {
        console.log('🔄 Инициализирую Firebase...');
        
        // Проверяем, загружена ли библиотека Firebase
        if (typeof firebase === 'undefined') {
            console.error('❌ Библиотека Firebase не загружена');
            return false;
        }
        
        // Инициализируем Firebase
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        firebaseInitialized = true;
        
        console.log('✅ Firebase успешно инициализирован');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
        return false;
    }
}

// ===================== ОСНОВНЫЕ ФУНКЦИИ =====================

// Создание комнаты (Хост)
function firebaseCreateRoom() {
    console.log('🔥 Создаю комнату через Firebase...');
    
    if (!initFirebase()) {
        showNotification('Ошибка подключения к серверу', 'error');
        return;
    }
    
    playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    isHost = true;
    playerId = 'host_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Генерируем случайный ID комнаты
    currentRoomId = generateRoomCode();
    
    // Обновляем интерфейс
    window.players = [
        { id: playerId, name: playerName, ready: false },
        { id: null, name: 'Ожидание...', ready: false }
    ];
    window.updatePlayersDisplay?.();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    // Создаем комнату в Firebase
    createFirebaseRoom();
    
    console.log('🔥 Комната создана. Код:', currentRoomId);
    showNotification('Онлайн комната создана! Отправьте код партнеру.', 'success');
}

// Присоединение к комнате (Гость)
function firebaseJoinRoom() {
    console.log('🔥 Присоединяюсь к комнате через Firebase...');
    
    if (!initFirebase()) {
        showNotification('Ошибка подключения к серверу', 'error');
        return;
    }
    
    const roomCode = document.getElementById('room-code').value.trim();
    playerName = document.getElementById('player2-name').value.trim() || 'Игрок 2';
    
    if (!roomCode) {
        showNotification('Введите код комнаты!', 'warning');
        return;
    }
    
    currentRoomId = roomCode;
    isHost = false;
    playerId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Обновляем интерфейс
    window.players = [
        { id: null, name: 'Ожидание...', ready: false },
        { id: playerId, name: playerName, ready: false }
    ];
    window.updatePlayersDisplay?.();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    // Подключаемся к комнате в Firebase
    joinFirebaseRoom();
    
    console.log('🔥 Подключился к комнате:', roomCode);
    showNotification('Подключился к онлайн комнате!', 'success');
}

// Создать комнату в Firebase
function createFirebaseRoom() {
    if (!database) return;
    
    roomRef = database.ref('rooms/' + currentRoomId);
    messagesRef = database.ref('messages/' + currentRoomId);
    
    // Создаем структуру комнаты
    roomRef.set({
        host: {
            id: playerId,
            name: playerName,
            ready: false,
            connected: true,
            timestamp: Date.now()
        },
        guest: {
            id: null,
            name: '',
            ready: false,
            connected: false,
            timestamp: null
        },
        createdAt: Date.now(),
        status: 'waiting'
    }).then(() => {
        console.log('✅ Комната создана в Firebase');
        
        // Слушаем изменения в комнате
        roomRef.on('value', handleRoomUpdate);
        
        // Слушаем сообщения
        listenForMessages();
    }).catch((error) => {
        console.error('❌ Ошибка создания комнаты:', error);
        showNotification('Ошибка создания комнаты', 'error');
    });
}

// Подключиться к комнате в Firebase
function joinFirebaseRoom() {
    if (!database) return;
    
    roomRef = database.ref('rooms/' + currentRoomId);
    messagesRef = database.ref('messages/' + currentRoomId);
    
    // Проверяем существование комнаты
    roomRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            showNotification('Комната не найдена!', 'error');
            return;
        }
        
        // Обновляем данные гостя
        roomRef.child('guest').set({
            id: playerId,
            name: playerName,
            ready: false,
            connected: true,
            timestamp: Date.now()
        }).then(() => {
            console.log('✅ Успешно подключился к комнате');
            
            // Отправляем сообщение о подключении
            sendFirebaseMessage({
                type: 'player_joined',
                playerId: playerId,
                playerName: playerName,
                isHost: false
            });
            
            // Слушаем изменения в комнате
            roomRef.on('value', handleRoomUpdate);
            
            // Слушаем сообщения
            listenForMessages();
            
        }).catch((error) => {
            console.error('❌ Ошибка подключения:', error);
            showNotification('Ошибка подключения к комнате', 'error');
        });
        
    }).catch((error) => {
        console.error('❌ Ошибка поиска комнаты:', error);
        showNotification('Комната не найдена', 'error');
    });
}

// Обработка обновлений комнаты
function handleRoomUpdate(snapshot) {
    const roomData = snapshot.val();
    if (!roomData) return;
    
    const host = roomData.host || {};
    const guest = roomData.guest || {};
    
    // Обновляем список игроков
    if (isHost) {
        window.players = [
            {
                id: host.id,
                name: host.name || 'Игрок 1',
                ready: host.ready || false
            },
            {
                id: guest.id,
                name: guest.name || 'Ожидание...',
                ready: guest.ready || false
            }
        ];
    } else {
        window.players = [
            {
                id: host.id,
                name: host.name || 'Игрок 1',
                ready: host.ready || false
            },
            {
                id: guest.id,
                name: guest.name || 'Ожидание...',
                ready: guest.ready || false
            }
        ];
    }
    
    // Обновляем отображение
    window.updatePlayersDisplay?.();
    window.updateStartButton?.();
    
    // Проверяем, можно ли начать игру
    if (host.ready && guest.ready && host.connected && guest.connected) {
        window.startSharedGame?.();
    }
}

// Слушать сообщения
function listenForMessages() {
    if (!messagesRef) return;
    
    messagesRef.limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        
        // Игнорируем свои сообщения
        if (message.senderId === playerId) return;
        
        handleFirebaseMessage(message);
    });
}

// Обработка сообщений
function handleFirebaseMessage(message) {
    console.log('📨 Получено сообщение через Firebase:', message.type);
    
    switch(message.type) {
        case 'player_joined':
            window.addChatMessage?.(`👋 ${message.playerName} подключился(ась)!`, 'system');
            showNotification('Партнер подключился!', 'success');
            break;
            
        case 'player_ready':
            window.addChatMessage?.(`✅ ${message.playerName} готов(а)!`, 'system');
            // Обновляем статус игрока в Firebase
            if (roomRef) {
                const playerField = message.isHost ? 'host' : 'guest';
                roomRef.child(playerField + '/ready').set(true);
            }
            break;
            
        case 'chat_message':
            window.addChatMessage?.(message.message, message.senderName || 'Партнер');
            break;
            
        case 'card_click':
            window.showPartnerCard?.(message.card);
            break;
            
        case 'partner_confirmed':
            window.addChatMessage?.(`✅ ${message.playerName} подтвердил(а) подключение!`, 'system');
            break;
    }
}

// Отправить сообщение через Firebase
function sendFirebaseMessage(data) {
    if (!messagesRef) {
        console.error('❌ Нет подключения к Firebase');
        return;
    }
    
    const message = {
        ...data,
        senderId: playerId,
        senderName: playerName,
        isHost: isHost,
        timestamp: Date.now(),
        messageId: generateMessageId()
    };
    
    messagesRef.push(message).then(() => {
        console.log('📤 Сообщение отправлено через Firebase:', data.type);
    }).catch((error) => {
        console.error('❌ Ошибка отправки сообщения:', error);
    });
}

// ===================== УПРОЩЕННОЕ ПОДКЛЮЧЕНИЕ =====================

// Отметить себя готовым
function firebaseMarkSelfReady() {
    console.log('🔥 Отмечаю себя как готового через Firebase...');
    
    if (!roomRef) {
        showNotification('Нет подключения к комнате', 'error');
        return;
    }
    
    const playerField = isHost ? 'host' : 'guest';
    
    // Обновляем статус в Firebase
    roomRef.child(playerField + '/ready').set(true).then(() => {
        // Отправляем сообщение партнеру
        sendFirebaseMessage({
            type: 'player_ready',
            playerId: playerId,
            playerName: playerName,
            isHost: isHost,
            ready: true
        });
        
        window.addChatMessage?.('✅ Я готов(а) к игре!', 'system');
        showNotification('Вы готовы к игре!', 'success');
        
    }).catch((error) => {
        console.error('❌ Ошибка обновления статуса:', error);
        showNotification('Ошибка обновления статуса', 'error');
    });
}

// Подтвердить подключение партнера
function firebaseConfirmPartner() {
    console.log('🔥 Подтверждаю подключение партнера через Firebase...');
    
    // Отправляем уведомление партнеру
    sendFirebaseMessage({
        type: 'partner_confirmed',
        playerId: playerId,
        playerName: playerName,
        isHost: isHost
    });
    
    window.addChatMessage?.('✅ Партнер подтвердил подключение!', 'system');
    showNotification('Партнер отмечен как подключенный!', 'success');
}

// Принудительно начать игру
function firebaseForceStart() {
    console.log('🔥 Принудительно начинаю игру через Firebase...');
    
    if (!roomRef) {
        showNotification('Нет подключения к комнате', 'error');
        return;
    }
    
    // Отмечаем обоих как готовых
    roomRef.child('host/ready').set(true);
    roomRef.child('guest/ready').set(true);
    
    window.startSharedGame?.();
    showNotification('Игра начата!', 'success');
}

// ===================== ЧАТ И КАРТОЧКИ =====================

// Отправить сообщение в чат
function firebaseSendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    if (!messagesRef) {
        showNotification('Нет подключения к чату', 'error');
        return;
    }
    
    sendFirebaseMessage({
        type: 'chat_message',
        message: message
    });
    
    window.addChatMessage?.(message, 'Вы');
    input.value = '';
}

// Отправить карточку
function firebaseSendRandomQuestion() {
    const questions = window.onlineCards?.вопросы || ["Что тебе больше всего нравится в наших отношениях?"];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    const card = {
        category: "💬 Вопрос для вас двоих",
        question: randomQuestion,
        type: "вопрос",
        from: playerName
    };
    
    sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    window.addChatMessage?.('💬 Отправил(а) вопрос партнеру', 'Вы');
    showNotification('Вопрос отправлен партнеру! 💬', 'success');
}

function firebaseSendRandomAction() {
    const actions = window.onlineCards?.действия || ["Отправь партнеру фото с надписью 'Скучаю по тебе' 💕"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const card = {
        category: "🔥 Задание для вас",
        question: randomAction,
        type: "действие",
        from: playerName
    };
    
    sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    window.addChatMessage?.('🔥 Отправил(а) задание партнеру', 'Вы');
    showNotification('Действие отправлено партнеру! 🔥', 'success');
}

function firebaseSendRandomDate() {
    const dates = window.onlineCards?.свидания || ["Виртуальный киновечер: смотрим один фильм одновременно 🎬"];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    
    const card = {
        category: "🌹 Идея для свидания",
        question: randomDate,
        type: "свидание",
        from: playerName
    };
    
    sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    window.addChatMessage?.('🌹 Отправил(а) идею свидания партнеру', 'Вы');
    showNotification('Идея для свидания отправлена! 🌹', 'success');
}

function firebaseSendRandomCompliment() {
    const compliments = window.onlineCards?.комплименты || ["Ты делаешь мои дни ярче просто своим существованием 🌞"];
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    const card = {
        category: "💖 Комплимент",
        question: randomCompliment,
        type: "комплимент",
        from: playerName
    };
    
    sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    window.addChatMessage?.('💖 Отправил(а) комплимент партнеру', 'Вы');
    showNotification('Комплимент отправлен! 💖', 'success');
}

// ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateMessageId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10003;
        animation: slideDown 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        ${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Экспорт функций в глобальную область видимости
window.firebaseCreateRoom = firebaseCreateRoom;
window.firebaseJoinRoom = firebaseJoinRoom;
window.firebaseMarkSelfReady = firebaseMarkSelfReady;
window.firebaseConfirmPartner = firebaseConfirmPartner;
window.firebaseForceStart = firebaseForceStart;
window.firebaseSendChatMessage = firebaseSendChatMessage;
window.firebaseSendRandomQuestion = firebaseSendRandomQuestion;
window.firebaseSendRandomAction = firebaseSendRandomAction;
window.firebaseSendRandomDate = firebaseSendRandomDate;
window.firebaseSendRandomCompliment = firebaseSendRandomCompliment;

console.log('✅ Firebase функции загружены и готовы к использованию');
