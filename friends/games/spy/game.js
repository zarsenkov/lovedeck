// Основной игровой объект
const SpyGame = {
    // Конфигурация игры
    config: {
        playerCount: 6,
        spyCount: 1,
        gameMode: 'classic', // classic, elimination, team
        timerEnabled: true,
        discussionTime: 90,
        categories: ['public', 'nature', 'entertainment', 'professions'],
        roleTimer: 10
    },

    // Состояние игры
    state: {
        phase: 'setup', // setup, handoff, role, discussion, voting, results, final
        players: [],
        currentPlayerIndex: 0,
        currentLocation: null,
        currentRound: 1,
        votes: {},
        eliminatedPlayers: [],
        gameLog: [],
        timers: {},
        selectedPlayerForVote: null,
        spyPlayers: []
    },

    // Инициализация
    init() {
        console.log('Игра "Шпион" инициализирована');
        this.loadConfig();
        this.bindEvents();
        this.renderCategoryOptions();
        this.updatePlayerCount(6);
        this.updateSpyCount(1);
        this.addLog('Игра запущена');
    },

    // Загрузка конфигурации
    loadConfig() {
        const savedConfig = localStorage.getItem('spyConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
    },

    // Привязка событий
    bindEvents() {
        // Кнопки количества игроков
        document.getElementById('decreasePlayers')?.addEventListener('click', () => {
            if (this.config.playerCount > 3) {
                this.updatePlayerCount(this.config.playerCount - 1);
            }
        });

        document.getElementById('increasePlayers')?.addEventListener('click', () => {
            if (this.config.playerCount < 10) {
                this.updatePlayerCount(this.config.playerCount + 1);
            }
        });

        document.getElementById('playerSlider')?.addEventListener('input', (e) => {
            this.updatePlayerCount(parseInt(e.target.value));
        });

        // Кнопки количества шпионов
        document.getElementById('decreaseSpies')?.addEventListener('click', () => {
            if (this.config.spyCount > 1) {
                this.updateSpyCount(this.config.spyCount - 1);
            }
        });

        document.getElementById('increaseSpies')?.addEventListener('click', () => {
            const maxSpies = Math.max(1, Math.floor(this.config.playerCount / 2) - 1);
            if (this.config.spyCount < maxSpies) {
                this.updateSpyCount(this.config.spyCount + 1);
            }
        });

        // Режимы игры
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.mode-btn').classList.add('active');
                this.config.gameMode = e.target.closest('.mode-btn').dataset.mode;
            });
        });

        // Таймер
        document.getElementById('timerEnabled')?.addEventListener('change', (e) => {
            this.config.timerEnabled = e.target.checked;
            const timerSettings = document.getElementById('timerSettings');
            if (timerSettings) {
                timerSettings.style.display = e.target.checked ? 'block' : 'none';
            }
        });

        document.querySelectorAll('.time-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-preset').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.discussionTime = parseInt(e.target.dataset.time);
                document.getElementById('customTime').value = this.config.discussionTime;
            });
        });

        document.getElementById('customTime')?.addEventListener('change', (e) => {
            this.config.discussionTime = parseInt(e.target.value) || 90;
        });

        // Категории
        document.querySelectorAll('.category-select').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.dataset.category;
                if (e.target.checked) {
                    if (!this.config.categories.includes(category)) {
                        this.config.categories.push(category);
                    }
                } else {
                    this.config.categories = this.config.categories.filter(c => c !== category);
                }
            });
        });

        // Старт игры
        document.getElementById('startGameBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.startGame();
        });

        // Показ роли
        document.getElementById('showRoleBtn')?.addEventListener('click', () => {
            this.showRole();
        });

        document.getElementById('skipPlayer')?.addEventListener('click', () => {
            this.skipPlayer();
        });

        // Скрытие роли
        document.getElementById('hideRoleBtn')?.addEventListener('click', () => {
            this.hideRole();
        });

        // Обсуждение
        document.getElementById('startVotingBtn')?.addEventListener('click', () => {
            this.startVoting();
        });

        document.getElementById('skipDiscussionBtn')?.addEventListener('click', () => {
            this.skipDiscussion();
        });

        // Голосование
        document.getElementById('submitVoteBtn')?.addEventListener('click', () => {
            this.submitVote();
        });

        document.getElementById('skipVoterBtn')?.addEventListener('click', () => {
            this.skipVoter();
        });

        // Результаты
        document.getElementById('nextRoundBtn')?.addEventListener('click', () => {
            this.nextRound();
        });

        document.getElementById('showRolesBtn')?.addEventListener('click', () => {
            this.showFinalResults();
        });

        // Итоги
        document.getElementById('playAgainBtn')?.addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('backToMenuBtn')?.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
    },

    // Обновление количества игроков
    updatePlayerCount(count) {
        this.config.playerCount = count;
        
        const playerCountElement = document.getElementById('playerCount');
        const playerSlider = document.getElementById('playerSlider');
        
        if (playerCountElement) playerCountElement.textContent = count;
        if (playerSlider) playerSlider.value = count;
        
        // Обновить максимальное количество шпионов
        this.updateSpyHint();
    },

    // Обновление количества шпионов
    updateSpyCount(count) {
        this.config.spyCount = count;
        
        const spyCountElement = document.getElementById('spyCount');
        if (spyCountElement) {
            spyCountElement.textContent = count;
        }
        
        this.updateSpyHint();
    },

    // Обновление подсказки про шпионов
    updateSpyHint() {
        const maxSpies = Math.max(1, Math.floor(this.config.playerCount / 2) - 1);
        const hintElement = document.getElementById('spyHint');
        
        if (hintElement) {
            hintElement.textContent = `Рекомендуется: 1 шпион на 4-6 игроков (максимум: ${maxSpies})`;
        }
        
        // Ограничить количество шпионов
        if (this.config.spyCount > maxSpies) {
            this.config.spyCount = maxSpies;
            document.getElementById('spyCount').textContent = maxSpies;
        }
    },

    // Рендер категорий
    renderCategoryOptions() {
        const checkboxes = document.querySelectorAll('.category-select');
        checkboxes.forEach(checkbox => {
            const category = checkbox.dataset.category;
            checkbox.checked = this.config.categories.includes(category);
        });
    },

    // Начало игры
    startGame() {
        console.log('Начало игры "Шпион"');
        
        // Проверка валидности
        if (this.config.playerCount < 3) {
            alert('Минимальное количество игроков: 3');
            return;
        }
        
        if (this.config.spyCount >= this.config.playerCount - 1) {
            alert('Слишком много шпионов! Должен остаться хотя бы 1 мирный игрок');
            return;
        }
        
        if (this.config.categories.length === 0) {
            alert('Выберите хотя бы одну категорию локаций');
            return;
        }
        
        // Сохранить конфигурацию
        localStorage.setItem('spyConfig', JSON.stringify(this.config));
        
        // Создать игроков
        this.createPlayers();
        
        // Выбрать локацию
        this.selectLocation();
        
        // Выбрать шпионов
        this.selectSpies();
        
        // Начать фазу передачи телефона
        this.showScreen('handoff');
        this.startHandoffPhase();
        
        this.addLog(`Игра началась: ${this.config.playerCount} игроков, ${this.config.spyCount} шпион(ов)`);
        this.addLog(`Локация: ${this.state.currentLocation.name}`);
    },

    // Создание игроков
    createPlayers() {
        this.state.players = [];
        
        for (let i = 1; i <= this.config.playerCount; i++) {
            this.state.players.push({
                id: i,
                name: `Игрок ${i}`,
                role: 'civilian', // По умолчанию все мирные
                alive: true,
                hasSeenRole: false,
                votes: 0,
                voted: false
            });
        }
        
        this.state.currentPlayerIndex = 0;
        this.state.spyPlayers = [];
        this.state.eliminatedPlayers = [];
        this.state.votes = {};
    },

    // Выбор локации
    selectLocation() {
        this.state.currentLocation = SpyData.getRandomLocation(this.config.categories);
        console.log('Выбрана локация:', this.state.currentLocation.name);
    },

    // Выбор шпионов
    selectSpies() {
        const playerIndices = Array.from({ length: this.config.playerCount }, (_, i) => i);
        
        // Перемешать индексы
        for (let i = playerIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIndices[i], playerIndices[j]] = [playerIndices[j], playerIndices[i]];
        }
        
        // Выбрать первых N игроков как шпионов
        for (let i = 0; i < this.config.spyCount; i++) {
            const playerIndex = playerIndices[i];
            this.state.players[playerIndex].role = 'spy';
            this.state.spyPlayers.push(playerIndex + 1); // +1 потому что id начинается с 1
        }
        
        console.log('Шпионы:', this.state.spyPlayers.map(id => `Игрок ${id}`));
    },

    // Начало фазы передачи телефона
    startHandoffPhase() {
        this.state.currentPlayerIndex = 0;
        this.showNextPlayer();
    },

    // Показать следующего игрока
    showNextPlayer() {
        // Найти следующего живого игрока, который ещё не видел роль
        let nextPlayerIndex = -1;
        
        for (let i = this.state.currentPlayerIndex; i < this.state.players.length; i++) {
            if (this.state.players[i].alive && !this.state.players[i].hasSeenRole) {
                nextPlayerIndex = i;
                break;
            }
        }
        
        // Если не нашли, начать с начала
        if (nextPlayerIndex === -1) {
            for (let i = 0; i < this.state.currentPlayerIndex; i++) {
                if (this.state.players[i].alive && !this.state.players[i].hasSeenRole) {
                    nextPlayerIndex = i;
                    break;
                }
            }
        }
        
        if (nextPlayerIndex === -1) {
            // Все игроки увидели роли
            this.startDiscussion();
            return;
        }
        
        this.state.currentPlayerIndex = nextPlayerIndex;
        const player = this.state.players[nextPlayerIndex];
        
        // Обновить интерфейс
        document.getElementById('currentPlayerNum').textContent = player.id;
        document.getElementById('currentPlayerName').textContent = player.name;
        
        // Показать экран передачи
        this.showScreen('handoff');
    },

    // Пропустить игрока
    skipPlayer() {
        const player = this.state.players[this.state.currentPlayerIndex];
        player.hasSeenRole = true;
        this.addLog(`${player.name} пропущен`);
        this.showNextPlayer();
    },

    // Показать роль
    showRole() {
        const player = this.state.players[this.state.currentPlayerIndex];
        
        // Отметить, что игрок увидел роль
        player.hasSeenRole = true;
        
        // Показать экран роли
        this.showScreen('role');
        
        if (player.role === 'civilian') {
            // Показать мирному игроку локацию
            document.getElementById('civilianView').style.display = 'block';
            document.getElementById('spyView').style.display = 'none';
            
            document.getElementById('locationName').textContent = this.state.currentLocation.name;
            document.getElementById('locationDescription').textContent = this.state.currentLocation.description;
            
            // Показать ключевые слова
            this.renderKeywords();
        } else {
            // Показать шпиону его роль
            document.getElementById('civilianView').style.display = 'none';
            document.getElementById('spyView').style.display = 'block';
            
            // Скрыть ключевые слова для шпиона
            document.getElementById('keywordsSection').style.display = 'none';
        }
        
        // Запустить таймер показа роли
        this.startRoleTimer();
        
        this.addLog(`${player.name} увидел свою роль`);
    },

    // Рендер ключевых слов
    renderKeywords() {
        const container = document.getElementById('keywordsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.currentLocation.keywords.forEach(keyword => {
            const keywordElement = document.createElement('div');
            keywordElement.className = 'keyword';
            keywordElement.textContent = keyword;
            container.appendChild(keywordElement);
        });
        
        document.getElementById('keywordsSection').style.display = 'block';
    },

    // Таймер показа роли
    startRoleTimer() {
        this.stopTimer('role');
        
        let timeLeft = this.config.roleTimer;
        const timerElement = document.getElementById('roleTimer');
        const secondsElement = document.getElementById('timerSeconds');
        
        if (timerElement) timerElement.textContent = timeLeft;
        if (secondsElement) secondsElement.textContent = timeLeft;
        
        this.state.timers.role = setInterval(() => {
            timeLeft--;
            
            if (timerElement) timerElement.textContent = timeLeft;
            if (secondsElement) secondsElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.hideRole();
            }
        }, 1000);
    },

    // Скрыть роль
    hideRole() {
        this.stopTimer('role');
        
        // Проверить, все ли игроки увидели роли
        const allPlayersSeen = this.state.players.every(p => !p.alive || p.hasSeenRole);
        
        if (allPlayersSeen) {
            this.startDiscussion();
        } else {
            this.showNextPlayer();
        }
    },

    // Начало обсуждения
    startDiscussion() {
        this.showScreen('discussion');
        
        // Сбросить флаги просмотра ролей для следующего раунда
        this.state.players.forEach(player => {
            if (player.alive) {
                player.hasSeenRole = false;
            }
        });
        
        // Запустить таймер обсуждения, если включен
        if (this.config.timerEnabled) {
            this.startDiscussionTimer();
        }
        
        // Показать подсказки для обсуждения
        this.renderDiscussionHints();
        
        this.addLog('Началось обсуждение');
    },

    // Таймер обсуждения
    startDiscussionTimer() {
        this.stopTimer('discussion');
        
        let timeLeft = this.config.discussionTime;
        const timerElement = document.getElementById('discussionTimeLeft');
        const progressBar = document.querySelector('.progress-bar');
        
        if (timerElement) timerElement.textContent = timeLeft;
        if (progressBar) {
            const circumference = 2 * Math.PI * 54;
            progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
            progressBar.style.strokeDashoffset = circumference;
        }
        
        this.state.timers.discussion = setInterval(() => {
            timeLeft--;
            
            if (timerElement) timerElement.textContent = timeLeft;
            
            if (progressBar) {
                const circumference = 2 * Math.PI * 54;
                const offset = circumference - (timeLeft / this.config.discussionTime) * circumference;
                progressBar.style.strokeDashoffset = offset;
            }
            
            if (timeLeft <= 0) {
                this.stopTimer('discussion');
                this.startVoting();
            }
        }, 1000);
    },

    // Рендер подсказок для обсуждения
    renderDiscussionHints() {
        const container = document.getElementById('hintQuestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        const questions = SpyData.getRandomQuestions(5);
        
        questions.forEach(question => {
            const questionElement = document.createElement('div');
            questionElement.className = 'hint-question';
            questionElement.textContent = question;
            container.appendChild(questionElement);
        });
    },

    // Пропустить обсуждение
    skipDiscussion() {
        this.stopTimer('discussion');
        this.startVoting();
    },

    // Начало голосования
    startVoting() {
        this.showScreen('voting');
        this.state.votes = {};
        this.state.selectedPlayerForVote = null;
        
        // Сбросить голоса игроков
        this.state.players.forEach(player => {
            player.votes = 0;
            player.voted = false;
        });
        
        // Найти первого живого игрока для голосования
        const firstVoter = this.state.players.find(p => p.alive && !p.voted);
        if (firstVoter) {
            this.setCurrentVoter(firstVoter.id);
        }
        
        // Рендер списка игроков
        this.renderVotingPlayers();
        
        this.addLog('Началось голосование');
    },

    // Установить текущего голосующего
    setCurrentVoter(playerId) {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return;
        
        document.getElementById('currentVoter').textContent = player.name;
        document.getElementById('submitVoteBtn').disabled = true;
        this.state.selectedPlayerForVote = null;
        
        // Обновить состояние кнопок
        this.updateVotingButtons();
    },

    // Рендер игроков для голосования
    renderVotingPlayers() {
        const container = document.getElementById('votingPlayersList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.players.forEach(player => {
            if (!player.alive) return;
            
            const playerElement = document.createElement('div');
            playerElement.className = 'player-vote-option';
            playerElement.dataset.playerId = player.id;
            playerElement.textContent = player.name;
            
            // Игрок не может голосовать за себя
            if (player.id === this.getCurrentVoterId()) {
                playerElement.classList.add('disabled');
                playerElement.title = 'Нельзя голосовать за себя';
            } else {
                playerElement.addEventListener('click', () => {
                    this.selectPlayerForVote(player.id);
                });
            }
            
            container.appendChild(playerElement);
        });
    },

    // Получить ID текущего голосующего
    getCurrentVoterId() {
        const currentVoterName = document.getElementById('currentVoter').textContent;
        const player = this.state.players.find(p => p.name === currentVoterName);
        return player ? player.id : null;
    },

    // Выбрать игрока для голосования
    selectPlayerForVote(playerId) {
        // Снять выделение со всех
        document.querySelectorAll('.player-vote-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Выделить выбранного
        const selectedOption = document.querySelector(`.player-vote-option[data-player-id="${playerId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        this.state.selectedPlayerForVote = playerId;
        document.getElementById('submitVoteBtn').disabled = false;
    },

    // Отправить голос
    submitVote() {
        const voterId = this.getCurrentVoterId();
        const votedPlayerId = this.state.selectedPlayerForVote;
        
        if (!voterId || !votedPlayerId) return;
        
        // Записать голос
        this.state.votes[voterId] = votedPlayerId;
        
        // Увеличить счётчик голосов у выбранного игрока
        const votedPlayer = this.state.players.find(p => p.id === votedPlayerId);
        if (votedPlayer) {
            votedPlayer.votes++;
        }
        
        // Отметить, что игрок проголосовал
        const voter = this.state.players.find(p => p.id === voterId);
        if (voter) {
            voter.voted = true;
        }
        
        this.addLog(`${voter.name} проголосовал за ${votedPlayer.name}`);
        
        // Найти следующего голосующего
        const nextVoter = this.state.players.find(p => p.alive && !p.voted);
        
        if (nextVoter) {
            this.setCurrentVoter(nextVoter.id);
            this.renderVotingPlayers();
        } else {
            // Все проголосовали
            this.showVotingResults();
        }
    },

    // Пропустить голосующего
    skipVoter() {
        const voterId = this.getCurrentVoterId();
        if (!voterId) return;
        
        const voter = this.state.players.find(p => p.id === voterId);
        if (voter) {
            voter.voted = true;
            this.addLog(`${voter.name} пропустил голосование`);
        }
        
        // Найти следующего голосующего
        const nextVoter = this.state.players.find(p => p.alive && !p.voted);
        
        if (nextVoter) {
            this.setCurrentVoter(nextVoter.id);
            this.renderVotingPlayers();
        } else {
            // Все проголосовали
            this.showVotingResults();
        }
    },

    // Показать результаты голосования
    showVotingResults() {
        this.showScreen('results');
        
        // Найти игрока с максимальным количеством голосов
        let maxVotes = 0;
        let eliminatedPlayerId = null;
        
        this.state.players.forEach(player => {
            if (player.alive && player.votes > maxVotes) {
                maxVotes = player.votes;
                eliminatedPlayerId = player.id;
            }
        });
        
        // Если есть ничья, выбрать случайного из лидеров
        if (maxVotes > 0) {
            const leaders = this.state.players.filter(p => p.alive && p.votes === maxVotes);
            if (leaders.length > 1) {
                eliminatedPlayerId = leaders[Math.floor(Math.random() * leaders.length)].id;
            }
        }
        
        // Исключить игрока
        if (eliminatedPlayerId) {
            const eliminatedPlayer = this.state.players.find(p => p.id === eliminatedPlayerId);
            if (eliminatedPlayer) {
                eliminatedPlayer.alive = false;
                this.state.eliminatedPlayers.push(eliminatedPlayerId);
                
                document.getElementById('eliminatedPlayer').textContent = eliminatedPlayer.name;
                document.getElementById('eliminatedSection').style.display = 'block';
                
                // Проверить, был ли это шпион
                const isSpy = eliminatedPlayer.role === 'spy';
                
                let verdict = '';
                if (isSpy) {
                    verdict = `
                        <div class="verdict-card verdict-success">
                            <h3>🎉 Шпион пойман!</h3>
                            <p>${eliminatedPlayer.name} был шпионом!</p>
                            <p>Победа мирных игроков!</p>
                        </div>
                    `;
                } else {
                    verdict = `
                        <div class="verdict-card verdict-failure">
                            <h3>😔 Ошибка!</h3>
                            <p>${eliminatedPlayer.name} был мирным игроком!</p>
                            <p>Шпион остаётся в игре!</p>
                        </div>
                    `;
                }
                
                document.getElementById('verdictCard').innerHTML = verdict;
                document.getElementById('verdictSection').style.display = 'block';
                
                this.addLog(`${eliminatedPlayer.name} исключён (${isSpy ? 'шпион' : 'мирный'})`);
            }
        } else {
            document.getElementById('eliminatedSection').style.display = 'none';
            document.getElementById('verdictCard').innerHTML = `
                <div class="verdict-card">
                    <h3>🤔 Никто не исключён</h3>
                    <p>Голоса разделились поровну</p>
                </div>
            `;
            document.getElementById('verdictSection').style.display = 'block';
            
            this.addLog('Никто не был исключён (ничья)');
        }
        
        // Показать результаты голосования
        this.renderVotesBreakdown();
        
        // Проверить конец игры
        this.checkGameEnd();
    },

    // Рендер результатов голосования
    renderVotesBreakdown() {
        const container = document.getElementById('votesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.players.forEach(player => {
            if (!player.alive) return;
            
            const voteItem = document.createElement('div');
            voteItem.className = 'vote-item';
            voteItem.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="vote-count">${player.votes} голосов</div>
            `;
            container.appendChild(voteItem);
        });
    },

    // Следующий раунд
    nextRound() {
        if (this.config.gameMode === 'classic') {
            this.showFinalResults();
        } else {
            this.state.currentRound++;
            this.startHandoffPhase();
        }
    },

    // Проверка окончания игры
    checkGameEnd() {
        const alivePlayers = this.state.players.filter(p => p.alive);
        const aliveSpies = alivePlayers.filter(p => p.role === 'spy');
        const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian');
        
        // Условия победы
        if (aliveSpies.length === 0) {
            // Все шпионы исключены - победа мирных
            this.endGame('civilians');
        } else if (aliveSpies.length >= aliveCivilians.length) {
            // Шпионов больше или столько же, сколько мирных - победа шпионов
            this.endGame('spies');
        } else if (alivePlayers.length <= 2) {
            // Осталось 2 или меньше игроков - победа шпионов
            this.endGame('spies');
        }
        // Иначе игра продолжается
    },

    // Конец игры
    endGame(winner) {
        this.state.phase = 'final';
        this.showFinalResults(winner);
    },

    // Показать итоговые результаты
    showFinalResults(winner = null) {
        this.showScreen('final');
        
        // Определить победителя, если не передан
        if (!winner) {
            const aliveSpies = this.state.players.filter(p => p.alive && p.role === 'spy');
            const aliveCivilians = this.state.players.filter(p => p.alive && p.role === 'civilian');
            
            if (aliveSpies.length === 0) {
                winner = 'civilians';
            } else if (aliveSpies.length >= aliveCivilians.length) {
                winner = 'spies';
            } else {
                winner = 'civilians'; // По умолчанию
            }
        }
        
        // Обновить интерфейс
        if (winner === 'civilians') {
            document.getElementById('finalTitle').textContent = '🎉 Победа мирных игроков!';
            document.getElementById('winnerSection').innerHTML = `
                <div class="winner-section winner-civilians">
                    <h3 class="winner-title">Победа мирных игроков!</h3>
                    <p class="winner-message">Все шпионы были вычислены и исключены из игры!</p>
                </div>
            `;
        } else {
            document.getElementById('finalTitle').textContent = '🕵️ Победа шпионов!';
            document.getElementById('winnerSection').innerHTML = `
                <div class="winner-section winner-spies">
                    <h3 class="winner-title">Победа шпионов!</h3>
                    <p class="winner-message">Шпионам удалось остаться незамеченными!</p>
                </div>
            `;
        }
        
        // Обновить статистику
        document.getElementById('finalLocation').textContent = this.state.currentLocation.name;
        document.getElementById('finalSpies').textContent = this.config.spyCount;
        document.getElementById('totalRounds').textContent = this.state.currentRound;
        document.getElementById('totalEliminated').textContent = this.state.eliminatedPlayers.length;
        
        // Показать шпионов
        this.renderSpiesList();
        
        this.addLog(`Игра окончена. Победили: ${winner === 'civilians' ? 'мирные игроки' : 'шпионы'}`);
    },

    // Рендер списка шпионов
    renderSpiesList() {
        const container = document.getElementById('spiesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.players.forEach(player => {
            if (player.role === 'spy') {
                const spyCard = document.createElement('div');
                spyCard.className = 'spy-card';
                spyCard.innerHTML = `
                    <div class="spy-icon">
                        <i class="fas fa-user-secret"></i>
                    </div>
                    <div class="spy-name">${player.name}</div>
                    <div class="spy-status">
                        ${player.alive ? '✅ Остался в игре' : '❌ Был исключён'}
                    </div>
                `;
                container.appendChild(spyCard);
            }
        });
    },

    // Сброс игры
    resetGame() {
        this.state = {
            phase: 'setup',
            players: [],
            currentPlayerIndex: 0,
            currentLocation: null,
            currentRound: 1,
            votes: {},
            eliminatedPlayers: [],
            gameLog: [],
            timers: {},
            selectedPlayerForVote: null,
            spyPlayers: []
        };
        
        this.showScreen('setup');
        this.updatePlayerCount(6);
        this.updateSpyCount(1);
        this.addLog('Новая игра начата');
    },

    // Остановка таймера
    stopTimer(timerName) {
        if (this.state.timers[timerName]) {
            clearInterval(this.state.timers[timerName]);
            delete this.state.timers[timerName];
        }
    },

    // Показать экран
    showScreen(screenName) {
        // Скрыть все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показать нужный экран
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        this.state.phase = screenName;
        
        // Обновить боковую панель
        this.updateInfoPanel();
    },

    // Обновить боковую панель
    updateInfoPanel() {
        // Обновить список игроков
        this.renderPlayersOverview();
        
        // Обновить лог игры
        this.updateGameLog();
    },

    // Рендер обзора игроков
    renderPlayersOverview() {
        const container = document.getElementById('playersOverview');
        if (!container) return;
        
        let html = '';
        
        this.state.players.forEach(player => {
            const statusIcon = player.alive ? '🟢' : '🔴';
            const roleIcon = player.role === 'spy' ? '🕵️' : '👤';
            const voteStatus = player.voted ? '✓' : '○';
            
            html += `
                <div class="player-item">
                    <strong>${player.name}</strong>
                    <div>
                        ${statusIcon} ${roleIcon} 
                        ${this.state.phase === 'voting' ? voteStatus : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    // Обновить лог игры
    updateGameLog() {
        const container = document.getElementById('gameLog');
        if (!container) return;
        
        // Показать последние 10 записей
        const recentLogs = this.state.gameLog.slice(-10);
        container.innerHTML = recentLogs.map(entry => 
            `<div class="log-entry">${entry}</div>`
        ).join('');
        
        // Прокрутить вниз
        container.scrollTop = container.scrollHeight;
    },

    // Добавить запись в лог
    addLog(message) {
        const timestamp = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const logEntry = `[${timestamp}] ${message}`;
        this.state.gameLog.push(logEntry);
        this.updateGameLog();
    }
};

// Инициализация игры при загрузке
document.addEventListener('DOMContentLoaded', () => {
    SpyGame.init();
});