// online.js - совместимая версия (используется только для совместимости)

console.log('⚠️ online.js загружен (режим совместимости)');

// Экспортируем только основные функции, если они нужны для совместимости
if (typeof window.createRoom === 'undefined') {
    window.createRoom = function() {
        console.log('createRoom вызван из online.js - используй online-simple.js');
        if (window.currentMode === 'local' && window.markSelfReady) {
            window.markSelfReady();
        }
    };
}

if (typeof window.joinRoom === 'undefined') {
    window.joinRoom = function() {
        console.log('joinRoom вызван из online.js - используй online-simple.js');
    };
}

// Убираем проблемный onload
window.onload = null;
