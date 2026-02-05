// База вопросов для викторины (упрощенная версия)
const QUIZ_DATABASE = {
    easy: [
        // ОБЩЕЕ (15 вопросов)
        { question: "Сколько континентов на Земле?", answers: ["5", "6", "7", "8"], correct: 2, category: "general" },
        { question: "Какой цвет получится при смешении синего и желтого?", answers: ["Фиолетовый", "Оранжевый", "Зеленый", "Коричневый"], correct: 2, category: "general" },
        { question: "Сколько дней в високосном году?", answers: ["364", "365", "366", "367"], correct: 2, category: "general" },
        { question: "Какое животное является символом России?", answers: ["Медведь", "Орел", "Волк", "Тигр"], correct: 0, category: "general" },
        { question: "Сколько часов в сутках?", answers: ["12", "24", "36", "48"], correct: 1, category: "general" },
        { question: "Как называется наша планета?", answers: ["Марс", "Земля", "Венера", "Юпитер"], correct: 1, category: "general" },
        { question: "Сколько сторон у квадрата?", answers: ["3", "4", "5", "6"], correct: 1, category: "general" },
        { question: "Какое время года наступает после лета?", answers: ["Весна", "Зима", "Осень", "Лето"], correct: 2, category: "general" },
        { question: "Сколько месяцев в году?", answers: ["10", "11", "12", "13"], correct: 2, category: "general" },
        { question: "Как называется детеныш собаки?", answers: ["Котенок", "Щенок", "Телёнок", "Жеребёнок"], correct: 1, category: "general" },
        { question: "Какая птица не умеет летать?", answers: ["Орел", "Пингвин", "Сокол", "Ласточка"], correct: 1, category: "general" },
        { question: "Сколько ног у паука?", answers: ["6", "8", "10", "12"], correct: 1, category: "general" },
        { question: "Что измеряет термометр?", answers: ["Вес", "Температуру", "Давление", "Влажность"], correct: 1, category: "general" },
        { question: "Как называется детеныш кошки?", answers: ["Щенок", "Котенок", "Цыпленок", "Козленок"], correct: 1, category: "general" },
        { question: "Какой цвет у травы?", answers: ["Красный", "Синий", "Зеленый", "Желтый"], correct: 2, category: "general" },
        
        // НАУКА (10 вопросов)
        { question: "Какая планета известна как 'Красная планета'?", answers: ["Венера", "Марс", "Юпитер", "Сатурн"], correct: 1, category: "science" },
        { question: "Какой газ нужен человеку для дыхания?", answers: ["Углекислый газ", "Кислород", "Азот", "Водород"], correct: 1, category: "science" },
        { question: "Что пчелы собирают с цветов?", answers: ["Нектар", "Пыль", "Воду", "Сок"], correct: 0, category: "science" },
        { question: "Какое животное является самым большим на Земле?", answers: ["Слон", "Жираф", "Синий кит", "Белая акула"], correct: 2, category: "science" },
        { question: "Что такое фотосинтез?", answers: ["Дыхание животных", "Питание растений", "Образование ветра", "Испарение воды"], correct: 1, category: "science" },
        { question: "Что такое гравитация?", answers: ["Сила притяжения", "Сила отталкивания", "Сила света", "Сила звука"], correct: 0, category: "science" },
        { question: "Сколько хромосом у здорового человека?", answers: ["23", "46", "64", "92"], correct: 1, category: "science" },
        { question: "Какой газ составляет 78% атмосферы Земли?", answers: ["Кислород", "Азот", "Углекислый газ", "Водород"], correct: 1, category: "science" },
        { question: "Что измеряет барометр?", answers: ["Температуру", "Давление", "Влажность", "Скорость ветра"], correct: 1, category: "science" },
        { question: "Как называется процесс превращения воды в пар?", answers: ["Конденсация", "Испарение", "Сублимация", "Кристаллизация"], correct: 1, category: "science" },
        
        // ИСТОРИЯ (10 вопросов)
        { question: "В каком году человек впервые полетел в космос?", answers: ["1957", "1961", "1969", "1975"], correct: 1, category: "history" },
        { question: "Кто был первым президентом России?", answers: ["Борис Ельцин", "Михаил Горбачев", "Владимир Путин", "Дмитрий Медведев"], correct: 0, category: "history" },
        { question: "В каком году закончилась Вторая мировая война?", answers: ["1943", "1945", "1947", "1950"], correct: 1, category: "history" },
        { question: "Кто открыл Америку?", answers: ["Фернан Магеллан", "Христофор Колумб", "Васко да Гама", "Джеймс Кук"], correct: 1, category: "history" },
        { question: "Как звали первого царя из династии Романовых?", answers: ["Петр I", "Иван IV", "Михаил Федорович", "Алексей Михайлович"], correct: 2, category: "history" },
        { question: "В каком году был основан Санкт-Петербург?", answers: ["1689", "1703", "1721", "1755"], correct: 1, category: "history" },
        { question: "Кто написал 'Войну и мир'?", answers: ["Федор Достоевский", "Лев Толстой", "Антон Чехов", "Иван Тургенев"], correct: 1, category: "history" },
        { question: "Как называлось первое русское государство?", answers: ["Киевская Русь", "Московское царство", "Новгородская республика", "Владимиро-Суздальское княжество"], correct: 0, category: "history" },
        { question: "Кто правил Россией во время Отечественной войны 1812 года?", answers: ["Екатерина II", "Александр I", "Николай I", "Павел I"], correct: 1, category: "history" },
        { question: "В каком году произошла Октябрьская революция?", answers: ["1905", "1914", "1917", "1922"], correct: 2, category: "history" },
        
        // КУЛЬТУРА (10 вопросов)
        { question: "Кто написал картину 'Мона Лиза'?", answers: ["Микеланджело", "Рафаэль", "Леонардо да Винчи", "Рембрандт"], correct: 2, category: "culture" },
        { question: "Какой композитор написал 'Лунную сонату'?", answers: ["Моцарт", "Бетховен", "Бах", "Чайковский"], correct: 1, category: "culture" },
        { question: "В какой стране возник балет?", answers: ["Россия", "Франция", "Италия", "Англия"], correct: 2, category: "culture" },
        { question: "Кто автор романа 'Преступление и наказание'?", answers: ["Лев Толстой", "Федор Достоевский", "Антон Чехов", "Иван Тургенев"], correct: 1, category: "culture" },
        { question: "Какой художник написал 'Подсолнухи'?", answers: ["Ван Гог", "Пикассо", "Моне", "Да Винчи"], correct: 0, category: "culture" },
        { question: "В какой стране находится пирамида Хеопса?", answers: ["Мексика", "Египет", "Перу", "Китай"], correct: 1, category: "culture" },
        { question: "Кто написал музыку к балету 'Лебединое озеро'?", answers: ["Чайковский", "Прокофьев", "Шостакович", "Глинка"], correct: 0, category: "culture" },
        { question: "Какой русский писатель получил Нобелевскую премию по литературе?", answers: ["Толстой", "Достоевский", "Пастернак", "Все ответы верны"], correct: 3, category: "culture" },
        { question: "В каком городе находится Эрмитаж?", answers: ["Москва", "Санкт-Петербург", "Киев", "Казань"], correct: 1, category: "culture" },
        { question: "Кто автор 'Гамлета'?", answers: ["Шекспир", "Дюма", "Гёте", "Сервантес"], correct: 0, category: "culture" },
        
        // СПОРТ (10 вопросов)
        { question: "Сколько игроков в футбольной команде на поле?", answers: ["9", "10", "11", "12"], correct: 2, category: "sport" },
        { question: "В каком виде спорта используется шайба?", answers: ["Футбол", "Хоккей", "Баскетбол", "Волейбол"], correct: 1, category: "sport" },
        { question: "Сколько периодов в хоккейном матче?", answers: ["2", "3", "4", "5"], correct: 1, category: "sport" },
        { question: "Какой цвет имеет футбольное поле?", answers: ["Красный", "Синий", "Зеленый", "Желтый"], correct: 2, category: "sport" },
        { question: "В каком городе прошли Олимпийские игры 2014 года?", answers: ["Лондон", "Пекин", "Сочи", "Рио"], correct: 2, category: "sport" },
        { question: "Сколько игроков в баскетбольной команде на площадке?", answers: ["4", "5", "6", "7"], correct: 1, category: "sport" },
        { question: "Как называется главный трофей в футбольной Лиге чемпионов?", answers: ["Золотой мяч", "Кубок Стэнли", "Большой шлем", "Кубок с большими ушами"], correct: 3, category: "sport" },
        { question: "В каком виде спорта выступает Рафаэль Надаль?", answers: ["Футбол", "Теннис", "Гольф", "Бокс"], correct: 1, category: "sport" },
        { question: "Сколько колец на олимпийском флаге?", answers: ["4", "5", "6", "7"], correct: 1, category: "sport" },
        { question: "В каком виде спорта используется ракетка и волан?", answers: ["Теннис", "Бадминтон", "Настольный теннис", "Сквош"], correct: 1, category: "sport" },
        
        // ГЕОГРАФИЯ (10 вопросов)
        { question: "Какая самая длинная река в мире?", answers: ["Амазонка", "Нил", "Янцзы", "Миссисипи"], correct: 0, category: "geography" },
        { question: "В какой стране находится Эйфелева башня?", answers: ["Италия", "Франция", "Испания", "Германия"], correct: 1, category: "geography" },
        { question: "Какая самая большая страна в мире?", answers: ["Китай", "США", "Россия", "Канада"], correct: 2, category: "geography" },
        { question: "Как называется столица Японии?", answers: ["Сеул", "Пекин", "Токио", "Бангкок"], correct: 2, category: "geography" },
        { question: "Какая пустыня самая большая в мире?", answers: ["Сахара", "Гоби", "Аравийская", "Калахари"], correct: 0, category: "geography" },
        { question: "В каком океане находятся Гавайские острова?", answers: ["Атлантический", "Индийский", "Тихий", "Северный Ледовитый"], correct: 2, category: "geography" },
        { question: "Какая гора является самой высокой в мире?", answers: ["Килиманджаро", "Эверест", "Монблан", "Аконкагуа"], correct: 1, category: "geography" },
        { question: "Как называется самая длинная горная цепь в мире?", answers: ["Альпы", "Анды", "Гималаи", "Скалистые горы"], correct: 1, category: "geography" },
        { question: "В какой стране находится Колизей?", answers: ["Греция", "Италия", "Турция", "Египет"], correct: 1, category: "geography" },
        { question: "Какое озеро самое глубокое в мире?", answers: ["Байкал", "Верхнее", "Виктория", "Танганьика"], correct: 0, category: "geography" },
        
        // КИНО (10 вопросов)
        { question: "Как звали главного героя фильма 'Титаник'?", answers: ["Джек", "Том", "Гарри", "Ричард"], correct: 0, category: "movies" },
        { question: "Кто сыграл роль Гарри Поттера?", answers: ["Дэниел Рэдклифф", "Руперт Гринт", "Эмма Уотсон", "Том Фелтон"], correct: 0, category: "movies" },
        { question: "Какой фильм получил 11 Оскаров?", answers: ["Титаник", "Властелин колец", "Бен-Гур", "Все варианты"], correct: 3, category: "movies" },
        { question: "Кто режиссер фильма 'Крестный отец'?", answers: ["Стивен Спилберг", "Фрэнсис Форд Коппола", "Мартин Скорсезе", "Квентин Тарантино"], correct: 1, category: "movies" },
        { question: "Как звали собаку в фильме 'Маска'?", answers: ["Рекс", "Майло", "Бак", "Шарик"], correct: 1, category: "movies" },
        { question: "Кто сыграл Терминатора?", answers: ["Сильвестр Сталлоне", "Арнольд Шварценеггер", "Брюс Уиллис", "Джеки Чан"], correct: 1, category: "movies" },
        { question: "Какой фильм стал первым полнометражным мультфильмом Disney?", answers: ["Белоснежка", "Пиноккио", "Дамбо", "Бэмби"], correct: 0, category: "movies" },
        { question: "Кто сыграл Нео в 'Матрице'?", answers: ["Киану Ривз", "Лоуренс Фишберн", "Хьюго Уивинг", "Кэрри-Энн Мосс"], correct: 0, category: "movies" },
        { question: "Какой фильм с Леонардо ДиКаприо о ловце снов?", answers: ["Начало", "Выживший", "Волк с Уолл-стрит", "Великий Гэтсби"], correct: 0, category: "movies" },
        { question: "Кто режиссер фильма 'Пианист'?", answers: ["Стивен Спилберг", "Роман Полански", "Кристофер Нолан", "Дэвид Финчер"], correct: 1, category: "movies" },
        
        // МУЗЫКА (10 вопросов)
        { question: "Кто является 'королем поп-музыки'?", answers: ["Элвис Пресли", "Майкл Джексон", "Принс", "Фредди Меркьюри"], correct: 1, category: "music" },
        { question: "Какой инструмент имеет 88 клавиш?", answers: ["Гитара", "Скрипка", "Пианино", "Аккордеон"], correct: 2, category: "music" },
        { question: "Кто написал песню 'Yesterday'?", answers: ["The Rolling Stones", "The Beatles", "Queen", "ABBA"], correct: 1, category: "music" },
        { question: "Какой композитор написал 'Времена года'?", answers: ["Бах", "Моцарт", "Вивальди", "Бетховен"], correct: 2, category: "music" },
        { question: "Кто пел 'Богемскую рапсодию'?", answers: ["Queen", "The Beatles", "Led Zeppelin", "Pink Floyd"], correct: 0, category: "music" },
        { question: "Сколько струн у классической гитары?", answers: ["4", "6", "7", "8"], correct: 1, category: "music" },
        { question: "Кто автор оперы 'Евгений Онегин'?", answers: ["Чайковский", "Мусоргский", "Римский-Корсаков", "Глинка"], correct: 0, category: "music" },
        { question: "Какой российский певец известен как 'Золотой голос России'?", answers: ["Филипп Киркоров", "Николай Басков", "Дима Билан", "Григорий Лепс"], correct: 1, category: "music" },
        { question: "Кто написал песню 'Калинка'?", answers: ["Народная", "Чайковский", "Рахманинов", "Глинка"], correct: 0, category: "music" },
        { question: "Какой музыкальный стиль создал Луи Армстронг?", answers: ["Рок", "Джаз", "Блюз", "Кантри"], correct: 1, category: "music" },
        
        // ЛИТЕРАТУРА (10 вопросов)
        { question: "Кто написал 'Войну и мир'?", answers: ["Достоевский", "Толстой", "Чехов", "Тургенев"], correct: 1, category: "literature" },
        { question: "Как звали собаку Баскервилей?", answers: ["Рекс", "Шерлок", "Баскервиль", "Не было собаки"], correct: 2, category: "literature" },
        { question: "Кто автор 'Гарри Поттера'?", answers: ["Джон Толкин", "Джоан Роулинг", "Клайв Льюис", "Джордж Мартин"], correct: 1, category: "literature" },
        { question: "Как называется роман о Робинзоне Крузо?", answers: ["Остров сокровищ", "Робинзон Крузо", "Путешествия Гулливера", "Дон Кихот"], correct: 1, category: "literature" },
        { question: "Кто написал 'Преступление и наказание'?", answers: ["Толстой", "Достоевский", "Гоголь", "Пушкин"], correct: 1, category: "literature" },
        { question: "Какой поэт погиб на дуэли?", answers: ["Лермонтов", "Пушкин", "Некрасов", "Блок"], correct: 1, category: "literature" },
        { question: "Кто автор 'Трех мушкетеров'?", answers: ["Дюма", "Гюго", "Жюль Верн", "Стендаль"], correct: 0, category: "literature" },
        { question: "Какой роман написал Михаил Булгаков?", answers: ["Доктор Живаго", "Мастер и Маргарита", "Тихий Дон", "12 стульев"], correct: 1, category: "literature" },
        { question: "Кто написал 'Алису в Стране чудес'?", answers: ["Льюис Кэрролл", "Редьярд Киплинг", "Марк Твен", "Роберт Стивенсон"], correct: 0, category: "literature" },
        { question: "Какой русский писатель был также врачом?", answers: ["Чехов", "Тургенев", "Гончаров", "Салтыков-Щедрин"], correct: 0, category: "literature" }
    ],
    
    medium: [
        // Средние вопросы...
        { question: "Какой химический элемент обозначается символом 'Au'?", answers: ["Серебро", "Золото", "Алюминий", "Аргон"], correct: 1, category: "science" },
        { question: "Сколько градусов в прямом угле?", answers: ["45", "90", "180", "360"], correct: 1, category: "general" },
        { question: "Какое число в римской системе обозначается как 'M'?", answers: ["100", "500", "1000", "5000"], correct: 2, category: "general" },
        { question: "В каком году была подписана Великая хартия вольностей?", answers: ["1066", "1215", "1453", "1649"], correct: 1, category: "history" },
        { question: "Кто был первым императором России?", answers: ["Петр I", "Иван IV", "Павел I", "Александр I"], correct: 0, category: "history" },
        { question: "Кто написал оперу 'Кольцо Нибелунга'?", answers: ["Бетховен", "Моцарт", "Вагнер", "Бах"], correct: 2, category: "culture" },
        { question: "В какой стране возникло искусство оригами?", answers: ["Китай", "Япония", "Кореа", "Вьетнам"], correct: 1, category: "culture" },
        { question: "Какая страна имеет самое большое население в мире?", answers: ["Индия", "США", "Китай", "Индонезия"], correct: 2, category: "geography" },
        { question: "Какой город является самым северным в мире?", answers: ["Мурманск", "Тромсё", "Рейкьявик", "Барроу"], correct: 3, category: "geography" },
        { question: "Кто режиссер фильма 'Крестный отец'?", answers: ["Стивен Спилберг", "Фрэнсис Форд Коппола", "Мартин Скорсезе", "Квентин Тарантино"], correct: 1, category: "movies" },
    ],
    
    hard: [
        // Сложные вопросы...
        { question: "Кто был последним императором России?", answers: ["Александр II", "Александр III", "Николай I", "Николай II"], correct: 3, category: "history" },
        { question: "Какой композитор написал 9 симфоний и умер, не закончив 10-ю?", answers: ["Бетховен", "Моцарт", "Бах", "Чайковский"], correct: 0, category: "music" },
        { question: "Какое озеро является самым соленым в мире?", answers: ["Мертвое море", "Байкал", "Каспийское море", "Большое Соленое озеро"], correct: 0, category: "geography" },
        { question: "Какой писатель получил Нобелевскую премию по литературе в 1965 году?", answers: ["Михаил Шолохов", "Борис Пастернак", "Иван Бунин", "Александр Солженицын"], correct: 0, category: "literature" },
        { question: "В каком году была снята первая серия 'Звездных войн'?", answers: ["1975", "1977", "1980", "1983"], correct: 1, category: "movies" },
    ]
};

// Иконки и названия категорий
const CATEGORIES = {
    general: { name: "Общее", icon: "fas fa-globe", color: "#6366f1" },
    science: { name: "Наука", icon: "fas fa-flask", color: "#10b981" },
    history: { name: "История", icon: "fas fa-landmark", color: "#f59e0b" },
    culture: { name: "Культура", icon: "fas fa-palette", color: "#8b5cf6" },
    sport: { name: "Спорт", icon: "fas fa-futbol", color: "#ef4444" },
    geography: { name: "География", icon: "fas fa-map", color: "#06b6d4" },
    movies: { name: "Кино", icon: "fas fa-film", color: "#ec4899" },
    music: { name: "Музыка", icon: "fas fa-music", color: "#84cc16" },
    literature: { name: "Литература", icon: "fas fa-book", color: "#f97316" }
};

// Достижения
const ACHIEVEMENTS = [
    {
        id: "first_game",
        name: "Первый шаг",
        description: "Завершите первую викторину",
        icon: "fas fa-play-circle"
    },
    {
        id: "perfect_score",
        name: "Идеально!",
        description: "Ответьте правильно на все вопросы",
        icon: "fas fa-star"
    },
    {
        id: "speed_run",
        name: "Скорость",
        description: "Завершите викторину менее чем за 5 минут",
        icon: "fas fa-bolt"
    },
    {
        id: "streak_10",
        name: "Серия мастер",
        description: "10 правильных ответов подряд",
        icon: "fas fa-fire"
    },
    {
        id: "all_categories",
        name: "Эрудит",
        description: "Сыграйте во всех категориях",
        icon: "fas fa-trophy"
    }
];
