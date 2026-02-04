// ===== СЛОВА ДЛЯ ИГРЫ "КРОКОДИЛ" =====

const crocodileWords = {
    objects: [
        { word: 'Телефон', difficulty: 'easy', category: 'objects' },
        { word: 'Книга', difficulty: 'easy', category: 'objects' },
        { word: 'Стул', difficulty: 'easy', category: 'objects' },
        { word: 'Лампа', difficulty: 'easy', category: 'objects' },
        { word: 'Часы', difficulty: 'easy', category: 'objects' },
        { word: 'Очки', difficulty: 'easy', category: 'objects' },
        { word: 'Ключи', difficulty: 'easy', category: 'objects' },
        { word: 'Рюкзак', difficulty: 'easy', category: 'objects' },
        { word: 'Зонт', difficulty: 'medium', category: 'objects' },
        { word: 'Микрофон', difficulty: 'medium', category: 'objects' }
    ],
    
    animals: [
        { word: 'Кошка', difficulty: 'easy', category: 'animals' },
        { word: 'Собака', difficulty: 'easy', category: 'animals' },
        { word: 'Лошадь', difficulty: 'easy', category: 'animals' },
        { word: 'Корова', difficulty: 'easy', category: 'animals' },
        { word: 'Слон', difficulty: 'easy', category: 'animals' },
        { word: 'Лев', difficulty: 'easy', category: 'animals' },
        { word: 'Пингвин', difficulty: 'medium', category: 'animals' },
        { word: 'Кенгуру', difficulty: 'medium', category: 'animals' },
        { word: 'Дельфин', difficulty: 'medium', category: 'animals' },
        { word: 'Бегемот', difficulty: 'medium', category: 'animals' }
    ],
    
    actions: [
        { word: 'Бегать', difficulty: 'easy', category: 'actions' },
        { word: 'Прыгать', difficulty: 'easy', category: 'actions' },
        { word: 'Плавать', difficulty: 'easy', category: 'actions' },
        { word: 'Танцевать', difficulty: 'easy', category: 'actions' },
        { word: 'Спать', difficulty: 'easy', category: 'actions' },
        { word: 'Есть', difficulty: 'easy', category: 'actions' },
        { word: 'Пить', difficulty: 'easy', category: 'actions' },
        { word: 'Готовить', difficulty: 'medium', category: 'actions' },
        { word: 'Водить машину', difficulty: 'medium', category: 'actions' },
        { word: 'Читать', difficulty: 'medium', category: 'actions' }
    ],
    
    professions: [
        { word: 'Врач', difficulty: 'easy', category: 'professions' },
        { word: 'Учитель', difficulty: 'easy', category: 'professions' },
        { word: 'Полицейский', difficulty: 'easy', category: 'professions' },
        { word: 'Пожарный', difficulty: 'easy', category: 'professions' },
        { word: 'Повар', difficulty: 'easy', category: 'professions' },
        { word: 'Строитель', difficulty: 'medium', category: 'professions' },
        { word: 'Программист', difficulty: 'medium', category: 'professions' },
        { word: 'Дизайнер', difficulty: 'medium', category: 'professions' },
        { word: 'Журналист', difficulty: 'medium', category: 'professions' },
        { word: 'Актер', difficulty: 'medium', category: 'professions' }
    ],
    
    movies: [
        { word: 'Титаник', difficulty: 'easy', category: 'movies' },
        { word: 'Гарри Поттер', difficulty: 'easy', category: 'movies' },
        { word: 'Властелин колец', difficulty: 'easy', category: 'movies' },
        { word: 'Звездные войны', difficulty: 'easy', category: 'movies' },
        { word: 'Король Лев', difficulty: 'easy', category: 'movies' },
        { word: 'Интерстеллар', difficulty: 'medium', category: 'movies' },
        { word: 'Начало', difficulty: 'medium', category: 'movies' },
        { word: 'Побег из Шоушенка', difficulty: 'medium', category: 'movies' },
        { word: 'Криминальное чтиво', difficulty: 'medium', category: 'movies' },
        { word: 'Игра престолов', difficulty: 'medium', category: 'movies' }
    ],
    
    celebrities: [
        { word: 'Путин', difficulty: 'easy', category: 'celebrities' },
        { word: 'Эйнштейн', difficulty: 'easy', category: 'celebrities' },
        { word: 'Моцарт', difficulty: 'easy', category: 'celebrities' },
        { word: 'Леонардо да Винчи', difficulty: 'medium', category: 'celebrities' },
        { word: 'Мерлин Монро', difficulty: 'medium', category: 'celebrities' },
        { word: 'Майкл Джексон', difficulty: 'medium', category: 'celebrities' },
        { word: 'Билл Гейтс', difficulty: 'medium', category: 'celebrities' },
        { word: 'Илон Маск', difficulty: 'medium', category: 'celebrities' },
        { word: 'Стив Джобс', difficulty: 'medium', category: 'celebrities' },
        { word: 'Ким Кардашьян', difficulty: 'medium', category: 'celebrities' }
    ],
    
    food: [
        { word: 'Яблоко', difficulty: 'easy', category: 'food' },
        { word: 'Банан', difficulty: 'easy', category: 'food' },
        { word: 'Пицца', difficulty: 'easy', category: 'food' },
        { word: 'Бургер', difficulty: 'easy', category: 'food' },
        { word: 'Мороженое', difficulty: 'easy', category: 'food' },
        { word: 'Шоколад', difficulty: 'easy', category: 'food' },
        { word: 'Спагетти', difficulty: 'medium', category: 'food' },
        { word: 'Суши', difficulty: 'medium', category: 'food' },
        { word: 'Кебаб', difficulty: 'medium', category: 'food' },
        { word: 'Борщ', difficulty: 'medium', category: 'food' }
    ],
    
    places: [
        { word: 'Школа', difficulty: 'easy', category: 'places' },
        { word: 'Больница', difficulty: 'easy', category: 'places' },
        { word: 'Магазин', difficulty: 'easy', category: 'places' },
        { word: 'Парк', difficulty: 'easy', category: 'places' },
        { word: 'Пляж', difficulty: 'easy', category: 'places' },
        { word: 'Кинотеатр', difficulty: 'medium', category: 'places' },
        { word: 'Ресторан', difficulty: 'medium', category: 'places' },
        { word: 'Аэропорт', difficulty: 'medium', category: 'places' },
        { word: 'Вокзал', difficulty: 'medium', category: 'places' },
        { word: 'Библиотека', difficulty: 'medium', category: 'places' }
    ],
    
    abstract: [
        { word: 'Любовь', difficulty: 'easy', category: 'abstract' },
        { word: 'Счастье', difficulty: 'easy', category: 'abstract' },
        { word: 'Грусть', difficulty: 'easy', category: 'abstract' },
        { word: 'Время', difficulty: 'medium', category: 'abstract' },
        { word: 'Мечта', difficulty: 'medium', category: 'abstract' },
        { word: 'Надежда', difficulty: 'medium', category: 'abstract' },
        { word: 'Свобода', difficulty: 'medium', category: 'abstract' },
        { word: 'Вера', difficulty: 'medium', category: 'abstract' },
        { word: 'Мудрость', difficulty: 'hard', category: 'abstract' },
        { word: 'Вечность', difficulty: 'hard', category: 'abstract' }
    ]
};
