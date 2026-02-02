// Система совместных сессий через ссылки
const RemoteSession = {
    sessionId: null,
    partnerConnected: false,
    connectionType: null, // 'host' или 'guest'
    
    // Создать сессию для игры вдвоем
    createSession: function() {
        const sessionId = 'LD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        this.sessionId = sessionId;
        this.connectionType = 'host';
        
        // Сохраняем в localStorage
        localStorage.setItem('lovedeck_session', JSON.stringify({
            id: sessionId,
            type: 'host',
            cards: [],
            progress: {}
        }));
        
        // Генерируем ссылку для приглашения
        const inviteLink = `${window.location.origin}${window.location.pathname}?join=${sessionId}`;
        
        // Показываем модальное окно с ссылкой
        this.showInviteModal(inviteLink, sessionId);
        
        // Начинаем проверять подключение партнера
        this.checkForPartner();
        
        return sessionId;
    },
    
    // Присоединиться к сессии
    joinSession: function(sessionId) {
        if (!sessionId) return false;
        
        this.sessionId = sessionId;
        this.connectionType = 'guest';
        
        // Загружаем данные сессии
        this.loadRemoteSession(sessionId);
        
        // Уведомляем хост о подключении
        this.notifyHost();
        
        return true;
    },
    
    // Проверка URL на наличие параметра join
    checkUrlForSession: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const joinId = urlParams.get('join');
        if (joinId) {
            this.joinSession(joinId);
            // Убираем параметр из URL чтобы не мешал
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    },
    
    // Показ модального окна для приглашения
    showInviteModal: function(inviteLink, sessionId) {
        const modalHTML = `
            <div id="remote-session-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 500px;
                    text-align: center;
                ">
                    <h2 style="color: #ff6b8b;">🎮 Пригласите партнёра</h2>
                    <p>Отправьте эту ссылку вашему партнёру:</p>
                    <div style="
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        word-break: break-all;
                        font-family: monospace;
                    ">
                        ${inviteLink}
                    </div>
                    <button onclick="navigator.clipboard.writeText('${inviteLink}').then(() => alert('Ссылка скопирована!'))" 
                            style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        📋 Копировать ссылку
                    </button>
                    <button onclick="document.getElementById('remote-session-modal').remove()" 
                            style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        Закрыть
                    </button>
                    <div id="partner-status" style="margin-top: 20px; padding: 10px; border-radius: 5px; background: #fff3cd; display: none;">
                        ⏳ Ожидаем подключения партнёра...
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    // Проверка подключения партнера (имитация через localStorage)
    checkForPartner: function() {
        if (this.connectionType !== 'host') return;
        
        const checkInterval = setInterval(() => {
            const sessionData = JSON.parse(localStorage.getItem(`lovedeck_session_${this.sessionId}_guest`) || '{}');
            
            if (sessionData.connected) {
                this.partnerConnected = true;
                clearInterval(checkInterval);
                
                // Обновляем UI
                const statusDiv = document.getElementById('partner-status');
                if (statusDiv) {
                    statusDiv.innerHTML = '✅ Партнёр подключен!';
                    statusDiv.style.background = '#d4edda';
                }
                
                // Запускаем синхронизацию
                this.startSync();
            }
        }, 1000);
    },
    
    // Уведомление хоста о подключении
    notifyHost: function() {
        localStorage.setItem(`lovedeck_session_${this.sessionId}_guest`, JSON.stringify({
            connected: true,
            timestamp: Date.now(),
            partnerId: 'guest_' + Date.now()
        }));
        
        // Показываем уведомление гостю
        setTimeout(() => {
            alert('✅ Вы подключились к сессии! Ваши действия будут синхронизированы.');
        }, 500);
    },
    
    // Начать синхронизацию действий
    startSync: function() {
        // Синхронизация открытия карт
        this.syncCardActions();
        
        // Синхронизация лайков/комплитов
        this.syncReactions();
    },
    
    // Синхронизация действий с картами
    syncCardActions: function() {
        // Перехватываем события с картами
        const originalFlipCard = window.flipCard; // Предполагаем, что есть такая функция
        
        if (originalFlipCard) {
            window.flipCard = function(cardId, cardText) {
                // Вызываем оригинальную функцию
                originalFlipCard(cardId, cardText);
                
                // Синхронизируем с партнером
                RemoteSession.syncAction({
                    type: 'card_flip',
                    cardId: cardId,
                    cardText: cardText,
                    timestamp: Date.now(),
                    player: RemoteSession.connectionType
                });
            };
        }
    },
    
    // Синхронизация реакции на карту
    syncAction: function(action) {
        // Сохраняем действие для партнера
        const syncKey = `lovedeck_sync_${this.sessionId}`;
        const syncData = JSON.parse(localStorage.getItem(syncKey) || '[]');
        syncData.push(action);
        localStorage.setItem(syncKey, JSON.stringify(syncData.slice(-50))); // Храним последние 50 действий
        
        // Проверяем действия партнера
        this.checkPartnerActions();
    },
    
    // Проверка действий партнера
    checkPartnerActions: function() {
        if (!this.sessionId) return;
        
        const syncKey = `lovedeck_sync_${this.sessionId}`;
        const syncData = JSON.parse(localStorage.getItem(syncKey) || '[]');
        
        // Фильтруем действия партнера
        const partnerActions = syncData.filter(action => 
            action.player !== this.connectionType && 
            !action.processed
        );
        
        // Обрабатываем каждое действие партнера
        partnerActions.forEach(action => {
            this.processPartnerAction(action);
            action.processed = true;
        });
        
        // Сохраняем обновленные данные
        localStorage.setItem(syncKey, JSON.stringify(syncData));
    },
    
    // Обработка действий партнера
    processPartnerAction: function(action) {
        switch (action.type) {
            case 'card_flip':
                this.showPartnerCardFlip(action.cardId, action.cardText);
                break;
            case 'card_like':
                this.showPartnerReaction(action.cardId, '❤️');
                break;
            case 'card_complete':
                this.showPartnerReaction(action.cardId, '✅');
                break;
        }
    },
    
    // Показать, какую карту открыл партнер
    showPartnerCardFlip: function(cardId, cardText) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 100px;
                right: 20px;
                background: #ff6b8b;
                color: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 9998;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            ">
                <div style="font-weight: bold;">👤 Партнёр открыл карту:</div>
                <div style="margin-top: 5px; font-size: 0.9em;">"${cardText.substring(0, 50)}${cardText.length > 50 ? '...' : ''}"</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Убираем уведомление через 5 секунд
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
};

// Добавляем кнопку для создания удаленной сессии
function addRemotePlayButton() {
    const remoteBtn = document.createElement('button');
    remoteBtn.id = 'remote-play-btn';
    remoteBtn.innerHTML = '🎮 Играть на расстоянии';
    remoteBtn.title = 'Создать сессию для игры вдвоем';
    remoteBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #ff6b8b, #ff8e53);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(255, 107, 139, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    remoteBtn.onclick = function() {
        RemoteSession.createSession();
    };
    
    remoteBtn.onmouseenter = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(255, 107, 139, 0.4)';
    };
    
    remoteBtn.onmouseleave = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(255, 107, 139, 0.3)';
    };
    
    document.body.appendChild(remoteBtn);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем кнопку
    addRemotePlayButton();
    
    // Проверяем, не присоединяемся ли мы к сессии
    RemoteSession.checkUrlForSession();
    
    // Запускаем проверку действий партнера каждую секунду
    setInterval(() => {
        if (RemoteSession.sessionId) {
            RemoteSession.checkPartnerActions();
        }
    }, 1000);
});
