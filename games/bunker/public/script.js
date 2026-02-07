const socket = io();

// Глобальное состояние клиента
let gameState = {
  roomId: null,
  nickname: null,
  isHost: false,
  myCards: null,
  players: []
};

// --- ИНИЦИАЛИЗАЦИЯ И НАВИГАЦИЯ ---

window.createRoom = function() {
  const nickname = document.getElementById('input-nickname').value.trim();
  if (!nickname) return alert("Введите позывной");
  gameState.nickname = nickname;
  socket.emit('createRoom', { nickname });
};

window.joinRoom = function() {
  const nickname = document.getElementById('input-nickname').value.trim();
  const roomId = document.getElementById('input-roomid').value.trim();
  if (!nickname || !roomId) return alert("Заполните все поля");
  gameState.nickname = nickname;
  gameState.roomId = roomId;
  socket.emit('joinRoom', { roomId, nickname });
};

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${screenId}`).classList.add('active');
}

// --- ОБРАБОТКА СОБЫТИЙ SOCKET.IO ---

socket.on('roomCreated', ({ roomId, players }) => {
  gameState.roomId = roomId;
  gameState.isHost = true;
  updateLobby(roomId, players);
  showScreen('lobby');
});

socket.on('joinedSuccess', ({ roomId, players }) => {
  gameState.roomId = roomId;
  updateLobby(roomId, players);
  showScreen('lobby');
});

socket.on('playerJoined', (players) => {
  updateLobby(gameState.roomId, players);
  addLog("Система: Новый выживший подключен к шлюзу.");
});

socket.on('playerLeft', (players) => {
  updateLobby(gameState.roomId, players);
  addLog("Внимание: Потеря связи с одним из выживших.");
});

socket.on('gameStarted', (data) => {
  gameState.players = data.players;
  const me = data.players.find(p => p.id === socket.id);
  gameState.myCards = me.cards;
  
  renderGame(data);
  showScreen('game');
});

socket.on('error', (msg) => alert(msg));

// --- ЛОГИКА ИНТЕРФЕЙСА ---

function updateLobby(roomId, players) {
  document.getElementById('display-room-id').innerText = `УБЕЖИЩЕ #${roomId}`;
  const list = document.getElementById('player-list');
  list.innerHTML = players.map(p => `
    <div style="padding: 5px; border-left: 2px solid ${p.host ? 'var(--accent-color)' : 'var(--text-color)'}">
      ${p.host ? '[HOST] ' : ''}${p.nickname} ${p.id === socket.id ? '(ВЫ)' : ''}
    </div>
  `).join('');

  // Только хост видит кнопку старта
  const startBtn = document.getElementById('btn-start-game');
  if (gameState.isHost && players.length >= 4) {
    startBtn.style.display = 'block';
  } else {
    startBtn.style.display = 'none';
  }
}

window.startGame = function() {
  socket.emit('startGame', gameState.roomId);
};

function renderGame(data) {
  // 1. Катастрофа
  document.getElementById('disaster-header').innerHTML = `
    <h2 style="border:none; margin:0;">ВНИМАНИЕ: КАТАСТРОФА</h2>
    <p>${data.catastrophe}</p>
  `;

  // 2. Карточки игрока
  const cardsContainer = document.getElementById('my-cards');
  const cardTypes = [
    { id: 'profession', label: 'Профессия' },
    { id: 'biology', label: 'Биология' },
    { id: 'health', label: 'Здоровье' },
    { id: 'hobby', label: 'Хобби' },
    { id: 'luggage', label: 'Багаж' },
    { id: 'fact', label: 'Факт' },
    { id: 'action', label: 'Спец. условие' }
  ];

  cardsContainer.innerHTML = cardTypes.map(type => `
    <div class="card hidden" id="card-${type.id}" onclick="revealCard('${type.id}')">
      <div class="card-label">${type.label}</div>
      <div class="card-text">ПОЛУЧЕНИЕ ДАННЫХ...</div>
    </div>
  `).join('');

  // 3. Данные бункера
  const bunkerContainer = document.getElementById('bunker-info');
  bunkerContainer.innerHTML = `
    <p><strong>МОДУЛИ:</strong> ${data.bunkerCards.join(' // ')}</p>
    <p style="color:var(--danger-color); margin-top:10px;">
      <strong>УГРОЗЫ:</strong> ${data.threats.join(' | ')}
    </p>
  `;
}

window.revealCard = function(typeId) {
  const card = document.getElementById(`card-${typeId}`);
  if (card.classList.contains('hidden')) {
    card.classList.remove('hidden');
    card.querySelector('.card-text').innerText = gameState.myCards[typeId];
    addLog(`Вы раскрыли свою карту: ${typeId.toUpperCase()}`);
  }
};

// --- ЧАТ И ЛОГИ ---

window.sendMessage = function() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  socket.emit('chatMessage', { roomId: gameState.roomId, text, nickname: gameState.nickname });
  input.value = '';
};

socket.on('newMessage', (data) => {
  addLog(`${data.nickname}: ${data.text}`);
});

function addLog(msg) {
  const chat = document.getElementById('game-chat');
  const entry = document.createElement('div');
  entry.style.marginBottom = '5px';
  entry.innerText = `> ${msg}`;
  chat.appendChild(entry);
  chat.scrollTop = chat.scrollHeight;
}

// --- ГОЛОСОВАНИЕ ---

window.openVoting = function() {
  const modal = document.getElementById('modal-vote');
  const container = document.getElementById('vote-candidates');
  modal.style.display = 'block';

  // В реальности сервер должен присылать список живых, но для базы:
  container.innerHTML = gameState.players
    .filter(p => p.id !== socket.id)
    .map(p => `<button onclick="castVote('${p.id}')" style="width:100%">${p.nickname}</button>`)
    .join('');
};

window.closeVoting = function() {
  document.getElementById('modal-vote').style.display = 'none';
};

window.castVote = function(targetId) {
  addLog("Голос принят. Ожидание завершения протокола.");
  closeVoting();
  // Тут можно добавить socket.emit('castVote', ...)
};
