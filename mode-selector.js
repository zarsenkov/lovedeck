// mode-selector.js - Выбор режима игры

let currentMode = 'firebase'; // 'local' или 'firebase'

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Инициализация выбора режима');
    createModeSelector();
});

// Создать переключатель режимов
function createModeSelector() {
    const connectionScreen = document.getElementById('connection-screen');
    if (!connectionScreen) return;
    
    // Создаем контейнер для выбора режима
    const modeSelector = document.createElement('div');
    modeSelector.className = 'mode-selector';
    modeSelector.innerHTML = `
        <h3>🌐 Выберите режим подключения:</h3>
        <div class="mode-buttons">
            <button class="mode-btn active" data-mode="firebase">
                🔥 Онлайн (Firebase)
                <small>Работает между разными устройствами</small>
            </button>
            <button class="mode-btn" data-mode="local">
                💻 Локальный тест
                <small>Только на одном компьютере</small>
            </button>
        </div>
        <p class="mode-description" id="mode-description">
            🔥 Онлайн: использует Firebase для обмена сообщениями между разными устройствами.
        </p>
    `;
    
    // Вставляем перед формами подключения
    connectionScreen.insertBefore(modeSelector, connectionScreen.firstChild);
    
    // Назначаем обработчики кнопок
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchMode(this.dataset.mode);
        });
    });
    
    // Добавляем стили
    addModeStyles();
}

// Переключить режим
function switchMode(mode) {
    currentMode = mode;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Обновляем описание
    const description = document.getElementById('mode-description');
    if (mode === 'firebase') {
        description.innerHTML = '🔥 <strong>Онлайн режим:</strong> Работает между разными устройствами через интернет. Нужен доступ к Firebase.';
        showNotification('Выбран онлайн режим (Firebase)', 'info');
    } else {
        description.innerHTML = '💻 <strong>Локальный режим:</strong> Только для тестирования на одном компьютере. Не требует интернета.';
        showNotification('Выбран локальный тестовый режим', 'info');
    }
    
    // Обновляем кнопки действий
    updateActionButtons();
}

// Обновить кнопки действий
function updateActionButtons() {
    const createBtn = document.querySelector('.player-card.create-room .btn-primary');
    const joinBtn = document.querySelector('.player-card.join-room .btn-secondary');
    
    if (currentMode === 'firebase') {
        createBtn.textContent = '🔥 Создать онлайн-комнату';
        createBtn.onclick = firebaseCreateRoom;
        joinBtn.textContent = '🔥 Присоединиться онлайн';
        joinBtn.onclick = firebaseJoinRoom;
    } else {
        createBtn.textContent = '💻 Создать локальную комнату';
        createBtn.onclick = createRoom; // из online.js
        joinBtn.textContent = '💻 Присоединиться локально';
        joinBtn.onclick = joinRoom; // из online.js
    }
}

// Переопределить кнопки в комнате
function setupRoomButtons() {
    if (!document.getElementById('room-screen')) return;
    
    const startBtn = document.getElementById('start-game-btn');
    const cardButtons = document.getElementById('card-buttons');
    
    if (currentMode === 'firebase') {
        // Обновляем кнопки управления
        document.querySelector('.btn-ready').onclick = firebaseMarkSelfReady;
        document.querySelector('.btn-partner').onclick = firebaseConfirmPartner;
        document.querySelector('.btn-force-start').onclick = firebaseForceStart;
        
        // Обновляем кнопки карточек
        if (cardButtons) {
            cardButtons.querySelectorAll('.card-btn')[0].onclick = firebaseSendRandomQuestion;
            cardButtons.querySelectorAll('.card-btn')[1].onclick = firebaseSendRandomAction;
            cardButtons.querySelectorAll('.card-btn')[2].onclick = firebaseSendRandomDate;
            cardButtons.querySelectorAll('.card-btn')[3].onclick = firebaseSendRandomCompliment;
        }
        
        // Обновляем кнопку чата
        document.querySelector('.chat-input button').onclick = firebaseSendChatMessage;
        
        // Обновляем кнопку старта
        startBtn.onclick = firebaseMarkSelfReady;
        
    } else {
        // Возвращаем локальные функции
        document.querySelector('.btn-ready').onclick = markSelfReady;
        document.querySelector('.btn-partner').onclick = confirmPartnerConnection;
        document.querySelector('.btn-force-start').onclick = forceStartGame;
        
        if (cardButtons) {
            cardButtons.querySelectorAll('.card-btn')[0].onclick = sendRandomQuestion;
            cardButtons.querySelectorAll('.card-btn')[1].onclick = sendRandomAction;
            cardButtons.querySelectorAll('.card-btn')[2].onclick = sendRandomDate;
            cardButtons.querySelectorAll('.card-btn')[3].onclick = sendRandomCompliment;
        }
        
        document.querySelector('.chat-input button').onclick = sendChatMessage;
        startBtn.onclick = startGame;
    }
}

// Добавить стили для переключателя
function addModeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .mode-selector {
            background: linear-gradient(45deg, #f3e5f5, #e8eaf6);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 25px;
            border: 2px solid #d1c4e9;
            text-align: center;
        }
        
        .mode-selector h3 {
            color: #673ab7;
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        
        .mode-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-bottom: 15px;
        }
        
        .mode-btn {
            flex: 1;
            max-width: 250px;
            padding: 15px;
            border: none;
            border-radius: 10px;
            background: white;
            color: #666;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid #e0e0e0;
        }
        
        .mode-btn.active {
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            color: white;
            border-color: #2196F3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
        }
        
        .mode-btn small {
            display: block;
            font-size: 12px;
            margin-top: 5px;
            opacity: 0.8;
        }
        
        .mode-description {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
        }
    `;
    
    document.head.appendChild(style);
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

// Экспорт для использования в других файлах
window.currentMode = currentMode;
window.switchMode = switchMode;
window.setupRoomButtons = setupRoomButtons;
