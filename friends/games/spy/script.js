// База данных локаций
const LOCATIONS = [
    // Еда и напитки
    "Ресторан", "Кафе", "Бар", "Кофейня", "Пиццерия",
    "Бургерная", "Суши-бар", "Столовая", "Буфет", "Кондитерская",
    "Мороженое", "Пекарня", "Фаст-фуд", "Фуд-корт", "Винный бар",
    "Пивоварня", "Чайная", "Стэйк-хаус", "Рыбный ресторан", "Веганское кафе",
    "Стрит-фуд", "Фудтрак", "Кулинарная школа", "Дегустация", "Шашлычная",
    "Блинная", "Пельменная", "Сырная лавка", "Кофейная плантация", "Шоколадная фабрика",
    
    // Развлечения
    "Кинотеатр", "Театр", "Концертный зал", "Ночной клуб", "Караоке",
    "Боулинг", "Бильярдная", "Казино", "Игровой зал", "Парк развлечений",
    "Аквапарк", "Зоопарк", "Цирк", "Музей", "Выставка",
    "Фестиваль", "Карнавал", "Ярмарка", "Квест-комната", "Пейнтбол",
    "Лазертаг", "Тир", "Каток", "Роллердром", "Скалодром",
    "Йога-студия", "Танцевальная школа", "Фотостудия", "Студия звукозаписи", "Аттракцион",
    "Планетарий", "Океанариум", "Дельфинарий", "Ботанический сад", "Оранжерея",
    
    // Спорт
    "Футбольный стадион", "Баскетбольная площадка", "Теннисный корт", "Бассейн", "Спортзал",
    "Стадион", "Каток", "Лыжная база", "Скалодром", "Боксерский ринг",
    "Гольф-клуб", "Боулинг", "Бильярдная", "Тир", "Велотрек",
    "Беговая дорожка", "Йога-студия", "Фитнес-клуб", "Спортивный зал", "Тренажерный зал",
    "Гимнастический зал", "Водный стадион", "Конный клуб", "Яхт-клуб", "Серф-спот",
    "Дайвинг-центр", "Альпинистская стена", "Парашютный клуб", "Автодром", "Картинг",
    "Бейсбольное поле", "Волейбольная площадка", "Бадминтонный корт", "Скейт-парк", "Спортивная арена",
    
    // Городская инфраструктура
    "Банк", "Полицейский участок", "Больница", "Школа", "Университет",
    "Библиотека", "Торговый центр", "Супермаркет", "Рынок", "Аэропорт",
    "Вокзал", "Автобусная остановка", "Такси", "Метро", "Поезд",
    "Гостиница", "Отель", "Хостел", "Аптека", "Почта",
    "Пожарная часть", "Суд", "Тюрьма", "Ратуша", "Посольство",
    "Биржа", "Офис", "Завод", "Фабрика", "Склад",
    "Строительная площадка", "Автосервис", "Автомойка", "Шиномонтаж", "Автозаправка",
    
    // Путешествия и природа
    "Пляж", "Горы", "Лес", "Пустыня", "Остров",
    "Столица", "Деревня", "Курорт", "Отель", "Кемпинг",
    "Круизный лайнер", "Поезд", "Самолет", "Автобус", "Такси",
    "Вертолет", "Подводная лодка", "Космический корабль", "Дирижабль", "Воздушный шар",
    "Сафари", "Джунгли", "Пещера", "Водопад", "Вулкан",
    "Каньон", "Оазис", "Лагуна", "Бухта", "Мыс",
    "Заповедник", "Национальный парк", "Заказник", "Эко-ферма", "Виноградник",
    
    // Фэнтези и вымышленные
    "Замок", "Дворец", "Подземелье", "Башня", "Крепость",
    "Пиратский корабль", "Космическая станция", "Подводная лаборатория", "Лунная база", "Магическая академия",
    "Эльфийский лес", "Драконье логово", "Волшебная страна", "Затерянный город", "Храм древних",
    "Лабиринт Минотавра", "Тронный зал", "Сокровищница", "Алхимическая лаборатория", "Библиотека заклинаний",
    "Гора Олимп", "Валгалла", "Рай", "Ад", "Чистилище",
    "Машина времени", "Телепорт", "Портал", "Измерение", "Параллельная вселенная",
    
    // Культура и искусство
    "Опера", "Балет", "Картинная галерея", "Антикварный магазин", "Аукцион",
    "Книжный магазин", "Арт-студия", "Скульптурная мастерская", "Ювелирная лавка", "Музыкальный магазин",
    "Киностудия", "Телестудия", "Радиостанция", "Газетная редакция", "Издательство",
    "Фотоателье", "Костюмерная", "Реквизиторская", "Сцена", "Гримерка",
    
    // Повседневная жизнь
    "Парикмахерская", "Салон красоты", "СПА-салон", "Маникюрный салон", "Тату-салон",
    "Прачечная", "Химчистка", "Ателье", "Ремонтная мастерская", "Строительный магазин",
    "Мебельный магазин", "Садовый центр", "Цветочный магазин", "Зоомагазин", "Детский магазин",
    "Игрушечный магазин", "Канцелярский магазин", "Компьютерный магазин", "Электронный магазин", "Техномаркет",
    
    // Образование и наука
    "Школа", "Университет", "Колледж", "Лицей", "Гимназия",
    "Детский сад", "Ясли", "Курсы", "Семинар", "Конференция",
    "Лаборатория", "Обсерватория", "Исследовательский центр", "Научный институт", "Архив",
    "Библиотека", "Читальный зал", "Кабинет", "Аудитория", "Лекционный зал",
    
    // Религия и духовность
    "Церковь", "Храм", "Мечеть", "Синагога", "Пагода",
    "Монастырь", "Ашрам", "Медитационный центр", "Йога-студия", "Ретрит",
    "Священное место", "Место паломничества", "Святыня", "Алтарь", "Часовня",
    
    // Экстрим и приключения
    "Банджи-джампинг", "Роуп-джампинг", "Бейсджампинг", "Вингсьют", "Парапланеризм",
    "Скайдайвинг", "Сноуборд-парк", "Фристайл-склон", "Хели-ски", "Фрирайд",
    "Рафтинг", "Каякинг", "Вейкбординг", "Кайтсерфинг", "Виндсерфинг",
    "Спелеология", "Альпинизм", "Скалолазание", "Трекинг", "Хайкинг",
    
    // Исторические места
    "Пирамида", "Колизей", "Великая Китайская стена", "Мачу-Пикчу", "Стоунхендж",
    "Тадж-Махал", "Петергоф", "Версаль", "Букингемский дворец", "Белый дом",
    "Кремль", "Эйфелева башня", "Статуя Свободы", "Биг-Бен", "Собор Василия Блаженного",
    "Римский форум", "Акрополь", "Парфенон", "Гиза", "Пергам",
    
    // Технологии и будущее
    "Робототехнический центр", "Киберкафе", "Виртуальная реальность", "Хакерспейс", "Фаблаб",
    "3D-принтинг центр", "Нано-лаборатория", "Квантовая лаборатория", "ИИ-центр", "Крипто-биржа",
    "Серверная", "Дата-центр", "Облачное хранилище", "Киберпанк-бар", "Неоновый город",
    
    // Сельское хозяйство
    "Ферма", "Фермерский рынок", "Сад", "Огород", "Теплица",
    "Пасека", "Молочная ферма", "Птицеферма", "Свиноферма", "Конюшня",
    "Винодельня", "Сырный завод", "Маслобойня", "Мельница", "Амбар",
    
    // Водные объекты
    "Озеро", "Река", "Море", "Океан", "Пролив",
    "Залив", "Фьорд", "Лиман", "Эстуарий", "Дельта",
    "Ручей", "Родник", "Источник", "Гейзер", "Горячий источник",
    
    // Необычные места
    "Заброшенный город", "Призрачный город", "Подземный город", "Плавающий город", "Летающий город",
    "Стеклянный дом", "Дом на дереве", "Иглу", "Юрта", "Вигвам",
    "Дом-перевертыш", "Кривой дом", "Дом-ботинок", "Дом-гриб", "Дом-камень",
    
    // Сезонные и праздничные
    "Новогодняя ярмарка", "Рождественский рынок", "Пасхальная ярмарка", "Хэллоуин-вечеринка", "Карнавал в Венеции",
    "Октоберфест", "День рождения", "Свадьба", "Юбилей", "Выпускной"
];

// Состояние игры
let gameState = {
    players: [],
    spies: [],
    location: "",
    currentPlayerIndex: 0,
    totalPlayers: 5,
    spyCount: 1,
    discussionTime: 5,
    timerInterval: null,
    timeLeft: 0,
    votes: {},
    isTimerPaused: false,
    gameStarted: false
};

// Инициализация
function init() {
    updateSpyCountLimit();
    showNotification("Добро пожаловать в игру Шпион! 👋", "info");
}

// Уведомления
function showNotification(message, type = "info") {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Модальные окна
let confirmCallback = null;

function showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.getElementById('confirmAction').onclick = function() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeModal('confirmModal');
};

function confirmGoBack() {
    showConfirm("Вернуться на главную страницу? Текущая игра будет сброшена.", function() {
        window.location.href = 'https://lovecouple.ru/friends/';
    });
}

function showRules() {
    document.getElementById('rulesModal').classList.add('active');
}

// Настройки игры
function changePlayerCount(change) {
    const input = document.getElementById('playerCount');
    let value = parseInt(input.value) + change;
    
    if (value < 3) value = 3;
    if (value > 8) value = 8;
    
    input.value = value;
    gameState.totalPlayers = value;
    updateSpyCountLimit();
}

function updateSpyCountLimit() {
    const spyInput = document.getElementById('spyCount');
    const maxSpies = gameState.totalPlayers >= 6 ? 2 : 1;
    
    spyInput.max = maxSpies;
    if (parseInt(spyInput.value) > maxSpies) {
        spyInput.value = maxSpies;
        gameState.spyCount = maxSpies;
    }
}

function changeSpyCount(change) {
    const input = document.getElementById('spyCount');
    let value = parseInt(input.value) + change;
    const max = parseInt(input.max);
    
    if (value < 1) value = 1;
    if (value > max) value = max;
    
    input.value = value;
    gameState.spyCount = value;
}

function selectTime(minutes) {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    gameState.discussionTime = minutes;
}

// Подготовка игры
function prepareGame() {
    // Выбрать случайную локацию
    gameState.location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    // Показать экран ввода имен
    showNamesScreen();
}

function showNamesScreen() {
    // Создать поля для ввода имен
    const namesInputs = document.getElementById('playerNamesInputs');
    namesInputs.innerHTML = '';
    
    for (let i = 0; i < gameState.totalPlayers; i++) {
        const div = document.createElement('div');
        div.className = 'name-input-group';
        div.innerHTML = `
            <label for="playerName${i}">Игрок ${i + 1}:</label>
            <input type="text" 
                   id="playerName${i}" 
                   placeholder="Имя игрока ${i + 1}"
                   maxlength="20">
        `;
        namesInputs.appendChild(div);
    }
    
    showScreen('namesScreen');
}

function startGame() {
    // Собрать имена игроков
    gameState.players = [];
    for (let i = 0; i < gameState.totalPlayers; i++) {
        const input = document.getElementById(`playerName${i}`);
        const name = input.value.trim() || `Игрок ${i + 1}`;
        
        gameState.players.push({
            id: i + 1,
            name: name,
            isSpy: false,
            hasSeenRole: false
        });
    }
    
    // Выбрать шпионов
    gameState.spies = [];
    for (let i = 0; i < gameState.spyCount; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * gameState.totalPlayers);
        } while (gameState.players[randomIndex].isSpy);
        
        gameState.players[randomIndex].isSpy = true;
        gameState.spies.push(randomIndex + 1);
    }
    
    gameState.currentPlayerIndex = 0;
    gameState.votes = {};
    gameState.gameStarted = true;
    
    // Показать экран распределения ролей
    showRoleScreen();
    showNotification("Игра началась! Передавайте устройство первому игроку 👤", "success");
}

// Экран ролей
function showRoleScreen() {
    showScreen('roleScreen');
    updatePlayersList();
}

function updatePlayersList() {
    const playersList = document.querySelector('.players-list');
    playersList.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = `player-item ${player.hasSeenRole ? 'completed' : ''} ${index === gameState.currentPlayerIndex ? 'current' : ''}`;
        div.onclick = () => showPlayerRole(index);
        
        div.innerHTML = `
            <div class="player-avatar">
                <i class="fas ${player.hasSeenRole ? 'fa-check-circle' : 'fa-user'}"></i>
            </div>
            <div class="player-details">
                <h3>${player.name}</h3>
                <p>${player.hasSeenRole ? 'Уже посмотрел роль' : 'Нажмите, чтобы посмотреть роль'}</p>
            </div>
            ${index === gameState.currentPlayerIndex ? '<div class="player-indicator"><i class="fas fa-chevron-right"></i></div>' : ''}
        `;
        
        playersList.appendChild(div);
    });
    
    // Обновить имя текущего игрока
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('currentPlayerName').textContent = currentPlayer.name;
}

function showPlayerRole(playerIndex) {
    const player = gameState.players[playerIndex];
    
    if (playerIndex !== gameState.currentPlayerIndex) {
        showNotification(`Сейчас не очередь ${player.name}. Передайте устройство правильно!`, "error");
        return;
    }
    
    if (player.isSpy) {
        showScreen('spyRoleScreen');
    } else {
        document.getElementById('currentLocation').textContent = gameState.location;
        document.getElementById('locationForPlayer').textContent = gameState.location;
        showScreen('playerRoleScreen');
    }
}

function hideRole() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    currentPlayer.hasSeenRole = true;
    
    // Перейти к следующему игроку
    gameState.currentPlayerIndex++;
    
    if (gameState.currentPlayerIndex < gameState.totalPlayers) {
        // Есть еще игроки
        showRoleScreen();
        const nextPlayer = gameState.players[gameState.currentPlayerIndex];
        showNotification(`Передайте устройство ${nextPlayer.name}`, "info");
    } else {
        // Все посмотрели роли
        startDiscussion();
    }
}

function skipRemaining() {
    if (confirm("Пропустить оставшихся игроков и начать обсуждение?")) {
        startDiscussion();
    }
}

function backToNames() {
    if (confirm("Вернуться к вводу имен? Текущие настройки игры будут сброшены.")) {
        showNamesScreen();
    }
}

function backToSetup() {
    if (confirm("Вернуться к настройкам? Текущие данные будут сброшены.")) {
        showScreen('setupScreen');
    }
}

// Обсуждение
function startDiscussion() {
    showScreen('discussionScreen');
    
    // Обновить информацию
    document.getElementById('playersCount').textContent = gameState.totalPlayers;
    document.getElementById('spiesCount').textContent = gameState.spyCount;
    document.getElementById('discussionLocation').textContent = "???";
    
    // Запустить таймер
    startTimer();
    showNotification("Обсуждение началось! Ищите шпиона! 🔍", "info");
}

function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timeLeft = gameState.discussionTime * 60;
    gameState.isTimerPaused = false;
    updateTimerDisplay();
    
    const timerProgress = document.querySelector('.timer-progress');
    const circumference = 2 * Math.PI * 45;
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = circumference;
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isTimerPaused) {
            gameState.timeLeft--;
            updateTimerDisplay();
            
            // Обновить прогресс
            const progress = (gameState.timeLeft / (gameState.discussionTime * 60)) * circumference;
            timerProgress.style.strokeDashoffset = circumference - progress;
            
            // Изменить цвет при малом времени
            if (gameState.timeLeft <= 30) {
                timerProgress.style.stroke = '#ef4444';
            }
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                showNotification("Время вышло! Начинаем голосование...", "warning");
                setTimeout(startVoting, 1000);
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    
    document.getElementById('timerMinutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timerSeconds').textContent = seconds.toString().padStart(2, '0');
    document.getElementById('timeLeftDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    const btn = document.getElementById('pauseBtn');
    
    if (gameState.isTimerPaused) {
        // Продолжить
        gameState.isTimerPaused = false;
        btn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        showNotification("Таймер продолжен", "info");
    } else {
        // Пауза
        gameState.isTimerPaused = true;
        btn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
        showNotification("Таймер на паузе", "warning");
    }
}

// Голосование
function startVoting() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    showScreen('votingScreen');
    updateVotingList();
    
    showNotification("Голосование началось! Выберите подозреваемого 👤", "info");
}

function updateVotingList() {
    const votingList = document.getElementById('votingList');
    votingList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'vote-item';
        
        div.innerHTML = `
            <div class="vote-player">
                <div class="vote-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="vote-info">
                    <h3>${player.name}</h3>
                    <p>${player.isSpy ? 'Шпион 👁️' : 'Мирный игрок'}</p>
                </div>
            </div>
            <div class="vote-controls">
                <button class="vote-btn" onclick="addVote(${player.id})">
                    <i class="fas fa-vote-yea"></i> Голосовать
                </button>
                <div class="vote-count">
                    <i class="fas fa-heart"></i>
                    <span>${gameState.votes[player.id] || 0}</span>
                </div>
            </div>
        `;
        
        votingList.appendChild(div);
    });
    
    updateVotingProgress();
}

function addVote(playerId) {
    if (!gameState.votes[playerId]) {
        gameState.votes[playerId] = 0;
    }
    gameState.votes[playerId]++;
    
    updateVotingList();
    showNotification(`Голос за ${gameState.players[playerId-1].name} учтен!`, "success");
}

function updateVotingProgress() {
    const totalVotes = Object.values(gameState.votes).reduce((a, b) => a + b, 0);
    
    document.getElementById('votesCount').textContent = totalVotes;
    document.getElementById('totalVoters').textContent = gameState.totalPlayers;
    
    const progress = (totalVotes / gameState.totalPlayers) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

function backToDiscussion() {
    if (confirm("Вернуться к обсуждению?")) {
        showScreen('discussionScreen');
        startTimer();
    }
}

function showResults() {
    // Найти игрока с максимальным количеством голосов
    let maxVotes = 0;
    let suspectedPlayers = [];
    
    for (const [playerId, votes] of Object.entries(gameState.votes)) {
        if (votes > maxVotes) {
            maxVotes = votes;
            suspectedPlayers = [parseInt(playerId)];
        } else if (votes === maxVotes && votes > 0) {
            suspectedPlayers.push(parseInt(playerId));
        }
    }
    
    // Определить результат
    const isSpyCaught = suspectedPlayers.some(playerId => 
        gameState.players[playerId - 1].isSpy
    );
    
    // Показать результаты
    showResultsScreen(isSpyCaught, suspectedPlayers);
}

function showResultsScreen(isSpyCaught, suspectedPlayers) {
    const resultsContent = document.getElementById('resultsContent');
    const suspectedNames = suspectedPlayers.map(id => gameState.players[id-1].name).join(', ');
    const spyNames = gameState.spies.map(id => gameState.players[id-1].name).join(', ');
    
    if (isSpyCaught) {
        resultsContent.innerHTML = `
            <div class="results-win">
                <div class="results-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h2>🎉 Игроки победили!</h2>
                <p class="results-subtitle">Шпион был успешно раскрыт!</p>
                
                <div class="results-details">
                    <div class="detail-card">
                        <h4><i class="fas fa-map-marker-alt"></i> Локация:</h4>
                        <p>${gameState.location}</p>
                    </div>
                    <div class="detail-card">
                        <h4><i class="fas fa-user-secret"></i> Шпионы:</h4>
                        <p class="spy-names">${spyNames}</p>
                    </div>
                    <div class="detail-card">
                        <h4><i class="fas fa-user"></i> Подозреваемый:</h4>
                        <p>${suspectedNames}</p>
                    </div>
                </div>
                
                <div class="results-message">
                    <p>🎯 Шпион был вычислен! Мирные игроки справились с задачей.</p>
                </div>
            </div>
        `;
    } else {
        resultsContent.innerHTML = `
            <div class="results-lose">
                <div class="results-icon">
                    <i class="fas fa-user-secret"></i>
                </div>
                <h2>🕵️ Шпионы победили!</h2>
                <p class="results-subtitle">Игроки не смогли найти шпиона...</p>
                
                <div class="results-details">
                    <div class="detail-card">
                        <h4><i class="fas fa-map-marker-alt"></i> Локация:</h4>
                        <p>${gameState.location}</p>
                    </div>
                    <div class="detail-card">
                        <h4><i class="fas fa-user-secret"></i> Настоящие шпионы:</h4>
                        <p class="spy-names">${spyNames}</p>
                    </div>
                    <div class="detail-card">
                        <h4><i class="fas fa-user"></i> Подозреваемый:</h4>
                        <p>${suspectedNames || 'Не определен'}</p>
                    </div>
                </div>
                
                <div class="results-message">
                    <p>🎭 Шпионы хорошо замаскировались и остались незамеченными!</p>
                </div>
            </div>
        `;
    }
    
    showScreen('resultsScreen');
}

// Новая игра
function newGame() {
    gameState = {
        players: [],
        spies: [],
        location: "",
        currentPlayerIndex: 0,
        totalPlayers: 5,
        spyCount: 1,
        discussionTime: 5,
        timerInterval: null,
        timeLeft: 0,
        votes: {},
        isTimerPaused: false,
        gameStarted: false
    };
    
    document.getElementById('playerCount').value = 5;
    document.getElementById('spyCount').value = 1;
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.time-btn').classList.add('active');
    
    showScreen('setupScreen');
    showNotification("Новая игра готова! Настройте параметры и начинайте! 🎮", "success");
}

// Утилиты
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Инициализация при загрузке
window.onload = init;
