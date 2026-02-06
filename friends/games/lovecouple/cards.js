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
        actions: ["Сделай массаж плеч [Имя2_кому]", "Страстный поцелуй в течение 30 секунд"]
    },
    dates: {
        questions: ["Опиши идеальное свидание за 100 рублей", "Куда бы ты хотел(а) отправиться в это воскресенье?"],
        actions: ["Запланируйте поход в кино на завтра", "Приготовьте вместе что-то новое"],
        // ИНТЕГРИРОВАЛИ ИНТЕРЕСНЫЕ МЕСТА СЮДА
        places: ["Уютная кофейня на крыше", "Парк с лебедями", "Старый книжный магазин"]
    }
};

let usedCards = new Set();

function getRandomCard(theme) {
    // 1. Проверяем свои карты (шанс 25%)
    let customs = JSON.parse(localStorage.getItem('lc_customs') || '[]');
    if (customs.length > 0 && Math.random() < 0.25) {
        return customs[Math.floor(Math.random() * customs.length)];
    }

    // 2. Логика для Свиданий (добавляем места)
    let pool = [];
    if (theme === 'dates') {
        pool = [...CardsBank.dates.questions, ...CardsBank.dates.actions, ...CardsBank.dates.places];
    } else {
        pool = [...CardsBank[theme].questions, ...CardsBank[theme].actions];
    }

    // Исключаем уже показанные
    let available = pool.filter(card => !usedCards.has(typeof card === 'string' ? card : card.text));

    // Если всё закончилось — сбрасываем круг
    if (available.length === 0) {
        usedCards.clear();
        available = pool;
    }

    let rawCard = available[Math.floor(Math.random() * available.length)];
    
    // Форматируем объект карты
    if (typeof rawCard === 'string') {
        let type = 'action';
        let tip = '';
        if (CardsBank[theme].questions && CardsBank[theme].questions.includes(rawCard)) type = 'question';
        if (theme === 'dates' && CardsBank.dates.places.includes(rawCard)) {
            type = 'Место';
            tip = 'Попробуйте заглянуть сюда на выходных!';
        }
        return { text: rawCard, type: type, tip: tip };
    }
    return rawCard;
}

window.getRandomCard = getRandomCard;
window.usedCards = usedCards;
