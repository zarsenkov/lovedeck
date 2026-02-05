// ===== PREMIUM GAME LOGIC =====

class PremiumGame {
    constructor() {
        this.state = {
            gameType: 'show', // 'show' or 'explain'
            gameMode: 'classic', // 'classic' or 'teams'
            selectedCategories: ['objects', 'animals', 'actions'],
            wordsCount: 10,
            timerSeconds: 60,
            currentWordIndex: 0,
            score: 0,
            wordsGuessed: 0,
            wordsList: [],
            timeLeft: 60,
            timerInterval: null,
            isPlaying: false,
            customWords: [],
            teams: [
                { id: 1, name: 'Команда 1', score: 0, color: '#8b5cf6' },
                { id: 2, name: 'Команда 2', score: 0, color: '#ec4899' }
            ],
            currentTeam: 0,
            soundEnabled: true
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadCustomWords();
        this.initCategories();
        this.bindEvents();
        this.updateUI();
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 500);
    }
    
    bindEvents() {
        // Mode selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectMode(e.currentTarget.dataset.mode);
            });
        });
        
        // Words count slider
        const wordsSlider = document.getElementById('wordsCountSlider');
        const wordsValue = document.getElementById('wordsCountValue');
        
        wordsSlider.addEventListener('input', (e) => {
            this.state.wordsCount = parseInt(e.target.value);
            wordsValue.textContent = this.state.wordsCount;
            this.updatePresetButtons('.preset-btn[data-count]', this.state.wordsCount.toString());
            this.saveSettings();
        });
        
        // Words count presets
        document.querySelectorAll('.preset-btn[data-count]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const count = parseInt(e.currentTarget.dataset.count);
                this.state.wordsCount = count;
                wordsSlider.value = count;
                wordsValue.textContent = count;
                this.updatePresetButtons('.preset-btn[data-count]', count.toString());
                this.saveSettings();
            });
        });
        
        // Timer slider
        const timerSlider = document.getElementById('timerSlider');
        const timerValue = document.getElementById('timerValue');
        
        timerSlider.addEventListener('input', (e) => {
            this.state.timerSeconds = parseInt(e.target.value);
            timerValue.textContent = this.state.timerSeconds;
            this.updatePresetButtons('.preset-btn[data-seconds]', this.state.timerSeconds.toString());
            this.saveSettings();
        });
        
        // Timer presets
        document.querySelectorAll('.preset-btn[data-seconds]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.currentTarget.dataset.seconds);
                this.state.timerSeconds = seconds;
                timerSlider.value = seconds;
                timerValue.textContent = seconds;
                this.updatePresetButtons('.preset-btn[data-seconds]', seconds.toString());
                this.saveSettings();
            });
        });
        
        // Game mode selection
        document.querySelectorAll('.preset-btn[data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.state.gameMode = e.currentTarget.dataset.mode;
                this.updatePresetButtons('.preset-btn[data-mode]', this.state.gameMode);
                this.saveSettings();
                this.updateUI();
            });
        });
    }
    
    initCategories() {
        const categories = [
            { id: 'objects', name: 'Предметы', icon: 'fa-box' },
            { id: 'animals', name: 'Животные', icon: 'fa-paw' },
            { id: 'actions', name: 'Действия', icon: 'fa-running' },
            { id: 'professions', name: 'Профессии', icon: 'fa-user-tie' },
            { id: 'movies', name: 'Фильмы', icon: 'fa-film' },
            { id: 'celebrities', name: 'Знаменитости', icon: 'fa-star' },
            { id: 'food', name: 'Еда', icon: 'fa-utensils' },
            { id: 'memnoe', name: 'Мемное', icon: 'fa-laugh' },
            { id: 'adult', name: '18+', icon: 'fa-heart' },
            { id: 'technology', name: 'Технологии', icon: 'fa-laptop' },
            { id: 'emotions', name: 'Эмоции', icon: 'fa-smile' },
            { id: 'countries', name: 'Страны', icon: 'fa-globe' },
            { id: 'cities', name: 'Города', icon: 'fa-city' },
            { id: 'music', name: 'Музыка', icon: 'fa-music' },
            { id: 'nature', name: 'Природа', icon: 'fa-tree' }
        ];
        
        const container = document.getElementById('categoriesGrid');
        container.innerHTML = categories.map(cat => `
            <button class="category-chip ${this.state.selectedCategories.includes(cat.id) ? 'active' : ''}" 
                    data-category="${cat.id}">
                <i class="fas ${cat.icon}"></i>
                ${cat.name}
            </button>
        `).join('');
        
        // Add category click handlers
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                const index = this.state.selectedCategories.indexOf(category);
                
                if (index > -1) {
                    this.state.selectedCategories.splice(index, 1);
                    e.currentTarget.classList.remove('active');
                } else {
                    this.state.selectedCategories.push(category);
                    e.currentTarget.classList.add('active');
                }
                
                this.saveSettings();
            });
        });
    }
    
    updatePresetButtons(selector, value) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.count === value || btn.dataset.seconds === value || btn.dataset.mode === value) {
                btn.classList.add('active');
            }
        });
    }
    
    selectMode(mode) {
        this.state.gameType = mode;
        
        // Update mode cards
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.mode === mode) {
                card.classList.add('active');
            }
        });
        
        this.updateUI();
        this.saveSettings();
        
        // Play sound
        if (this.state.soundEnabled) {
            this.playSound('click');
        }
    }
    
    updateUI() {
        // Update game mode indicator
        const modeText = document.getElementById('modeText');
        const modeIcon = document.querySelector('#gameModeIndicator i');
        
        if (this.state.gameType === 'show') {
            modeText.textContent = 'Показывать';
            modeIcon.className = 'fas fa-hand-sparkles';
        } else {
            modeText.textContent = 'Объяснять';
            modeIcon.className = 'fas fa-comments';
        }
        
        // Update team scores visibility
        const teamScores = document.getElementById('teamScores');
        if (this.state.gameMode === 'teams') {
            teamScores.style.display = 'grid';
        } else {
            teamScores.style.display = 'none';
        }
    }
    
    startGame() {
        if (this.state.selectedCategories.length === 0) {
            this.showToast('Выберите хотя бы одну категорию!');
            return;
        }
        
        // Generate word list
        this.generateWordList();
        
        if (this.state.wordsList.length === 0) {
            this.showToast('Нет слов по выбранным настройкам!');
            return;
        }
        
        // Reset state
        this.state.currentWordIndex = 0;
        this.state.score = 0;
        this.state.wordsGuessed = 0;
        this.state.timeLeft = this.state.timerSeconds;
        this.state.isPlaying = true;
        this.state.teams.forEach(team => team.score = 0);
        this.state.currentTeam = 0;
        
        // Update UI
        document.getElementById('totalWords').textContent = this.state.wordsList.length;
        document.getElementById('currentScore').textContent = '0';
        document.getElementById('wordsGuessedCount').textContent = '0';
        this.updateTeamScores();
        
        // Switch to game screen
        this.switchScreen('game');
        
        // Show first word
        this.showNextWord();
        this.startTimer();
        
        // Play sound
        if (this.state.soundEnabled) {
            this.playSound('game-start');
        }
    }
    
    generateWordList() {
        this.state.wordsList = [];
        
        // Add words from selected categories
        this.state.selectedCategories.forEach(category => {
            if (gameWords[category]) {
                this.state.wordsList = this.state.wordsList.concat(gameWords[category]);
            }
        });
        
        // Add custom words
        if (this.state.customWords.length > 0) {
            this.state.customWords.forEach(word => {
                this.state.wordsList.push({
                    word: word,
                    category: 'custom'
                });
            });
        }
        
        // Shuffle and slice
        this.shuffleArray(this.state.wordsList);
        this.state.wordsList = this.state.wordsList.slice(0, this.state.wordsCount);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    showNextWord() {
        if (this.state.currentWordIndex >= this.state.wordsList.length) {
            this.endGame();
            return;
        }
        
        const wordObj = this.state.wordsList[this.state.currentWordIndex];
        
        // Update word display
        document.getElementById('currentWord').textContent = wordObj.word;
        document.getElementById('categoryText').textContent = this.getCategoryName(wordObj.category);
        document.getElementById('currentWordNum').textContent = this.state.currentWordIndex + 1;
        
        this.state.currentWordIndex++;
    }
    
    startTimer() {
        clearInterval(this.state.timerInterval);
        this.state.timeLeft = this.state.timerSeconds;
        this.updateTimerDisplay();
        
        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.state.timeLeft <= 0) {
                clearInterval(this.state.timerInterval);
                this.skipWord();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timerText = document.getElementById('timerText');
        const progressCircle = document.getElementById('timerProgress');
        
        timerText.textContent = this.state.timeLeft;
        
        // Calculate progress
        const circumference = 2 * Math.PI * 45;
        const progress = (this.state.timeLeft / this.state.timerSeconds) * circumference;
        progressCircle.style.strokeDashoffset = circumference - progress;
        
        // Update color based on time left
        if (this.state.timeLeft <= 10) {
            progressCircle.style.stroke = 'url(#gradient-danger)';
            timerText.style.color = '#ef4444';
        } else if (this.state.timeLeft <= 30) {
            progressCircle.style.stroke = 'url(#gradient-warning)';
            timerText.style.color = '#f59e0b';
        } else {
            progressCircle.style.stroke = 'url(#gradient-primary)';
            timerText.style.color = 'var(--text-primary)';
        }
    }
    
    correctGuess() {
        const points = this.state.gameType === 'show' ? 3 : 1;
        this.state.score += points;
        this.state.wordsGuessed++;
        
        if (this.state.gameMode === 'teams') {
            this.state.teams[this.state.currentTeam].score += points;
            this.state.currentTeam = (this.state.currentTeam + 1) % this.state.teams.length;
            this.updateTeamScores();
        }
        
        this.updateGameInfo();
        this.showNextWord();
        this.resetTimer();
        
        // Play sound
        if (this.state.soundEnabled) {
            this.playSound('correct');
        }
    }
    
    wrongGuess() {
        if (this.state.gameMode === 'teams') {
            this.state.currentTeam = (this.state.currentTeam + 1) % this.state.teams.length;
            this.updateTeamScores();
        }
        
        this.updateGameInfo();
        this.showNextWord();
        this.resetTimer();
        
        // Play sound
        if (this.state.soundEnabled) {
            this.playSound('wrong');
        }
    }
    
    skipWord() {
        if (this.state.gameMode === 'teams') {
            this.state.currentTeam = (this.state.currentTeam + 1) % this.state.teams.length;
            this.updateTeamScores();
        }
        
        this.updateGameInfo();
        this.showNextWord();
        this.resetTimer();
        
        // Play sound
        if (this.state.soundEnabled) {
            this.playSound('skip');
        }
    }
    
    resetTimer() {
        clearInterval(this.state.timerInterval);
        this.state.timeLeft = this.state.timerSeconds;
        this.updateTimerDisplay();
        this.startTimer();
    }
    
    updateGameInfo() {
        document.getElementById('currentScore').textContent = this.state.score;
        document.getElementById('wordsGuessedCount').textContent = this.state.wordsGuessed;
    }
    
    updateTeamScores() {
        document.getElementById('team1Score').textContent = this.state.teams[0].score;
        document.getElementById('team2Score').textContent = this.state.teams[1].score;
        
        // Update active team
        document.querySelectorAll('.team-score-card').forEach((card, index) => {
            if (index === this.state.currentTeam) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
    
    endGame() {
        if (this.state.isPlaying) {
            clearInterval(this.state.timerInterval);
            this.state.isPlaying = false;
            this.showResults();
            
            // Play sound
            if (this.state.soundEnabled) {
                this.playSound('game-end');
            }
        }
    }
    
    showResults() {
        this.switchScreen('results');
        
        // Update stats
        document.getElementById('winnerScore').textContent = `${this.state.score} очков`;
        document.getElementById('winnerDetails').textContent = 
            `Угадано ${this.state.wordsGuessed} из ${this.state.wordsList.length} слов`;
        
        // Determine winner for teams mode
        if (this.state.gameMode === 'teams') {
            let winner = null;
            let maxScore = -1;
            
            this.state.teams.forEach(team => {
                if (team.score > maxScore) {
                    maxScore = team.score;
                    winner = team;
                }
            });
            
            document.getElementById('winnerName').textContent = winner.name;
        } else {
            document.getElementById('winnerName').textContent = 'Отличная игра!';
        }
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Show confetti
        this.showConfetti();
    }
    
    updateLeaderboard() {
        const container = document.getElementById('leaderboardList');
        
        if (this.state.gameMode === 'teams') {
            // Sort teams by score
            const sortedTeams = [...this.state.teams].sort((a, b) => b.score - a.score);
            
            container.innerHTML = sortedTeams.map((team, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${team.name}</div>
                        <div class="leaderboard-stats">Режим команд</div>
                    </div>
                    <div class="leaderboard-score">${team.score}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">1</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">Ваш результат</div>
                        <div class="leaderboard-stats">Классический режим</div>
                    </div>
                    <div class="leaderboard-score">${this.state.score}</div>
                </div>
            `;
        }
    }
    
    showConfetti() {
        const container = document.getElementById('confettiContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
            confetti.style.animation = `confetti-fall ${1 + Math.random() * 2}s linear forwards`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            
            container.appendChild(confetti);
        }
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 3000);
    }
    
    playAgain() {
        this.switchScreen('game');
        this.startGame();
    }
    
    showCustomWords() {
        const input = document.getElementById('customWordsInput');
        input.value = this.state.customWords.join('\n');
        this.switchScreen('custom');
    }
    
    saveCustomWords() {
        const input = document.getElementById('customWordsInput').value;
        const words = input.split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0);
        
        this.state.customWords = words;
        localStorage.setItem('premiumGameCustomWords', JSON.stringify(words));
        
        this.showToast(`Сохранено ${words.length} слов!`);
        this.switchScreen('home');
    }
    
    clearCustomWords() {
        this.state.customWords = [];
        document.getElementById('customWordsInput').value = '';
        localStorage.removeItem('premiumGameCustomWords');
        this.showToast('Слова очищены!');
    }
    
    showToast(message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName + 'Screen').classList.add('active');
    }
    
    goHome() {
        if (this.state.isPlaying) {
            if (confirm('Выйти из игры? Текущий прогресс будет потерян.')) {
                clearInterval(this.state.timerInterval);
                this.state.isPlaying = false;
                this.switchScreen('home');
            }
        } else {
            this.switchScreen('home');
        }
    }
    
    loadSettings() {
        const saved = localStorage.getItem('premiumGameSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.state.gameType = settings.gameType || 'show';
                this.state.gameMode = settings.gameMode || 'classic';
                this.state.selectedCategories = settings.categories || ['objects', 'animals', 'actions'];
                this.state.wordsCount = settings.wordsCount || 10;
                this.state.timerSeconds = settings.timerSeconds || 60;
                
                // Update UI
                this.selectMode(this.state.gameType);
                this.updatePresetButtons('.preset-btn[data-mode]', this.state.gameMode);
                this.updatePresetButtons('.preset-btn[data-count]', this.state.wordsCount.toString());
                this.updatePresetButtons('.preset-btn[data-seconds]', this.state.timerSeconds.toString());
                
            } catch (e) {
                console.log('Ошибка загрузки настроек');
            }
        }
    }
    
    saveSettings() {
        const settings = {
            gameType: this.state.gameType,
            gameMode: this.state.gameMode,
            categories: this.state.selectedCategories,
            wordsCount: this.state.wordsCount,
            timerSeconds: this.state.timerSeconds
        };
        localStorage.setItem('premiumGameSettings', JSON.stringify(settings));
    }
    
    loadCustomWords() {
        const saved = localStorage.getItem('premiumGameCustomWords');
        if (saved) {
            try {
                this.state.customWords = JSON.parse(saved);
            } catch (e) {
                this.state.customWords = [];
            }
        }
    }
    
    getCategoryName(category) {
        const names = {
            'objects': 'Предметы',
            'animals': 'Животные',
            'actions': 'Действия',
            'professions': 'Профессии',
            'movies': 'Фильмы',
            'celebrities': 'Знаменитости',
            'food': 'Еда',
            'memnoe': 'Мемное',
            'adult': '18+',
            'technology': 'Технологии',
            'emotions': 'Эмоции',
            'countries': 'Страны',
            'cities': 'Города',
            'music': 'Музыка',
            'nature': 'Природа',
            'custom': 'Свои слова'
        };
        return names[category] || category;
    }
    
    playSound(type) {
        // In a real implementation, you would load audio files
        // For now, we'll just log
        console.log(`Playing sound: ${type}`);
        
        // Example: Create simple beep sounds using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'click':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    break;
                case 'correct':
                    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                    break;
                case 'wrong':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
                case 'skip':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'game-start':
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    break;
                case 'game-end':
                    oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        const icon = document.getElementById('soundToggleIcon');
        icon.className = this.state.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        this.showToast(this.state.soundEnabled ? 'Звук включен' : 'Звук выключен');
    }
    
    toggleTheme() {
        const html = document.documentElement;
        const icon = document.getElementById('themeIcon');
        
        if (html.getAttribute('data-theme') === 'light') {
            html.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-moon';
            this.showToast('Темная тема');
        } else {
            html.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-sun';
            this.showToast('Светлая тема');
        }
    }
    
    showRules() {
        document.getElementById('rulesModal').style.display = 'flex';
    }
    
    closeRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }
    
    resetSettings() {
        if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
            localStorage.removeItem('premiumGameSettings');
            localStorage.removeItem('premiumGameCustomWords');
            
            this.state = {
                gameType: 'show',
                gameMode: 'classic',
                selectedCategories: ['objects', 'animals', 'actions'],
                wordsCount: 10,
                timerSeconds: 60,
                currentWordIndex: 0,
                score: 0,
                wordsGuessed: 0,
                wordsList: [],
                timeLeft: 60,
                timerInterval: null,
                isPlaying: false,
                customWords: [],
                teams: [
                    { id: 1, name: 'Команда 1', score: 0, color: '#8b5cf6' },
                    { id: 2, name: 'Команда 2', score: 0, color: '#ec4899' }
                ],
                currentTeam: 0,
                soundEnabled: true
            };
            
            this.initCategories();
            this.updateUI();
            
            // Reset sliders
            document.getElementById('wordsCountSlider').value = 10;
            document.getElementById('timerSlider').value = 60;
            document.getElementById('wordsCountValue').textContent = '10';
            document.getElementById('timerValue').textContent = '60';
            
            this.updatePresetButtons('.preset-btn[data-count]', '10');
            this.updatePresetButtons('.preset-btn[data-seconds]', '60');
            this.updatePresetButtons('.preset-btn[data-mode]', 'classic');
            
            this.showToast('Настройки сброшены!');
        }
    }
}

// Initialize game when page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new PremiumGame();
    
    // Add gradient definitions to SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(svgNS, "defs");
    
    // Primary gradient
    const gradient1 = document.createElementNS(svgNS, "linearGradient");
    gradient1.setAttribute("id", "gradient-primary");
    gradient1.setAttribute("x1", "0%");
    gradient1.setAttribute("y1", "0%");
    gradient1.setAttribute("x2", "100%");
    gradient1.setAttribute("y2", "100%");
    
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#667eea");
    gradient1.appendChild(stop1);
    
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#764ba2");
    gradient1.appendChild(stop2);
    
    // Warning gradient
    const gradient2 = document.createElementNS(svgNS, "linearGradient");
    gradient2.setAttribute("id", "gradient-warning");
    gradient2.setAttribute("x1", "0%");
    gradient2.setAttribute("y1", "0%");
    gradient2.setAttribute("x2", "100%");
    gradient2.setAttribute("y2", "100%");
    
    const stop3 = document.createElementNS(svgNS, "stop");
    stop3.setAttribute("offset", "0%");
    stop3.setAttribute("stop-color", "#f59e0b");
    gradient2.appendChild(stop3);
    
    const stop4 = document.createElementNS(svgNS, "stop");
    stop4.setAttribute("offset", "100%");
    stop4.setAttribute("stop-color", "#ec4899");
    gradient2.appendChild(stop4);
    
    // Danger gradient
    const gradient3 = document.createElementNS(svgNS, "linearGradient");
    gradient3.setAttribute("id", "gradient-danger");
    gradient3.setAttribute("x1", "0%");
    gradient3.setAttribute("y1", "0%");
    gradient3.setAttribute("x2", "100%");
    gradient3.setAttribute("y2", "100%");
    
    const stop5 = document.createElementNS(svgNS, "stop");
    stop5.setAttribute("offset", "0%");
    stop5.setAttribute("stop-color", "#ef4444");
    gradient3.appendChild(stop5);
    
    const stop6 = document.createElementNS(svgNS, "stop");
    stop6.setAttribute("offset", "100%");
    stop6.setAttribute("stop-color", "#dc2626");
    gradient3.appendChild(stop6);
    
    defs.appendChild(gradient1);
    defs.appendChild(gradient2);
    defs.appendChild(gradient3);
    
    const timerSvg = document.querySelector('.timer-ring');
    timerSvg.insertBefore(defs, timerSvg.firstChild);
});

// Global functions for HTML onclick handlers
function startGame() { game.startGame(); }
function selectMode(mode) { game.selectMode(mode); }
function correctGuess() { game.correctGuess(); }
function wrongGuess() { game.wrongGuess(); }
function skipWord() { game.skipWord(); }
function endGame() { game.endGame(); }
function playAgain() { game.playAgain(); }
function goHome() { game.goHome(); }
function showCustomWords() { game.showCustomWords(); }
function saveCustomWords() { game.saveCustomWords(); }
function clearCustomWords() { game.clearCustomWords(); }
function toggleSound() { game.toggleSound(); }
function toggleTheme() { game.toggleTheme(); }
function showRules() { game.showRules(); }
function closeRules() { game.closeRules(); }
function resetSettings() { game.resetSettings(); }
