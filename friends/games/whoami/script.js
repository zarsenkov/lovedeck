// ===== ОСНОВНАЯ ЛОГИКА ИГРЫ "КТО Я?" =====

// Состояние игры
const GameState = {
    WELCOME: 'welcome',
    PLAYING: 'playing',
    RESULTS: 'results',
    SETTINGS: 'settings',
    RULES: 'rules',
    CUSTOM_WORDS: 'custom_words'
};

let currentState = GameState.WELCOME;
let gameData = {
    players: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    totalRounds: 5,
    currentWord: null,
    usedWords: new Set(),
    scores: {},
    gameMode: 'classic',
    selectedCategories: ['characters', 'movies', 'celebrities'],
    timer: null,
    timeLeft: 60,
    isTimerRunning: false,
    hintShown: false,
    settings: {
        sound: true,
        animations: true,
        roundTime: 60,
        roundsCount: 5,
        difficulty: 'medium'
    }
};

// Инициализация игры
function initGame() {
    loadSettings();
    updateStats();
    renderCategories();
    showScreen(GameState.WELCOME);
    
    // Инициализация звуков
    initAudio();
}

// Показать экран
function showScreen(screen) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать нужный экран
    const screenElement = document.getElementById(`${screen}Screen`);
    if (screenElement) {
        screenElement.classList.add('active');
        currentState = screen;
    }
    
    // Остановить таймер при уходе с игрового экрана
    if (screen !== GameState.PLAYING) {
        stopTimer();
    }
}

// Загрузка настроек
function loadSettings() {
    try {
        const saved = localStorage.getItem('whoami_settings');
        if (saved) {
            gameData.settings = { ...gameData.settings, ...JSON.parse(saved) };
        }
        
        // Применить настройки
        document.getElementById('soundToggle').checked = gameData.settings.sound;
        document.getElementById('animationsToggle').checked = gameData.settings.animations;
        document.getElementById('roundTime').value = gameData.settings.roundTime;
        document.getElementById('roundsCount').value = gameData.settings.roundsCount;
        document.getElementById('roundsValue').textContent = gameData.settings.roundsCount;
        document.getElementById('difficulty').value = gameData.settings.difficulty;
        
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
    }
}

// Сохранение настроек
function saveSettings() {
    try {
        gameData.settings.sound = document.getElementById('soundToggle').checked;
        gameData.settings.animations = document.getElementById('animationsToggle').checked;
        gameData.settings.roundTime = parseInt(document.getElementById('roundTime').value);
        gameData.settings.roundsCount = parseInt(document.getElementById('roundsCount').value);
        gameData.settings.difficulty = document.getElementById('difficulty').value;
        
        localStorage.setItem('whoami_settings', JSON.stringify(gameData.settings));
        playSound('click');
        showNotification('Настройки сохранены!', 'success');
        closeSettings();
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        showNotification('Ошибка сохранения', 'error');
    }
}

// Обновление статистики
function updateStats() {
    try {
        const stats = JSON.parse(localStorage.getItem('whoami_stats') || '{}');
        
        document.getElementById('totalGames').textContent = stats.totalGames || 0;
        document.getElementById('bestScore').textContent = stats.bestScore || 0;
        document.getElementById('winsCount').textContent = stats.winsCount || 0;
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
    }
}

// Сохранение статистики
function saveStats(result) {
    try {
        const stats = JSON.parse(localStorage.getItem('whoami_stats') || '{}');
        
        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.winsCount = (stats.winsCount || 0) + (result.won ? 1 : 0);
        
        if (result.score > (stats.bestScore || 0)) {
            stats.bestScore = result.score;
        }
        
        localStorage.setItem('whoami_stats', JSON.stringify(stats));
        updateStats();
    } catch (error) {
        console.error('Ошибка сохранения статистики:', error);
    }
}

// Рендер категорий
function renderCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    const categories = getAllCategories();
    container.innerHTML = '';
    
    categories.forEach(category => {
        const isSelected = gameData.selectedCategories.includes(category.id);
        
        const categoryElement = document.createElement('div');
        categoryElement.className = `category-item ${isSelected ? 'selected' : ''}`;
        categoryElement.innerHTML = `
            <i class="${category.icon}"></i>
            <div>${category.name}</div>
            <small>${category.words.length} слов</small>
        `;
        
        categoryElement.onclick = () => toggleCategory(category.id);
        
        container.appendChild(categoryElement);
    });
}

// Переключение категории
function toggleCategory(categoryId) {
    playSound('click');
    
    const index = gameData.selectedCategories.indexOf(categoryId);
    if (index > -1) {
        // Удалить категорию, если их больше 1
        if (gameData.selectedCategories.length > 1) {
            gameData.selectedCategories.splice(index, 1);
        } else {
            showNotification('Нужна хотя бы одна категория!', 'warning');
            return;
        }
    } else {
        // Добавить категорию
        gameData.selectedCategories.push(categoryId);
    }
    
    renderCategories();
}

// Изменение количества игроков
function changePlayerCount(delta) {
    let count = parseInt(document.getElementById('playerCount').textContent);
    count += delta;
    
    // Ограничения: от 2 до 8 игроков
    if (count < 2) count = 2;
    if (count > 8) count = 8;
    
    document.getElementById('playerCount').textContent = count;
    playSound('click');
}

// Начало игры
function startGame() {
    playSound('click');
    
    // Получаем настройки
    const playerCount = parseInt(document.getElementById('playerCount').textContent);
    gameData.gameMode = document.getElementById('gameMode').value;
    gameData.totalRounds = gameData.settings.roundsCount;
    
    // Создаем игроков
    gameData.players = [];
    gameData.scores = {};
    
    for (let i = 1; i <= playerCount; i++) {
        gameData.players.push(`Игрок ${i}`);
        gameData.scores[`Игрок ${i}`] = 0;
    }
    
    gameData.currentPlayerIndex = 0;
    gameData.currentRound = 1;
    gameData.usedWords.clear();
    gameData.hintShown = false;
    
    // Показываем экран игры
    updateGameScreen();
    showScreen(GameState.PLAYING);
    
    // Начинаем первый раунд
    startRound();
}

// Обновление игрового экрана
function updateGameScreen() {
    // Обновляем информацию о раунде
    document.getElementById('currentRound').textContent = gameData.currentRound;
    document.getElementById('totalRounds').textContent = gameData.totalRounds;
    
    // Обновляем таймер
    const timePerRound = getGameMode(gameData.gameMode).timePerRound || gameData.settings.roundTime;
    document.getElementById('timer').textContent = timePerRound;
    gameData.timeLeft = timePerRound;
    
    // Обновляем статистику игроков
    updatePlayersStats();
}

// Обновление статистики игроков
function updatePlayersStats() {
    const container = document.getElementById('playersStats');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameData.players.forEach((player, index) => {
        const isCurrent = index === gameData.currentPlayerIndex;
        const score = gameData.scores[player] || 0;
        
        const statElement = document.createElement('div');
        statElement.className = `player-stat ${isCurrent ? 'current' : ''}`;
        
        // Определяем лидера
        const isLeading = gameData.players.some(p => {
            return gameData.scores[p] > score && p !== player;
        }) === false && score > 0;
        
        if (isLeading) {
            statElement.classList.add('leading');
        }
        
        statElement.innerHTML = `
            <div class="player-name">
                ${isCurrent ? '<i class="fas fa-user-clock"></i>' : ''}
                ${player}
            </div>
            <div class="player-score">${score} <small>очков</small></div>
            <div class="player-status">
                ${isCurrent ? 'Сейчас играет' : ''}
            </div>
        `;
        
        container.appendChild(statElement);
    });
}

// Начало раунда
function startRound() {
    // Останавливаем предыдущий таймер
    stopTimer();
    
    // Получаем новое слово
    gameData.currentWord = getRandomWord(gameData.selectedCategories);
    gameData.usedWords.add(gameData.currentWord.text);
    gameData.hintShown = false;
    
    // Обновляем интерфейс
    document.getElementById('characterName').textContent = '???';
    document.getElementById('characterName').classList.remove('revealed');
    document.getElementById('categoryBadge').textContent = gameData.currentWord.categoryName || 'Персонажи';
    document.getElementById('currentPlayer').textContent = gameData.players[gameData.currentPlayerIndex];
    document.getElementById('characterHint').textContent = 'Подсказка появится через 30 секунд';
    
    // Запускаем таймер
    const timePerRound = getGameMode(gameData.gameMode).timePerRound || gameData.settings.roundTime;
    gameData.timeLeft = timePerRound;
    startTimer();
    
    // Запускаем таймер подсказки
    setTimeout(() => {
        if (currentState === GameState.PLAYING && !gameData.hintShown) {
            showHint();
        }
    }, 30000);
    
    playSound('timer');
}

// Запуск таймера
function startTimer() {
    if (gameData.isTimerRunning) return;
    
    gameData.isTimerRunning = true;
    const timerElement = document.getElementById('timer');
    
    gameData.timer = setInterval(() => {
        gameData.timeLeft--;
        timerElement.textContent = gameData.timeLeft;
        
        // Визуальные эффекты для таймера
        if (gameData.timeLeft <= 10) {
            timerElement.classList.add('danger');
            timerElement.classList.remove('warning');
            
            if (gameData.timeLeft <= 5) {
                playSound('timer');
            }
        } else if (gameData.timeLeft <= 30) {
            timerElement.classList.add('warning');
        }
        
        if (gameData.timeLeft <= 0) {
            endRound();
        }
    }, 1000);
}

// Остановка таймера
function stopTimer() {
    if (gameData.timer) {
        clearInterval(gameData.timer);
        gameData.timer = null;
    }
    gameData.isTimerRunning = false;
    
    // Сброс стилей таймера
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.classList.remove('warning', 'danger');
    }
}

// Показать подсказку
function showHint() {
    if (!gameData.currentWord || gameData.hintShown) return;
    
    playSound('click');
    gameData.hintShown = true;
    
    document.getElementById('characterHint').textContent = gameData.currentWord.hint || 'Нет подсказки';
    
    // Анимация появления подсказки
    const hintElement = document.getElementById('characterHint');
    hintElement.style.animation = 'none';
    setTimeout(() => {
        hintElement.style.animation = 'fadeIn 0.5s ease';
    }, 10);
    
    showNotification('Подсказка показана!', 'info');
}

// Правильный ответ
function correctGuess() {
    if (!gameData.currentWord) return;
    
    playSound('correct');
    
    // Показываем слово
    document.getElementById('characterName').textContent = gameData.currentWord.text;
    document.getElementById('characterName').classList.add('revealed');
    
    // Начисляем очки
    const currentPlayer = gameData.players[gameData.currentPlayerIndex];
    let points = 3; // Базовые очки
    
    if (!gameData.hintShown) points += 2; // Бонус за угадывание без подсказки
    if (gameData.timeLeft > 30) points += 1; // Бонус за скорость
    
    gameData.scores[currentPlayer] = (gameData.scores[currentPlayer] || 0) + points;
    
    // Показываем уведомление
    showNotification(`${currentPlayer} получает ${points} очков!`, 'success');
    
    // Переходим к следующему игроку через 2 секунды
    setTimeout(() => {
        nextPlayer();
    }, 2000);
}

// Неправильный ответ
function wrongGuess() {
    playSound('wrong');
    
    // Штраф за неправильный ответ
    const currentPlayer = gameData.players[gameData.currentPlayerIndex];
    gameData.scores[currentPlayer] = Math.max(0, (gameData.scores[currentPlayer] || 0) - 1);
    
    showNotification(`-1 очко для ${currentPlayer}`, 'error');
    
    // Следующий игрок
    setTimeout(() => {
        nextPlayer();
    }, 1000);
}

// Пропустить карточку
function skipCard() {
    playSound('click');
    showNotification('Карточка пропущена', 'warning');
    nextPlayer();
}

// Переход к следующему игроку
function nextPlayer() {
    gameData.currentPlayerIndex = (gameData.currentPlayerIndex + 1) % gameData.players.length;
    
    // Если круг завершен, переходим к следующему раунду
    if (gameData.currentPlayerIndex === 0) {
        gameData.currentRound++;
        
        if (gameData.currentRound > gameData.totalRounds) {
            endGame();
            return;
        }
    }
    
    updateGameScreen();
    startRound();
}

// Завершение раунда
function endRound() {
    stopTimer();
    
    if (gameData.currentWord) {
        // Показываем слово, если оно не было угадано
        document.getElementById('characterName').textContent = gameData.currentWord.text;
        document.getElementById('characterName').classList.add('revealed');
        
        showNotification('Время вышло!', 'warning');
        
        // Переходим к следующему игроку через 2 секунды
        setTimeout(() => {
            nextPlayer();
        }, 2000);
    }
}

// Завершение игры
function endGame() {
    stopTimer();
    playSound('win');
    
    // Определяем победителя
    let winner = null;
    let maxScore = -1;
    
    gameData.players.forEach(player => {
        const score = gameData.scores[player] || 0;
        if (score > maxScore) {
            maxScore = score;
            winner = player;
        }
    });
    
    // Обновляем экран результатов
    document.getElementById('resultsMessage').textContent = 
        maxScore > 0 ? `Победитель: ${winner} с ${maxScore} очками!` : 'Ничья!';
    
    document.getElementById('winnerCard').innerHTML = `
        <div class="winner-name">${winner || 'Ничья'}</div>
        <div class="winner-score">${maxScore} очков</div>
        <div class="winner-details">
            ${maxScore > 0 ? 'Поздравляем с победой!' : 'Все молодцы!'}
        </div>
    `;
    
    // Обновляем финальную статистику
    const statsContainer = document.getElementById('finalStats');
    statsContainer.innerHTML = gameData.players.map(player => {
        const score = gameData.scores[player] || 0;
        return `
            <div class="player-result">
                <span class="player-name">${player}</span>
                <span class="player-score">${score} очков</span>
            </div>
        `;
    }).join('');
    
    // Сохраняем статистику
    saveStats({
        won: winner !== null,
        score: maxScore,
        players: gameData.players.length
    });
    
    showScreen(GameState.RESULTS);
}

// Играть снова
function playAgain() {
    playSound('click');
    showScreen(GameState.WELCOME);
}

// Показать правила
function showRules() {
    playSound('click');
    showScreen(GameState.RULES);
}

// Закрыть правила
function closeRules() {
    playSound('click');
    showScreen(GameState.WELCOME);
}

// Показать настройки
function showSettings() {
    playSound('click');
    showScreen(GameState.SETTINGS);
}

// Закрыть настройки
function closeSettings() {
    playSound('click');
    showScreen(GameState.WELCOME);
}

// Показать экран кастомных слов
function showCustomWords() {
    playSound('click');
    loadCustomWordsScreen();
    showScreen(GameState.CUSTOM_WORDS);
}

// Закрыть экран кастомных слов
function closeCustomWords() {
    playSound('click');
    showScreen(GameState.WELCOME);
}

// Загрузка экрана кастомных слов
function loadCustomWordsScreen() {
    const container = document.getElementById('customWordsList');
    if (!container) return;
    
    const customWords = loadCustomWords();
    const categories = getAllCategories();
    
    // Обновляем список категорий в форме
    const categorySelect = document.getElementById('wordCategory');
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    
    // Отображаем слова
    const allWords = [];
    Object.keys(customWords).forEach(categoryId => {
        const category = categories.find(c => c.id === categoryId);
        if (category && customWords[categoryId]) {
            customWords[categoryId].forEach(word => {
                allWords.push({ ...word, categoryName: category.name, categoryId });
            });
        }
    });
    
    container.innerHTML = allWords.length > 0 ? 
        allWords.map(word => `
            <div class="word-item">
                <div class="word-info">
                    <div class="word-text">${word.text}</div>
                    <div class="word-category">${word.categoryName}</div>
                    ${word.hint ? `<div class="word-hint"><small>${word.hint}</small></div>` : ''}
                </div>
                <div class="word-actions">
                    <i class="fas fa-trash delete-word" onclick="deleteCustomWord('${word.text}', '${word.categoryId}')"></i>
                </div>
            </div>
        `).join('') :
        '<p class="empty-message">Пока нет своих слов. Добавьте несколько!</p>';
}

// Добавление кастомного слова
function addCustomWord() {
    const wordInput = document.getElementById('newWord');
    const hintInput = document.getElementById('newHint');
    const categorySelect = document.getElementById('wordCategory');
    
    const wordText = wordInput.value.trim();
    const wordHint = hintInput.value.trim();
    const categoryId = categorySelect.value;
    
    if (!wordText) {
        showNotification('Введите слово!', 'warning');
        return;
    }
    
    const customWords = loadCustomWords();
    
    if (!customWords[categoryId]) {
        customWords[categoryId] = [];
    }
    
    // Проверяем, нет ли такого слова уже
    if (customWords[categoryId].some(w => w.text.toLowerCase() === wordText.toLowerCase())) {
        showNotification('Такое слово уже есть!', 'warning');
        return;
    }
    
    customWords[categoryId].push({
        text: wordText,
        hint: wordHint || undefined
    });
    
    if (saveCustomWords(customWords)) {
        showNotification('Слово добавлено!', 'success');
        wordInput.value = '';
        hintInput.value = '';
        loadCustomWordsScreen();
    } else {
        showNotification('Ошибка сохранения', 'error');
    }
}

// Удаление кастомного слова
function deleteCustomWord(wordText, categoryId) {
    if (!confirm('Удалить это слово?')) return;
    
    const customWords = loadCustomWords();
    
    if (customWords[categoryId]) {
        customWords[categoryId] = customWords[categoryId].filter(w => w.text !== wordText);
        
        if (customWords[categoryId].length === 0) {
            delete customWords[categoryId];
        }
    }
    
    if (saveCustomWords(customWords)) {
        showNotification('Слово удалено', 'info');
        loadCustomWordsScreen();
    }
}

// Добавление новой категории
function addNewCategory() {
    const categoryName = prompt('Введите название новой категории:');
    if (!categoryName) return;
    
    const categoryId = categoryName.toLowerCase().replace(/[^a-zа-я0-9]/g, '_');
    
    const customWords = loadCustomWords();
    if (!customWords[categoryId]) {
        customWords[categoryId] = [];
    }
    
    if (saveCustomWords(customWords)) {
        showNotification('Категория добавлена!', 'success');
        loadCustomWordsScreen();
    }
}

// Импорт слов
function importWords() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedWords = JSON.parse(event.target.result);
                
                if (typeof importedWords !== 'object') {
                    throw new Error('Некорректный формат файла');
                }
                
                const customWords = loadCustomWords();
                const mergedWords = { ...customWords, ...importedWords };
                
                if (saveCustomWords(mergedWords)) {
                    showNotification('Слова успешно импортированы!', 'success');
                    loadCustomWordsScreen();
                }
            } catch (error) {
                console.error('Ошибка импорта:', error);
                showNotification('Ошибка импорта файла', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Экспорт слов
function exportWords() {
    const customWords = loadCustomWords();
    const dataStr = JSON.stringify(customWords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'whoami_custom_words.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Слова экспортированы!', 'success');
}

// Сохранение кастомных слов
function saveCustomWords() {
    const customWords = loadCustomWords();
    if (saveCustomWords(customWords)) {
        showNotification('Слова сохранены!', 'success');
        closeCustomWords();
    }
}

// Управление звуком
function initAudio() {
    // Создаем элементы для звуков, если они не существуют
    const sounds = ['correct', 'wrong', 'click', 'win', 'timer'];
    
    sounds.forEach(soundId => {
        if (!document.getElementById(`${soundId}Sound`)) {
            const audio = document.createElement('audio');
            audio.id = `${soundId}Sound`;
            audio.preload = 'auto';
            
            // Используем бесплатные звуки с Mixkit
            switch(soundId) {
                case 'correct':
                    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3';
                    break;
                case 'wrong':
                    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3';
                    break;
                case 'click':
                    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3';
                    break;
                case 'win':
                    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
                    break;
                case 'timer':
                    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3';
                    break;
            }
            
            document.body.appendChild(audio);
        }
    });
}

// Воспроизведение звука
function playSound(soundId) {
    if (!gameData.settings.sound) return;
    
    const audio = document.getElementById(`${soundId}Sound`);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
            // Игнорируем ошибки воспроизведения
        });
    }
}

// Переключение звука
function toggleSound() {
    gameData.settings.sound = !gameData.settings.sound;
    document.getElementById('soundToggle').checked = gameData.settings.sound;
    
    playSound('click');
    showNotification(
        gameData.settings.sound ? 'Звук включен' : 'Звук выключен',
        gameData.settings.sound ? 'success' : 'info'
    );
}

// Переключение настроек
function toggleSettings() {
    showSettings();
}

// Пауза игры
function pauseGame() {
    if (gameData.isTimerRunning) {
        stopTimer();
        showNotification('Игра на паузе', 'warning');
    } else {
        startTimer();
        showNotification('Игра продолжается', 'success');
    }
}

// Поделиться результатами
function shareResults() {
    const winner = document.querySelector('.winner-name')?.textContent || 'Победитель';
    const score = document.querySelector('.winner-score')?.textContent || '0 очков';
    
    const text = `🏆 Я только что сыграл в "Кто я?" на LoveCouple Friends!\nПобедитель: ${winner} с ${score}\n\nПопробуйте и вы: https://lovecouple.ru/friends`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Кто я? - LoveCouple Friends',
            text: text,
            url: 'https://lovecouple.ru/friends'
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

// Копирование в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Результаты скопированы!', 'success');
    }).catch(() => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Результаты скопированы!', 'success');
    });
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s forwards;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Добавляем CSS для анимации уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Возврат на главную
function goBack() {
    if (currentState === GameState.WELCOME) {
        window.location.href = '../index.html';
    } else {
        playSound('click');
        showScreen(GameState.WELCOME);
    }
}

// Отображение экрана приветствия
function showWelcome() {
    showScreen(GameState.WELCOME);
}

// Завершение раунда по кнопке
function endRound() {
    stopTimer();
    nextPlayer();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);

// Обработка изменения количества раундов
document.getElementById('roundsCount')?.addEventListener('input', function() {
    document.getElementById('roundsValue').textContent = this.value;
});

// Предотвращение контекстного меню
document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('.character-card')) {
        e.preventDefault();
    }
});

// Горячие клавиши
document.addEventListener('keydown', function(e) {
    if (currentState !== GameState.PLAYING) return;
    
    switch(e.key) {
        case ' ':
        case 'Enter':
            e.preventDefault();
            correctGuess();
            break;
        case 'Escape':
            e.preventDefault();
            pauseGame();
            break;
        case 'h':
        case 'H':
            e.preventDefault();
            showHint();
            break;
        case 's':
        case 'S':
            e.preventDefault();
            skipCard();
            break;
        case 'n':
        case 'N':
            e.preventDefault();
            wrongGuess();
            break;
    }
});

// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    .notification {
        font-family: inherit;
        font-weight: 500;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-content i {
        font-size: 1.25rem;
    }
`;
document.head.appendChild(style);
