const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Хранилище игровых комнат
const rooms = new Map();

// Роли игры
const ROLE_DESCRIPTIONS = {
    mafia: { name: 'Мафия', icon: 'fa-user-ninja', color: '#dc2626' },
    civilian: { name: 'Мирный житель', icon: 'fa-user', color: '#16a34a' },
    commissioner: { name: 'Комиссар', icon: 'fa-user-shield', color: '#2563eb' },
    doctor: { name: 'Доктор', icon: 'fa-user-md', color: '#9333ea' },
    maniac: { name: 'Маньяк', icon: 'fa-skull', color: '#475569' },
    informant: { name: 'Информатор', icon: 'fa-user-secret', color: '#ca8a04' }
};

class GameRoom {
    constructor(roomId, hostId, config) {
        this.roomId = roomId;
        this.hostId = hostId;
        this.players = new Map(); // socket.id -> player data
        this.gameState = 'waiting'; // waiting, role_distribution, playing, ended
        this.config = config;
        this.roles = [];
        this.day = 1;
        this.phase = 'day'; // day, night
        this.nightActions = new Map();
        this.votes = new Map();
        this.history = [];
        this.timer = null;
        this.timerEnd = null;
    }
    
    addPlayer(socketId, playerName) {
        if (this.players.size >= this.config.playerCount) {
            return false;
        }
        
        this.players.set(socketId, {
            id: socketId,
            name: playerName,
            role: null,
            alive: true,
            connected: true
        });
        
        return true;
    }
    
    removePlayer(socketId) {
        this.players.delete(socketId);
        
        // Если хост вышел, назначаем нового
        if (socketId === this.hostId && this.players.size > 0) {
            this.hostId = Array.from(this.players.keys())[0];
        }
    }
    
    assignRoles() {
        const roles = [];
        const playerCount = this.players.size;
        
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
        while (roles.length < playerCount) {
            roles.push('civilian');
        }
        
        // Перемешиваем
        this.shuffleArray(roles);
        this.roles = roles;
        
        // Раздаём игрокам
        let i = 0;
        for (const player of this.players.values()) {
            player.role = roles[i];
            player.originalRole = roles[i];
            i++;
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    startGame() {
        this.assignRoles();
        this.gameState = 'role_distribution';
        this.day = 1;
        this.phase = 'day';
        this.history = [];
        this.nightActions.clear();
        this.votes.clear();
        
        // Стартуем таймер для просмотра ролей (30 секунд на игрока)
        this.startTimer(30 * this.players.size);
    }
    
    startTimer(duration) {
        if (this.timer) clearTimeout(this.timer);
        
        this.timerEnd = Date.now() + duration * 1000;
        this.timer = setTimeout(() => {
            this.nextPhase();
        }, duration * 1000);
    }
    
    getTimeRemaining() {
        if (!this.timerEnd) return 0;
        return Math.max(0, Math.floor((this.timerEnd - Date.now()) / 1000));
    }
    
    nextPhase() {
        if (this.gameState === 'role_distribution') {
            this.gameState = 'playing';
            this.phase = 'day';
            this.startTimer(120); // 2 минуты на обсуждение
        } else if (this.gameState === 'playing') {
            if (this.phase === 'day') {
                this.processVotes();
                if (this.checkWinCondition()) {
                    this.endGame();
                    return;
                }
                this.phase = 'night';
                this.nightActions.clear();
                this.startTimer(90); // 1.5 минуты на ночь
            } else {
                this.processNightActions();
                this.phase = 'day';
                this.day++;
                this.votes.clear();
                this.startTimer(120); // 2 минуты на день
            }
        }
    }
    
    processVotes() {
        // Подсчёт голосов
        const voteCounts = new Map();
        for (const [_, targetId] of this.votes) {
            voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
        }
        
        // Находим игрока с максимальным количеством голосов
        let maxVotes = 0;
        let votedOutId = null;
        
        for (const [playerId, count] of voteCounts) {
            if (count > maxVotes) {
                maxVotes = count;
                votedOutId = playerId;
            }
        }
        
        // Если есть игрок для исключения
        if (votedOutId && maxVotes > 0) {
            const player = this.players.get(votedOutId);
            if (player && player.alive) {
                player.alive = false;
                this.history.push({
                    type: 'vote',
                    day: this.day,
                    playerName: player.name,
                    role: player.role
                });
            }
        }
    }
    
    processNightActions() {
        // Обработка ночных действий
        const killedPlayers = new Set();
        const healedPlayers = new Set();
        
        for (const [role, targetId] of this.nightActions) {
            if (role === 'doctor') {
                healedPlayers.add(targetId);
            } else if (role === 'mafia' || role === 'maniac') {
                killedPlayers.add(targetId);
            }
        }
        
        // Убиваем игроков, которых не вылечили
        for (const playerId of killedPlayers) {
            if (!healedPlayers.has(playerId)) {
                const player = this.players.get(playerId);
                if (player && player.alive) {
                    player.alive = false;
                    this.history.push({
                        type: 'kill',
                        day: this.day,
                        playerName: player.name,
                        role: player.role,
                        killedBy: this.nightActions.get('mafia') === playerId ? 'mafia' : 'maniac'
                    });
                }
            }
        }
    }
    
    checkWinCondition() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);
        const mafiaCount = alivePlayers.filter(p => p.role === 'mafia').length;
        const civiliansCount = alivePlayers.length - mafiaCount;
        
        return mafiaCount === 0 || mafiaCount >= civiliansCount;
    }
    
    endGame() {
        this.gameState = 'ended';
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
    
    getRoomInfo() {
        const playersArray = Array.from(this.players.values());
        const alivePlayers = playersArray.filter(p => p.alive);
        const mafiaCount = alivePlayers.filter(p => p.role === 'mafia').length;
        
        return {
            roomId: this.roomId,
            hostId: this.hostId,
            gameState: this.gameState,
            players: playersArray.map(p => ({
                id: p.id,
                name: p.name,
                role: p.role,
                alive: p.alive,
                connected: p.connected
            })),
            day: this.day,
            phase: this.phase,
            timeRemaining: this.getTimeRemaining(),
            stats: {
                total: playersArray.length,
                alive: alivePlayers.length,
                mafia: mafiaCount,
                civilians: alivePlayers.length - mafiaCount
            },
            history: this.history.slice(-10) // Последние 10 событий
        };
    }
    
    getPlayerInfo(playerId) {
        const player = this.players.get(playerId);
        if (!player) return null;
        
        return {
            id: player.id,
            name: player.name,
            role: player.role,
            alive: player.alive,
            isHost: playerId === this.hostId,
            canAct: this.canPlayerAct(playerId)
        };
    }
    
    canPlayerAct(playerId) {
        if (this.gameState !== 'playing') return false;
        
        const player = this.players.get(playerId);
        if (!player || !player.alive) return false;
        
        if (this.phase === 'night') {
            return player.role === 'mafia' || 
                   player.role === 'doctor' || 
                   player.role === 'commissioner' || 
                   player.role === 'maniac';
        }
        
        return true; // В день могут действовать все живые игроки
    }
}

// Генерация случайного кода комнаты
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Исключаем похожие символы
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Socket.io подключения
io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    
    let currentRoom = null;
    
    // Создание комнаты
    socket.on('create-room', (config) => {
        const roomCode = generateRoomCode();
        const room = new GameRoom(roomCode, socket.id, config);
        rooms.set(roomCode, room);
        
        currentRoom = roomCode;
        socket.join(roomCode);
        
        socket.emit('room-created', { roomCode, isHost: true });
        console.log(`Room created: ${roomCode} by ${socket.id}`);
    });
    
    // Подключение к комнате
    socket.on('join-room', ({ roomCode, playerName }) => {
        const room = rooms.get(roomCode);
        
        if (!room) {
            socket.emit('error', { message: 'Комната не найдена' });
            return;
        }
        
        if (room.gameState !== 'waiting') {
            socket.emit('error', { message: 'Игра уже началась' });
            return;
        }
        
        const success = room.addPlayer(socket.id, playerName);
        if (!success) {
            socket.emit('error', { message: 'Комната заполнена' });
            return;
        }
        
        currentRoom = roomCode;
        socket.join(roomCode);
        
        // Уведомляем всех в комнате о новом игроке
        io.to(roomCode).emit('player-joined', {
            playerId: socket.id,
            playerName: playerName,
            players: Array.from(room.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                connected: p.connected
            }))
        });
        
        socket.emit('room-joined', {
            roomCode,
            isHost: socket.id === room.hostId,
            roomInfo: room.getRoomInfo()
        });
    });
    
    // Начало игры
    socket.on('start-game', () => {
        if (!currentRoom) return;
        
        const room = rooms.get(currentRoom);
        if (!room || room.hostId !== socket.id) return;
        
        room.startGame();
        io.to(currentRoom).emit('game-started', {
            roomInfo: room.getRoomInfo(),
            playerRoles: Array.from(room.players.values()).map(p => ({
                id: p.id,
                role: p.role,
                roleName: ROLE_DESCRIPTIONS[p.role]?.name
            }))
        });
    });
    
    // Ночное действие
    socket.on('night-action', ({ targetId, actionType }) => {
        if (!currentRoom) return;
        
        const room = rooms.get(currentRoom);
        if (!room || room.phase !== 'night') return;
        
        const player = room.players.get(socket.id);
        if (!player || !room.canPlayerAct(socket.id)) return;
        
        room.nightActions.set(player.role, targetId);
        
        // Уведомляем хост о действии
        io.to(room.hostId).emit('action-performed', {
            playerName: player.name,
            role: player.role,
            targetId: targetId,
            actionType: actionType
        });
        
        // Проверяем, все ли необходимые действия выполнены
        const playersWhoShouldAct = Array.from(room.players.values())
            .filter(p => room.canPlayerAct(p.id));
        
        if (room.nightActions.size >= playersWhoShouldAct.length) {
            room.nextPhase();
            io.to(currentRoom).emit('phase-changed', {
                roomInfo: room.getRoomInfo()
            });
        }
    });
    
    // Голосование
    socket.on('vote', ({ targetId }) => {
        if (!currentRoom) return;
        
        const room = rooms.get(currentRoom);
        if (!room || room.phase !== 'day') return;
        
        const player = room.players.get(socket.id);
        if (!player || !player.alive) return;
        
        room.votes.set(socket.id, targetId);
        
        io.to(currentRoom).emit('vote-cast', {
            playerId: socket.id,
            playerName: player.name,
            targetId: targetId
        });
        
        // Проверяем, все ли проголосовали
        const alivePlayers = Array.from(room.players.values()).filter(p => p.alive);
        if (room.votes.size >= alivePlayers.length) {
            room.nextPhase();
            io.to(currentRoom).emit('phase-changed', {
                roomInfo: room.getRoomInfo()
            });
        }
    });
    
    // Запрос обновления состояния
    socket.on('get-state', () => {
        if (!currentRoom) return;
        
        const room = rooms.get(currentRoom);
        if (!room) return;
        
        socket.emit('state-update', {
            roomInfo: room.getRoomInfo(),
            playerInfo: room.getPlayerInfo(socket.id)
        });
    });
    
    // Отключение
    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
        
        if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
                room.removePlayer(socket.id);
                
                // Если комната пустая, удаляем её
                if (room.players.size === 0) {
                    rooms.delete(currentRoom);
                    console.log(`Room deleted: ${currentRoom}`);
                } else {
                    // Уведомляем остальных об отключении
                    io.to(currentRoom).emit('player-left', {
                        playerId: socket.id,
                        players: Array.from(room.players.values()).map(p => ({
                            id: p.id,
                            name: p.name,
                            connected: p.connected
                        }))
                    });
                }
            }
        }
    });
});

// API эндпоинты
app.get('/api/rooms/:roomCode', (req, res) => {
    const room = rooms.get(req.params.roomCode);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room.getRoomInfo());
});

app.get('/api/stats', (req, res) => {
    res.json({
        activeRooms: rooms.size,
        totalPlayers: Array.from(rooms.values()).reduce((sum, room) => sum + room.players.size, 0)
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Mafia server running on port ${PORT}`);
});