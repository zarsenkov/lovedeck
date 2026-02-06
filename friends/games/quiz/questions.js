const QUIZ_QUESTIONS = {
    easy: [
        { question: "Сколько континентов на Земле?", answers: ["5", "6", "7", "8"], correct: 2, category: "geography" },
        { question: "Какая планета известна как 'Красная планета'?", answers: ["Венера", "Марс", "Юпитер", "Сатурн"], correct: 1, category: "science" },
        { question: "В каком году Гагарин полетел в космос?", answers: ["1957", "1961", "1969", "1975"], correct: 1, category: "history" },
        { question: "Кто написал картину 'Мона Лиза'?", answers: ["Микеланджело", "Рафаэль", "Леонардо да Винчи", "Рембрандт"], correct: 2, category: "culture" },
        { question: "Сколько игроков в футбольной команде на поле?", answers: ["9", "10", "11", "12"], correct: 2, category: "sport" },
        { question: "Какая самая длинная река в мире?", answers: ["Амазонка", "Нил", "Янцзы", "Миссисипи"], correct: 0, category: "geography" },
        { question: "Как звали главного героя фильма 'Титаник'?", answers: ["Джек", "Том", "Гарри", "Ричард"], correct: 0, category: "movies" },
        { question: "Кто является 'королем поп-музыки'?", answers: ["Элвис Пресли", "Майкл Джексон", "Принс", "Фредди Меркьюри"], correct: 1, category: "music" },
        { question: "Кто написал 'Войну и мир'?", answers: ["Достоевский", "Толстой", "Чехов", "Тургенев"], correct: 1, category: "literature" },
        { question: "Цвет при смешении синего и желтого?", answers: ["Фиолетовый", "Оранжевый", "Зеленый", "Коричневый"], correct: 2, category: "general" }
    ],
    medium: [
        { question: "Химический символ золота?", answers: ["Ag", "Au", "Al", "Fe"], correct: 1, category: "science" },
        { question: "Первый президент США?", answers: ["Джефферсон", "Вашингтон", "Линкольн", "Франклин"], correct: 1, category: "history" },
        { question: "В каком городе находятся пирамиды Гизы?", answers: ["Каир", "Луксор", "Александрия", "Хургада"], correct: 0, category: "geography" },
        { question: "Столица Австралии?", answers: ["Сидней", "Мельбурн", "Канберра", "Перт"], correct: 2, category: "geography" }
    ],
    hard: [
        { question: "Римская цифра 'M' — это какое число?", answers: ["100", "500", "1000", "5000"], correct: 2, category: "general" },
        { question: "Кто открыл закон всемирного тяготения?", answers: ["Галилей", "Эйнштейн", "Ньютон", "Кеплер"], correct: 2, category: "science" }
    ]
};
