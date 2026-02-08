// games/whoami/socket.js
const roomsWhoAmI = {};

module.exports = (io, socket) => {
    // Вход в комнату "Кто я"
    socket.on('whoami-join', ({ roomId, playerName }) => {
        const roomKey = `whoami_${roomId}`;
        socket.join(roomKey);

        if (!roomsWhoAmI[roomId]) {
            roomsWhoAmI[roomId] = {
                players: [],
                gameStarted: false,
                timerVal: 90,
                activeIdx: 0,
                gamePool: []
            };
        }

        const room = roomsWhoAmI[roomId];
        const existing = room.players.find(p => p.name === playerName);
        
        if (existing) {
            existing.id = socket.id;
        } else {
            room.players.push({ id: socket.id, name: playerName, score: 0 });
        }

        io.to(roomKey).emit('whoami-update-lobby', { players: room.players });
    });

    // Старт игры
    socket.on('whoami-start', ({ roomId, words, timer }) => {
        const room = roomsWhoAmI[roomId];
        if (room) {
            room.gameStarted = true;
            room.gamePool = words; // Перемешанный массив от хоста
            room.timerVal = timer;
            room.activeIdx = 0;
            sendTurn(io, roomId);
        }
    });

    // Следующее слово / Правильный ответ
    socket.on('whoami-next-word', ({ roomId, isCorrect }) => {
        const room = roomsWhoAmI[roomId];
        if (room && room.gameStarted) {
            if (isCorrect) room.players[room.activeIdx].score++;
            
            room.activeIdx++;
            if (room.activeIdx >= room.players.length) {
                room.activeIdx = 0; // Конец раунда
            }
            sendTurn(io, roomId);
        }
    });
};

function sendTurn(io, roomId) {
    const room = roomsWhoAmI[roomId];
    if (!room || room.gamePool.length === 0) {
        io.to(`whoami_${roomId}`).emit('whoami-over', { players: room.players });
        return;
    }

    const active = room.players[room.activeIdx];
    const word = room.gamePool.pop();

    io.to(`whoami_${roomId}`).emit('whoami-new-turn', {
        activePlayerId: active.id,
        activePlayerName: active.name,
        word: word,
        timer: room.timerVal
    });
}
