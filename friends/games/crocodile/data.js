// База данных для игры "Крокодил" - современная версия
const CrocodileDatabase = {
    // Категории слов с иконками и цветами
    categories: [
        {
            id: 'animals',
            name: 'Животные',
            icon: 'fas fa-paw',
            color: '#f59e0b',
            description: 'Дикие и домашние животные',
            words: {
                easy: [
                    { word: 'Кошка', hint: 'Домашний питомец, мурлычет' },
                    { word: 'Собака', hint: 'Лучший друг человека' },
                    { word: 'Слон', hint: 'Большое животное с хоботом' },
                    { word: 'Лев', hint: 'Царь зверей' },
                    { word: 'Обезьяна', hint: 'Лазает по деревьям' }
                ],
                medium: [
                    { word: 'Кенгуру', hint: 'Прыгает, носит детёныша в сумке' },
                    { word: 'Пингвин', hint: 'Не летает, но отлично плавает' },
                    { word: 'Жираф', hint: 'Самое высокое животное' },
                    { word: 'Бегемот', hint: 'Толстокожее водное животное' },
                    { word: 'Носорог', hint: 'Большое животное с рогом' }
                ],
                hard: [
                    { word: 'Утконос', hint: 'Яйцекладущее млекопитающее' },
                    { word: 'Тапир', hint: 'Животное с хоботком' },
                    { word: 'Аксолотль', hint: 'Водная саламандра' },
                    { word: 'Нарвал', hint: 'Морской единорог' },
                    { word: 'Окапи', hint: 'Лесной жираф' }
                ]
            }
        },
        {
            id: 'objects',
            name: 'Предметы',
            icon: 'fas fa-box',
            color: '#3b82f6',
            description: 'Повседневные предметы и техника',
            words: {
                easy: [
                    { word: 'Стул', hint: 'На нём сидят' },
                    { word: 'Часы', hint: 'Показывают время' },
                    { word: 'Телефон', hint: 'Для звонков' },
                    { word: 'Книга', hint: 'Читают, перелистывают страницы' },
                    { word: 'Очки', hint: 'Помогают видеть' }
                ],
                medium: [
                    { word: 'Микроскоп', hint: 'Увеличивает мелкие объекты' },
                    { word: 'Компас', hint: 'Показывает направление' },
                    { word: 'Бинокль', hint: 'Для наблюдения вдали' },
                    { word: 'Весы', hint: 'Измеряют вес' },
                    { word: 'Термометр', hint: 'Измеряет температуру' }
                ],
                hard: [
                    { word: 'Сейсмограф', hint: 'Регистрирует землетрясения' },
                    { word: 'Астролябия', hint: 'Древний астрономический инструмент' },
                    { word: 'Катапульта', hint: 'Метательное оружие' },
                    { word: 'Спиннинг', hint: 'Удочка для рыбалки' },
                    { word: 'Манометр', hint: 'Измеряет давление' }
                ]
            }
        },
        {
            id: 'actions',
            name: 'Действия',
            icon: 'fas fa-running',
            color: '#10b981',
            description: 'Различные действия и занятия',
            words: {
                easy: [
                    { word: 'Бежать', hint: 'Быстро передвигаться' },
                    { word: 'Прыгать', hint: 'Отталкиваться от земли' },
                    { word: 'Плавать', hint: 'Двигаться в воде' },
                    { word: 'Танцевать', hint: 'Двигаться под музыку' },
                    { word: 'Спать', hint: 'Отдыхать с закрытыми глазами' }
                ],
                medium: [
                    { word: 'Жонглировать', hint: 'Подбрасывать несколько предметов' },
                    { word: 'Скалолазание', hint: 'Восхождение на скалы' },
                    { word: 'Парашютизм', hint: 'Прыжок с парашютом' },
                    { word: 'Сёрфинг', hint: 'Катание на волнах' },
                    { word: 'Фехтование', hint: 'Бой на рапирах' }
                ],
                hard: [
                    { word: 'Рецитировать', hint: 'Декламировать стихи' },
                    { word: 'Медитировать', hint: 'Практика сосредоточения' },
                    { word: 'Пантомима', hint: 'Искусство без слов' },
                    { word: 'Жонглировать словами', hint: 'Использовать сложные выражения' },
                    { word: 'Паркур', hint: 'Преодоление препятствий' }
                ]
            }
        },
        {
            id: 'professions',
            name: 'Профессии',
            icon: 'fas fa-briefcase',
            color: '#8b5cf6',
            description: 'Различные профессии и занятия',
            words: {
                easy: [
                    { word: 'Врач', hint: 'Лечит людей' },
                    { word: 'Учитель', hint: 'Обучает детей' },
                    { word: 'Повар', hint: 'Готовит еду' },
                    { word: 'Полицейский', hint: 'Охраняет порядок' },
                    { word: 'Строитель', hint: 'Строит дома' }
                ],
                medium: [
                    { word: 'Астронавт', hint: 'Летает в космос' },
                    { word: 'Археолог', hint: 'Изучает древности' },
                    { word: 'Вулканолог', hint: 'Изучает вулканы' },
                    { word: 'Сомелье', hint: 'Знаток вин' },
                    { word: 'Реставратор', hint: 'Восстанавливает старинные вещи' }
                ],
                hard: [
                    { word: 'Криптозоолог', hint: 'Ищет неизвестных животных' },
                    { word: 'Спелеолог', hint: 'Исследует пещеры' },
                    { word: 'Хормейстер', hint: 'Руководит хором' },
                    { word: 'Таксидермист', hint: 'Изготовляет чучела' },
                    { word: 'Футуролог', hint: 'Прогнозирует будущее' }
                ]
            }
        },
        {
            id: 'movies',
            name: 'Фильмы',
            icon: 'fas fa-film',
            color: '#ef4444',
            description: 'Известные фильмы и сериалы',
            words: {
                easy: [
                    { word: 'Титаник', hint: 'Корабль и история любви' },
                    { word: 'Гарри Поттер', hint: 'Юный волшебник и его друзья' },
                    { word: 'Властелин колец', hint: 'Фэнтези про хоббитов и кольцо' },
                    { word: 'Матрица', hint: 'Компьютерная реальность' },
                    { word: 'Король Лев', hint: 'Мультфильм про львёнка' }
                ],
                medium: [
                    { word: 'Назад в будущее', hint: 'Путешествия во времени на машине' },
                    { word: 'Пираты Карибского моря', hint: 'Про пиратов и сокровища' },
                    { word: 'Интерстеллар', hint: 'Космическое путешествие через червоточину' },
                    { word: 'Начало', hint: 'Проникновение в сны' },
                    { word: 'Побег из Шоушенка', hint: 'Тюремная драма' }
                ],
                hard: [
                    { word: 'Солярис', hint: 'Философская фантастика про планету-океан' },
                    { word: 'Сталкер', hint: 'Зона отчуждения и желания' },
                    { word: 'Малхолланд Драйв', hint: 'Сюрреалистический триллер' },
                    { word: 'Догвилль', hint: 'Экспериментальная драма' },
                    { word: 'Андалузский пёс', hint: 'Классика сюрреализма' }
                ]
            }
        },
        {
            id: 'idioms',
            name: 'Фразеологизмы',
            icon: 'fas fa-quote-right',
            color: '#f97316',
            description: 'Крылатые выражения и пословицы',
            words: {
                easy: [
                    { word: 'Бить баклуши', hint: 'Бездельничать' },
                    { word: 'Водить за нос', hint: 'Обманывать' },
                    { word: 'Держать язык за зубами', hint: 'Молчать' },
                    { word: 'Зарубить на носу', hint: 'Запомнить' },
                    { word: 'Кот наплакал', hint: 'Очень мало' }
                ],
                medium: [
                    { word: 'Белая ворона', hint: 'Не такой как все' },
                    { word: 'Витать в облаках', hint: 'Мечтать' },
                    { word: 'Гора с плеч', hint: 'Облегчение' },
                    { word: 'Дело в шляпе', hint: 'Успех обеспечен' },
                    { word: 'Еле-еле душа в теле', hint: 'Едва жив' }
                ],
                hard: [
                    { word: 'Ахиллесова пята', hint: 'Уязвимое место' },
                    { word: 'Бабушка надвое сказала', hint: 'Неизвестно как будет' },
                    { word: 'Вертеться как белка в колесе', hint: 'Быть очень занятым' },
                    { word: 'Гол как сокол', hint: 'Бедный' },
                    { word: 'Дамоклов меч', hint: 'Постоянная угроза' }
                ]
            }
        },
        {
            id: 'celebrities',
            name: 'Знаменитости',
            icon: 'fas fa-star',
            color: '#ec4899',
            description: 'Известные люди и персонажи',
            words: {
                easy: [
                    { word: 'Леонардо ДиКаприо', hint: 'Актёр, Титаник, Оскар' },
                    { word: 'Бритни Спирс', hint: 'Певица, Toxic, 2000-е' },
                    { word: 'Криштиану Роналду', hint: 'Футболист, Португалия' },
                    { word: 'Адель', hint: 'Певица, Hello, Rolling in the Deep' },
                    { word: 'Джеймс Бонд', hint: 'Агент 007' }
                ],
                medium: [
                    { word: 'Стивен Хокинг', hint: 'Физик-теоретик, инвалидное кресло' },
                    { word: 'Дэвид Боуи', hint: 'Музыкант, Ziggy Stardust' },
                    { word: 'Фрида Кало', hint: 'Мексиканская художница, брови' },
                    { word: 'Никола Тесла', hint: 'Изобретатель, переменный ток' },
                    { word: 'Коко Шанель', hint: 'Дизайнер моды, духи №5' }
                ],
                hard: [
                    { word: 'Фёдор Достоевский', hint: 'Русский писатель, Преступление и наказание' },
                    { word: 'Мария Кюри', hint: 'Учёная, открыла радий, Нобелевские премии' },
                    { word: 'Далида', hint: 'Французская певица египетского происхождения' },
                    { word: 'Марсель Пруст', hint: 'Французский писатель, В поисках утраченного времени' },
                    { word: 'Густав Климт', hint: 'Художник модерна, Поцелуй' }
                ]
            }
        },
        {
            id: 'food',
            name: 'Еда',
            icon: 'fas fa-utensils',
            color: '#84cc16',
            description: 'Блюда и продукты питания',
            words: {
                easy: [
                    { word: 'Пицца', hint: 'Итальянское блюдо, круглое' },
                    { word: 'Суши', hint: 'Японское блюдо, рыба и рис' },
                    { word: 'Шоколад', hint: 'Сладкое лакомство, коричневый' },
                    { word: 'Мороженое', hint: 'Холодный десерт' },
                    { word: 'Борщ', hint: 'Суп со свёклой, красный' }
                ],
                medium: [
                    { word: 'Тирамису', hint: 'Итальянский десерт, кофе и маскарпоне' },
                    { word: 'Рататуй', hint: 'Овощное рагу из Франции' },
                    { word: 'Фондю', hint: 'Швейцарское блюдо, расплавленный сыр' },
                    { word: 'Паэлья', hint: 'Испанское блюдо, рис с морепродуктами' },
                    { word: 'Кимчи', hint: 'Корейская острая закуска' }
                ],
                hard: [
                    { word: 'Фуа-гра', hint: 'Паштет из гусиной печени' },
                    { word: 'Трюфель', hint: 'Дорогой гриб, растёт под землёй' },
                    { word: 'Касу марцу', hint: 'Сардинский сыр с личинками' },
                    { word: 'Хаукарль', hint: 'Ферментированная акула из Исландии' },
                    { word: 'Балат', hint: 'Филиппинское блюдо из утиных яиц' }
                ]
            }
        }
    ],

    // Константы
    constants: {
        // Веса очков за сложность
        SCORE_WEIGHTS: {
            easy: 1,
            medium: 2,
            hard: 3
        },

        // Названия сложностей
        DIFFICULTY_NAMES: {
            easy: 'Лёгкая',
            medium: 'Средняя',
            hard: 'Сложная'
        },

        // Цвета сложностей
        DIFFICULTY_COLORS: {
            easy: '#10b981',
            medium: '#f59e0b',
            hard: '#ef4444'
        },

        // Бонус за скорость (очки за секунду)
        SPEED_BONUS: 0.1,

        // Множитель для hotseat режима
        HOTSEAT_MULTIPLIER: 1.5,

        // Максимальное количество игроков
        MAX_PLAYERS: 10,

        // Минимальное количество игроков
        MIN_PLAYERS: 2,

        // Время автоперехода по умолчанию
        DEFAULT_AUTO_TIME: 10,

        // Максимальное время на слово
        MAX_WORD_TIME: 300,

        // Минимальное время на слово
        MIN_WORD_TIME: 10
    },

    // Методы для работы с данными
    getAllCategories() {
        return this.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            description: cat.description
        }));
    },

    // Получить слова из категории
    getCategoryWords(categoryId, difficulty = 'mixed') {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) {
            console.warn(`Категория "${categoryId}" не найдена`);
            return [];
        }

        if (difficulty === 'mixed') {
            return [
                ...(category.words.easy || []).map(w => ({ ...w, difficulty: 'easy' })),
                ...(category.words.medium || []).map(w => ({ ...w, difficulty: 'medium' })),
                ...(category.words.hard || []).map(w => ({ ...w, difficulty: 'hard' }))
            ];
        }

        return (category.words[difficulty] || []).map(w => ({ ...w, difficulty }));
    },

    // Получить случайное слово
    getRandomWord(categories, difficulty = 'mixed', excludeWords = []) {
        let allWords = [];
        
        // Собрать все слова из выбранных категорий
        categories.forEach(categoryId => {
            const words = this.getCategoryWords(categoryId, difficulty);
            const category = this.categories.find(c => c.id === categoryId);
            
            words.forEach(word => {
                allWords.push({
                    ...word,
                    category: categoryId,
                    categoryName: category?.name || categoryId
                });
            });
        });

        // Исключить использованные слова
        if (excludeWords.length > 0) {
            allWords = allWords.filter(word => !excludeWords.includes(word.word));
        }

        // Если после фильтрации слов не осталось, вернуть случайное
        if (allWords.length === 0) {
            // Попробуем получить слова из всех категорий
            const allCategories = this.categories.map(c => c.id);
            return this.getRandomWord(allCategories, difficulty, []);
        }

        // Выбрать случайное слово
        if (allWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * allWords.length);
            return allWords[randomIndex];
        }

        // Запасное слово
        return {
            word: "Крокодил",
            hint: "Игра, в которую вы играете",
            difficulty: "easy",
            category: "animals",
            categoryName: "Животные"
        };
    },

    // Получить все слова (для отладки)
    getAllWords(difficulty = 'mixed') {
        let allWords = [];
        
        this.categories.forEach(category => {
            const words = this.getCategoryWords(category.id, difficulty);
            allWords = allWords.concat(words.map(word => ({
                ...word,
                category: category.id,
                categoryName: category.name
            })));
        });

        return allWords;
    },

    // Получить информацию о категории
    getCategoryInfo(categoryId) {
        return this.categories.find(cat => cat.id === categoryId);
    },

    // Получить количество слов в категории
    getCategoryWordCount(categoryId) {
        const category = this.getCategoryInfo(categoryId);
        if (!category) return 0;
        
        return (category.words.easy?.length || 0) + 
               (category.words.medium?.length || 0) + 
               (category.words.hard?.length || 0);
    },

    // Парсинг пользовательских слов
    parseCustomWords(text) {
        if (!text || text.trim() === '') return [];
        
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => ({
                word: line,
                hint: '',
                difficulty: 'medium',
                category: 'custom',
                categoryName: 'Свои слова',
                customId: `custom_${Date.now()}_${index}`
            }));
    }
};