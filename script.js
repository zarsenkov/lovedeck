function loadGame(gameId) {
    const fade = document.querySelector('.black-fade');
    if(fade) fade.classList.add('active');
    
    setTimeout(() => {
        let path = "";

        if (gameId === 'couples') {
            // Ведем в папку lovecoulpe (с твоей опечаткой) и далее в online
            path = "couples/index.html";
        } else {
            // Для всех остальных игр: alias, crocodile, spy и т.д.
            path = `/games/${gameId}/index.html`;
        }

        window.location.href = path;
    }, 400);
}

// Тряска для закрытых карточек
document.querySelectorAll('.locked').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
    });
});
