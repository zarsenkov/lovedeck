function loadGame(gameId) {
    const fade = document.querySelector('.black-fade');
    fade.classList.add('active');
    
    setTimeout(() => {
        // Переход в папку с игрой: games/couples/index.html и т.д.
        window.location.href = `games/${gameId}/index.html`;
    }, 400);
}

document.querySelectorAll('.locked').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
    });
});
