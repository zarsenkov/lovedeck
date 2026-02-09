const state = {
    p1: "", p2: "",
    score: 0,
    turn: 1, // 1 или 2
    currentCategory: "",
    wishProgress: 0,
    tasksUsed: new Set()
};

const database = {
    romance: [
        "{actor}, возьми {target} за руки и скажи 3 вещи, которые ты ценишь в ваших отношениях.",
        "{actor}, сделай {target} массаж плеч в течение 1 минуты.",
        "{actor}, расскажи о своем самом счастливом сне, где был(а) {target}.",
        "{actor}, напиши {target} СМС с признанием в любви прямо сейчас."
    ],
    fun: [
        "{actor}, изобрази {target}, когда он(а) злится. Если {target} не засмеется, +5 баллов!",
        "Сыграйте в 'гляделки'. Кто первый моргнет, тот выполняет желание партнера.",
        "{actor}, придумай секретное кодовое слово для 'хочу обнимашек' для {target}.",
        "{actor}, сделай 5 приседаний, держа {target} за руки."
    ],
    hot: [
        "{actor}, прошепчи на ухо {target} свою самую смелую фантазию.",
        "{actor}, поцелуй {target} так, как будто вы в финале голливудского фильма.",
        "{actor}, выбери место на теле {target}, которое ты хочешь поцеловать прямо сейчас.",
        "{actor}, опиши 3 вещи, которые тебя больше всего возбуждают в {target}."
    ]
};

// Функция уведомления
function notify(text) {
    const box = document.getElementById('custom-alert');
    document.getElementById('alert-msg').innerText = text;
    box.classList.add('active');
    setTimeout(() => box.classList.remove('active'), 3000);
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    const n1 = document.getElementById('p1-name').value.trim();
    const n2 = document.getElementById('p2-name').value.trim();

    if (!n1 || !n2) {
        notify("Пожалуйста, введите оба имени ✨");
        return;
    }

    state.p1 = n1;
    state.p2 = n2;
    updateLobby();
    showScreen('screen-menu');
}

function updateLobby() {
    const activeName = state.turn === 1 ? state.p1 : state.p2;
    document.getElementById('current-player-name').innerText = activeName;
    document.getElementById('active-user').innerText = activeName;
}

function selectCategory(cat) {
    state.currentCategory = cat;
    showScreen('screen-play');
}

function drawCard() {
    const jar = document.getElementById('jar');
    jar.style.transform = "scale(1.1) rotate(5deg)";
    
    if (window.navigator.vibrate) window.navigator.vibrate(50);

    setTimeout(() => {
        jar.style.transform = "scale(1) rotate(0deg)";
        
        const pool = database[state.currentCategory];
        const task = pool[Math.floor(Math.random() * pool.length)];
        
        const actor = state.turn === 1 ? state.p1 : state.p2;
        const target = state.turn === 1 ? state.p2 : state.p1;

        const processedText = task
            .replace(/{actor}/g, `<b>${actor}</b>`)
            .replace(/{target}/g, `<b>${target}</b>`);

        document.getElementById('task-text').innerHTML = processedText;
        document.getElementById('task-cat').innerText = state.currentCategory.toUpperCase();
        document.getElementById('modal-task').classList.add('active');
    }, 200);
}

function completeTask() {
    state.wishProgress += 10;
    if (state.wishProgress > 100) state.wishProgress = 100;
    
    // Обновляем прогресс
    document.getElementById('wish-fill').style.width = state.wishProgress + "%";
    document.getElementById('wish-percent').innerText = state.wishProgress + "%";

    if (state.wishProgress === 100) {
        notify(`🎉 БУМ! Баночка полна! ${state.turn === 1 ? state.p1 : state.p2} загадывает желание!`);
        state.wishProgress = 0;
    }

    // Смена хода
    state.turn = state.turn === 1 ? 2 : 1;
    
    closeModal();
    updateLobby();
    showScreen('screen-menu');
    notify("Задание выполнено! Ход переходит...");
}

function closeModal() {
    document.getElementById('modal-task').classList.remove('active');
}

function showAlbum() {
    notify("Альбом будет доступен в следующем обновлении! 💖");
}