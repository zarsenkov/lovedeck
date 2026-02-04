// База данных слов для Алиас
const aliasDatabase = {
    common: [
        { word: "Солнце", forbidden: ["солнечный", "свет", "день", "луна"] },
        { word: "Луна", forbidden: ["лунный", "ночь", "месяц", "солнце"] },
        { word: "Звезда", forbidden: ["звездный", "небо", "созвездие", "планета"] },
        { word: "Дождь", forbidden: ["дождливый", "вода", "ливень", "погода"] },
        { word: "Снег", forbidden: ["снежный", "зима", "лед", "пушистый"] },
        { word: "Ветер", forbidden: ["ветреный", "воздух", "дуть", "шторм"] },
        { word: "Огонь", forbidden: ["огненный", "пламя", "гореть", "костер"] },
        { word: "Вода", forbidden: ["водный", "жидкость", "море", "река"] },
        { word: "Земля", forbidden: ["земной", "планета", "почва", "грязь"] },
        { word: "Воздух", forbidden: ["воздушный", "атмосфера", "дышать", "кислород"] },
        { word: "Дом", forbidden: ["домашний", "жилище", "квартира", "здание"] },
        { word: "Дорога", forbidden: ["дорожный", "путь", "шоссе", "асфальт"] },
        { word: "Город", forbidden: ["городской", "мегаполис", "столица", "улица"] },
        { word: "Дерево", forbidden: ["деревянный", "растение", "лес", "ствол"] },
        { word: "Цветок", forbidden: ["цветочный", "растение", "букет", "лепесток"] },
        { word: "Птица", forbidden: ["птичий", "пернатый", "летать", "гнездо"] },
        { word: "Рыба", forbidden: ["рыбный", "плавать", "аквариум", "чешуя"] },
        { word: "Животное", forbidden: ["животный", "зверь", "млекопитающее", "дикий"] },
        { word: "Человек", forbidden: ["человеческий", "личность", "индивид", "народ"] },
        { word: "Семья", forbidden: ["семейный", "родственники", "родители", "дети"] }
    ],
    
    objects: [
        { word: "Стол", forbidden: ["столешница", "мебель", "обеденный", "парта"] },
        { word: "Стул", forbidden: ["стульчик", "сиденье", "мебель", "табурет"] },
        { word: "Книга", forbidden: ["книжный", "литература", "страница", "библиотека"] },
        { word: "Телефон", forbidden: ["телефонный", "звонить", "смартфон", "мобильный"] },
        { word: "Компьютер", forbidden: ["компьютерный", "ноутбук", "монитор", "клавиатура"] },
        { word: "Часы", forbidden: ["часовой", "время", "циферблат", "будильник"] },
        { word: "Очки", forbidden: ["очковый", "линзы", "зрение", "солнечные"] },
        { word: "Ключ", forbidden: ["ключевой", "замок", "открывать", "дверной"] },
        { word: "Замок", forbidden: ["замочный", "ключ", "дверь", "запирать"] },
        { word: "Окно", forbidden: ["оконный", "стекло", "рама", "подоконник"] },
        { word: "Дверь", forbidden: ["дверной", "проход", "открывать", "ручка"] },
        { word: "Зеркало", forbidden: ["зеркальный", "отражение", "смотреться", "стекло"] },
        { word: "Посуда", forbidden: ["посудный", "тарелка", "кухня", "столовая"] },
        { word: "Лампа", forbidden: ["ламповый", "свет", "торшер", "лампочка"] },
        { word: "Кровать", forbidden: ["кроватный", "спать", "матрас", "постель"] },
        { word: "Шкаф", forbidden: ["шкафной", "хранить", "одежда", "гардероб"] },
        { word: "Сумка", forbidden: ["сумочный", "носить", "портфель", "рюкзак"] },
        { word: "Обувь", forbidden: ["обувной", "ботинки", "туфли", "носить"] },
        { word: "Одежда", forbidden: ["одежный", "костюм", "платье", "носить"] },
        { word: "Игрушка", forbidden: ["игрушечный", "ребенок", "играть", "кукла"] }
    ],
    
    actions: [
        { word: "Бежать", forbidden: ["бег", "беговой", "скорость", "марафон"] },
        { word: "Прыгать", forbidden: ["прыжок", "прыгающий", "высота", "скакать"] },
        { word: "Плавать", forbidden: ["плавание", "пловец", "вода", "бассейн"] },
        { word: "Летать", forbidden: ["полет", "летающий", "самолет", "птица"] },
        { word: "Говорить", forbidden: ["разговор", "говорящий", "речь", "общаться"] },
        { word: "Слушать", forbidden: ["слушатель", "слуховой", "ухо", "внимать"] },
        { word: "Смотреть", forbidden: ["смотрение", "зритель", "глаз", "наблюдать"] },
        { word: "Читать", forbidden: ["чтение", "читатель", "книга", "буквы"] },
        { word: "Писать", forbidden: ["письмо", "писатель", "ручка", "текст"] },
        { word: "Рисовать", forbidden: ["рисунок", "художник", "краски", "карандаш"] },
        { word: "Петь", forbidden: ["пение", "певец", "песня", "музыка"] },
        { word: "Танцевать", forbidden: ["танец", "танцор", "движение", "музыка"] },
        { word: "Смеяться", forbidden: ["смех", "смешной", "веселый", "юмор"] },
        { word: "Плакать", forbidden: ["плач", "слезы", "грустный", "расстраиваться"] },
        { word: "Спать", forbidden: ["сон", "спящий", "кровать", "отдых"] },
        { word: "Есть", forbidden: ["еда", "питание", "кушать", "продукты"] },
        { word: "Пить", forbidden: ["питье", "напиток", "жидкость", "вода"] },
        { word: "Работать", forbidden: ["работа", "работник", "труд", "занятие"] },
        { word: "Учиться", forbidden: ["учение", "ученик", "знания", "школа"] },
        { word: "Играть", forbidden: ["игра", "игрок", "развлечение", "забава"] }
    ],
    
    people: [
        { word: "Врач", forbidden: ["медицинский", "доктор", "лечить", "больница"] },
        { word: "Учитель", forbidden: ["учительский", "преподаватель", "школа", "урок"] },
        { word: "Инженер", forbidden: ["инженерный", "техник", "проектировать", "строительство"] },
        { word: "Программист", forbidden: ["программирование", "код", "компьютер", "разработчик"] },
        { word: "Художник", forbidden: ["художественный", "рисовать", "картина", "творчество"] },
        { word: "Музыкант", forbidden: ["музыкальный", "играть", "инструмент", "оркестр"] },
        { word: "Актер", forbidden: ["актерский", "играть", "театр", "роль"] },
        { word: "Повар", forbidden: ["кулинарный", "готовить", "еда", "ресторан"] },
        { word: "Строитель", forbidden: ["строительный", "строить", "дом", "работа"] },
        { word: "Водитель", forbidden: ["водительский", "ехать", "машина", "дорога"] },
        { word: "Летчик", forbidden: ["летный", "самолет", "небо", "пилот"] },
        { word: "Моряк", forbidden: ["морской", "корабль", "море", "плавать"] },
        { word: "Полицейский", forbidden: ["полицейский", "закон", "охранять", "порядок"] },
        { word: "Пожарный", forbidden: ["пожарный", "огонь", "тушить", "спасать"] },
        { word: "Спортсмен", forbidden: ["спортивный", "спорт", "тренироваться", "соревнование"] },
        { word: "Ученый", forbidden: ["научный", "исследовать", "лаборатория", "открытие"] },
        { word: "Писатель", forbidden: ["литературный", "писать", "книга", "роман"] },
        { word: "Журналист", forbidden: ["журналистский", "новости", "репортер", "газета"] },
        { word: "Бизнесмен", forbidden: ["бизнес", "предприниматель", "компания", "деньги"] },
        { word: "Фермер", forbidden: ["фермерский", "сельское хозяйство", "земля", "животные"] }
    ],
    
    nature: [
        { word: "Гора", forbidden: ["горный", "вершина", "скала", "высота"] },
        { word: "Река", forbidden: ["речной", "вода", "течение", "берег"] },
        { word: "Озеро", forbidden: ["озерный", "вода", "берег", "пруд"] },
        { word: "Море", forbidden: ["морской", "океан", "вода", "волна"] },
        { word: "Лес", forbidden: ["лесной", "деревья", "тайга", "роща"] },
                { word: "Пустыня", forbidden: ["пустынный", "песок", "жара", "верблюд"] },
        { word: "Вулкан", forbidden: ["вулканический", "лава", "извержение", "гора"] },
        { word: "Водопад", forbidden: ["водопадный", "вода", "падать", "река"] },
        { word: "Пещера", forbidden: ["пещерный", "грот", "темнота", "сталактит"] },
        { word: "Остров", forbidden: ["островной", "море", "земля", "пляж"] },
        { word: "Пляж", forbidden: ["пляжный", "песок", "море", "отдых"] },
        { word: "Джунгли", forbidden: ["джунглевый", "тропики", "лианы", "обезьяна"] },
        { word: "Тундра", forbidden: ["тундровый", "холод", "север", "олень"] },
        { word: "Степь", forbidden: ["степной", "равнина", "трава", "ковыль"] },
        { word: "Лев", forbidden: ["львиный", "кошка", "грива", "царь зверей"] },
        { word: "Слон", forbidden: ["слоновый", "хобот", "бивни", "большой"] },
        { word: "Тигр", forbidden: ["тигриный", "кошка", "полоски", "хищник"] },
        { word: "Медведь", forbidden: ["медвежий", "бурый", "берлога", "косолапый"] },
        { word: "Волк", forbidden: ["волчий", "стая", "хищник", "вой"] },
        { word: "Лиса", forbidden: ["лисий", "хитрый", "рыжий", "нора"] },
        { word: "Заяц", forbidden: ["заячий", "кролик", "уши", "прыгать"] },
        { word: "Орел", forbidden: ["орлиный", "птица", "хищник", "клюв"] },
        { word: "Дельфин", forbidden: ["дельфиний", "море", "млекопитающее", "умный"] },
        { word: "Кит", forbidden: ["китовый", "море", "большой", "млекопитающее"] },
        { word: "Бабочка", forbidden: ["бабочкин", "насекомое", "крылья", "гусеница"] }
    ],
    
    food: [
        { word: "Яблоко", forbidden: ["яблочный", "фрукт", "дерево", "красное"] },
        { word: "Банан", forbidden: ["банановый", "фрукт", "желтый", "тропический"] },
        { word: "Апельсин", forbidden: ["апельсиновый", "цитрус", "оранжевый", "фрукт"] },
        { word: "Хлеб", forbidden: ["хлебный", "булка", "мука", "печь"] },
        { word: "Сыр", forbidden: ["сырный", "молочный", "твердый", "плавленый"] },
        { word: "Молоко", forbidden: ["молочный", "коровье", "пить", "белое"] },
        { word: "Мясо", forbidden: ["мясной", "говядина", "курица", "свинина"] },
        { word: "Рыба", forbidden: ["рыбный", "морепродукт", "плавать", "чешуя"] },
        { word: "Овощи", forbidden: ["овощной", "морковь", "помидор", "огород"] },
        { word: "Суп", forbidden: ["суповой", "бульон", "жидкий", "тарелка"] },
        { word: "Салат", forbidden: ["салатный", "овощи", "миска", "заправка"] },
        { word: "Торт", forbidden: ["тортовый", "десерт", "сладкий", "день рождения"] },
        { word: "Шоколад", forbidden: ["шоколадный", "сладкий", "какао", "плитка"] },
        { word: "Кофе", forbidden: ["кофейный", "напиток", "зерна", "бодрящий"] },
        { word: "Чай", forbidden: ["чайный", "напиток", "заваривать", "чайник"] },
        { word: "Сок", forbidden: ["соковый", "напиток", "фруктовый", "выжимать"] },
        { word: "Вода", forbidden: ["водный", "питьевая", "жидкость", "минеральная"] },
        { word: "Пицца", forbidden: ["пиццерия", "итальянская", "тесто", "начинка"] },
        { word: "Бургер", forbidden: ["бургерный", "гамбургер", "булка", "котлета"] },
        { word: "Суши", forbidden: ["суши-бар", "японское", "рис", "рыба"] }
    ]
};

// Настройки игры
const gameSettings = {
    timePerRound: 120, // секунд
    wordsPerRound: 30,
    teamsCount: 2,
    selectedCategories: ['common', 'objects', 'actions'],
    skipPenalty: true,
    sameRootPenalty: true,
    soundEffects: true,
    vibration: true
};

// История игр
let gameHistory = JSON.parse(localStorage.getItem('aliasHistory')) || [];

// Статистика
let gameStats = JSON.parse(localStorage.getItem('aliasStats')) || {
    totalGames: 0,
    totalWords: 0,
    totalScore: 0,
    totalTime: 0,
    byCategory: {
        common: { played: 0, words: 0 },
        objects: { played: 0, words: 0 },
        actions: { played: 0, words: 0 },
        people: { played: 0, words: 0 },
        nature: { played: 0, words: 0 },
        food: { played: 0, words: 0 }
    }
};

// Команды
let teams = JSON.parse(localStorage.getItem('aliasTeams')) || [
    { id: 1, name: "Красные", color: "#EF4444", score: 0, players: [] },
    { id: 2, name: "Синие", color: "#3B82F6", score: 0, players: [] }
];

// Текущая игра
let currentGame = {
    id: null,
    teams: [],
    rounds: [],
    currentRound: 0,
    currentTeamIndex: 0,
    status: 'setup', // 'setup', 'playing', 'paused', 'finished'
    startTime: null,
    endTime: null,
    settings: { ...gameSettings }
};

// Текущий раунд
let currentRound = {
    teamId: null,
    startTime: null,
    endTime: null,
    words: [],
    currentWordIndex: 0,
    score: 0,
    guessed: 0,
    skipped: 0,
    wrong: 0
};

// Функции для работы с данными
function getWordsForRound(count, categories) {
    let allWords = [];
    
    // Собираем слова из выбранных категорий
    categories.forEach(category => {
        if (aliasDatabase[category]) {
            allWords = allWords.concat(
                aliasDatabase[category].map(word => ({
                    ...word,
                    category: category
                }))
            );
        }
    });
    
    // Перемешиваем слова
    allWords = shuffleArray(allWords);
    
    // Берем нужное количество
    return allWords.slice(0, count);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getCategoryName(category) {
    const names = {
        common: "Общие слова",
        objects: "Предметы",
        actions: "Действия",
        people: "Люди и профессии",
        nature: "Природа и животные",
        food: "Еда и напитки"
    };
    return names[category] || category;
}

function saveGameHistory() {
    const gameRecord = {
        id: currentGame.id,
        date: new Date().toISOString(),
        teams: currentGame.teams,
        rounds: currentGame.rounds,
        settings: currentGame.settings,
        totalScore: currentGame.teams.reduce((sum, team) => sum + team.score, 0),
        winner: getWinnerTeam()
    };
    
    gameHistory.unshift(gameRecord);
    
    // Сохраняем только последние 50 игр
    if (gameHistory.length > 50) {
        gameHistory = gameHistory.slice(0, 50);
    }
    
    localStorage.setItem('aliasHistory', JSON.stringify(gameHistory));
    
    // Обновляем статистику
    updateStats();
}

function updateStats() {
    gameStats.totalGames++;
    
    // Считаем слова
    let totalWords = 0;
    currentGame.rounds.forEach(round => {
        totalWords += round.words.length;
        const category = round.words[0]?.category;
        if (category && gameStats.byCategory[category]) {
            gameStats.byCategory[category].played++;
            gameStats.byCategory[category].words += round.words.length;
        }
    });
    
    gameStats.totalWords += totalWords;
    gameStats.totalScore += currentGame.teams.reduce((sum, team) => sum + team.score, 0);
    
    // Время игры
    if (currentGame.startTime && currentGame.endTime) {
        const timeSpent = Math.floor((currentGame.endTime - currentGame.startTime) / 1000 / 60); // в минутах
        gameStats.totalTime += timeSpent;
    }
    
    localStorage.setItem('aliasStats', JSON.stringify(gameStats));
}

function getStats() {
    return gameStats;
}

function getHistory() {
    return gameHistory;
}

function clearHistory() {
    gameHistory = [];
    localStorage.setItem('aliasHistory', JSON.stringify(gameHistory));
}

function clearStats() {
    gameStats = {
        totalGames: 0,
        totalWords: 0,
        totalScore: 0,
        totalTime: 0,
        byCategory: {
            common: { played: 0, words: 0 },
            objects: { played: 0, words: 0 },
            actions: { played: 0, words: 0 },
            people: { played: 0, words: 0 },
            nature: { played: 0, words: 0 },
            food: { played: 0, words: 0 }
        }
    };
    localStorage.setItem('aliasStats', JSON.stringify(gameStats));
}

function getTeams() {
    return teams;
}

function saveTeams() {
    localStorage.setItem('aliasTeams', JSON.stringify(teams));
}

function addTeam(name, color) {
    const newTeam = {
        id: teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1,
        name: name,
        color: color,
        score: 0,
        players: []
    };
    
    teams.push(newTeam);
    saveTeams();
    return newTeam;
}

function removeTeam(id) {
    teams = teams.filter(team => team.id !== id);
    saveTeams();
}

function updateTeam(id, updates) {
    const teamIndex = teams.findIndex(team => team.id === id);
    if (teamIndex !== -1) {
        teams[teamIndex] = { ...teams[teamIndex], ...updates };
        saveTeams();
    }
}

function getWinnerTeam() {
    if (currentGame.teams.length === 0) return null;
    
    let winner = currentGame.teams[0];
    for (let i = 1; i < currentGame.teams.length; i++) {
        if (currentGame.teams[i].score > winner.score) {
            winner = currentGame.teams[i];
        }
    }
    
    return winner;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function calculateAccuracy(guessed, skipped, wrong) {
    const total = guessed + skipped + wrong;
    if (total === 0) return 0;
    return Math.round((guessed / total) * 100);
}

function calculateWPM(guessed, timeSpent) {
    if (timeSpent === 0) return 0;
    const minutes = timeSpent / 60;
    return Math.round(guessed / minutes);
}