// Конфигурация
const socket = io(); // В Amvera будет работать автоматически
const TRANSLATIONS = {
    general: "ОБЩЕЕ", science: "НАУКА", history: "ИСТОРИЯ", 
    culture: "КУЛЬТУРА", sport: "СПОРТ", geography: "ГЕОГРАФИЯ", 
    movies: "КИНО", music: "МУЗЫКА", literature: "ЛИТЕРАТУРА"
};

let myId = null;
let currentRoom = null;
let selectedCats = [];
let wakeLock = null;

// --- ИНИЦИАЛИЗАЦИЯ ---

// Функция отрисовки категорий при загрузке
function initCategories() {
    const list = document.getElementById('categories-box');
    const allQs = [...QUIZ_QUESTIONS.easy, ...QUIZ_QUESTIONS.medium, ...QUIZ_QUESTIONS.hard];
    const uniqueCats = [...new Set(allQs.map(q => q.category))];
    
    uniqueCats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerText = TRANSLATIONS[cat] || cat.toUpperCase();
        div.onclick = () => {
            div.classList.toggle('selected');
            selectedCats.includes(cat) ? selectedCats = selectedCats.filter(c => c !== cat) : selectedCats.push(cat);
        };
        list.appendChild(div);
    });
}

// --- SOCKET СОБЫТИЯ ---

// Создание комнаты
function createRoom() {
    const name = document.getElementById('player-name').value.trim();
    if(!name) return alert("Введите имя!");
    socket.emit('quiz-create', { name });
}

// Вход в комнату
function joinRoom() {
    const name = document.getElementById('player-name').value.trim();
    const roomId = document.getElementById('room-id').value.trim().toUpperCase();
    if(!name || !roomId) return alert("Введите имя и ID комнаты!");
    socket.emit('quiz-join', { name, roomId });
}

// Успешный вход
socket.on('quiz-room-joined', (data) => {
    currentRoom = data.roomId;
    myId = socket.id;
    document.getElementById('display-room-id').innerText = `ROOM: ${data.roomId}`;
    showScreen('lobby-screen');
    // Показываем кнопку "Старт" только хосту
    if(data.isHost) document.getElementById('start-game-btn').style.display = 'block';
});

// Обновление списка игроков в лобби
socket.on('quiz-update-players', (players) => {
    const list = document.getElementById('lobby-players-list');
    list.innerHTML = players.map(p => `
        <div class="joy-input" style="margin-bottom:5px; background: ${p.id === socket.id ? '#f0edff' : '#F1F2F6'}">
            ${p.name} ${p.isHost ? '👑' : ''}
        </div>
    `).join('');
});

// Начало раунда (экран ожидания)
socket.on('quiz-prep-phase', (data) => {
    showScreen('transfer-screen');
    document.getElementById('next-player-name').innerText = data.activePlayerName;
    const isMe = data.activePlayerId === socket.id;
    
    document.getElementById('ready-btn').style.display = isMe ? 'block' : 'none';
    document.getElementById('transfer-status').innerText = isMe ? 'Твой ход! Жми кнопку:' : 'Игрок готовится...';
});

// Старт вопросов
socket.on('quiz-question', (data) => {
    showScreen('game-screen');
    renderQuestion(data);
});

// Обновление таймера от сервера
socket.on('quiz-timer-tick', (time) => {
    document.getElementById('timer-display').innerText = time;
});

// Результаты
socket.on('quiz-results', (results) => {
    showScreen('result-screen');
    const board = document.getElementById('final-results');
    const sorted = results.sort((a,b) => b.score - a.score);
    
    board.innerHTML = sorted.map((p, i) => `
        <div style="display:flex; justify-content:space-between; padding:15px; background:#F1F2F6; border-radius:15px; margin-bottom:10px; font-weight:900; border: 2px solid ${i===0?'var(--bg)':'#eee'}">
            <span>${i===0?'🏆 ':''}${p.name}</span>
            <span style="color:var(--bg)">${p.score}</span>
        </div>
    `).join('');
});

// --- ГЕЙМПЛЕЙНЫЕ ФУНКЦИИ ---

// Запрос на старт от хоста
function requestStart() {
    if(selectedCats.length === 0) return alert("Выберите хотя бы одну тему!");
    socket.emit('quiz-start-request', { roomId: currentRoom, categories: selectedCats });
}

// Игрок готов начать свой ход
function playerReady() {
    socket.emit('quiz-player-ready', { roomId: currentRoom });
    try { if ('wakeLock' in navigator) navigator.wakeLock.request('screen'); } catch(e){}
}

// Отрисовка вопроса
function renderQuestion(data) {
    const { question, score, activePlayerName } = data;
    document.getElementById('question-text').innerText = question.question;
    document.getElementById('score-counter').innerText = score;
    document.getElementById('current-active-player').innerText = `ОТВЕЧАЕТ: ${activePlayerName}`;
    
    const box = document.getElementById('answers-box');
    box.innerHTML = '';
    
    question.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        // Только активный игрок может кликать
        btn.onclick = () => {
            socket.emit('quiz-answer', { roomId: currentRoom, answerIdx: idx });
        };
        box.appendChild(btn);
    });
}

// Подсветка ответа (результат хода)
socket.on('quiz-answer-result', (data) => {
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach((btn, idx) => {
        btn.style.pointerEvents = 'none';
        if(idx === data.correctIdx) btn.classList.add('correct');
        if(idx === data.sentIdx && !data.isCorrect) btn.classList.add('wrong');
    });
});

// --- УТИЛИТЫ ---
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active'); 
}

function toggleRules(show) { document.getElementById('rules-modal').classList.toggle('active', show); }

function goBack() {
    if (confirm("Выйти из игры?")) location.reload();
}

initCategories();
