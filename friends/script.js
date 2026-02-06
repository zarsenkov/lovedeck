const gameStatus = {
    'whoami': 'available',
    'spy': 'available',
    'crocodile': 'available',
    'alias': 'available',
    'danetki': 'available',
    'quiz': 'available',
    'bunker': 'coming-soon',
    'mafia': 'maintenance'
};

function initializeGameCards() {
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        const gameId = card.getAttribute('data-game');
        const status = gameStatus[gameId] || 'coming-soon';
        const btn = card.querySelector('.play-btn');
        const badge = card.querySelector('.game-status-badge');

        // Настройка бейджа
        if (badge) {
            badge.className = `game-status-badge status-${status}`;
            if (status === 'available') badge.textContent = 'ДОСТУПНО';
            if (status === 'maintenance') badge.textContent = 'ОБНОВЛЕНИЕ';
            if (status === 'coming-soon') badge.textContent = 'СКОРО';
        }

        if (status === 'available') {
            card.addEventListener('click', () => loadGame(gameId));
        } else {
            card.classList.add('locked');
            if (btn) btn.innerHTML = '<span>В РАЗРАБОТКЕ</span>';
            card.addEventListener('click', () => {
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 500);
            });
        }
    });
}

function loadGame(gameId) {
    const fade = document.querySelector('.black-fade');
    fade.classList.add('active');
    
    setTimeout(() => {
        window.location.href = `games/${gameId}/index.html`;
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGameCards();
    console.log('✓ Лендинг LOVECOUPLE обновлен');
});