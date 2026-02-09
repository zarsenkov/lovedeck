let players = [];
let currentIndex = 0;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function addInput() {
    const container = document.getElementById('player-inputs');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'joy-input player-name';
    input.placeholder = `ИГРОК ${container.children.length + 1}`;
    input.value = `ИГРОК ${container.children.length + 1}`;
    container.appendChild(input);
}

function startAssignment() {
    const inputs = document.querySelectorAll('.player-name');
    players = Array.from(inputs).map((inp, i) => ({ id: i, name: inp.value.trim(), character: "" }));
    if (players.length < 2) return alert("Нужно минимум 2 игрока!");
    currentIndex = 0;
    updateAssignScreen();
    showScreen('screen-assign');
}

function updateAssignScreen() {
    const actor = players[currentIndex];
    const target = players[(currentIndex + 1) % players.length];
    document.getElementById('current-actor-name').innerText = actor.name;
    document.getElementById('target-player-name').innerText = target.name;
    document.getElementById('offline-char-input').value = "";
}

function saveCharacter() {
    const val = document.getElementById('offline-char-input').value.trim();
    if (!val) return alert("Введи имя персонажа!");
    players[(currentIndex + 1) % players.length].character = val;
    currentIndex++;
    if (currentIndex < players.length) {
        alert("Принято! Передай телефон следующему игроку.");
        updateAssignScreen();
    } else {
        showBoard();
    }
}

function showBoard() {
    const grid = document.getElementById('stickers-grid');
    grid.innerHTML = "";
    players.forEach(p => {
        const item = document.createElement('div');
        item.className = 'sticker-item';
        item.innerHTML = `<div class="sticker-name">${p.name}</div><div class="sticker-char" style="visibility: hidden">${p.character}</div>`;
        item.onclick = () => {
            const charDiv = item.querySelector('.sticker-char');
            charDiv.style.visibility = (charDiv.style.visibility === 'hidden') ? 'visible' : 'hidden';
            item.classList.toggle('selected');
        };
        grid.appendChild(item);
    });
    showScreen('screen-board');
}
