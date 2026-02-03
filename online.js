// online.js - онлайн-режим через WebSocket сервер

// Глобальные переменные
let ws = null;
let currentRoomId = null;
let playerName = '';
let isHost = false;
let partnerConnected = false;
let players = [
    { id: null, name: '', ready: false },
    { id: null, name: '', ready: false }
];

// Бесплатный WebSocket сервер для тестирования
const WS_SERVER = 'wss://ws.postman-echo.com/raw';

// Инициализация при загрузке
window.onload = function() {
    console.log('LoveDeck Online загружен!');
    
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
    
    // Подключаемся к WebSocket серверу
    initWebSocket();
    
    console.log('Комната создана. Код:', currentRoomId);
    showNotification('Комната создана! Отправьте код партнеру.', 'success');
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
    
    // Подключаемся к WebSocket серверу
    initWebSocket();
    
    console.log('Подключился к комнате:', roomCode);
    showNotification('Подключился к комнате!', 'success');
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
    
    initWebSocket();
    showQR();
    
    showNotification('Комната создана! Партнер может подключиться по QR-коду.', 'success');
}

// Генерация кода комнаты
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===================== WEBSOCKET СОЕДИНЕНИЕ =====================

// Инициализация WebSocket
function initWebSocket() {
    console.log('Подключаюсь к WebSocket серверу...');
    
    try {
        ws = new WebSocket(WS_SERVER);
        
        ws.onopen = function() {
            console.log('✅ WebSocket подключен');
            showNotification('Сервер подключен', 'success');
            
            // Регистрируемся в комнате
            sendToServer({
                type: 'join_room',
                room: currentRoomId,
                player: playerName,
                isHost: isHost
            });
            
            // Если мы хост - сразу отмечаем себя как готового
            if (isHost) {
                players[0].ready = true;
                updatePlayersDisplay();
            }
        };
        
        ws.onmessage = function(event) {
            console.log('Получено от сервера:', event.data);
            
            try {
                const data = JSON.parse(event.data);
                handleServerMessage(data);
            } catch (e) {
                // Если это не JSON, обрабатываем как текстовое сообщение
                if (event.data.includes('joined') || event.data.includes('connected')) {
                    // Игнорируем служебные сообщения эхо-сервера
                    return;
                }
                console.log('Текстовое сообщение:', event.data);
                addChatMessage(event.data, 'Партнер');
            }
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket ошибка:', error);
            showNotification('Ошибка подключения к серверу', 'error');
        };
        
        ws.onclose = function() {
            console.log('WebSocket закрыт');
            partnerConnected = false;
            players[1].ready = false;
            updatePlayersDisplay();
            showNotification('Соединение с сервером потеряно', 'warning');
        };
        
    } catch (error) {
        console.error('Не удалось подключиться:', error);
        showNotification('Ошибка подключения', 'error');
    }
}

// Отправка данных на сервер
function sendToServer(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
            ...data,
            room: currentRoomId,
            timestamp: Date.now()
        });
        ws.send(message);
        console.log('Отправлено на сервер:', data);
        return true;
    }
    console.log('WebSocket не готов');
    return false;
}

// Обработка сообщений от сервера
function handleServerMessage(data) {
    // Поскольку это эхо-сервер, мы получаем свои же сообщения
    // Будем считать, что если сообщение не от нас - то от партнера
    
    if (data.player && data.player !== playerName) {
        // Сообщение от партнера
        console.log('Сообщение от партнера:', data);
        
        switch(data.type) {
            case 'join_room':
                // Партнер подключился к комнате
                partnerConnected = true;
                const partnerIndex = isHost ? 1 : 0;
                players[partnerIndex] = {
                    id: 'connected',
                    name: data.player,
                    ready: true
                };
                updatePlayersDisplay();
                addChatMessage(`👋 ${data.player} подключился(ась)!`, 'system');
                showNotification('Партнер подключился!', 'success');
                updateStartButton();
                break;
                
            case 'player_ready':
                players[isHost ? 1 : 0].ready = data.ready;
                updatePlayersDisplay();
                if (data.ready) {
                    addChatMessage(`✅ ${data.player} готов(а)!`, 'system');
                }
                checkIfBothReady();
                break;
                
            case 'chat_message':
                addChatMessage(data.message, data.player);
                break;
                
            case 'card_click':
                showPartnerCard(data.card);
                break;
                
            case 'start_game':
                startSharedGame();
                break;
        }
    }
}

// Отправка данных партнеру (через сервер)
function sendToPartner(data) {
    return sendToServer({
        ...data,
        player: playerName,
        isHost: isHost
    });
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
    const bothReady = players[0].ready && players[1].ready;
    
    startBtn.disabled = !bothReady;
    startBtn.textContent = bothReady ? 'Начать игру!' : 'Ожидание игрока...';
}

// Начать игру
function startGame() {
    console.log('🎮 Начинаем игру!');
    
    const myIndex = isHost ? 0 : 1;
    players[myIndex].ready = true;
    updatePlayersDisplay();
    
    // Отправляем статус партнеру
    sendToPartner({
        type: 'player_ready',
        ready: true,
        player: playerName
    });
    
    // Если хост - запускаем игру для обоих
    if (isHost) {
        setTimeout(() => {
            sendToPartner({
                type: 'start_game'
            });
            startSharedGame();
        }, 1000);
    }
    
    checkIfBothReady();
}

// Проверка готовности обоих
function checkIfBothReady() {
    const bothReady = players[0].ready && players[1].ready;
    
    if (bothReady && isHost) {
        // Хост запускает игру
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
    
    // Отправляем партнеру
    sendToPartner({
        type: 'chat_message',
        message: message
    });
    
    // Показываем себе
    addChatMessage(message, 'Вы');
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
    }
}

// ===================== КАРТОЧКИ =====================

// База карточек
const onlineCards = {
    вопросы: [
        "Что тебе больше всего нравится в наших отношениях?",
        "Какая наша совместная мечта?",
        "Что бы ты хотел(а) улучшить в наших отношениях?",
        "Какой момент с тобой был самым романтичным?",
        "Что тебе нравится во мне больше всего?"
    ],
    действия: [
        "Отправь партнеру фото с надписью 'Скучаю по тебе' 💕",
        "Напиши партнеру голосовое сообщение с комплиментом 🎤",
        "Спой партнеру песню (можно в голосовом сообщении) 🎵"
    ],
    свидания: [
        "Виртуальный киновечер: смотрим один фильм одновременно 🎬",
        "Онлайн-ужин при свечах: готовим одинаковые блюда 🍽️",
        "Совместная игра в онлайн-игры или квизы 🎮"
    ],
    комплименты: [
        "Ты делаешь мои дни ярче просто своим существованием 🌞",
        "Я так благодарен(на) судьбе за то, что ты в моей жизни 💫",
        "Твоя улыбка - мой самый любимый вид 😊"
    ]
};

// Функции отправки карточек
function sendRandomQuestion() {
    const questions = onlineCards.вопросы;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    const card = {
        category: "💬 Вопрос для вас двоих",
        question: randomQuestion,
        type: "вопрос",
        from: playerName
    };
    
    sendToPartner({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Вопрос отправлен партнеру! 💬', 'success');
}

function sendRandomAction() {
    const actions = onlineCards.действия;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const card = {
        category: "🔥 Задание для вас",
        question: randomAction,
        type: "действие",
        from: playerName
    };
    
    sendToPartner({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Действие отправлено партнеру! 🔥', 'success');
}

function sendRandomDate() {
    const dates = onlineCards.свидания;
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    
    const card = {
        category: "🌹 Идея для свидания",
        question: randomDate,
        type: "свидание",
        from: playerName
    };
    
    sendToPartner({
        type: 'card_click',
        card: card
    });
    
    showPartnerCard(card);
    showNotification('Идея для свидания отправлена! 🌹', 'success');
}

function sendRandomCompliment() {
    const compliments = onlineCards.комплименты;
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    const card = {
        category: "💖 Комплимент",
        question: randomCompliment,
        type: "комплимент",
        from: playerName
    };
    
    sendToPartner({
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
                <p style="font-size: 20px; color: #333;">${card.question || 'Карта от партнера'}</p>
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
}

// ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

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
window.sendCardToPartner = sendToPartner;

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
