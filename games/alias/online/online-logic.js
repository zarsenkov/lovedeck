// Подключение к твоему серверу Amvera
// Мы используем основной URL, так как сервер слушает порт 80
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Глобальные переменные состояния
let currentRoom = "";   // Номер текущей комнаты
let isHost = false;     // Флаг: является ли пользователь создателем

// --- ФУНКЦИИ ВЗАИМОДЕЙСТВИЯ ---

// Функция создания новой комнаты
function createOnlineGame() {
    const name = document.getElementById('player-name').value; // Берем имя из инпута
    if (!name) return alert("Введите имя!"); // Проверка заполнения
    
    // Эмитим событие создания комнаты (обработчик должен быть в slovoSocket)
    socket.emit('slovo:create', { playerName: name });
    isHost = true; // Устанавливаем статус хоста локально
}

// Функция входа в существующую комнату по ID
function joinOnlineGame() {
    const name = document.getElementById('player-name').value; // Твое имя
    const room = document.getElementById('room-id').value;      // ID из инпута
    
    if (!name || !room) return alert("Заполни все поля!");
    
    // Эмитим событие входа
    socket.emit('slovo:join', { playerName: name, roomId: room });
}

// Запрос на запуск игры (только от хоста)
function requestStart() {
    socket.emit('slovo:start_game', { roomId: currentRoom });
}

// --- ОБРАБОТКА ОТВЕТОВ СЕРВЕРА ---

// Когда сервер подтверждает создание или вход
socket.on('slovo:room_data', (data) => {
    currentRoom = data.roomId; // Сохраняем ID комнаты
    document.getElementById('display-room-id').innerText = data.roomId; // Пишем ID на экране
    toScreen('screen-lobby'); // Переключаем экран на лобби
    updatePlayers(data.players); // Отрисовываем список игроков
});

// Когда список игроков в комнате меняется
socket.on('slovo:update_players', (players) => {
    updatePlayers(players); // Перерисовываем список
});

// Когда игра начинается для всех
socket.on('slovo:game_started', () => {
    toScreen('screen-game'); // Переход на экран самой игры
});

// Когда приходит новое слово от сервера
socket.on('slovo:new_word', (word) => {
    document.getElementById('word-display').innerText = word; // Показываем слово в карточке
});

// Синхронизация счета
socket.on('slovo:update_score', (score) => {
    document.getElementById('live-score').innerText = score; // Обновляем огонек в шапке
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Отрисовка списка участников
function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill" style="font-size:10px; background:var(--yellow); padding:2px 5px; border-radius:5px; border:1px solid var(--black);">HOST</span>' : ''}
        </div>
    `).join('');

    // Показываем кнопку старта, если ты хост
    if (isHost) {
        document.getElementById('start-btn-online').style.display = 'block';
    }
}

// Функция смены экранов (твоя стандартная)
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Обработка клика/свайпа слова в онлайне
function handleOnlineWord(isCorrect) {
    // Отправляем на сервер информацию: угадано слово или нет
    socket.emit('slovo:word_action', { 
        roomId: currentRoom, 
        isCorrect: isCorrect 
    });
    
    // Анимируем карточку (визуальный эффект улетания)
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(350px) rotate(30deg)' : 'translateX(-350px) rotate(-30deg)';
    card.style.opacity = '0';

    // Возвращаем карточку обратно через 200мс (слово обновится через сокет)
    setTimeout(() => {
        card.style.transition = 'none'; 
        card.style.transform = 'none'; 
        card.style.opacity = '1';
    }, 200);
}
