// Вопросы для викторины
const QUIZ_QUESTIONS = {
    easy: [
        { question: "Сколько континентов на Земле?", answers: ["5", "6", "7", "8"], correct: 2, category: "general" },
        { question: "Какая планета известна как 'Красная планета'?", answers: ["Венера", "Марс", "Юпитер", "Сатурн"], correct: 1, category: "science" },
        { question: "В каком году человек впервые полетел в космос?", answers: ["1957", "1961", "1969", "1975"], correct: 1, category: "history" },
        { question: "Кто написал картину 'Мона Лиза'?", answers: ["Микеланджело", "Рафаэль", "Леонардо да Винчи", "Рембрандт"], correct: 2, category: "culture" },
        { question: "Сколько игроков в футбольной команде на поле?", answers: ["9", "10", "11", "12"], correct: 2, category: "sport" },
        { question: "Какая самая длинная река в мире?", answers: ["Амазонка", "Нил", "Янцзы", "Миссисипи"], correct: 0, category: "geography" },
        { question: "Как звали главного героя фильма 'Титаник'?", answers: ["Джек", "Том", "Гарри", "Ричард"], correct: 0, category: "movies" },
        { question: "Кто является 'королем поп-музыки'?", answers: ["Элвис Пресли", "Майкл Джексон", "Принс", "Фредди Меркьюри"], correct: 1, category: "music" },
        { question: "Кто написал 'Войну и мир'?", answers: ["Достоевский", "Толстой", "Чехов", "Тургенев"], correct: 1, category: "literature" },
        { question: "Какой цвет получится при смешении синего и желтого?", answers: ["Фиолетовый", "Оранжевый", "Зеленый", "Коричневый"], correct: 2, category: "general" },
    ],
    medium: [
        { question: "Какой химический элемент обозначается символом 'Au'?", answers: ["Серебро", "Золото", "Алюминий", "Аргон"], correct: 1, category: "science" },
        { question: "Кто был первым президентом США?", answers: ["Томас Джефферсон", "Джордж Вашингтон", "Авраам Линкольн", "Бенджамин Франклин"], correct: 1, category: "history" },
    ],
    hard: [
        { question: "Какое число в римской системе обозначается как 'M'?", answers: ["100", "500", "1000", "5000"], correct: 2, category: "general" },
        { question: "Сколько хромосом у здорового человека?", answers: ["23", "46", "64", "92"], correct: 1, category: "science" },
    ]
};

// Категории
const CATEGORIES = {
    general: "Общее",
    science: "Наука", 
    history: "История",
    culture: "Культура",
    sport: "Спорт",
    geography: "География",
    movies: "Кино",
    music: "Музыка",
    literature: "Литература"
};
