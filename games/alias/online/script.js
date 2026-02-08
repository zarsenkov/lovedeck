// !!! ЗАМЕНИ ЭТОТ URL НА СВОЙ ЕСЛИ ОН ИЗМЕНИЛСЯ !!!
const SERVER_URL = "https://lovecouple-server-zarsenkov.amvera.io";

const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

let myId = null;
let currentRoomId = null;
let myRole = null; // 'explainer', 'judge', 'guesser'

// --- ПОДКЛЮЧЕНИЕ ---
socket.on('connect', () => {
    console.log("Connected, ID:", socket.id);
    myId = socket.id;
});

// --- UI УПРАВЛЕНИЕ ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    // Кнопка НАЗАД показывается везде, кроме экрана логина
    const backBtn = document.getElementById('back-btn');
    if (id === 'screen-login') {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'flex';
    }
}

function exitGame() {
    if (confirm("Выйти из игры?")) {
        // Перезагрузка страницы - самый чистый способ выйти и сбросить сокет
        window.location.reload();
    }
}

// --- ФУНКЦИИ ЛОББИ ---
function createRoom() {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Введи имя!");
    socket.emit('create_room', { playerName: name });
}

function joinRoom() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    if (!name || !code) return alert("Введи имя и код!");
    socket.emit('join_room', { roomId: code, playerName: name });
}

function startGame() {
    if (!currentRoomId) return;
    socket.emit('start_game', currentRoomId);
}

// --- СОБЫТИЯ ОТ СЕРВЕРА ---

socket.on('room_created', (data) => {
    const rId = data.roomId || data;
    currentRoomId = rId;
    document.getElementById('lobby-code').innerText = rId;
    showScreen('screen-lobby');
});

socket.on('update_lobby', (room) => {
    currentRoomId = room.id;
    
    // Если игра еще не идет, держим в лобби
    if (room.state === 'lobby') {
        // Если мы не в игре и не в лобби - перекидываем в лобби
        if (!document.getElementById('screen-game').classList.contains('active')) {
            showScreen('screen-lobby');
        }
    }

    // Список игроков
    const list = document.getElementById('player-list');
    list.innerHTML = room.players.map(p => 
        `<li style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between;">
            <span>${p.name} ${p.id === myId ? '(Вы)' : ''}</span>
            <b>${p.score}</b>
         </li>`
    ).join('');

    // Кнопка старта только у хоста (первого в списке)
    const isHost = room.players.length > 0 && room.players[0].id === myId;
    document.getElementById('start-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('wait-msg').style.display = isHost ? 'none' : 'block';
});

socket.on('round_start', ({ explainerId, judgeId }) => {
    console.log("Round Started!");
    showScreen('screen-game');

    // Сброс UI
    document.getElementById('judge-controls').classList.add('hidden');
    document.getElementById('current-word').innerText = "...";
    
    const roleEl = document.getElementById('my-role');
    const instrEl = document.getElementById('instruction-text');
    const card = document.getElementById('word-card');

    if (myId === explainerId) {
        myRole = 'explainer';
        roleEl.innerText = "🗣 Объясняй";
        instrEl.innerText = "Объясняй слова!";
        removeSwipe(card);
    } else if (myId === judgeId) {
        myRole = 'judge';
        roleEl.innerText = "⚖️ Судья";
        instrEl.innerText = "Свайпай карточку!";
        document.getElementById('judge-controls').classList.remove('hidden');
        initSwipe(card); // Включаем свайп
    } else {
        myRole = 'guesser';
        roleEl.innerText = "🎧 Угадывай";
        instrEl.innerText = "Слушай и называй слова";
        removeSwipe(card);
    }
});

socket.on('new_word', (word) => {
    const el = document.getElementById('current-word');
    if (myRole === 'explainer' || myRole === 'judge') {
        el.innerText = word;
        // Анимация появления
        const card = document.getElementById('word-card');
        card.style.transform = 'scale(0.5)';
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.27)';
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }, 50);
    } else {
        el.innerText = "???";
    }
});

socket.on('timer_update', (t) => document.getElementById('timer').innerText = t);
socket.on('round_end', () => { alert("Время вышло!"); showScreen('screen-lobby'); });
socket.on('error_msg', (m) => alert(m));

// --- СВАЙПЫ (ИСПРАВЛЕНО ДЛЯ МОБИЛЬНЫХ) ---

function sendAction(action) {
    if (myRole !== 'judge') return;
    socket.emit('word_action', { roomId: currentRoomId, action });
    animateSwipe(action === 'guessed' ? 'right' : 'left');
}

function removeSwipe(element) {
    // Удаляем слушатели клонированием элемента
    const newEl = element.cloneNode(true);
    element.parentNode.replaceChild(newEl, element);
}

function initSwipe(element) {
    removeSwipe(element); // Очистка старых
    const el = document.getElementById('word-card'); // Берем новый элемент после очистки
    
    let startX = 0;
    let isDragging = false;

    // Используем addEventListener с passive: false для блокировки скролла
    el.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        el.style.transition = 'none'; // Убираем плавность при перетаскивании
    }, { passive: false });

    el.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // БЛОКИРУЕМ СКРОЛЛ СТРАНИЦЫ
        
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const rotate = diff / 10;
        
        el.style.transform = `translateX(${diff}px) rotate(${rotate}deg)`;
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (Math.abs(diff) > 80) { // Если свайпнули достаточно далеко
            if (diff > 0) sendAction('guessed');
            else sendAction('skip');
        } else {
            // Возврат на место
            el.style.transition = 'transform 0.3s ease';
            el.style.transform = 'translateX(0) rotate(0)';
        }
    });
}

function animateSwipe(dir) {
    const card = document.getElementById('word-card');
    const x = dir === 'right' ? 200 : -200;
    const r = dir === 'right' ? 30 : -30;
    
    card.style.transition = 'all 0.3s ease';
    card.style.transform = `translateX(${x}px) rotate(${r}deg)`;
    card.style.opacity = '0';
}