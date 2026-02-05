class OnlineMafiaClient {
    constructor() {
        this.socket = null;
        this.roomCode = null;
        this.playerId = null;
        this.isHost = false;
        this.playerName = '';
        
        this.connectToServer();
        this.initializeOnlineUI();
    }
    
    connectToServer() {
        // В реальном приложении здесь должен быть адрес вашего сервера
        const serverUrl = window.location.origin.replace('http', 'ws');
        this.socket = io(serverUrl);
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.playerId = this.socket.id;
        });
        
        this.socket.on('room-created', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = data.isHost;
            this.showOnlineLobby();
        });
        
        this.socket.on('room-joined', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = data.isHost;
            this.updateOnlineLobby(data.roomInfo);
        });
        
        this.socket.on('player-joined', (data) => {
            this.updatePlayersList(data.players);
        });
        
        this.socket.on('player-left', (data) => {
            this.updatePlayersList(data.players);
        });
        
        this.socket.on('game-started', (data) => {
            this.startOnlineGame(data);
        });
        
        this.socket.on('phase-changed', (data) => {
            this.updateOnlineGame(data.roomInfo);
        });
        
        this.socket.on('vote-cast', (data) => {
            this.showVoteNotification(data);
        });
        
        this.socket.on('action-performed', (data) => {
            if (this.isHost) {
                this.showHostNotification(data);
            }
        });
        
        this.socket.on('state-update', (data) => {
            this.updateGameState(data);
        });
        
        this.socket.on('error', (data) => {
            alert(data.message);
        });
        
        this.socket.on('disconnect', () => {
            alert('Отключено от сервера');
            window.location.reload();
        });
    }
    
    initializeOnlineUI() {
        // Здесь будет код для инициализации онлайн интерфейса
        // В этом примере используется оффлайн версия как основа
    }
    
    showOnlineLobby() {
        // Показать лобби онлайн игры
        const lobbyHTML = `
            <div class="online-lobby">
                <h2><i class="fas fa-door-open"></i> Комната: ${this.roomCode}</h2>
                <div class="lobby-info">
                    <p>Поделитесь кодом комнаты с друзьями</p>
                    <div class="room-code">${this.roomCode}</div>
                    <button id="copyRoomCode" class="btn-secondary">
                        <i class="fas fa-copy"></i> Копировать код
                    </button>
                </div>
                
                <div class="players-waiting">
                    <h3>Ожидание игроков...</h3>
                    <div id="onlinePlayersList"></div>
                </div>
                
                ${this.isHost ? `
                    <div class="host-controls">
                        <button id="startOnlineGame" class="btn-primary">
                            <i class="fas fa-play"></i> Начать игру
                        </button>
                    </div>
                ` : ''}
                
                <button id="leaveRoom" class="btn-danger">
                    <i class="fas fa-sign-out-alt"></i> Покинуть комнату
                </button>
            </div>
        `;
        
        // Вставка в основной интерфейс
        document.querySelector('.game-container').innerHTML = lobbyHTML;
        
        // Обработчики событий
        document.getElementById('copyRoomCode')?.addEventListener('click', () => {
            navigator.clipboard.writeText(this.roomCode);
            alert('Код комнаты скопирован');
        });
        
        document.getElementById('startOnlineGame')?.addEventListener('click', () => {
            this.socket.emit('start-game');
        });
        
        document.getElementById('leaveRoom')?.addEventListener('click', () => {
            this.socket.disconnect();
            window.location.reload();
        });
    }
    
    updateOnlineLobby(roomInfo) {
        this.updatePlayersList(roomInfo.players);
        
        if (roomInfo.gameState !== 'waiting') {
            // Если игра уже идёт, запрашиваем текущее состояние
            this.socket.emit('get-state');
        }
    }
    
    updatePlayersList(players) {
        const container = document.getElementById('onlinePlayersList');
        if (!container) return;
        
        container.innerHTML = players.map(player => `
            <div class="online-player ${player.connected ? 'connected' : 'disconnected'}">
                <i class="fas fa-user${player.connected ? '' : '-slash'}"></i>
                <span>${player.name}</span>
                ${player.id === this.playerId ? '<span class="you">(Вы)</span>' : ''}
            </div>
        `).join('');
    }
    
    startOnlineGame(data) {
        // Начало онлайн игры
        const playerRole = data.playerRoles.find(p => p.id === this.playerId);
        
        // Показать роль игрока
        this.showPlayerRole(playerRole);
        
        // Обновить игровой интерфейс
        setTimeout(() => {
            this.updateOnlineGame(data.roomInfo);
        }, 5000); // 5 секунд на просмотр роли
    }
    
    showPlayerRole(playerRole) {
        const roleInfo = this.getRoleInfo(playerRole.role);
        
        const roleHTML = `
            <div class="online-role-reveal">
                <div class="role-card show">
                    <div class="role-icon" style="color: ${roleInfo.color}">
                        <i class="fas ${roleInfo.icon}"></i>
                    </div>
                    <h3 class="role-name">${roleInfo.name}</h3>
                    <p class="role-description">${this.getRoleDescription(playerRole.role)}</p>
                    <div class="player-name">Ваша роль</div>
                </div>
                <p class="instruction">Игра начнётся через несколько секунд...</p>
            </div>
        `;
        
        document.querySelector('.game-container').innerHTML = roleHTML;
    }
    
    updateOnlineGame(roomInfo) {
        // Обновление игрового интерфейса для онлайн режима
        // Эта функция будет похожа на updateGameDisplay() из оффлайн версии,
        // но с учётом онлайн синхронизации
    }
    
    getRoleInfo(role) {
        const roles = {
            mafia: { name: 'Мафия', icon: 'fa-user-ninja', color: '#dc2626' },
            civilian: { name: 'Мирный житель', icon: 'fa-user', color: '#16a34a' },
            commissioner: { name: 'Комиссар', icon: 'fa-user-shield', color: '#2563eb' },
            doctor: { name: 'Доктор', icon: 'fa-user-md', color: '#9333ea' },
            maniac: { name: 'Маньяк', icon: 'fa-skull', color: '#475569' },
            informant: { name: 'Информатор', icon: 'fa-user-secret', color: '#ca8a04' }
        };
        
        return roles[role] || { name: 'Неизвестно', icon: 'fa-question', color: '#6b7280' };
    }
    
    getRoleDescription(role) {
        const descriptions = {
            mafia: 'Ночью вы убиваете одного игрока. Днём старайтесь оставаться незамеченными.',
            civilian: 'Вы мирный житель. Ваша задача - вычислить мафию и проголосовать против них днём.',
            commissioner: 'Ночью вы можете проверить одного игрока и узнать, является ли он мафией.',
            doctor: 'Ночью вы можете вылечить одного игрока, защитив его от убийства мафии.',
            maniac: 'Вы играете за себя. Каждую ночь можете убить одного игрока.',
            informant: 'Вы знаете одного мирного жителя в начале игры.'
        };
        
        return descriptions[role] || 'Особая роль';
    }
    
    showVoteNotification(data) {
        // Показать уведомление о голосовании
        const notification = document.createElement('div');
        notification.className = 'vote-notification';
        notification.innerHTML = `
            <i class="fas fa-vote-yea"></i>
            <span>${data.playerName} проголосовал(а)</span>
        `;
        
        document.querySelector('.game-container').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showHostNotification(data) {
        // Показать уведомление для хоста о ночном действии
        const notification = document.createElement('div');
        notification.className = 'host-notification';
        notification.innerHTML = `
            <i class="fas fa-eye"></i>
            <span>${data.playerName} (${this.getRoleInfo(data.role).name}) выполнил(а) действие</span>
        `;
        
        document.querySelector('.game-container').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    updateGameState(data) {
        // Обновить состояние игры на основе данных с сервера
        // Это основной метод для синхронизации онлайн игры
    }
}

// Инициализация онлайн клиента при выборе онлайн режима
if (window.mafiaGame && window.mafiaGame.mode === 'online') {
    window.onlineClient = new OnlineMafiaClient();
}