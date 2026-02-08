// ==========================================
// 1. НАСТРОЙКА И ПОДКЛЮЧЕНИЕ
// ==========================================

// Адрес твоего сервера на Amvera
const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";

const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true
});

// Глобальные переменные состояния
let myId = null;
let currentRoomId = null;
let myRole = null; // 'explainer', 'judge', 'guesser'

// ==========================================
// 2. ОБРАБОТКА СОЕДИНЕНИЯ
// ==========================================

socket.on('connect', () => {
    console.log("✅ Успешное подключение к серверу! ID:", socket.id);
    myId = socket.id;
});

socket.on('connect_error', (err) => {
    console.error("❌ Ошибка соединения:", err);
    // Не спамим алертом, просто пишем в консоль, сокет сам переподключится
});

socket.on('error_msg', (msg) => {
    alert("⚠️ Ошибка: " + msg);
});

// ==========================================
// 3. УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ (UI)
// ==========================================

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

// Получение имени игрока (защита от пустых полей)
function getPlayerName() {
    const input = document.getElementById('username');
    return input ? input.value.trim() : null;
}

// ==========================================
// 4. ЛОГИКА ЛОББИ (ВХОД / СОЗДАНИЕ)
// ==========================================

function createRoom() {
    const name = getPlayerName();
    if (!name) return alert('Пожалуйста, введи имя!');

    console.log(`📤 Создаю комнату для: ${name}`);
    socket.emit('create_room', { playerName: name, gameType: 'alias' });
}

function joinRoom() {
    const name = getPlayerName();
    const codeInput = document.getElementById('room-code-input');
    
    if (!name) return alert('Введи имя!');
    if (!codeInput || !codeInput.value) return alert('Введи код комнаты!');

    const code = codeInput.value.trim().toUpperCase();
    console.log(`📤 Вход в комнату ${code} как ${name}`);
    socket.emit('join_room', { roomId: code, playerName: name });
}

// Ответ сервера: Комната создана/Найден вход
socket.on('room_created', (data) => {
    // data может прийти как объект {roomId, players} или просто ID
    const roomId = data.roomId || data; 
    console.log("✅ Вход выполнен в комнату:", roomId);
    
    currentRoomId = roomId;
    
    // Обновляем UI
    document.getElementById('lobby-code').innerText = roomId;
    showScreen('screen-lobby');
});

// Обновление списка игроков в лобби
socket.on('update_lobby', (room) => {
    console.log("🔄 Данные лобби обновлены:", room);
    currentRoomId = room.id;

    // Если мы еще на экране входа, переходим в лобби
    if (!document.getElementById('screen-lobby').classList.contains('active') && 
        !document.getElementById('screen-game').classList.contains('active')) {
        showScreen('screen-lobby');
    }

    document.getElementById('lobby-code').innerText = room.id;

    // Рендер списка игроков (Стиль Glass)
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => {
        // Выделяем себя жирным
        const isMe = p.id === myId ? '(Вы)' : '';
        return `
            <li>
                <span>${p.name} <small>${isMe}</small></span>
                <span class="score-badge">${p.score}</span>
            </li>
        `;
    }).join('');

    // Кнопка старта видна только хосту (первому игроку)
    const startBtn = document.getElementById('start-btn');
    const waitMsg = document.getElementById('wait-msg');

    if (room.players.length > 0 && room.players[0].id === myId) {
        startBtn.style.display = 'block';
        waitMsg.style.display = 'none';
    } else {
        startBtn.style.display = 'none';
        waitMsg.style.display = 'block';
    }
});

function startGame() {
    if (!currentRoomId) return;
    socket.emit('start_game', currentRoomId);
}

// ==========================================
// 5. ИГРОВОЙ ПРОЦЕСС
// ==========================================

socket.on('round_start', ({ explainerId, judgeId }) => {
    console.log("🚀 Раунд начался!");
    showScreen('screen-game');

    // Сброс UI перед раундом
    const rolePill = document.getElementById('my-role');
    const instruction = document.getElementById('instruction-text');
    const controls = document.getElementById('judge-controls');
    const wordCard = document.getElementById('word-card');
    
    controls.classList.add('hidden');
    document.getElementById('current-word').innerText = "...";

    // Определение роли
    if (myId === explainerId) {
        myRole = 'explainer';
        rolePill.innerText = '🗣 Объясняющий';
        rolePill.style.background = 'rgba(50, 50, 255, 0.2)';
        rolePill.style.color = '#a0a0ff';
        instruction.innerText = "Объясняй слова своей команде!";
    } else if (myId === judgeId) {
        myRole = 'judge';
        rolePill.innerText = '⚖️ Судья';
        rolePill.style.background = 'rgba(255, 50, 50, 0.2)';
        rolePill.style.color = '#ff8080';
        instruction.innerText = "Свайпай: Влево (Пропуск) / Вправо (Верно)";
        
        controls.classList.remove('hidden');
        initSwipe(wordCard); // Включаем свайпы
    } else {
        myRole = 'guesser';
        rolePill.innerText = '🎧 Угадывающий';
        rolePill.style.background = 'rgba(50, 255, 100, 0.2)';
        rolePill.style.color = '#80ffaa';
        instruction.innerText = "Слушай внимательно и угадывай!";
    }
});

socket.on('new_word', (word) => {
    const wordEl = document.getElementById('current-word');
    
    // Показываем слово только активным ролям
    if (myRole === 'explainer' || myRole === 'judge') {
        wordEl.innerText = word;
        
        // Эффект появления (Pop)
        const card = document.getElementById('word-card');
        // Сброс анимации, если она была
        card.style.transition = 'none';
        card.style.transform = 'scale(0.9)';
        card.style.opacity = '0.7';
        
        setTimeout(() => {
            card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.27), opacity 0.3s';
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }, 10);

    } else {
        wordEl.innerText = "???";
    }
});

socket.on('timer_update', (time) => {
    const timerEl = document.getElementById('timer');
    timerEl.innerText = time;
    
    if (time <= 10) {
        timerEl.parentElement.style.color = '#ff4d4d';
        timerEl.parentElement.style.borderColor = '#ff4d4d';
    } else {
        timerEl.parentElement.style.color = 'var(--accent-cyan)';
        timerEl.parentElement.style.borderColor = 'rgba(255,255,255,0.2)';
    }
});

socket.on('round_end', () => {
    alert('Время вышло! Раунд окончен.');
    showScreen('screen-lobby');
});

// ==========================================
// 6. УПРАВЛЕНИЕ ЖЕСТАМИ (СВАЙПЫ) И КНОПКАМИ
// ==========================================

function sendAction(action) {
    if (myRole !== 'judge') return;
    
    // Сразу запускаем анимацию для отзывчивости интерфейса
    if (action === 'guessed') animateSwipe('right');
    if (action === 'skip') animateSwipe('left');

    // Отправляем на сервер
    socket.emit('word_action', { roomId: currentRoomId, action });
}

// Инициализация свайпов (Touch Events)
function initSwipe(element) {
    let startX = 0;
    
    // Убираем старые обработчики, чтобы не дублировались
    element.ontouchstart = null;
    element.ontouchend = null;

    element.ontouchstart = (e) => {
        startX = e.touches[0].clientX;
    };

    element.ontouchend = (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        // Порог срабатывания свайпа (50px)
        if (Math.abs(diff) > 50) { 
            if (diff > 0) {
                sendAction('guessed'); // Вправо
            } else {
                sendAction('skip'); // Влево
            }
        }
    };
}

// Анимация карточки (Glass Style)
function animateSwipe(dir) {
    const card = document.getElementById('word-card');
    if (!card) return;
    
    const deg = dir === 'right' ? 15 : -15;
    const x = dir === 'right' ? 150 : -150;
    
    // 1. Улетание
    card.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
    card.style.transform = `translateX(${x}px) rotate(${deg}deg)`;
    card.style.opacity = '0';
    
    // 2. Возврат на место (скрытно)
    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform = 'scale(0.8) translateY(20px)';
        
        // 3. Появление (ждем новое слово от сервера, но визуально готовим карту)
        // Само появление произойдет в socket.on('new_word')
    }, 300);
}