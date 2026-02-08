// Функция отображения финальных результатов с эффектом печати
function showFinalResults() {
    switchScreen('results-screen');
    const winnersList = document.getElementById('winners-list');
    winnersList.innerHTML = '<h3 style="margin-bottom:15px">ЛИЦА, ДОПУЩЕННЫЕ В ОБЪЕКТ:</h3>';
    
    // Выводим список тех, кто выжил
    GameState.players.filter(p => !p.isExcluded).forEach(p => {
        const div = document.createElement('div');
        div.style.marginBottom = "10px";
        div.innerHTML = `• ${p.name.toUpperCase()} <br> <small>(${p.data.profession})</small>`;
        winnersList.appendChild(div);
    });

    // Анимация удара печатью
    const stamp = document.getElementById('final-stamp');
    stamp.textContent = "ДОПУЩЕНЫ";
    stamp.classList.add('visible'); // Включает CSS-анимацию появления
    
    // Добавляем звук удара (если бы был файл), пока просто лог
    console.log("STAMP: APPROVED");
}

// Функция для отрисовки карточек (обновлена под стиль "Анкета")
function showRole() {
    const player = GameState.players[GameState.currentPlayerIndex];
    document.getElementById('player-id').textContent = `00${player.id}-AF`;
    const grid = document.getElementById('player-role-data');
    grid.innerHTML = '';

    const labels = {
        profession: "1. РОД ДЕЯТЕЛЬНОСТИ:", 
        health: "2. МЕДИЦИНСКИЕ ПОКАЗАТЕЛИ:", 
        hobbies: "3. ПРИКЛАДНЫЕ НАВЫКИ:",
        inventory: "4. ЛИЧНОЕ ИМУЩЕСТВО:", 
        traits: "5. ПСИХОТИП:", 
        secrets: "6. ОСОБЫЕ ОТМЕТКИ:"
    };

    for (let key in player.data) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-label">${labels[key]}</div>
            <div class="card-value">${player.data[key]}</div>
        `;
        grid.appendChild(card);
    }
    switchScreen('role-screen');
}
