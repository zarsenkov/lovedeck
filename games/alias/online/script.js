const socket = io("https://lovecouple-server-zarsenkov.amvera.io");
let myRoom = "";
let iAmSwiper = false; // // Может ли этот игрок сейчас свайпать?

// // Вход
function auth(create) {
    const name = document.getElementById('player-name').value;
    const room = create ? Math.floor(1000 + Math.random()*9000).toString() : document.getElementById('join-room-id').value;
    myRoom = room;
    socket.emit('alias-join', { roomId: room, playerName: name });
}

// // Получение слова и роли
socket.on('alias-new-turn', data => {
    toScreen('screen-game'); // // Твоя функция смены экранов
    const wordDisplay = document.getElementById('word-display');
    const btns = document.getElementById('game-controls');
    
    iAmSwiper = (data.swiperId === socket.id);
    btns.classList.toggle('hidden', !iAmSwiper); // // Показываем кнопки только Свайперу

    if (data.activePlayerId === socket.id) {
        wordDisplay.innerText = data.word; // // Объясняющий видит слово
    } else if (iAmSwiper) {
        wordDisplay.innerText = "СЛУШАЙ И ЖМИ!"; // // Свайпер видит инструкцию
    } else {
        wordDisplay.innerText = "ЖДИТЕ...";
    }
});

// // Обработка нажатия/свайпа
function handleAction(isOk) {
    if (!iAmSwiper) return;
    socket.emit('alias-action', { roomId: myRoom, isCorrect: isOk });
}
