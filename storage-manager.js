/**
 * Упрощённый менеджер хранилища
 */

console.log('📦 StorageManager: Загрузка модуля...');

export const StorageManager = {
  // Ключи для localStorage
  KEYS: {
    PROFILE: 'lovecouple_profile_v2',
    SETTINGS: 'lovecouple_settings',
    STATS: 'lovecouple_game_stats'
  },
  
  // Профиль пользователя
  profile: null,
  
  // Инициализация
  init() {
    console.log('👤 StorageManager инициализация...');
    this.loadProfile();
    return this;
  },
  
  // Загрузка или создание профиля
  loadProfile() {
    try {
      const saved = localStorage.getItem(this.KEYS.PROFILE);
      if (saved) {
        this.profile = JSON.parse(saved);
        console.log('✅ Загружен существующий профиль:', this.profile.id);
      } else {
        this.createNewProfile();
        console.log('🆕 Создан новый профиль:', this.profile.id);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      this.createNewProfile();
    }
  },
  
  // Создание нового профиля
  createNewProfile() {
    this.profile = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: '',
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      stats: {
        gamesPlayed: 0,
        cardsSent: 0,
        cardsReceived: 0,
        onlineGames: 0,
        localGames: 0,
        totalPlayTime: 0
      },
      achievements: [],
      settings: {
        sound: true,
        notifications: true,
        theme: 'auto'
      }
    };
    
    this.saveProfile();
  },
  
  // Сохранение профиля
  saveProfile() {
    try {
      this.profile.lastSeen = new Date().toISOString();
      localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(this.profile));
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения профиля:', error);
      return false;
    }
  },
  
  // Обновление статистики
  updateStats(newStats) {
    this.profile.stats = { ...this.profile.stats, ...newStats };
    this.saveProfile();
    console.log('📊 Статистика обновлена:', newStats);
  },
  
  // Добавление игры в историю
  recordGame(gameType, durationMinutes, cardsCount) {
    if (!this.profile.gameHistory) {
      this.profile.gameHistory = [];
    }
    
    const gameRecord = {
      id: 'game_' + Date.now(),
      date: new Date().toISOString(),
      type: gameType,
      duration: durationMinutes,
      cardsCount: cardsCount,
      players: gameType === 'online' ? 2 : 1
    };
    
    this.profile.gameHistory.unshift(gameRecord);
    
    // Ограничиваем историю 50 записями
    if (this.profile.gameHistory.length > 50) {
      this.profile.gameHistory.pop();
    }
    
    this.saveProfile();
    return gameRecord;
  },
  
  // Получить статистику игр
  getGameStats() {
    const history = this.profile.gameHistory || [];
    const totalGames = history.length;
    const totalDuration = history.reduce((sum, game) => sum + (game.duration || 0), 0);
    const totalCards = history.reduce((sum, game) => sum + (game.cardsCount || 0), 0);
    
    return {
      totalGames,
      totalPlayTime: Math.round(totalDuration),
      avgGameDuration: totalGames > 0 ? Math.round(totalDuration / totalGames) : 0,
      totalCardsSent: totalCards,
      lastGame: history[0] || null
    };
  },
  
  // Получить общую статистику
  getOverallStats() {
    const gameStats = this.getGameStats();
    return {
      ...this.profile.stats,
      ...gameStats,
      profileAge: Math.floor((Date.now() - new Date(this.profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    };
  },
  
  // Сброс статистики
  resetStats() {
    this.profile.stats = {
      gamesPlayed: 0,
      cardsSent: 0,
      cardsReceived: 0,
      onlineGames: 0,
      localGames: 0,
      totalPlayTime: 0
    };
    this.profile.gameHistory = [];
    this.saveProfile();
    console.log('🔄 Статистика сброшена');
  }
};

export default StorageManager;
