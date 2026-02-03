// Простой P2P на SimplePeer
let peer = null;
let conn = null;

function initSimplePeer() {
    console.log('Инициализируем SimplePeer...');
}

function createRoomSimple() {
    // Создаем Peer как инициатор
    peer = new SimplePeer({
        initiator: true,
        trickle: false
    });
    
    peer.on('signal', function(data) {
        // Этот data нужно отправить партнеру
        console.log('SIGNAL для партнера:', JSON.stringify(data));
        const signalData = JSON.stringify(data);
        
        // Показываем код для партнера
        showSignalCode(signalData);
    });
    
    peer.on('connect', function() {
        console.log('✅ Подключено к партнеру!');
        showNotification('Подключено к партнеру!', 'success');
    });
    
    peer.on('data', function(data) {
        console.log('Получены данные:', data.toString());
        handlePeerData(JSON.parse(data.toString()));
    });
}

function joinRoomSimple(signalCode) {
    // Партнер подключается
    try {
        const signalData = JSON.parse(signalCode);
        
        peer = new SimplePeer({
            initiator: false,
            trickle: false
        });
        
        peer.signal(signalData);
        
        peer.on('connect', function() {
            console.log('✅ Подключено к хосту!');
            showNotification('Подключено к партнеру!', 'success');
        });
        
        peer.on('data', function(data) {
            console.log('Получены данные:', data.toString());
            handlePeerData(JSON.parse(data.toString()));
        });
        
    } catch (e) {
        console.error('Ошибка парсинга кода:', e);
        showNotification('Неверный код подключения', 'error');
    }
}
