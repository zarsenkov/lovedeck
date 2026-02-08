// Подключение к твоему серверу Amvera
const socket = io('https://твой-сервер.amvera.io'); 

// Состояние текущего игрока и комнаты
let myData = {
    roomId: '',
    name: '',
    isHost: false,
    role: '',
    isSpy: false
};

// Таймер для синхронизации
let countdown;

// Функция: Вход в комнату (вызывается кнопкой "Войти")
function joinGame() {
    const name = document.getElementById('player-name').value.trim();
    const room = document.getElementById('room-id').value.trim();

    if (name && room.length === 4) {
        myData.name = name;
        myData.roomId = room;
        // Отправляем запрос на сервер с префиксом spy-
        socket.emit('spy-join', { roomId: room, playerName: name });
    } else {
        alert("Введите имя и 4 цифры ID");
    }
}

// Функция: Запуск игры (доступна только хосту)
function startOnlineGame() {
    socket.emit('spy-start', {
        roomId: myData.roomId,
        settings: {
            spyCount: parseInt(document.getElementById('online-spy-count').innerText),
            time: 300, // Время раунда в секундах (5 минут)
            locations: LOCATIONS // Берем массив из базового script (20).js
        }
    });
}

// --- СЛУШАТЕЛИ СОБЫТИЙ СЕРВЕРА ---

// Обновление списка игроков в лобби
socket.on('spy-update-lobby', ({ players }) => {
    toScreen('lobby-screen');
    const list = document.getElementById('online-players-list');
    list.innerHTML = '';

    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'name-tag';
        // Если это я — подсвечиваем
        if (p.id === socket.id) {
            div.classList.add('me');
            myData.isHost = p.isHost;
        }
        div.innerText = `${p.isHost ? '👑 ' : ''}${p.name}`;
        list.appendChild(div);
    });

    // Управление видимостью кнопок старта
    document.getElementById('host-controls').style.display = myData.isHost ? 'block' : 'none';
    document.getElementById('wait-message').style.display = myData.isHost ? 'none' : 'block';
});

// Получение роли (каждый получает свою версию)
socket.on('spy-your-role', ({ role, location, isSpy, time }) => {
    myData.role = role;
    myData.isSpy = isSpy;
    
    toScreen('role-screen');
    
    const roleText = document.getElementById('role-text');
    const locText = document.getElementById('location-text');

    roleText.innerText = role;
    roleText.style.color = isSpy ? "var(--neon-red)" : "var(--neon-cyan)";
    locText.innerText = isSpy ? "УЗНАЙТЕ ГДЕ ВЫ" : `ЛОКАЦИЯ: ${location}`;

    // Запуск таймера (визуально у каждого свой, но синхронно от сервера)
    startLocalTimer(time);
});

// Функция: Локальный отсчет времени
function startLocalTimer(seconds) {
    clearInterval(countdown);
    let timeLeft = seconds;
    
    // Можно добавить элемент таймера в HTML и обновлять его тут
    countdown = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            // Когда время вышло, только хост сообщает серверу "Стоп"
            if (myData.isHost) socket.emit('spy-stop-game', myData.roomId);
        }
    }, 1000);
}

// Переход к голосованию по команде сервера
socket.on('spy-go-to-vote', () => {
    alert("ВРЕМЯ ВЫШЛО! ПЕРЕХОДИМ К ГОЛОСОВАНИЮ");
    // Здесь можно вызвать функцию renderVoting() из твоего script (20).js
});
