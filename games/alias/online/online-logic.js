// Конфигурация твоего проекта Firebase (получаешь в консоли Firebase)
const firebaseConfig = {
    apiKey: "ТВОЙ_КЛЮЧ",
    authDomain: "твой-проект.firebaseapp.com",
    databaseURL: "https://твой-проект.firebaseio.com",
    projectId: "твой-проект",
    storageBucket: "твой-проект.appspot.com",
    messagingSenderId: "123",
    appId: "1:123:web:abc"
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);
// Создаем ссылку на базу данных реального времени
const db = firebase.database();

// Глобальные переменные для текущего игрока и комнаты
let currentRoom = null;
let myName = "";

// --- ФУНКЦИЯ СОЗДАНИЯ ИГРЫ ---
function createGame() {
    myName = document.getElementById('player-name').value; // Получаем имя
    if (!myName) return alert("Введите имя!"); // Проверка на пустоту

    const roomId = Math.floor(1000 + Math.random() * 9000); // Генерируем случайный ID из 4 цифр
    currentRoom = roomId;

    // Записываем данные в облако
    db.ref('rooms/' + roomId).set({
        host: myName,               // Кто создал комнату
        status: 'waiting',          // Статус: ждем игроков
        currentWord: '',            // Какое слово сейчас на экране
        score: 0                    // Общий счет
    });

    // Добавляем себя в список игроков комнаты
    db.ref('rooms/' + roomId + '/players').push(myName);

    showLobby(roomId); // Переходим в интерфейс лобби
    listenToRoom(roomId); // Начинаем "слушать" изменения в облаке
}

// --- ФУНКЦИЯ ВХОДА В ИГРУ ---
function joinGame() {
    myName = document.getElementById('player-name').value; // Твоё имя
    const roomId = document.getElementById('room-id').value; // Куда входим

    if (!myName || !roomId) return alert("Заполни все поля!");

    // Проверяем, существует ли такая комната в базе
    db.ref('rooms/' + roomId).once('value', (snapshot) => {
        if (snapshot.exists()) {
            currentRoom = roomId;
            // Добавляем свое имя в массив игроков этой комнаты
            db.ref('rooms/' + roomId + '/players').push(myName);
            showLobby(roomId);
            listenToRoom(roomId);
        } else {
            alert("Комната не найдена!");
        }
    });
}

// --- ФУНКЦИЯ "ПРОСЛУШКИ" ОБЛАКА ---
function listenToRoom(roomId) {
    // Этот код срабатывает КАЖДЫЙ РАЗ, когда что-то меняется в базе данных
    db.ref('rooms/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // 1. Обновляем список игроков на экране
        const playerList = document.getElementById('player-list');
        playerList.innerHTML = ""; // Очищаем старый список
        
        // Превращаем объект игроков в массив и выводим
        Object.values(data.players).forEach(name => {
            playerList.innerHTML += `<div class="word-row"><span>${name}</span></div>`;
        });

        // 2. Если ты хост (создатель), показываем кнопку "СТАРТ"
        if (data.host === myName) {
            document.getElementById('start-btn').style.display = 'block';
        }

        // 3. Если статус сменился на 'playing', автоматически переключаем экран у ВСЕХ игроков
        if (data.status === 'playing') {
            alert("ИГРА НАЧИНАЕТСЯ!");
            // Тут вызываем функцию перехода к игровому экрану
        }
    });
}

// Переключение видимости экранов
function showLobby(roomId) {
    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('screen-lobby').classList.add('active');
    document.getElementById('display-room-id').innerText = roomId;
}
