const state = {
    p1: "",
    p2: "",
    score: 0,
    currentCategory: "",
    completedTasks: []
};

const tasks = {
    romance: [
        "{p1}, возьми {p2} за руку и скажи 3 вещи, за которые ты любишь этот момент.",
        "{p2}, организуй медленный танец под воображаемую музыку прямо сейчас.",
        "Сделайте друг другу массаж рук в течение 2 минут.",
        "{p1}, напиши {p2} короткое любовное признание и отправь в мессенджер."
    ],
    fun: [
        "Попробуйте рассмешить друг друга. Кто первым засмеется, тот делает массаж ножек!",
        "Сделайте самое смешное совместное селфи.",
        "{p2}, изобрази {p1} в стиле немого кино.",
        "Придумайте ваше секретное слово, которое будет означать 'хочу обнимашек'."
    ],
    hot: [
        "{p1}, поцелуй {p2} в то место, куда тебя еще никогда не целовали.",
        "Прошепчи на ухо партнеру свою самую смелую фантазию.",
        "Сделайте поцелуй, который продлится ровно 30 секунд.",
        "{p2}, выбери место на теле {p1}, которое ты хочешь поцеловать прямо сейчас."
    ],
    talk: [
        "Если бы вы могли прямо сейчас отправиться в любую точку мира, куда бы вы поехали?",
        "Расскажите о своем самом первом впечатлении друг о друге.",
        "Какое качество в вашем партнере вы считаете самым вдохновляющим?",
        "Опишите ваш идеальный день через 5 лет."
    ]
};

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Запуск игры
function startGame() {
    const name1 = document.getElementById('p1-name').value.trim();
    const name2 = document.getElementById('p2-name').value.trim();

    if (!name1 || !name2) {
        alert("Милые, введите ваши имена! 💕");
        return;
    }

    state.p1 = name1;
    state.p2 = name2;
    document.getElementById('user-display').innerText = name1;
    showScreen('screen-menu');
}

// Выбор категории
function selectCategory(cat) {
    state.currentCategory = cat;
    showScreen('screen-play');
}

// Достать карточку
function drawCard() {
    const jar = document.getElementById('jar');
    jar.classList.add('shake-anim');
    
    setTimeout(() => {
        jar.classList.remove('shake-anim');
        const pool = tasks[state.currentCategory];
        const randomTask = pool[Math.floor(Math.random() * pool.length)];
        
        // Подстановка имен
        const text = randomTask
            .replace(/{p1}/g, `<b>${state.p1}</b>`)
            .replace(/{p2}/g, `<b>${state.p2}</b>`);

        document.getElementById('task-text').innerHTML = text;
        document.getElementById('card-tag').innerText = state.currentCategory.toUpperCase();
        document.getElementById('card-modal').classList.add('active');
    }, 500);
}

function closeModal() {
    document.getElementById('card-modal').classList.remove('active');
}

// Выполнение задания
function completeTask() {
    state.score += 10;
    document.getElementById('total-score').innerText = state.score;
    
    // Добавляем в альбом (иконку по категории)
    const icons = { romance: '💖', fun: '🍭', hot: '🌶️', talk: '☁️' };
    state.completedTasks.push(icons[state.currentCategory]);
    
    closeModal();
    
    // Эффект конфетти (упрощенно - вибрация)
    if (window.navigator.vibrate) window.navigator.vibrate(50);
}

// Показать альбом
function showAlbum() {
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = "";
    
    if (state.completedTasks.length === 0) {
        albumList.innerHTML = "<p style='grid-column: 1/4; text-align:center; opacity:0.5;'>Тут пока пусто. Время наполнять баночку! 💕</p>";
    } else {
        state.completedTasks.forEach(icon => {
            const stamp = document.createElement('div');
            stamp.className = 'stamp';
            stamp.innerText = icon;
            albumList.appendChild(stamp);
        });
    }
    
    showScreen('screen-album');
}

// Создание фоновых частиц
function createParticles() {
    const container = document.getElementById('bg-particles');
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.innerText = "🌸";
        heart.style.position = "absolute";
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.top = Math.random() * 100 + "vh";
        heart.style.opacity = "0.2";
        heart.style.fontSize = Math.random() * 20 + 10 + "px";
        container.appendChild(heart);
    }
}

createParticles();