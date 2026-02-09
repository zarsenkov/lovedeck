const state = {
    p1: localStorage.getItem('ls_p1') || "",
    p2: localStorage.getItem('ls_p2') || "",
    currentStory: null,
    stepIndex: 0,
    honestyScore: 0,
    totalSteps: 0,
    diary: JSON.parse(localStorage.getItem('ls_diary')) || []
};

const stories = {
    spark: [
        { type: 'npc', text: "Добро пожаловать в начало вашего пути. Сегодня мы вернемся в тот момент, когда между вами проскочила первая искра..." },
        { type: 'task', player: 1, text: "{name1}, вспомни и расскажи: какое первое впечатление произвел на тебя {name2}?", memory: true },
        { type: 'task', player: 2, text: "А теперь ты, {name2}. Опиши тремя словами свои чувства во время вашего первого долгого разговора.", memory: true },
        { type: 'npc', text: "Интересно... Но давайте углубимся. Было ли что-то, что вы скрыли друг от друга при знакомстве?" },
        { type: 'task', player: 1, text: "{name1}, признайся в одной маленькой хитрости, которую ты совершил(а), чтобы понравиться {name2}." },
        { type: 'task', player: 2, text: "{name2}, а ты? Был ли момент, когда ты сомневался(лась) в ваших отношениях в самом начале?" },
        { type: 'npc', text: "Честность — это фундамент. Давайте проверим вашу тактильную связь." },
        { type: 'action', text: "Закройте глаза. {name1} должен(на) нежно коснуться лица {name2} так, как будто это самый дорогой фарфор в мире." },
        { type: 'task', player: 1, text: "Вопрос с подвохом: {name1}, если бы вам пришлось пережить этот день знакомства снова, что бы ты изменил(а)?" }
        // Базу можно расширять до 50+ шагов
    ],
    midnight: [
        { type: 'npc', text: "Луна взошла, а значит время для откровений, которые обычно шепчут под одеялом..." },
        { type: 'task', player: 1, text: "{name1}, какое прикосновение {name2} заставляет твое сердце биться чаще всего?" },
        { type: 'task', player: 2, text: "{name2}, если бы вы оказались вдвоем на необитаемом острове, какую ОДНУ вещь для удовольствия ты бы взял(а)?" },
        { type: 'action', text: "{name1}, поцелуй {name2} в то место, которое он(а) выберет прямо сейчас. Но сделай это максимально медленно." },
        { type: 'npc', text: "Температура растет. Готовы ли вы обсудить свои самые смелые фантазии?" },
        { type: 'task', player: 1, text: "{name1}, опиши свою самую горячую фантазию, связанную с {name2}, о которой ты еще не рассказывал(а)." }
    ]
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toLobby() {
    if(!state.p1 || !state.p2) return showScreen('screen-setup');
    document.getElementById('total-progress').innerText = Math.floor(Math.random() * 20) + 10;
    showScreen('screen-lobby');
}

function startGame() {
    state.p1 = document.getElementById('name1').value.trim();
    state.p2 = document.getElementById('name2').value.trim();
    if(!state.p1 || !state.p2) return alert("Введите имена!");
    
    localStorage.setItem('ls_p1', state.p1);
    localStorage.setItem('ls_p2', state.p2);
    toLobby();
}

function startStory(key) {
    state.currentStory = key;
    state.stepIndex = 0;
    state.honestyScore = 0;
    state.totalSteps = stories[key].length;
    showScreen('screen-quest');
    nextStep();
}

function nextStep() {
    const story = stories[state.currentStory];
    if(state.stepIndex >= story.length) return finishStory();

    const data = story[state.stepIndex];
    const npcText = document.getElementById('npc-text');
    const actionArea = document.getElementById('game-action-area');
    const honestyModal = document.getElementById('honesty-check');
    
    honestyModal.classList.add('hidden');
    actionArea.innerHTML = "";

    // Обработка текста имен
    const renderText = (str) => str.replace(/{name1}/g, `<b>${state.p1}</b>`).replace(/{name2}/g, `<b>${state.p2}</b>`);

    if(data.type === 'npc') {
        npcText.innerText = data.text;
        const btn = document.createElement('button');
        btn.className = "btn-clay primary";
        btn.innerText = "ДАЛЕЕ";
        btn.onclick = () => { state.stepIndex++; nextStep(); };
        actionArea.appendChild(btn);
    } 
    else if(data.type === 'task' || data.type === 'action') {
        const card = document.createElement('div');
        card.className = "task-card clay-box";
        card.innerHTML = `<p>${renderText(data.text)}</p>`;
        actionArea.appendChild(card);

        const btn = document.createElement('button');
        btn.className = "btn-clay primary";
        btn.style.marginTop = "20px";
        btn.innerText = "СДЕЛАНО / ОТВЕТИЛ(А)";
        btn.onclick = () => {
            if(data.type === 'task') {
                honestyModal.classList.remove('hidden');
                if(data.memory) saveToDiary(renderText(data.text));
            } else {
                state.stepIndex++;
                nextStep();
            }
        };
        actionArea.appendChild(btn);
    }

    // Прогресс бар
    document.getElementById('quest-bar').style.width = `${(state.stepIndex / state.totalSteps) * 100}%`;
}

function rateHonesty(val) {
    if(val) state.honestyScore++;
    state.stepIndex++;
    nextStep();
}

function finishStory() {
    const finalPercent = Math.round((state.honestyScore / (state.totalSteps / 2)) * 100);
    document.getElementById('honesty-result').innerText = finalPercent + "%";
    showScreen('screen-results');
}

function saveToDiary(text) {
    state.diary.push({ date: new Date().toLocaleDateString(), text: text });
    localStorage.setItem('ls_diary', JSON.stringify(state.diary));
}

function showAlbum() {
    const cont = document.getElementById('album-content');
    cont.innerHTML = state.diary.map(d => `
        <div class="memory-item clay-box">
            <small>${d.date}</small>
            <p>${d.text}</p>
        </div>
    `).reverse().join('');
    if(state.diary.length === 0) cont.innerHTML = "<p style='text-align:center; opacity:0.5;'>Ваш дневник пока пуст...</p>";
    showScreen('screen-album');
}

// При загрузке проверяем имена
window.onload = () => {
    if(state.p1 && state.p2) toLobby();
};