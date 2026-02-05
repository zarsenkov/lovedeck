// Онлайн клиент будет работать только при запущенном сервере
class OnlineMafiaClient {
    constructor() {
        this.socket = null;
        this.roomCode = null;
        this.playerId = null;
        this.isHost = false;
        this.playerName = '';
        this.gameState = null;
    }
    
    init() {
        // Инициализация будет при переходе в онлайн режим
        console.log('Online client initialized');
    }
    
    connectToServer(serverUrl) {
        this.socket = io(serverUrl);
        
        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket.id);
            this.playerId = this.socket.id;
        });
        
        // Здесь будут обработчики событий от сервера
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Будет реализовано при интеграции с сервером
    }
}

// Экспортируем для использования
window.OnlineMafiaClient = OnlineMafiaClient;
