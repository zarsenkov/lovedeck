// Подключаемся к серверу (адрес подставится автоматически, если клиент на том же домене, 
// либо укажи адрес своего Amvera сервера)
const socket = io('https://lovecouple-server-zarsenkov.amvera.io'); 

let myData = {
    roomId: '',
    name: '',
    isHost: false
};

// Функция: Попытка входа в комнату
function joinGame() {
    const nameInput = document.getElementById('player-name').value.trim();
    const roomInput = document.getElementById('room-id').value.trim();

    if (nameInput && roomInput.length === 4) {
        myData.name = nameInput;
        myData.roomId = roomInput;
        // Отправляем запрос на сервер
        socket.emit('spy-join', { roomId: roomInput, playerName: nameInput });
    } else {
        alert("Введите имя и 4-значный ID комнаты");
    }
}

// Функция: Запуск (только для хоста)
function startOnlineGame() {
    socket.emit('spy-start', {
        roomId: myData.roomId,
        settings: {
            spyCount: parseInt(document.getElementById('online-spy-count').innerText),
            locations: LOCATIONS // Массив из основного script.js
        }
    });
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---

// Обновление списка игроков
socket.on('spy-update-lobby', ({ players }) => {
    toScreen('lobby-screen');
    const list = document.getElementById('online-players-list');
    list.innerHTML = '';

    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'name-tag';
        if (p.id === socket.id) {
            div.classList.add('me');
            if (p.isHost) myData.isHost = true;
        }
        div.innerText = `${p.isHost ? '👑 ' : ''}${p.name}`;
        list.appendChild(div);
    });

    // Показываем кнопку старта только хосту
    document.getElementById('host-controls').style.display = myData.isHost ? 'block' : 'none';
    document.getElementById('wait-message').style.display = myData.isHost ? 'none' : 'block';
});

// Получение роли
socket.on('spy-your-role', ({ role, location, isSpy }) => {
    toScreen('role-screen');
    const roleText = document.getElementById('role-text');
    const locText = document.getElementById('location-text');

    roleText.innerText = role;
    locText.innerText = isSpy ? "УЗНАЙТЕ МЕСТОПОЛОЖЕНИЕ" : `ЛОКАЦИЯ: ${location}`;
    
    // Меняем цвет текста для шпиона
    roleText.style.color = isSpy ? "var(--neon-red)" : "var(--neon-cyan)";
});

// Обработка ошибок
socket.on('spy-error', (msg) => alert(msg));
