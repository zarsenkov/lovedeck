// Функция загрузки игры
function loadGame(gameId) {
    const fade = document.querySelector('.black-fade');
    if(fade) fade.classList.add('active');
    
    // Ссылки на твои игры на Vercel
    // Когда создашь новые игры, просто заменяй эти ссылки на свои
    const gameUrls = {
        'danetki': 'https://danetki-offline-1xyp.vercel.app/',
        'mafia': 'https://mafia-noir.vercel.app/',
        'couples': 'https://love-moments.vercel.app'
        // добавь остальные позже
    };

    setTimeout(() => {
        // Если ссылка для игры есть в списке — идем по ней, 
        // если нет — идем по старому пути (на папку)
        if (gameUrls[gameId]) {
            window.location.href = gameUrls[gameId];
        } else {
            window.location.href = `/games/${gameId}/index.html`;
        }
    }, 400);
}

// Тряска для закрытых карточек
document.querySelectorAll('.locked').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
    });
});
