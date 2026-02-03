// firebase-mode.js - Реальный онлайн-режим через Firebase

// ВСТАВЬ СЮДА СВОЮ КОНФИГУРАЦИЮ ОТ FIREBASE
const firebaseConfig = {
  apiKey: "ТВОЙ_API_KEY",
  authDomain: "ТВОЙ_ПРОЕКТ.firebaseapp.com",
  databaseURL: "https://ТВОЙ_ПРОЕКТ-default-rtdb.firebaseio.com",
  projectId: "ТВОЙ_ПРОЕКТ",
  storageBucket: "ТВОЙ_ПРОЕКТ.appspot.com",
  messagingSenderId: "ТВОЙ_SENDER_ID",
  appId: "ТВОЙ_APP_ID"
};

// Глобальные переменные
let currentRoomId = null;
let playerName = '';
let isHost = false;
let playerId = '';
let players = [];
let database = null;
let roomRef = null;
let messagesRef = null;

// Инициализация Firebase
function initFirebase() {
    console.log('🔥 Инициализирую Firebase...');
    
    try {
        // Инициализируем Firebase
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        
        console.log('✅ Firebase инициализирован');
        return true;
    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
        showNotification('Ошибка подключения к серверу', 'error');
        return false;
    }
}

// Создание комнаты (Хост)
function firebaseCreateRoom() {
    if (!database) {
        if (!initFirebase()) return;
    }
    
    playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    isHost = true;
    playerId = generatePlayerId();
    
    // Генерируем случайный ID комнаты
    currentRoomId = generateRoomCode();
    
    // Обновляем интерфейс
    players = [
        { id: playerId, name: playerName, ready: false },
        { id: null, name: 'Ожидание...', ready: false }
    ];
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    // Создаем комнату в Firebase
    createFirebaseRoom();
    
    console.log('🔥 Комната создана в Firebase. Код:', currentRoomId);
    showNotification('Комната создана! Отправьте код партнеру.', 'success');
}

// Присоединение к комнате (Гость)
function firebaseJoinRoom() {
    if (!database) {
        if (!initFirebase()) return;
    }
    
    const roomCode = document.getElementById('room-code').value.trim();
    playerName = document.getElementById('player2-name').value.trim() || 'Игрок 2';
    
    if (!roomCode) {
        showNotification('Введите код комнаты!', 'warning');
        return;
    }
    
    currentRoomId = roomCode;
    isHost = false;
    playerId = generatePlayerId();
    
    // Обновляем интерфейс
    players = [
        { id: null, name: 'Ожидание...', ready: false },
        { id: playerId, name: playerName, ready: false }
    ];
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    // Подключаемся к комнате в Firebase
    joinFirebaseRoom();
    
    console.log('🔥 Подключился к комнате в Firebase:', roomCode);
    showNotification('Подключился к комнате!', 'success');
}

// Создать комнату в Firebase
function createFirebaseRoom() {
    roomRef = database.ref('rooms/' + currentRoomId);
    messagesRef = database.ref('messages/' + currentRoomId);
    
    // Создаем структуру комнаты
    roomRef.set({
        host: {
            id: playerId,
            name: playerName,
            ready: false,
            connected: true
        },
        guest: {
            id: null,
            name: '',
            ready: false,
            connected: false
        },
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        status: 'waiting'
    });
    
    // Слушаем изменения в комнате
    roomRef.on('value', handleRoomUpdate);
    
    // Слушаем сообщения
    listenForMessages();
}

// Подключиться к комнате в Firebase
function joinFirebaseRoom() {
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
            connected: true
        });
        
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
        console.error('Ошибка подключения к комнате:', error);
        showNotification('Ошибка подключения', 'error');
    });
}

// Обработка обновлений комнаты
function handleRoomUpdate(snapshot) {
    const roomData = snapshot.val();
    if (!roomData) return;
    
    const host = roomData.host;
    const guest = roomData.guest;
    
    // Обновляем список игроков
    if (isHost) {
        players[0] = {
            id: host.id,
            name: host.name,
            ready: host.ready
        };
        players[1] = {
            id: guest.id,
            name: guest.name || 'Ожидание...',
            ready: guest.ready
        };
    } else {
        players[0] = {
            id: host.id,
            name: host.name,
            ready: host.ready
        };
        players[1] = {
            id: guest.id,
            name: guest.name || 'Ожидание...',
            ready: guest.ready
        };
    }
    
    updatePlayersDisplay();
    updateStartButton();
}

// Слушать сообщения
function listenForMessages() {
    if (!messagesRef) return;
    
    messagesRef.limitToLast(100).on('child_added', (snapshot) => {
        const message = snapshot.val();
        
        // Игнорируем свои сообщения
        if (message.senderId === playerId) return;
        
        handleFirebaseMessage(message);
    });
}

// Обработка сообщений
function handleFirebaseMessage(message) {
    console.log('📨 Firebase сообщение от', message.senderName + ':', message.type);
    
    switch(message.type) {
        case 'player_joined':
            addChatMessage(`👋 ${message.playerName} подключился(ась)!`, 'system');
            showNotification('Партнер в комнате!', 'success');
            break;
            
        case 'player_ready':
            // Обновляем статус партнера
            const partnerField = isHost ? 'guest' : 'host';
            roomRef.child(partnerField + '/ready').set(message.ready);
            
            addChatMessage(`✅ ${message.playerName} готов(а)!`, 'system');
            
            // Проверяем готовность обоих
            checkFirebaseReadiness();
            break;
            
        case 'chat_message':
            addChatMessage(message.message, message.senderName);
            break;
            
        case 'card_click':
            showPartnerCard(message.card);
            break;
            
        case 'partner_confirmed':
            addChatMessage(`✅ ${message.playerName} подтвердил(а) подключение!`, 'system');
            break;
    }
}

// Отправить сообщение через Firebase
function sendFirebaseMessage(data) {
    if (!messagesRef) return;
    
    const message = {
        ...data,
        senderId: playerId,
        senderName: playerName,
        timestamp: Date.now(),
        messageId: generateMessageId()
    };
    
    messagesRef.push(message);
    console.log('📤 Отправлено через Firebase:', data.type);
}

// Проверить готовность обоих игроков
function checkFirebaseReadiness() {
    if (!roomRef) return;
    
    roomRef.once('value').then((snapshot) => {
        const room = snapshot.val();
        if (!room) return;
        
        const bothReady = room.host.ready && room.guest.ready;
        
        if (bothReady) {
            startSharedGame();
        }
    });
}

// ===================== УПРОЩЕННОЕ ПОДКЛЮЧЕНИЕ =====================

// Отметить себя готовым
function firebaseMarkSelfReady() {
    console.log('🔥 Отмечаю себя как готового...');
    
    const playerField = isHost ? 'host' : 'guest';
    roomRef.child(playerField + '/ready').set(true);
    
    // Отправляем сообщение партнеру
    sendFirebaseMessage({
        type: 'player_ready',
        playerId: playerId,
        playerName: playerName,
        ready: true
    });
    
    addChatMessage('✅ Я готов(а) к игре!', 'system');
    showNotification('Вы готовы к игре!', 'success');
}

// Подтвердить подключение партнера
function firebaseConfirmPartner() {
    console.log('🔥 Подтверждаю подключение партнера...');
    
    // Отправляем уведомление
    sendFirebaseMessage({
        type: 'partner_confirmed',
        playerId: playerId,
        playerName: playerName
    });
    
    addChatMessage('✅ Партнер подтвердил подключение!', 'system');
    showNotification('Партнер отмечен как подключенный!', 'success');
}

// Принудительно начать игру
function firebaseForceStart() {
    console.log('🔥 Принудительно начинаю игру...');
    
    // Отмечаем обоих как готовых
    roomRef.child('host/ready').set(true);
    roomRef.child('guest/ready').set(true);
    
    startSharedGame();
    showNotification('Игра начата!', 'success');
}

// ===================== ЧАТ И КАРТОЧКИ =====================

// Отправить сообщение в чат
function firebaseSendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    sendFirebaseMessage({
        type: 'chat_message',
        message: message
    });
    
    addChatMessage(message, 'Вы');
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
    
    addChatMessage(`💬 Отправил(а) вопрос партнеру`, 'Вы');
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
    
    addChatMessage(`🔥 Отправил(а) задание партнеру`, 'Вы');
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
    
    addChatMessage(`🌹 Отправил(а) идею свидания партнеру`, 'Вы');
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
    
    addChatMessage(`💖 Отправил(а) комплимент партнеру`, 'Вы');
    showNotification('Комплимент отправлен! 💖', 'success');
}

// ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateMessageId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===================== ОЧИСТКА =====================

// Выйти из комнаты
function firebaseLeaveRoom() {
    if (roomRef) {
        roomRef.off();
    }
    if (messagesRef) {
        messagesRef.off();
    }
    
    // Обновляем статус отключения
    if (roomRef && playerId) {
        const playerField = isHost ? 'host' : 'guest';
        roomRef.child(playerField + '/connected').set(false);
    }
    
    console.log('🔥 Вышел из комнаты Firebase');
}

// Очистить старые комнаты (по таймеру)
function cleanupOldRooms() {
    // Комнаты старше 24 часов удаляются
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    database.ref('rooms').orderByChild('createdAt').endAt(cutoff).remove();
}
