// Устанавливаем соединение с сервером Amvera по порту 80
const socket = io("https://lovecouple-server-zarsenkov.amvera.io");

// Переменные для хранения состояния текущей сессии
let currentRoom = "";   // ID комнаты, в которой находится игрок
let isHost = false;     // Флаг, является ли игрок создателем (хостом)

// --- ФУНКЦИИ ВЗАИМОДЕЙСТВИЯ (ОТПРАВКА НА СЕРВЕР) ---

// Функция для создания новой игровой комнаты
function createOnlineGame() {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("Введите имя!");
    
    // Генерируем случайный ID комнаты из 4 цифр
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Отправляем серверу запрос на создание/вход в комнату Alias
    socket.emit('alias-join', { roomId, playerName: name });
    isHost = true; // Тот, кто создает, становится хостом
}

// Функция для входа в уже существующую комнату по её ID
function joinOnlineGame() {
    const name = document.getElementById('player-name').value;
    const room = document.getElementById('room-id').value;
    
    if (!name || !room) return alert("Заполни все поля!");
    
    // Отправляем серверу запрос на вход в конкретную комнату
    socket.emit('alias-join', { playerName: name, roomId: room });
}

// Функция запуска игры, которую вызывает только хост
function requestStart() {
    // Выбираем категории слов и перемешиваем их (используем массив ALIAS_WORDS из твоего cards.js)
    // Здесь для примера берем категорию 'common'
    const words = [...ALIAS_WORDS.common].sort(() => 0.5 - Math.random());
    
    // Отправляем серверу сигнал о начале игры вместе с массивом слов и временем
    socket.emit('alias-start', { 
        roomId: currentRoom, 
        words: words, 
        timer: 60 
    });
}

// --- ОБРАБОТКА ОТВЕТОВ СЕРВЕРА (ПРИЕМ ДАННЫХ) ---

// Обработка обновления данных о комнате (список игроков)
socket.on('alias-update-lobby', (data) => {
    // Если мы только что вошли, сохраняем ID комнаты и переходим в лобби
    toScreen('screen-lobby');
    
    // Ищем в списке игроков себя, чтобы понять, не назначил ли сервер нас хостом
    const me = data.players.find(p => p.id === socket.id);
    if (me && me.isHost) isHost = true;

    // Обновляем визуальный список игроков на экране
    updatePlayers(data.players);
});

// Событие начала хода: сервер присылает новое слово и того, кто должен объяснять
socket.on('alias-new-turn', (data) => {
    toScreen('screen-game');
    document.getElementById('word-display').innerText = data.word;
    
    // Проверяем, наш ли сейчас ход
    const isMyTurn = data.activePlayerId === socket.id;
    
    // Если не наш ход — блокируем возможность свайпать карточки
    const cardElement = document.getElementById('main-card');
    cardElement.style.pointerEvents = isMyTurn ? 'auto' : 'none';
    cardElement.style.opacity = isMyTurn ? '1' : '0.7';
});

// Обновление текущего счета в шапке игры
socket.on('alias-update-score', (data) => {
    document.getElementById('live-score').innerText = data.score;
});

// Событие завершения игры (когда кончились слова)
socket.on('alias-game-over', (data) => {
    alert("Игра окончена!");
    location.reload(); // Перезагружаем для возврата в меню
});

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ИНТЕРФЕЙСА ---

// Функция отрисовки списка игроков в лобби
function updatePlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `
        <div class="word-row">
            <span>${p.name}</span>
            ${p.isHost ? '<span class="status-pill" style="background:var(--yellow); padding:2px 8px; border-radius:8px; font-size:12px; border:2px solid var(--black);">HOST</span>' : ''}
        </div>
    `).join('');

    // Показываем кнопку старта только если текущий игрок — хост
    document.getElementById('start-btn-online').style.display = isHost ? 'block' : 'none';
}

// Функция для переключения между экранами приложения
function toScreen(id) {
    document.querySelectorAll('.pop-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Обработка результата объяснения слова (свайп или клик)
function handleOnlineWord(isCorrect) {
    // Отправляем серверу результат: угадано слово (true) или пропущено (false)
    socket.emit('alias-action', { 
        roomId: currentRoom, 
        isCorrect: isCorrect 
    });
    
    // Визуальная анимация карточки (улет в сторону)
    const card = document.getElementById('main-card');
    card.style.transition = '0.3s ease-out';
    card.style.transform = isCorrect ? 'translateX(350px) rotate(30deg)' : 'translateX(-350px) rotate(-30deg)';
    card.style.opacity = '0';

    // Возврат карточки в центр для следующего слова
    setTimeout(() => {
        card.style.transition = 'none'; 
        card.style.transform = 'none'; 
        card.style.opacity = '1';
    }, 200);
}
