const CardsBank = {
    romance: {
        questions: ["[Имя1], какой момент в отношениях самый романтичный для тебя?", "[Имя2], если бы наша любовь была цветком, каким бы она была?"],
        actions: ["Поцелуй [Имя1_кому] в щечку", "[Имя2], прошепчи на ушко [Имя1_кому] секрет"]
    },
    fun: {
        questions: ["Кто из вас чаще теряет ключи?", "Какое самое смешное первое впечатление было у [Имя1] о [Имя2_кому]?"],
        actions: ["Изобрази походку [Имя2]", "Пусть [Имя1] споет припев любой песни"]
    },
    adult: {
        questions: ["Твое самое смелое желание?", "Где бы ты хотел(а) это сделать прямо сейчас?"],
        actions: ["Сделай массаж плеч [Имя2_кому]", "Страстный поцелуй"]
    },
    dates: {
        questions: ["Опиши идеальное свидание за 100 рублей"],
        actions: ["Запланируйте поход в кино"],
        places: ["Уютная кофейня на крыше", "Парк с лебедями", "Старый книжный магазин"]
    }
};

window.usedCards = new Set();

function getRandomCard(theme) {
    let customs = JSON.parse(localStorage.getItem('lc_customs') || '[]');
    if (customs.length > 0 && Math.random() < 0.2) return customs[Math.floor(Math.random() * customs.length)];

    let pool = [];
    if (theme === 'dates') {
        pool = [...CardsBank.dates.questions, ...CardsBank.dates.actions, ...CardsBank.dates.places];
    } else {
        pool = [...CardsBank[theme].questions, ...CardsBank[theme].actions];
    }

    let available = pool.filter(c => !window.usedCards.has(c));
    if (available.length === 0) { window.usedCards.clear(); available = pool; }

    let raw = available[Math.floor(Math.random() * available.length)];
    let type = 'действие';
    let tip = '';

    if (CardsBank[theme].questions?.includes(raw)) type = 'вопрос';
    if (theme === 'dates' && CardsBank.dates.places.includes(raw)) {
        type = 'место';
        tip = 'Отличное место для свидания!';
    }

    return { text: raw, type: type, tip: tip };
}
