// firebase-mode.js - Реальный онлайн-режим через Firebase

// ТВОЯ КОНФИГУРАЦИЯ FIREBASE
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

// Глобальные переменные для Firebase режима (используем префикс fb_)
let fb_currentRoomId = null;
let fb_playerName = '';
let fb_isHost = false;
let fb_playerId = '';
let fb_database = null;
let fb_roomRef = null;
let fb_messagesRef = null;
let fb_firebaseInitialized = false;

// Инициализация Firebase
function fb_initFirebase() {
    if (fb_firebaseInitialized) return true;
    
    try {
        console.log('🔄 Инициализирую Firebase...');
        
        // Проверяем, загружена ли библиотека Firebase
        if (typeof firebase === 'undefined') {
            console.error('❌ Библиотека Firebase не загружена');
            return false;
        }
        
        // Инициализируем Firebase
        firebase.initializeApp(firebaseConfig);
        fb_database = firebase.database();
        fb_firebaseInitialized = true;
        
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
    
    if (!fb_initFirebase()) {
        fb_showNotification('Ошибка подключения к серверу', 'error');
        return;
    }
    
    fb_playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    fb_isHost = true;
    fb_playerId = 'host_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Генерируем случайный ID комнаты
    fb_currentRoomId = fb_generateRoomCode();
    
    // Обновляем интерфейс через глобальные функции
    if (window.players && window.updatePlayersDisplay) {
        window.players = [
            { id: fb_playerId, name: fb_playerName, ready: false },
            { id: null, name: 'Ожидание...', ready: false }
        ];
        window.updatePlayersDisplay();
    }
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = fb_currentRoomId;
    
    // Создаем комнату в Firebase
    fb_createFirebaseRoom();
    
    console.log('🔥 Комната создана. Код:', fb_currentRoomId);
    fb_showNotification('Онлайн комната создана! Отправьте код партнеру.', 'success');
}

// Присоединение к комнате (Гость)
function firebaseJoinRoom() {
    console.log('🔥 Присоединяюсь к комнате через Firebase...');
    
    if (!fb_initFirebase()) {
        fb_showNotification('Ошибка подключения к серверу', 'error');
        return;
    }
    
    const roomCode = document.getElementById('room-code').value.trim();
    fb_playerName = document.getElementById('player2-name').value.trim() || 'Игрок 2';
    
    if (!roomCode) {
        fb_showNotification('Введите код комнаты!', 'warning');
        return;
    }
    
    fb_currentRoomId = roomCode;
    fb_isHost = false;
    fb_playerId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Обновляем интерфейс
    if (window.players && window.updatePlayersDisplay) {
        window.players = [
            { id: null, name: 'Ожидание...', ready: false },
            { id: fb_playerId, name: fb_playerName, ready: false }
        ];
        window.updatePlayersDisplay();
    }
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = fb_currentRoomId;
    
    // Подключаемся к комнате в Firebase
    fb_joinFirebaseRoom();
    
    console.log('🔥 Подключился к комнате:', roomCode);
    fb_showNotification('Подключился к онлайн комнате!', 'success');
}

// Создать комнату в Firebase
function fb_createFirebaseRoom() {
    if (!fb_database) return;
    
    fb_roomRef = fb_database.ref('rooms/' + fb_currentRoomId);
    fb_messagesRef = fb_database.ref('messages/' + fb_currentRoomId);
    
    // Создаем структуру комнаты
    fb_roomRef.set({
        host: {
            id: fb_playerId,
            name: fb_playerName,
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
        fb_roomRef.on('value', fb_handleRoomUpdate);
        
        // Слушаем сообщения
        fb_listenForMessages();
    }).catch((error) => {
        console.error('❌ Ошибка создания комнаты:', error);
        fb_showNotification('Ошибка создания комнаты', 'error');
    });
}

// Подключиться к комнате в Firebase
function fb_joinFirebaseRoom() {
    if (!fb_database) return;
    
    fb_roomRef = fb_database.ref('rooms/' + fb_currentRoomId);
    fb_messagesRef = fb_database.ref('messages/' + fb_currentRoomId);
    
    // Проверяем существование комнаты
    fb_roomRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            fb_showNotification('Комната не найдена!', 'error');
            return;
        }
        
        // Обновляем данные гостя
        fb_roomRef.child('guest').set({
            id: fb_playerId,
            name: fb_playerName,
            ready: false,
            connected: true,
            timestamp: Date.now()
        }).then(() => {
            console.log('✅ Успешно подключился к комнате');
            
            // Отправляем сообщение о подключении
            fb_sendFirebaseMessage({
                type: 'player_joined',
                playerId: fb_playerId,
                playerName: fb_playerName,
                isHost: false
            });
            
            // Слушаем изменения в комнате
            fb_roomRef.on('value', fb_handleRoomUpdate);
            
            // Слушаем сообщения
            fb_listenForMessages();
            
        }).catch((error) => {
            console.error('❌ Ошибка подключения:', error);
            fb_showNotification('Ошибка подключения к комнате', 'error');
        });
        
    }).catch((error) => {
        console.error('❌ Ошибка поиска комнаты:', error);
        fb_showNotification('Комната не найдена', 'error');
    });
}

// Обработка обновлений комнаты
function fb_handleRoomUpdate(snapshot) {
    const roomData = snapshot.val();
    if (!roomData) return;
    
    const host = roomData.host || {};
    const guest = roomData.guest || {};
    
    // Обновляем список игроков через глобальные функции
    if (window.players && window.updatePlayersDisplay) {
        if (fb_isHost) {
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
        
        window.updatePlayersDisplay();
        if (window.updateStartButton) window.updateStartButton();
    }
    
    // Проверяем, можно ли начать игру
    if (host.ready && guest.ready && host.connected && guest.connected) {
        if (window.startSharedGame) window.startSharedGame();
    }
}

// Слушать сообщения
function fb_listenForMessages() {
    if (!fb_messagesRef) return;
    
    fb_messagesRef.limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        
        // Игнорируем свои сообщения
        if (message.senderId === fb_playerId) return;
        
        fb_handleFirebaseMessage(message);
    });
}

// Обработка сообщений
function fb_handleFirebaseMessage(message) {
    console.log('📨 Получено сообщение через Firebase:', message.type);
    
    switch(message.type) {
        case 'player_joined':
            if (window.addChatMessage) {
                window.addChatMessage(`👋 ${message.playerName} подключился(ась)!`, 'system');
            }
            fb_showNotification('Партнер подключился!', 'success');
            break;
            
        case 'player_ready':
            if (window.addChatMessage) {
                window.addChatMessage(`✅ ${message.playerName} готов(а)!`, 'system');
            }
            // Обновляем статус игрока в Firebase
            if (fb_roomRef) {
                const playerField = message.isHost ? 'host' : 'guest';
                fb_roomRef.child(playerField + '/ready').set(true);
            }
            break;
            
        case 'chat_message':
            if (window.addChatMessage) {
                window.addChatMessage(message.message, message.senderName || 'Партнер');
            }
            break;
            
        case 'card_click':
            if (window.showPartnerCard) {
                window.showPartnerCard(message.card);
            }
            break;
            
        case 'partner_confirmed':
            if (window.addChatMessage) {
                window.addChatMessage(`✅ ${message.playerName} подтвердил(а) подключение!`, 'system');
            }
            break;
    }
}

// Отправить сообщение через Firebase
function fb_sendFirebaseMessage(data) {
    if (!fb_messagesRef) {
        console.error('❌ Нет подключения к Firebase');
        return;
    }
    
    const message = {
        ...data,
        senderId: fb_playerId,
        senderName: fb_playerName,
        isHost: fb_isHost,
        timestamp: Date.now(),
        messageId: fb_generateMessageId()
    };
    
    fb_messagesRef.push(message).then(() => {
        console.log('📤 Сообщение отправлено через Firebase:', data.type);
    }).catch((error) => {
        console.error('❌ Ошибка отправки сообщения:', error);
    });
}

// ===================== УПРОЩЕННОЕ ПОДКЛЮЧЕНИЕ =====================

// Отметить себя готовым
function firebaseMarkSelfReady() {
    console.log('🔥 Отмечаю себя как готового через Firebase...');
    
    if (!fb_roomRef) {
        fb_showNotification('Нет подключения к комнате', 'error');
        return;
    }
    
    const playerField = fb_isHost ? 'host' : 'guest';
    
    // Обновляем статус в Firebase
    fb_roomRef.child(playerField + '/ready').set(true).then(() => {
        // Отправляем сообщение партнеру
        fb_sendFirebaseMessage({
            type: 'player_ready',
            playerId: fb_playerId,
            playerName: fb_playerName,
            isHost: fb_isHost,
            ready: true
        });
        
        if (window.addChatMessage) {
            window.addChatMessage('✅ Я готов(а) к игре!', 'system');
        }
        fb_showNotification('Вы готовы к игре!', 'success');
        
    }).catch((error) => {
        console.error('❌ Ошибка обновления статуса:', error);
        fb_showNotification('Ошибка обновления статуса', 'error');
    });
}

// Подтвердить подключение партнера
function firebaseConfirmPartner() {
    console.log('🔥 Подтверждаю подключение партнера через Firebase...');
    
    // Отправляем уведомление партнеру
    fb_sendFirebaseMessage({
        type: 'partner_confirmed',
        playerId: fb_playerId,
        playerName: fb_playerName,
        isHost: fb_isHost
    });
    
    if (window.addChatMessage) {
        window.addChatMessage('✅ Партнер подтвердил подключение!', 'system');
    }
    fb_showNotification('Партнер отмечен как подключенный!', 'success');
}

// Принудительно начать игру
function firebaseForceStart() {
    console.log('🔥 Принудительно начинаю игру через Firebase...');
    
    if (!fb_roomRef) {
        fb_showNotification('Нет подключения к комнате', 'error');
        return;
    }
    
    // Отмечаем обоих как готовых
    fb_roomRef.child('host/ready').set(true);
    fb_roomRef.child('guest/ready').set(true);
    
    if (window.startSharedGame) window.startSharedGame();
    fb_showNotification('Игра начата!', 'success');
}

// ===================== ЧАТ И КАРТОЧКИ =====================

// Отправить сообщение в чат
function firebaseSendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    if (!fb_messagesRef) {
        fb_showNotification('Нет подключения к чату', 'error');
        return;
    }
    
    fb_sendFirebaseMessage({
        type: 'chat_message',
        message: message
    });
    
    if (window.addChatMessage) {
        window.addChatMessage(message, 'Вы');
    }
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
        from: fb_playerName
    };
    
    fb_sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    if (window.addChatMessage) {
        window.addChatMessage('💬 Отправил(а) вопрос партнеру', 'Вы');
    }
    fb_showNotification('Вопрос отправлен партнеру! 💬', 'success');
}

function firebaseSendRandomAction() {
    const actions = window.onlineCards?.действия || ["Отправь партнеру фото с надписью 'Скучаю по тебе' 💕"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const card = {
        category: "🔥 Задание для вас",
        question: randomAction,
        type: "действие",
        from: fb_playerName
    };
    
    fb_sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    if (window.addChatMessage) {
        window.addChatMessage('🔥 Отправил(а) задание партнеру', 'Вы');
    }
    fb_showNotification('Действие отправлено партнеру! 🔥', 'success');
}

function firebaseSendRandomDate() {
    const dates = window.onlineCards?.свидания || ["Виртуальный киновечер: смотрим один фильм одновременно 🎬"];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    
    const card = {
        category: "🌹 Идея для свидания",
        question: randomDate,
        type: "свидание",
        from: fb_playerName
    };
    
    fb_sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    if (window.addChatMessage) {
        window.addChatMessage('🌹 Отправил(а) идею свидания партнеру', 'Вы');
    }
    fb_showNotification('Идея для свидания отправлена! 🌹', 'success');
}

function firebaseSendRandomCompliment() {
    const compliments = window.onlineCards?.комплименты || ["Ты делаешь мои дни ярче просто своим существованием 🌞"];
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    const card = {
        category: "💖 Комплимент",
        question: randomCompliment,
        type: "комплимент",
        from: fb_playerName
    };
    
    fb_sendFirebaseMessage({
        type: 'card_click',
        card: card
    });
    
    if (window.addChatMessage) {
        window.addChatMessage('💖 Отправил(а) комплимент партнеру', 'Вы');
    }
    fb_showNotification('Комплимент отправлен! 💖', 'success');
}

// ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

function fb_generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function fb_generateMessageId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Уведомления для Firebase режима
function fb_showNotification(message, type = 'info') {
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
