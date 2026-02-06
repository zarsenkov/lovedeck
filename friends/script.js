function loadGame(gameId) {
    const fade = document.querySelector('.black-fade');
    fade.classList.add('active');
    
    setTimeout(() => {
        window.location.href = `games/${gameId}/index.html`;
    }, 400);
}

// Эффект тряски для заблокированных карточек
document.querySelectorAll('.locked').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
    });
});