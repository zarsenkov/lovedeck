// Основные переменные игры
const gameState = {
    mode: 'alias',
    timerDuration: 60,
    roundLimit: 10,
    currentRound: 1,
    currentTeam: 1,
    scores: { team1: 0, team2: 0 },
    roundScores: { team1: 0, team2: 0 },
    usedWords: new Set(),
    guessedCount: 0,
    skippedCount: 0,
    timerInterval: null,
    timeLeft: 60,
    isPlaying: false,
    words: [],
    roundHistory: []
};

// Элементы DOM
const elements = {
    // Экраны
    mainScreen: document.getElementById('mainScreen'),
    gameScreen: document.getElementById('gameScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    endScreen: document.getElementById('endScreen'),
    
    // Главный экран
    gameModeInputs: document.querySelectorAll('input[name="gameMode"]'),
    team1Name: document.getElementById('team1Name'),
    team2Name: document.getElementById('team2Name'),
    timerDuration: document.getElementById('timerDuration'),
    roundLimit: document.getElementById('roundLimit'),
    startGameBtn: document.getElementById('startGame'),
    showRulesBtn: document.getElementById('showRules'),
    
    // Экран игры
    currentTeamName: document.getElementById('currentTeamName'),
    currentRoundScore: document.getElementById('currentRoundScore'),
    totalRoundScore: document.getElementById('totalRoundScore'),
    currentWord: document.getElementById('currentWord'),
    wordCategory: document.getElementById('wordCategory'),
    timerDisplay: document.getElementById('timerDisplay'),
    timerCircle: document.getElementById('timerCircle'),
    currentMode: document.getElementById('currentMode'),
    guessedCount: document.getElementById('guessedCount'),
    skippedCount: document.getElementById('skippedCount'),
    currentRound: document.getElementById('currentRound'),
    totalRounds: document.getElementById('totalRounds'),
    gameHint: document.getElementById('gameHint'),
    correctBtn: document.getElementById('correctBtn'),
    skipBtn: document.getElementById('skipBtn'),
    stopBtn: document.getElementById('stopBtn'),
    backToMain: document.getElementById('backToMain'),
    
    // Экран результатов
    resultsMode: document.getElementById('resultsMode'),
    resultsTime: document.getElementById('resultsTime'),
    resultsGuessed: document.getElementById('resultsGuessed'),
    resultsTeam1Name: document.getElementById('resultsTeam1Name'),
    resultsTeam2Name: document.getElementById('resultsTeam2Name'),
    resultsTeam1Score: document.getElementById('resultsTeam1Score'),
    resultsTeam2Score: document.getElementById('resultsTeam2Score'),
    nextWordHint: document.getElementById('nextWordHint'),
    nextRoundBtn: document.getElementById('nextRoundBtn'),
    finishGameBtn: document.getElementById('finishGameBtn'),
    
    // Экран окончания
    winnerName: document.getElementById('winnerName'),
    finalTeam1Name: document.getElementById('finalTeam1Name'),
    finalTeam2Name: document.getElementById('finalTeam2Name'),
    finalTeam1Score: document.getElementById('finalTeam1Score'),
    finalTeam2Score: document.getElementById('finalTeam2Score'),
    finalTeam1Rounds: document.getElementById('finalTeam1Rounds'),
    finalTeam2Rounds: document.getElementById('finalTeam2Rounds'),
    totalGuessed: document.getElementById('totalGuessed'),
    totalSkipped: document.getElementById('totalSkipped'),
    totalRoundsPlayed: document.getElementById('totalRoundsPlayed'),
    newGameBtn: document.getElementById('newGameBtn'),
    backToMainFromEnd: document.getElementById('backToMainFromEnd'),
    
    // Модальное окно
    rulesModal: document.getElementById('rulesModal'),
    closeRulesBtn: document.getElementById('closeRules'),
    closeModalBtn: document.querySelector('.close-modal'),
    
    // Аудио
    timerBeep: document.getElementById('timerBeep'),
    endBeep: document.getElementById('endBeep')
};

// TODO: Добавить возможность настройки звуков
// TODO: Добавить больше анимаций
// TODO: Добавить статистику по категориям

// Инициализация игры
async function initGame() {
    try {
        await loadWords();
        setupEventListeners();
        loadGameState();
        generateAudioBeeps();
        updateLastGameStats();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showError('Не удалось загрузить слова. Проверьте файл words.json');
    }
}

// Загрузка слов из JSON файла
async function loadWords() {
    try {
        const response = await fetch('words.json');
        if (!response.ok) throw new Error('Ошибка загрузки файла');
        
        gameState.words = await response.json();
        
        // Проверяем, что слова загружены
        if (!gameState.words || gameState.words.length === 0) {
            throw new Error('Файл words.json пустой или некорректный');
        }
        
        console.log(`Загружено ${gameState.words.length} слов`);
    } catch (error) {
        console.error('Ошибка загрузки слов:', error);
        // Создаём резервный набор слов на случай ошибки
        gameState.words = getBackupWords();
    }
}

// Резервный набор слов (на случай проблем с файлом)
function getBackupWords() {
    const categories = {
        'животные': ['слон', 'кот', 'собака', 'лев', 'тигр', 'медведь', 'заяц', 'волк', 'лиса', 'ёж'],
        'предметы': ['стол', 'стул', 'лампа', 'книга', 'телефон', 'окно', 'дверь', 'чашка', 'ложка', 'вилка'],
        'профессии': ['врач', 'учитель', 'пожарный', 'полицейский', 'повар', 'строитель', 'водитель', 'программист', 'художник', 'музыкант'],
        'действия': ['бежать', 'прыгать', 'смеяться', 'плакать', 'читать', 'писать', 'рисовать', 'петь', 'танцевать', 'спать'],
        'эмоции': ['радость', 'грусть', 'злость', 'удивление', 'страх', 'любовь', 'ревность', 'гордость', 'стыд', 'счастье'],
        'фильмы': ['Титаник', 'Матрица', 'Гарри Поттер', 'Властелин колец', 'Звёздные войны', 'Пираты Карибского моря', 'Форрест Гамп', 'Король Лев', 'Назад в будущее', 'Интерстеллар']
    };
    
    const words = [];
    for (const [category, wordList] of Object.entries(categories)) {
        for (const word of wordList) {
            words.push({ word, category });
        }
    }
    return words;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Главный экран
    elements.startGameBtn.addEventListener('click', startGame);
    elements.showRulesBtn.addEventListener('click', () => showModal(true));
    
    // Модальное окно
    elements.closeRulesBtn.addEventListener('click', () => showModal(false));
    elements.closeModalBtn.addEventListener('click', () => showModal(false));
    elements.rulesModal.addEventListener('click', (e) => {
        if (e.target === elements.rulesModal) showModal(false);
    });
    
    // Экран игры
    elements.correctBtn.addEventListener('click', handleCorrect);
    elements.skipBtn.addEventListener('click', handleSkip);
    elements.stopBtn.addEventListener('click', stopRound);
    elements.backToMain.addEventListener('click', backToMain);
    
    // Экран результатов
    elements.nextRoundBtn.addEventListener('click', nextRound);
    elements.finishGameBtn.addEventListener('click', finishGame);
    
    // Экран окончания
    elements.newGameBtn.addEventListener('click', resetGame);
    elements.backToMainFromEnd.addEventListener('click', backToMain);
    
    // Обновление настроек в реальном времени
    elements.gameModeInputs.forEach(input => {
        input.addEventListener('change', updateGameSettings);
    });
    
    elements.timerDuration.addEventListener('change', updateGameSettings);
    elements.roundLimit.addEventListener('change', updateGameSettings);
    elements.team1Name.addEventListener('input', updateTeamNames);
    elements.team2Name.addEventListener('input', updateTeamNames);
    
    // Обработка клавиш (для удобства)
    document.addEventListener('keydown', handleKeyPress);
    
    // Предотвращение выключения экрана
    setupWakeLock();
}

// Обновление настроек игры
function updateGameSettings() {
    gameState.mode = document.querySelector('input[name="gameMode"]:checked').value;
    gameState.timerDuration = parseInt(elements.timerDuration.value);
    gameState.roundLimit = parseInt(elements.roundLimit.value);
    
    // Обновляем подсказку в зависимости от режима
    updateHintText();
}

// Обновление имён команд
function updateTeamNames() {
    const team1Name = elements.team1Name.value || 'Команда 1';
    const team2Name = elements.team2Name.value || 'Команда 2';
    
    // Сохраняем в localStorage для следующей игры
    localStorage.setItem('team1Name', team1Name);
    localStorage.setItem('team2Name', team2Name);
}

// Обновление текста подсказки
function updateHintText() {
    if (gameState.mode === 'alias') {
        elements.gameHint.textContent = 'Объясняйте слово словами, не используя само слово или однокоренные';
    } else {
        elements.gameHint.textContent = 'Показывайте слово жестами и мимикой, нельзя издавать звуки';
    }
}

// Загрузка состояния из localStorage
function loadGameState() {
    try {
        const savedTeam1 = localStorage.getItem('team1Name');
        const savedTeam2 = localStorage.getItem('team2Name');
        
        if (savedTeam1) elements.team1Name.value = savedTeam1;
        if (savedTeam2) elements.team2Name.value = savedTeam2;
    } catch (error) {
        console.warn('Не удалось загрузить сохранённое состояние:', error);
    }
}

// Обновление статистики последней игры
function updateLastGameStats() {
    try {
        const stats = JSON.parse(localStorage.getItem('lastGameStats'));
        if (stats) {
            const statsElement = document.getElementById('lastGameStats');
            statsElement.innerHTML = `
                <p><strong>${stats.winner}</strong> победил!</p>
                <p>Счёт: ${stats.team1Score} - ${stats.team2Score}</p>
                <p>Раундов: ${stats.totalRounds}</p>
                <p>Угадано слов: ${stats.totalGuessed}</p>
            `;
        }
    } catch (error) {
        console.warn('Не удалось загрузить статистику:', error);
    }
}

// Начало игры
function startGame() {
    // Собираем настройки
    updateGameSettings();
    updateTeamNames();
    
    // Сброс состояния игры
    resetGameState();
    
    // Показываем экран игры
    showScreen('gameScreen');
    
    // Начинаем раунд
    startRound();
}

// Сброс состояния игры
function resetGameState() {
    gameState.currentRound = 1;
    gameState.currentTeam = 1;
    gameState.scores = { team1: 0, team2: 0 };
    gameState.roundScores = { team1: 0, team2: 0 };
    gameState.usedWords.clear();
    gameState.guessedCount = 0;
    gameState.skippedCount = 0;
    gameState.roundHistory = [];
    gameState.timeLeft = gameState.timerDuration;
}

// Показать экран
function showScreen(screenName) {
    // Скрыть все экраны
    elements.mainScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.resultsScreen.classList.remove('active');
    elements.endScreen.classList.remove('active');
    
    // Показать нужный экран
    elements[screenName].classList.add('active');
}

// Показать/скрыть модальное окно
function showModal(show) {
    if (show) {
        elements.rulesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        elements.rulesModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Начало раунда
function startRound() {
    gameState.isPlaying = true;
    gameState.timeLeft = gameState.timerDuration;
    gameState.guessedCount = 0;
    gameState.skippedCount = 0;
    
    // Обновляем UI
    updateGameUI();
    
    // Показываем первое слово
    showRandomWord();
    
    // Запускаем таймер
    startTimer();
    
    // Вибрация (если поддерживается)
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// Обновление UI игры
function updateGameUI() {
    const teamName = gameState.currentTeam === 1 ? 
        elements.team1Name.value : elements.team2Name.value;
    
    elements.currentTeamName.textContent = teamName;
    elements.currentMode.textContent = gameState.mode === 'alias' ? 'Алиас' : 'Крокодил';
    elements.currentRound.textContent = gameState.currentRound;
    elements.totalRounds.textContent = gameState.roundLimit || '∞';
    elements.currentRoundScore.textContent = gameState.guessedCount;
    elements.totalRoundScore.textContent = gameState.guessedCount + gameState.skippedCount;
    elements.guessedCount.textContent = gameState.guessedCount;
    elements.skippedCount.textContent = gameState.skippedCount;
    elements.timerDisplay.textContent = gameState.timeLeft;
    
    updateHintText();
}

// Показать случайное слово
function showRandomWord() {
    if (gameState.words.length === 0) {
        elements.currentWord.textContent = 'Нет слов';
        elements.wordCategory.textContent = 'Ошибка';
        return;
    }
    
    // Фильтруем слова, которые ещё не использовались в этом раунде
    const availableWords = gameState.words.filter(word => 
        !gameState.usedWords.has(word.word)
    );
    
    // Если все слова использованы, очищаем список использованных
    if (availableWords.length === 0) {
        gameState.usedWords.clear();
        return showRandomWord();
    }
    
    // Выбираем случайное слово
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const randomWord = availableWords[randomIndex];
    
    // Добавляем в использованные
    gameState.usedWords.add(randomWord.word);
    
    // Обновляем UI
    elements.currentWord.textContent = randomWord.word;
    elements.wordCategory.textContent = randomWord.category;
    
    // Добавляем анимацию
    elements.currentWord.classList.add('word-change');
    setTimeout(() => {
        elements.currentWord.classList.remove('word-change');
    }, 300);
}

// Запуск таймера
function startTimer() {
    // Очищаем предыдущий таймер
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timeLeft = gameState.timerDuration;
    updateTimerDisplay();
    
    // Запускаем новый таймер
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        // Сигналы при малом времени
        if (gameState.timeLeft === 10) {
            playBeep('timer');
            if (navigator.vibrate) navigator.vibrate(200);
        }
        
        if (gameState.timeLeft === 5) {
            playBeep('timer');
            if (navigator.vibrate) navigator.vibrate(200);
        }
        
        if (gameState.timeLeft === 0) {
            endRound();
        }
    }, 1000);
}

// Обновление отображения таймера
function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;
    
    // Обновляем стиль таймера
    elements.timerCircle.classList.remove('warning', 'danger');
    
    if (gameState.timeLeft <= 10) {
        elements.timerCircle.classList.add('danger');
    } else if (gameState.timeLeft <= 30) {
        elements.timerCircle.classList.add('warning');
    }
}

// Обработка правильного ответа
function handleCorrect() {
    if (!gameState.isPlaying) return;
    
    gameState.guessedCount++;
    updateGameUI();
    
    // Вибрация
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    showRandomWord();
}

// Обработка пропуска слова
function handleSkip() {
    if (!gameState.isPlaying) return;
    
    gameState.skippedCount++;
    updateGameUI();
    
    // Короткая вибрация
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    showRandomWord();
}

// Остановка раунда (досрочно)
function stopRound() {
    if (!gameState.isPlaying) return;
    
    // Подтверждение
    if (gameState.guessedCount + gameState.skippedCount > 0) {
        if (!confirm('Завершить раунд досрочно?')) {
            return;
        }
    }
    
    endRound();
}

// Завершение раунда
function endRound() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    
    // Останавливаем таймер
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Звуковой сигнал
    playBeep('end');
    
    // Вибрация
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
    
    // Добавляем очки текущей команде
    if (gameState.currentTeam === 1) {
        gameState.scores.team1 += gameState.guessedCount;
        gameState.roundScores.team1 = gameState.guessedCount;
    } else {
        gameState.scores.team2 += gameState.guessedCount;
        gameState.roundScores.team2 = gameState.guessedCount;
    }
    
    // Сохраняем историю раунда
    gameState.roundHistory.push({
        round: gameState.currentRound,
        team: gameState.currentTeam,
        score: gameState.guessedCount,
        skipped: gameState.skippedCount,
        mode: gameState.mode
    });
    
    // Показываем экран результатов
    showResultsScreen();
}

// Показать экран результатов
function showResultsScreen() {
    // Обновляем данные
    elements.resultsMode.textContent = gameState.mode === 'alias' ? 'Алиас' : 'Крокодил';
    elements.resultsTime.textContent = `${gameState.timerDuration} сек`;
    elements.resultsGuessed.textContent = gameState.guessedCount;
    elements.resultsTeam1Name.textContent = elements.team1Name.value || 'Команда 1';
    elements.resultsTeam2Name.textContent = elements.team2Name.value || 'Команда 2';
    elements.resultsTeam1Score.textContent = gameState.scores.team1;
    elements.resultsTeam2Score.textContent = gameState.scores.team2;
    
    // Показываем следующее слово для интриги
    const nextWord = getNextWordHint();
    elements.nextWordHint.textContent = nextWord;
    
    showScreen('resultsScreen');
}

// Получить подсказку для следующего слова
function getNextWordHint() {
    const availableWords = gameState.words.filter(word => 
        !gameState.usedWords.has(word.word)
    );
    
    if (availableWords.length === 0) {
        return 'Все слова использованы!';
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const nextWord = availableWords[randomIndex];
    return `${nextWord.word} (${nextWord.category})`;
}

// Следующий раунд
function nextRound() {
    // Очищаем использованные слова для нового раунда
    gameState.usedWords.clear();
    
    // Меняем команду
    gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
    
    // Увеличиваем номер раунда
    gameState.currentRound++;
    
    // Проверяем лимит раундов
    if (gameState.roundLimit > 0 && gameState.currentRound > gameState.roundLimit) {
        finishGame();
        return;
    }
    
    // Начинаем новый раунд
    showScreen('gameScreen');
    startRound();
}

// Завершение игры
function finishGame() {
    // Определяем победителя
    let winner;
    if (gameState.scores.team1 > gameState.scores.team2) {
        winner = elements.team1Name.value || 'Команда 1';
    } else if (gameState.scores.team2 > gameState.scores.team1) {
        winner = elements.team2Name.value || 'Команда 2';
    } else {
        winner = 'Ничья!';
    }
    
    // Обновляем экран окончания
    elements.winnerName.textContent = winner;
    elements.finalTeam1Name.textContent = elements.team1Name.value || 'Команда 1';
    elements.finalTeam2Name.textContent = elements.team2Name.value || 'Команда 2';
    elements.finalTeam1Score.textContent = gameState.scores.team1;
    elements.finalTeam2Score.textContent = gameState.scores.team2;
    
    // Считаем раунды команд
    const team1Rounds = gameState.roundHistory.filter(r => r.team === 1).length;
    const team2Rounds = gameState.roundHistory.filter(r => r.team === 2).length;
    elements.finalTeam1Rounds.textContent = team1Rounds;
    elements.finalTeam2Rounds.textContent = team2Rounds;
    
    // Общая статистика
    const totalGuessed = gameState.roundHistory.reduce((sum, round) => sum + round.score, 0);
    const totalSkipped = gameState.roundHistory.reduce((sum, round) => sum + round.skipped, 0);
    elements.totalGuessed.textContent = totalGuessed;
    elements.totalSkipped.textContent = totalSkipped;
    elements.totalRoundsPlayed.textContent = gameState.roundHistory.length;
    
    // Сохраняем статистику
    saveGameStats(winner, totalGuessed);
    
    showScreen('endScreen');
}

// Сохранение статистики игры
function saveGameStats(winner, totalGuessed) {
    try {
        const stats = {
            winner,
            team1Score: gameState.scores.team1,
            team2Score: gameState.scores.team2,
            totalRounds: gameState.roundHistory.length,
            totalGuessed,
            date: new Date().toISOString()
        };
        
        localStorage.setItem('lastGameStats', JSON.stringify(stats));
    } catch (error) {
        console.warn('Не удалось сохранить статистику:', error);
    }
}

// Назад на главную
function backToMain() {
    if (gameState.isPlaying) {
        if (!confirm('Выйти из текущей игры? Прогресс будет потерян.')) {
            return;
        }
        
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    }
    
    showScreen('mainScreen');
    updateLastGameStats();
}

// Сброс и начало новой игры
function resetGame() {
    showScreen('mainScreen');
    updateLastGameStats();
}

// Обработка нажатий клавиш
function handleKeyPress(event) {
    if (!gameState.isPlaying) return;
    
    switch (event.code) {
        case 'Space':
        case 'Enter':
            event.preventDefault();
            handleCorrect();
            break;
        case 'ArrowRight':
        case 'KeyS':
            event.preventDefault();
            handleSkip();
            break;
        case 'Escape':
            event.preventDefault();
            stopRound();
            break;
    }
}

// Генерация звуковых сигналов
function generateAudioBeeps() {
    // Генерируем простой бип для таймера
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    try {
        // Таймер бип (короткий)
        const timerOscillator = audioContext.createOscillator();
        const timerGain = audioContext.createGain();
        timerOscillator.connect(timerGain);
        timerGain.connect(audioContext.destination);
        
        timerOscillator.frequency.value = 800;
        timerOscillator.type = 'sine';
        timerGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        // Записываем в аудио элемент
        const timerDestination = audioContext.createMediaStreamDestination();
        timerOscillator.connect(timerDestination);
        
        // Конец раунда (длинный)
        const endOscillator = audioContext.createOscillator();
        const endGain = audioContext.createGain();
        endOscillator.connect(endGain);
        endGain.connect(audioContext.destination);
        
        endOscillator.frequency.value = 600;
        endOscillator.type = 'sine';
        endGain.gain.setValueAtTime(0.4, audioContext.currentTime);
        
        const endDestination = audioContext.createMediaStreamDestination();
        endOscillator.connect(endDestination);
        
        // TODO: Реализовать Web Audio API для лучшего звука
        
    } catch (error) {
        console.warn('Web Audio API не поддерживается:', error);
    }
}

// Воспроизведение звука
function playBeep(type) {
    try {
        if (type === 'timer') {
            elements.timerBeep.currentTime = 0;
            elements.timerBeep.play().catch(e => console.debug('Не удалось воспроизвести звук:', e));
        } else if (type === 'end') {
            elements.endBeep.currentTime = 0;
            elements.endBeep.play().catch(e => console.debug('Не удалось воспроизвести звук:', e));
        }
    } catch (error) {
        console.debug('Ошибка воспроизведения звука:', error);
    }
}

// Предотвращение выключения экрана (если поддерживается)
function setupWakeLock() {
    if ('wakeLock' in navigator) {
        let wakeLock = null;
        
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.debug('Wake Lock активирован');
            } catch (err) {
                console.debug(`Wake Lock не активирован: ${err.name}, ${err.message}`);
            }
        };
        
        // Запрашиваем Wake Lock при начале игры
        document.addEventListener('visibilitychange', async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        });
        
        // Начинаем с активированным Wake Lock
        requestWakeLock();
    }
}

// Показать ошибку
function showError(message) {
    alert(`Ошибка: ${message}\n\nИгра будет использовать резервный набор слов.`);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);

// Обработка события перед закрытием страницы
window.addEventListener('beforeunload', (e) => {
    if (gameState.isPlaying) {
        e.preventDefault();
        e.returnValue = 'Игра ещё продолжается. Вы уверены, что хотите уйти?';
        return e.returnValue;
    }
});