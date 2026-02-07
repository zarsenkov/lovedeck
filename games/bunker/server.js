const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
});

app.use(express.static(path.join(__dirname, 'public')));

// Хранилище игровых комнат
const rooms = new Map();

// Импорт карточек (в Node.js используем require или имитируем для совместимости)
// Для Railway/Node мы просто опишем функцию генерации колоды внутри
const { GAME_CARDS } = require('./public/cards.js');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Создание комнаты
  socket.on('createRoom', ({ nickname }) => {
    const roomId = Math.floor(10000 + Math.random() * 90000).toString();
    const userData = {
      id: socket.id,
      nickname,
      host: true,
      cards: null,
      isReady: false
    };

    rooms.set(roomId, {
      id: roomId,
      players: [userData],
      gameState: 'lobby', // lobby, reveal, discussion, voting, results
      catastrophe: null,
      bunkerCards: [],
      threats: []
    });

    socket.join(roomId);
    socket.emit('roomCreated', { roomId, players: [userData] });
  });

  // Присоединение к комнате
  socket.on('joinRoom', ({ roomId, nickname }) => {
    const room = rooms.get(roomId);
    if (!room) return socket.emit('error', 'Комната не найдена');
    if (room.players.length >= 16) return socket.emit('error', 'Комната переполнена');
    if (room.gameState !== 'lobby') return socket.emit('error', 'Игра уже началась');

    const userData = {
      id: socket.id,
      nickname,
      host: false,
      cards: null,
      isReady: false
    };

    room.players.push(userData);
    socket.join(roomId);
    io.to(roomId).emit('playerJoined', room.players);
    socket.emit('joinedSuccess', { roomId, players: room.players });
  });

  // Запуск игры
  socket.on('startGame', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || socket.id !== room.players.find(p => p.host).id) return;
    if (room.players.length < 4) return socket.emit('error', 'Нужно минимум 4 игрока');

    // Генерация игровых данных
    room.gameState = 'reveal';
    room.catastrophe = getRandom(GAME_CARDS.catastrophes);
    room.bunkerCards = getRandomItems(GAME_CARDS.bunker, 3);
    room.threats = getRandomItems(GAME_CARDS.threats, 2);

    // Раздача уникальных карт игрокам
    const usedIndices = new Set();
    room.players.forEach(player => {
      player.cards = {
        profession: pullUnique(GAME_CARDS.professions, usedIndices),
        biology: pullUnique(GAME_CARDS.biology, usedIndices),
        health: pullUnique(GAME_CARDS.health, usedIndices),
        hobby: pullUnique(GAME_CARDS.hobbies, usedIndices),
        luggage: pullUnique(GAME_CARDS.luggage, usedIndices),
        fact: pullUnique(GAME_CARDS.facts, usedIndices),
        action: pullUnique(GAME_CARDS.actions, usedIndices)
      };
    });

    io.to(roomId).emit('gameStarted', {
      catastrophe: room.catastrophe,
      bunkerCards: room.bunkerCards,
      threats: room.threats,
      players: room.players
    });
  });

  // Обработка выхода
  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const wasHost = room.players[playerIndex].host;
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          if (wasHost) room.players[0].host = true;
          io.to(roomId).emit('playerLeft', room.players);
        }
      }
    });
  });
});

// Утилиты
function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getRandomItems(arr, count) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

function pullUnique(arr, usedSet) {
  let item;
  let attempts = 0;
  do {
    item = getRandom(arr);
    attempts++;
  } while (usedSet.has(item) && attempts < 100);
  usedSet.add(item);
  return item;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Bunker Server running on port ${PORT}`));
