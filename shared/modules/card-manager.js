/**
 * Упрощённый менеджер карточек для быстрого старта
 */

console.log('📦 CardManager: Загрузка модуля...');

// Импортируем базу карточек
import { CARDS } from '../data/cards-data.js';

export const CardManager = {
  // Системные карточки
  systemCards: CARDS,
  
  // Пользовательские карточки (пока пусто)
  userCards: {
    questions: [],
    actions: [],
    dates: [],
    compliments: []
  },
  
  // Инициализация
  init() {
    console.log('🎴 CardManager инициализирован. Карточек:', 
      this.systemCards.questions.length + ' вопросов, ' +
      this.systemCards.actions.length + ' действий, ' +
      this.systemCards.dates.length + ' свиданий, ' +
      this.systemCards.compliments.length + ' комплиментов'
    );
    return this;
  },
  
  // Получить случайную карточку по типу
  getRandomCard(type = null) {
    console.log('🎲 CardManager: Запрос случайной карточки типа', type || 'любой');
    
    if (type) {
      // Получаем карточки по типу
      const cards = this.systemCards[type + 's'] || [];
      if (cards.length === 0) {
        console.warn('❌ Нет карточек типа:', type);
        return null;
      }
      
      const randomIndex = Math.floor(Math.random() * cards.length);
      const card = cards[randomIndex];
      console.log('✅ Выбрана карточка:', card.id, '-', card.text.substring(0, 50) + '...');
      return card;
    }
    
    // Если тип не указан - выбираем случайный тип
    const types = ['question', 'action', 'date', 'compliment'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return this.getRandomCard(randomType);
  },
  
  // Получить карточку по ID
  getCardById(id) {
    // Ищем во всех типах
    const allCards = [
      ...this.systemCards.questions,
      ...this.systemCards.actions,
      ...this.systemCards.dates,
      ...this.systemCards.compliments,
      ...this.userCards.questions,
      ...this.userCards.actions,
      ...this.userCards.dates,
      ...this.userCards.compliments
    ];
    
    return allCards.find(card => card.id === id);
  },
  
  // Добавить пользовательскую карточку
  addUserCard(cardData) {
    if (!cardData.type || !cardData.text) {
      console.error('❌ Невалидные данные карточки:', cardData);
      return null;
    }
    
    const newCard = {
      ...cardData,
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      author: 'user',
      createdAt: new Date().toISOString().split('T')[0],
      rating: 5.0,
      uses: 0
    };
    
    // Добавляем в соответствующий массив
    const typeKey = newCard.type + 's';
    if (this.userCards[typeKey]) {
      this.userCards[typeKey].push(newCard);
      console.log('✅ Добавлена пользовательская карточка:', newCard.id);
      this.saveToLocalStorage();
      return newCard;
    }
    
    return null;
  },
  
  // Сохранить в localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('lovecouple_user_cards', JSON.stringify(this.userCards));
    } catch (e) {
      console.warn('⚠️ Не удалось сохранить карточки в localStorage');
    }
  },
  
  // Загрузить из localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('lovecouple_user_cards');
      if (saved) {
        this.userCards = JSON.parse(saved);
        console.log('📂 Загружены пользовательские карточки:', 
          Object.values(this.userCards).flat().length
        );
      }
    } catch (e) {
      console.warn('⚠️ Не удалось загрузить карточки из localStorage');
    }
  },
  
  // Получить статистику
  getStats() {
    const systemCount = 
      this.systemCards.questions.length +
      this.systemCards.actions.length +
      this.systemCards.dates.length +
      this.systemCards.compliments.length;
    
    const userCount = 
      this.userCards.questions.length +
      this.userCards.actions.length +
      this.userCards.dates.length +
      this.userCards.compliments.length;
    
    return {
      total: systemCount + userCount,
      system: systemCount,
      user: userCount,
      byType: {
        questions: this.systemCards.questions.length + this.userCards.questions.length,
        actions: this.systemCards.actions.length + this.userCards.actions.length,
        dates: this.systemCards.dates.length + this.userCards.dates.length,
        compliments: this.systemCards.compliments.length + this.userCards.compliments.length
      }
    };
  },
  
  // Поиск карточек
  searchCards(query, type = null) {
    const results = [];
    const searchLower = query.toLowerCase().trim();
    
    if (!searchLower) return results;
    
    // Ищем в системных карточках
    const searchInArray = (cards) => {
      cards.forEach(card => {
        if (card.text.toLowerCase().includes(searchLower)) {
          results.push({ ...card, source: 'system' });
        }
      });
    };
    
    if (type) {
      const typeKey = type + 's';
      if (this.systemCards[typeKey]) {
        searchInArray(this.systemCards[typeKey]);
      }
      if (this.userCards[typeKey]) {
        searchInArray(this.userCards[typeKey]);
      }
    } else {
      // Ищем во всех типах
      Object.values(this.systemCards).forEach(cards => searchInArray(cards));
      Object.values(this.userCards).forEach(cards => searchInArray(cards));
    }
    
    return results;
  }
    // Простой метод для получения общего количества карточек
  getAllCardsCount() {
    try {
      const systemCount = 
        (this.systemCards.questions?.length || 0) +
        (this.systemCards.actions?.length || 0) +
        (this.systemCards.dates?.length || 0) +
        (this.systemCards.compliments?.length || 0);
      
      const userCount = 
        (this.userCards.questions?.length || 0) +
        (this.userCards.actions?.length || 0) +
        (this.userCards.dates?.length || 0) +
        (this.userCards.compliments?.length || 0);
      
      const total = systemCount + userCount;
      console.log('📊 getAllCardsCount():', { system: systemCount, user: userCount, total });
      return total;
    } catch (error) {
      console.error('❌ Ошибка в getAllCardsCount:', error);
      return 40; // fallback на базовые карточки
    }
  },
  
  // Обновить метод init, чтобы вызывал loadFromLocalStorage
  init() {
    console.log('🎴 CardManager инициализирован. Карточек:', 
      this.systemCards.questions.length + ' вопросов, ' +
      this.systemCards.actions.length + ' действий, ' +
      this.systemCards.dates.length + ' свиданий, ' +
      this.systemCards.compliments.length + ' комплиментов'
    );
    
    // 👇 ДОБАВЬ ЭТУ СТРОЧКУ:
    this.loadFromLocalStorage();
    
    return this;
  }
};

// Экспорт по умолчанию
export default CardManager;
