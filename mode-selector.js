// mode-selector.js - Выбор режима игры

let currentMode = 'local'; // По умолчанию локальный режим
let firebaseReady = false;

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Инициализация выбора режима');
    createModeSelector();
});

// Создать переключатель режимов
function createModeSelector() {
    const connectionScreen = document.getElementById('connection-screen');
    if (!connectionScreen) return;
    
    // Проверяем, есть ли уже переключатель
    if (document.querySelector('.mode-selector')) return;
    
    // Создаем контейнер для выбора режима
    const modeSelector = document.createElement('div');
    modeSelector.className = 'mode-selector';
    modeSelector.innerHTML = `
        <h3>🌐 Выберите режим подключения:</h3>
        <div class="mode-buttons">
            <button class="mode-btn ${firebaseReady ? '' : 'disabled'}" data-mode="firebase" ${!firebaseReady ? 'disabled' : ''}>
                🔥 Онлайн (Firebase)
                <small>${firebaseReady ? 'Работает между разными устройствами' : 'Загрузка Firebase...'}</small>
            </button>
            <button class="mode-btn active" data-mode="local">
                💻 Локальный тест
                <small>Только на одном компьютере</small>
            </button>
        </div>
        <p class="mode-description" id="mode-description">
            💻 Локальный: для тестирования на одном компьютере. Откройте две вкладки браузера.
        </p>
    `;
    
    // Вставляем перед формами подключения
    connectionScreen.insertBefore(modeSelector, connectionScreen.firstChild);
    
    // Назначаем обработчики кнопок
    document.querySelectorAll('.mode-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                switchMode(this.dataset.mode);
            }
        });
    });
    
    // Добавляем стили
    addModeStyles();
    
    // Пытаемся загрузить Firebase
    loadFirebase();
}

// Загрузить Firebase
function loadFirebase() {
    // Проверяем, загружены ли Firebase библиотеки
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') {
        console.log('⚠️ Firebase не загружен, онлайн режим недоступен');
        return;
    }
    
    // Проверяем, есть ли конфигурация
    if (typeof firebaseConfig === 'undefined') {
        console.log('⚠️ Конфигурация Firebase не найдена');
        return;
    }
    
    try {
        // Пытаемся инициализировать Firebase
        firebase.initializeApp(firebaseConfig);
        firebaseReady = true;
        console.log('✅ Firebase готов к использованию');
        
        // Обновляем кнопку Firebase
        const firebaseBtn = document.querySelector('.mode-btn[data-mode="firebase"]');
        if (firebaseBtn) {
            firebaseBtn.classList.remove('disabled');
            firebaseBtn.disabled = false;
            firebaseBtn.innerHTML = `
                🔥 Онлайн (Firebase)
                <small>Работает между разными устройствами</small>
            `;
        }
        
        // Если уже выбран Firebase режим, переключаемся
        if (currentMode === 'firebase') {
            switchMode('firebase');
        }
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
    }
}

// Переключить режим
function switchMode(mode) {
    console.log('🔄 Переключаю на режим:', mode);
    
    // Проверяем доступность Firebase
    if (mode === 'firebase' && !firebaseReady) {
        showNotification('Firebase не загружен. Используйте локальный режим.', 'warning');
        return;
    }
    
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
        description.innerHTML = '🔥 <strong>Онлайн режим:</strong> Работает между разными устройствами через интернет. Требует настройки Firebase.';
        showNotification('Выбран онлайн режим (Firebase)', 'success');
    } else {
        description.innerHTML = '💻 <strong>Локальный режим:</strong> Для тестирования на одном компьютере. Откройте две вкладки браузера.';
        showNotification('Выбран локальный тестовый режим', 'info');
    }
    
    // Обновляем кнопки действий
    updateActionButtons();
    
    // Обновляем кнопки в комнате (если она открыта)
    if (document.getElementById('room-screen').style.display !== 'none') {
        setupRoomButtons();
    }
}

// Обновить кнопки действий на экране подключения
function updateActionButtons() {
    console.log('🔄 Обновляю кнопки для режима:', currentMode);
    
    const createBtn = document.querySelector('.player-card.create-room .btn-primary');
    const joinBtn = document.querySelector('.player-card.join-room .btn-secondary');
    const quickStartBtn = document.querySelector('.btn-quick-start');
    
    if (!createBtn || !joinBtn) return;
    
    if (currentMode === 'firebase' && firebaseReady) {
        // Проверяем, что функции Firebase существуют
        if (typeof firebaseCreateRoom !== 'undefined') {
            createBtn.textContent = '🔥 Создать онлайн-комнату';
            createBtn.onclick = firebaseCreateRoom;
        }
        
        if (typeof firebaseJoinRoom !== 'undefined') {
            joinBtn.textContent = '🔥 Присоединиться онлайн';
            joinBtn.onclick = firebaseJoinRoom;
        }
        
        if (quickStartBtn && typeof firebaseQuickStart !== 'undefined') {
            quickStartBtn.onclick = firebaseQuickStart;
        }
        
    } else {
        // Локальный режим - используем функции из online.js
        createBtn.textContent = '💻 Создать локальную комнату';
        createBtn.onclick = window.createRoom; // из online.js
        
        joinBtn.textContent = '💻 Присоединиться локально';
        joinBtn.onclick = window.joinRoom; // из online.js
        
        if (quickStartBtn) {
            quickStartBtn.onclick = window.quickStartGame; // из online.js
        }
    }
}

// Настроить кнопки в комнате
function setupRoomButtons() {
    console.log('🔄 Настраиваю кнопки комнаты для режима:', currentMode);
    
    const startBtn = document.getElementById('start-game-btn');
    const cardButtons = document.getElementById('card-buttons');
    const chatBtn = document.querySelector('.chat-input button');
    
    // Проверяем существование элементов
    const readyBtn = document.querySelector('.btn-ready');
    const partnerBtn = document.querySelector('.btn-partner');
    const forceBtn = document.querySelector('.btn-force-start');
    
    if (currentMode === 'firebase' && firebaseReady) {
        // Кнопки управления игроками
        if (readyBtn && typeof firebaseMarkSelfReady !== 'undefined') {
            readyBtn.onclick = firebaseMarkSelfReady;
        }
        
        if (partnerBtn && typeof firebaseConfirmPartner !== 'undefined') {
            partnerBtn.onclick = firebaseConfirmPartner;
        }
        
        if (forceBtn && typeof firebaseForceStart !== 'undefined') {
            forceBtn.onclick = firebaseForceStart;
        }
        
        // Кнопки карточек
        if (cardButtons) {
            const cardBtns = cardButtons.querySelectorAll('.card-btn');
            if (cardBtns[0] && typeof firebaseSendRandomQuestion !== 'undefined') {
                cardBtns[0].onclick = firebaseSendRandomQuestion;
            }
            if (cardBtns[1] && typeof firebaseSendRandomAction !== 'undefined') {
                cardBtns[1].onclick = firebaseSendRandomAction;
            }
            if (cardBtns[2] && typeof firebaseSendRandomDate !== 'undefined') {
                cardBtns[2].onclick = firebaseSendRandomDate;
            }
            if (cardBtns[3] && typeof firebaseSendRandomCompliment !== 'undefined') {
                cardBtns[3].onclick = firebaseSendRandomCompliment;
            }
        }
        
        // Кнопка чата
        if (chatBtn && typeof firebaseSendChatMessage !== 'undefined') {
            chatBtn.onclick = firebaseSendChatMessage;
        }
        
        // Кнопка старта игры
        if (startBtn && typeof firebaseMarkSelfReady !== 'undefined') {
            startBtn.onclick = firebaseMarkSelfReady;
        }
        
    } else {
        // Локальный режим
        if (readyBtn) readyBtn.onclick = window.markSelfReady;
        if (partnerBtn) partnerBtn.onclick = window.confirmPartnerConnection;
        if (forceBtn) forceBtn.onclick = window.forceStartGame;
        
        if (cardButtons) {
            const cardBtns = cardButtons.querySelectorAll('.card-btn');
            if (cardBtns[0]) cardBtns[0].onclick = window.sendRandomQuestion;
            if (cardBtns[1]) cardBtns[1].onclick = window.sendRandomAction;
            if (cardBtns[2]) cardBtns[2].onclick = window.sendRandomDate;
            if (cardBtns[3]) cardBtns[3].onclick = window.sendRandomCompliment;
        }
        
        if (chatBtn) chatBtn.onclick = window.sendChatMessage;
        if (startBtn) startBtn.onclick = window.startGame;
    }
}

// Добавить стили для переключателя
function addModeStyles() {
    if (document.querySelector('#mode-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mode-styles';
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
        
        @media (max-width: 600px) {
            .mode-buttons {
                flex-direction: column;
            }
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
        
        .mode-btn:hover:not(.disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .mode-btn.active {
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            color: white;
            border-color: #2196F3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
        }
        
        .mode-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #f5f5f5;
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
window.firebaseReady = firebaseReady;
