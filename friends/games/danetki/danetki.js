// База данных данеток
const riddlesDatabase = {
    easy: [
        {
            question: "Человек заходит в бар и просит у бармена стакан воды. Бармен достает пистолет и целится в человека. Человек говорит 'спасибо' и уходит. Что произошло?",
            answer: "У человека была икота. Бармен напугал его пистолетом, и икота прошла.",
            hint: "Подумайте о физиологических реакциях организма на испуг."
        },
        {
            question: "Мужчина живет на 10-м этаже. Каждое утро он садится в лифт, спускается на первый этаж и идет на работу. Вечером он заходит в лифт, поднимается на 7-й этаж, а дальше идет пешком до 10-го. Почему?",
            answer: "Мужчина — карлик. Он может дотянуться только до кнопки 7-го этажа. Утром он нажимает кнопку 1-го этажа, потому что там есть кнопка вызова помощи, до которой он может дотянуться.",
            hint: "Подумайте о физических ограничениях человека."
        },
        {
            question: "Два человека подходят к реке. У берега стоит лодка, которая может выдержать только одного человека. Оба человека переправились на противоположный берег. Как?",
            answer: "Они были на разных берегах реки.",
            hint: "Не думайте, что они были на одном берегу."
        },
        {
            question: "В комнате находятся три лампочки. В соседней комнате — три выключателя, каждый из которых включает одну лампочку. Вы можете включать и выключать выключатели сколько угодно, но в комнату с лампочками можно зайти только один раз. Как определить, какой выключатель к какой лампочке относится?",
            answer: "1) Включить первый выключатель и подождать 10 минут. 2) Выключить первый и включить второй. 3) Зайти в комнату. Теплая, но не горящая лампочка — от первого выключателя, горящая — от второго, холодная — от третьего.",
            hint: "Используйте физические свойства лампочек при нагревании."
        },
        {
            question: "Мертвый человек лежит в пустыне. За спиной у него рюкзак. Что произошло?",
            answer: "Человек выпрыгнул с парашютом, но парашют не раскрылся. Рюкзак — это парашют.",
            hint: "Подумайте, что может быть в пустыне, кроме песка."
        }
    ],
    medium: [
        {
            question: "Человек поворачивает выключатель света, идет спать, а утром просыпается и узнает, что на соседней улице погибло 100 человек. Что произошло?",
            answer: "Человек — смотритель маяка. Он выключил свет маяка, из-за чего корабль разбился о скалы.",
            hint: "Подумайте о профессиях, связанных с включением/выключением света."
        },
        {
            question: "Мужчина находит в своем доме три письма. Он читает первое и смеется. Читает второе — плачет. Читает третье — умирает. Что было в письмах?",
            answer: "Мужчина был моряком. 1-е письмо: сообщение о рождении сына. 2-е письмо: сообщение о смерти жены. 3-е письмо: сообщение, что его сын — это не его сын. Он умер от сердечного приступа.",
            hint: "Письма пришли с большим интервалом времени."
        },
        {
            question: "В одной комнате висят два портрета. На одном изображен отец сына на другом портрете, а на втором — сын отца на первом портрете. Как это возможно?",
            answer: "На портретах изображены муж и жена. Это отец и мать их общего ребенка.",
            hint: "Не ограничивайтесь мужскими родственными связями."
        },
        {
            question: "Человек заходит в ресторан, заказывает стейк, съедает его, а затем выходит и совершает самоубийство. Почему?",
            answer: "Человек много лет назад был в кораблекрушении и выжил, питаясь мясом товарищей. В ресторане он понял по вкусу, что это был человеческий стейк, и не выдержал воспоминаний.",
            hint: "Подумайте о ситуациях выживания в экстремальных условиях."
        },
        {
            question: "Женщина бросает в почтовый ящик письмо. Через несколько минут она понимает, что допустила ошибку. Письмо уже невозможно вернуть. Женщина знает, что из-за этой ошибки человек умрет. Но она не пытается его спасти. Почему?",
            answer: "Женщина — авиадиспетчер. Она отправила пилоту неверные инструкции по посадке, положив их в специальный ящик для сообщений экипажу.",
            hint: "Подумайте о профессиях, где ошибка в письме может стоить жизни."
        }
    ],
    hard: [
        {
            question: "Один человек убил другого на глазах у многих свидетелей, но его не арестовали. Почему?",
            answer: "Это была дуэль. Убийство произошло по правилам дуэли, что в то время было законно.",
            hint: "Подумайте об исторических обстоятельствах, когда убийство могло быть законным."
        },
        {
            question: "Мужчина заходит в лифт в своем офисе на первом этаже. Он хочет подняться на 8-й этаж. Вместо этого он выходит на 5-м, идет пешком до 8-го, спускается на лифте до 1-го и идет домой. Почему?",
            answer: "Мужчина — карлик. Он может дотянуться только до кнопки 5-го этажа. Утром он на работу не шел — вечером он просто забыл документы на 8-м этаже.",
            hint: "Это усложненная версия классической данетки про карлика."
        },
        {
            question: "Девушка возвращается домой после 10 лет путешествий. Она видит мужчину, сидящего на ее крыльце, и сразу же убивает его. За что?",
            answer: "10 лет назад этот мужчина похитил ее сестру-близнеца. Увидев девушку, он подумал, что это призрак, и признался в убийстве. Девушка отомстила за сестру.",
            hint: "Подумайте о семейных связях и долгой мести."
        },
        {
            question: "В комнате лежит мертвый человек. Рядом — незапечатанный пакет и лужа воды. Что произошло?",
            answer: "Человек упал с большой высоты. Пакет — это парашют, который не раскрылся. Лужа — это растаявший лед, который образовался на большой высоте.",
            hint: "Подумайте о физических явлениях на большой высоте."
        },
        {
            question: "Мужчина бросает алмаз в озеро. Алмаз становится больше. Как это возможно?",
            answer: "Это был лед. Мужчина бросил кусок льда в озеро, и он замерз, увеличившись в размерах.",
            hint: "Подумайте о веществах, которые могут выглядеть как алмаз."
        }
    ]
};

// Основной объект игры
const DanetkiGame = {
    // Настройки
    currentDifficulty: 'easy',
    currentTime: 300, // 5 минут по умолчанию
    timerInterval: null,
    timeLeft: 0,
    isTimerRunning: false,
    
    // Прогресс
    currentRiddleIndex: 0,
    totalRiddles: 0,
    solvedRiddles: 0,
    currentRiddle: null,
    
    // Статистика
    stats: {
        totalPlayed: 0,
        solved: 0,
        skipped: 0,
        bestTime: 0
    },
    
    // Инициализация
    init() {
        this.loadStats();
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.setTotalRiddlesCount();
    },
    
    // Загрузка статистики
    loadStats() {
        const savedStats = localStorage.getItem('danetki_stats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    },
    
    // Сохранение статистики
    saveStats() {
        localStorage.setItem('danetki_stats', JSON.stringify(this.stats));
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопки сложности
        document.querySelectorAll('.difficulty-btn[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn[data-difficulty]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.setTotalRiddlesCount();
            });
        });
        
        // Кнопки таймера
        document.querySelectorAll('.difficulty-btn[data-time]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn[data-time]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTime = parseInt(e.target.dataset.time);
            });
        });
        
        // Основные кнопки
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('how-to-play').addEventListener('click', () => this.showScreen('rules'));
        document.getElementById('back-from-rules').addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('back-to-main').addEventListener('click', () => window.location.href = 'https://lovecouple.ru/friends/');
        
        // Кнопки игры
        document.getElementById('show-answer').addEventListener('click', () => this.showAnswer());
        document.getElementById('skip-riddle').addEventListener('click', () => this.nextRiddle());
        document.getElementById('next-riddle').addEventListener('click', () => this.nextRiddle());
        document.getElementById('back-to-settings').addEventListener('click', () => this.showScreen('settings'));
        
        // Кнопки ДА/НЕТ/Не имеет значения
        document.querySelectorAll('.yesno-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const answer = e.target.dataset.answer || e.target.closest('.yesno-btn').dataset.answer;
                this.logAnswer(answer);
            });
        });
        
        // Таймер
        document.getElementById('pause-timer').addEventListener('click', () => this.toggleTimer());
        document.getElementById('show-hint').addEventListener('click', () => this.showHint());
    },
    
    // Показать экран
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(`screen-${screenName}`).classList.add('active');
        
        if (screenName === 'game') {
            this.loadRiddle();
            this.startTimer();
        }
    },
    
    // Установить количество загадок
    setTotalRiddlesCount() {
        const count = riddlesDatabase[this.currentDifficulty].length;
        document.getElementById('total-riddles').textContent = count;
        document.getElementById('total-riddles-count').textContent = count;
        this.totalRiddles = count;
    },
    
    // Начать игру
    startGame() {
        this.currentRiddleIndex = 0;
        this.solvedRiddles = 0;
        this.showScreen('game');
        this.updateProgress();
    },
    
    // Загрузить загадку
    loadRiddle() {
        const riddles = riddlesDatabase[this.currentDifficulty];
        if (riddles.length === 0) return;
        
        this.currentRiddle = riddles[this.currentRiddleIndex];
        document.getElementById('riddle-text').textContent = this.currentRiddle.question;
        document.getElementById('hint-text').textContent = this.currentRiddle.hint;
        document.getElementById('hint-container').classList.remove('show');
        
        this.updateProgress();
        
        // Сброс таймера
        this.resetTimer();
    },
    
    // Обновить прогресс
    updateProgress() {
        const progress = ((this.currentRiddleIndex + 1) / this.totalRiddles) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('current-riddle').textContent = this.currentRiddleIndex + 1;
    },
    
    // Показать ответ
    showAnswer() {
        if (!this.currentRiddle) return;
        
        document.getElementById('answer-text').textContent = this.currentRiddle.answer;
        this.showScreen('answer');
        
        // Обновляем статистику
        this.stats.solved++;
        this.stats.totalPlayed++;
        this.saveStats();
        this.updateStatsDisplay();
        
        this.stopTimer();
    },
    
    // Следующая загадка
    nextRiddle() {
        this.currentRiddleIndex++;
        
        if (this.currentRiddleIndex >= this.totalRiddles) {
            this.currentRiddleIndex = 0; // Начинаем заново
        }
        
        this.showScreen('game');
        this.loadRiddle();
        
        // Обновляем статистику
        this.stats.skipped++;
        this.stats.totalPlayed++;
        this.saveStats();
        this.updateStatsDisplay();
    },
    
    // Показать подсказку
    showHint() {
        document.getElementById('hint-container').classList.add('show');
    },
    
    // Логировать ответ (для статистики)
    logAnswer(answer) {
        console.log(`Игрок предположил: ${answer}`);
        // Здесь можно добавить логику для анализа вопросов игроков
    },
    
    // Таймер
    startTimer() {
        if (this.currentTime === 0) {
            document.querySelector('.timer-container').style.display = 'none';
            return;
        }
        
        document.querySelector('.timer-container').style.display = 'block';
        this.timeLeft = this.currentTime;
        this.isTimerRunning = true;
        
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            if (this.isTimerRunning) {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    this.stopTimer();
                    // Автоматически показываем ответ при окончании времени
                    setTimeout(() => this.showAnswer(), 1000);
                }
            }
        }, 1000);
    },
    
    stopTimer() {
        this.isTimerRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    toggleTimer() {
        this.isTimerRunning = !this.isTimerRunning;
        const btn = document.getElementById('pause-timer');
        if (this.isTimerRunning) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
        }
    },
    
    resetTimer() {
        this.stopTimer();
        this.timeLeft = this.currentTime;
        this.updateTimerDisplay();
        document.getElementById('pause-timer').innerHTML = '<i class="fas fa-pause"></i> Пауза';
        this.isTimerRunning = true;
        
        if (this.currentTime > 0) {
            this.startTimer();
        }
    },
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timerElement = document.getElementById('timer');
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Изменение цвета при малом времени
        timerElement.classList.remove('warning', 'danger');
        if (this.timeLeft <= 60) {
            timerElement.classList.add('danger');
        } else if (this.timeLeft <= 120) {
            timerElement.classList.add('warning');
        }
    },
    
    // Обновить отображение статистики
    updateStatsDisplay() {
        document.getElementById('total-riddles').textContent = this.stats.totalPlayed || 0;
        document.getElementById('solved-riddles').textContent = this.stats.solved || 0;
        
        // Средняя сложность
        const difficulties = {
            easy: 'Легкая',
            medium: 'Средняя',
            hard: 'Сложная'
        };
        document.getElementById('avg-difficulty').textContent = difficulties[this.currentDifficulty] || '-';
        
        // Лучшее время
        if (this.stats.bestTime > 0) {
            const minutes = Math.floor(this.stats.bestTime / 60);
            const seconds = this.stats.bestTime % 60;
            document.getElementById('best-time').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    DanetkiGame.init();
    
    // Плавное появление
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Сохраняем глобально для отладки
window.DanetkiGame = DanetkiGame;
