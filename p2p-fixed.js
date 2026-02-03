// ===================== ИСПРАВЛЕННЫЙ P2P КОД =====================

// Генерация сигнала (для хоста)
function generateSignal() {
    console.log('🔧 Генерация P2P сигнала...');
    
    if (!isHost) {
        showNotification('Только хост может генерировать сигнал', 'warning');
        return;
    }
    
    // Очищаем старое соединение
    if (peer) {
        peer.destroy();
        peer = null;
    }
    
    // Создаем соединение с улучшенными настройками
    peer = new SimplePeer({
        initiator: true,
        trickle: true, // Важно: включаем trickle
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ],
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all'
        },
        sdpTransform: function(sdp) {
            // Улучшаем SDP для лучшей совместимости
            return sdp.replace(/a=group:BUNDLE 0\r\n/g, '')
                     .replace(/a=mid:0\r\n/g, '')
                     .replace(/a=msid-semantic: WMS\r\n/g, '');
        }
    });
    
    console.log('✅ P2P соединение создано (инициатор)');
    
    // Настраиваем обработчики с задержкой
    setTimeout(() => {
        setupPeerHandlers();
    }, 500);
    
    showNotification('Генерирую сигнал подключения...', 'info');
}

// Подключение по сигналу (для гостя) - исправленная версия
function connectWithSignal(encodedSignal) {
    console.log('🔗 Подключаюсь по сигналу...');
    
    try {
        // Декодируем сигнал
        const signalStr = atob(encodedSignal);
        const signalData = JSON.parse(signalStr);
        
        console.log('✅ Сигнал получен:', signalData.type);
        
        // Очищаем старое соединение
        if (peer) {
            peer.destroy();
            peer = null;
        }
        
        // Создаем соединение как гость с улучшенными настройками
        peer = new SimplePeer({
            initiator: false,
            trickle: true, // Важно: включаем trickle
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ],
                iceCandidatePoolSize: 10,
                iceTransportPolicy: 'all'
            },
            sdpTransform: function(sdp) {
                return sdp.replace(/a=group:BUNDLE 0\r\n/g, '')
                         .replace(/a=mid:0\r\n/g, '')
                         .replace(/a=msid-semantic: WMS\r\n/g, '');
            }
        });
        
        // Настраиваем обработчики
        setTimeout(() => {
            setupPeerHandlers();
        }, 500);
        
        // Отправляем сигнал с задержкой
        setTimeout(() => {
            if (peer && !peer.destroyed) {
                peer.signal(signalData);
                console.log('📤 Сигнал отправлен хосту');
            }
        }, 1000);
        
        showNotification('Подключаюсь к партнеру...', 'info');
        
    } catch (error) {
        console.error('❌ Ошибка подключения:', error);
        showNotification('Неверный сигнал: ' + error.message, 'error');
    }
}
