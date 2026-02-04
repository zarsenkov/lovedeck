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
        { word: 'Микрофон', difficulty: 'medium', category: 'objects' },
        { word: 'Бинокль', difficulty: 'medium', category: 'objects' },
        { word: 'Компас', difficulty: 'medium', category: 'objects' },
        { word: 'Календарь', difficulty: 'medium', category: 'objects' },
        { word: 'Сейф', difficulty: 'medium', category: 'objects' },
        { word: 'Термос', difficulty: 'medium', category: 'objects' },
        { word: 'Фонарик', difficulty: 'medium', category: 'objects' },
        { word: 'Скафандр', difficulty: 'hard', category: 'objects' },
        { word: 'Сейсмограф', difficulty: 'hard', category: 'objects' },
        { word: 'Микроскоп', difficulty: 'hard', category: 'objects' },
        { word: 'Паяльник', difficulty: 'hard', category: 'objects' }
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
        { word: 'Бегемот', difficulty: 'medium', category: 'animals' },
        { word: 'Жираф', difficulty: 'medium', category: 'animals' },
        { word: 'Крокодил', difficulty: 'medium', category: 'animals' },
        { word: 'Носорог', difficulty: 'medium', category: 'animals' },
        { word: 'Осьминог', difficulty: 'medium', category: 'animals' },
        { word: 'Хамелеон', difficulty: 'hard', category: 'animals' },
        { word: 'Утконос', difficulty: 'hard', category: 'animals' },
        { word: 'Броненосец', difficulty: 'hard', category: 'animals' },
        { word: 'Муравьед', difficulty: 'hard', category: 'animals' },
        { word: 'Игуана', difficulty: 'hard', category: 'animals' }
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
        { word: 'Читать', difficulty: 'medium', category: 'actions' },
        { word: 'Писать', difficulty: 'medium', category: 'actions' },
        { word: 'Рисовать', difficulty: 'medium', category: 'actions' },
        { word: 'Шить', difficulty: 'medium', category: 'actions' },
        { word: 'Строить', difficulty: 'medium', category: 'actions' },
        { word: 'Программировать', difficulty: 'hard', category: 'actions' },
        { word: 'Жонглировать', difficulty: 'hard', category: 'actions' },
        { word: 'Акробатика', difficulty: 'hard', category: 'actions' },
        { word: 'Скалолазание', difficulty: 'hard', category: 'actions' },
        { word: 'Парашютный спорт', difficulty: 'hard', category: 'actions' }
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
        { word: 'Актер', difficulty: 'medium', category: 'professions' },
        { word: 'Пилот', difficulty: 'hard', category: 'professions' },
        { word: 'Хирург', difficulty: 'hard', category: 'professions' },
        { word: 'Археолог', difficulty: 'hard', category: 'professions' },
        { word: 'Астронавт', difficulty: 'hard', category: 'professions' },
        { word: 'Вулканолог', difficulty: 'hard', category: 'professions' },
        { word: 'Криптограф', difficulty: 'hard', category: 'professions' }
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
        { word: 'Игра престолов', difficulty: 'medium', category: 'movies' },
        { word: 'Во все тяжкие', difficulty: 'medium', category: 'movies' },
        { word: 'Доктор Хаус', difficulty: 'medium', category: 'movies' },
        { word: 'Секретные материалы', difficulty: 'hard', category: 'movies' },
        { word: 'Назад в будущее', difficulty: 'hard', category: 'movies' },
        { word: 'Крестный отец', difficulty: 'hard', category: 'movies' }
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
        { word: 'Ким Кардашьян', difficulty: 'medium', category: 'celebrities' },
        { word: 'Бейонсе', difficulty: 'hard', category: 'celebrities' },
        { word: 'Дэвид Бекхэм', difficulty: 'hard', category: 'celebrities' }
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
        { word: 'Борщ', difficulty: 'medium', category: 'food' },
        { word: 'Пельмени', difficulty: 'medium', category: 'food' },
        { word: 'Сыр', difficulty: 'medium', category: 'food' },
        { word: 'Устрицы', difficulty: 'hard', category: 'food' },
        { word: 'Фуа-гра', difficulty: 'hard', category: 'food' },
        { word: 'Трюфели', difficulty: 'hard', category: 'food' },
        { word: 'Креветки', difficulty: 'hard', category: 'food' }
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
        { word: 'Библиотека', difficulty: 'medium', category: 'places' },
        { word: 'Эйфелева башня', difficulty: 'hard', category: 'places' },
        { word: 'Пирамиды Гизы', difficulty: 'hard', category: 'places' },
        { word: 'Великая Китайская стена', difficulty: 'hard', category: 'places' },
        { word: 'Статуя Свободы', difficulty: 'hard', category: 'places' },
        { word: 'Колизей', difficulty: 'hard', category: 'places' },
        { word: 'Тадж-Махал', difficulty: 'hard', category: 'places' }
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
        { word: 'Вечность', difficulty: 'hard', category: 'abstract' },
        { word: 'Бесконечность', difficulty: 'hard', category: 'abstract' },
        { word: 'Бессмертие', difficulty: 'hard', category: 'abstract' },
        { word: 'Вселенная', difficulty: 'hard', category: 'abstract' },
        { word: 'Гармония', difficulty: 'hard', category: 'abstract' },
        { word: 'Парадокс', difficulty: 'hard', category: 'abstract' }
    ]
};

// Экспорт для использования в основном скрипте
if (typeof module !== 'undefined' && module.exports) {
    module.exports = crocodileWords;
}
