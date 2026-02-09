const state = {
    player1: "",
    player2: "",
    syncLevel: 0,
    chargeInterval: null,
    chargeProgress: 0,
    currentTask: null
};

const tasks = [
    { cat: "БЛИЗОСТЬ", text: "{n1}, расскажи {n2}, какое его/ее качество заставляет тебя чувствовать себя в безопасности?" },
    { cat: "ИМПУЛЬС", text: "{n2}, поцелуй {n1} в шею и прошепчи на ухо самое смелое желание." },
    { cat: "ОТКРОВЕНИЕ", text: "{n1}, если бы вы могли прямо сейчас улететь в любую точку мира вдвоем, куда бы вы отправились?" },
    { cat: "СИНТЕЗ", text: "Смотрите друг другу в глаза в течение 30 секунд без единого слова. Почувствуйте пульс друг друга." },
    { cat: "БЛИЗОСТЬ", text: "{n2}, расскажи {n1} о самом приятном сне, в котором он/она присутствовал(а)." },
    { cat: "ИМПУЛЬС", text: "{n1}, сделай {n2} легкий массаж плеч, пока считаешь до 20." }
];

// Переключение экранов
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Инициализация
function initLab() {
    const n1 = document.getElementById('name1').value.trim();
    const n2 = document.getElementById('name2').value.trim();

    if (n1 && n2) {
        state.player1 = n1;
        state.player2 = n2;
        showScreen('screen-lab');
    } else {
        alert("ОШИБКА: Имена операторов не обнаружены.");
    }
}

// Механика зарядки ядра
function startCharging() {
    if (document.getElementById('reaction-card').classList.contains('active')) return;

    const core = document.querySelector('.core-inner');
    const triggerLabel = document.getElementById('trigger-label');
    
    state.chargeInterval = setInterval(() => {
        state.chargeProgress += 2;
        if (state.chargeProgress >= 100) {
            state.chargeProgress = 100;
            triggerTask();
            stopCharging();
        }
        updateChargeUI();
        core.style.opacity = 0.5 + (state.chargeProgress / 100);
        triggerLabel.style.letterSpacing = (state.chargeProgress / 10) + 'px';
    }, 20);
}

function stopCharging() {
    clearInterval(state.chargeInterval);
    if (state.chargeProgress < 100) {
        state.chargeProgress = 0;
        updateChargeUI();
        document.querySelector('.core-inner').style.opacity = 0.5;
        document.getElementById('trigger-label').style.letterSpacing = 'normal';
    }
}

function updateChargeUI() {
    document.getElementById('charge-val').innerText = `${state.chargeProgress}%`;
}

// Генерация задания
function triggerTask() {
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    state.currentTask = task;

    // Подстановка имен (n1 или n2 в случайном порядке для честности)
    const processedText = task.text
        .replace(/{n1}/g, state.player1)
        .replace(/{n2}/g, state.player2);

    document.getElementById('task-text').innerText = processedText;
    document.getElementById('task-category').innerText = task.cat;
    
    document.getElementById('reaction-card').classList.add('active');
    document.getElementById('status-text').innerText = "РЕАКЦИЯ...";
    document.getElementById('status-text').style.color = "var(--accent)";
}

function closeTask() {
    document.getElementById('reaction-card').classList.remove('active');
    document.getElementById('status-text').innerText = "СТАБИЛЬНО";
    document.getElementById('status-text').style.color = "var(--primary)";
    state.chargeProgress = 0;
    updateChargeUI();
}

function completeTask() {
    state.syncLevel += 15;
    if (state.syncLevel > 100) state.syncLevel = 100;
    
    document.getElementById('sync-bar').style.width = `${state.syncLevel}%`;
    
    if (state.syncLevel >= 100) {
        setTimeout(() => {
            showScreen('screen-results');
        }, 500);
    } else {
        closeTask();
    }
}

// Легкая вибрация при нажатии (если поддерживается устройством)
document.addEventListener('touchstart', () => {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
});
