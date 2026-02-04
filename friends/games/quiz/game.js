// Дополнительные функции для расширения функционала

// Сохранение настроек
QuizGame.prototype.saveSettings = function() {
    const settings = {
        players: this.gameState.players,
        difficulty: this.gameState.difficulty,
        categories: this.gameState.categories,
        questionCount: this.gameState.questionCount
    };
    localStorage.setItem('quizSettings', JSON.stringify(settings));
};

// Загрузка настроек
QuizGame.prototype.loadSettings = function() {
    const savedSettings = localStorage.getItem('quizSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        Object.assign(this.gameState, settings);
        this.updateUIFromSettings();
    }
};

// Обновление UI из настроек
QuizGame.prototype.updateUIFromSettings = function() {
    // Обновляем кнопки игроков
    document.querySelectorAll('.player-option').forEach(btn => {
        btn.classList.toggle('active', 
            parseInt(btn.dataset.players) === this.gameState.players
        );
    });
    
    // Обновляем кнопки сложности
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active',
            btn.dataset.diff === this.gameState.difficulty
        );
    });
    
    // Обновляем категории
    document.querySelectorAll('.category-checkbox input').forEach(checkbox => {
        checkbox.checked = this.gameState.categories.includes(checkbox.dataset.category);
    });
    
    // Обновляем слайдер
    document.getElementById('questionCount').value = this.gameState.questionCount;
    document.getElementById('currentCount').textContent = this.gameState.questionCount;
};

// Система темных тем (дополнительно)
QuizGame.prototype.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
};

// Загрузка темной темы
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Добавляем в конструктор
// this.loadSettings();

// И в конце событий
// document.getElementById('questionCount').addEventListener('change', () => this.saveSettings());
// Добавить аналогичные слушатели для других настроек
