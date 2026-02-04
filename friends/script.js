// Загрузка игры
function loadGame(gameName) {
    // Сохраняем выбранную игру в localStorage
    localStorage.setItem('selectedGame', gameName);
    
    // Перенаправляем в папку игры
    window.location.href = `games/${gameName}/index.html`;
}

// Проверяем, есть ли сохраненная игра
function checkSavedGame() {
    const savedGame = localStorage.getItem('selectedGame');
    if (savedGame) {
        console.log(`Есть сохраненная игра: ${savedGame}`);
        // Здесь можно добавить логику продолжения игры
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkSavedGame();
    
    // Добавляем анимацию появления карточек
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});