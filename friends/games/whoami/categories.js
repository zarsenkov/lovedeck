// База данных категорий и слов для игры "Кто я?"
const GAME_CATEGORIES = {
    characters: {
        id: 'characters',
        name: 'Персонажи',
        icon: 'fas fa-user',
        color: '#10b981',
        description: 'Известные люди и вымышленные герои',
        words: [
            { text: 'Шерлок Холмс', hint: 'Знаменитый детектив с улицы Бейкер-стрит' },
            { text: 'Дарт Вейдер', hint: 'Тёмный лорд ситхов из "Звёздных войн"' },
            { text: 'Гарри Поттер', hint: 'Мальчик, который выжил, ученик Хогвартса' },
            { text: 'Наполеон Бонапарт', hint: 'Французский император и полководец' },
            { text: 'Мэрилин Монро', hint: 'Американская актриса и секс-символ' },
            { text: 'Леонардо да Винчи', hint: 'Художник эпохи Возрождения, создатель "Моны Лизы"' },
            { text: 'Клеопатра', hint: 'Последняя царица Египта из династии Птолемеев' },
            { text: 'Владимир Путин', hint: 'Президент Российской Федерации' },
            { text: 'Илон Маск', hint: 'Основатель SpaceX и Tesla' },
            { text: 'Тони Старк (Железный человек)', hint: 'Гений, миллиардер, плейбой, филантроп' },
            { text: 'Бэтмен', hint: 'Тёмный рыцарь, защитник Готэма' },
            { text: 'Шрек', hint: 'Большой зелёный огр, живущий на болоте' },
            { text: 'Ариана Гранде', hint: 'Американская певица с высоким голосом' },
            { text: 'Фредди Меркьюри', hint: 'Вокалист группы Queen' },
            { text: 'Альберт Эйнштейн', hint: 'Физик-теоретик, автор теории относительности' }
        ]
    },
    
    movies: {
        id: 'movies',
        name: 'Фильмы и сериалы',
        icon: 'fas fa-film',
        color: '#3b82f6',
        description: 'Знаменитые фильмы и популярные сериалы',
        words: [
            { text: 'Титаник', hint: 'Корабль, который столкнулся с айсбергом' },
            { text: 'Матрица', hint: 'Фильм про синие и красные таблетки' },
            { text: 'Властелин колец', hint: 'Эпическая фэнтези-сага про хоббитов' },
            { text: 'Игра престолов', hint: 'Сериал про борьбу за железный трон' },
            { text: 'Друзья', hint: 'Сериал про шестерых друзей в Нью-Йорке' },
            { text: 'Назад в будущее', hint: 'Фильм про путешествия во времени на DeLorean' },
            { text: 'Побег из Шоушенка', hint: 'Фильм про несправедливо осуждённого банкира' },
            { text: 'Криминальное чтиво', hint: 'Фильм Тарантино про гангстеров' },
            { text: 'Звёздные войны', hint: 'Космическая сага про джедаев и ситхов' },
            { text: 'Гарри Поттер', hint: 'Серия фильмов о юном волшебнике' },
            { text: 'Аватар', hint: 'Фильм про синих гуманоидов на Пандоре' },
            { text: 'Пираты Карибского моря', hint: 'Фильмы про капитана Джека Воробья' },
            { text: 'Очень странные дела', hint: 'Сериал про параллельное измерение "Изнанку"' },
            { text: 'Шерлок', hint: 'Современная адаптация историй о детективе' },
            { text: 'Во все тяжкие', hint: 'Сериал про учителя химии, ставшего наркобароном' }
        ]
    },
    
    celebrities: {
        id: 'celebrities',
        name: 'Знаменитости',
        icon: 'fas fa-star',
        color: '#f59e0b',
        description: 'Актёры, певцы, блогеры и медийные личности',
        words: [
            { text: 'Дуа Липа', hint: 'Британская певица албанского происхождения' },
            { text: 'Райан Гослинг', hint: 'Канадский актёр, известный по "Драйву"' },
            { text: 'Дженнифер Лоуренс', hint: 'Американская актриса, сыгравшая Китнисс Эвердин' },
            { text: 'Криштиану Роналду', hint: 'Португальский футболист, CR7' },
            { text: 'Билли Айлиш', hint: 'Молодая американская певица с зелёными волосами' },
            { text: 'Джеймс Кэмерон', hint: 'Режиссёр "Титаника" и "Аватара"' },
            { text: 'Моргенштерн', hint: 'Российский рэпер и блогер' },
            { text: 'Леди Гага', hint: 'Американская певица и актриса, известная эксцентричностью' },
            { text: 'Брэд Питт', hint: 'Американский актёр и продюсер' },
            { text: 'Скарлетт Йоханссон', hint: 'Американская актриса, сыгравшая Чёрную Вдову' },
            { text: 'Тим Бертон', hint: 'Американский режиссёр с готическим стилем' },
            { text: 'Дэвид Бекхэм', hint: 'Английский футболист и икона стиля' },
            { text: 'Ким Кардашьян', hint: 'Американская медийная личность' },
            { text: 'Джонни Депп', hint: 'Американский актёр, известный ролями эксцентричных персонажей' },
            { text: 'Бенедикт Камбербэтч', hint: 'Британский актёр, сыгравший Шерлока Холмса' }
        ]
    },
    
    professions: {
        id: 'professions',
        name: 'Профессии',
        icon: 'fas fa-briefcase',
        color: '#8b5cf6',
        description: 'Различные виды деятельности и специальности',
        words: [
            { text: 'Хирург', hint: 'Врач, который проводит операции' },
            { text: 'Астронавт', hint: 'Человек, который летает в космос' },
            { text: 'Пожарный', hint: 'Тот, кто тушит пожары и спасает людей' },
            { text: 'Шеф-повар', hint: 'Главный повар в ресторане' },
            { text: 'Пилот', hint: 'Управляет самолётом' },
            { text: 'Архитектор', hint: 'Проектирует здания' },
            { text: 'Юрист', hint: 'Специалист по правовым вопросам' },
            { text: 'Учитель', hint: 'Работает в школе, обучает детей' },
            { text: 'Фотограф', hint: 'Делает снимки на камеру' },
            { text: 'Программист', hint: 'Пишет код для компьютеров' },
            { text: 'Журналист', hint: 'Пишет статьи для газет и журналов' },
            { text: 'Фермер', hint: 'Занимается сельским хозяйством' },
            { text: 'Парикмахер', hint: 'Стрижёт и укладывает волосы' },
            { text: 'Электрик', hint: 'Работает с электричеством' },
            { text: 'Таксист', hint: 'Управляет такси' }
        ]
    },
    
    animals: {
        id: 'animals',
        name: 'Животные',
        icon: 'fas fa-paw',
        color: '#ef4444',
        description: 'Представители фауны со всего мира',
        words: [
            { text: 'Жираф', hint: 'Самое высокое сухопутное животное' },
            { text: 'Пингвин', hint: 'Птица, которая не летает, но отлично плавает' },
            { text: 'Кенгуру', hint: 'Австралийское животное с сумкой' },
            { text: 'Слон', hint: 'Крупнейшее сухопутное животное с хоботом' },
            { text: 'Дельфин', hint: 'Умное морское млекопитающее' },
            { text: 'Коала', hint: 'Австралийское животное, которое ест эвкалипт' },
            { text: 'Бегемот', hint: 'Крупное животное, которое много времени проводит в воде' },
            { text: 'Зебра', hint: 'Животное с чёрно-белыми полосами' },
            { text: 'Лев', hint: 'Царь зверей' },
            { text: 'Осьминог', hint: 'Морское животное с восемью щупальцами' },
            { text: 'Черепаха', hint: 'Животное с панцирем на спине' },
            { text: 'Крокодил', hint: 'Крупная рептилия с мощными челюстями' },
            { text: 'Панда', hint: 'Чёрно-белый медведь из Китая' },
            { text: 'Летучая мышь', hint: 'Единственное летающее млекопитающее' },
            { text: 'Улитка', hint: 'Медлительное животное с раковиной' }
        ]
    },
    
    objects: {
        id: 'objects',
        name: 'Предметы',
        icon: 'fas fa-cube',
        color: '#06b6d4',
        description: 'Обычные вещи из повседневной жизни',
        words: [
            { text: 'Холодильник', hint: 'Прибор для хранения еды при низкой температуре' },
            { text: 'Зонтик', hint: 'Защищает от дождя или солнца' },
            { text: 'Ключ', hint: 'Открывает замки' },
            { text: 'Часы', hint: 'Показывают время' },
            { text: 'Телефон', hint: 'Устройство для связи' },
            { text: 'Книга', hint: 'Источник знаний, состоит из страниц' },
            { text: 'Стул', hint: 'На нём сидят' },
            { text: 'Очки', hint: 'Помогают лучше видеть' },
            { text: 'Кошелёк', hint: 'В нём носят деньги и карты' },
            { text: 'Зубная щётка', hint: 'Используется для чистки зубов' },
            { text: 'Велосипед', hint: 'Транспорт с двумя колёсами' },
            { text: 'Фонарик', hint: 'Источник света в темноте' },
            { text: 'Ножницы', hint: 'Режут бумагу и ткань' },
            { text: 'Кровать', hint: 'На ней спят' },
            { text: 'Кастрюля', hint: 'В ней готовят еду' }
        ]
    },
    
    food: {
        id: 'food',
        name: 'Еда и напитки',
        icon: 'fas fa-utensils',
        color: '#84cc16',
        description: 'Вкусные блюда и напитки',
        words: [
            { text: 'Пицца', hint: 'Итальянское блюдо с тестом, сыром и начинкой' },
            { text: 'Суп', hint: 'Жидкое блюдо, обычно подаётся первым' },
            { text: 'Шоколад', hint: 'Сладкое лакомство из какао-бобов' },
            { text: 'Салат', hint: 'Блюдо из смеси различных ингредиентов' },
            { text: 'Кофе', hint: 'Бодрящий напиток из зёрен' },
            { text: 'Бургер', hint: 'Булочка с котлетой и овощами' },
            { text: 'Спагетти', hint: 'Итальянская паста в форме длинных тонких макарон' },
            { text: 'Сыр', hint: 'Молочный продукт, который бывает разных сортов' },
            { text: 'Мороженое', hint: 'Замороженный сладкий десерт' },
            { text: 'Суши', hint: 'Японское блюдо из риса и морепродуктов' },
            { text: 'Кола', hint: 'Газированный сладкий напиток' },
            { text: 'Блины', hint: 'Тонкие лепёшки из жидкого теста' },
            { text: 'Омлет', hint: 'Блюдо из взбитых яиц' },
            { text: 'Пирог', hint: 'Выпечка с начинкой' },
            { text: 'Сок', hint: 'Напиток из фруктов или овощей' }
        ]
    },
    
    locations: {
        id: 'locations',
        name: 'Места',
        icon: 'fas fa-map-marker-alt',
        color: '#f97316',
        description: 'Знаменитые места и локации',
        words: [
            { text: 'Париж', hint: 'Столица Франции, город любви' },
            { text: 'Эйфелева башня', hint: 'Знаменитая металлическая башня в Париже' },
            { text: 'Великая Китайская стена', hint: 'Крупнейшее оборонительное сооружение в мире' },
            { text: 'Пирамида Хеопса', hint: 'Единственное сохранившееся чудо света' },
            { text: 'Статуя Свободы', hint: 'Знаменитая статуя в Нью-Йорке' },
            { text: 'Московский Кремль', hint: 'Исторический центр Москвы' },
            { text: 'Диснейленд', hint: 'Парк развлечений для детей и взрослых' },
            { text: 'Берлинская стена', hint: 'Символ разделения Германии' },
            { text: 'Биг-Бен', hint: 'Знаменитые часы в Лондоне' },
            { text: 'Колизей', hint: 'Древний амфитеатр в Риме' },
            { text: 'Эверест', hint: 'Самая высокая гора в мире' },
            { text: 'Мачу-Пикчу', hint: 'Древний город инков в Перу' },
            { text: 'Сиднейская опера', hint: 'Знаменитое здание оперы в Австралии' },
            { text: 'Тадж-Махал', hint: 'Мавзолей в Индии из белого мрамора' },
            { text: 'Ниагарский водопад', hint: 'Знаменитый водопад на границе США и Канады' }
        ]
    }
};

// Режимы игры
const GAME_MODES = {
    classic: {
        name: 'Классический',
        description: 'Обычный режим без ограничений по времени',
        timePerRound: null,
        pointsForFastGuess: true
    },
    timed: {
        name: 'На время',
        description: '60 секунд на угадывание каждого слова',
        timePerRound: 60,
        pointsForFastGuess: true
    },
    teams: {
        name: 'Командный',
        description: 'Игра командами по 2-4 человека',
        timePerRound: 60,
        teams: true,
        pointsForFastGuess: true
    },
    hardcore: {
        name: 'Хардкор',
        description: 'Только "Да" или "Нет", без подсказок',
        timePerRound: 45,
        noHints: true,
        pointsForFastGuess: true
    },
    duel: {
        name: 'Дуэль',
        description: '1 на 1, кто быстрее угадает',
        timePerRound: 30,
        players: 2,
        pointsForFastGuess: true
    },
    creative: {
        name: 'Творческий',
        description: 'Объясняйте слова жестами и мимикой',
        timePerRound: 60,
        creativeMode: true,
        pointsForFastGuess: true
    },
    story: {
        name: 'Сюжетный',
        description: 'Все слова связаны одной историей',
        timePerRound: 60,
        storyMode: true,
        pointsForFastGuess: true
    }
};

// Настройки сложности
const DIFFICULTY_LEVELS = {
    easy: {
        name: 'Легкая',
        hintTime: 15,
        maxHints: 3,
        wordComplexity: 'simple'
    },
    medium: {
        name: 'Средняя',
        hintTime: 30,
        maxHints: 2,
        wordComplexity: 'normal'
    },
    hard: {
        name: 'Сложная',
        hintTime: 45,
        maxHints: 1,
        wordComplexity: 'complex'
    },
    expert: {
        name: 'Эксперт',
        hintTime: 60,
        maxHints: 0,
        wordComplexity: 'expert'
    }
};

// Функция для загрузки кастомных слов из localStorage
function loadCustomWords() {
    try {
        const saved = localStorage.getItem('whoami_custom_words');
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('Ошибка загрузки кастомных слов:', error);
        return {};
    }
}

// Функция для сохранения кастомных слов в localStorage
function saveCustomWords(words) {
    try {
        localStorage.setItem('whoami_custom_words', JSON.stringify(words));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения кастомных слов:', error);
        return false;
    }
}

// Функция для получения случайного слова из выбранных категорий
function getRandomWord(selectedCategories) {
    // Сначала проверяем кастомные слова
    const customWords = loadCustomWords();
    const customWordsList = [];
    
    Object.keys(customWords).forEach(categoryId => {
        if (selectedCategories.includes(categoryId) && customWords[categoryId]?.length > 0) {
            customWordsList.push(...customWords[categoryId].map(word => ({
                ...word,
                category: categoryId,
                custom: true
            })));
        }
    });
    
    // Добавляем стандартные слова из выбранных категорий
    const standardWordsList = [];
    selectedCategories.forEach(categoryId => {
        if (GAME_CATEGORIES[categoryId]) {
            const category = GAME_CATEGORIES[categoryId];
            standardWordsList.push(...category.words.map(word => ({
                ...word,
                category: categoryId,
                categoryName: category.name,
                custom: false
            })));
        }
    });
    
    // Объединяем списки (кастомные слова имеют приоритет)
    const allWords = [...customWordsList, ...standardWordsList];
    
    if (allWords.length === 0) {
        // Возвращаем запасное слово
        return {
            text: 'Человек',
            hint: 'Разумное существо, представитель человечества',
            category: 'characters',
            categoryName: 'Персонажи',
            custom: false
        };
    }
    
    // Выбираем случайное слово
    const randomIndex = Math.floor(Math.random() * allWords.length);
    return allWords[randomIndex];
}

// Функция для получения всех доступных категорий
function getAllCategories() {
    return Object.values(GAME_CATEGORIES);
}

// Функция для получения режима игры по ID
function getGameMode(modeId) {
    return GAME_MODES[modeId] || GAME_MODES.classic;
}

// Функция для получения настроек сложности
function getDifficultySettings(level) {
    return DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS.medium;
}
