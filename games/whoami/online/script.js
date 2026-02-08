// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
// Подключаемся к серверу через Socket.io
const socket = io("https://lovecouple-server-zarsenkov.amvera.io"); 
let myName, myRoom; 
let isMyTurn = false;      // Флаг: мой ли сейчас ход угадывать
let categoriesData = {};   // Сюда загрузим все слова из JSON
let selectedCats = [];     // Выбранные категории для игры

// --- ЗАГРУЗКА ДАННЫХ ---
// Получаем слова из файла при загрузке страницы
fetch('categories.json')
    .then(r => r.json())
    .then(data => {
        categoriesData = data.categories || data;
        const box = document.getElementById('categories-box');
        
        // Создаем кнопки для каждой категории в лобби
        Object.keys(categoriesData).forEach(cat => {
            const btn = document.createElement('div');
            btn.className = 'cat-item';
            btn.innerText = cat;
            
            // Логика выбора категорий по клику
            btn.onclick = () => {
                btn.classList.toggle('selected');
                if(selectedCats.includes(cat)) {
                    selectedCats = selectedCats.filter(c => c !== cat);
                } else {
                    selectedCats.push(cat);
                }
            };
            box.appendChild(btn);
        });
    });

// --- ФУНКЦИЯ: Переключение экранов ---
// Скрывает все секции и показывает ту, чей ID передан
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- ФУНКЦИЯ: Вход в игру ---
// Собирает имя и ID комнаты, отправляет серверу
function joinGame() {
    myName = document.getElementById('player-name').value.trim();
    myRoom = document.getElementById('room-id').value.trim();
    
    if(myName && myRoom) {
        socket.emit('whoami-join', { roomId: myRoom, playerName: myName });
        showScreen('lobby-screen');
        document.getElementById('room-display').innerText = "КОМНАТА: " + myRoom;
    } else {
        alert("Введите имя и ID комнаты!");
    }
}

// --- СОБЫТИЕ: Обновление списка игроков ---
// Вызывается сервером, когда кто-то заходит или выходит
socket.on('whoami-update-lobby', (data) => {
    const list = document.getElementById('players-list');
    // Обновляем список имен и очков в лобби
    list.innerHTML = data.players.map(p => `<li>${p.name} — ${p.score} очков</li>`).join('');
    
    // Если текущий игрок первый в списке — он хост, показываем настройки
    if(data.players[0] && data.players[0].id === socket.id) {
        document.getElementById('host-controls').style.display = 'block';
        document.getElementById('wait-msg').style.display = 'none';
    } else {
        document.getElementById('host-controls').style.display = 'none';
        document.getElementById('wait-msg').style.display = 'block';
    }
});

// --- ФУНКЦИЯ: Запуск игры (только для хоста) ---
// Собирает настройки и отправляет серверу команду начать
function startGame() {
    if(selectedCats.length === 0) return alert("Выбери хотя бы одну категорию!");
    
    const rounds = document.getElementById('rounds-count').value;
    const timer = document.getElementById('turn-time').value;
    
    // Собираем все слова из выбранных категорий в один массив
    let pool = [];
    selectedCats.forEach(cat => pool.push(...categoriesData[cat]));
    // Перемешиваем массив слов
    pool = pool.sort(() => Math.random() - 0.5); 

    socket.emit('whoami-start', { 
        roomId: myRoom, 
        words: pool, 
        timer: parseInt(timer), 
        rounds: parseInt(rounds) 
    });
}

// --- СОБЫТИЕ: Новый ход или новое слово ---
// Основная логика отображения слова и управления таймером
socket.on('whoami-new-turn', (data) => {
    showScreen('game-screen'); // Переключаемся на экран игры
    
    // Обновляем счетчик раундов
    document.getElementById('current-round').innerText = data.round;
    document.getElementById('total-rounds').innerText = data.totalRounds;
    
    // Проверяем: угадываю я или кто-то другой
    isMyTurn = (socket.id === data.activePlayerId);
    document.getElementById('active-player-name').innerText = data.activePlayerName;
    
    const wordEl = document.getElementById('current-word');
    const instrEl = document.getElementById('instruction');
    const controls = document.getElementById('action-buttons');

    if(isMyTurn) {
        // Если мой ход: я не должен видеть слово
        wordEl.innerText = "ПРИЛОЖИ КО ЛБУ";
        instrEl.innerText = "Ты угадываешь! Слушай друзей.";
        controls.style.display = 'none'; // Скрываем кнопки управления
    } else {
        // Если ход другого: я вижу слово и объясняю
        wordEl.innerText = data.word;
        instrEl.innerText = "Объясняй игроку " + data.activePlayerName;
        controls.style.display = 'grid'; // Показываем кнопки "Пас" и "Угадал"
    }
    
    // Запускаем таймер только если ход перешел к НОВОМУ игроку
    if (data.isNewPlayer) {
        startTimer(data.timer);
    }
});

// --- ФУНКЦИЯ: Отправка результата (Угадал/Пас) ---
function sendAction(isCorrect) {
    socket.emit('whoami-action', { roomId: myRoom, isCorrect: isCorrect });
}

// --- ФУНКЦИЯ: Работа таймера ---
// Отсчитывает время назад и по нулям отправляет событие таймаута
function startTimer(sec) {
    let timeLeft = sec;
    const el = document.getElementById('timer');
    
    // Очищаем старый интервал, если он был
    if (window.gameTimer) clearInterval(window.gameTimer);
    
    window.gameTimer = setInterval(() => {
        timeLeft--;
        el.innerText = timeLeft;
        
        if(timeLeft <= 0) {
            clearInterval(window.gameTimer);
            // Только угадывающий отправляет сигнал о конце времени
            if(isMyTurn) {
                socket.emit('whoami-timeout', myRoom);
            }
        }
    }, 1000);
}

// --- ФУНКЦИЯ: Выход из комнаты ---
// Сбрасывает состояние и возвращает в меню
function leaveRoom() {
    if (myRoom) {
        if (confirm("Вы точно хотите выйти? Прогресс будет потерян.")) {
            socket.emit('whoami-leave', myRoom); // Уведомляем сервер
            if (window.gameTimer) clearInterval(window.gameTimer); // Стоп таймер
            myRoom = null;
            showScreen('join-screen'); // Назад к вводу имени
        }
    }
}

// --- СОБЫТИЕ: Конец игры ---
// Показывает финальную таблицу очков
socket.on('whoami-game-over', (data) => {
    if (window.gameTimer) clearInterval(window.gameTimer);
    showScreen('result-screen');
    
    const stats = document.getElementById('final-stats');
    // Сортируем игроков: у кого больше очков — тот выше
    const sorted = data.players.sort((a, b) => b.score - a.score);
    
    stats.innerHTML = sorted.map((p, index) => `
        <div class="result-row" style="${index === 0 ? 'background: #fff3cd;' : ''}">
            <span>${index + 1}. <b>${p.name}</b></span>
            <span>${p.score} очков</span>
        </div>
    `).join('');
});
