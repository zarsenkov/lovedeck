// Расширенная база данеток
const riddlesDatabase = {
    easy: [
        {
            question: "Человек заходит в бар и просит у бармена стакан воды. Бармен достает пистолет и целится в человека. Человек говорит 'спасибо' и уходит. Что произошло?",
            answer: "У человека была икота. Бармен напугал его пистолетом, и икота прошла."
        },
        {
            question: "Мужчина живет на 10-м этаже. Каждое утро он спускается на лифте на первый этаж и идет на работу. Вечером он поднимается на лифте только до 7-го этажа, а дальше идет пешком. Почему?",
            answer: "Мужчина — карлик. Он может дотянуться только до кнопки 7-го этажа."
        },
        {
            question: "Два человека подходят к реке. У берега стоит лодка, которая может выдержать только одного человека. Оба человека переправились на противоположный берег. Как?",
            answer: "Они были на разных берегах реки."
        },
        {
            question: "В комнате находятся три лампочки. В соседней комнате — три выключателя. Вы можете включать и выключать выключатели сколько угодно, но в комнату с лампочками можно зайти только один раз. Как определить, какой выключатель к какой лампочке относится?",
            answer: "1. Включить первый выключатель и подождать 10 минут. 2. Выключить первый и включить второй. 3. Зайти в комнату. Теплая лампочка — от первого, горящая — от второго, холодная — от третьего."
        },
        {
            question: "Мертвый человек лежит в пустыне. За спиной у него рюкзак. Что произошло?",
            answer: "Человек выпрыгнул с парашютом, но парашют не раскрылся."
        },
        {
            question: "Человек вошел в лифт в подвале, хотел подняться на 10-й этаж, но вышел на 5-м и пошел пешком. Почему?",
            answer: "Человек очень низкого роста и может дотянуться только до кнопки 5-го этажа."
        },
        {
            question: "Женщина покупает в магазине булку хлеба за 30 рублей. Продавец взял деньги, но не дал сдачи. Почему?",
            answer: "Женщина дала ровно 30 рублей."
        },
        {
            question: "Две матери и две дочери зашли в кафе и заказали по одному кофе. Им принесли три чашки кофе. Почему?",
            answer: "Их было трое: бабушка, мать и дочь."
        },
        {
            question: "В закрытой комнате лежит мертвый человек. На потолке висит крюк, на полу лужа воды и осколки стекла. Что произошло?",
            answer: "Человек был в аквариуме. Лопнуло стекло, и он захлебнулся."
        },
        {
            question: "Человек ехал в машине. Внезапно машина остановилась, и человек умер. Почему?",
            answer: "Человек был воздушным шариком. Машина резко затормозила, и он лопнул."
        }
    ],
    medium: [
        {
            question: "Человек поворачивает выключатель света, идет спать, а утром просыпается и узнает, что на соседней улице погибло 100 человек. Что произошло?",
            answer: "Человек — смотритель маяка. Он выключил свет маяка, из-за чего корабль разбился о скалы."
        },
        {
            question: "Мужчина находит в своем доме три письма. Он читает первое и смеется. Читает второе — плачет. Читает третье — умирает. Что было в письмах?",
            answer: "Мужчина был моряком. 1-е письмо: сообщение о рождении сына. 2-е письмо: сообщение о смерти жены. 3-е письмо: сообщение, что его сын — это не его сын."
        },
        {
            question: "В одной комнате висят два портрета. На одном изображен отец сына на другом портрете, а на втором — сын отца на первом портрете. Как это возможно?",
            answer: "На портретах изображены муж и жена. Это отец и мать их общего ребенка."
        },
        {
            question: "Человек заходит в ресторан, заказывает стейк, съедает его, а затем выходит и совершает самоубийство. Почему?",
            answer: "Человек много лет назад был в кораблекрушении и выжил, питаясь мясом товарищей. В ресторане он понял по вкусу, что это был человеческий стейк."
        },
        {
            question: "Женщина бросает в почтовый ящик письмо. Через несколько минут она понимает, что допустила ошибку. Письмо уже невозможно вернуть. Женщина знает, что из-за этой ошибки человек умрет. Но она не пытается его спасти. Почему?",
            answer: "Женщина — авиадиспетчер. Она отправила пилоту неверные инструкции по посадке."
        },
        {
            question: "Мужчина читает книгу. Вдруг он закрывает книгу, включает свет и совершает самоубийство. Почему?",
            answer: "Мужчина был слепым. Он читал книгу шрифтом Брайля и узнал, что его жена ему изменяет. Свет он включил, чтобы написать предсмертную записку."
        },
        {
            question: "Женщина заходит в магазин и покупает 12 яиц. На улице она роняет все яйца, но ни одно не разбилось. Почему?",
            answer: "Яйца были вареные."
        },
        {
            question: "Мужчина умирает в пустыне. Рядом с ним лежат сломанные спички и багаж. Что произошло?",
            answer: "Мужчина летел на воздушном шаре. Шар начал терять высоту, и он выбросил весь багаж, но этого было недостаточно. Тогда он бросил жребий спичками, кому выпрыгнуть."
        },
        {
            question: "Человек входит в бар и просит стакан воды. Бармен смотрит на него, достает пистолет и стреляет в потолок. Человек говорит 'спасибо' и уходит. Что произошло?",
            answer: "У человека была икота, а бармен решил его напугать, чтобы икота прошла."
        },
        {
            question: "В комнате лежат 5 кусочков угля, 1 морковка и 2 шапки. Никто не заходил в комнату, но морковка и шапки исчезли. Почему?",
            answer: "Это была снежная баба. Угольки — глаза и пуговицы, морковка — нос, шапки — головные уборы. Снег растаял."
        }
    ],
    hard: [
        {
            question: "Один человек убил другого на глазах у многих свидетелей, но его не арестовали. Почему?",
            answer: "Это была дуэль. Убийство произошло по правилам дуэли, что в то время было законно."
        },
        {
            question: "Девушка возвращается домой после 10 лет путешествий. Она видит мужчину, сидящего на ее крыльце, и сразу же убивает его. За что?",
            answer: "10 лет назад этот мужчина похитил ее сестру-близнеца. Увидев девушку, он подумал, что это призрак, и признался в убийстве."
        },
        {
            question: "В комнате лежит мертвый человек. Рядом — незапечатанный пакет и лужа воды. Что произошло?",
            answer: "Человек упал с большой высоты. Пакет — это парашют, который не раскрылся. Лужа — это растаявший лед."
        },
        {
            question: "Мужчина бросает алмаз в озеро. Алмаз становится больше. Как это возможно?",
            answer: "Это был лед. Мужчина бросил кусок льда в озеро, и он замерз, увеличившись в размерах."
        },
        {
            question: "В закрытой комнате без окон и дверей лежит мертвый человек. Рядом с ним — кусок льда и лужа воды. Что произошло?",
            answer: "Человек упал с самолета. Лед образовался на большой высоте, а потом растаял."
        },
        {
            question: "Мужчина заходит в лифт, чтобы подняться на 10-й этаж. Он нажимает кнопку 5-го этажа, выходит и идет пешком до 10-го. Почему?",
            answer: "Мужчина — карлик. Он может дотянуться только до кнопки 5-го этажа. Сегодня он пришел в гости к другу, который живет на 10-м этаже."
        },
        {
            question: "Человек стоит перед картиной и говорит: 'У меня нет братьев и сестер, но отец этого человека — сын моего отца'. Кто изображен на картине?",
            answer: "На картине изображен его сын."
        },
        {
            question: "Мужчина умер в кабине лифта. Лифт был между этажами. Рядом с ним лежал зонт. Что произошло?",
            answer: "Мужчина был карликом. Он пытался дотянуться зонтом до кнопки вызова, но сорвался и упал."
        },
        {
            question: "Женщина родила двух мальчиков в один день, в один час, в одном году, но они не близнецы. Как такое возможно?",
            answer: "Это были два из тройни."
        },
        {
            question: "Мужчина бросил камень в окно своего дома. Почему он это сделал?",
            answer: "Он забыл ключи, а в доме была открыта форточка. Камнем он хотел сбить замок с двери."
        }
    ]
};

// Основной объект игры
const DanetkiGame = {
    // Настройки
    settings: {
        playerCount: 4,
        teamCount: 1,
        difficulty: 'easy',
        timerDuration: 120,
        maxRounds: 10, // Ограничение на количество раундов
        usedRiddles: {
            easy: [],
            medium: [],
            hard: []
        }
    },
    
    // Состояние игры
    state: {
        currentPlayer: 0,
        currentTeam: 0,
        players: [],
        teams: [],
        scores: {},
        currentRiddle: null,
        timer: null,
        timeLeft: 0,
        isTimerRunning: false,
        gameStartTime: null,
        totalRiddles: 0,
        solvedRiddles: 0,
        currentRound: 0,
        isGameActive: false
    },
    
    // Инициализация
    init() {
        this.loadGameState();
        this.setupEventListeners();
        this.updatePlayerSelectors();
    },
    
    // Загрузка состояния игры
    loadGameState() {
        const savedState = localStorage.getItem('danetki_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
        }
    },
    
    // Сохранение состояния игры
    saveGameState() {
        const state = {
            settings: this.settings
        };
        localStorage.setItem('danetki_state', JSON.stringify(state));
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Настройка игроков
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const count = parseInt(e.target.dataset.count);
                this.settings.playerCount = count;
                this.updatePlayerSelectors();
                this.saveGameState();
            });
        });
        
        // Настройка команд
        document.querySelectorAll('.team-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const teams = parseInt(e.target.dataset.teams);
                this.settings.teamCount = teams;
                this.updatePlayerSelectors();
                this.saveGameState();
            });
        });
        
        // Настройка сложности
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.difficulty = e.target.dataset.difficulty;
                this.saveGameState();
            });
        });
        
        // Настройка таймера
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.timerDuration = parseInt(e.target.dataset.time);
                this.saveGameState();
            });
        });
        
        // Старт игры
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        // Игровые кнопки
        document.getElementById('correct-guess').addEventListener('click', () => this.handleCorrectGuess());
        document.getElementById('skip-riddle').addEventListener('click', () => this.nextTurn());
        document.getElementById('pause-timer').addEventListener('click', () => this.toggleTimer());
        document.getElementById('next-player').addEventListener('click', () => this.nextTurn());
        
        // Кнопка "В настройки" во время игры
        document.getElementById('back-to-setup-from-game').addEventListener('click', () => this.backToSetup());
        
        // Кнопки итогов
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-setup').addEventListener('click', () => this.showScreen('setup'));
    },
    
    // Обновление селекторов игроков
    updatePlayerSelectors() {
        // Обновляем активные кнопки
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            const count = parseInt(btn.dataset.count);
            btn.classList.toggle('active', count === this.settings.playerCount);
        });
        
        document.querySelectorAll('.team-count-btn').forEach(btn => {
            const teams = parseInt(btn.dataset.teams);
            btn.classList.toggle('active', teams === this.settings.teamCount);
        });
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.settings.difficulty);
        });
        
        document.querySelectorAll('.timer-btn').forEach(btn => {
            const time = parseInt(btn.dataset.time);
            btn.classList.toggle('active', time === this.settings.timerDuration);
        });
    },
    
    // Начать игру
    startGame() {
        this.state.gameStartTime = Date.now();
        this.state.totalRiddles = 0;
        this.state.solvedRiddles = 0;
        this.state.currentRound = 0;
        this.state.isGameActive = true;
        
        // Сбрасываем использованные загадки
        this.settings.usedRiddles[this.settings.difficulty] = [];
        
        // Инициализация игроков/команд
        this.initPlayersAndTeams();
        
        // Показываем экран игры
        this.showScreen('game');
        
        // Загружаем первую загадку
        this.loadNewRiddle();
        
        // Запускаем таймер
        this.startTimer();
    },
    
    // Инициализация игроков и команд
    initPlayersAndTeams() {
        this.state.players = [];
        this.state.teams = [];
        this.state.scores = {};
        
        // Создаем игроков
        for (let i = 1; i <= this.settings.playerCount; i++) {
            this.state.players.push(`Игрок ${i}`);
            this.state.scores[`player_${i}`] = 0;
        }
        
        // Создаем команды если нужно
        if (this.settings.teamCount > 1) {
            for (let i = 1; i <= this.settings.teamCount; i++) {
                this.state.teams.push(`Команда ${i}`);
                this.state.scores[`team_${i}`] = 0;
            }
        }
        
        // Случайный первый игрок
        this.state.currentPlayer = Math.floor(Math.random() * this.settings.playerCount);
        this.state.currentTeam = Math.floor(Math.random() * Math.max(1, this.settings.teamCount));
        
        this.updateScoreboard();
        this.updateTurnDisplay();
    },
    
    // Показать экран
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(`screen-${screenName}`).classList.add('active');
        
        if (screenName === 'game') {
            this.updateScoreboard();
            // Показываем/скрываем кнопку "В настройки"
            document.getElementById('back-to-setup-from-game').style.display = 'block';
        } else if (screenName === 'setup') {
            document.getElementById('back-to-setup-from-game').style.display = 'none';
        }
    },
    
    // Вернуться в настройки
    backToSetup() {
        if (confirm('Вы действительно хотите выйти в настройки? Текущая игра будет сброшена.')) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.state.isGameActive = false;
            this.showScreen('setup');
        }
    },
    
    // Загрузить новую загадку
    loadNewRiddle() {
        // Проверяем, не закончились ли загадки
        const riddles = riddlesDatabase[this.settings.difficulty];
        const usedRiddles = this.settings.usedRiddles[this.settings.difficulty];
        
        // Если все загадки использованы, завершаем игру
        if (usedRiddles.length >= riddles.length) {
            this.endGame('Загадки закончились!');
            return;
        }
        
        // Если достигли максимального количества раундов
        if (this.state.currentRound >= this.settings.maxRounds) {
            this.endGame('Игра завершена!');
            return;
        }
        
        // Выбираем случайную неиспользованную загадку
        let availableIndices = [];
        for (let i = 0; i < riddles.length; i++) {
            if (!usedRiddles.includes(i)) {
                availableIndices.push(i);
            }
        }
        
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.state.currentRiddle = riddles[randomIndex];
        usedRiddles.push(randomIndex);
        
        // Обновляем отображение
        document.getElementById('riddle-text').textContent = this.state.currentRiddle.question;
        document.getElementById('answer-text').textContent = this.state.currentRiddle.answer;
        document.getElementById('riddle-number').textContent = this.state.totalRiddles + 1;
        
        this.state.totalRiddles++;
        this.state.currentRound++;
        this.saveGameState();
    },
    
    // Обработка правильного ответа
    handleCorrectGuess() {
        // Добавляем анимацию клика
        const btn = document.getElementById('correct-guess');
        btn.classList.add('click-animation');
        setTimeout(() => btn.classList.remove('click-animation'), 200);
        
        // Начисляем очки
        this.addScore(1);
        
        // Обновляем статистику
        this.state.solvedRiddles++;
        
        // Переходим к следующему ходу
        setTimeout(() => this.nextTurn(), 300);
    },
    
    // Следующий ход
    nextTurn() {
        if (!this.state.isGameActive) return;
        
        // Следующий игрок
        this.state.currentPlayer = (this.state.currentPlayer + 1) % this.settings.playerCount;
        
        // Если есть команды, переключаем команду
        if (this.settings.teamCount > 1) {
            this.state.currentTeam = (this.state.currentTeam + 1) % this.settings.teamCount;
        }
        
        // Загружаем новую загадку
        this.loadNewRiddle();
        
        // Обновляем отображение
        this.updateTurnDisplay();
        this.updateScoreboard();
        
        // Сбрасываем таймер
        this.resetTimer();
    },
    
    // Добавить очки
    addScore(points) {
        if (this.settings.teamCount > 1) {
            // Очки команде
            const teamKey = `team_${this.state.currentTeam + 1}`;
            this.state.scores[teamKey] = (this.state.scores[teamKey] || 0) + points;
        } else {
            // Очки игроку
            const playerKey = `player_${this.state.currentPlayer + 1}`;
            this.state.scores[playerKey] = (this.state.scores[playerKey] || 0) + points;
        }
    },
    
    // Обновить отображение хода
    updateTurnDisplay() {
        let turnText;
        let scoreText;
        
        if (this.settings.teamCount > 1) {
            turnText = this.state.teams[this.state.currentTeam];
            scoreText = this.state.scores[`team_${this.state.currentTeam + 1}`] || 0;
        } else {
            turnText = this.state.players[this.state.currentPlayer];
            scoreText = this.state.scores[`player_${this.state.currentPlayer + 1}`] || 0;
        }
        
        document.getElementById('current-turn').textContent = turnText;
        document.getElementById('current-score').textContent = scoreText;
        
        // Обновляем счетчик раундов
        document.getElementById('round-counter').textContent = 
            `Раунд ${this.state.currentRound} из ${this.settings.maxRounds}`;
    },
    
    // Обновить таблицу счёта
    updateScoreboard() {
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerHTML = '';
        
        if (this.settings.teamCount > 1) {
            // Отображаем команды
            this.state.teams.forEach((team, index) => {
                const score = this.state.scores[`team_${index + 1}`] || 0;
                const isCurrent = index === this.state.currentTeam;
                
                const item = document.createElement('div');
                item.className = `scoreboard-item ${isCurrent ? 'current' : ''}`;
                item.innerHTML = `
                    <div class="player-name">
                        <i class="fas fa-users"></i> ${team}
                    </div>
                    <div class="player-score">${score}</div>
                `;
                scoreboard.appendChild(item);
            });
        } else {
            // Отображаем игроков
            this.state.players.forEach((player, index) => {
                const score = this.state.scores[`player_${index + 1}`] || 0;
                const isCurrent = index === this.state.currentPlayer;
                
                const item = document.createElement('div');
                item.className = `scoreboard-item ${isCurrent ? 'current' : ''}`;
                item.innerHTML = `
                    <div class="player-name">
                        <i class="fas fa-user"></i> ${player}
                    </div>
                    <div class="player-score">${score}</div>
                `;
                scoreboard.appendChild(item);
            });
        }
    },
    
    // Таймер
    startTimer() {
        if (this.settings.timerDuration === 0) {
            document.querySelector('.game-timer-container').style.display = 'none';
            return;
        }
        
        this.timeLeft = this.settings.timerDuration;
        this.isTimerRunning = true;
        
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            if (this.isTimerRunning && this.state.isGameActive) {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    // Таймер истёк - автоматически следующий ход
                    this.nextTurn();
                }
            }
        }, 1000);
    },
    
    toggleTimer() {
        this.isTimerRunning = !this.isTimerRunning;
        const btn = document.getElementById('pause-timer');
        btn.innerHTML = this.isTimerRunning ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
    },
    
    resetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timeLeft = this.settings.timerDuration;
        this.isTimerRunning = true;
        this.updateTimerDisplay();
        
        if (this.settings.timerDuration > 0) {
            this.startTimer();
        }
    },
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timerElement = document.getElementById('timer');
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Изменение цвета
        timerElement.classList.remove('warning', 'danger');
        if (this.timeLeft <= 30) {
            timerElement.classList.add('danger');
        } else if (this.timeLeft <= 60) {
            timerElement.classList.add('warning');
        }
    },
    
    // Завершить игру
    endGame(reason) {
        if (!this.state.isGameActive) return;
        
        this.state.isGameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Сохраняем причину завершения
        this.state.endReason = reason || 'Игра завершена';
        
        this.showScreen('results');
        this.showResults();
    },
    
    // Показать результаты
    showResults() {
        let winnerName = '';
        let winnerScore = -1;
        
        // Находим победителя
        Object.entries(this.state.scores).forEach(([key, score]) => {
            if (score > winnerScore) {
                winnerScore = score;
                if (key.startsWith('team_')) {
                    const teamIndex = parseInt(key.split('_')[1]) - 1;
                    winnerName = this.state.teams[teamIndex];
                } else {
                    const playerIndex = parseInt(key.split('_')[1]) - 1;
                    winnerName = this.state.players[playerIndex];
                }
            }
        });
        
        // Обновляем победителя
        document.getElementById('winner-name').textContent = winnerName;
        document.getElementById('winner-score').textContent = `${winnerScore} очков`;
        
        // Причина завершения
        document.getElementById('end-reason').textContent = this.state.endReason;
        
        // Обновляем таблицу результатов
        const finalScoreboard = document.getElementById('final-scoreboard');
        finalScoreboard.innerHTML = '';
        
        if (this.settings.teamCount > 1) {
            // Командные результаты
            this.state.teams.forEach((team, index) => {
                const score = this.state.scores[`team_${index + 1}`] || 0;
                const isWinner = team === winnerName;
                
                const item = document.createElement('div');
                item.className = `final-score-item ${isWinner ? 'winner' : ''}`;
                item.innerHTML = `
                    <span>${team}</span>
                    <span>${score} очков</span>
                `;
                finalScoreboard.appendChild(item);
            });
        } else {
            // Индивидуальные результаты
            this.state.players.forEach((player, index) => {
                const score = this.state.scores[`player_${index + 1}`] || 0;
                const isWinner = player === winnerName;
                
                const item = document.createElement('div');
                item.className = `final-score-item ${isWinner ? 'winner' : ''}`;
                item.innerHTML = `
                    <span>${player}</span>
                    <span>${score} очков</span>
                `;
                finalScoreboard.appendChild(item);
            });
        }
        
        // Обновляем статистику
        document.getElementById('total-riddles').textContent = this.state.totalRiddles;
        document.getElementById('solved-riddles').textContent = this.state.solvedRiddles;
        
        // Время игры
        const gameTime = Date.now() - this.state.gameStartTime;
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        document.getElementById('game-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // Играть снова
    playAgain() {
        // Сбрасываем использованные загадки
        this.settings.usedRiddles[this.settings.difficulty] = [];
        
        // Начинаем новую игру
        this.startGame();
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
    
    // Предотвращаем двойное нажатие на мобильных устройствах
    let lastClickTime = 0;
    document.addEventListener('click', (e) => {
        const currentTime = Date.now();
        if (currentTime - lastClickTime < 1000) {
            e.preventDefault();
        }
        lastClickTime = currentTime;
    }, true);
});

// Экспорт для отладки
window.DanetkiGame = DanetkiGame;
