// online.js - онлайн-режим на SimplePeer

// Глобальные переменные
let peer = null;
let conn = null;
let currentRoomId = null;
let playerName = '';
let isHost = false;
let players = [
    { id: null, name: '', ready: false },
    { id: null, name: '', ready: false }
];

// Генерация сигнала (для хоста)
function generateSignal() {
    console.log('Генерация P2P сигнала...');
    
    if (!isHost) {
        showNotification('Только хост может генерировать сигнал', 'warning');
        return;
    }
    
    // Если peer уже создан - пересоздаем
    if (peer) {
        peer.destroy();
        peer = null;
    }
    
    // Создаем новое P2P соединение как инициатор
    peer = new SimplePeer({
        initiator: true,
        trickle: false,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });
    
    console.log('P2P соединение создано (инициатор)');
    
    // Настраиваем обработчики
    setupPeerHandlers();
    
    // Запускаем генерацию сигнала
    setTimeout(() => {
        console.log('Запускаю генерацию оффера...');
        // SimplePeer автоматически сгенерирует offer при создании
    }, 1000);
    
    showNotification('Генерирую сигнал подключения...', 'info');
}

// Инициализация при загрузке
window.onload = function() {
    console.log('LoveDeck Online загружен!');
    
    // Проверяем SimplePeer
    if (typeof SimplePeer === 'undefined') {
        showNotification('Ошибка: SimplePeer не загружен', 'error');
        return;
    }
    
    console.log('SimplePeer доступен:', typeof SimplePeer);
    
    // Настраиваем отправку сообщения по Enter
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
};

// ===================== ОСНОВНЫЕ ФУНКЦИИ =====================

// Создание комнаты (Хост)
function createRoom() {
    playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    
    isHost = true;
    
    // Генерируем случайный ID комнаты
    currentRoomId = generateRoomCode();
    
    // Обновляем интерфейс
    players[0] = { id: 'host', name: playerName, ready: false };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    // Показываем код комнаты
    showRoomCode(currentRoomId);
    console.log('Комната создана. Код:', currentRoomId);
}

// Присоединение к комнате (Гость)
function joinRoom() {
    const roomCode = document.getElementById('room-code').value.trim();
    playerName = document.getElementById('player2-name').value.trim() || 'Игрок 2';
    
    if (!roomCode) {
        showNotification('Введите код комнаты!', 'warning');
        return;
    }
    
    currentRoomId = roomCode;
    isHost = false;
    
    // Обновляем интерфейс
    players[1] = { id: 'guest', name: playerName, ready: false };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    showNotification('Введите код сигнала от хоста в чат', 'info');
    console.log('Ожидаю сигнал от хоста для комнаты:', roomCode);
}

// Быстрый старт
function quickStartGame() {
    playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    isHost = true;
    currentRoomId = generateRoomCode();
    
    players[0] = { id: 'host', name: playerName, ready: false };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId;
    
    showQR();
    showNotification('Партнер может отсканировать QR-код или ввести код: ' + currentRoomId, 'success');
}

// Генерация кода комнаты
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===================== P2P СОЕДИНЕНИЕ =====================

// Инициализация P2P соединения (вызывается после обмена сигналами)
function initP2PConnection(signalData, isInitiator) {
    console.log('Инициализируем P2P соединение. Инициатор:', isInitiator);
    
    try {
        // Закрываем старое соединение если есть
        if (peer) {
            peer.destroy();
            peer = null;
        }
        
        // Создаем новое соединение
        peer = new SimplePeer({
            initiator: isInitiator,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });
        
        // Обработка сигналов
        peer.on('signal', function(data) {
            console.log('Получен сигнал:', data.type);
            
            // Кодируем сигнал в base64 для отправки через чат
            const signalStr = JSON.stringify(data);
            const encodedSignal = btoa(signalStr);
            
            // Если мы хост и это первый сигнал - отправляем гостю
            if (isHost && isInitiator && data.type === 'offer') {
                const message = `SIGNAL:${encodedSignal}`;
                addChatMessage('Отправляю сигнал подключения...', 'system');
                
                // В реальном приложении здесь должна быть отправка через сервер
                // А мы просто покажем в чате
                setTimeout(() => {
                    addChatMessage(`Сигнал для подключения: ${encodedSignal.substring(0, 50)}...`, 'system');
                }, 1000);
            }
            
            // Если мы гость и получили answer - отправляем обратно
            if (!isHost && !isInitiator && data.type === 'answer') {
                const message = `SIGNAL:${encodedSignal}`;
                addChatMessage('Отправляю ответный сигнал...', 'system');
            }
        });
        
        // Когда соединение установлено
        peer.on('connect', function() {
            console.log('✅ P2P соединение установлено!');
            showNotification('Подключено к партнеру! 🎉', 'success');
            
            // Обновляем статус игроков
            const myIndex = isHost ? 0 : 1;
            players[myIndex].ready = true;
            updatePlayersDisplay();
            
            // Показываем кнопки карточек
            showCardButtons();
            
            // Отправляем информацию о себе
            sendPeerData({
                type: 'player_info',
                name: playerName,
                isHost: isHost
            });
        });
        
        // При получении данных
        peer.on('data', function(data) {
            try {
                const message = JSON.parse(data.toString());
                console.log('Получены данные:', message);
                handlePeerData(message);
            } catch (e) {
                console.log('Получен текст:', data.toString());
                addChatMessage(data.toString(), 'Партнер');
            }
        });
        
        // Обработка ошибок
        peer.on('error', function(err) {
            console.error('Ошибка P2P:', err);
            showNotification('Ошибка соединения: ' + err.message, 'error');
        });
        
        // Закрытие соединения
        peer.on('close', function() {
            console.log('Соединение закрыто');
            showNotification('Соединение с партнером разорвано', 'warning');
            players[1].ready = false;
            players[0].ready = false;
            updatePlayersDisplay();
        });
        
        // Если передали начальный сигнал - отправляем его
        if (signalData) {
            setTimeout(() => {
                peer.signal(signalData);
            }, 500);
        }
        
    } catch (error) {
        console.error('Ошибка при создании P2P:', error);
        showNotification('Не удалось создать соединение', 'error');
    }
}

// Отправка данных партнеру
function sendPeerData(data) {
    if (peer && peer.connected) {
        try {
            const dataStr = JSON.stringify(data);
            peer.send(dataStr);
            return true;
        } catch (error) {
            console.error('Ошибка отправки:', error);
            return false;
        }
    }
    return false;
}

// Обработка данных от партнера
function handlePeerData(data) {
    console.log('Обработка данных от партнера:', data);
    
    switch(data.type) {
        case 'player_info':
            const playerIndex = isHost ? 1 : 0;
            players[playerIndex] = {
                id: 'connected',
                name: data.name,
                ready: true
            };
            updatePlayersDisplay();
            addChatMessage(`👋 ${data.name} подключился(ась)!`, 'system');
            checkIfBothReady();
            break;
            
        case 'player_ready':
            const index = data.playerIndex !== undefined ? data.playerIndex : (isHost ? 1 : 0);
            if (players[index]) {
                players[index].ready = data.ready;
                updatePlayersDisplay();
                
                if (data.ready) {
                    addChatMessage(`✅ ${data.playerName} готов(а)!`, 'system');
                }
                checkIfBothReady();
            }
            break;
            
        case 'chat_message':
            addChatMessage(data.message, data.sender);
            break;
            
        case 'card_click':
            showPartnerCard(data.card);
            break;
            
        case 'signal':
            // Получен сигнал для подключения
            try {
                const signalData = JSON.parse(data.signal);
                initP2PConnection(signalData, !isHost);
                addChatMessage('Обрабатываю сигнал подключения...', 'system');
            } catch (e) {
                console.error('Ошибка парсинга сигнала:', e);
            }
            break;
    }
}

// ===================== ИНТЕРФЕЙС =====================

// Обновление отображения игроков
function updatePlayersDisplay() {
    document.getElementById('player1').querySelector('.player-name').textContent = players[0].name || 'Ожидание...';
    document.getElementById('player2').querySelector('.player-name').textContent = players[1].name || 'Ожидание...';
    
    document.getElementById('status1').textContent = players[0].ready ? '✅' : '❌';
    document.getElementById('status2').textContent = players[1].ready ? '✅' : '❌';
    
    updateStartButton();
}

// Обновление кнопки старта
function updateStartButton() {
    const startBtn = document.getElementById('start-game-btn');
    const bothConnected = (players[0].ready || players[1].ready) && peer && peer.connected;
    
    startBtn.disabled = !bothConnected;
    startBtn.textContent = bothConnected ? 'Начать игру!' : 'Ожидание подключения...';
}

// Начать игру
function startGame() {
    console.log('Начинаем игру!');
    
    const myIndex = isHost ? 0 : 1;
    players[myIndex].ready = true;
    updatePlayersDisplay();
    
    // Отправляем статус партнеру
    if (sendPeerData) {
        sendPeerData({
            type: 'player_ready',
            ready: true,
            playerIndex: myIndex,
            playerName: playerName
        });
    }
    
    checkIfBothReady();
}

// Проверка готовности обоих
function checkIfBothReady() {
    const bothReady = players[0].ready && players[1].ready;
    const bothConnected = peer && peer.connected;
    
    if (bothReady && bothConnected) {
        startSharedGame();
    }
}

// Запуск общей игры
function startSharedGame() {
    console.log('🎮 Игра начинается!');
    
    showCustomAlert('🎮 Игра начинается!', 'Теперь вы можете отправлять карточки партнеру!', 'success');
    
    // Обновляем кнопку
    const startBtn = document.getElementById('start-game-btn');
    startBtn.textContent = '✅ Игра активна';
    startBtn.disabled = true;
    startBtn.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    
    // Показываем кнопки карточек
    setTimeout(showCardButtons, 500);
}

// ===================== ЧАТ И КАРТОЧКИ =====================

// Отправить сообщение в чат
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Проверяем, не сигнал ли это
    if (message.startsWith('SIGNAL:')) {
        try {
            const encodedSignal = message.substring(7);
            const signalStr = atob(encodedSignal);
            const signalData = JSON.parse(signalStr);
            
            if (!isHost) {
                // Гость обрабатывает сигнал от хоста
                initP2PConnection(signalData, false);
                addChatMessage('Обрабатываю сигнал от хоста...', 'system');
            } else {
                // Хост обрабатывает ответный сигнал
                initP2PConnection(signalData, true);
                addChatMessage('Обрабатываю ответный сигнал...', 'system');
            }
            input.value = '';
            return;
        } catch (e) {
            console.error('Ошибка обработки сигнала:', e);
        }
    }
    
    // Обычное сообщение
    if (sendPeerData) {
        sendPeerData({
            type: 'chat_message',
            message: message,
            sender: playerName
        });
        
        addChatMessage(message, 'Вы');
    } else {
        addChatMessage(message, 'Вы (локально)');
    }
    
    input.value = '';
}

function addChatMessage(message, sender) {
    const chatBox = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = sender === 'Вы' ? 'chat-message self' : 'chat-message other';
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Показать/скрыть кнопки карточек
function showCardButtons() {
    const cardButtons = document.getElementById('card-buttons');
    if (cardButtons) {
        cardButtons.style.display = 'block';
        cardButtons.style.animation = 'fadeIn 0.5s ease';
    }
}

function hideCardButtons() {
    const cardButtons = document.getElementById('card-buttons');
    if (cardButtons) {
        cardButtons.style.display = 'none';
    }
}

// ===================== КАРТОЧКИ =====================

// База карточек (упрощенная)
const onlineCards = {
    вопросы: [
        "Что тебе больше всего нравится в наших отношениях?",
        "Какая наша совместная мечта?",
        "Что бы ты хотел(а) улучшить в наших отношениях?"
    ],
    действия: [
        "Отправь партнеру фото с надписью 'Скучаю по тебе' 💕",
        "Напиши партнеру голосовое сообщение с комплиментом 🎤"
    ],
    свидания: [
        "Виртуальный киновечер: смотрим один фильм одновременно 🎬",
        "Онлайн-ужин при свечах 🍽️"
    ],
    комплименты: [
        "Ты делаешь мои дни ярче 🌞",
        "Я так благодарен(на) судьбе за то, что ты в моей жизни 💫"
    ]
};

// Функции отправки карточек
function sendRandomQuestion() {
    if (!sendPeerData) {
        showNotification('Нет соединения с партнером', 'warning');
        return;
    }
    
    const questions = onlineCards.вопросы;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    const card = {
        category: "💬 Вопрос для вас двоих",
        question: randomQuestion,
        type: "вопрос",
        from: playerName
    };
    
    sendPeerData({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Вопрос отправлен партнеру! 💬', 'success');
}

function sendRandomAction() {
    if (!sendPeerData) {
        showNotification('Нет соединения с партнером', 'warning');
        return;
    }
    
    const actions = onlineCards.действия;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const card = {
        category: "🔥 Задание для вас",
        question: randomAction,
        type: "действие",
        from: playerName
    };
    
    sendPeerData({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Действие отправлено партнеру! 🔥', 'success');
}

function sendRandomDate() {
    if (!sendPeerData) {
        showNotification('Нет соединения с партнером', 'warning');
        return;
    }
    
    const dates = onlineCards.свидания;
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    
    const card = {
        category: "🌹 Идея для свидания",
        question: randomDate,
        type: "свидание",
        from: playerName
    };
    
    sendPeerData({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Идея для свидания отправлена! 🌹', 'success');
}

function sendRandomCompliment() {
    if (!sendPeerData) {
        showNotification('Нет соединения с партнером', 'warning');
        return;
    }
    
    const compliments = onlineCards.комплименты;
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    const card = {
        category: "💖 Комплимент",
        question: randomCompliment,
        type: "комплимент",
        from: playerName
    };
    
    sendPeerData({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Комплимент отправлен! 💖', 'success');
}

// Показать карточку от партнера
function showPartnerCard(card) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(233, 30, 99, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.5s;
        ">
            <div style="font-size: 60px; margin-bottom: 20px;">💌</div>
            <h2 style="color: #e91e63; margin-bottom: 10px;">Карта от ${card.from || 'партнера'}!</h2>
            <p style="color: #666; margin-bottom: 20px;">${card.from || 'Партнер'} отправил(а) вам карту:</p>
            
            <div style="
                background: linear-gradient(45deg, #fff0f6, #f9f0ff);
                padding: 30px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 5px solid #e91e63;
            ">
                <p style="color: #9C27B0; font-weight: bold; margin-bottom: 10px;">${card.category || 'Вопрос для пары'}</p>
                <p style="font-size: 20px; color: #333;">${card.question || card.text || 'Карта от партнера'}</p>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 15px 40px;
                background: linear-gradient(45deg, #4CAF50, #8BC34A);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 18px;
                cursor: pointer;
                margin-top: 20px;
            ">
                💖 Спасибо! 💖
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

// Показать код комнаты
function showRoomCode(roomId) {
    showCustomAlert('🎮 Комната создана!', `Код комнаты: <strong>${roomId}</strong><br><br>Отправьте этот код партнеру. Партнер должен ввести его в поле "Код комнаты".`, 'info');
}

// Копировать код комнаты
function copyRoomCode() {
    if (!currentRoomId) return;
    
    navigator.clipboard.writeText(currentRoomId)
        .then(() => showNotification('Код комнаты скопирован! ✨', 'success'))
        .catch(() => {
            const temp = document.createElement('textarea');
            temp.value = currentRoomId;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showNotification('Код скопирован! 📋', 'success');
        });
}

// Показать QR-код
function showQR() {
    if (!currentRoomId) return;
    
    const qrModal = document.getElementById('qr-modal');
    const qrCodeDiv = document.getElementById('qr-code');
    
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(currentRoomId)}&choe=UTF-8`;
    
    qrCodeDiv.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="border-radius:10px; padding:10px; background:white;">`;
    qrModal.style.display = 'flex';
}

function closeQR() {
    document.getElementById('qr-modal').style.display = 'none';
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

// Красивый алерт
function showCustomAlert(title, message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10004;
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: fadeInScale 0.5s ease;
    `;
    
    const color = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
    
    alertDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">${type === 'success' ? '🎮' : type === 'error' ? '❌' : 'ℹ️'}</div>
        <h3 style="margin:0 0 10px 0; color: ${color}">${title}</h3>
        <p style="margin:0; color:#666; line-height:1.5;">${message}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 30px;
            background: ${color};
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            OK
        </button>
    `;
    
    document.body.appendChild(alertDiv);
}

// Экспортируем функцию отправки карты
window.sendCardToPartner = sendPeerData;

// Добавляем анимации CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInScale {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Показать поле для ввода сигнала
function showSignalInputSection() {
    document.getElementById('signal-input-section').style.display = 'block';
}

// Подключиться по сигналу из поля ввода
function connectWithSignalInput() {
    const signalInput = document.getElementById('signal-input');
    const encodedSignal = signalInput.value.trim();
    
    if (!encodedSignal) {
        showNotification('Введите сигнал от партнера!', 'warning');
        return;
    }
    
    connectWithSignal(encodedSignal);
    signalInput.value = '';
    document.getElementById('signal-input-section').style.display = 'none';
}

// Функция подключения по сигналу
function connectWithSignal(encodedSignal) {
    console.log('Пытаюсь подключиться по сигналу...');
    
    try {
        // Декодируем из base64
        const signalStr = atob(encodedSignal);
        const signalData = JSON.parse(signalStr);
        
        console.log('Сигнал получен:', signalData.type);
        
        // Создаем P2P соединение как гость
        peer = new SimplePeer({
            initiator: false,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });
        
        // Настраиваем обработчики
        setupPeerHandlers();
        
        // Отправляем сигнал
        peer.signal(signalData);
        
        showNotification('Подключаюсь к партнеру...', 'info');
        
    } catch (error) {
        console.error('Ошибка подключения:', error);
        showNotification('Неверный сигнал: ' + error.message, 'error');
    }
}

// Общие обработчики для P2P
function setupPeerHandlers() {
    // Когда подключимся
    peer.on('connect', function() {
        console.log('✅ P2P соединение установлено!');
        showNotification('Подключено к партнеру! 🎉', 'success');
        
        const myIndex = isHost ? 0 : 1;
        players[myIndex].ready = true;
        updatePlayersDisplay();
        
        // Показываем кнопки карточек
        setTimeout(showCardButtons, 500);
        
        // Отправляем информацию о себе
        setTimeout(() => {
            if (peer.connected) {
                peer.send(JSON.stringify({
                    type: 'player_info',
                    name: playerName,
                    isHost: isHost
                }));
            }
        }, 1000);
    });
    
    // Когда получим данные
    peer.on('data', function(data) {
        try {
            const message = JSON.parse(data.toString());
            console.log('Получены данные:', message);
            handlePeerData(message);
        } catch (e) {
            console.log('Получен текст:', data.toString());
            addChatMessage(data.toString(), 'Партнер');
        }
    });
    
    // Когда получим сигнал
    peer.on('signal', function(data) {
        console.log('Сгенерирован сигнал:', data.type);
        
        if (isHost && data.type === 'offer') {
            // Хост показывает свой сигнал для гостя
            const signalStr = JSON.stringify(data);
            const encodedSignal = btoa(signalStr);
            
            showNotification('Сигнал сгенерирован!', 'success');
            addChatMessage(`📡 Сигнал для подключения: ${encodedSignal}`, 'system');
            
            // Также показываем в отдельном блоке для удобного копирования
            showSignalForCopy(encodedSignal);
        }
    });
    
    // Обработка ошибок
    peer.on('error', function(err) {
        console.error('Ошибка P2P:', err);
        showNotification('Ошибка соединения: ' + err.message, 'error');
    });
}

// Показать сигнал для копирования (на хосте)
function showSignalForCopy(encodedSignal) {
    const signalDiv = document.createElement('div');
    signalDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10007;
        max-width: 600px;
        width: 90%;
        text-align: center;
    `;
    
    signalDiv.innerHTML = `
        <h3 style="color:#2196F3; margin-bottom: 15px;">📡 Сигнал для партнера</h3>
        <p style="color:#666; margin-bottom: 15px;">Скопируйте этот код и отправьте партнеру:</p>
        
        <div style="
            background: #f5f5f5;
            padding: 15px;
            border-radius: 10px;
            border: 2px dashed #2196F3;
            margin-bottom: 20px;
            max-height: 200px;
            overflow-y: auto;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            text-align: left;
        ">
            ${encodedSignal}
        </div>
        
        <button onclick="copyToClipboard('${encodedSignal}')" style="
            padding: 12px 25px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        ">
            📋 Копировать сигнал
        </button>
        
        <button onclick="this.parentElement.remove()" style="
            padding: 12px 25px;
            background: #f0f0f0;
            color: #666;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
        ">
            Закрыть
        </button>
    `;
    
    document.body.appendChild(signalDiv);
}

// Копировать в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Сигнал скопирован! ✅', 'success'))
        .catch(err => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('Сигнал скопирован!', 'success');
        });
}


