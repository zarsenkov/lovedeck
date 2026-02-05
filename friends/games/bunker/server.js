// server.js - Серверная логика для игры Бункер

const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const crypto = require('crypto');

// Настройки сервера
const PORT = process.env.PORT || 3000;

// Хранилище данных игры
const rooms = new Map(); // roomCode -> GameRoom
const players = new Map(); // playerId -> Player

// Класс игровой комнаты
class GameRoom {
    constructor(roomCode, hostId) {
        this.code = roomCode;
        this.hostId = hostId;
        this.players = new Set([hostId]);
        this.gameState = {
            phase: 'lobby', // 'lobby', 'night', 'day'
            round: 0,
            timer: null,
            timeLeft: 0,
            votes: new Map(), // playerId -> targetId
            nightActions: new Map(), // playerId -> {action, targetId}
            eventLog: [],
            gameOver: false,
            winners: null
        };
        this.settings = {
            nightDuration: 60,
            dayDuration: 120,
            minPlayers: 3,
            maxPlayers: 8
        };
    }
    
    addPlayer(playerId) {
        this.players.add(playerId);
    }
    
    removePlayer(playerId) {
        this.players.delete(playerId);
        
        // Если хост вышел, назначить нового хоста
        if (playerId === this.hostId && this.players.size > 0) {
            this.hostId = Array.from(this.players)[0];
        }
    }
    
    getPlayerCount() {
        return this.players.size;
    }
    
    isHost(playerId) {
        return playerId === this.hostId;
    }
    
    broadcast(wsServer, message, excludePlayerId = null) {
        const messageStr = JSON.stringify(message);
        
        this.players.forEach(playerId => {
            if (playerId !== excludePlayerId) {
                const player = players.get(playerId);
                if (player && player.ws.readyState === WebSocket.OPEN) {
                    player.ws.send(messageStr);
                }
            }
        });
    }
    
    startGame() {
        if (this.getPlayerCount() < this.settings.minPlayers) {
            return false;
        }
        
        this.gameState.phase = 'night';
        this.gameState.round = 1;
        this.gameState.gameOver = false;
        this.gameState.votes.clear();
        this.gameState.nightActions.clear();
        
        // Раздать роли игрокам
        this.assignRoles();
        
        // Раздать начальные ресурсы
        this.assignInitialResources();
        
        // Запустить таймер ночи
        this.startNightTimer();
        
        // Добавить событие в лог
        this.addEvent('Игра началась! Наступает ночь...');
        
        return true;
    }
    
    assignRoles() {
        const playerIds = Array.from(this.players);
        const playerCount = playerIds.length;
        
        // Определить количество антагонистов в зависимости от числа игроков
        let antagonistCount = 1;
        if (playerCount >= 6) antagonistCount = 2;
        if (playerCount >= 8) antagonistCount = 3;
        
        // Список доступных ролей
        const roles = [
            'survivor', 'survivor', 'survivor', // Базовые выжившие
            'leader', 'doctor', 'psychic', 'scavenger' // Специальные роли выживших
        ];
        
        // Добавить антагонистов
        for (let i = 0; i < antagonistCount; i++) {
            roles.push(i % 2 === 0 ? 'intriguer' : 'traitor');
        }
        
        // Перемешать роли
        const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
        
        // Назначить роли игрокам
        playerIds.forEach((playerId, index) => {
            const player = players.get(playerId);
            if (player) {
                player.role = shuffledRoles[index % shuffledRoles.length] || 'survivor';
                
                // Отправить игроку его роль
                this.sendToPlayer(playerId, {
                    type: 'role_assigned',
                    role: player.role,
                    resources: player.resources
                });
            }
        });
    }
    
    assignInitialResources() {
        this.players.forEach(playerId => {
            const player = players.get(playerId);
            if (player) {
                player.resources = {
                    food: 2,
                    water: 2,
                    medkit: 0,
                    tools: 0
                };
                
                // Дополнительные ресурсы в зависимости от роли
                if (player.role === 'leader') {
                    player.resources.food += 1;
                    player.resources.water += 1;
                    player.resources.tools += 1;
                } else if (player.role === 'scavenger') {
                    player.resources.food += 2;
                    player.resources.water += 2;
                    player.resources.tools += 1;
                }
                
                // Обновить ресурсы у игрока
                this.sendToPlayer(playerId, {
                    type: 'resource_update',
                    resources: player.resources
                });
            }
        });
    }
    
    startNightTimer() {
        this.gameState.timeLeft = this.settings.nightDuration;
        
        // Очистить предыдущий таймер
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        
        // Запустить новый таймер
        this.gameState.timer = setInterval(() => {
            this.gameState.timeLeft--;
            
            // Отправить обновление времени всем игрокам
            this.broadcast(wsServer, {
                type: 'timer_update',
                timeLeft: this.gameState.timeLeft
            });
            
            // Когда время вышло
            if (this.gameState.timeLeft <= 0) {
                clearInterval(this.gameState.timer);
                this.endNight();
            }
        }, 1000);
        
        // Отправить информацию о смене фазы
        this.broadcast(wsServer, {
            type: 'phase_changed',
            phase: 'night',
            duration: this.settings.nightDuration
        });
    }
    
    endNight() {
        // Обработать ночные действия
        this.processNightActions();
        
        // Перейти к дневной фазе
        this.gameState.phase = 'day';
        this.startDayTimer();
        
        // Отправить информацию о смене фазы
        this.broadcast(wsServer, {
            type: 'phase_changed',
            phase: 'day',
            duration: this.settings.dayDuration
        });
        
        this.addEvent('Ночь закончилась. Наступает день.');
    }
    
    processNightActions() {
        // Обработка ночных действий
        this.gameState.nightActions.forEach((action, playerId) => {
            const player = players.get(playerId);
            const targetPlayer = players.get(action.targetId);
            
            if (!player || !targetPlayer) return;
            
            // В зависимости от действия
            switch (action.action) {
                case 'save':
                    // Доктор спасает игрока
                    targetPlayer.saved = true;
                    this.addEvent(`${player.name} (Доктор) спас(ла) ${targetPlayer.name}`);
                    break;
                    
                case 'check':
                    // Псих проверяет роль
                    const isAntagonist = this.isAntagonistRole(targetPlayer.role);
                    this.sendToPlayer(playerId, {
                        type: 'night_action',
                        success: true,
                        message: `${targetPlayer.name} является ${isAntagonist ? 'антагонистом' : 'выжившим'}`
                    });
                    targetPlayer.checked = true;
                    break;
                    
                case 'sabotage':
                    // Интриган саботирует ресурсы
                    const resourceTypes = ['food', 'water', 'medkit', 'tools'];
                    const resourceToSabotage = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
                    
                    if (targetPlayer.resources[resourceToSabotage] > 0) {
                        targetPlayer.resources[resourceToSabotage]--;
                        this.addEvent(`${player.name} (Интриган) саботировал(а) ресурсы ${targetPlayer.name}`);
                        
                        // Отправить обновление ресурсов целевому игроку
                        this.sendToPlayer(action.targetId, {
                            type: 'resource_update',
                            resources: targetPlayer.resources
                        });
                    }
                    break;
            }
        });
        
        // Очистить ночные действия
        this.gameState.nightActions.clear();
    }
    
    startDayTimer() {
        this.gameState.timeLeft = this.settings.dayDuration;
        
        // Очистить предыдущий таймер
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        
        // Запустить новый таймер
        this.gameState.timer = setInterval(() => {
            this.gameState.timeLeft--;
            
            // Отправить обновление времени всем игрокам
            this.broadcast(wsServer, {
                type: 'timer_update',
                timeLeft: this.gameState.timeLeft
            });
            
            // Когда время вышло
            if (this.gameState.timeLeft <= 0) {
                clearInterval(this.gameState.timer);
                this.endDay();
            }
        }, 1000);
        
        // Начать голосование
        this.startVoting();
    }
    
    startVoting() {
        this.gameState.votes.clear();
        
        // Отправить информацию о начале голосования
        this.broadcast(wsServer, {
            type: 'vote_started'
        });
        
        this.addEvent('Началось голосование. Решите, кто покинет бункер.');
    }
    
    processVote(playerId, targetId) {
        // Проверить, может ли игрок голосовать
        const player = players.get(playerId);
        const targetPlayer = players.get(targetId);
        
        if (!player || !targetPlayer || player.status !== 'alive' || targetPlayer.status !== 'alive') {
            return false;
        }
        
        // Записать голос
        this.gameState.votes.set(playerId, targetId);
        
        // Отправить обновление голосов всем игрокам
        const votesObj = {};
        this.gameState.votes.forEach((target, voter) => {
            votesObj[voter] = target;
        });
        
        this.broadcast(wsServer, {
            type: 'vote_updated',
            votes: votesObj
        });
        
        // Обновить информацию об игроке
        player.voteTarget = targetId;
        this.broadcastPlayerUpdate(player);
        
        return true;
    }
    
    endDay() {
        // Подсчитать результаты голосования
        const voteCounts = new Map();
        
        this.gameState.votes.forEach(targetId => {
            voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
        });
        
        // Найти игрока с наибольшим количеством голосов
        let maxVotes = 0;
        let exiledPlayerId = null;
        
        voteCounts.forEach((votes, playerId) => {
            if (votes > maxVotes) {
                maxVotes = votes;
                exiledPlayerId = playerId;
            }
        });
        
        // Если есть ничья, никто не изгоняется
        if (this.isTie(voteCounts, maxVotes)) {
            exiledPlayerId = null;
        }
        
        // Изгнать игрока
        if (exiledPlayerId) {
            const exiledPlayer = players.get(exiledPlayerId);
            if (exiledPlayer) {
                exiledPlayer.status = 'dead';
                this.addEvent(`${exiledPlayer.name} изгнан(а) из бункера!`, 'death');
                
                // Обновить информацию об игроке
                this.broadcastPlayerUpdate(exiledPlayer);
            }
        }
        
        // Отправить результаты голосования
        const results = [];
        voteCounts.forEach((votes, playerId) => {
            results.push({
                playerId,
                votes
            });
        });
        
        this.broadcast(wsServer, {
            type: 'vote_result',
            results,
            exiledPlayer: exiledPlayerId
        });
        
        // Проверить условия победы
        this.checkWinConditions();
        
        // Если игра не закончена, начать новый раунд
        if (!this.gameState.gameOver) {
            // Через 10 секунд начать следующую ночь
            setTimeout(() => {
                this.startNextRound();
            }, 10000);
        }
    }
    
    isTie(voteCounts, maxVotes) {
        let count = 0;
        voteCounts.forEach(votes => {
            if (votes === maxVotes) count++;
        });
        return count > 1;
    }
    
    startNextRound() {
        this.gameState.round++;
        this.gameState.phase = 'night';
        
        // Раздать ресурсы за раунд
        this.distributeRoundResources();
        
        // Сбросить сохраненных игроков
        this.players.forEach(playerId => {
            const player = players.get(playerId);
            if (player) {
                player.saved = false;
            }
        });
        
        // Запустить таймер ночи
        this.startNightTimer();
        
        this.addEvent(`Начинается раунд ${this.gameState.round}. Наступает ночь.`);
    }
    
    distributeRoundResources() {
        this.players.forEach(playerId => {
            const player = players.get(playerId);
            if (player && player.status === 'alive') {
                // Базовая выдача ресурсов
                player.resources.food += 1;
                player.resources.water += 1;
                
                // Бонусы за роли
                if (player.role === 'leader') {
                    player.resources.food += 1;
                    player.resources.water += 1;
                    player.resources.tools += 1;
                } else if (player.role === 'scavenger') {
                    player.resources.food += 2;
                    player.resources.water += 2;
                }
                
                // Отправить обновление ресурсов игроку
                this.sendToPlayer(playerId, {
                    type: 'resource_update',
                    resources: player.resources
                });
            }
        });
    }
    
    checkWinConditions() {
        const alivePlayers = this.getAlivePlayers();
        const antagonists = alivePlayers.filter(p => this.isAntagonistRole(p.role));
        const survivors = alivePlayers.filter(p => !this.isAntagonistRole(p.role));
        
        // Если антагонистов нет, побеждают выжившие
        if (antagonists.length === 0) {
            this.endGame('survivors', 'Выжившие победили! Все антагонисты устранены.');
            return;
        }
        
        // Если антагонистов больше или равно выжившим, побеждают антагонисты
        if (antagonists.length >= survivors.length) {
            this.endGame('antagonists', 'Антагонисты победили! Они захватили контроль над бункером.');
            return;
        }
        
        // Если осталось 2 игрока и один из них антагонист
        if (alivePlayers.length === 2 && antagonists.length === 1) {
            this.endGame('antagonists', 'Антагонист победил! Он остался последним в бункере.');
            return;
        }
    }
    
    getAlivePlayers() {
        const alive = [];
        this.players.forEach(playerId => {
            const player = players.get(playerId);
            if (player && player.status === 'alive') {
                alive.push(player);
            }
        });
        return alive;
    }
    
    isAntagonistRole(role) {
        const antagonistRoles = ['intriguer', 'traitor'];
        return antagonistRoles.includes(role);
    }
    
    endGame(winners, message) {
        this.gameState.gameOver = true;
        this.gameState.winners = winners;
        
        // Очистить таймер
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        
        // Отправить сообщение о конце игры
        this.broadcast(wsServer, {
            type: 'game_over',
            winners,
            message
        });
        
        this.addEvent(message, 'game_over');
    }
    
    handleNightAction(playerId, action, targetId) {
        // Проверить, может ли игрок выполнить действие
        const player = players.get(playerId);
        if (!player || this.gameState.phase !== 'night') {
            return false;
        }
        
        // Записать ночное действие
        this.gameState.nightActions.set(playerId, { action, targetId });
        
        return true;
    }
    
    sendToPlayer(playerId, message) {
        const player = players.get(playerId);
        if (player && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    }
    
    broadcastPlayerUpdate(player) {
        this.broadcast(wsServer, {
            type: 'player_update',
            player: {
                id: player.id,
                name: player.name,
                role: player.role,
                status: player.status,
                resources: player.resources,
                voteTarget: player.voteTarget,
                checked: player.checked
            }
        });
    }
    
    addEvent(text, eventType = 'event') {
        const event = {
            text,
            type: eventType,
            timestamp: new Date().toISOString()
        };
        
        this.gameState.eventLog.unshift(event);
        
        // Отправить событие всем игрокам
        this.broadcast(wsServer, {
            type: 'event',
            event
        });
    }
    
    getPlayerList() {
        const playerList = [];
        this.players.forEach(playerId => {
            const player = players.get(playerId);
            if (player) {
                playerList.push({
                    id: player.id,
                    name: player.name,
                    isHost: this.isHost(playerId),
                    role: this.gameState.phase === 'lobby' ? null : player.role,
                    status: player.status || 'alive',
                    resources: player.resources,
                    voteTarget: player.voteTarget,
                    checked: player.checked
                });
            }
        });
        return playerList;
    }
}

// Класс игрока
class Player {
    constructor(id, name, ws, roomCode) {
        this.id = id;
        this.name = name;
        this.ws = ws;
        this.roomCode = roomCode;
        this.role = null;
        this.status = 'alive';
        this.resources = { food: 0, water: 0, medkit: 0, tools: 0 };
        this.voteTarget = null;
        this.checked = false;
        this.saved = false;
    }
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server for Bunker game is running\n');
});

// Создание WebSocket сервера
const wsServer = new WebSocket.Server({ server });

// Обработка подключений WebSocket
wsServer.on('connection', (ws, req) => {
    const query = url.parse(req.url, true).query;
    const playerName = query.name || 'Игрок';
    const roomCode = (query.room || '').toUpperCase();
    
    if (!roomCode) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Не указан код комнаты'
        }));
        ws.close();
        return;
    }
    
    // Генерация ID игрока
    const playerId = crypto.randomBytes(16).toString('hex');
    
    // Создание или получение комнаты
    let room = rooms.get(roomCode);
    if (!room) {
        room = new GameRoom(roomCode, playerId);
        rooms.set(roomCode, room);
    } else if (room.getPlayerCount() >= room.settings.maxPlayers) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Комната заполнена'
        }));
        ws.close();
        return;
    }
    
    // Создание игрока
    const player = new Player(playerId, playerName, ws, roomCode);
    players.set(playerId, player);
    room.addPlayer(playerId);
    
    // Отправить подтверждение подключения
    ws.send(JSON.stringify({
        type: 'room_joined',
        playerId,
        roomCode,
        isHost: room.isHost(playerId),
        players: room.getPlayerList()
    }));
    
    // Уведомить других игроков о новом подключении
    room.broadcast(wsServer, {
        type: 'player_joined',
        players: room.getPlayerList()
    }, playerId);
    
    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(playerId, room, data);
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
        }
    });
    
    // Обработка отключения клиента
    ws.on('close', () => {
        console.log(`Игрок ${playerName} отключился`);
        
        // Удалить игрока из комнаты
        if (room) {
            room.removePlayer(playerId);
            
            // Если в комнате не осталось игроков, удалить комнату
            if (room.getPlayerCount() === 0) {
                rooms.delete(roomCode);
            } else {
                // Уведомить других игроков об отключении
                room.broadcast(wsServer, {
                    type: 'player_left',
                    players: room.getPlayerList()
                });
            }
        }
        
        // Удалить игрока из хранилища
        players.delete(playerId);
    });
    
    // Обработка ошибок
    ws.on('error', (error) => {
        console.error('WebSocket ошибка:', error);
    });
});

// Обработка сообщений от клиента
function handleClientMessage(playerId, room, data) {
    switch (data.type) {
        case 'start_game':
            if (room.isHost(playerId)) {
                const success = room.startGame();
                if (!success) {
                    room.sendToPlayer(playerId, {
                        type: 'error',
                        message: 'Недостаточно игроков для начала игры'
                    });
                }
            }
            break;
            
        case 'next_round':
            if (room.isHost(playerId) && !room.gameState.gameOver) {
                room.startNextRound();
            }
            break;
            
        case 'new_game':
            if (room.isHost(playerId)) {
                // Сбросить состояние игры
                room.gameState.phase = 'lobby';
                room.gameState.round = 0;
                room.gameState.gameOver = false;
                room.gameState.votes.clear();
                room.gameState.nightActions.clear();
                room.gameState.eventLog = [];
                
                // Сбросить состояние игроков
                room.players.forEach(playerId => {
                    const player = players.get(playerId);
                    if (player) {
                        player.role = null;
                        player.status = 'alive';
                        player.resources = { food: 0, water: 0, medkit: 0, tools: 0 };
                        player.voteTarget = null;
                        player.checked = false;
                        player.saved = false;
                        
                        // Отправить сброс игроку
                        room.sendToPlayer(playerId, {
                            type: 'role_assigned',
                            role: null,
                            resources: player.resources
                        });
                    }
                });
                
                // Уведомить всех игроков
                room.broadcast(wsServer, {
                    type: 'phase_changed',
                    phase: 'lobby'
                });
                
                room.broadcast(wsServer, {
                    type: 'player_update',
                    players: room.getPlayerList()
                });
                
                room.addEvent('Начинается новая игра!');
            }
            break;
            
        case 'night_action':
            const success = room.handleNightAction(playerId, data.action, data.targetId);
            if (success) {
                room.sendToPlayer(playerId, {
                    type: 'night_action',
                    success: true,
                    message: 'Действие успешно выполнено'
                });
            } else {
                room.sendToPlayer(playerId, {
                    type: 'night_action',
                    success: false,
                    message: 'Не удалось выполнить действие'
                });
            }
            break;
            
        case 'vote':
            const voteSuccess = room.processVote(playerId, data.targetId);
            if (!voteSuccess) {
                room.sendToPlayer(playerId, {
                    type: 'error',
                    message: 'Не удалось проголосовать'
                });
            }
            break;
            
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер игры "Бункер" запущен на порту ${PORT}`);
    console.log(`WebSocket сервер доступен по адресу ws://localhost:${PORT}`);
});

// Очистка неактивных комнат (каждый час)
setInterval(() => {
    const now = Date.now();
    let clearedCount = 0;
    
    rooms.forEach((room, roomCode) => {
        // Если в комнате нет игроков и она существует больше часа, удалить её
        if (room.getPlayerCount() === 0) {
            rooms.delete(roomCode);
            clearedCount++;
        }
    });
    
    if (clearedCount > 0) {
        console.log(`Очищено ${clearedCount} неактивных комнат`);
    }
}, 60 * 60 * 1000); // Каждый час