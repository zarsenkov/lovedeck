/**
 * Менеджер карточек LoveCouple
 * Единый интерфейс для работы с карточками
 */

import { CARDS, CARD_INDEXES, getAllCards, getTotalCardCount } from '../data/cards-data.js';

export const CardManager = {
  // Все системные карточки
  systemCards: CARDS,
  
  // Пользовательские карточки (загружаются из localStorage)
  userCards: {
    questions: [],
    actions: [],
    dates: [],
    compliments: []
  },
  
  // Настройки фильтрации
  filters: {
    includeSystem: true,
    includeUser: true,
    minIntensity: 1,
    maxIntensity: 5,
    categories: [],
    tags: []
  },
  
  // Инициализация менеджера
  init() {
    console.log('[CardManager] Инициализация...');
    this.loadUserCards();
    console.log('[CardManager] Загружено:', {
      system: getTotalCardCount(),
      user: this.getUserCardCount(),
      total: this.getAllCardsCount()
    });
    return this;
  },
  
  // Загрузка пользовательских карточек
  loadUserCards() {
    try {
      const saved = localStorage.getItem('lovecouple_user_cards');
      if (saved) {
        this.userCards = JSON.parse(saved);
        console.log('[CardManager] Загружены пользовательские карточки:', this.getUserCardCount());
      }
    } catch (error) {
      console.error('[CardManager] Ошибка загрузки пользовательских карточек:', error);
      this.userCards = { questions: [], actions: [], dates: [], compliments: [] };
    }
  },
  
  // Сохранение пользовательских карточек
  saveUserCards() {
    try {
      localStorage.setItem('lovecouple_user_cards', JSON.stringify(this.userCards));
      console.log('[CardManager] Пользовательские карточки сохранены');
      return true;
    } catch (error) {
      console.error('[CardManager] Ошибка сохранения:', error);
      return false;
    }
  },
  
  // Добавление пользовательской карточки
  addUserCard(card) {
    // Валидация
    if (!this.validateCard(card)) {
      console.error('[CardManager] Невалидная карточка:', card);
      return { success: false, error: 'Невалидная карточка' };
    }
    
    // Генерация уникального ID
    const newCard = {
      ...card,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: 'user',
      createdAt: new Date().toISOString().split('T')[0],
      rating: 5.0,
      uses: 0
    };
    
    // Добавление в соответствующую категорию
    if (this.userCards[newCard.type + 's']) {
      this.userCards[newCard.type + 's'].push(newCard);
      this.saveUserCards();
      
      console.log('[CardManager] Добавлена пользовательская карточка:', newCard.id);
      return { success: true, card: newCard };
    } else {
      return { success: false, error: 'Неизвестный тип карточки' };
    }
  },
  
  // Валидация карточки
  validateCard(card) {
    if (!card || typeof card !== 'object') return false;
    
    const required = ['type', 'text'];
    for (const field of required) {
      if (!card[field]) return false;
    }
    
    // Проверка типа
    const validTypes = ['question', 'action', 'date', 'compliment'];
    if (!validTypes.includes(card.type)) return false;
    
    // Проверка длины текста
    if (card.text.length < 3 || card.text.length > 500) return false;
    
    return true;
  },
  
  // Получение случайной карточки
  getRandomCard(type = null, options = {}) {
    const availableCards = [];
    
    // Системные карточки
    if (this.filters.includeSystem) {
      if (type) {
        if (this.systemCards[type + 's']) {
          availableCards.push(...this.systemCards[type + 's']);
        }
      } else {
        availableCards.push(...getAllCards());
      }
    }
    
    // Пользовательские карточки
    if (this.filters.includeUser) {
      if (type) {
        if (this.userCards[type + 's']) {
          availableCards.push(...this.userCards[type + 's']);
        }
      } else {
        Object.values(this.userCards).forEach(cards => {
          availableCards.push(...cards);
        });
      }
    }
    
    // Фильтрация по интенсивности
    let filteredCards = availableCards.filter(card => {
      if (!card.intensity) return true;
      return card.intensity >= this.filters.minIntensity && 
             card.intensity <= this.filters.maxIntensity;
    });
    
    // Фильтрация по категориям
    if (this.filters.categories.length > 0) {
      filteredCards = filteredCards.filter(card => 
        card.category && this.filters.categories.includes(card.category)
      );
    }
    
    // Фильтрация по тегам
    if (this.filters.tags.length > 0) {
      filteredCards = filteredCards.filter(card => 
        card.tags && card.tags.some(tag => this.filters.tags.includes(tag))
      );
    }
    
    // Дополнительные фильтры из options
    if (options.minRating) {
      filteredCards = filteredCards.filter(card => 
        card.rating >= options.minRating
      );
    }
    
    if (options.maxLength) {
      filteredCards = filteredCards.filter(card => 
        (!card.length || card.length === 'short') || 
        (card.length === 'medium' && options.maxLength !== 'short')
      );
    }
    
    if (filteredCards.length === 0) {
      console.warn('[CardManager] Нет карточек с такими фильтрами');
      return null;
    }
    
    // Выбор случайной карточки
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    const selectedCard = filteredCards[randomIndex];
    
    // Увеличиваем счётчик использования
    this.incrementCardUses(selectedCard.id);
    
    return selectedCard;
  },
  
  // Получение карточки по ID
  getCardById(id) {
    // Поиск в системных карточках
    for (const type of ['questions', 'actions', 'dates', 'compliments']) {
      const found = this.systemCards[type].find(card => card.id === id);
      if (found) return found;
    }
    
    // Поиск в пользовательских карточках
    for (const type of ['questions', 'actions', 'dates', 'compliments']) {
      const found = this.userCards[type].find(card => card.id === id);
      if (found) return found;
    }
    
    return null;
  },
  
  // Увеличение счётчика использования
  incrementCardUses(cardId) {
    // В системных карточках
    for (const type of ['questions', 'actions', 'dates', 'compliments']) {
      const card = this.systemCards[type].find(c => c.id === cardId);
      if (card) {
        card.uses = (card.uses || 0) + 1;
        return;
      }
    }
    
    // В пользовательских карточках
    for (const type of ['questions', 'actions', 'dates', 'compliments']) {
      const card = this.userCards[type].find(c => c.id === cardId);
      if (card) {
        card.uses = (card.uses || 0) + 1;
        this.saveUserCards();
        return;
      }
    }
  },
  
  // Поиск карточек по тексту
  searchCards(query, type = null) {
    const results = [];
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) return results;
    
    // Поиск в системных карточках
    if (this.filters.includeSystem) {
      const systemCards = type ? this.systemCards[type + 's'] || [] : getAllCards();
      systemCards.forEach(card => {
        if (card.text.toLowerCase().includes(searchQuery)) {
          results.push({ ...card, source: 'system' });
        }
      });
    }
    
    // Поиск в пользовательских карточках
    if (this.filters.includeUser) {
      const userCards = type ? this.userCards[type + 's'] || [] : 
        Object.values(this.userCards).flat();
      userCards.forEach(card => {
        if (card.text.toLowerCase().includes(searchQuery)) {
          results.push({ ...card, source: 'user' });
        }
      });
    }
    
    return results;
  },
  
  // Получение карточек по тегу
  getCardsByTag(tag, type = null) {
    const results = [];
    const tagLower = tag.toLowerCase();
    
    // Из индекса
    const cardIds = CARD_INDEXES.byTag[tagLower] || [];
    
    cardIds.forEach(id => {
      const card = this.getCardById(id);
      if (card && (!type || card.type === type)) {
        results.push(card);
      }
    });
    
    return results;
  },
  
  // Получение статистики
  getStats() {
    const systemCount = getTotalCardCount();
    const userCount = this.getUserCardCount();
    const totalCount = systemCount + userCount;
    
    // Самые популярные карточки
    const allCards = [...getAllCards(), ...Object.values(this.userCards).flat()];
    const popularCards = [...allCards]
      .sort((a, b) => (b.uses || 0) - (a.uses || 0))
      .slice(0, 10);
    
    // Распределение по типам
    const typeDistribution = {
      question: this.systemCards.questions.length + this.userCards.questions.length,
      action: this.systemCards.actions.length + this.userCards.actions.length,
      date: this.systemCards.dates.length + this.userCards.dates.length,
      compliment: this.systemCards.compliments.length + this.userCards.compliments.length
    };
    
    return {
      total: totalCount,
      system: systemCount,
      user: userCount,
      popularCards,
      typeDistribution,
      lastUpdated: new Date().toISOString()
    };
  },
  
  // Вспомогательные методы
  getAllCardsCount() {
    return getTotalCardCount() + this.getUserCardCount();
  },
  
  getUserCardCount() {
    return Object.values(this.userCards).reduce((sum, cards) => sum + cards.length, 0);
  },
  
  // Установка фильтров
  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    console.log('[CardManager] Фильтры обновлены:', this.filters);
  },
  
  // Сброс фильтров
  resetFilters() {
    this.filters = {
      includeSystem: true,
      includeUser: true,
      minIntensity: 1,
      maxIntensity: 5,
      categories: [],
      tags: []
    };
  },
  
  // Экспорт пользовательских карточек
  exportUserCards() {
    return JSON.stringify(this.userCards, null, 2);
  },
  
  // Импорт пользовательских карточек
  importUserCards(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      
      // Валидация структуры
      const requiredTypes = ['questions', 'actions', 'dates', 'compliments'];
      for (const type of requiredTypes) {
        if (!Array.isArray(imported[type])) {
          throw new Error(`Неверный формат для типа: ${type}`);
        }
      }
      
      this.userCards = imported;
      this.saveUserCards();
      
      console.log('[CardManager] Импортировано карточек:', this.getUserCardCount());
      return { success: true, count: this.getUserCardCount() };
    } catch (error) {
      console.error('[CardManager] Ошибка импорта:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Удаление пользовательской карточки
  deleteUserCard(cardId) {
    for (const type of ['questions', 'actions', 'dates', 'compliments']) {
      const index = this.userCards[type].findIndex(card => card.id === cardId);
      if (index !== -1) {
        this.userCards[type].splice(index, 1);
        this.saveUserCards();
        console.log('[CardManager] Удалена карточка:', cardId);
        return { success: true, type };
      }
    }
    return { success: false, error: 'Карточка не найдена' };
  }
};

// Экспорт синглтона
export default CardManager;
