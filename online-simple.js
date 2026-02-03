// online-simple.js - Упрощенная версия онлайн режима

// Глобальные переменные
window.onlineSimple = {
    currentRoomId: null,
    playerName: '',
    isHost: false,
    playerId: '',
    players: [
        { id: null, name: '', ready: false },
        { id: null, name: '', ready: false }
    ],
    STORAGE_PREFIX: 'lovedeck_simple_',
    lastCheckedId: 0,
    checkInterval: null
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('💻 LoveDeck Online Simple загружен!');
    
    // Генерируем уникальный ID
    window.onlineSimple.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Настраиваем отправку сообщения по Enter (когда элемент появится)
    setupChatInputWhenReady();
    
    // Запускаем проверку сообщений
    startMessageChecking();
});

// Ждем появления chat input
function setupChatInputWhenReady() {
    const checkInterval = setInterval(() => {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
            console.log('✅ Chat input listener установлен');
            clearInterval(checkInterval);
        }
    }, 100);
    
    // Останавливаем проверку через 5 секунд
    setTimeout(() => clearInterval(checkInterval), 5000);
}

// ===================== ОСНОВНЫЕ ФУНКЦИИ =====================

// Создание комнаты (Хост)
function createRoom() {
    window.onlineSimple.playerName = document.getElementById('player1-name').value.trim() || 'Игрок 1';
    window.onlineSimple.isHost = true;
    
    // Генерируем случайный ID комнаты
    window.onlineSimple.currentRoomId = generateRoomCode();
    
    // Обновляем интерфейс
    window.onlineSimple.players[0] = { 
        id: window.onlineSimple.playerId, 
        name: window.onlineSimple.playerName, 
        ready: false 
    };
    window.onlineSimple.players[1] = { 
        id: null, 
        name: 'Ожидание...', 
        ready: false 
    };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = window.onlineSimple.currentRoomId;
    
    // Очищаем старые сообщения этой комнаты
    clearOldMessages();
    
    console.log('Комната создана. Код:', window.onlineSimple.currentRoomId);
    showNotification('Комната создана! Отправьте код партнеру.', 'success');
}

// Присоединение к комнате (Гость)
function joinRoom() {
    const roomCode = document.getElementById('room-code').value.trim();
    window.onlineSimple.playerName = document.getElementById('player2-name').value.trim() || 'Игрок 2';
    
    if (!roomCode) {
        showNotification('Введите код комнаты!', 'warning');
        return;
    }
    
    window.onlineSimple.currentRoomId = roomCode;
    window.onlineSimple.isHost = false;
    
    // Обновляем интерфейс
    window.onlineSimple.players[0] = { id: null, name: 'Ожидание...', ready: false };
    window.onlineSimple.players[1] = { 
        id: window.onlineSimple.playerId, 
        name: window.onlineSimple.playerName, 
        ready: false 
    };
    updatePlayersDisplay();
    
    document.getElementById('connection-screen').style.display = 'none';
    document.getElementById('room-screen').style.display = 'block';
    document.getElementById('room-id-display').textContent = window.onlineSimple.currentRoomId;
    
    // Очищаем старые сообщения
    clearOldMessages();
    
    // Отправляем уведомление о подключении
    sendMessageToRoom({
        type: 'player_joined',
        playerId: window.onlineSimple.playerId,
        playerName: window.onlineSimple.playerName,
        isHost: false,
        timestamp: Date.now()
    });
    
    console.log('Подключился к комнате:', roomCode);
    showNotification('Подключился к комнате!', 'success');
}

// ... ДОБАВЬ СЮДА ВСЕ ОСТАЛЬНЫЕ ФУНКЦИИ ИЗ online.js (но используй window.onlineSimple) ...

// Экспортируем функции в глобальную область видимости
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.markSelfReady = markSelfReady;
window.confirmPartnerConnection = confirmPartnerConnection;
window.forceStartGame = forceStartGame;
window.sendChatMessage = sendChatMessage;
window.sendRandomQuestion = sendRandomQuestion;
window.sendRandomAction = sendRandomAction;
window.sendRandomDate = sendRandomDate;
window.sendRandomCompliment = sendRandomCompliment;
window.startGame = startGame;
window.updatePlayersDisplay = updatePlayersDisplay;
window.updateStartButton = updateStartButton;
window.addChatMessage = addChatMessage;
window.showPartnerCard = showPartnerCard;
window.showNotification = showNotification;

console.log('✅ Online Simple функции загружены');
