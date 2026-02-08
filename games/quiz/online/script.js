// Подключение к конкретному серверу Amvera
const socket = io("https://lovecouple-server-zarsenkov.amvera.io"); 

// Словарик для перевода категорий
const TRANSLATIONS = {
    general: "ОБЩЕЕ", science: "НАУКА", history: "ИСТОРИЯ", 
    culture: "КУЛЬТУРА", sport: "СПОРТ", geography: "ГЕОГРАФИЯ", 
    movies: "КИНО", music: "МУЗЫКА", literature: "ЛИТЕРАТУРА"
};

let myId = null;
let currentRoom = null;
let selectedCats = [];

// --- ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА ---

// // Функция отрисовки тем (категорий)
function initCategories() {
    const list = document.getElementById('categories-box');
    if (!list) return; // Если элемента нет на экране, выходим
    
    // Проверяем наличие базы вопросов
    if (typeof QUIZ_QUESTIONS === 'undefined') {
        console.error("Ошибка: QUIZ_QUESTIONS не найден. Проверьте путь к questions.js");
        return;
    }

    // Собираем все уникальные категории из всех уровней сложности
    const allQs = [
        ...(QUIZ_QUESTIONS.easy || []), 
        ...(QUIZ_QUESTIONS.medium || []), 
        ...(QUIZ_QUESTIONS.hard || [])
    ];
    
    const uniqueCats = [...new Set(allQs.map(q => q.category))];
    
    // Очищаем контейнер перед отрисовкой, чтобы избежать дублей
    list.innerHTML = '';
    
    uniqueCats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerText = TRANSLATIONS[cat] || cat.toUpperCase();
        
        // Обработка выбора категории
        div.onclick = () => {
            div.classList.toggle('selected');
            if (selectedCats.includes(cat)) {
                selectedCats = selectedCats.filter(c => c !== cat);
            } else {
                selectedCats.push(cat);
            }
        };
        list.appendChild(div);
    });
}

// --- СЕТЕВЫЕ СОБЫТИЯ (SOCKET.IO) ---

// // Функция создания новой комнаты
function createRoom() {
    const name = document.getElementById('player-name').value.trim();
    if(!name) return alert("Введите имя!");
    socket.emit('quiz-create', { name });
}

// // Функция входа в существующую комнату
function joinRoom() {
    const name = document.getElementById('player-name').value.trim();
    const roomId = document.getElementById('room-id').value.trim().toUpperCase();
    if(!name || !roomId) return alert("Введите имя и ID комнаты!");
    socket.emit('quiz-join', { name, roomId });
}

// // Событие: Успешное подключение к комнате
socket.on('quiz-room-joined', (data) => {
    currentRoom = data.roomId;
    myId = socket.id;
    document.getElementById('display-room-id').innerText = `ROOM: ${data.roomId}`;
    showScreen('lobby-screen');
    
    const startBtn = document.getElementById('start-game-btn');
    const catBox = document.getElementById('categories-box');
    const catHeader = catBox.previousElementSibling; // Заголовок "ТЕМЫ ИГРЫ"

    // Только Хост (создатель) управляет настройками
    if(data.isHost) {
        if(startBtn) startBtn.style.display = 'block';
        if(catBox) catBox.style.display = 'grid';
        if(catHeader) catHeader.style.display = 'block';
        initCategories(); // Рисуем темы только для хоста
    } else {
        if(startBtn) startBtn.style.display = 'none';
        if(catBox) catBox.style.display = 'none';
        if(catHeader) catHeader.style.display = 'none';
    }
});

// // Событие: Обновление списка игроков (ИСПРАВЛЕНО ДУБЛИРОВАНИЕ)
socket.on('quiz-update-players', (players) => {
    const list = document.getElementById('lobby-players-list');
    if (!list) return;
    
    // ВАЖНО: Очищаем список перед каждым обновлением
    list.innerHTML = '';
    
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'joy-input';
        div.style.marginBottom = '8px';
        div.style.background = p.id === socket.id ? '#f0edff' : '#F1F2F6';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.innerHTML = `
            <span>${p.name} ${p.isHost ? '👑' : ''}</span>
            <span style="font-size: 10px; opacity: 0.5;">${p.id === socket.id ? '(ВЫ)' : ''}</span>
        `;
        list.appendChild(div);
    });
});

// // Функция запроса старта игры
function requestStart() {
    if(selectedCats.length === 0) return alert("Выберите темы для игры!");
    socket.emit('quiz-start-request', { roomId: currentRoom, categories: selectedCats });
}

// // Функция готовности игрока к своему ходу
function playerReady() {
    socket.emit('quiz-player-ready', { roomId: currentRoom });
}

// // Событие: Подготовка к ходу (экран передачи)
socket.on('quiz-prep-phase', (data) => {
    showScreen('transfer-screen');
    document.getElementById('next-player-name').innerText = data.activePlayerName;
    const isMe = data.activePlayerId === socket.id;
    const readyBtn = document.getElementById('ready-btn');
    if(readyBtn) readyBtn.style.display = isMe ? 'block' : 'none';
});

// // Событие: Получение вопроса
socket.on('quiz-question', (data) => {
    showScreen('game-screen');
    const box = document.getElementById('answers-box');
    document.getElementById('question-text').innerText = data.question.question;
    document.getElementById('score-counter').innerText = data.score;
    document.getElementById('current-active-player').innerText = `ОТВЕЧАЕТ: ${data.activePlayerName}`;
    
    box.innerHTML = '';
    data.question.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        // Клик отправляет ответ на сервер
        btn.onclick = () => socket.emit('quiz-answer', { roomId: currentRoom, answerIdx: idx });
        box.appendChild(btn);
    });
});

// // Обновление серверного таймера
socket.on('quiz-timer-tick', (time) => {
    const timerDisp = document.getElementById('timer-display');
    if(timerDisp) timerDisp.innerText = time;
});

// // Переключение экранов
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active'); 
}

// // Возврат назад (с перезагрузкой)
function goBack() {
    if (confirm("Выйти из игры?")) location.reload();
}

// // Управление модалкой правил
function toggleRules(show) {
    const modal = document.getElementById('rules-modal');
    if(modal) modal.classList.toggle('active', show);
}
