// // Подключаем сокет к твоему серверу
const socket = io("https://lovecouple-server-zarsenkov.amvera.io"); 

// // Переводы категорий для интерфейса
const TRANSLATIONS = {
    general: "ОБЩЕЕ", science: "НАУКА", history: "ИСТОРИЯ", 
    culture: "КУЛЬТУРА", sport: "СПОРТ", geography: "ГЕОГРАФИЯ", 
    movies: "КИНО", music: "МУЗЫКА", literature: "ЛИТЕРАТУРА"
};

let myId = null;
let currentRoom = null;
let selectedCats = [];

// --- ЛОГИКА ИНТЕРФЕЙСА ---

// // Инициализация категорий из файла questions.js
function initCategories() {
    const list = document.getElementById('categories-box');
    if (!list || typeof QUIZ_QUESTIONS === 'undefined') return;

    // Собираем категории из всех сложностей
    const allQs = [...QUIZ_QUESTIONS.easy, ...QUIZ_QUESTIONS.medium, ...QUIZ_QUESTIONS.hard];
    const uniqueCats = [...new Set(allQs.map(q => q.category))];
    
    list.innerHTML = ''; // Очищаем перед отрисовкой
    uniqueCats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerText = TRANSLATIONS[cat] || cat.toUpperCase();
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

// --- СЕТЕВАЯ ЛОГИКА ---

// // Создание новой комнаты
function createRoom() {
    const name = document.getElementById('player-name').value.trim();
    if(!name) return alert("Введите имя!");
    socket.emit('quiz-create', { name });
}

// // Вход в существующую комнату
function joinRoom() {
    const name = document.getElementById('player-name').value.trim();
    const roomId = document.getElementById('room-id').value.trim().toUpperCase();
    if(!name || !roomId) return alert("Введите имя и ID!");
    socket.emit('quiz-join', { name, roomId });
}

// // Обработка входа в комнату
socket.on('quiz-room-joined', (data) => {
    currentRoom = data.roomId;
    myId = socket.id;
    document.getElementById('display-room-id').innerText = `ROOM: ${data.roomId}`;
    showScreen('lobby-screen');

    const startBtn = document.getElementById('start-game-btn');
    const catBox = document.getElementById('categories-box');
    const catTitle = document.getElementById('cats-title');

    // Настраиваем видимость для Хоста и обычного игрока
    if(data.isHost) {
        startBtn.style.display = 'block';
        catBox.style.display = 'grid';
        catTitle.style.display = 'block';
        initCategories();
    } else {
        startBtn.style.display = 'none';
        catBox.style.display = 'none';
        catTitle.style.display = 'none';
    }
});

// // Обновление списка игроков (БЕЗ ДУБЛИРОВАНИЯ)
socket.on('quiz-update-players', (players) => {
    const list = document.getElementById('lobby-players-list');
    if (!list) return;
    
    list.innerHTML = ''; // Очистка перед обновлением
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'joy-input';
        div.style.marginBottom = '8px';
        div.style.background = p.id === socket.id ? '#f0edff' : '#F1F2F6';
        div.innerHTML = `<span>${p.name} ${p.isHost ? '👑' : ''}</span>`;
        list.appendChild(div);
    });
});

// // Запрос на старт игры (от хоста)
function requestStart() {
    if(selectedCats.length === 0) return alert("Выбери темы!");
    socket.emit('quiz-start-request', { roomId: currentRoom, categories: selectedCats });
}

// // Фаза ожидания (передача хода)
socket.on('quiz-prep-phase', (data) => {
    showScreen('transfer-screen');
    document.getElementById('next-player-name').innerText = data.activePlayerName;
    const isMe = data.activePlayerId === socket.id;
    
    document.getElementById('ready-btn').style.display = isMe ? 'block' : 'none';
    document.getElementById('transfer-status').innerText = isMe ? 'Твой черед!' : 'Ждем игрока...';
});

// // Игрок готов начать свои вопросы
function playerReady() {
    socket.emit('quiz-player-ready', { roomId: currentRoom });
}

// // Получение вопроса от сервера
socket.on('quiz-question', (data) => {
    showScreen('game-screen');
    document.getElementById('question-text').innerText = data.question.question;
    document.getElementById('score-counter').innerText = data.score;
    document.getElementById('current-active-player').innerText = `ОТВЕЧАЕТ: ${data.activePlayerName}`;
    
    const box = document.getElementById('answers-box');
    box.innerHTML = '';
    
    data.question.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        btn.onclick = () => {
            // Блокируем кнопки после клика
            document.querySelectorAll('.answer-btn').forEach(b => b.style.pointerEvents = 'none');
            socket.emit('quiz-answer', { roomId: currentRoom, answerIdx: idx });
        };
        box.appendChild(btn);
    });
});

// // Результат ответа (подсветка)
socket.on('quiz-answer-result', (data) => {
    const btns = document.querySelectorAll('.answer-btn');
    if (btns[data.correctIdx]) btns[data.correctIdx].classList.add('correct');
    if (data.sentIdx !== data.correctIdx && btns[data.sentIdx]) {
        btns[data.sentIdx].classList.add('wrong');
    }
});

// // Таймер
socket.on('quiz-timer-tick', (time) => {
    document.getElementById('timer-display').innerText = time;
});

// // Финальные результаты
socket.on('quiz-results', (results) => {
    showScreen('result-screen');
    const board = document.getElementById('final-results');
    const sorted = results.sort((a,b) => b.score - a.score);
    
    board.innerHTML = sorted.map((p, i) => `
        <div style="display:flex; justify-content:space-between; padding:15px; background:#F1F2F6; border-radius:15px; margin-bottom:10px; font-weight:900;">
            <span>${i===0?'🏆 ':''}${p.name}</span>
            <span style="color:var(--bg)">${p.score}</span>
        </div>
    `).join('');
});

// --- УТИЛИТЫ ---

// // Переключение экранов
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active'); 
}

// // Возврат в главное меню
function goBack() {
    if (confirm("Выйти в главное меню?")) {
        if(socket) socket.disconnect();
        window.location.href = "../index.html";
    }
}

// // Модалка правил
function toggleRules(show) { document.getElementById('rules-modal').classList.toggle('active', show); }
