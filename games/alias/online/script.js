// --- КОНФИГУРАЦИЯ ---
// Жесткая привязка к твоему серверу на Amvera
const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io"; 

// Подключение сокета с настройками для стабильности
const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true
});

// --- ЛОГИКА КЛИЕНТА ---

socket.on('connect', () => {
    console.log("✅ Подключено к серверу Amvera! ID:", socket.id);
});

socket.on('connect_error', (err) => {
    console.error("❌ Ошибка соединения:", err);
    alert("Сервер недоступен. Попробуй обновить страницу.");
});

// Функция кнопки "СОЗДАТЬ КОМНАТУ"
function createRoom() {
    // 1. Ищем поле ввода имени (поддержка старых и новых ID)
    let nameInput = document.getElementById('username') || document.getElementById('player-name');
    
    if (!nameInput || !nameInput.value.trim()) {
        alert('Эй! Введи свое имя!');
        return;
    }

    const playerName = nameInput.value.trim();
    
    // 2. Отправляем событие на сервер
    console.log(`📤 Создаю комнату для игрока: ${playerName}`);
    socket.emit('create_room', { playerName: playerName, gameType: 'alias' });
}

// Слушаем ответ сервера: Комната создана
socket.on('room_created', (data) => {
    // data = { roomId: "ABCD", players: [...] }
    console.log("✅ Комната создана:", data.roomId);
    
    // Переключаем экран на Лобби
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-lobby').classList.add('active'); // Убедись, что ID экрана совпадает в HTML
    
    // Отображаем код комнаты
    const codeEl = document.getElementById('lobby-code') || document.getElementById('room-code-display');
    if (codeEl) codeEl.innerText = data.roomId;
});