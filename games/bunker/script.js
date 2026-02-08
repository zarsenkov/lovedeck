/**
 * ОБЪЕКТ СОСТОЯНИЯ ИГРЫ
 * Хранит текущие данные сессии, список игроков и текущую фазу.
 */
const GameState = {
    players: [],
    currentPlayerIndex: 0,
    currentRound: 0,
    apocalypse: "",
    isGameOver: false,
    
    // Порядок раскрытия характеристик по раундам
    rounds: [
        { id: 'profession', label: 'ПРОФЕССИЯ' },
        { id: 'health', label: 'СОСТОЯНИЕ ЗДОРОВЬЯ' },
        { id: 'hobby', label: 'ХОББИ' },
        { id: 'inventory', label: 'ИНВЕНТАРЬ' },
        { id: 'traits', label: 'ЧЕРТА ХАРАКТЕРА' },
        { id: 'secrets', label: 'ДОП. ИНФОРМАЦИЯ' }
    ]
};

/**
 * КЛАСС ИГРОКА
 * Создает структуру данных для каждого участника.
 */
class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.isExcluded = false;
        this.votes = 0;
        
        // Рандомное распределение характеристик из cards.js
        this.data = {
            profession: this.getRandom(CARDS.professions),
            health: this.getRandom(CARDS.health),
            hobbies: this.getRandom(CARDS.hobbies),
            inventory: this.getRandom(CARDS.inventory),
            traits: this.getRandom(CARDS.traits),
            secrets: this.getRandom(CARDS.secrets)
        };
        
        // Статус видимости характеристик для общего стола
        this.revealed = {
            profession: false,
            health: false,
            hobbies: false,
            inventory: false,
            traits: false,
            secrets: false
        };
    }

    // Вспомогательная функция для получения случайного элемента
    getRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

/**
 * ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
 * Устанавливает обработчики событий и запускает бут-скрин.
 */
document.addEventListener('DOMContentLoaded', () => {
    runBootSequence();
    setupEventListeners();
    generatePlayerInputs(6); // По умолчанию 6 игроков
});

// Функция имитации загрузки терминала
function runBootSequence() {
    const logs = [
        "> INITIALIZING KERNEL...",
        "> LOADING BIOMETRIC DATA...",
        "> CONNECTING TO VAULT_13...",
        "> ACCESS GRANTED."
    ];
    let i = 0;
    const logContainer = document.getElementById('boot-logs');
    
    const interval = setInterval(() => {
        if (i < logs.length) {
            const p = document.createElement('p');
            p.textContent = logs[i];
            logContainer.appendChild(p);
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => switchScreen('setup-screen'), 1000);
        }
    }, 600);
}

// Переключение между экранами
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Генерация полей для имен игроков
function generatePlayerInputs(count) {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Игрок ${i}`;
        input.value = `Выживший ${i}`;
        input.className = 'player-name-input';
        container.appendChild(input);
    }
}

/**
 * ЛОГИКА СТАРТА ИГРЫ
 * Создает игроков, генерирует апокалипсис и запускает фазу раздачи.
 */
function startGame() {
    const nameInputs = document.querySelectorAll('.player-name-input');
    GameState.players = Array.from(nameInputs).map((input, index) => new Player(index + 1, input.value));
    GameState.apocalypse = CARDS.apocalypses[Math.floor(Math.random() * CARDS.apocalypses.length)];
    
    GameState.currentPlayerIndex = 0;
    startPassSequence();
}

/**
 * ФАЗА ПЕРЕДАЧИ ТЕЛЕФОНА
 * Показывает экран "Передай телефон следующему".
 */
function startPassSequence() {
    if (GameState.currentPlayerIndex < GameState.players.length) {
        const player = GameState.players[GameState.currentPlayerIndex];
        document.getElementById('target-player-name').textContent = player.name;
        switchScreen('pass-screen');
    } else {
        // Все посмотрели роли, начинаем игру
        startMainGame();
    }
}

/**
 * ОТОБРАЖЕНИЕ РОЛИ (ПРИВАТНО)
 * Рендерит карточки характеристик для конкретного игрока.
 */
function showRole() {
    const player = GameState.players[GameState.currentPlayerIndex];
    document.getElementById('player-id').textContent = player.id;
    const grid = document.getElementById('player-role-data');
    grid.innerHTML = '';

    // Маппинг заголовков для UI
    const labels = {
        profession: "Профессия", health: "Здоровье", hobbies: "Хобби",
        inventory: "Инвентарь", traits: "Характер", secrets: "Особая карта"
    };

    for (let key in player.data) {
        const card = document.getElementById('card-template').content.cloneNode(true);
        card.querySelector('.card-label').textContent = labels[key];
        card.querySelector('.card-value').textContent = player.data[key];
        grid.appendChild(card);
    }
    switchScreen('role-screen');
}

/**
 * ОСНОВНОЙ ИГРОВОЙ ЦИКЛ
 * Отображает общую таблицу и управляет раундами.
 */
function startMainGame() {
    switchScreen('game-screen');
    document.getElementById('apocalypse-info').textContent = "КАТАСТРОФА: " + GameState.apocalypse;
    updateGameTable();
}

function updateGameTable() {
    const container = document.getElementById('players-table');
    container.innerHTML = '';
    
    // Обновляем счетчик живых
    const alive = GameState.players.filter(p => !p.isExcluded).length;
    document.getElementById('alive-count').textContent = `В ЖИВЫХ: ${alive}`;

    GameState.players.forEach(player => {
        const row = document.createElement('div');
        row.className = `player-row ${player.isExcluded ? 'excluded' : ''}`;
        
        // Формируем строку открытых данных
        let revealedData = [];
        for (let key in player.revealed) {
            if (player.revealed[key]) {
                revealedData.push(player.data[key]);
            }
        }

        row.innerHTML = `
            <strong>${player.name}</strong><br>
            <small>${revealedData.join(' | ') || 'Данные засекречены'}</small>
        `;
        container.appendChild(row);
    });
}

/**
 * УПРАВЛЕНИЕ РАУНДАМИ
 * Автоматически раскрывает характеристики всем игрокам при нажатии кнопки.
 */
function nextPhase() {
    if (GameState.currentRound < GameState.rounds.length) {
        const traitToReveal = GameState.rounds[GameState.currentRound].id;
        
        // Раскрываем эту характеристику у всех живых игроков
        GameState.players.forEach(p => {
            if (!p.isExcluded) p.revealed[traitToReveal] = true;
        });

        GameState.currentRound++;
        
        if (GameState.currentRound < GameState.rounds.length) {
            document.getElementById('current-round-title').textContent = 
                `РАУНД ${GameState.currentRound + 1}: ${GameState.rounds[GameState.currentRound].label}`;
        } else {
            document.getElementById('next-phase-btn').textContent = "ПЕРЕЙТИ К ГОЛОСОВАНИЮ";
        }
        updateGameTable();
    } else {
        startVoting();
    }
}

/**
 * СИСТЕМА ГОЛОСОВАНИЯ
 */
function startVoting() {
    switchScreen('voting-screen');
    const list = document.getElementById('voting-list');
    list.innerHTML = '';

    GameState.players.filter(p => !p.isExcluded).forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.textContent = `ИСКЛЮЧИТЬ: ${player.name}`;
        btn.onclick = () => castVote(player.id);
        list.appendChild(btn);
    });
}

function castVote(playerId) {
    const player = GameState.players.find(p => p.id === playerId);
    player.isExcluded = true;
    
    // Проверяем, сколько осталось
    const alive = GameState.players.filter(p => !p.isExcluded);
    
    if (alive.length <= Math.ceil(GameState.players.length / 2)) {
        showFinalResults();
    } else {
        // Возвращаемся в игру для следующего раунда обсуждения
        // (Или можно сделать еще один круг голосования)
        startMainGame();
    }
}

/**
 * ФИНАЛ
 */
function showFinalResults() {
    switchScreen('results-screen');
    const winnersList = document.getElementById('winners-list');
    winnersList.innerHTML = '<h3>СПИСОК ПРИНЯТЫХ В БУНКЕР:</h3>';
    
    GameState.players.filter(p => !p.isExcluded).forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-row';
        div.innerHTML = `<strong>${p.name}</strong> - ${p.data.profession}`;
        winnersList.appendChild(div);
    });

    document.getElementById('final-stamp').textContent = "ОДОБРЕНО";
}

/**
 * ОБРАБОТЧИКИ СОБЫТИЙ (EVENT LISTENERS)
 */
function setupEventListeners() {
    // Изменение кол-ва игроков
    document.getElementById('player-count').addEventListener('change', (e) => {
        generatePlayerInputs(e.target.value);
    });

    // Кнопка Старт
    document.getElementById('start-game-btn').addEventListener('click', startGame);

    // Кнопка Показать роль
    document.getElementById('show-role-btn').addEventListener('click', showRole);

    // Кнопка Подтвердить просмотр (переход к след. игроку)
    document.getElementById('confirm-role-btn').addEventListener('click', () => {
        GameState.currentPlayerIndex++;
        startPassSequence();
    });

    // Кнопка следующей фазы
    document.getElementById('next-phase-btn').addEventListener('click', nextPhase);
}
