// Минимальная чистая версия онлайн-режима с локальным управлением
// Работает полностью локально без Firebase

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const connectionStatus = document.getElementById('connectionStatus');
    const createGameBtn = document.getElementById('createGameBtn');
    const joinGameBtn = document.getElementById('joinGameBtn');
    const leaveGameBtn = document.getElementById('leaveGameBtn');
    const playerNameInput = document.getElementById('playerName');
    const gameCodeInput = document.getElementById('gameCodeInput');
    const gameInfo = document.getElementById('gameInfo');
    const gameCodeDisplay = document.getElementById('gameCodeDisplay');
    const gameCreator = document.getElementById('gameCreator');
    const playerCount = document.getElementById('playerCount');
    const gameStatus = document.getElementById('gameStatus');
    const playersList = document.getElementById('playersList');
    const playersCount = document.getElementById('playersCount');
    const gameControls = document.getElementById('gameControls');
    const startGameBtn = document.getElementById('startGameBtn');
    const restartGameBtn = document.getElementById('restartGameBtn');
    const endGameBtn = document.getElementById('endGameBtn');
    const gameField = document.getElementById('gameField');
    const fieldContainer = document.getElementById('fieldContainer');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    // Состояние игры
    let gameState = {
        gameCode: null,
        creator: null,
        players: [],
        maxPlayers: 4,
        status: 'waiting', // waiting, playing, finished
        currentPlayer: null,
        field: Array(9).fill(null),
        isLocal: true
    };

    // Текущий игрок
    let currentPlayer = {
        id: generatePlayerId(),
        name: 'Игрок',
        isCreator: false,
        isConnected: true
    };

    // Инициализация
    function init() {
        updateConnectionStatus(true);
        loadPlayerName();
        setupEventListeners();
        addChatMessage('system', 'Локальный онлайн-режим запущен. Вы можете создать или присоединиться к игре.');
    }

    // Обновление статуса подключения
    function updateConnectionStatus(isConnected) {
        const statusDot = connectionStatus.querySelector('.status-dot');
        const statusText = connectionStatus.querySelector('span:last-child');
        
        if (isConnected) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Локальный режим (В сети)';
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Локальный режим (Офлайн)';
        }
    }

    // Загрузка имени игрока из localStorage
    function loadPlayerName() {
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            playerNameInput.value = savedName;
            currentPlayer.name = savedName;
        } else {
            currentPlayer.name = playerNameInput.value;
        }
    }

    // Сохранение имени игрока
    function savePlayerName() {
        currentPlayer.name = playerNameInput.value;
        localStorage.setItem('playerName', currentPlayer.name);
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        playerNameInput.addEventListener('change', savePlayerName);
        
        createGameBtn.addEventListener('click', createGame);
        joinGameBtn.addEventListener('click', joinGame);
        leaveGameBtn.addEventListener('click', leaveGame);
        
        startGameBtn.addEventListener('click', startGame);
        restartGameBtn.addEventListener('click', restartGame);
        endGameBtn.addEventListener('click', endGame);
        
        sendMessageBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        backToMenuBtn.addEventListener('click', function() {
            if (gameState.gameCode) {
                if (confirm('Вы находитесь в игре. Покинуть игру?')) {
                    window.location.href = 'index.html';
                }
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Создание новой игры
    function createGame() {
        savePlayerName();
        
        if (!currentPlayer.name.trim()) {
            alert('Пожалуйста, введите ваше имя');
            playerNameInput.focus();
            return;
        }
        
        // Генерация кода игры (4 символа)
        const code = generateGameCode();
        gameState.gameCode = code;
        gameState.creator = currentPlayer.name;
        currentPlayer.isCreator = true;
        
        // Добавляем создателя в список игроков
        gameState.players = [{
            id: currentPlayer.id,
            name: currentPlayer.name,
            isCreator: true,
            isConnected: true
        }];
        
        // Обновляем UI
        updateGameUI();
        updatePlayersList();
        
        addChatMessage('system', `Игра создана! Код: ${code}`);
        addChatMessage('system', `Вы создатель игры. Ожидайте других игроков...`);
        
        // Включаем кнопку начала игры для создателя
        startGameBtn.disabled = false;
    }

    // Присоединение к игре
    function joinGame() {
        savePlayerName();
        
        if (!currentPlayer.name.trim()) {
            alert('Пожалуйста, введите ваше имя');
            playerNameInput.focus();
            return;
        }
        
        const code = gameCodeInput.value.trim().toUpperCase();
        
        if (!code || code.length !== 4) {
            alert('Пожалуйста, введите 4-символьный код игры');
            gameCodeInput.focus();
            return;
        }
        
        // В локальном режиме всегда успешное присоединение
        gameState.gameCode = code;
        gameState.creator = 'Локальный хост';
        currentPlayer.isCreator = false;
        
        // Добавляем игрока в список
        gameState.players.push({
            id: currentPlayer.id,
            name: currentPlayer.name,
            isCreator: false,
            isConnected: true
        });
        
        // Обновляем UI
        updateGameUI();
        updatePlayersList();
        
        addChatMessage('system', `Вы присоединились к игре ${code}`);
        
        // Отключаем кнопку начала игры для не-создателя
        startGameBtn.disabled = true;
    }

    // Выход из игры
    function leaveGame() {
        if (confirm('Покинуть игру?')) {
            if (currentPlayer.isCreator) {
                // Если создатель выходит, игра завершается
                addChatMessage('system', 'Создатель покинул игру. Игра завершена.');
                endGame();
            } else {
                // Удаляем игрока из списка
                gameState.players = gameState.players.filter(p => p.id !== currentPlayer.id);
                addChatMessage('system', 'Вы покинули игру.');
            }
            
            resetGameState();
        }
    }

    // Начало игры
    function startGame() {
        if (!currentPlayer.isCreator) {
            alert('Только создатель игры может начать игру');
            return;
        }
        
        if (gameState.players.length < 2) {
            alert('Для начала игры нужно минимум 2 игрока');
            return;
        }
        
        gameState.status = 'playing';
        gameState.currentPlayer = gameState.players[0].id;
        
        updateGameUI();
        createGameField();
        addChatMessage('system', 'Игра началась!');
        
        // Обновляем кнопки
        startGameBtn.disabled = true;
        restartGameBtn.disabled = false;
        endGameBtn.disabled = false;
    }

    // Перезапуск игры
    function restartGame() {
        if (!currentPlayer.isCreator) {
            alert('Только создатель игры может перезапустить игру');
            return;
        }
        
        gameState.status = 'waiting';
        gameState.field = Array(9).fill(null);
        gameState.currentPlayer = null;
        
        updateGameUI();
        fieldContainer.innerHTML = '';
        gameField.style.display = 'none';
        
        addChatMessage('system', 'Игра перезапущена. Ожидание начала...');
        
        // Обновляем кнопки
        startGameBtn.disabled = false;
        restartGameBtn.disabled = true;
        endGameBtn.disabled = true;
    }

    // Завершение игры
    function endGame() {
        if (!currentPlayer.isCreator) {
            alert('Только создатель игры может завершить игру');
            return;
        }
        
        gameState.status = 'finished';
        updateGameUI();
        addChatMessage('system', 'Игра завершена создателем.');
        
        // Сбрасываем состояние через 3 секунды
        setTimeout(() => {
            resetGameState();
        }, 3000);
    }

    // Сброс состояния игры
    function resetGameState() {
        gameState = {
            gameCode: null,
            creator: null,
            players: [],
            maxPlayers: 4,
            status: 'waiting',
            currentPlayer: null,
            field: Array(9).fill(null),
            isLocal: true
        };
        
        currentPlayer.isCreator = false;
        
        updateGameUI();
        playersList.innerHTML = '';
        gameField.style.display = 'none';
        fieldContainer.innerHTML = '';
        
        leaveGameBtn.disabled = true;
        startGameBtn.disabled = true;
        restartGameBtn.disabled = true;
        endGameBtn.disabled = true;
    }

    // Обновление UI игры
    function updateGameUI() {
        if (gameState.gameCode) {
            gameInfo.style.display = 'block';
            gameControls.style.display = 'block';
            leaveGameBtn.disabled = false;
            
            gameCodeDisplay.textContent = gameState.gameCode;
            gameCreator.textContent = gameState.creator;
            playerCount.textContent = `${gameState.players.length}/${gameState.maxPlayers}`;
            
            switch(gameState.status) {
                case 'waiting':
                    gameStatus.textContent = 'Ожидание';
                    gameStatus.className = 'info-value status-waiting';
                    break;
                case 'playing':
                    gameStatus.textContent = 'Игра идет';
                    gameStatus.className = 'info-value status-playing';
                    break;
                case 'finished':
                    gameStatus.textContent = 'Завершена';
                    gameStatus.className = 'info-value status-finished';
                    break;
            }
            
            playersCount.textContent = gameState.players.length;
        } else {
            gameInfo.style.display = 'none';
            gameControls.style.display = 'none';
            leaveGameBtn.disabled = true;
        }
    }

    // Обновление списка игроков
    function updatePlayersList() {
        playersList.innerHTML = '';
        
        gameState.players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            
            if (player.isCreator) {
                playerElement.classList.add('creator');
            }
            
            if (player.id === gameState.currentPlayer) {
                playerElement.classList.add('current-turn');
            }
            
            playerElement.innerHTML = `
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    ${player.isCreator ? '<span class="player-badge creator-badge"><i class="fas fa-crown"></i> Создатель</span>' : ''}
                    ${player.id === gameState.currentPlayer ? '<span class="player-badge turn-badge"><i class="fas fa-play"></i> Ходит</span>' : ''}
                </div>
                <div class="player-status">
                    <span class="status-dot ${player.isConnected ? 'connected' : 'offline'}"></span>
                    <span>${player.isConnected ? 'В сети' : 'Офлайн'}</span>
                </div>
            `;
            
            playersList.appendChild(playerElement);
        });
    }

    // Создание игрового поля
    function createGameField() {
        gameField.style.display = 'block';
        fieldContainer.innerHTML = '';
        
        const fieldGrid = document.createElement('div');
        fieldGrid.className = 'field-grid';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'field-cell';
            cell.dataset.index = i;
            
            cell.addEventListener('click', () => makeMove(i));
            
            if (gameState.field[i]) {
                cell.textContent = gameState.field[i];
                cell.classList.add(gameState.field[i] === 'X' ? 'cell-x' : 'cell-o');
            }
            
            fieldGrid.appendChild(cell);
        }
        
        fieldContainer.appendChild(fieldGrid);
    }

    // Ход игрока
    function makeMove(index) {
        if (gameState.status !== 'playing') {
            addChatMessage('system', 'Игра не активна');
            return;
        }
        
        if (gameState.currentPlayer !== currentPlayer.id) {
            addChatMessage('system', 'Сейчас не ваш ход');
            return;
        }
        
        if (gameState.field[index]) {
            addChatMessage('system', 'Эта ячейка уже занята');
            return;
        }
        
        // Определяем символ игрока (X или O)
        const playerIndex = gameState.players.findIndex(p => p.id === currentPlayer.id);
        const symbol = playerIndex === 0 ? 'X' : 'O';
        
        // Делаем ход
        gameState.field[index] = symbol;
        
        // Проверяем победу
        const winner = checkWinner();
        
        if (winner) {
            gameState.status = 'finished';
            addChatMessage('system', `Игрок ${currentPlayer.name} (${symbol}) победил!`);
            highlightWinningCells(winner.line);
        } else if (gameState.field.every(cell => cell !== null)) {
            // Ничья
            gameState.status = 'finished';
            addChatMessage('system', 'Ничья! Все клетки заполнены.');
        } else {
            // Передаем ход следующему игроку
            const currentIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer);
            const nextIndex = (currentIndex + 1) % gameState.players.length;
            gameState.currentPlayer = gameState.players[nextIndex].id;
            
            addChatMessage('system', `Ход переходит к ${gameState.players[nextIndex].name}`);
        }
        
        // Обновляем UI
        updateGameUI();
        updatePlayersList();
        createGameField();
    }

    // Проверка победы
    function checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (let line of lines) {
            const [a, b, c] = line;
            if (gameState.field[a] && 
                gameState.field[a] === gameState.field[b] && 
                gameState.field[a] === gameState.field[c]) {
                return { symbol: gameState.field[a], line };
            }
        }
        
        return null;
    }

    // Подсветка выигрышной комбинации
    function highlightWinningCells(line) {
        setTimeout(() => {
            const cells = document.querySelectorAll('.field-cell');
            line.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
        }, 100);
    }

    // Добавление сообщения в чат
    function addChatMessage(sender, text) {
        const messageDiv = document.createElement('div');
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = `
            <span class="message-time">${timeString}</span>
            <span class="message-text">${text}</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Отправка сообщения
    function sendMessage() {
        const text = chatInput.value.trim();
        
        if (!text) return;
        
        if (!gameState.gameCode) {
            addChatMessage('system', 'Сначала создайте или присоединитесь к игре');
            chatInput.value = '';
            return;
        }
        
        addChatMessage('player', `<strong>${currentPlayer.name}:</strong> ${text}`);
        chatInput.value = '';
        
        // В реальном режиме здесь будет отправка сообщения другим игрокам
        // В локальном режиме просто добавляем системное сообщение
        if (gameState.players.length > 1) {
            setTimeout(() => {
                const otherPlayers = gameState.players.filter(p => p.id !== currentPlayer.id);
                if (otherPlayers.length > 0) {
                    addChatMessage('system', `Сообщение отправлено ${otherPlayers.length} игрокам`);
                }
            }, 500);
        }
    }

    // Вспомогательные функции
    function generateGameCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    // Запуск приложения
    init();
});
