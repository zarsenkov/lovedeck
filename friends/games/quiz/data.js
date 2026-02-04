// База данных вопросов для викторины
const quizQuestions = {
    easy: [
        {
            category: "general",
            question: "Сколько континентов на Земле?",
            answers: ["5", "6", "7", "8"],
            correct: 2,
            explanation: "На Земле 7 континентов: Европа, Азия, Африка, Северная Америка, Южная Америка, Австралия, Антарктида."
        },
        {
            category: "science",
            question: "Какая планета известна как 'Красная планета'?",
            answers: ["Венера", "Марс", "Юпитер", "Сатурн"],
            correct: 1,
            explanation: "Марс называют 'Красной планетой' из-за красноватого оттенка поверхности."
        },
        {
            category: "history",
            question: "В каком году человек впервые полетел в космос?",
            answers: ["1957", "1961", "1969", "1975"],
            correct: 1,
            explanation: "Юрий Гагарин стал первым человеком в космосе 12 апреля 1961 года."
        },
        {
            category: "culture",
            question: "Кто написал картину 'Мона Лиза'?",
            answers: ["Микеланджело", "Рафаэль", "Леонардо да Винчи", "Рембрандт"],
            correct: 2,
            explanation: "'Мона Лиза' была написана Леонардо да Винчи в начале XVI века."
        },
        {
            category: "sport",
            question: "Сколько игроков в футбольной команде на поле?",
            answers: ["9", "10", "11", "12"],
            correct: 2,
            explanation: "В футболе на поле одновременно находится 11 игроков от каждой команды."
        },
        {
            category: "geography",
            question: "Какая самая длинная река в мире?",
            answers: ["Амазонка", "Нил", "Янцзы", "Миссисипи"],
            correct: 0,
            explanation: "Река Амазонка в Южной Америке - самая длинная река в мире."
        },
        {
            category: "movies",
            question: "Как звали главного героя фильма 'Титаник'?",
            answers: ["Джек", "Том", "Гарри", "Ричард"],
            correct: 0,
            explanation: "Главного героя в исполнении Леонардо ДиКаприо звали Джек Доусон."
        }
    ],
    medium: [
        {
            category: "general",
            question: "Какой химический элемент обозначается символом 'Au'?",
            answers: ["Серебро", "Золото", "Алюминий", "Аргон"],
            correct: 1,
            explanation: "Au - химический символ золота от латинского 'aurum'."
        },
        {
            category: "science",
            question: "Какая самая маленькая частица в атоме?",
            answers: ["Протон", "Нейтрон", "Электрон", "Кварк"],
            correct: 2,
            explanation: "Электрон - самая маленькая стабильная частица в атоме."
        },
        {
            category: "history",
            question: "Кто был первым президентом США?",
            answers: ["Томас Джефферсон", "Джордж Вашингтон", "Авраам Линкольн", "Бенджамин Франклин"],
            correct: 1,
            explanation: "Джордж Вашингтон стал первым президентом США в 1789 году."
        },
        {
            category: "culture",
            question: "В какой стране возникло искусство оригами?",
            answers: ["Китай", "Япония", "Корея", "Вьетнам"],
            correct: 1,
            explanation: "Искусство складывания фигурок из бумаги оригами возникло в Японии."
        },
        {
            category: "sport",
            question: "В каком виде спорта используется термин 'голкипер'?",
            answers: ["Футбол", "Хоккей", "Водное поло", "Все варианты"],
            correct: 3,
            explanation: "Голкипер (вратарь) есть в футболе, хоккее, водном поло и других играх."
        },
        {
            category: "geography",
            question: "Какая страна имеет самое большое население в мире?",
            answers: ["Индия", "США", "Китай", "Индонезия"],
            correct: 2,
            explanation: "Китай - самая населенная страна мира (более 1.4 млрд человек)."
        },
        {
            category: "movies",
            question: "Какой фильм получил больше всего 'Оскаров'?",
            answers: ["Титаник", "Властелин колец: Возвращение короля", "Бен-Гур", "Все они"],
            correct: 3,
            explanation: "Все три фильма получили 11 'Оскаров' каждый."
        }
    ],
    hard: [
        {
            category: "general",
            question: "Какое число в римской системе обозначается как 'M'?",
            answers: ["100", "500", "1000", "5000"],
            correct: 2,
            explanation: "В римской системе счисления M обозначает 1000."
        },
        {
            category: "science",
            question: "Сколько хромосом у здорового человека?",
            answers: ["23", "46", "64", "92"],
            correct: 1,
            explanation: "У здорового человека 46 хромосом (23 пары)."
        },
        {
            category: "history",
            question: "В каком году была подписана Великая хартия вольностей?",
            answers: ["1066", "1215", "1453", "1649"],
            correct: 1,
            explanation: "Великая хартия вольностей была подписана в 1215 году в Англии."
        },
        {
            category: "culture",
            question: "Кто написал оперу 'Кольцо Нибелунга'?",
            answers: ["Бетховен", "Моцарт", "Вагнер", "Бах"],
            correct: 2,
            explanation: "Цикл опер 'Кольцо Нибелунга' написал немецкий композитор Рихард Вагнер."
        },
        {
            category: "sport",
            question: "Какой шахматист дольше всех был чемпионом мира?",
            answers: ["Гарри Каспаров", "Эммануил Ласкер", "Магнус Карлсен", "Анатолий Карпов"],
            correct: 1,
            explanation: "Эммануил Ласкер был чемпионом мира 27 лет (1894-1921)."
        },
        {
            category: "geography",
            question: "Какое озеро является самым глубоким в мире?",
            answers: ["Каспийское море", "Байкал", "Танганьика", "Верхнее"],
            correct: 1,
            explanation: "Озеро Байкал в России - самое глубокое озеро в мире (1642 м)."
        },
        {
            category: "movies",
            question: "Какой фильм стал первым полнометражным анимационным фильмом Disney?",
            answers: ["Белоснежка и семь гномов", "Пиноккио", "Фантазия", "Дамбо"],
            correct: 0,
            explanation: "'Белоснежка и семь гномов' (1937) был первым полнометражным анимационным фильмом Disney."
        }
    ]
};

// Категории вопросов
const categories = {
    general: { name: "Общее", icon: "fas fa-globe", color: "#6366f1" },
    science: { name: "Наука", icon: "fas fa-flask", color: "#10b981" },
    history: { name: "История", icon: "fas fa-landmark", color: "#f59e0b" },
    culture: { name: "Культура", icon: "fas fa-palette", color: "#8b5cf6" },
    sport: { name: "Спорт", icon: "fas fa-futbol", color: "#ef4444" },
    geography: { name: "География", icon: "fas fa-map", color: "#06b6d4" },
    movies: { name: "Кино", icon: "fas fa-film", color: "#ec4899" }
};

// Система достижений
const achievements = [
    {
        id: "first_game",
        name: "Первая игра",
        description: "Завершите первую викторину",
        icon: "fas fa-play-circle",
        condition: (game) => game.totalGames >= 1
    },
    {
        id: "perfect_game",
        name: "Идеальный результат",
        description: "Ответьте правильно на все вопросы",
        icon: "fas fa-star",
        condition: (game) => game.correctAnswers === game.totalQuestions && game.totalQuestions >= 10
    },
    {
        id: "speed_demon",
        name: "Скоростной демон",
        description: "Завершите викторину менее чем за 5 минут",
        icon: "fas fa-bolt",
        condition: (game) => game.timeSpent < 300
    },
    {
        id: "streak_master",
        name: "Мастер серий",
        description: "Получите серию из 10 правильных ответов",
        icon: "fas fa-fire",
        condition: (game) => game.bestStreak >= 10
    },
    {
        id: "category_expert",
        name: "Эксперт категорий",
        description: "Пройдите викторину во всех категориях",
        icon: "fas fa-trophy",
        condition: (game) => game.categoriesPlayed.length === 7
    },
    {
        id: "hard_mode",
        name: "Испытание сложности",
        description: "Пройдите сложную викторину из 20+ вопросов",
        icon: "fas fa-mountain",
        condition: (game) => game.difficulty === "hard" && game.totalQuestions >= 20
    }
];
