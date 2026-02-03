// online.js - логика онлайн-игры

// Конфигурация
const PEER_CONFIG = {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    debug: 3,
    secure: true,
    config: {
        'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    }
};

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

// Инициализация при загрузке
window.onload = function() {
    console.log('LoveDeck Online загружен!');
    
    // Автоматически инициализируем PeerJS
    initPeerJS();
    
    // Настраиваем отправку сообщения по Enter
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
};

// Инициализация PeerJS
function initPeerJS() {
    try {
        peer = new Peer(PEER_CONFIG);
        
        peer.on('open', function(id) {
            console.log('PeerJS подключен, мой ID:', id);
            // Можно показать короткий ID пользователю
            document.getElementById('room-id-display').textContent = id.substring(0, 8);
        });
        
        peer.on('connection', function(connection) {
            console.log('К нам подключились!');
            handleIncomingConnection(connection);
        });
        
        peer.on('error', function(err) {
            console.error('Ошибка PeerJS:', err);
            showNotification('Ошибка подключения: ' + err.message, 'error');
        });
        
    } catch (error) {
        console.error('Не удалось инициализировать PeerJS:', error);
        showNotification('Не удалось запустить онлайн-режим. Проверьте подключение к интернету.', 'error');
    }
}

// Создание комнаты
function createRoom() {
    playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    
    if (!peer || !peer.id) {
        showNotification('Подождите, идет подключение к серверу...', 'warning');
        return;
    }
    
    currentRoomId = peer.id;
    isHost = true;
    
    // Обновляем интерфейс
    players[0] = { id: peer.id, name: playerName, ready: false };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId.substring(0, 8);
    
    // Показываем код комнаты с возможностью копирования
    showRoomCode(currentRoomId);
}

// Присоединение к комнате
function joinRoom() {
    const roomCode = document.getElementById('room-code').value.trim();
    playerName = document.getElementById('player2-name').value.trim() || 'Игрок 2';
    
    if (!roomCode) {
        showNotification('Введите код комнаты!', 'warning');
        return;
    }
    
    if (!peer) {
        showNotification('Ошибка подключения к серверу', 'error');
        return;
    }
    
    currentRoomId = roomCode;
    isHost = false;
    
    console.log('Подключаюсь к комнате:', roomCode);
    
    // Создаем соединение
    conn = peer.connect(roomCode, {
        reliable: true,
        serialization: 'json'
    });
    
    setupConnection(conn);
    
    // Обновляем интерфейс
    players[1] = { id: peer.id, name: playerName, ready: false };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
}

// Обработка входящего подключения
function handleIncomingConnection(connection) {
    console.log('Новое входящее соединение');
    conn = connection;
    setupConnection(conn);
    
    // Второй игрок присоединился
    players[1] = { 
        id: connection.peer, 
        name: 'Подключается...', 
        ready: false 
    };
    updatePlayersDisplay();
}

// Настройка соединения
function setupConnection(connection) {
    connection.on('open', function() {
        console.log('Соединение установлено с', connection.peer);
        
        // Отправляем информацию о себе
        connection.send({
            type: 'player_info',
            name: playerName,
            isHost: isHost
        });
        
        // Активируем кнопку старта если оба игрока подключены
        updateStartButton();
    });
    
    connection.on('data', function(data) {
        console.log('Получены данные:', data);
        handlePeerData(data);
    });
    
    connection.on('close', function() {
        console.log('Соединение закрыто');
        showNotification('Соединение с партнером потеряно', 'error');
        players[1] = { id: null, name: '', ready: false };
        players[0].ready = false; // Сбрасываем готовность
        updatePlayersDisplay();
    });
    
    connection.on('error', function(err) {
        console.error('Ошибка соединения:', err);
    });
}

// Обработка данных от партнера
function handlePeerData(data) {
    console.log('Получены данные от партнера:', data);
    
    switch(data.type) {
        case 'player_info':
            // Обновляем информацию об игроке
            const playerIndex = isHost ? 1 : 0;
            players[playerIndex] = {
                id: conn.peer,
                name: data.name,
                ready: false
            };
            updatePlayersDisplay();
            addChatMessage(`👋 ${data.name} присоединился(ась)!`, 'system');
            updateStartButton();
            break;
            
        case 'player_ready':
            console.log('Партнер сообщил о готовности:', data);
            
            const index = data.playerIndex !== undefined ? data.playerIndex : (isHost ? 1 : 0);
            if (players[index]) {
                players[index] = {
                    ...players[index],
                    ready: data.ready
                };
            }
            
            updatePlayersDisplay();
            
            if (data.ready) {
                addChatMessage(`✅ ${data.playerName || 'Партнер'} готов(а) к игре!`, 'system');
            }
            
            checkIfBothReady();
            break;
            
        case 'chat_message':
            addChatMessage(data.message, data.sender);
            break;
            
        case 'start_game':
            console.log('Получена команда на старт игры от хоста');
            if (!isHost) {
                startSharedGame();
            }
            break;
            
        case 'card_click':
            showPartnerCard(data.card);
            break;
    }
}

// Обновление отображения игроков
function updatePlayersDisplay() {
    document.getElementById('player1').querySelector('.player-name').textContent = players[0].name || 'Ожидание...';
    document.getElementById('player2').querySelector('.player-name').textContent = players[1].name || 'Ожидание...';
    
    document.getElementById('status1').textContent = players[0].ready ? '✅' : '❌';
    document.getElementById('status2').textContent = players[1].ready ? '✅' : '❌';
}

// Обновление кнопки старта
function updateStartButton() {
    const startBtn = document.getElementById('start-game-btn');
    const bothReady = players[0].ready && players[1].ready;
    const bothConnected = players[0].id && players[1].id;
    
    console.log('Обновление кнопки:', { bothReady, bothConnected, players });
    
    startBtn.disabled = !(bothConnected);
    
    if (!bothConnected) {
        startBtn.textContent = 'Ожидание игроков...';
    } else if (!bothReady) {
        startBtn.textContent = 'Начать игру';
        startBtn.disabled = false;
    } else {
        startBtn.textContent = 'Игра начинается!';
        startBtn.disabled = true;
    }
}

// Начать игру
function startGame() {
    console.log('Нажата кнопка "Начать игру"');
    
    // Отмечаем себя как готового
    const myIndex = isHost ? 0 : 1;
    players[myIndex].ready = true;
    updatePlayersDisplay();
    
    // Отправляем статус партнеру
    if (conn && conn.open) {
        conn.send({
            type: 'player_ready',
            ready: true,
            playerIndex: myIndex,
            playerName: playerName
        });
    }
    
    // Проверяем, оба ли игрока готовы
    checkIfBothReady();
}

// Проверка готовности обоих игроков
function checkIfBothReady() {
    const bothReady = players[0].ready && players[1].ready;
    const bothConnected = players[0].id && players[1].id;
    
    console.log('Проверка готовности:', {
        player1: players[0],
        player2: players[1],
        bothReady: bothReady,
        bothConnected: bothConnected
    });
    
    if (bothReady && bothConnected) {
        // Если я хост, запускаю игру у обоих
        if (isHost) {
            console.log('Хост запускает игру для обоих игроков');
            setTimeout(function() {
                if (conn && conn.open) {
                    conn.send({
                        type: 'start_game'
                    });
                }
                startSharedGame();
            }, 1000);
        } else {
            console.log('Второй игрок готов, ждем команду от хоста');
        }
    } else if (bothConnected && !bothReady) {
        // Оба подключены, но не готовы
        updateStartButton();
    }
}

// Запуск общей игры
function startSharedGame() {
    console.log('Игра начинается!');
    
    // Показываем сообщение
    showCustomAlert('🎮 Игра начинается!', 'Теперь вы можете отправлять карты партнеру и общаться в чате.', 'success');
    
    // Обновляем кнопку
    const startBtn = document.getElementById('start-game-btn');
    startBtn.textContent = '✅ Игра активна';
    startBtn.disabled = true;
    startBtn.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    
    // Показываем подсказку
    setTimeout(showGameHint, 1500);
}

// Чат
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (conn && conn.open) {
        conn.send({
            type: 'chat_message',
            message: message,
            sender: playerName
        });
        
        // Показываем свое сообщение
        addChatMessage(message, 'Вы');
    } else {
        showNotification('Нет соединения с партнером', 'warning');
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

// Карты
function sendCardToPartner(card) {
    if (conn && conn.open) {
        conn.send({
            type: 'card_click',
            card: card,
            from: playerName
        });
        return true;
    }
    return false;
}

function showPartnerCard(card) {
    // Создаем красивое модальное окно для карты
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

// Вспомогательные функции
function copyRoomCode() {
    if (!currentRoomId) return;
    
    navigator.clipboard.writeText(currentRoomId)
        .then(() => showNotification('Код комнаты скопирован! ✨', 'success'))
        .catch(() => {
            // Fallback для старых браузеров
            const temp = document.createElement('textarea');
            temp.value = currentRoomId;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showNotification('Код скопирован! 📋', 'success');
        });
}

function showQR() {
    if (!currentRoomId) return;
    
    const qrModal = document.getElementById('qr-modal');
    const qrCodeDiv = document.getElementById('qr-code');
    
    // Генерируем QR код через Google Charts API
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(currentRoomId)}&choe=UTF-8`;
    
    qrCodeDiv.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="border-radius:10px; padding:10px; background:white;">`;
    qrModal.style.display = 'flex';
}

function closeQR() {
    document.getElementById('qr-modal').style.display = 'none';
}

// Показать код комнаты с возможностью копирования
function showRoomCode(roomId) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        animation: fadeIn 0.3s;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <h3 style="color:#2196F3; margin-bottom: 15px;">🎮 Комната создана!</h3>
            <p style="color:#666; margin-bottom: 20px;">Отправьте этот код партнеру:</p>
            
            <div style="
                background: #f5f5f5;
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                border: 2px dashed #2196F3;
                font-size: 24px;
                font-weight: bold;
                color: #2196F3;
                letter-spacing: 2px;
                word-break: break-all;
            ">
                ${roomId}
            </div>
            
            <p style="color:#666; font-size:14px; margin-bottom: 25px;">
                Партнер должен ввести этот код в поле "Код комнаты"
            </p>
            
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="copyToClipboard('${roomId}')" style="
                    padding: 12px 25px;
                    background: linear-gradient(45deg, #4CAF50, #8BC34A);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    📋 Копировать код
                </button>
                
                <button onclick="generateQRCode('${roomId}')" style="
                    padding: 12px 25px;
                    background: linear-gradient(45deg, #FF9800, #FFB74D);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    📱 Показать QR-код
                </button>
                
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 12px 25px;
                    background: #f0f0f0;
                    color: #666;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    Понятно
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Копирование в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification('Код скопирован в буфер обмена! ✅', 'success');
        })
        .catch(err => {
            console.error('Ошибка копирования:', err);
            showNotification('Не удалось скопировать код', 'error');
        });
}

// Генерация QR кода
function generateQRCode(roomId) {
    document.querySelector('div[style*="position: fixed; top: 0"]')?.remove();
    showQR();
}

// Показать уведомление
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

// Показать красивый алерт
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
    
    // Добавляем анимацию
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
    `;
    document.head.appendChild(style);
}

// Подсказка как играть
function showGameHint() {
    const hintDiv = document.createElement('div');
    hintDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10005;
        max-width: 500px;
        width: 90%;
        text-align: center;
        animation: fadeInScale 0.5s ease;
    `;
    
    hintDiv.innerHTML = `
        <h3 style="color:#e91e63; margin-bottom: 20px;">🎮 Как играть онлайн</h3>
        
        <div style="text-align: left; margin-bottom: 25px;">
            <div style="display:flex; align-items:center; margin:10px 0;">
                <div style="background:#4CAF50; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; margin-right:10px;">1</div>
                <span>Откройте основную игру в новой вкладке: <a href="index.html" target="_blank" style="color:#2196F3; font-weight:bold;">LoveDeck</a></span>
            </div>
            
            <div style="display:flex; align-items:center; margin:10px 0;">
                <div style="background:#FF9800; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; margin-right:10px;">2</div>
                <span>Кликайте на карты в пирамиде</span>
            </div>
            
            <div style="display:flex; align-items:center; margin:10px 0;">
                <div style="background:#9C27B0; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; margin-right:10px;">3</div>
                <span>Карта автоматически отправится партнеру</span>
            </div>
        </div>
        
        <div style="display:flex; gap:10px; justify-content:center;">
            <button onclick="window.open('index.html', '_blank'); this.parentElement.parentElement.remove()" style="
                padding: 12px 30px;
                background: linear-gradient(45deg, #4CAF50, #8BC34A);
                color: white;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
            ">
                Открыть игру
            </button>
            
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 12px 30px;
                background: #f0f0f0;
                color: #666;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
            ">
                Понятно
            </button>
        </div>
    `;
    
    document.body.appendChild(hintDiv);
}

// ПОКАЗАТЬ КНОПКИ КАРТОЧЕК
function showCardButtons() {
    const cardButtons = document.getElementById('card-buttons');
    if (cardButtons) {
        cardButtons.style.display = 'block';
        cardButtons.style.animation = 'fadeIn 0.5s ease';
    }
}

// Скрыть кнопки карточек (при старте еще не показываем)
function hideCardButtons() {
    const cardButtons = document.getElementById('card-buttons');
    if (cardButtons) {
        cardButtons.style.display = 'none';
    }
}

// Инициализация карточек
const onlineCards = {
    // Вопросы
    вопросы: [
        "Что тебе больше всего нравится в наших отношениях?",
        "Какая наша совместная мечта?",
        "Что бы ты хотел(а) улучшить в наших отношениях?",
        "Какой момент с тобой был самым романтичным?",
        "Что тебе нравится во мне больше всего?",
        "О чем ты думаешь, когда мы вместе?",
        "Какой комплимент от меня ты запомнил(а) навсегда?",
        "Что делает наши отношения особенными?",
        "Какой у нас самый смешной совместный момент?",
        "Что ты чувствуешь, когда мы вместе молчим?",
        "Что тебя во мне удивляет?",
        "Какое наше свидание было самым запоминающимся?",
        "Что для тебя значит 'быть вместе'?",
        "Какой у нас самый романтичный ритуал?",
        "Что ты хотел(а) бы сделать вместе в будущем?"
    ],
    
    // Действия
    действия: [
        "Отправь партнеру фото с надписью 'Скучаю по тебе' 💕",
        "Напиши партнеру голосовое сообщение с комплиментом 🎤",
        "Спой партнеру песню (можно в голосовом сообщении) 🎵",
        "Отправь партнеру список из 5 причин, почему он(а) особенный(ая) ✨",
        "Сделай партнеру сюрприз - закажи доставку его любимой еды 🍕",
        "Пришли партнеру фото вашего самого счастливого момента вместе 📸",
        "Напиши партнеру, что ты сейчас чувствуешь к нему(ней) ❤️",
        "Создай для партнера плейлист из песен, которые напоминают о вас 🎶",
        "Пришли партнеру видео, как ты улыбаешься, думая о нем(ней) 😊",
        "Спланируй идеальное свидание на выходные и расскажи партнеру 📅",
        "Напиши партнеру, за что ты благодарен(на) сегодня 🙏",
        "Сделай партнеру цифровой подарок - открытку или коллаж 🎁",
        "Расскажи партнеру о своем дне в деталях, как лучшему другу 💬",
        "Поставь партнеру песню, которая играла во время вашего первого свидания 🎧",
        "Пришли партнеру задание - найти в доме 5 вещей, которые напоминают о вас 🔍"
    ],
    
    // Свидания
    свидания: [
        "Виртуальный киновечер: смотрим один фильм одновременно 🎬",
        "Онлайн-ужин при свечах: готовим одинаковые блюда 🍽️",
        "Совместная игра в онлайн-игры или квизы 🎮",
        "Виртуальная прогулка: показываем друг другу свои города через видео 📱",
        "Онлайн-чтение: читаем друг другу книги вслух 📚",
        "Совместный просмотр звезд: смотрим на одно небо 🌟",
        "Виртуальная дегустация: заказываем одинаковые напитки/еду 🍷",
        "Онлайн-танцы: включаем одну музыку и танцуем 💃",
        "Совместное хобби: рисуем, готовим, творим одновременно 🎨",
        "Виртуальное путешествие: планируем будущую поездку вместе ✈️",
        "Онлайн-спорт: делаем зарядку или йогу вместе 🧘",
        "Совместный просмотр заката/рассвета 🌅",
        "Виртуальный пикник: каждый готовит перекус 🍎",
        "Онлайн-концерт: слушаем музыку и обсуждаем 🎵",
        "Совместное изучение чего-то нового: курс, язык, навык 📖"
    ],
    
    // Комплименты
    комплименты: [
        "Ты делаешь мои дни ярче просто своим существованием 🌞",
        "Я так благодарен(на) судьбе за то, что ты в моей жизни 💫",
        "Твоя улыбка - мой самый любимый вид 😊",
        "С тобой я чувствую себя самым счастливым(ой) человеком на свете 🥰",
        "Твой смех - самая красивая музыка для моих ушей 🎶",
        "Я восхищаюсь твоей силой и добротой каждый день 💪",
        "Ты вдохновляешь меня становиться лучше ✨",
        "С тобой даже обычный день становится особенным 🌟",
        "Твоя забота делает меня самым любимым(ой) человеком 💖",
        "Я так горжусь тем, что ты мой(я) партнер(ша) 👑",
        "Твоя поддержка значит для меня больше, чем ты можешь представить 🤗",
        "С тобой я могу быть собой - и это бесценно 💎",
        "Ты делаешь этот мир лучше просто тем, что в нем есть 🌍",
        "Мое сердце улыбается каждый раз, когда я думаю о тебе 💓",
        "Ты - мой самый большой подарок в жизни 🎁"
    ],
    
    // Пикантные вопросы
    пикантные: [
        "Что тебя больше всего возбуждает во мне? 🔥",
        "Какой твой самый смелый сексуальный фантазия? 💋",
        "Где самое романтичное место для поцелуев? 😘",
        "Что ты хочешь попробовать в следующий раз? 😏",
        "Какой момент нашей близости ты вспоминаешь чаще всего? 💭"
    ]
};

// ФУНКЦИИ ДЛЯ ОТПРАВКИ КАРТОЧЕК

// Случайный вопрос
function sendRandomQuestion() {
    if (!conn || !conn.open) {
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
    
    conn.send({
        type: 'card_click',
        card: card
    });
    
    // Показываем себе тоже
    showPartnerCard(card);
    showNotification('Вопрос отправлен партнеру! 💬', 'success');
}

// Случайное действие
function sendRandomAction() {
    if (!conn || !conn.open) {
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
    
    conn.send({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Действие отправлено партнеру! 🔥', 'success');
}

// Случайное свидание
function sendRandomDate() {
    if (!conn || !conn.open) {
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
    
    conn.send({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Идея для свидания отправлена! 🌹', 'success');
}

// Случайный комплимент
function sendRandomCompliment() {
    if (!conn || !conn.open) {
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
    
    conn.send({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Комплимент отправлен! 💖', 'success');
}

// Показать форму для своей карточки
function showCustomCardForm() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10006;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 25px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <h3 style="color:#e91e63; margin-bottom: 20px; text-align:center;">✨ Создать свою карточку</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom:8px; color:#666; font-weight:bold;">Тип карточки:</label>
                <select id="cardType" style="width:100%; padding:10px; border:2px solid #ddd; border-radius:8px; font-size:16px;">
                    <option value="вопрос">💬 Вопрос</option>
                    <option value="действие">🔥 Действие</option>
                    <option value="свидание">🌹 Свидание</option>
                    <option value="комплимент">💖 Комплимент</option>
                    <option value="пикантное">😏 Пикантное</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom:8px; color:#666; font-weight:bold;">Текст карточки:</label>
                <textarea id="cardText" placeholder="Напишите вашу карточку здесь..." style="width:100%; padding:12px; border:2px solid #ddd; border-radius:8px; font-size:16px; min-height:120px; resize:vertical; font-family:inherit;"></textarea>
                <div style="text-align:right; margin-top:5px; color:#999; font-size:14px;">
                    <span id="charCount">0</span>/200 символов
                </div>
            </div>
            
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <p style="margin:0; color:#666; font-size:14px;">
                    💡 <strong>Идеи:</strong> 
                    <br>• "Что тебе снилось прошлой ночью?"
                    <br>• "Спой мне песню, которая сейчас в голове"
                    <br>• "Запланируй наше следующее свидание"
                </p>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:center;">
                <button onclick="sendCustomCard()" style="
                    padding: 12px 30px;
                    background: linear-gradient(45deg, #4CAF50, #8BC34A);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    flex: 1;
                ">
                    ✨ Отправить
                </button>
                
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 12px 30px;
                    background: #f0f0f0;
                    color: #666;
                    border: none;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    flex: 1;
                ">
                    Отмена
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Счетчик символов
    const textarea = modal.querySelector('#cardText');
    const charCount = modal.querySelector('#charCount');
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length > 200) {
            this.value = this.value.substring(0, 200);
            charCount.textContent = 200;
            charCount.style.color = '#f44336';
        } else if (length > 180) {
            charCount.style.color = '#FF9800';
        } else {
            charCount.style.color = '#4CAF50';
        }
    });
    
    // Фокус на текстовое поле
    setTimeout(() => textarea.focus(), 100);
}

// Отправить свою карточку
function sendCustomCard() {
    const cardType = document.querySelector('#cardType').value;
    const cardText = document.querySelector('#cardText').value.trim();
    
    if (!cardText) {
        showNotification('Введите текст карточки!', 'warning');
        return;
    }
    
    if (!conn || !conn.open) {
        showNotification('Нет соединения с партнером', 'warning');
        return;
    }
    
    const emojis = {
        'вопрос': '💬',
        'действие': '🔥',
        'свидание': '🌹',
        'комплимент': '💖',
        'пикантное': '😏'
    };
    
    const categories = {
        'вопрос': 'Ваш вопрос',
        'действие': 'Ваше задание',
        'свидание': 'Идея от вас',
        'комплимент': 'Комплимент от сердца',
        'пикантное': 'Пикантный вопрос'
    };
    
    const card = {
        category: `${emojis[cardType]} ${categories[cardType]}`,
        question: cardText,
        type: cardType,
        from: playerName,
        custom: true
    };
    
    conn.send({
        type: 'card_click',
        card: card
    });
    
    // Закрываем модалку
    document.querySelector('div[style*="position: fixed; top: 0"]').remove();
    
    // Показываем себе
    showPartnerCard(card);
    showNotification('Ваша карточка отправлена! ✨', 'success');
}

// МОДИФИЦИРУЕМ ФУНКЦИЮ START SHARED GAME
function startSharedGame() {
    console.log('Игра начинается!');
    
    // Показываем сообщение
    showCustomAlert('🎮 Игра начинается!', 'Теперь вы можете отправлять карточки партнеру прямо здесь!', 'success');
    
    // Показываем кнопки карточек
    setTimeout(showCardButtons, 500);
    
    // Обновляем кнопку
    const startBtn = document.getElementById('start-game-btn');
    startBtn.textContent = '✅ Игра активна';
    startBtn.disabled = true;
    startBtn.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    
    // Добавляем кнопку для комплиментов в чат
    addComplimentButton();
}

// Добавить кнопку комплимента в чат
function addComplimentButton() {
    const chatInput = document.querySelector('.chat-input');
    if (!chatInput) return;
    
    const complimentBtn = document.createElement('button');
    complimentBtn.innerHTML = '💖 Комплимент';
    complimentBtn.style.cssText = `
        padding: 10px 15px;
        background: linear-gradient(45deg, #e91e63, #ff4081);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 10px;
        transition: transform 0.2s;
    `;
    
    complimentBtn.onmouseover = () => complimentBtn.style.transform = 'scale(1.05)';
    complimentBtn.onmouseout = () => complimentBtn.style.transform = 'scale(1)';
    complimentBtn.onclick = sendRandomCompliment;
    
    chatInput.appendChild(complimentBtn);
}

// Быстрый старт игры
function quickStartGame() {
    playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    
    if (!peer || !peer.id) {
        showNotification('Подождите, идет подключение к серверу...', 'warning');
        return;
    }
    
    currentRoomId = peer.id;
    isHost = true;
    
    // Обновляем интерфейс
    players[0] = { id: peer.id, name: playerName, ready: false };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = currentRoomId.substring(0, 8);
    
    // Сразу показываем QR-код
    setTimeout(() => {
        showQR();
        showNotification('Партнер может отсканировать QR-код для подключения! 📱', 'success');
    }, 300);
}

// Экспортируем функцию отправки карты для основной игры

window.sendCardToPartner = sendCardToPartner;
