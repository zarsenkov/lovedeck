let players = [];
let currentIndex = 0;

// --- НАВИГАЦИЯ ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function goToOnline() {
    if (confirm("Перейти в онлайн режим? Текущая оффлайн игра будет сброшена.")) {
        // Укажи здесь путь к своей онлайн-версии
        window.location.href = "online.html"; 
    }
}

// --- НАСТРОЙКА ИГРОКОВ ---
function addInput() {
    const container = document.getElementById('player-inputs');
    const newId = container.children.length + 1;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'joy-input player-name';
    input.placeholder = `ИГРОК ${newId}`;
    input.value = `ИГРОК ${newId}`;
    container.appendChild(input);
}

function startAssignment() {
    const nameInputs = document.querySelectorAll('.player-name');
    players = Array.from(nameInputs).map((input, index) => ({
        id: index,
        name: input.value.trim() || `ИГРОК ${index + 1}`,
        character: ""
    }));

    if (players.length < 2) return alert("НУЖНО ХОТЯ БЫ 2 ИГРОКА!");

    currentIndex = 0;
    updateAssignScreen();
    showScreen('screen-assign');
}

// --- ЭТАП ЗАГАДЫВАНИЯ (ПЕРЕДАЙ ТЕЛЕФОН) ---
function updateAssignScreen() {
    const actor = players[currentIndex];
    // Цепочка: последний загадывает первому
    const targetIndex = (currentIndex + 1) % players.length;
    const target = players[targetIndex];

    document.getElementById('current-actor-name').innerText = actor.name;
    document.getElementById('target-player-name').innerText = target.name;
    document.getElementById('offline-character-input').value = "";
}

function saveCharacter() {
    const charInput = document.getElementById('offline-character-input');
    const charValue = charInput.value.trim();

    if (!charValue) return alert("ВВЕДИ ПЕРСОНАЖА!");

    // Сохраняем персонажа для цели (того, кто идет следующим в цепочке)
    const targetIndex = (currentIndex + 1) % players.length;
    players[targetIndex].character = charValue;

    currentIndex++;

    if (currentIndex < players.length) {
        alert("ОТЛИЧНО! ТЕПЕРЬ ПЕРЕДАЙ ТЕЛЕФОН СЛЕДУЮЩЕМУ.");
        updateAssignScreen();
    } else {
        alert("ВСЕ ПЕРСОНАЖИ ПРИДУМАНЫ! ПОРА ИГРАТЬ.");
        startOfflineGame();
    }
}

// --- ИГРОВОЙ ЭКРАН ---
function startOfflineGame() {
    const board = document.getElementById('stickers-board');
    board.innerHTML = "";

    players.forEach(p => {
        const card = document.createElement('div');
        card.className = 'sticker-offline';
        card.innerHTML = `
            <div class="sticker-name">${p.name}</div>
            <div class="char-name">${p.character}</div>
            <div class="tap-hint">Нажми, чтобы увидеть</div>
        `;
        
        card.onclick = () => {
            card.classList.toggle('revealed');
            const hint = card.querySelector('.tap-hint');
            hint.innerText = card.classList.contains('revealed') ? "Нажми, чтобы скрыть" : "Нажми, чтобы увидеть";
        };

        board.appendChild(card);
    });

    showScreen('screen-board');
}

function resetGame() {
    if (confirm("Сбросить игру?")) {
        location.reload();
    }
}