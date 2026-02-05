class MafiaGame {
    constructor() {
        this.mode = 'offline'; // 'offline' или 'online'
        this.players = [];
        this.roles = [];
        this.currentDay = 1;
        this.phase = 'day'; // 'day', 'night'
        this.gameState = 'waiting'; // 'waiting', 'role_distribution', 'playing', 'ended'
        this.timer = null;
        this.timeLeft = 120;
        this.timerRunning = false;
        this.nightActions = {};
        this.votes = {};
        this.nightHistory = [];
        this.gameHistory = [];
        this.config = {
            playerCount: 10,
            mafiaCount: 2,
            roles: {
                commissioner: true,
                doctor: true,
                maniac: false,
                informant: false
            }
        };
        
        this.roleInfo = {
            mafia: {
                name: 'Мафия',
                icon: 'fa-user-ninja',
                color: '#dc2626',
                description: 'Ночью вы убиваете одного игрока. Днём старайтесь оставаться незамеченными.',
                team: 'mafia'
            },
            civilian: {
                name: 'Мирный житель',
                icon: 'fa-user',
                color: '#4ade80',
                description: 'Ваша задача - вычислить мафию и проголосовать против них днём.',
                team: 'civilian'
            },
            commissioner: {
                name: 'Комиссар',
                icon: 'fa-user-shield',
                color: '#2563eb',
                description: 'Ночью вы можете проверить одного игрока и узнать, является ли он мафией.',
                team: 'civilian'
            },
            doctor: {
                name: 'Доктор',
                icon: 'fa-user-md',
                color: '#9333ea',
                description: 'Ночью вы можете вылечить одного игрока, защитив его от убийства.',
                team: 'civilian'
            },
            maniac: {
                name: 'Маньяк',
                icon: 'fa-skull',
                color: '#475569',
                description: 'Вы играете за себя. Каждую ночь можете убить одного игрока.',
                team: 'neutral'
            },
            informant: {
                name: 'Информатор',
                icon: 'fa-user-secret',
                color: '#ca8a04',
                description: 'Вы знаете одного мирного жителя в начале игры.',
                team: 'civilian'
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSettings();
    }
    
    bindEvents() {
        // Выбор режима
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.selectMode(mode);
            });
        });
        
        // Настройки
        document.getElementById('playerCount').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.config.playerCount = value;
            document.getElementById('playerCountValue').textContent = value;
            document.getElementById('maxPlayerCount').textContent = value;
            this.updateMafiaMax();
        });
        
        document.getElementById('mafiaCount').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.config.mafiaCount = value;
            document.getElementById('mafiaCountValue').textContent = value;
        });
        
        // Роли
        ['commissioner', 'doctor', 'maniac', 'informant'].forEach(role => {
            document.getElementById(`role${role.charAt(0).toUpperCase() + role.slice(1)}`)
                .addEventListener('change', (e) => {
                    this.config.roles[role] = e.target.checked;
                });
        });
        
        // Кнопки
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGameFlow());
        
        // Регистрация игроков
        document.getElementById('playerNameInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        
        // Динамические кнопки будут привязаны позже
    }
    
    updateMafiaMax() {
        const maxMafia = Math.floor(this.config.playerCount / 3);
        const mafiaSlider = document.getElementById('mafiaCount');
        mafiaSlider.max = maxMafia;
        if (this.config.mafiaCount > maxMafia) {
            this.config.mafiaCount = maxMafia;
            mafiaSlider.value = maxMafia;
            document.getElementById('mafiaCountValue').textContent = maxMafia;
        }
    }
    
    selectMode(mode) {
        this.mode = mode;
        
        // Обновляем UI выбора режима
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`.${mode}-mode`).classList.add('selected');
        
        if (mode === 'online') {
            this.showOnlineModal();
        }
    }
    
    showOnlineModal() {
        document.getElementById('onlineModal').classList.add('active');
    }
    
    closeOnlineModal() {
        document.getElementById('onlineModal').classList.remove('active');
        this.selectMode('offline');
    }
    
    startGameFlow() {
        if (this.mode === 'offline') {
            this.showScreen('registrationScreen');
            this.renderPlayersList();
        } else {
            this.showOnlineModal();
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    // Регистрация игроков
    addPlayer() {
        const input = document.getElementById('playerNameInput');
        const name = input.value.trim();
        
        if (!name) {
            alert('Введите имя игрока');
            return;
        }
        
        if (this.players.length >= this.config.playerCount) {
            alert(`Максимум ${this.config.playerCount} игроков`);
            return;
        }
        
        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Игрок с таким именем уже есть');
            return;
        }
        
        this.players.push({
            id: Date.now() + Math.random(),
            name: name,
            role: null,
            alive: true,
            checkedTonight: false,
            healedTonight: false,
            votes: 0,
            killedBy: null
        });
        
        input.value = '';
        this.renderPlayersList();
    }
    
    renderPlayersList() {
        const container = document.getElementById('playersList');
        const countElement = document.getElementById('currentPlayerCount');
        const startBtn = document.getElementById('startRolesBtn');
        
        container.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <div class="player-item-content">
                    <div class="player-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                    </div>
                    <button class="btn btn-icon btn-danger" onclick="game.removePlayer(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(playerElement);
        });
        
        countElement.textContent = this.players.length;
        startBtn.disabled = this.players.length < 6 || this.players.length > this.config.playerCount;
    }
    
    removePlayer(index) {
        this.players.splice(index, 1);
        this.renderPlayersList();
    }
    
    generateRandomNames() {
        const names = [
            'Алексей', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена', 'Сергей', 'Ольга',
            'Андрей', 'Наталья', 'Михаил', 'Татьяна', 'Владимир', 'Юлия', 'Павел', 'Ирина',
            'Артём', 'Светлана', 'Максим', 'Екатерина', 'Николай', 'Алиса', 'Константин', 'Виктория'
        ];
        
        const usedNames = new Set(this.players.map(p => p.name));
        const availableNames = names.filter(name => !usedNames.has(name));
        
        while (this.players.length < this.config.playerCount && availableNames.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableNames.length);
            const name = availableNames[randomIndex];
            
            this.players.push({
                id: Date.now() + Math.random(),
                name: name,
                role: null,
                alive: true,
                checkedTonight: false,
                healedTonight: false,
                votes: 0,
                killedBy: null
            });
            
            availableNames.splice(randomIndex, 1);
        }
        
        this.renderPlayersList();
    }
    
    backToRegistration() {
        this.showScreen('registrationScreen');
    }
    
    // Раздача ролей
    distributeRoles() {
        if (this.players.length < 6) {
            alert('Нужно минимум 6 игроков');
            return;
        }
        
        // Генерируем роли
        const roles = [];
        
        // Мафия
        for (let i = 0; i < this.config.mafiaCount; i++) {
            roles.push('mafia');
        }
        
        // Специальные роли
        if (this.config.roles.commissioner) roles.push('commissioner');
        if (this.config.roles.doctor) roles.push('doctor');
        if (this.config.roles.maniac) roles.push('maniac');
        if (this.config.roles.informant) roles.push('informant');
        
        // Гражданские
        const civilianCount = this.players.length - roles.length;
        for (let i = 0; i < civilianCount; i++) {
            roles.push('civilian');
        }
        
        // Перемешиваем
        this.shuffleArray(roles);
        
        // Раздаём
        this.players.forEach((player, index) => {
            player.role = roles[index];
            player.originalRole = roles[index];
        });
        
        // Начинаем раздачу
        this.currentPlayerIndex = 0;
        this.showScreen('rolesScreen');
        this.updateRoleDistribution();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    updateRoleDistribution() {
        const progressElement = document.getElementById('rolesProgress');
        const playerNameElement = document.getElementById('currentPlayerName');
        const distributedList = document.getElementById('distributedList');
        const startGameBtn = document.getElementById('startGameBtn2');
        
        if (this.currentPlayerIndex < this.players.length) {
            const player = this.players[this.currentPlayerIndex];
            playerNameElement.textContent = player.name;
            progressElement.textContent = `${this.currentPlayerIndex}/${this.players.length}`;
            
            // Обновляем список распределённых
            distributedList.innerHTML = this.players
                .slice(0, this.currentPlayerIndex)
                .map(p => `
                    <div class="distributed-item">
                        <span class="player-name">${p.name}</span>
                        <span class="player-role">${this.roleInfo[p.role].name}</span>
                    </div>
                `).join('');
            
            startGameBtn.style.display = 'none';
        } else {
            // Все роли распределены
            playerNameElement.textContent = 'Все роли распределены!';
            startGameBtn.style.display = 'block';
            startGameBtn.onclick = () => this.startGame();
        }
    }
    
    revealRole() {
        if (this.currentPlayerIndex >= this.players.length) return;
        
        const player = this.players[this.currentPlayerIndex];
        const role = this.roleInfo[player.role];
        
        // Показываем роль
        document.getElementById('roleIcon').innerHTML = `<i class="fas ${role.icon}"></i>`;
        document.getElementById('roleIcon').style.color = role.color;
        document.getElementById('roleTitle').textContent = role.name;
        document.getElementById('roleDescription').textContent = role.description;
        
        document.getElementById('revealRoleBtn').style.display = 'none';
        document.getElementById('roleDisplay').style.display = 'block';
    }
    
    hideRole() {
        // Скрываем роль и переходим к следующему игроку
        document.getElementById('revealRoleBtn').style.display = 'block';
        document.getElementById('roleDisplay').style.display = 'none';
        
        this.currentPlayerIndex++;
        this.updateRoleDistribution();
    }
    
    // Игровой процесс
    startGame() {
        this.currentDay = 1;
        this.phase = 'day';
        this.gameState = 'playing';
        this.nightActions = {};
        this.votes = {};
        this.nightHistory = [];
        this.gameHistory = [];
        
        // Сбрасываем состояния
        this.players.forEach(player => {
            player.checkedTonight = false;
            player.healedTonight = false;
            player.votes = 0;
            player.killedBy = null;
        });
        
        this.showScreen('gameScreen');
        this.updateGameDisplay();
        this.startTimer(120);
    }
    
    updateGameDisplay() {
        this.updatePlayersStatus();
        this.updatePhaseInfo();
        this.updateInstructions();
        this.updateHostInfo();
        this.updateStats();
        
        if (this.phase === 'night') {
            this.updateNightActions();
            document.getElementById('nightActionsPanel').style.display = 'block';
            document.getElementById('dayActionsPanel').style.display = 'none';
        } else {
            document.getElementById('nightActionsPanel').style.display = 'none';
            document.getElementById('dayActionsPanel').style.display = 'block';
            this.updateVotingInfo();
        }
    }
    
    updatePlayersStatus() {
        const container = document.getElementById('playersStatusList');
        container.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const role = this.roleInfo[player.role];
            const playerElement = document.createElement('div');
            playerElement.className = `status-player ${player.alive ? 'alive' : 'dead'}`;
            playerElement.dataset.index = index;
            
            // Добавляем иконки состояний
            const statusIcons = [];
            if (player.checkedTonight) statusIcons.push('<i class="fas fa-search checked-icon" title="Проверен комиссаром"></i>');
            if (player.healedTonight) statusIcons.push('<i class="fas fa-heart heart-icon" title="Вылечен доктором"></i>');
            if (player.votes > 0) statusIcons.push(`<span class="vote-count" title="Голоса: ${player.votes}">${player.votes}</span>`);
            
            playerElement.innerHTML = `
                <div class="player-status-content">
                    <div class="player-status-main">
                        <div class="player-avatar-small" style="color: ${role.color}">
                            <i class="fas ${role.icon}"></i>
                        </div>
                        <div class="player-status-info">
                            <span class="player-status-name">${player.name}</span>
                            <span class="player-status-role">${player.alive ? role.name : 'Выбыл'}</span>
                        </div>
                    </div>
                    <div class="player-status-extra">
                        ${statusIcons.join('')}
                        ${player.alive ? `
                            <button class="btn btn-icon btn-vote" onclick="game.addVote(${index})" title="Добавить голос">
                                <i class="fas fa-vote-yea"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            container.appendChild(playerElement);
        });
    }
    
    updatePhaseInfo() {
        const phaseTitle = document.getElementById('phaseTitle');
        const phaseSubtitle = document.getElementById('phaseSubtitle');
        const nextPhaseBtn = document.getElementById('nextPhaseBtn');
        
        if (this.phase === 'day') {
            phaseTitle.textContent = `День ${this.currentDay}`;
            phaseSubtitle.textContent = 'Обсуждение и голосование';
            nextPhaseBtn.innerHTML = '<i class="fas fa-moon"></i><span>Ночь наступила</span>';
        } else {
            phaseTitle.textContent = `Ночь ${this.currentDay}`;
            phaseSubtitle.textContent = 'Мафия и спецроли действуют';
            nextPhaseBtn.innerHTML = '<i class="fas fa-sun"></i><span>Наступило утро</span>';
        }
    }
    
    updateInstructions() {
        const instructions = document.getElementById('gameInstructions');
        
        if (this.phase === 'day') {
            instructions.innerHTML = `
                <div class="instruction-step">
                    <h4><i class="fas fa-comments"></i> Обсуждение</h4>
                    <p>Дайте игрокам время на обсуждение. Ведите дискуссию.</p>
                </div>
                <div class="instruction-step">
                    <h4><i class="fas fa-vote-yea"></i> Голосование</h4>
                    <p>После обсуждения начните голосование. Каждый игрок голосует за одного игрока.</p>
                    <p>Вы (ведущий) подсчитываете голоса и исключаете игрока с наибольшим количеством голосов.</p>
                </div>
                <div class="instruction-step">
                    <h4><i class="fas fa-clock"></i> Таймер</h4>
                    <p>Управляйте временем обсуждения с помощью таймера.</p>
                </div>
            `;
        } else {
            instructions.innerHTML = `
                <div class="instruction-step">
                    <h4><i class="fas fa-moon"></i> Ночная фаза</h4>
                    <p>Все игроки закрывают глаза. Управляйте ночными действиями по порядку:</p>
                </div>
                <div class="instruction-step">
                    <h4>1. Мафия просыпается</h4>
                    <p>Мафия выбирает жертву. Нажмите "Мафия выбирает" и выберите игрока.</p>
                </div>
                ${this.config.roles.doctor ? `
                <div class="instruction-step">
                    <h4>2. Доктор просыпается</h4>
                    <p>Доктор выбирает игрока для лечения. Нажмите "Доктор лечит".</p>
                </div>
                ` : ''}
                ${this.config.roles.commissioner ? `
                <div class="instruction-step">
                    <h4>3. Комиссар просыпается</h4>
                    <p>Комиссар проверяет игрока. Нажмите "Комиссар проверяет".</p>
                </div>
                ` : ''}
            `;
        }
    }
    
    updateNightActions() {
        const container = document.getElementById('nightActions');
        const alivePlayers = this.players.filter(p => p.alive);
        
        let actionsHTML = '';
        
        // Мафия всегда есть
        const mafiaPlayers = alivePlayers.filter(p => p.role === 'mafia');
        if (mafiaPlayers.length > 0) {
            actionsHTML += this.createNightActionButton('mafia', 'Мафия выбирает жертву');
        }
        
        // Доктор
        if (this.config.roles.doctor) {
            const doctor = alivePlayers.find(p => p.role === 'doctor');
            if (doctor) {
                actionsHTML += this.createNightActionButton('doctor', 'Доктор лечит');
            }
        }
        
        // Комиссар
        if (this.config.roles.commissioner) {
            const commissioner = alivePlayers.find(p => p.role === 'commissioner');
            if (commissioner) {
                actionsHTML += this.createNightActionButton('commissioner', 'Комиссар проверяет');
            }
        }
        
        // Маньяк
        if (this.config.roles.maniac) {
            const maniac = alivePlayers.find(p => p.role === 'maniac');
            if (maniac) {
                actionsHTML += this.createNightActionButton('maniac', 'Маньяк убивает');
            }
        }
        
        container.innerHTML = actionsHTML || '<p class="no-actions">Нет активных ролей для ночных действий</p>';
        
        // Привязываем обработчики
        container.querySelectorAll('.night-action-btn').forEach(btn => {
            const role = btn.dataset.role;
            btn.addEventListener('click', () => this.showPlayerSelection(role));
        });
    }
    
    createNightActionButton(role, text) {
        const completed = this.nightActions[role];
        return `
            <button class="night-action-btn ${completed ? 'completed' : ''}" 
                    data-role="${role}"
                    ${completed ? 'disabled' : ''}>
                <i class="fas ${completed ? 'fa-check-circle' : 'fa-moon'}"></i>
                <span>${text}</span>
                ${completed ? '<span class="completed-check"><i class="fas fa-check"></i></span>' : ''}
            </button>
        `;
    }
    
    showPlayerSelection(role) {
        const alivePlayers = this.players.filter(p => p.alive);
        
        // Создаем модальное окно выбора игрока
        const modal = document.createElement('div');
        modal.className = 'selection-modal';
        modal.innerHTML = `
            <div class="selection-content">
                <h3>${this.roleInfo[role].name} выбирает игрока</h3>
                <p>Выберите игрока для действия:</p>
                <div class="selection-grid">
                    ${alivePlayers.map(player => `
                        <button class="player-select-btn" data-player-id="${player.id}">
                            <div class="player-avatar-small" style="color: ${this.roleInfo[player.role].color}">
                                <i class="fas ${this.roleInfo[player.role].icon}"></i>
                            </div>
                            <span>${player.name}</span>
                        </button>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" onclick="this.closest('.selection-modal').remove()">
                    Отмена
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Привязываем обработчики выбора
        modal.querySelectorAll('.player-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.currentTarget.dataset.playerId);
                this.processNightAction(role, playerId);
                modal.remove();
            });
        });
    }
    
    processNightAction(role, playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        // Сохраняем действие
        this.nightActions[role] = playerId;
        
        // Записываем в историю
        let actionText = '';
        let icon = '';
        
        switch(role) {
            case 'mafia':
                actionText = `Мафия выбрала ${player.name}`;
                icon = 'fa-user-ninja';
                break;
            case 'doctor':
                actionText = `Доктор вылечил ${player.name}`;
                icon = 'fa-heart';
                player.healedTonight = true;
                break;
            case 'commissioner':
                actionText = `Комиссар проверил ${player.name} (${player.role === 'mafia' ? 'Мафия' : 'Мирный'})`;
                icon = 'fa-search';
                player.checkedTonight = true;
                break;
            case 'maniac':
                actionText = `Маньяк выбрал ${player.name}`;
                icon = 'fa-skull';
                break;
        }
        
        this.addToNightHistory(actionText, icon);
        
        // Обновляем UI
        this.updateNightActions();
        this.updatePlayersStatus();
    }
    
    addToNightHistory(text, icon) {
        const history = document.getElementById('nightHistory');
        const empty = history.querySelector('.empty-history');
        if (empty) empty.style.display = 'none';
        
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        entry.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${text}</span>
        `;
        
        history.insertBefore(entry, history.firstChild);
        
        // Сохраняем в массив
        this.nightHistory.push({ text, icon, time: new Date() });
    }
    
    updateVotingInfo() {
        const voteCount = Object.values(this.votes).length;
        document.getElementById('voteCount').textContent = voteCount;
        
        // Подсчитываем голоса для каждого игрока
        this.players.forEach(player => {
            player.votes = 0;
        });
        
        Object.values(this.votes).forEach(playerId => {
            const player = this.players.find(p => p.id === playerId);
            if (player) player.votes++;
        });
        
        // Проверяем, можно ли исключить игрока
        const alivePlayers = this.players.filter(p => p.alive);
        const processBtn = document.getElementById('processVoteBtn');
        
        if (voteCount >= alivePlayers.length) {
            processBtn.disabled = false;
        } else {
            processBtn.disabled = true;
        }
        
        this.updatePlayersStatus();
    }
    
    addVote(playerIndex) {
        if (this.phase !== 'day') return;
        
        const player = this.players[playerIndex];
        if (!player.alive) return;
        
        // В реальной игре здесь был бы учёт голосов от разных игроков
        // В этом упрощённом варианте ведущий сам добавляет голоса
        const voterId = `host_${Date.now()}`;
        this.votes[voterId] = player.id;
        
        this.updateVotingInfo();
    }
    
    processVoting() {
        // Находим игрока с максимальным количеством голосов
        let maxVotes = 0;
        let votedOutPlayer = null;
        
        this.players.forEach(player => {
            if (player.votes > maxVotes && player.alive) {
                maxVotes = player.votes;
                votedOutPlayer = player;
            }
        });
        
        if (!votedOutPlayer || maxVotes === 0) {
            alert('Нет игрока для исключения');
            return;
        }
        
        // Исключаем игрока
        votedOutPlayer.alive = false;
        votedOutPlayer.killedBy = 'vote';
        
        // Добавляем в историю игры
        this.gameHistory.push({
            day: this.currentDay,
            action: 'vote',
            player: votedOutPlayer.name,
            role: votedOutPlayer.role,
            votes: maxVotes
        });
        
        // Проверяем победу
        if (this.checkWinCondition()) {
            this.endGame();
            return;
        }
        
        // Сбрасываем голоса и переходим к ночи
        this.votes = {};
        this.phase = 'night';
        this.currentDay++;
        this.nightActions = {};
        this.nightHistory = [];
        
        // Сбрасываем ночные состояния
        this.players.forEach(player => {
            player.checkedTonight = false;
            player.healedTonight = false;
        });
        
        this.updateGameDisplay();
        this.startTimer(90);
    }
    
    nextPhase() {
        if (this.phase === 'day') {
            // Проверяем ночные действия
            if (Object.keys(this.nightActions).length === 0) {
                alert('Сначала выполните ночные действия!');
                return;
            }
            
            // Обрабатываем ночные действия
            this.processNightResults();
            this.phase = 'day';
            this.currentDay++;
            
            this.startTimer(120);
        } else {
            // Переход от дня к ночи
            this.phase = 'night';
            this.nightActions = {};
            this.nightHistory = [];
            
            // Сбрасываем ночные состояния
            this.players.forEach(player => {
                player.checkedTonight = false;
                player.healedTonight = false;
            });
            
            this.startTimer(90);
        }
        
        this.updateGameDisplay();
    }
    
    processNightResults() {
        // Определяем, кого убили
        const mafiaTargetId = this.nightActions['mafia'];
        const maniacTargetId = this.nightActions['maniac'];
        const doctorTargetId = this.nightActions['doctor'];
        
        // Обрабатываем убийство мафии
        if (mafiaTargetId) {
            const target = this.players.find(p => p.id === mafiaTargetId);
            if (target && target.alive) {
                // Проверяем, вылечил ли доктор
                if (doctorTargetId === mafiaTargetId) {
                    this.addToNightHistory(`Доктор спас ${target.name} от мафии`, 'fa-heart');
                } else {
                    target.alive = false;
                    target.killedBy = 'mafia';
                    this.gameHistory.push({
                        day: this.currentDay,
                        action: 'mafia_kill',
                        player: target.name,
                        role: target.role
                    });
                    this.addToNightHistory(`Мафия убила ${target.name}`, 'fa-user-ninja');
                }
            }
        }
        
        // Обрабатываем убийство маньяка
        if (maniacTargetId && maniacTargetId !== mafiaTargetId) {
            const target = this.players.find(p => p.id === maniacTargetId);
            if (target && target.alive) {
                // Маньяка не лечит доктор (по правилам)
                target.alive = false;
                target.killedBy = 'maniac';
                this.gameHistory.push({
                    day: this.currentDay,
                    action: 'maniac_kill',
                    player: target.name,
                    role: target.role
                });
                this.addToNightHistory(`Маньяк убил ${target.name}`, 'fa-skull');
            }
        }
        
        // Проверяем победу
        if (this.checkWinCondition()) {
            this.endGame();
        }
    }
    
    checkWinCondition() {
        const alivePlayers = this.players.filter(p => p.alive);
        const mafiaCount = alivePlayers.filter(p => p.role === 'mafia').length;
        const civiliansCount = alivePlayers.filter(p => 
            p.role !== 'mafia' && p.role !== 'maniac'
        ).length;
        
        // Мафия побеждает, если их больше или равно мирным
        if (mafiaCount >= civiliansCount && mafiaCount > 0) {
            return 'mafia';
        }
        
        // Мирные побеждают, если мафии не осталось
        if (mafiaCount === 0) {
            return 'civilians';
        }
        
        return false;
    }
    
    updateHostInfo() {
        const container = document.getElementById('hostRolesList');
        container.innerHTML = this.players.map(player => {
            const role = this.roleInfo[player.role];
            return `
                <div class="host-role-item ${player.alive ? '' : 'dead'}">
                    <div class="role-icon-small" style="color: ${role.color}">
                        <i class="fas ${role.icon}"></i>
                    </div>
                    <div class="host-role-info">
                        <span class="host-player-name">${player.name}</span>
                        <span class="host-player-role">${role.name}</span>
                    </div>
                    <div class="host-player-status">
                        ${player.alive ? 
                            '<span class="status-alive"><i class="fas fa-heart"></i></span>' : 
                            '<span class="status-dead"><i class="fas fa-skull"></i></span>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateStats() {
        const alivePlayers = this.players.filter(p => p.alive);
        const mafiaCount = alivePlayers.filter(p => p.role === 'mafia').length;
        const civiliansCount = alivePlayers.filter(p => 
            p.role !== 'mafia' && p.role !== 'maniac'
        ).length;
        
        document.getElementById('aliveCount').textContent = alivePlayers.length;
        document.getElementById('mafiaCountLive').textContent = mafiaCount;
        document.getElementById('currentDay').textContent = this.currentDay;
        document.getElementById('alivePlayers').textContent = alivePlayers.length;
        document.getElementById('mafiaAlive').textContent = mafiaCount;
        document.getElementById('civiliansAlive').textContent = civiliansCount;
    }
    
    // Таймер
    startTimer(seconds) {
        this.stopTimer();
        this.timeLeft = seconds;
        this.timerRunning = true;
        
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            if (!this.timerRunning) return;
            
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.nextPhase();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    toggleTimer() {
        this.timerRunning = !this.timerRunning;
        const icon = document.getElementById('timerIcon');
        icon.className = this.timerRunning ? 'fas fa-pause' : 'fas fa-play';
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('gameTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Меняем цвет при малом времени
        const timerElement = document.getElementById('gameTimer');
        timerElement.classList.toggle('warning', this.timeLeft <= 30);
        timerElement.classList.toggle('danger', this.timeLeft <= 10);
    }
    
    // Завершение игры
    endGame() {
        this.stopTimer();
        this.gameState = 'ended';
        
        const winner = this.checkWinCondition();
        this.showResults(winner);
    }
    
    showResults(winner) {
        this.showScreen('resultsScreen');
        
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultDescription = document.getElementById('resultDescription');
        const winnersList = document.getElementById('winnersList');
        
        if (winner === 'mafia') {
            resultIcon.innerHTML = '<i class="fas fa-user-ninja"></i>';
            resultIcon.style.color = '#dc2626';
            resultTitle.textContent = 'Победа мафии!';
            resultDescription.textContent = 'Мафия захватила город';
            
            const mafiaWinners = this.players.filter(p => p.role === 'mafia');
            winnersList.innerHTML = mafiaWinners.map(player => `
                <div class="winner-item">
                    <div class="winner-avatar" style="color: #dc2626">
                        <i class="fas fa-user-ninja"></i>
                    </div>
                    <div class="winner-info">
                        <span class="winner-name">${player.name}</span>
                        <span class="winner-role">Мафия</span>
                    </div>
                </div>
            `).join('');
        } else {
            resultIcon.innerHTML = '<i class="fas fa-user-friends"></i>';
            resultIcon.style.color = '#4ade80';
            resultTitle.textContent = 'Победа мирных!';
            resultDescription.textContent = 'Мафия обезврежена';
            
            const civilianWinners = this.players.filter(p => 
                p.role !== 'mafia' && p.alive
            );
            winnersList.innerHTML = civilianWinners.map(player => {
                const role = this.roleInfo[player.role];
                return `
                    <div class="winner-item">
                        <div class="winner-avatar" style="color: ${role.color}">
                            <i class="fas ${role.icon}"></i>
                        </div>
                        <div class="winner-info">
                            <span class="winner-name">${player.name}</span>
                            <span class="winner-role">${role.name}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Статистика
        const aliveCount = this.players.filter(p => p.alive).length;
        document.getElementById('survivedCount').textContent = aliveCount;
        document.getElementById('totalRounds').textContent = this.currentDay;
        document.getElementById('gameDuration').textContent = 
            `${Math.floor(this.currentDay * 3)} минут`;
    }
    
    newGame() {
        this.players = [];
        this.gameState = 'waiting';
        this.showScreen('startScreen');
    }
    
    restartWithSamePlayers() {
        const playerNames = this.players.map(p => p.name);
        this.newGame();
        
        // Заполняем имена
        playerNames.forEach(name => {
            if (this.players.length < this.config.playerCount) {
                this.players.push({
                    id: Date.now() + Math.random(),
                    name: name,
                    role: null,
                    alive: true,
                    checkedTonight: false,
                    healedTonight: false,
                    votes: 0,
                    killedBy: null
                });
            }
        });
        
        this.showScreen('registrationScreen');
        this.renderPlayersList();
    }
    
    loadSettings() {
        // Можно добавить сохранение настроек в localStorage
    }
    
    // Для онлайн режима
    startLocalServer() {
        alert('Для запуска локального сервера:\n1. Установите Node.js\n2. В папке проекта запустите: node server.js\n3. Откройте http://localhost:3000');
    }
    
    deployToRailway() {
        alert('Инструкция по деплою на Railway:\n1. Создайте аккаунт на railway.app\n2. Установите Railway CLI\n3. В папке проекта выполните: railway up\n4. Сервер автоматически развернётся');
    }
}

// Создаем глобальный экземпляр игры
const game = new MafiaGame();

// Делаем доступным глобально для обработчиков onclick
window.game = game;
