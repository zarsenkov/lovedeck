/**
 * ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ
 * Хранит всех персонажей, текущий этап и данные катастрофы.
 */
const GameState = {
    players: [],
    currentPlayerIndex: 0,
    currentRound: 0,
    apocalypse: "",
    
    // Последовательность раскрытия данных в раундах
    rounds: [
        { id: 'profession', label: 'ПРОФЕССИЯ' },
        { id: 'health', label: 'СОСТОЯНИЕ ЗДОРОВЬЯ' },
        { id: 'hobbies', label: 'ПРИКЛАДНЫЕ НАВЫКИ' },
        { id: 'inventory', label: 'ЛИЧНОЕ ИМУЩЕСТВО' },
        { id: 'traits', label: 'ПСИХОТИП' },
        { id: 'secrets', label: 'ОСОБЫЕ ОТМЕТКИ' }
    ]
};

/**
 * КЛАСС ПЕРСОНАЖА
 * Генерирует уникальный набор характеристик для каждого игрока.
 */
class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.isExcluded = false; // Статус: выбывший или в игре
        
        // Генерация данных на основе базы в cards.js
        this.data = {
            profession: this.pickRandom(CARDS.professions),
            health: this.pickRandom(CARDS.health),
            hobbies: this.pickRandom(CARDS.hobbies),
            inventory: this.pickRandom(CARDS.inventory),
            traits: this.pickRandom(CARDS.traits),
            secrets: this.pickRandom(CARDS.secrets)
        };
        
        // Какие данные уже известны остальным игрокам
        this.revealed = {
            profession: false, health: false, hobbies: false,
            inventory: false, traits: false, secrets: false
        };
    }

    // Вспомогательный метод для выбора случайного элемента
    pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

/**
 * ИНИЦИАЛИЗАЦИЯ ПРИ ЗАПУСКЕ
 */
document.addEventListener('DOMContentLoaded', () => {
    // Скрываем лишние экраны и настраиваем интерфейс
    generatePlayerInputs(6);
    setupEventListeners();
    
    // Небольшая задержка для эффекта "загрузки дела"
    setTimeout(() => {
        document.getElementById('boot-screen').classList.remove('active');
        document.getElementById('setup-screen').classList.add('active');
    }, 1500);
});

// Генерирует поля для ввода имен в зависимости от числа игроков
function generatePlayerInputs(count) {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Анкета №${i}`;
        input.value = `Выживший ${i}`;
        input.className = 'player-name-input';
        container.appendChild(input);
    }
}

/**
 * НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ
 */
function setupEventListeners() {
    // Слушатель изменения количества игроков
    document.getElementById('player-count').addEventListener('input', (e) => {
        generatePlayerInputs(e.target.value);
    });

    // Запуск процесса распределения ролей
    document.getElementById('start-game-btn').addEventListener('click', () => {
        const nameInputs = document.querySelectorAll('.player-name-input');
        GameState.players = Array.from(nameInputs).map((input, index) => new Player(index + 1, input.value));
        GameState.apocalypse = CARDS.apocalypses[Math.floor(Math.random() * CARDS.apocalypses.length)];
        
        GameState.currentPlayerIndex = 0;
        startPassSequence();
    });

    // Кнопка открытия досье
    document.getElementById('show-role-btn').addEventListener('click', renderPrivateDossier);

    // Подтверждение просмотра и переход к следующему
    document.getElementById('confirm-role-btn').addEventListener('click', () => {
        GameState.currentPlayerIndex++;
        startPassSequence();
    });

    // Кнопка перехода к следующему раунду обсуждения
    document.getElementById('next-phase-btn').addEventListener('click', nextGamePhase);
}

/**
 * ЛОГИКА ПЕРЕДАЧИ УСТРОЙСТВА
 */
function startPassSequence() {
    if (GameState.currentPlayerIndex < GameState.players.length) {
        const player = GameState.players[GameState.currentPlayerIndex];
        document.getElementById('target-player-name').textContent = player.name.toUpperCase();
        switchScreen('pass-screen');
    } else {
        // Все игроки ознакомлены с ролями
        startMainGame();
    }
}

/**
 * ПРИВАТНЫЙ ПРОСМОТР АНКЕТЫ
 * Отображает все данные текущего игрока.
 */
function renderPrivateDossier() {
    const player = GameState.players[GameState.currentPlayerIndex];
    document.getElementById('player-id').textContent = `00${player.id}-ARCHIVE`;
    const grid = document.getElementById('player-role-data');
    grid.innerHTML = '';

    const labels = {
        profession: "1. РОД ДЕЯТЕЛЬНОСТИ", health: "2. МЕД. ПОКАЗАТЕЛИ",
        hobbies: "3. ПРИКЛАДНЫЕ НАВЫКИ", inventory: "4. ИМУЩЕСТВО",
        traits: "5. ЛИЧНЫЕ ЧЕРТЫ", secrets: "6. ОСОБАЯ КАРТА"
    };

    for (let key in player.data) {
        const item = document.createElement('div');
        item.className = 'card';
        item.innerHTML = `
            <div class="card-label">${labels[key]}</div>
            <div class="card-value">${player.data[key]}</div>
        `;
        grid.appendChild(item);
    }
    switchScreen('role-screen');
}

/**
 * ГЛАВНЫЙ ЭКРАН ИГРЫ
 */
function startMainGame() {
    switchScreen('game-screen');
    document.getElementById('apocalypse-info').innerHTML = `<strong>СВОДКА КАТАСТРОФЫ:</strong> <br> ${GameState.apocalypse}`;
    updateMainTable();
}

// Обновление общего списка выживших на столе
function updateMainTable() {
    const container = document.getElementById('players-table');
    container.innerHTML = '';
    
    const alive = GameState.players.filter(p => !p.isExcluded).length;
    document.getElementById('alive-count').textContent = `В ГРУППЕ: ${alive}`;

    GameState.players.forEach(player => {
        const row = document.createElement('div');
        row.className = `player-row ${player.isExcluded ? 'excluded' : ''}`;
        
        let info = [];
        for (let key in player.revealed) {
            if (player.revealed[key]) info.push(player.data[key]);
        }

        row.innerHTML = `
            <div style="font-weight:bold; color:#1a1a1a;">${player.name}</div>
            <div style="font-size:0.8rem;">${info.join(' | ') || '[ ДАННЫЕ ЗАСЕКРЕЧЕНЫ ]'}</div>
        `;
        container.appendChild(row);
    });
}

/**
 * УПРАВЛЕНИЕ РАУНДАМИ
 * Раскрывает по одной характеристике у каждого игрока.
 */
function nextGamePhase() {
    if (GameState.currentRound < GameState.rounds.length) {
        const traitKey = GameState.rounds[GameState.currentRound].id;
        
        // Автоматическое раскрытие характеристики для всех
        GameState.players.forEach(p => {
            if (!p.isExcluded) p.revealed[traitKey] = true;
        });

        GameState.currentRound++;
        
        // Обновление заголовка раунда
        if (GameState.currentRound < GameState.rounds.length) {
            document.getElementById('current-round-title').textContent = 
                `ЭТАП ${GameState.currentRound + 1}: ${GameState.rounds[GameState.currentRound].label}`;
        } else {
            document.getElementById('next-phase-btn').textContent = "ПЕРЕЙТИ К ИСКЛЮЧЕНИЮ";
        }
        updateMainTable();
    } else {
        showVotingScreen();
    }
}

/**
 * ЭКРАН ГОЛОСОВАНИЯ
 */
function showVotingScreen() {
    switchScreen('voting-screen');
    const list = document.getElementById('voting-list');
    list.innerHTML = '';

    GameState.players.filter(p => !p.isExcluded).forEach(player => {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.style.margin = "5px";
        btn.textContent = `ВЫЧЕРКНУТЬ: ${player.name}`;
        btn.onclick = () => {
            player.isExcluded = true;
            // Проверяем: если осталось пол-группы, заканчиваем
            const stillAlive = GameState.players.filter(p => !p.isExcluded).length;
            const target = Math.ceil(GameState.players.length / 2);
            
            if (stillAlive <= target) {
                renderFinalResults();
            } else {
                startMainGame(); // Возврат к обсуждению
            }
        };
        list.appendChild(btn);
    });
}

/**
 * ФИНАЛЬНЫЙ ЭКРАН С ЭФФЕКТОМ ПЕЧАТИ
 */
function renderFinalResults() {
    switchScreen('results-screen');
    const winnersList = document.getElementById('winners-list');
    winnersList.innerHTML = '<h3 style="text-decoration: underline; margin-bottom: 20px;">СПИСОК ЛИЦ, ПОЛУЧИВШИХ ДОСТУП:</h3>';
    
    GameState.players.filter(p => !p.isExcluded).forEach(p => {
        const div = document.createElement('div');
        div.style.marginBottom = "10px";
        div.innerHTML = `<strong>- ${p.name.toUpperCase()}</strong> (${p.data.profession})`;
        winnersList.appendChild(div);
    });

    // Активация визуальной печати "ОДОБРЕНО"
    const stamp = document.getElementById('final-stamp');
    stamp.textContent = "ДОПУЩЕНЫ";
    stamp.classList.add('visible');
}

// Утилита для переключения экранов
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
