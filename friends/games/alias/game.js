// Основной игровой код для Алиас

// DOM элементы
const screens = {
    main: document.getElementById('mainScreen'),
    setup: document.getElementById('setupScreen'),
    teams: document.getElementById('teamsScreen'),
    prepare: document.getElementById('prepareScreen'),
    game: document.getElementById('gameScreen'),
    pause: document.getElementById('pauseScreen'),
    roundResult: document.getElementById('roundResultScreen'),
    scoreboard: document.getElementById('scoreboardScreen'),
    finish: document.getElementById('finishScreen'),
    history: document.getElementById('historyScreen'),
    rules: document.getElementById('rulesScreen')
};

// Таймер
let gameTimer;
let roundTimer;
let timeLeft = 0;
let roundStartTime;

// Звуки
const sounds = {
    correct: document.getElementById('correctSound'),
    skip: document.getElementById('skipSound'),
    wrong: document.getElementById('wrongSound'),
    time: document.getElementById('timeSound'),
    end: document.getElementById('endSound')
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    setupEventListeners();
    loadCategories();
    loadTeams();
    
    // Восстанавливаем незавершенную игру
    const savedGame = localStorage.getItem('currentAliasGame');
    if (savedGame) {
        const confirmRestore = confirm('У вас есть незавершенная игра. Хотите продолжить?');
        if (confirmRestore) {
            restoreGame(JSON.parse(savedGame));
        } else {
            localStorage.removeItem('currentAliasGame');
        }
    }
});

// Загрузка статистики
function loadStats() {
    const stats = getStats();
    document.getElementById('totalGames').textContent = stats.totalGames;
    document.getElementById('totalWords').textContent = stats.totalWords;
    document.getElementById('totalScore').textContent = stats.totalScore;
}

// Настройка слушателей событий
function setupEventListeners() {
    // Слайдер времени
    const timeSlider = document.getElementById('timeSlider');
    const timeValue = document.getElementById('timeValue');
    if (timeSlider) {
        timeSlider.addEventListener('input', function() {
            timeValue.textContent = this.value;
            updateTimePresets(this.value);
        });
        
        // Пресеты времени
        document.querySelectorAll('.time-preset').forEach(preset => {
            preset.addEventListener('click', function() {
                const time = parseInt(this.getAttribute('data-time'));
                timeSlider.value = time;
                timeValue.textContent = time;
                updateTimePresets(time);
            });
        });
    }
    
    // Слайдер количества слов
    const wordsSlider = document.getElementById('wordsSlider');
    const wordsValue = document.getElementById('wordsValue');
    if (wordsSlider) {
        wordsSlider.addEventListener('input', function() {
            wordsValue.textContent = this.value;
        });
    }
    
    // Быстрые настройки
    updateQuickSettings();
}

// Обновление быстрых настроек
function updateQuickSettings() {
    const time = document.getElementById('quickTime').value;
    const words = document.getElementById('quickWords').value;
    const category = document.getElementById('quickCategory').value;
    
    // Сохраняем настройки
    gameSettings.timePerRound = parseInt(time);
    gameSettings.wordsPerRound = parseInt(words);
    gameSettings.selectedCategories = category === 'all' ? 
        ['common', 'objects', 'actions', 'people', 'nature', 'food'] : [category];
    
    localStorage.setItem('aliasSettings', JSON.stringify(gameSettings));
}

// Загрузка категорий
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    const categories = [
        { id: 'common', name: 'Общие слова', count: aliasDatabase.common.length },
        { id: 'objects', name: 'Предметы', count: aliasDatabase.objects.length },
        { id: 'actions', name: 'Действия', count: aliasDatabase.actions.length },
        { id: 'people', name: 'Люди и профессии', count: aliasDatabase.people.length },
        { id: 'nature', name: 'Природа и животные', count: aliasDatabase.nature.length },
        { id: 'food', name: 'Еда и напитки', count: aliasDatabase.food.length }
    ];
    
    let html = '';
    categories.forEach(category => {
        const isActive = gameSettings.selectedCategories.includes(category.id);
        html += `
            <div class="category-item ${isActive ? 'active' : ''}" onclick="toggleCategory('${category.id}')">
                <div class="category-checkbox"></div>
                <div>
                    <div class="category-name">${category.name}</div>
                    <div class="category-count">${category.count} слов</div>
                </div>
            </div>
        `;
    });
    
    categoriesGrid.innerHTML = html;
}

// Переключение категории
function toggleCategory(categoryId) {
    const index = gameSettings.selectedCategories.indexOf(categoryId);
    if (index === -1) {
        gameSettings.selectedCategories.push(categoryId);
    } else {
        gameSettings.selectedCategories.splice(index, 1);
    }
    
    // Обновляем интерфейс
    loadCategories();
    localStorage.setItem('aliasSettings', JSON.stringify(gameSettings));
}

// Обновление пресетов времени
function updateTimePresets(time) {
    document.querySelectorAll('.time-preset').forEach(preset => {
        if (parseInt(preset.getAttribute('data-time')) === parseInt(time)) {
            preset.classList.add('active');
        } else {
            preset.classList.remove('active');
        }
    });
}

// Загрузка команд
function loadTeams() {
    const teamsList = document.getElementById('teamsList');
    if (!teamsList) return;
    
    const teamsData = getTeams();
    
    if (teamsData.length === 0) {
        teamsList.innerHTML = `
            <div class="teams-empty">
                <i class="fas fa-users"></i>
                <h3>Нет созданных команд</h3>
                <p>Добавьте команды для начала игры</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    teamsData.forEach(team => {
        html += `
            <div class="team-card">
                <div class="team-color-display" style="background: ${team.color};"></div>
                <div class="team-info">
                    <div class="team-name">${team.name}</div>
                    <div class="team-members">${team.players.length} игроков</div>
                </div>
                <div class="team-actions">
                    <button class="team-action-btn" onclick="editTeam(${team.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="team-action-btn" onclick="removeTeam(${team.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    teamsList.innerHTML = html;
}

// Добавление команды
function addNewTeam() {
    const name = document.getElementById('teamName').value.trim();
    const color = document.getElementById('teamColor').value;
    
    if (!name) {
        showNotification('Введите название команды', 'error');
        return;
    }
    
    addTeam(name, color);
    loadTeams();
    
    // Очищаем форму
    document.getElementById('teamName').value = '';
    document.getElementById('teamColor').value = '#4F46E5';
    
    showNotification(`Команда "${name}" добавлена`, 'success');
}

// Добавление стандартной команды
function addDefaultTeam(name, color) {
    addTeam(name, color);
    loadTeams();
    showNotification(`Команда "${name}" добавлена`, 'success');
}

// Редактирование команды
function editTeam(id) {
    const team = getTeams().find(t => t.id === id);
    if (!team) return;
    
    const newName = prompt('Введите новое название команды:', team.name);
    if (newName && newName.trim()) {
        updateTeam(id, { name: newName.trim() });
        loadTeams();
        showNotification('Команда обновлена', 'success');
    }
}

// Удаление команды
function removeTeam(id) {
    if (confirm('Вы уверены, что хотите удалить команду?')) {
        const team = getTeams().find(t => t.id === id);
        if (team) {
            removeTeam(id);
            loadTeams();
            showNotification(`Команда "${team.name}" удалена`, 'success');
        }
    }
}

// Показать экран
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
    
    // Особые действия для экранов
    switch(screenName) {
        case 'mainScreen':
            loadStats();
            break;
        case 'teamsScreen':
            loadTeams();
            break;
        case 'historyScreen':
            loadHistory();
            break;
        case 'prepareScreen':
            updateGameSummary();
            break;
    }
}

// Быстрая игра
function startQuickGame() {
    // Используем быстрые настройки
    const time = parseInt(document.getElementById('quickTime').value);
    const words = parseInt(document.getElementById('quickWords').value);
    const category = document.getElementById('quickCategory').value;
    
    gameSettings.timePerRound = time;
    gameSettings.wordsPerRound = words;
    gameSettings.selectedCategories = category === 'all' ? 
        Object.keys(aliasDatabase) : [category];
    
    startCustomGame();
}

// Начать пользовательскую игру
function startCustomGame() {
    // Получаем настройки с экрана
    const teamOptions = document.querySelectorAll('.team-option.active');
    if (teamOptions.length === 0) {
        showNotification('Выберите количество команд', 'error');
        return;
    }
    
    const teamsCount = parseInt(teamOptions[0].querySelector('.team-count').textContent);
    const timePerRound = parseInt(document.getElementById('timeSlider').value);
    const wordsPerRound = parseInt(document.getElementById('wordsSlider').value);
    const skipPenalty = document.getElementById('skipPenalty').checked;
    const sameRootPenalty = document.getElementById('sameRootPenalty').checked;
    const soundEffects = document.getElementById('soundEffects').checked;
    const vibration = document.getElementById('vibration').checked;
    
    // Обновляем настройки
    gameSettings.teamsCount = teamsCount;
    gameSettings.timePerRound = timePerRound;
    gameSettings.wordsPerRound = wordsPerRound;
    gameSettings.skipPenalty = skipPenalty;
    gameSettings.sameRootPenalty = sameRootPenalty;
    gameSettings.soundEffects = soundEffects;
    gameSettings.vibration = vibration;
    
    // Сохраняем настройки
    localStorage.setItem('aliasSettings', JSON.stringify(gameSettings));
    
    // Подготавливаем игру
    prepareGame();
}

// Подготовка игры
function prepareGame() {
    // Сбрасываем текущую игру
    currentGame = {
        id: Date.now(),
        teams: [],
        rounds: [],
        currentRound: 0,
        currentTeamIndex: 0,
        status: 'setup',
        startTime: null,
        endTime: null,
        settings: { ...gameSettings }
    };
    
    // Создаем команды для игры
    const allTeams = getTeams();
    for (let i = 0; i < Math.min(gameSettings.teamsCount, allTeams.length); i++) {
        currentGame.teams.push({
            ...allTeams[i],
            score: 0,
            roundScores: []
        });
    }
    
    // Если не хватает команд, создаем автоматически
    while (currentGame.teams.length < gameSettings.teamsCount) {
        const teamNumber = currentGame.teams.length + 1;
        const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        currentGame.teams.push({
            id: 100 + teamNumber,
            name: `Команда ${teamNumber}`,
            color: colors[(teamNumber - 1) % colors.length],
            score: 0,
            roundScores: [],
            players: []
        });
    }
    
    // Показываем экран подготовки
    showScreen('prepareScreen');
}

// Обновление сводки игры
function updateGameSummary() {
    if (!currentGame.teams.length) return;
    
    // Настройки
    document.getElementById('summaryTeams').textContent = currentGame.teams.length;
    document.getElementById('summaryTime').textContent = `${currentGame.settings.timePerRound} сек`;
    document.getElementById('summaryWords').textContent = currentGame.settings.wordsPerRound;
    document.getElementById('summaryCategories').textContent = currentGame.settings.selectedCategories.length;
    
    // Команды
    const teamsSummary = document.getElementById('teamsSummary');
    let html = '';
    currentGame.teams.forEach(team => {
        html += `
            <div class="team-summary-item">
                <div class="team-summary-color" style="background: ${team.color};"></div>
                <div class="team-summary-name">${team.name}</div>
                <div class="team-summary-score">0 очков</div>
            </div>
        `;
    });
    teamsSummary.innerHTML = html;
}

// Начать раунд
function startRound() {
    if (currentGame.teams.length === 0) return;
    
    // Получаем текущую команду
    const team = currentGame.teams[currentGame.currentTeamIndex];
    
    // Создаем новый раунд
    currentRound = {
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        startTime: new Date(),
        endTime: null,
        words: getWordsForRound(currentGame.settings.wordsPerRound, currentGame.settings.selectedCategories),
        currentWordIndex: 0,
        score: 0,
        guessed: 0,
        skipped: 0,
        wrong: 0
    };
    
    // Обновляем текущий раунд в игре
    currentGame.currentRound++;
    currentGame.status = 'playing';
    currentGame.startTime = currentGame.startTime || new Date();
    
    // Сохраняем игру
    saveCurrentGame();
    
    // Настраиваем игровой экран
    setupGameScreen();
    showScreen('gameScreen');
    
    // Запускаем таймер
    startRoundTimer();
}

// Настройка игрового экрана
function setupGameScreen() {
    const team = currentGame.teams[currentGame.currentTeamIndex];
    
    // Информация о команде
    document.getElementById('playingTeamName').textContent = team.name;
    document.getElementById('teamColorBadge').style.background = team.color;
    document.getElementById('currentRound').textContent = currentGame.currentRound;
    document.getElementById('totalRounds').textContent = currentGame.teams.length;
    
    // Сбрасываем статистику
    document.getElementById('roundScore').textContent = '0';
    document.getElementById('guessedCount').textContent = '0';
    document.getElementById('skippedCount').textContent = '0';
    document.getElementById('wrongCount').textContent = '0';
    document.getElementById('accuracy').textContent = '0%';
    
    // Показываем первое слово
    showNextWord();
}

// Показать следующее слово
function showNextWord() {
    if (currentRound.currentWordIndex >= currentRound.words.length) {
        endRound();
        return;
    }
    
    const wordData = currentRound.words[currentRound.currentWordIndex];
    
    // Обновляем отображение
    document.getElementById('wordDisplay').textContent = wordData.word;
    document.getElementById('wordCategory').innerHTML = `Категория: <span>${getCategoryName(wordData.category)}</span>`;
    document.getElementById('currentWord').textContent = currentRound.currentWordIndex + 1;
    document.getElementById('totalWords').textContent = currentRound.words.length;
    
    // Запрещенные слова
    const forbiddenList = document.getElementById('forbiddenList');
    forbiddenList.innerHTML = '';
    wordData.forbidden.forEach(forbiddenWord => {
        const span = document.createElement('span');
        span.className = 'forbidden-word';
        span.textContent = forbiddenWord;
        forbiddenList.appendChild(span);
    });
    
    // Вибрация (если включена)
    if (currentGame.settings.vibration && navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Запуск таймера раунда
function startRoundTimer() {
    timeLeft = currentGame.settings.timePerRound;
    roundStartTime = new Date();
    
    if (roundTimer) {
        clearInterval(roundTimer);
    }
    
    updateTimerDisplay();
    
    roundTimer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        
        // Звуковое предупреждение
        if (timeLeft === 10 && currentGame.settings.soundEffects) {
            playSound('time');
        }
        
        if (timeLeft <= 0) {
            clearInterval(roundTimer);
            endRound();
        }
        
        // Автосохранение каждые 30 секунд
        if (timeLeft % 30 === 0) {
            saveCurrentGame();
        }
    }, 1000);
}

// Обновление отображения таймера
function updateTimerDisplay() {
    document.getElementById('timerText').textContent = timeLeft;
    
    // Круг прогресса
    const circle = document.getElementById('timerCircle');
    const totalLength = 283; // 2 * π * 45
    const progress = (timeLeft / currentGame.settings.timePerRound) * totalLength;
    circle.style.strokeDashoffset = progress;
    
    // Цвет в зависимости от времени
    if (timeLeft < 30) {
        circle.style.stroke = '#EF4444';
    } else if (timeLeft < 60) {
        circle.style.stroke = '#F59E0B';
    } else {
        circle.style.stroke = '#10B981';
    }
}

// Слово угадано
function correctWord() {
    const wordData = currentRound.words[currentRound.currentWordIndex];
    
    // Отмечаем слово как угаданное
    wordData.status = 'guessed';
    wordData.time = new Date() - roundStartTime;
    
    // Обновляем статистику
    currentRound.score++;
    currentRound.guessed++;
    currentRound.currentWordIndex++;
    
    // Обновляем интерфейс
    updateRoundStats();
    
    // Звук
    if (currentGame.settings.soundEffects) {
        playSound('correct');
    }
    
    // Показываем следующее слово
    setTimeout(() => {
        showNextWord();
    }, 300);
}

// Пропуск слова
function skipWord() {
    const wordData = currentRound.words[currentRound.currentWordIndex];
    
    // Отмечаем слово как пропущенное
    wordData.status = 'skipped';
    wordData.time = new Date() - roundStartTime;
    
    // Штраф
    if (currentGame.settings.skipPenalty) {
        currentRound.score = Math.max(0, currentRound.score - 1);
    }
    
    // Обновляем статистику
    currentRound.skipped++;
    currentRound.currentWordIndex++;
    
    // Обновляем интерфейс
    updateRoundStats();
    
    // Звук
    if (currentGame.settings.soundEffects) {
        playSound('skip');
    }
    
    // Показываем следующее слово
    setTimeout(() => {
        showNextWord();
    }, 300);
}

// Нарушение правил
function wrongWord() {
    const wordData = currentRound.words[currentRound.currentWordIndex];
    
    // Отмечаем слово как нарушение
    wordData.status = 'wrong';
    wordData.time = new Date() - roundStartTime;
    
    // Штраф
    if (currentGame.settings.sameRootPenalty) {
        currentRound.score = Math.max(0, currentRound.score - 2);
    }
    
    // Обновляем статистику
    currentRound.wrong++;
    currentRound.currentWordIndex++;
    
    // Обновляем интерфейс
    updateRoundStats();
    
    // Звук
    if (currentGame.settings.soundEffects) {
        playSound('wrong');
    }
    
    // Показываем следующее слово
    setTimeout(() => {
        showNextWord();
    }, 300);
}

// Обновление статистики раунда
function updateRoundStats() {
    document.getElementById('roundScore').textContent = currentRound.score;
    document.getElementById('guessedCount').textContent = currentRound.guessed;
    document.getElementById('skippedCount').textContent = currentRound.skipped;
    document.getElementById('wrongCount').textContent = currentRound.wrong;
    
    const accuracy = calculateAccuracy(currentRound.guessed, currentRound.skipped, currentRound.wrong);
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

// Пауза игры
function pauseGame() {
    clearInterval(roundTimer);
    currentGame.status = 'paused';
    
    // Обновляем статистику на экране паузы
    document.getElementById('pauseTime').textContent = formatTime(currentGame.settings.timePerRound - timeLeft);
    document.getElementById('pauseWord').textContent = `${currentRound.currentWordIndex}/${currentRound.words.length}`;
    document.getElementById('pauseScore').textContent = currentRound.score;
    document.getElementById('pauseAccuracy').textContent = `${calculateAccuracy(currentRound.guessed, currentRound.skipped, currentRound.wrong)}%`;
    
    showScreen('pauseScreen');
}

// Продолжить игру
function resumeGame() {
    currentGame.status = 'playing';
    startRoundTimer();
    showScreen('gameScreen');
}

// Перезапустить раунд
function restartRound() {
    if (confirm('Вы уверены, что хотите перезапустить раунд?')) {
        startRound();
    }
}

// Завершить раунд
function endRound() {
    clearInterval(roundTimer);
    currentRound.endTime = new Date();
    
    // Сохраняем раунд в игре
    currentGame.rounds.push({ ...currentRound });
    
    // Обновляем счет команды
    const teamIndex = currentGame.teams.findIndex(t => t.id === currentRound.teamId);
    if (teamIndex !== -1) {
        currentGame.teams[teamIndex].score += currentRound.score;
        currentGame.teams[teamIndex].roundScores.push(currentRound.score);
    }
    
    // Сохраняем игру
    saveCurrentGame();
    
    // Показываем результаты раунда
    showRoundResults();
}

// Показать результаты раунда
function showRoundResults() {
    const timeSpent = Math.floor((currentRound.endTime - currentRound.startTime) / 1000);
    const accuracy = calculateAccuracy(currentRound.guessed, currentRound.skipped, currentRound.wrong);
    const wpm = calculateWPM(currentRound.guessed, timeSpent);
    
    // Заполняем данные
    document.getElementById('resultTeamName').textContent = currentRound.teamName;
    document.getElementById('resultScore').textContent = currentRound.score;
    document.getElementById('resultGuessed').textContent = currentRound.guessed;
    document.getElementById('resultSkipped').textContent = currentRound.skipped;
    document.getElementById('resultWrong').textContent = currentRound.wrong;
    document.getElementById('resultAccuracy').textContent = `${accuracy}%`;
    document.getElementById('resultTime').textContent = formatTime(timeSpent);
    document.getElementById('resultWPM').textContent = wpm;
    
    // Список слов
    const wordsList = document.getElementById('resultWordsList');
    wordsList.innerHTML = '';
    
    currentRound.words.slice(0, currentRound.currentWordIndex).forEach(word => {
        const badge = document.createElement('span');
        badge.className = `word-badge ${word.status}`;
        badge.textContent = word.word;
        badge.title = word.forbidden.join(', ');
        wordsList.appendChild(badge);
    });
    
    showScreen('roundResultScreen');
}

// Следующий раунд
function nextRound() {
    // Переходим к следующей команде
    currentGame.currentTeamIndex = (currentGame.currentTeamIndex + 1) % currentGame.teams.length;
    
    // Если все команды сыграли, показываем турнирную таблицу
    if (currentGame.currentTeamIndex === 0) {
        showScoreboard();
    } else {
        // Начинаем следующий раунд
        startRound();
    }
}

// Показать турнирную таблицу
function showScoreboard() {
    // Обновляем информацию
    document.getElementById('scoreboardRound').textContent = Math.ceil(currentGame.currentRound / currentGame.teams.length);
    document.getElementById('scoreboardTotalRounds').textContent = currentGame.teams.length;
    document.getElementById('totalGameScore').textContent = currentGame.teams.reduce((sum, team) => sum + team.score, 0);
    
    // Сортируем команды по очкам
    const sortedTeams = [...currentGame.teams].sort((a, b) => b.score - a.score);
    
    // Отображаем рейтинг
    const ranking = document.getElementById('teamsRanking');
    let html = '';
    
    sortedTeams.forEach((team, index) => {
        const maxScore = Math.max(...sortedTeams.map(t => t.score));
        const progress = maxScore > 0 ? (team.score / maxScore) * 100 : 0;
        
        html += `
            <div class="team-rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}">
                <div class="rank-number">${index + 1}</div>
                <div class="team-color-display" style="background: ${team.color}; width: 30px; height: 30px; border-radius: 8px;"></div>
                <div class="rank-team-info">
                    <div class="rank-team-name">${team.name}</div>
                    <div class="rank-team-progress">
                        <div class="rank-team-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="rank-team-score">${team.score}</div>
            </div>
        `;
    });
    
    ranking.innerHTML = html;
    showScreen('scoreboardScreen');
}

// Продолжить игру (с турнирной таблицы)
function continueGame() {
    startRound();
}

// Завершить игру
function finishGame() {
    currentGame.endTime = new Date();
    currentGame.status = 'finished';
    
    // Сохраняем историю
    saveGameHistory();
    
    // Показываем экран окончания
    showFinishScreen();
}

// Показать экран окончания
function showFinishScreen() {
    const winner = getWinnerTeam();
    
    // Победитель
    document.getElementById('winnerName').textContent = winner.name;
    document.getElementById('winnerTeam').innerHTML = `
        <div class="team-color-display" style="background: ${winner.color}; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 15px;"></div>
        <div>${winner.name}</div>
    `;
    document.getElementById('winnerScore').textContent = `${winner.score} очков`;
    
    // Финальный рейтинг
    const sortedTeams = [...currentGame.teams].sort((a, b) => b.score - a.score);
    const finalRanking = document.getElementById('finalRanking');
    let html = '';
    
    sortedTeams.forEach((team, index) => {
        html += `
            <div class="final-rank-item">
                <div class="final-rank">${index + 1}</div>
                <div class="team-color-display" style="background: ${team.color}; width: 30px; height: 30px; border-radius: 8px;"></div>
                <div class="final-team-name">${team.name}</div>
                <div class="final-team-score">${team.score}</div>
            </div>
        `;
    });
    
    finalRanking.innerHTML = html;
    
    // Итоговая статистика
    const totalRounds = currentGame.rounds.length;
    const totalWords = currentGame.rounds.reduce((sum, round) => sum + round.words.length, 0);
    const totalTime = currentGame.endTime ? Math.floor((currentGame.endTime - currentGame.startTime) / 1000) : 0;
    const totalGuessed = currentGame.rounds.reduce((sum, round) => sum + round.guessed, 0);
    const totalSkipped = currentGame.rounds.reduce((sum, round) => sum + round.skipped, 0);
    const totalWrong = currentGame.rounds.reduce((sum, round) => sum + round.wrong, 0);
    const averageAccuracy = calculateAccuracy(totalGuessed, totalSkipped, totalWrong);
    
    document.getElementById('finalRounds').textContent = totalRounds;
    document.getElementById('finalWords').textContent = totalWords;
    document.getElementById('finalTime').textContent = formatTime(totalTime);
    document.getElementById('finalAccuracy').textContent = `${averageAccuracy}%`;
    
    // Очищаем текущую игру
    localStorage.removeItem('currentAliasGame');
    
    showScreen('finishScreen');
}

// Начать заново
function restartGame() {
    if (confirm('Начать новую игру с теми же командами?')) {
        prepareGame();
    }
}

// Восстановить игру
function restoreGame(savedGame) {
    currentGame = savedGame;
    
    // Восстанавливаем последний раунд, если игра была прервана
    if (currentGame.status === 'playing' && currentGame.rounds.length > 0) {
        currentRound = currentGame.rounds[currentGame.rounds.length - 1];
        showScreen('gameScreen');
        startRoundTimer();
    } else {
        showScreen('prepareScreen');
    }
}

// Сохранить текущую игру
function saveCurrentGame() {
    localStorage.setItem('currentAliasGame', JSON.stringify(currentGame));
}

// Показать настройки
function showSetupScreen() {
    showScreen('setupScreen');
}

// Показать управление командами
function showTeamsScreen() {
    showScreen('teamsScreen');
}

// Показать историю
function showHistory() {
    showScreen('historyScreen');
}

// Загрузить историю
function loadHistory() {
    const history = getHistory();
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <h3>История игр пуста</h3>
                <p>Сыграйте в свою первую игру!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    history.forEach(game => {
        const date = new Date(game.date);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const winner = game.winner;
        
        html += `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-title">Игра #${game.id.toString().slice(-4)}</div>
                    <div class="history-date">${formattedDate}</div>
                </div>
                <div class="history-stats">
                    <div class="history-stat">
                        <span class="label">Команд:</span>
                        <span class="value">${game.teams.length}</span>
                    </div>
                    <div class="history-stat">
                        <span class="label">Победитель:</span>
                        <span class="value" style="color: ${winner.color}">${winner.name}</span>
                    </div>
                    <div class="history-stat">
                        <span class="label">Очки:</span>
                        <span class="value">${winner.score}</span>
                    </div>
                    <div class="history-stat">
                        <span class="label">Всего очков:</span>
                        <span class="value">${game.totalScore}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

// Фильтр истории
function filterHistory(filter) {
    // Реализация фильтрации по дате
    const history = getHistory();
    const now = new Date();
    
    let filteredHistory = history;
    
    switch(filter) {
        case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filteredHistory = history.filter(game => new Date(game.date) >= today);
            break;
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredHistory = history.filter(game => new Date(game.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filteredHistory = history.filter(game => new Date(game.date) >= monthAgo);
            break;
    }
    
    // Обновляем активные кнопки фильтра
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(filter.charAt(0).toUpperCase() + filter.slice(1))) {
            btn.classList.add('active');
        }
    });
    
    // Обновляем список (упрощенная версия)
    loadHistory(); // В реальном приложении здесь была бы фильтрация
}

// Очистить историю
function clearHistory() {
    if (confirm('Вы уверены, что хотите очистить всю историю игр?')) {
        clearHistory();
        clearStats();
        loadHistory();
        loadStats();
        showNotification('История очищена', 'success');
    }
}

// Показать правила
function showRules() {
    showScreen('rulesScreen');
}

// Поделиться результатами
function shareResults() {
    const winner = getWinnerTeam();
    const text = `🏆 Победитель: ${winner.name} (${winner.score} очков)\n🎮 Игра Алиас в LoveCouple_Friends\n\nПрисоединяйтесь к игре!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Результаты игры Алиас',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Текст скопирован в буфер обмена!', 'success');
        });
    }
}

// Поделиться турнирной таблицей
function shareScoreboard() {
    const sortedTeams = [...currentGame.teams].sort((a, b) => b.score - a.score);
    let text = '🏆 Турнирная таблица Алиас:\n\n';
    
    sortedTeams.forEach((team, index) => {
        text += `${index + 1}. ${team.name}: ${team.score} очков\n`;
    });
    
    text += '\n🎮 LoveCouple_Friends - игры для вечеринок!';
    
    if (navigator.share) {
        navigator.share({
            title: 'Турнирная таблица Алиас',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Турнирная таблица скопирована!', 'success');
        });
    }
}

// Воспроизвести звук
function playSound(soundName) {
    if (currentGame.settings.soundEffects && sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Sound play failed:', e));
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Выбор количества команд
function selectTeamCount(count) {
    document.querySelectorAll('.team-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const options = document.querySelectorAll('.team-option');
    const selectedOption = Array.from(options).find(option => 
        option.querySelector('.team-count').textContent.includes(count)
    );
    
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
}

// Предотвращаем закрытие страницы с несохраненной игрой
window.addEventListener('beforeunload', function(e) {
    if (currentGame.status === 'playing' || currentGame.status === 'paused') {
        e.preventDefault();
        e.returnValue = 'У вас есть незавершенная игра. Вы уверены, что хотите уйти?';
        return e.returnValue;
    }
});

// Инициализация PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('../service-worker.js').then(
            function(registration) {
                console.log('ServiceWorker registration successful');
            },
            function(err) {
                console.log('ServiceWorker registration failed: ', err);
            }
        );
    });
}