/**
 * Менеджер хранилища LoveCouple
 * Управление профилями, настройками и статистикой
 */

export const StorageManager = {
  // Ключи для localStorage
  KEYS: {
    PROFILE: 'lovecouple_profile',
    SETTINGS: 'lovecouple_settings',
    STATS: 'lovecouple_stats',
    FAVORITES: 'lovecouple_favorites',
    HISTORY: 'lovecouple_history'
  },
  
  // Профиль пользователя
  profile: null,
  
  // Инициализация
  init() {
    console.log('[StorageManager] Инициализация...');
    this.loadProfile();
    this.loadSettings();
    return this;
  },
  
  // Загрузка профиля
  loadProfile() {
    try {
      const saved = localStorage.getItem(this.KEYS.PROFILE);
      if (saved) {
        this.profile = JSON.parse(saved);
      } else {
        // Создаём новый профиль
        this.profile = this.createDefaultProfile();
        this.saveProfile();
      }
      console.log('[StorageManager] Профиль загружен:', this.profile.id);
    } catch (error) {
      console.error('[StorageManager] Ошибка загрузки профиля:', error);
      this.profile = this.createDefaultProfile();
    }
  },
  
  // Создание профиля по умолчанию
  createDefaultProfile() {
    return {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: '',
      avatar: '',
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      stats: {
        gamesPlayed: 0,
        cardsSent: 0,
        cardsReceived: 0,
        onlineGames: 0,
        localGames: 0,
        favoriteCard: null,
        totalPlayTime: 0 // в минутах
      },
      achievements: [],
      preferences: {
        favoriteCardTypes: [],
        intensityPreference: 3,
        language: 'ru',
        notifications: true
      }
    };
  },
  
  // Сохранение профиля
  saveProfile() {
    try {
      this.profile.lastSeen = new Date().toISOString();
      localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(this.profile));
      return true;
    } catch (error) {
      console.error('[StorageManager] Ошибка сохранения профиля:', error);
      return false;
    }
  },
  
  // Обновление профиля
  updateProfile(updates) {
    this.profile = { ...this.profile, ...updates };
    return this.saveProfile();
  },
  
  // Обновление статистики
  updateStats(updates) {
    this.profile.stats = { ...this.profile.stats, ...updates };
    return this.saveProfile();
  },
  
  // Добавление достижения
  addAchievement(achievement) {
    if (!this.profile.achievements.includes(achievement)) {
      this.profile.achievements.push(achievement);
      this.saveProfile();
      return true;
    }
    return false;
  },
  
  // Загрузка настроек
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      console.error('[StorageManager] Ошибка загрузки настроек:', error);
      return this.getDefaultSettings();
    }
  },
  
  // Настройки по умолчанию
  getDefaultSettings() {
    return {
      sound: true,
      music: false,
      volume: 70,
      animations: true,
      theme: 'light',
      fontSize: 'medium',
      autoSave: true,
      showInstructions: true
    };
  },
  
  // Сохранение настроек
  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('[StorageManager] Ошибка сохранения настроек:', error);
      return false;
    }
  },
  
  // Работа с избранными карточками
  getFavorites() {
    try {
      const saved = localStorage.getItem(this.KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('[StorageManager] Ошибка загрузки избранного:', error);
      return [];
    }
  },
  
  addToFavorites(cardId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(cardId)) {
      favorites.push(cardId);
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
    return false;
  },
  
  removeFromFavorites(cardId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(cardId);
    if (index !== -1) {
      favorites.splice(index, 1);
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
    return false;
  },
  
  isFavorite(cardId) {
    return this.getFavorites().includes(cardId);
  },
  
  // История игр
  addGameToHistory(gameData) {
    try {
      const history = this.getGameHistory();
      const gameRecord = {
        id: 'game_' + Date.now(),
        date: new Date().toISOString(),
        type: gameData.type || 'local',
        duration: gameData.duration || 0,
        players: gameData.players || 2,
        cardsUsed: gameData.cardsUsed || 0,
        favoriteMoment: gameData.favoriteMoment || null
      };
      
      history.unshift(gameRecord);
      // Храним только последние 100 игр
      if (history.length > 100) {
        history.pop();
      }
      
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
      return gameRecord.id;
    } catch (error) {
      console.error('[StorageManager] Ошибка сохранения истории:', error);
      return null;
    }
  },
  
  getGameHistory(limit = 20) {
    try {
      const saved = localStorage.getItem(this.KEYS.HISTORY);
      const history = saved ? JSON.parse(saved) : [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('[StorageManager] Ошибка загрузки истории:', error);
      return [];
    }
  },
  
  // Очистка данных
  clearData(type = 'all') {
    try {
      switch (type) {
        case 'profile':
          localStorage.removeItem(this.KEYS.PROFILE);
          this.profile = this.createDefaultProfile();
          break;
          
        case 'settings':
          localStorage.removeItem(this.KEYS.SETTINGS);
          break;
          
        case 'favorites':
          localStorage.removeItem(this.KEYS.FAVORITES);
          break;
          
        case 'history':
          localStorage.removeItem(this.KEYS.HISTORY);
          break;
          
        case 'all':
          localStorage.clear();
          this.profile = this.createDefaultProfile();
          break;
      }
      
      console.log('[StorageManager] Данные очищены:', type);
      return true;
    } catch (error) {
      console.error('[StorageManager] Ошибка очистки данных:', error);
      return false;
    }
  },
  
  // Экспорт всех данных
  exportAllData() {
    const data = {
      profile: this.profile,
      settings: this.loadSettings(),
      favorites: this.getFavorites(),
      history: this.getGameHistory(1000),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(data, null, 2);
  },
  
  // Получение статистики
  getStatistics() {
    const history = this.getGameHistory(1000);
    const totalGames = history.length;
    const totalDuration = history.reduce((sum, game) => sum + (game.duration || 0), 0);
    const avgDuration = totalGames > 0 ? Math.round(totalDuration / totalGames) : 0;
    
    const last7Days = history.filter(game => {
      const gameDate = new Date(game.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return gameDate > weekAgo;
    });
    
    return {
      totalGames,
      totalPlayTime: totalDuration,
      avgGameDuration: avgDuration,
      gamesLast7Days: last7Days.length,
      favoriteGameType: this.getMostFrequent(history.map(g => g.type)),
      completionRate: this.profile.stats.gamesPlayed > 0 ? 
        Math.round((this.profile.stats.cardsSent / (this.profile.stats.gamesPlayed * 10)) * 100) : 0
    };
  },
  
  // Вспомогательная функция
  getMostFrequent(arr) {
    return arr.sort((a,b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }
};

export default StorageManager;
