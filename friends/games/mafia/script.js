class MafiaGame {
    constructor() {
        this.mode = null; // 'offline' или 'online'
        this.players = [];
        this.roles = [];
        this.currentPlayerIndex = 0;
        this.gameState = 'waiting';
        this.day = 1;
        this.phase = 'day'; // 'day', 'night'
        this.roundHistory = [];
        this.selectedPlayers = new Set();
        this.gameModeConfig = {
            playerCount: 10,
            mafiaCount: 2,
            roles: {
                commissioner: true,
                doctor: true,
                maniac: false,
                informant: false
            }
        };
        
        this.initializeEventListeners();
        this.loadSettings();
    }
    
    initializeEventListeners() {
        // Выбор режима
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => this.selectMode(card));
        });
        
        // Настройки игры
        document.getElementById('playerCount').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('playerCountValue').textContent = value;
            this.gameModeConfig.playerCount = parseInt(value);
            document.getElementById('requiredPlayers').textContent = value;
        });
        
        document.getElementById('mafiaCount').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('mafiaCountValue').textContent = value;
            this.gameModeConfig.mafiaCount = parseInt(value);
        });
        
        // Роли
        document.getElementById('roleCommissioner').addEventListener('change', (e) => {
            this.gameModeConfig.roles.commissioner = e.target.checked;
        });
        
        document.getElementById('roleDoctor').addEventListener('change', (e) => {
            this.gameModeConfig.roles.doctor = e.target.checked;
        });
        
        document.getElementById('roleManiac').addEventListener('change', (e) => {
            this.gameModeConfig.roles.maniac = e.target.checked;
        });
        
        document.getElementById('roleInformant').addEventListener('change', (e) => {
            this.gameModeConfig.roles.informant = e.target.checked;
        });
        
        // Кнопки
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.addPlayer());
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('randomNamesBtn').addEventListener('click', () => this.generateRandomNames());
        document.getElementById('startWithPlayersBtn').addEventListener('click', () => this.startRoleDistribution());
        document.getElementById('showRoleBtn').addEventListener('click', () => this.showCurrentPlayerRole());
        document.getElementById('startGameFromRolesBtn').addEventListener('click', () => this.startActualGame());
        document.getElementById('nextPhaseBtn').addEventListener('click', () => this.nextPhase());
        document.getElementById('endGameBtn').addEventListener('click', () => this.endGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('samePlayersBtn').addEventListener('click', () => this.newGameWithSamePlayers());
        
        // Навигация назад
        document.getElementById('backToModeBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('backToRegistrationBtn').addEventListener('click', () => this.showScreen('registrationScreen'));
        
        // Онлайн режим
        document.getElementById('backToOfflineBtn').addEventListener('click', () => this.backToOfflineMode());
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createOnlineRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.joinOnlineRoom());
    }
    
    selectMode(card) {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.mode = card.dataset.mode;
        
        if (this.mode === 'online') {
            this.showOnlineModal();
        }
    }
    
    showOnlineModal() {
        document.getElementById('onlineModal').classList.add('active');
    }
    
    backToOfflineMode() {
        document.getElementById('onlineModal').classList.remove('active');
        document.querySelector('.mode-card[data-mode="offline"]').click();
    }
    
    createOnlineRoom() {
        alert('Онлайн режим требует серверной части. Для демонстрации переключитесь в оффлайн режим.');
    }
    
    joinOnlineRoom() {
        alert('Онлайн режим требует серверной части. Для демонстрации переключитесь в оффлайн режим.');
    }
    
    startGame() {
        if (!this.mode) {
            alert('Пожалуйста, выберите режим игры');
            return;
        }
        
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
    
    addPlayer() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Введите имя игрока');
            return;
        }
        
        if (this.players.length >= this.gameModeConfig.playerCount) {
            alert(`Максимальное количество игроков: ${this.gameModeConfig.playerCount}`);
            return;
        }
        
        if (this.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            alert('Игрок с таким именем уже существует');
            return;
        }
        
        this.players.push({
            id: Date.now(),
            name: name,
            role: null,
            alive: true,
            checked: false,
            healed: false,
            voted: false
        });
        
        nameInput.value = '';
        this.renderPlayersList();
    }
    
    renderPlayersList() {
        const container = document.getElementById('playersList');
        const startBtn = document.getElementById('startWithPlayersBtn');
        
        container.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <span>${player.name}</span>
                <button class="remove-player" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(playerCard);
        });
        
        // Удаление игроков
        container.querySelectorAll('.remove-player').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.players.splice(index, 1);
                this.renderPlayersList();
            });
        });
        
        // Активация кнопки старта
        startBtn.disabled = this.players.length < this.gameModeConfig.playerCount;
    }
    
    generateRandomNames() {
        const names = [
            'Алексей', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена', 'Сергей', 'Ольга',
            'Андрей', 'Наталья', 'Михаил', 'Татьяна', 'Владимир', 'Юлия', 'Павел', 'Ирина',
            'Артём', 'Светлана', 'Максим', 'Екатерина', 'Николай', 'Алиса', 'Константин', 'Виктория'
        ];
        
        const usedNames = new Set(this.players.map(p => p.name));
        const availableNames = names.filter(name => !usedNames.has(name));
        
        while (this.players.length < this.gameModeConfig.playerCount && availableNames.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableNames.length);
            const name = availableNames[randomIndex];
            
            this.players.push({
                id: Date.now(),
                name: name,
                role: null,
                alive: true,
                checked: false,
                healed: false,
                voted: false
            });
            
            availableNames.splice(randomIndex, 1);
        }
        
        this.renderPlayersList();
    }
    
    startRoleDistribution() {
        if (this.players.length < this.gameModeConfig.playerCount) {
            alert(`Нужно добавить ${this.gameModeConfig.playerCount - this.players.length} игроков`);
            return;
        }
        
        this.assignRoles();
        this.showScreen('rolesScreen');
        this.currentPlayerIndex = 0;
        this.updateRoleDistributionDisplay();
    }
    
    assignRoles() {
        this.roles = [];
        
        // Мафия
        for (let i = 0; i < this.gameModeConfig.mafiaCount; i++) {
            this.roles.push('mafia');
        }
        
        // Комиссар
        if (this.gameModeConfig.roles.commissioner) {
            this.roles.push('commissioner');
        }
        
        // Доктор
        if (this.gameModeConfig.roles.doctor) {
            this.roles.push('doctor');
        }
        
        // Маньяк
        if (this.gameModeConfig.roles.maniac) {
            this.roles.push('maniac');
        }
        
        // Информатор
        if (this.gameModeConfig.roles.informant) {
            this.roles.push('informant');
        }
        
        // Гражданские (остальные)
        const remainingPlayers = this.gameModeConfig.playerCount - this.roles.length;
        for (let i = 0; i < remainingPlayers; i++) {
            this.roles.push('civilian');
        }
        
        // Перемешиваем роли
        this.roles = this.shuffleArray(this.roles);
        
        // Раздаём игрокам
        this.players.forEach((player, index) => {
            player.role = this.roles[index];
            player.originalRole = this.roles[index];
        });
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    updateRoleDistributionDisplay() {
        const viewedList = document.getElementById('viewedPlayersList');
        const startBtn = document.getElementById('startGameFromRolesBtn');
        
        viewedList.innerHTML = '';
        this.players.forEach((player, index) => {
            if (player.checked) {
                const item = document.createElement('div');
                item.className = 'player-item';
                item.textContent = `${player.name} - ${this.getRoleName(player.role)}`;
                viewedList.appendChild(item);
            }
        });
        
        startBtn.disabled = !this.players.every(player => player.checked);
    }
    
    showCurrentPlayerRole() {
        if (this.currentPlayerIndex >= this.players.length) return;
        
        const player = this.players[this.currentPlayerIndex];
        const roleCard = document.querySelector('.role-card');
        const roleName = document.querySelector('.role-name');
        const roleDescription = document.querySelector('.role-description');
        const playerName = document.querySelector('.player-name');
        const roleIcon = document.querySelector('.role-icon');
        
        // Скрываем роль предыдущего игрока
        roleCard.classList.remove('show');
        
        setTimeout(() => {
            // Устанавливаем новую роль
            roleName.textContent = this.getRoleName(player.role);
            roleDescription.textContent = this.getRoleDescription(player.role);
            playerName.textContent = player.name;
            roleIcon.innerHTML = this.getRoleIcon(player.role);
            roleIcon.style.color = this.getRoleColor(player.role);
            
            // Показываем с анимацией
            roleCard.classList.add('show');
            
            // Отмечаем, что игрок посмотрел роль
            player.checked = true;
            this.currentPlayerIndex++;
            
            // Обновляем отображение
            this.updateRoleDistributionDisplay();
            
            // Если все посмотрели, показываем кнопку
            if (this.currentPlayerIndex >= this.players.length) {
                document.getElementById('showRoleBtn').style.display = 'none';
            }
        }, 300);
    }
    
    getRoleName(role) {
        const names = {
            'mafia': 'Мафия',
            'civilian': 'Мирный житель',
            'commissioner': 'Комиссар',
            'doctor': 'Доктор',
            'maniac': 'Маньяк',
            'informant': 'Информатор'
        };
        return names[role] || role;
    }
    
    getRoleDescription(role) {
        const descriptions = {
            'mafia': 'Ночью вы убиваете одного игрока. Днём старайтесь оставаться незамеченными.',
            'civilian': 'Вы мирный житель. Ваша задача - вычислить мафию и проголосовать против них днём.',
            'commissioner': 'Ночью вы можете проверить одного игрока и узнать, является ли он мафией.',
            'doctor': 'Ночью вы можете вылечить одного игрока, защитив его от убийства мафии.',
            'maniac': 'Вы играете за себя. Каждую ночь можете убить одного игрока.',
            'informant': 'Вы знаете одного мирного жителя в начале игры.'
        };
        return descriptions[role] || 'Особая роль';
    }
    
    getRoleIcon(role) {
        const icons = {
            'mafia': '<i class="fas fa-user-ninja"></i>',
            'civilian': '<i class="fas fa-user"></i>',
            'commissioner': '<i class="fas fa-user-shield"></i>',
            'doctor': '<i class="fas fa-user-md"></i>',
            'maniac': '<i class="fas fa-skull"></i>',
            'informant': '<i class="fas fa-user-secret"></i>'
        };
        return icons[role] || '<i class="fas fa-user"></i>';
    }
    
    getRoleColor(role) {
        const colors = {
            'mafia': '#dc2626',
            'civilian': '#16a34a',
            'commissioner': '#2563eb',
            'doctor': '#9333ea',
            'maniac': '#475569',
            'informant': '#ca8a04'
        };
        return colors[role] || '#6b7280';
    }
    
    startActualGame() {
        this.day = 1;
        this.phase = 'day';
        this.gameState = 'playing';
        this.roundHistory = [];
        this.selectedPlayers.clear();
        
        // Сбрасываем временные состояния
        this.players.forEach(player => {
            player.voted = false;
            player.healed = false;
            player.checkedTonight = false;
        });
        
        this.showScreen('gameScreen');
        this.updateGameDisplay();
        this.startTimer(120); // 2 минуты на обсуждение
    }
    
    updateGameDisplay() {
        this.updatePlayersStatus();
        this.updatePhaseInfo();
        this.updateInstructions();
        this.updateActions();
        this.updateHistory();
        this.updateStats();
        this.updateMyRoleInfo();
    }
    
    updatePlayersStatus() {
        const container = document.getElementById('playersStatusList');
        container.innerHTML = '';
        
        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = `player-status ${player.alive ? 'alive' : 'dead'} ${player.checkedTonight ? 'checked' : ''}`;
            playerDiv.dataset.index = index;
            
            let statusIcon = player.alive ? '<i class="fas fa-heart"></i>' : '<i class="fas fa-skull-crossbones"></i>';
            let roleIcon = player.alive ? this.getRoleIcon(player.role) : this.getRoleIcon(player.originalRole);
            
            playerDiv.innerHTML = `
                <div class="player-info">
                    <span class="player-icon">${roleIcon}</span>
                    <span class="player-name">${player.name}</span>
                </div>
                <div class="player-actions">
                    ${player.alive ? `
                        <button class="vote-btn" data-index="${index}" title="Проголосовать">
                            <i class="fas fa-vote-yea"></i>
                        </button>
                    ` : ''}
                    <span class="status-icon">${statusIcon}</span>
                </div>
            `;
            
            container.appendChild(playerDiv);
        });
        
        // Обработчики голосования
        container.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.toggleVote(index);
            });
        });
    }
    
    toggleVote(playerIndex) {
        if (this.phase !== 'day' || !this.players[playerIndex].alive) return;
        
        const playerBtn = document.querySelector(`.vote-btn[data-index="${playerIndex}"]`);
        
        if (this.selectedPlayers.has(playerIndex)) {
            this.selectedPlayers.delete(playerIndex);
            playerBtn.classList.remove('selected');
        } else {
            // В день можно выбрать только одного игрока для голосования
            this.selectedPlayers.clear();
            this.selectedPlayers.add(playerIndex);
            
            // Снимаем выделение со всех кнопок
            document.querySelectorAll('.vote-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            playerBtn.classList.add('selected');
        }
    }
    
    updatePhaseInfo() {
        const phaseElement = document.getElementById('gamePhase');
        const phaseDescElement = document.getElementById('gamePhaseDescription');
        const nextPhaseBtn = document.getElementById('nextPhaseBtn');
        
        if (this.phase === 'day') {
            phaseElement.textContent = `День ${this.day}`;
            phaseDescElement.textContent = 'Обсуждение и голосование';
            nextPhaseBtn.innerHTML = '<i class="fas fa-moon"></i> Перейти к ночи';
        } else {
            phaseElement.textContent = `Ночь ${this.day}`;
            phaseDescElement.textContent = 'Мафия и спецроли действуют';
            nextPhaseBtn.innerHTML = '<i class="fas fa-sun"></i> Перейти к дню';
        }
    }
    
    updateInstructions() {
        const container = document.getElementById('instructionsContent');
        
        if (this.phase === 'day') {
            container.innerHTML = `
                <div class="instruction-step">
                    <h4><i class="fas fa-comments"></i> Обсуждение</h4>
                    <p>Обсуждайте события ночи, выдвигайте подозрения, защищайтесь.</p>
                </div>
                <div class="instruction-step">
                    <h4><i class="fas fa-vote-yea"></i> Голосование</h4>
                    <p>Выберите игрока, которого хотите исключить из игры.</p>
                    <p>Для голосования нажмите на кнопку с иконкой голоса рядом с игроком.</p>
                </div>
                <div class="instruction-step">
                    <h4><i class="fas fa-clock"></i> Время</h4>
                    <p>У вас есть 2 минуты на обсуждение и голосование.</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="instruction-step">
                    <h4><i class="fas fa-moon"></i> Ночь</h4>
                    <p>Все игроки закрывают глаза. Ведущий управляет ночной фазой.</p>
                </div>
                <div class="instruction-step">
                    <h4><i class="fas fa-user-ninja"></i> Мафия</h4>
                    <p>Мафия просыпается и выбирает жертву.</p>
                </div>
                ${this.gameModeConfig.roles.doctor ? `
                <div class="instruction-step">
                    <h4><i class="fas fa-user-md"></i> Доктор</h4>
                    <p>Доктор выбирает игрока для лечения.</p>
                </div>
                ` : ''}
                ${this.gameModeConfig.roles.commissioner ? `
                <div class="instruction-step">
                    <h4><i class="fas fa-user-shield"></i> Комиссар</h4>
                    <p>Комиссар проверяет игрока на принадлежность к мафии.</p>
                </div>
                ` : ''}
                <div class="instruction-step">
                    <h4><i class="fas fa-forward"></i> Следующий шаг</h4>
                    <p>Нажмите "Следующая фаза" для продолжения.</p>
                </div>
            `;
        }
    }
    
    updateActions() {
        const container = document.getElementById('actionsContent');
        container.innerHTML = '';
        
        if (this.phase === 'night') {
            // Создаём действие для каждой активной роли
            const actions = [];
            
            // Мафия
            const mafiaPlayers = this.players.filter(p => p.alive && p.role === 'mafia');
            if (mafiaPlayers.length > 0) {
                actions.push({
                    title: 'Мафия выбирает жертву',
                    description: 'Выберите игрока, которого хотите убить этой ночью',
                    role: 'mafia'
                });
            }
            
            // Доктор
            if (this.gameModeConfig.roles.doctor) {
                const doctor = this.players.find(p => p.alive && p.role === 'doctor');
                if (doctor) {
                    actions.push({
                        title: 'Доктор выбирает пациента',
                        description: 'Выберите игрока, которого хотите вылечить этой ночью',
                        role: 'doctor'
                    });
                }
            }
            
            // Комиссар
            if (this.gameModeConfig.roles.commissioner) {
                const commissioner = this.players.find(p => p.alive && p.role === 'commissioner');
                if (commissioner) {
                    actions.push({
                        title: 'Комиссар проверяет игрока',
                        description: 'Выберите игрока для проверки на мафию',
                        role: 'commissioner'
                    });
                }
            }
            
            // Маньяк
            if (this.gameModeConfig.roles.maniac) {
                const maniac = this.players.find(p => p.alive && p.role === 'maniac');
                if (maniac) {
                    actions.push({
                        title: 'Маньяк выбирает жертву',
                        description: 'Выберите игрока, которого хотите убить этой ночью',
                        role: 'maniac'
                    });
                }
            }
            
            // Отображаем действия
            actions.forEach((action, index) => {
                const actionDiv = document.createElement('div');
                actionDiv.className = 'action-item';
                actionDiv.innerHTML = `
                    <h4>${action.title}</h4>
                    <p>${action.description}</p>
                    <div class="action-targets">
                        ${this.players.filter(p => p.alive).map(player => `
                            <button class="target-btn" data-role="${action.role}" data-target="${player.id}">
                                ${player.name}
                            </button>
                        `).join('')}
                    </div>
                `;
                container.appendChild(actionDiv);
            });
            
            // Обработчики выбора целей
            container.querySelectorAll('.target-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const role = e.currentTarget.dataset.role;
                    const targetId = parseInt(e.currentTarget.dataset.target);
                    
                    // Снимаем выделение с других кнопок той же роли
                    container.querySelectorAll(`.target-btn[data-role="${role}"]`).forEach(b => {
                        b.classList.remove('selected');
                    });
                    
                    // Выделяем выбранную кнопку
                    e.currentTarget.classList.add('selected');
                    
                    // Сохраняем выбор
                    this.handleNightAction(role, targetId);
                });
            });
            
        } else {
            // Дневная фаза - голосование
            if (this.selectedPlayers.size > 0) {
                const selectedIndex = Array.from(this.selectedPlayers)[0];
                const player = this.players[selectedIndex];
                
                container.innerHTML = `
                    <div class="voting-info">
                        <h4><i class="fas fa-vote-yea"></i> Вы выбрали для голосования:</h4>
                        <div class="selected-player">
                            ${this.getRoleIcon(player.role)}
                            <span>${player.name}</span>
                        </div>
                        <button id="confirmVoteBtn" class="btn-primary">
                            <i class="fas fa-check"></i> Подтвердить голосование
                        </button>
                    </div>
                `;
                
                document.getElementById('confirmVoteBtn').addEventListener('click', () => {
                    this.processVoting();
                });
            }
        }
    }
    
    handleNightAction(role, targetId) {
        // В этой упрощённой версии просто сохраняем выбор
        // В полной версии нужно было бы вести учёт всех ночных действий
        const targetPlayer = this.players.find(p => p.id === targetId);
        
        // Добавляем в историю
        this.roundHistory.push({
            phase: 'night',
            role: role,
            action: role === 'doctor' ? 'healed' : 'targeted',
            target: targetPlayer.name,
            targetRole: targetPlayer.role
        });
        
        // Обновляем историю
        this.updateHistory();
    }
    
    processVoting() {
        if (this.selectedPlayers.size === 0) {
            alert('Выберите игрока для голосования');
            return;
        }
        
        const selectedIndex = Array.from(this.selectedPlayers)[0];
        const player = this.players[selectedIndex];
        
        // Помечаем игрока как проголосовавшего (в реальной игре нужно учитывать всех)
        player.voted = true;
        
        // Убиваем выбранного игрока
        player.alive = false;
        
        // Добавляем в историю
        this.roundHistory.push({
            phase: 'day',
            action: 'voted_out',
            target: player.name,
            targetRole: player.role
        });
        
        // Проверяем условие победы
        if (this.checkWinCondition()) {
            this.endGameWithWin();
            return;
        }
        
        // Переходим к следующей ночи
        this.phase = 'night';
        this.day++;
        this.selectedPlayers.clear();
        
        this.updateGameDisplay();
        this.startTimer(90); // 1.5 минуты на ночные действия
    }
    
    nextPhase() {
        if (this.phase === 'day') {
            this.phase = 'night';
            this.day++;
            this.selectedPlayers.clear();
            this.startTimer(90); // 1.5 минуты на ночные действия
        } else {
            this.phase = 'day';
            this.selectedPlayers.clear();
            this.startTimer(120); // 2 минуты на дневное обсуждение
        }
        
        this.updateGameDisplay();
    }
    
    startTimer(seconds) {
        const timerElement = document.getElementById('gameTimer');
        let remaining = seconds;
        
        const updateTimer = () => {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (remaining <= 10) {
                timerElement.classList.add('pulse');
            }
            
            if (remaining <= 0) {
                clearInterval(timerInterval);
                this.nextPhase();
            }
            
            remaining--;
        };
        
        // Очищаем предыдущий таймер
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }
    
    updateHistory() {
        const container = document.getElementById('historyContent');
        
        if (this.roundHistory.length === 0) {
            container.innerHTML = '<p class="empty-history">История раунда пуста</p>';
            return;
        }
        
        container.innerHTML = this.roundHistory.map(event => {
            let icon = 'fa-question';
            let color = 'var(--gray)';
            
            switch (event.action) {
                case 'healed':
                    icon = 'fa-heart';
                    color = 'var(--success)';
                    break;
                case 'targeted':
                    icon = 'fa-crosshairs';
                    color = event.role === 'mafia' ? 'var(--danger)' : 'var(--warning)';
                    break;
                case 'checked':
                    icon = 'fa-search';
                    color = 'var(--secondary)';
                    break;
                case 'voted_out':
                    icon = 'fa-user-slash';
                    color = 'var(--danger)';
                    break;
            }
            
            return `
                <div class="history-event">
                    <div class="history-icon" style="color: ${color}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="history-details">
                        <div class="history-action">${this.getHistoryDescription(event)}</div>
                        <div class="history-time">${event.phase === 'night' ? 'Ночь' : 'День'} ${this.day}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getHistoryDescription(event) {
        switch (event.action) {
            case 'healed':
                return `Доктор вылечил ${event.target}`;
            case 'targeted':
                return `${this.getRoleName(event.role)} выбрал ${event.target}`;
            case 'checked':
                return `Комиссар проверил ${event.target}`;
            case 'voted_out':
                return `${event.target} (${this.getRoleName(event.targetRole)}) исключён`;
            default:
                return event.action;
        }
    }
    
    updateStats() {
        const aliveCount = this.players.filter(p => p.alive).length;
        const mafiaAlive = this.players.filter(p => p.alive && p.role === 'mafia').length;
        const civiliansAlive = aliveCount - mafiaAlive;
        
        document.getElementById('aliveCount').textContent = aliveCount;
        document.getElementById('mafiaAlive').textContent = mafiaAlive;
        document.getElementById('civiliansAlive').textContent = civiliansAlive;
        document.getElementById('currentRound').textContent = this.day;
    }
    
    updateMyRoleInfo() {
        const container = document.getElementById('myRoleInfo');
        
        // В оффлайн режиме показываем все роли (для ведущего)
        if (this.mode === 'offline') {
            container.innerHTML = `
                <div class="all-roles">
                    <h4>Все роли (ведущий)</h4>
                    ${this.players.map(player => `
                        <div class="player-role ${player.alive ? 'alive' : 'dead'}">
                            <span class="role-icon-small">${this.getRoleIcon(player.originalRole)}</span>
                            <span>${player.name}: ${this.getRoleName(player.originalRole)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    checkWinCondition() {
        const alivePlayers = this.players.filter(p => p.alive);
        const mafiaCount = alivePlayers.filter(p => p.role === 'mafia').length;
        const civiliansCount = alivePlayers.length - mafiaCount;
        
        // Мафия побеждает, если их количество равно или больше мирных
        if (mafiaCount >= civiliansCount && mafiaCount > 0) {
            return 'mafia';
        }
        
        // Мирные побеждают, если мафии не осталось
        if (mafiaCount === 0) {
            return 'civilians';
        }
        
        return false;
    }
    
    endGameWithWin() {
        const winner = this.checkWinCondition();
        const winScreen = document.getElementById('winScreen');
        const winIcon = document.getElementById('winIcon');
        const winTitle = document.getElementById('winTitle');
        const winDescription = document.getElementById('winDescription');
        const winnersContainer = document.getElementById('winners');
        const summaryStats = document.getElementById('summaryStats');
        
        if (winner === 'mafia') {
            winIcon.innerHTML = '<i class="fas fa-user-ninja"></i>';
            winIcon.style.color = 'var(--danger)';
            winTitle.textContent = 'Победа мафии!';
            winDescription.textContent = 'Мафия захватила город. Мирные жители проиграли.';
            
            // Победители - мафия
            const mafiaWinners = this.players.filter(p => p.originalRole === 'mafia');
            winnersContainer.innerHTML = mafiaWinners.map(player => `
                <div class="winner-item">
                    ${this.getRoleIcon('mafia')} ${player.name}
                </div>
            `).join('');
        } else {
            winIcon.innerHTML = '<i class="fas fa-user-friends"></i>';
            winIcon.style.color = 'var(--success)';
            winTitle.textContent = 'Победа мирных жителей!';
            winDescription.textContent = 'Мафия обезврежена. Город спасён!';
            
            // Победители - все, кроме мафии
            const civilianWinners = this.players.filter(p => p.originalRole !== 'mafia' && p.alive);
            winnersContainer.innerHTML = civilianWinners.map(player => `
                <div class="winner-item">
                    ${this.getRoleIcon(player.originalRole)} ${player.name}
                </div>
            `).join('');
        }
        
        // Статистика игры
        const aliveCount = this.players.filter(p => p.alive).length;
        const totalPlayers = this.players.length;
        const rounds = this.day;
        
        summaryStats.innerHTML = `
            <p>Всего игроков: ${totalPlayers}</p>
            <p>Выжило: ${aliveCount}</p>
            <p>Раундов сыграно: ${rounds}</p>
            <p>Длительность игры: ${Math.floor(rounds * 2.5)} минут</p>
        `;
        
        this.showScreen('winScreen');
    }
    
    endGame() {
        if (confirm('Завершить игру? Текущий прогресс будет потерян.')) {
            this.newGame();
        }
    }
    
    newGame() {
        this.players = [];
        this.gameState = 'waiting';
        this.showScreen('startScreen');
    }
    
    newGameWithSamePlayers() {
        // Сохраняем имена игроков, но сбрасываем всё остальное
        const playerNames = this.players.map(p => p.name);
        this.newGame();
        
        // Заполняем имена
        playerNames.forEach(name => {
            if (this.players.length < this.gameModeConfig.playerCount) {
                this.players.push({
                    id: Date.now(),
                    name: name,
                    role: null,
                    alive: true,
                    checked: false,
                    healed: false,
                    voted: false
                });
            }
        });
        
        this.renderPlayersList();
        this.showScreen('registrationScreen');
    }
    
    loadSettings() {
        // Загружаем сохранённые настройки из localStorage
        const savedSettings = localStorage.getItem('mafiaSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.gameModeConfig = { ...this.gameModeConfig, ...settings };
            
            // Обновляем UI
            document.getElementById('playerCount').value = this.gameModeConfig.playerCount;
            document.getElementById('playerCountValue').textContent = this.gameModeConfig.playerCount;
            document.getElementById('mafiaCount').value = this.gameModeConfig.mafiaCount;
            document.getElementById('mafiaCountValue').textContent = this.gameModeConfig.mafiaCount;
            document.getElementById('requiredPlayers').textContent = this.gameModeConfig.playerCount;
            
            document.getElementById('roleCommissioner').checked = this.gameModeConfig.roles.commissioner;
            document.getElementById('roleDoctor').checked = this.gameModeConfig.roles.doctor;
            document.getElementById('roleManiac').checked = this.gameModeConfig.roles.maniac;
            document.getElementById('roleInformant').checked = this.gameModeConfig.roles.informant;
        }
    }
    
    saveSettings() {
        localStorage.setItem('mafiaSettings', JSON.stringify(this.gameModeConfig));
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.mafiaGame = new MafiaGame();
});