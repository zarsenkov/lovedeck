// База данных вопросов (сокращенная версия)
const quizDatabase = {
    general: {
        name: "Общие знания",
        icon: "fas fa-globe",
        color: "#4F46E5",
        questions: [
            {
                question: "Сколько дней в високосном году?",
                answers: ["365", "366", "364", "367"],
                correct: 1,
                explanation: "В високосном году 366 дней. Добавляется 29 февраля.",
                difficulty: "easy",
                points: 10
            },
            {
                question: "Какая планета известна как 'Красная планета'?",
                answers: ["Венера", "Марс", "Юпитер", "Сатурн"],
                correct: 1,
                explanation: "Марс называют 'Красной планетой' из-за цвета его поверхности.",
                difficulty: "medium",
                points: 20
            },
            {
                question: "Какой элемент имеет атомный номер 1?",
                answers: ["Гелий", "Водород", "Кислород", "Углерод"],
                correct: 1,
                explanation: "Водород имеет атомный номер 1 в периодической таблице.",
                difficulty: "hard",
                points: 30
            }
        ]
    },
    
    science: {
        name: "Наука",
        icon: "fas fa-flask",
        color: "#10B981",
        questions: [
            {
                question: "Какая планета ближе всего к Солнцу?",
                answers: ["Венера", "Меркурий", "Земля", "Марс"],
                correct: 1,
                explanation: "Меркурий — ближайшая к Солнцу планета.",
                difficulty: "easy",
                points: 10
            },
            {
                question: "Сколько хромосом у человека?",
                answers: ["23", "46", "48", "50"],
                correct: 1,
                explanation: "У человека 46 хромосом (23 пары).",
                difficulty: "medium",
                points: 20
            },
            {
                question: "Кто разработал теорию относительности?",
                answers: ["Ньютон", "Эйнштейн", "Хокинг", "Бор"],
                correct: 1,
                explanation: "Теорию относительности разработал Альберт Эйнштейн.",
                difficulty: "hard",
                points: 30
            }
        ]
    },
    
    history: {
        name: "История",
        icon: "fas fa-landmark",
        color: "#F59E0B",
        questions: [
            {
                question: "Кто был первым президентом США?",
                answers: ["Авраам Линкольн", "Джордж Вашингтон", "Томас Джефферсон", "Бенджамин Франклин"],
                correct: 1,
                explanation: "Джордж Вашингтон был первым президентом США.",
                difficulty: "easy",
                points: 10
            },
            {
                question: "В каком году пала Берлинская стена?",
                answers: ["1987", "1989", "1991", "1993"],
                correct: 1,
                explanation: "Берлинская стена пала 9 ноября 1989 года.",
                difficulty: "medium",
                points: 20
            },
            {
                question: "Кто был фараоном во время Исхода?",
                answers: ["Рамзес II", "Тутанхамон", "Хеопс", "Клеопатра"],
                correct: 0,
                explanation: "Согласно Библии, фараоном во время Исхода был Рамзес II.",
                difficulty: "hard",
                points: 30
            }
        ]
    }
};

// Настройки игры
let gameSettings = JSON.parse(localStorage.getItem('quizSettings')) || {
    sound: true,
    selectedCategories: ['general', 'science', 'history'],
    questionsCount: 10,
    difficulty: 'mixed'
};

// Статистика
let gameStats = JSON.parse(localStorage.getItem('quizStats')) || {
    gamesPlayed: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    totalPoints: 0,
    categoryStats: {}
};

// История игр
let gameHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];

// Текущая игра
let currentGame = null;

// Вспомогательные функции
function getRandomQuestions(category = 'mixed', difficulty = 'mixed', count = 10) {
    let allQuestions = [];
    
    if (category === 'mixed') {
        // Все категории
        Object.values(quizDatabase).forEach(cat => {
            allQuestions = allQuestions.concat(
                cat.questions.map(q => ({
                    ...q,
                    category: cat.name,
                    categoryId: Object.keys(quizDatabase).find(key => quizDatabase[key] === cat)
                }))
            );
        });
    } else {
        // Конкретная категория
        const cat = quizDatabase[category];
        if (cat) {
            allQuestions = cat.questions.map(q => ({
                ...q,
                category: cat.name,
                categoryId: category
            }));
        }
    }
    
    // Фильтрация по сложности
    if (difficulty !== 'mixed') {
        allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // Перемешиваем и берем нужное количество
    return shuffleArray(allQuestions).slice(0, count);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function saveStats() {
    localStorage.setItem('quizStats', JSON.stringify(gameStats));
    localStorage.setItem('quizHistory', JSON.stringify(gameHistory));
}

function updateStats(gameResult) {
    gameStats.gamesPlayed++;
    gameStats.correctAnswers += gameResult.correct;
    gameStats.totalQuestions += gameResult.total;
    gameStats.totalPoints += gameResult.score;
    
    // Статистика по категориям
    gameResult.categoryStats.forEach(stat => {
        if (!gameStats.categoryStats[stat.category]) {
            gameStats.categoryStats[stat.category] = { played: 0, correct: 0 };
        }
        gameStats.categoryStats[stat.category].played += stat.total;
        gameStats.categoryStats[stat.category].correct += stat.correct;
    });
    
    saveStats();
}

function getCategoryStats(categoryId) {
    const stats = gameStats.categoryStats[categoryId];
    if (stats) {
        const accuracy = stats.played > 0 ? Math.round((stats.correct / stats.played) * 100) : 0;
        return { ...stats, accuracy };
    }
    return { played: 0, correct: 0, accuracy: 0 };
}