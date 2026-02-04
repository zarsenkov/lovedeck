// ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ

// Глобальные переменные
let currentTheme = '';
let currentCard = null;
let sessionCounter = 0;
let totalCardsShown = 0;
let favoriteCards = [];
let customCards = [];
let timer = null;
let timerSeconds = 0;

// В начале файла app.js:
document.addEventListener('DOMContentLoaded', function() {
    console.log('LoveCouple загружен!');
    
    // РОМАНТИЧЕСКИЕ ЦИТАТЫ (будет выбираться одна случайная)
    const loveQuotes = [
        "💖 Любовь — это когда тишина между вами комфортна",
        "🌟 Настоящая любовь не в том, чтобы не расставаться, а в том, чтобы всегда возвращаться",
        "✨ Любить — значит видеть человека таким, каким его задумал Бог",
        "🌹 Самые важные слова в отношениях: 'Я слушаю' и 'Я здесь'",
        "💑 Идеальных отношений не бывает, бывают те, ради которых стоит стараться",
        "💕 Любовь — это не взгляды, а взгляды в одном направлении",
        "🌠 Иногда самые обычные моменты становятся самыми дорогими воспоминаниями",
        "💞 Настоящая близость — когда можно молчать вместе и это не неловко",
        "🌸 Любовь — это не история длиной в жизнь, а жизнь длиной в историю",
        "💗 Самые крепкие отношения строятся на дружбе, уважении и общих глупостях",
        "🔥 Любовь — это когда твоё счастье становится моим счастьем",
        "🌈 Настоящая любовь не ищет совершенства, она принимает несовершенства",
        "🎯 Любить — значит радоваться успехам партнёра как своим собственным",
        "🕊️ Любовь — это безопасное место, где можно быть собой",
        "💌 Самые важные слова в любви часто остаются несказанными",
        "🌙 Настоящая любовь светит даже в самые тёмные ночи",
        "🎁 Любовь — это не то, что ты получаешь, а то, что ты отдаёшь",
        "⚡ Иногда любовь приходит тихо, но меняет всё громко",
        "🦋 Любовь — это когда сердце находит свой дом",
        "☀️ Настоящая любовь согревает даже в самый холодный день"
    ];
    
    // Выбираем ОДНУ случайную цитату
    const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
    
    // Устанавливаем эту цитату как текст загрузки
    const quoteElement = document.getElementById('loading-quote');
    if (quoteElement) {
        quoteElement.textContent = randomQuote;
    }
    
    // Загружаем данные
    loadSavedData();
    
    // Скрываем экран загрузки через 2 секунды
    setTimeout(() => {
        hideLoadingScreen();
    }, 2000);
    
    // Настройка событий
    setupEventListeners();
});

// Функция для скрытия экрана загрузки
function hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}


// Загрузка сохранённых данных
function loadSavedData() {
    // Имена
    const name1 = localStorage.getItem('lovecouple_name1') || '';
    const name2 = localStorage.getItem('lovecouple_name2') || '';
    
    if (name1) document.getElementById('name1').value = name1;
    if (name2) document.getElementById('name2').value = name2;
    
    // Статистика
    const savedStats = localStorage.getItem('lovecouple_stats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        totalCardsShown = stats.totalCardsShown || 0;
        favoriteCards = stats.favoriteCards || [];
        customCards = stats.customCards || [];
        sessionCounter = 0; // Сбрасываем счётчик сессии
    }
    
    // Обновляем пример имени
    updateNameExample();
}

// Сохранение данных
function saveData() {
    const stats = {
        totalCardsShown: totalCardsShown,
        favoriteCards: favoriteCards,
        customCards: customCards,
        lastPlayed: new Date().toISOString()
    };
    
    localStorage.setItem('lovecouple_stats', JSON.stringify(stats));
}

// Сброс статистики
function resetStats() {
    if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
        totalCardsShown = 0;
        favoriteCards = [];
        customCards = [];
        sessionCounter = 0;
        resetCardUsage();
        
        localStorage.removeItem('lovecouple_stats');
        
        showNotification('Статистика сброшена! 🗑️', 'success');
        showStats(); // Обновляем окно статистики
    }
}

// Обновление примера имени
function updateNameExample() {
    const name = document.getElementById('name1').value || 'Алекс';
    document.getElementById('name-example').textContent = name;
}

// Сохранение имён
function saveNames() {
    const name1 = document.getElementById('name1').value.trim();
    const name2 = document.getElementById('name2').value.trim();
    
    if (!name1 || !name2) {
        showNotification('Пожалуйста, введите оба имени', 'warning');
        return;
    }
    
    localStorage.setItem('lovecouple_name1', name1);
    localStorage.setItem('lovecouple_name2', name2);
    
    goToScreen('screen-theme');
    showNotification('Имена сохранены! ✨');
}

// Переход между экранами
function goToScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем нужный экран
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        
        // Прокручиваем вверх
        screen.scrollIntoView({ behavior: 'smooth' });
    }
}

// Выбор темы
function selectTheme(theme) {
    currentTheme = theme;
    sessionCounter = 0; // Сбрасываем счётчик при смене темы
    
    // Обновляем текст темы
    const themeNames = {
        romance: '💖 Романтика',
        fun: '😄 Весёлое',
        adult: '🔥 18+',
        dates: '🗺️ Свидания'
    };
    
    document.getElementById('card-theme').textContent = `Тема: ${themeNames[theme] || theme}`;
    
    goToScreen('screen-game');
    nextCard();
}

// Следующая карточка
function nextCard() {
    sessionCounter++;
    totalCardsShown++;
    
    // Сбрасываем таймер
    stopTimer();
    
    // Получаем карточку
    let cardContent;
    const type = Math.random() > 0.5 ? 'questions' : 'actions';
    
    // Проверяем пользовательские карточки (5% шанс)
    if (customCards.length > 0 && Math.random() < 0.05) {
        const customCard = customCards[Math.floor(Math.random() * customCards.length)];
        cardContent = {
            text: customCard.text,
            isPlace: false,
            isCustom: true
        };
    } else {
        // Получаем случайную карточку из банка
        cardContent = getRandomCard(currentTheme, type);
    }
    
    // Определяем тип карточки
    let cardType = '💬 Вопрос';
    if (type === 'actions') cardType = '🎯 Действие';
    if (cardContent.isPlace) cardType = '🗺️ Место';
    if (cardContent.isCustom) cardType = '✨ Ваша карточка';
    
    // Заменяем имена
    const name1 = localStorage.getItem('lovecouple_name1') || 'Первый партнёр';
    const name2 = localStorage.getItem('lovecouple_name2') || 'Второй партнёр';
    
    // Получаем текст карточки
    let cardText;
    if (cardContent.isPlace) {
        // Для мест: только название и город (без описания, так как оно будет дублироваться)
        cardText = `${cardContent.name} (${cardContent.city})`;
    } else {
        // Для обычных карточек заменяем имена в тексте
        cardText = replaceNames(cardContent.text, name1, name2);
    }
    
    // Сохраняем текущую карточку
    currentCard = {
        text: cardText,
        type: cardType,
        theme: currentTheme,
        isPlace: cardContent.isPlace || false,
        isCustom: cardContent.isCustom || false,
        place: cardContent.isPlace ? cardContent : null,
        id: Date.now(),
        timestamp: new Date().toISOString()
    };
    
    // Обновляем интерфейс
    document.getElementById('card-text').textContent = cardText;
    document.getElementById('card-type').textContent = cardType;
    document.getElementById('card-counter').textContent = `Карточка #${sessionCounter}`;
    
    // Показываем/скрываем детали мест
    const details = document.getElementById('card-details');
    if (cardContent.isPlace) {
        details.style.display = 'block';
        document.getElementById('detail-location').textContent = cardContent.location || '-';
        document.getElementById('detail-budget').textContent = cardContent.budget || '-';
        
        // Показываем ВСЕ советы через запятую
        if (cardContent.tips && cardContent.tips.length > 0) {
            const allTips = cardContent.tips.join(', ');
            document.getElementById('detail-tip').textContent = allTips;
        } else {
            document.getElementById('detail-tip').textContent = 'Наслаждайтесь моментом!';
        }
    } else {
        details.style.display = 'none';
    }
    
    // Обновляем кнопку избранного
    updateFavoriteButton();
    
    // Анимация
    animateCard();
    
    // Сохраняем статистику
    saveData();
}

// Анимация карточки
function animateCard() {
    const card = document.querySelector('.game-card');
    const btn = document.getElementById('btn-next');
    
    if (card) {
        card.classList.remove('card-animation');
        void card.offsetWidth; // Триггер перерисовки
        card.classList.add('card-animation');
    }
    
    if (btn) {
        btn.classList.add('vibrate');
        setTimeout(() => btn.classList.remove('vibrate'), 100);
    }
}

// Добавить/убрать из избранного
function toggleFavorite() {
    if (!currentCard) return;
    
    const index = favoriteCards.findIndex(card => card.id === currentCard.id);
    const btn = document.getElementById('btn-favorite');
    
    if (index === -1) {
        // Добавляем в избранное
        favoriteCards.push(currentCard);
        btn.classList.add('active');
        showNotification('Добавлено в избранное! ⭐');
    } else {
        // Удаляем из избранного
        favoriteCards.splice(index, 1);
        btn.classList.remove('active');
        showNotification('Удалено из избранного');
    }
    
    saveData();
}

// Обновить кнопку избранного
function updateFavoriteButton() {
    const btn = document.getElementById('btn-favorite');
    if (!currentCard) {
        btn.classList.remove('active');
        return;
    }
    
    const isFavorite = favoriteCards.some(card => card.id === currentCard.id);
    btn.classList.toggle('active', isFavorite);
}

// Удалить из избранного
function removeFavorite(cardId) {
    favoriteCards = favoriteCards.filter(card => card.id !== cardId);
    showFavorites(); // Обновляем список
    saveData();
    showNotification('Удалено из избранного');
}

// Запустить таймер
function startTimer(minutes) {
    stopTimer();
    
    timerSeconds = minutes * 60;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            stopTimer();
            showNotification('⏰ Время вышло! Пора двигаться дальше', 'warning');
        }
    }, 1000);
}

// Обновить отображение таймера
function updateTimerDisplay() {
    const timerElement = document.getElementById('card-timer');
    if (timerElement) {
        const mins = Math.floor(timerSeconds / 60);
        const secs = timerSeconds % 60;
        timerElement.textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
        timerElement.style.color = timerSeconds < 60 ? '#ff4444' : '#666';
    }
}

// Остановить таймер
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    document.getElementById('card-timer').textContent = '⏱️';
    document.getElementById('card-timer').style.color = '';
}

// Показать статистику
function showStats() {
    const statsContent = document.getElementById('stats-content');
    
    const remainingCards = getRemainingCards(currentTheme || 'romance');
    
    const statsHTML = `
        <div class="stat-item">
            <div class="stat-value">${sessionCounter}</div>
            <div class="stat-label">В этой сессии</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${totalCardsShown}</div>
            <div class="stat-label">Всего показано</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${favoriteCards.length}</div>
            <div class="stat-label">В избранном</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${remainingCards}</div>
            <div class="stat-label">Осталось карточек</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${customCards.length}</div>
            <div class="stat-label">Ваших карточек</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${new Date().toLocaleDateString('ru-RU')}</div>
            <div class="stat-label">Последняя игра</div>
        </div>
        
        <div style="grid-column: span 2; margin-top: 20px; text-align: center;">
            <button class="btn-secondary" onclick="resetStats()" style="padding: 10px 20px; font-size: 14px;">
                🗑️ Сбросить статистику
            </button>
        </div>
    `;
    
    statsContent.innerHTML = statsHTML;
    openModal('modal-stats');
}

// Показать избранное
function showFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    
    if (favoriteCards.length === 0) {
        favoritesList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <div style="font-size: 40px; margin-bottom: 10px;">⭐</div>
                <p>Избранные карточки появятся здесь</p>
                <small>Нажимайте ☆ на карточках, чтобы добавлять их сюда</small>
            </div>
        `;
    } else {
        let html = '';
        favoriteCards.forEach((card, index) => {
            const date = new Date(card.timestamp).toLocaleDateString('ru-RU');
            html += `
                <div class="favorite-item">
                    <div class="favorite-text">${card.text}</div>
                    <div class="favorite-meta">
                        <span>${card.type} • ${card.theme}</span>
                        <span>${date}</span>
                    </div>
                    <button class="remove-favorite" onclick="removeFavorite(${card.id})">×</button>
                </div>
            `;
        });
        favoritesList.innerHTML = html;
    }
    
    openModal('modal-favorites');
}

// Создание своей карточки
function createCustomCard() {
    openModal('modal-custom');
    
    // Обновление счётчика символов
    const textarea = document.getElementById('custom-text');
    const counter = document.getElementById('char-counter');
    
    textarea.addEventListener('input', function() {
        counter.textContent = this.value.length;
    });
}

// Сохранение своей карточки
function saveCustomCard() {
    const theme = document.getElementById('custom-theme').value;
    const type = document.getElementById('custom-type').value;
    const text = document.getElementById('custom-text').value.trim();
    
    if (!text) {
        showNotification('Введите текст карточки', 'warning');
        return;
    }
    
    if (text.length > 200) {
        showNotification('Слишком длинный текст (максимум 200 символов)', 'warning');
        return;
    }
    
    // Создаём карточку
    const customCard = {
        id: Date.now(),
        text: text,
        theme: theme,
        type: type,
        created: new Date().toISOString()
    };
    
    // Проверяем, нет ли уже такой карточки
    const exists = customCards.some(card => 
        card.text === text && card.theme === theme && card.type === type
    );
    
    if (exists) {
        showNotification('Такая карточка уже существует!', 'warning');
        return;
    }
    
    // Добавляем в массив пользовательских карточек
    customCards.push(customCard);
    
    // Очищаем форму
    document.getElementById('custom-text').value = '';
    document.getElementById('char-counter').textContent = '0';
    
    closeModal('modal-custom');
    showNotification('Карточка сохранена! Теперь она будет появляться в игре ✨');
    
    saveData();
}

// Показать свои карточки
function showMyCards() {
    const modal = document.getElementById('modal-mycards');
    if (!modal) {
        // Создаём модальное окно для своих карточек
        const modalHTML = `
            <div id="modal-mycards" class="modal">
                <div class="modal-content">
                    <h2>✨ Ваши карточки</h2>
                    <div class="mycards-list" id="mycards-list"></div>
                    <button class="btn-primary" onclick="closeModal('modal-mycards')">Закрыть</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    const mycardsList = document.getElementById('mycards-list');
    
    if (customCards.length === 0) {
        mycardsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <div style="font-size: 40px; margin-bottom: 10px;">✨</div>
                <p>У вас пока нет своих карточек</p>
                <small>Создайте первую карточку с помощью кнопки "Создать карточку"</small>
            </div>
        `;
    } else {
        let html = '';
        customCards.forEach((card, index) => {
            const date = new Date(card.created).toLocaleDateString('ru-RU');
            const themeNames = {
                romance: '💖 Романтика',
                fun: '😄 Весёлое',
                adult: '🔥 18+',
                dates: '🗺️ Свидания'
            };
            const typeNames = {
                question: '💬 Вопрос',
                action: '🎯 Действие'
            };
            
            html += `
                <div class="favorite-item">
                    <div class="favorite-text">${card.text}</div>
                    <div class="favorite-meta">
                        <span>${typeNames[card.type] || card.type} • ${themeNames[card.theme] || card.theme}</span>
                        <span>${date}</span>
                    </div>
                    <button class="remove-favorite" onclick="removeCustomCard(${card.id})">×</button>
                </div>
            `;
        });
        mycardsList.innerHTML = html;
    }
    
    openModal('modal-mycards');
}

// Удалить свою карточку
function removeCustomCard(cardId) {
    customCards = customCards.filter(card => card.id !== cardId);
    showMyCards(); // Обновляем список
    saveData();
    showNotification('Карточка удалена');
}

// Управление модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Устанавливаем цвет в зависимости от типа
    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#ff9800',
        error: '#f44336'
    };
    
    notification.textContent = message;
    notification.style.borderLeftColor = colors[type] || colors.info;
    notification.classList.add('show');
    
    // Автоскрытие
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Автообновление примера имени
    document.getElementById('name1').addEventListener('input', updateNameExample);
    
    // Enter для сохранения имён
    document.getElementById('name1').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('name2').focus();
    });
    
    document.getElementById('name2').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveNames();
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Закрытие модальных окон по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
    
    // Сохранение при закрытии страницы
    window.addEventListener('beforeunload', saveData);
}

// Глобальные функции
window.saveNames = saveNames;
window.selectTheme = selectTheme;
window.goToScreen = goToScreen;
window.nextCard = nextCard;
window.toggleFavorite = toggleFavorite;
window.startTimer = startTimer;
window.showStats = showStats;
window.showFavorites = showFavorites;
window.createCustomCard = createCustomCard;
window.saveCustomCard = saveCustomCard;
window.showMyCards = showMyCards;
window.removeCustomCard = removeCustomCard;
window.openModal = openModal;
window.closeModal = closeModal;
window.removeFavorite = removeFavorite;
window.resetStats = resetStats;
