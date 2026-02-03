/**
 * Единая база карточек LoveCouple
 * Всего: 40 карточек (10 каждого типа)
 * Системные карточки - база для игры
 */

export const CARDS = {
  // 1. ВОПРОСЫ (10 карточек)
  questions: [
    {
      id: 'q_1',
      type: 'question',
      text: "Если бы мы могли полететь в любую точку мира прямо сейчас, куда бы ты выбрал(а)?",
      category: "путешествия",
      tags: ["мечты", "будущее", "приключения"],
      length: "medium",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'q_2',
      type: 'question',
      text: "Какой момент в нашем первом свидании ты запомнил(а) лучше всего?",
      category: "воспоминания",
      tags: ["начало отношений", "романтика"],
      length: "short",
      intensity: 3,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'q_3',
      type: 'question',
      text: "Если бы у тебя был супергеройский талант, который можно использовать только для помощи другим, что бы это было?",
      category: "фантазии",
      tags: ["суперсилы", "доброта"],
      length: "medium",
      intensity: 1,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.5,
      uses: 0
    },
    {
      id: 'q_4',
      type: 'question',
      text: "Что тебя больше всего удивляет во мне?",
      category: "отношения",
      tags: ["откровенность", "личность"],
      length: "short",
      intensity: 4,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'q_5',
      type: 'question',
      text: "Какая наша совместная черта характера тебе нравится больше всего?",
      category: "отношения",
      tags: ["совместимость", "характер"],
      length: "short",
      intensity: 3,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.6,
      uses: 0
    },
    {
      id: 'q_6',
      type: 'question',
      text: "Если бы мы могли изобрести что-то вместе, что бы это было?",
      category: "творчество",
      tags: ["совместные проекты", "инновации"],
      length: "medium",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.4,
      uses: 0
    },
    {
      id: 'q_7',
      type: 'question',
      text: "Какой подарок от меня запомнился тебе больше всего?",
      category: "воспоминания",
      tags: ["подарки", "внимательность"],
      length: "short",
      intensity: 3,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'q_8',
      type: 'question',
      text: "Что бы ты хотел(а), чтобы мы делали вместе чаще?",
      category: "будущее",
      tags: ["планы", "время вместе"],
      length: "short",
      intensity: 3,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'q_9',
      type: 'question',
      text: "Какой звук моего голоса тебе нравится больше всего?",
      category: "близость",
      tags: ["детали", "сенсорика"],
      length: "short",
      intensity: 4,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'q_10',
      type: 'question',
      text: "Если бы наша любовь была фильмом, как бы он назывался?",
      category: "творчество",
      tags: ["метафоры", "кино"],
      length: "medium",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    }
  ],

  // 2. ДЕЙСТВИЯ (10 карточек)
  actions: [
    {
      id: 'a_1',
      type: 'action',
      text: "Сделай партнёру неожиданный комплимент, глядя прямо в глаза",
      category: "близость",
      tags: ["комплименты", "контакт глаз"],
      duration: "instant",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'a_2',
      type: 'action',
      text: "Спой куплет из песни, которая ассоциируется у тебя с нашими отношениями",
      category: "развлечения",
      tags: ["музыка", "воспоминания"],
      duration: "short",
      intensity: 1,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.6,
      uses: 0
    },
    {
      id: 'a_3',
      type: 'action',
      text: "Расскажи историю, которую никогда раньше не рассказывал(а)",
      category: "откровенность",
      tags: ["секреты", "доверие"],
      duration: "medium",
      intensity: 3,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'a_4',
      type: 'action',
      text: "Станцуй под музыку, которая сейчас играет в твоей голове",
      category: "развлечения",
      tags: ["танец", "спонтанность"],
      duration: "short",
      intensity: 1,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.5,
      uses: 0
    },
    {
      id: 'a_5',
      type: 'action',
      text: "Изобрази, как мы познакомились, без слов",
      category: "воспоминания",
      tags: ["пантомима", "юмор"],
      duration: "short",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'a_6',
      type: 'action',
      text: "Обними партнёра и удержи объятие 30 секунд",
      category: "близость",
      tags: ["объятия", "физический контакт"],
      duration: "medium",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'a_7',
      type: 'action',
      text: "Скажи три вещи, которые тебе нравятся в партнёре, одним дыханием",
      category: "комплименты",
      tags: ["скорость", "спонтанность"],
      duration: "instant",
      intensity: 2,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'a_8',
      type: 'action',
      text: "Нарисуй портрет партнёра с закрытыми глазами",
      category: "творчество",
      tags: ["рисование", "юмор"],
      duration: "medium",
      intensity: 1,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.6,
      uses: 0
    },
    {
      id: 'a_9',
      type: 'action',
      text: "Прошепчи партнёру на ушко что-то, чего никто больше не слышал",
      category: "интимность",
      tags: ["секреты", "близость"],
      duration: "instant",
      intensity: 4,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'a_10',
      type: 'action',
      text: "Изобрази самую смешную нашу совместную фотографию",
      category: "воспоминания",
      tags: ["юмор", "пантомима"],
      duration: "short",
      intensity: 1,
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    }
  ],

  // 3. СВИДАНИЯ (10 карточек)
  dates: [
    {
      id: 'd_1',
      type: 'date',
      text: "Устройте домашний киновечер с попкорном и любимым фильмом",
      category: "домашние",
      tags: ["кино", "уют"],
      budget: "low",
      duration: "long",
      preparation: "minimal",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'd_2',
      type: 'date',
      text: "Сходите на пикник в ближайший парк",
      category: "активные",
      tags: ["природа", "еда на свежем воздухе"],
      budget: "low",
      duration: "medium",
      preparation: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'd_3',
      type: 'date',
      text: "Посетите музей или выставку, которую ещё не видели",
      category: "культурные",
      tags: ["искусство", "образование"],
      budget: "medium",
      duration: "medium",
      preparation: "minimal",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'd_4',
      type: 'date',
      text: "Приготовьте ужин вместе, попробовав новый рецепт",
      category: "кулинарные",
      tags: ["готовка", "эксперименты"],
      budget: "medium",
      duration: "long",
      preparation: "much",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'd_5',
      type: 'date',
      text: "Сходите в караоке и спойте дуэтом",
      category: "развлечения",
      tags: ["музыка", "веселье"],
      budget: "medium",
      duration: "medium",
      preparation: "minimal",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.6,
      uses: 0
    },
    {
      id: 'd_6',
      type: 'date',
      text: "Устройте фотосессию в необычном месте города",
      category: "творческие",
      tags: ["фотография", "исследования"],
      budget: "low",
      duration: "medium",
      preparation: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'd_7',
      type: 'date',
      text: "Сходите на танцевальный мастер-класс",
      category: "активные",
      tags: ["танцы", "обучение"],
      budget: "medium",
      duration: "medium",
      preparation: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'd_8',
      type: 'date',
      text: "Найдите самый красивый закат в городе и насладитесь им вместе",
      category: "романтические",
      tags: ["природа", "бесплатно"],
      budget: "low",
      duration: "short",
      preparation: "minimal",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'd_9',
      type: 'date',
      text: "Посетите кафе с настольными играми",
      category: "развлечения",
      tags: ["игры", "соревнование"],
      budget: "low",
      duration: "long",
      preparation: "minimal",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'd_10',
      type: 'date',
      text: "Устройте спа-вечер дома с масками и массажем",
      category: "расслабляющие",
      tags: ["уход", "релакс"],
      budget: "medium",
      duration: "long",
      preparation: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    }
  ],

  // 4. КОМПЛИМЕНТЫ (10 карточек)
  compliments: [
    {
      id: 'c_1',
      type: 'compliment',
      text: "Мне нравится, как ты умеешь слушать и слышать меня",
      category: "личность",
      tags: ["внимательность", "поддержка"],
      style: "sincere",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'c_2',
      type: 'compliment',
      text: "Твоя улыбка делает мой день ярче",
      category: "внешность",
      tags: ["улыбка", "позитив"],
      style: "romantic",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'c_3',
      type: 'compliment',
      text: "Ты вдохновляешь меня становиться лучше",
      category: "влияние",
      tags: ["мотивация", "рост"],
      style: "sincere",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'c_4',
      type: 'compliment',
      text: "Мне нравится, как ты думаешь - это так уникально",
      category: "интеллект",
      tags: ["ум", "креативность"],
      style: "sincere",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'c_5',
      type: 'compliment',
      text: "Твой смех - моя любимая мелодия",
      category: "звуки",
      tags: ["смех", "радость"],
      style: "romantic",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    },
    {
      id: 'c_6',
      type: 'compliment',
      text: "Рядом с тобой я чувствую себя в безопасности",
      category: "эмоции",
      tags: ["безопасность", "комфорт"],
      style: "sincere",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'c_7',
      type: 'compliment',
      text: "Ты умеешь находить красоту в обычных вещах",
      category: "восприятие",
      tags: ["наблюдательность", "философия"],
      style: "sincere",
      length: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.6,
      uses: 0
    },
    {
      id: 'c_8',
      type: 'compliment',
      text: "Мне нравится твой стиль во всём - от одежды до решений",
      category: "личность",
      tags: ["стиль", "уверенность"],
      style: "playful",
      length: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.7,
      uses: 0
    },
    {
      id: 'c_9',
      type: 'compliment',
      text: "Твоя забота обо мне не остаётся незамеченной",
      category: "отношения",
      tags: ["забота", "внимание"],
      style: "sincere",
      length: "short",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.9,
      uses: 0
    },
    {
      id: 'c_10',
      type: 'compliment',
      text: "С тобой даже самые обычные дни становятся особенными",
      category: "влияние",
      tags: ["магия", "повседневность"],
      style: "romantic",
      length: "medium",
      author: "system",
      createdAt: "2024-01-01",
      rating: 4.8,
      uses: 0
    }
  ]
};

// Индексы для быстрого поиска (инициализируются динамически)
export const CARD_INDEXES = {
  byTag: {},
  byCategory: {},
  byType: {},
  byIntensity: {}
};

// Вспомогательные функции
export function getAllCards() {
  return [
    ...CARDS.questions,
    ...CARDS.actions,
    ...CARDS.dates,
    ...CARDS.compliments
  ];
}

export function getTotalCardCount() {
  return CARDS.questions.length + 
         CARDS.actions.length + 
         CARDS.dates.length + 
         CARDS.compliments.length;
}

// Инициализация индексов при загрузке
export function initCardIndexes() {
  console.log('[Cards] Инициализация индексов для', getTotalCardCount(), 'карточек');
  
  const allCards = getAllCards();
  
  // Очищаем индексы
  CARD_INDEXES.byTag = {};
  CARD_INDEXES.byCategory = {};
  CARD_INDEXES.byType = {
    question: CARDS.questions,
    action: CARDS.actions,
    date: CARDS.dates,
    compliment: CARDS.compliments
  };
  CARD_INDEXES.byIntensity = {1: [], 2: [], 3: [], 4: [], 5: []};
  
  // Заполняем индексы
  allCards.forEach(card => {
    // По тегам
    if (card.tags) {
      card.tags.forEach(tag => {
        if (!CARD_INDEXES.byTag[tag]) {
          CARD_INDEXES.byTag[tag] = [];
        }
        CARD_INDEXES.byTag[tag].push(card.id);
      });
    }
    
    // По категориям
    if (card.category) {
      if (!CARD_INDEXES.byCategory[card.category]) {
        CARD_INDEXES.byCategory[card.category] = [];
      }
      CARD_INDEXES.byCategory[card.category].push(card.id);
    }
    
    // По интенсивности
    if (card.intensity && card.intensity >= 1 && card.intensity <= 5) {
      CARD_INDEXES.byIntensity[card.intensity].push(card.id);
    }
  });
  
  console.log('[Cards] Индексы созданы:', {
    tags: Object.keys(CARD_INDEXES.byTag).length,
    categories: Object.keys(CARD_INDEXES.byCategory).length,
    types: Object.keys(CARD_INDEXES.byType).length
  });
}

// Автоматически инициализируем при импорте
initCardIndexes();
