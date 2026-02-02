// profile.js - Профиль пары с достижениями
console.log('👫 Загружаю профиль пары...');

// 1. КНОПКА ПРОФИЛЯ
function createProfileButton() {
    console.log('🔧 Создаю кнопку профиля...');
    
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('profileBtn');
    if (oldBtn) oldBtn.remove();
    
    // Создаём новую кнопку
    const profileBtn = document.createElement('button');
    profileBtn.id = 'profileBtn';
    profileBtn.innerHTML = '👫';
    profileBtn.title = 'Ваш профиль пары';
    profileBtn.className = 'floating-button';
    
    // Стили
    profileBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6b8b, #ff8e53);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Обработчик клика
    profileBtn.onclick = showProfile;
    
    // Добавляем на страницу
    document.body.appendChild(profileBtn);
    console.log('✅ Кнопка профиля создана');
}

// 2. ПОКАЗАТЬ ПРОФИЛЬ
async function showProfile() {
    console.log('🎭 Показываю профиль...');
    
    // Получаем имена из формы
    const name1 = document.getElementById('userNameInput')?.value || 'Вы';
    const name2 = document.getElementById('partnerNameInput')?.value || 'Партнёр';
    
    // Создаём модальное окно профиля
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">👫 Профиль вашей пары</h2>
            
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-circle" style="background: linear-gradient(135deg, #ff6b8b, #ff8e53);">
                        ${name1.charAt(0)}❤️${name2.charAt(0)}
                    </div>
                    <div class="avatar-status online">● онлайн</div>
                </div>
                
                <div class="profile-info">
                    <h3>${name1} ❤️ ${name2}</h3>
                    <p class="profile-desc">Самая лучшая пара в мире! 💑</p>
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-icon">🎮</div>
                    <div class="stat-value" id="statTotalCards">0</div>
                    <div class="stat-label">Всего карточек</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value" id="statCompleted">0</div>
                    <div class="stat-label">Выполнено</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value" id="statFavorites">0</div>
                    <div class="stat-label">Избранное</div>
                </div>
            </div>
            
            <div class="achievements-section">
                <h4>🏆 Ваши достижения</h4>
                <div class="achievements-grid" id="achievementsGrid">
                    <!-- Достижения появятся здесь -->
                </div>
            </div>
            
            <div class="love-meter">
                <h4>💖 Уровень вашей любви</h4>
                <div class="meter-bar">
                    <div class="meter-fill" id="loveMeter" style="width: 30%"></div>
                </div>
                <div class="meter-label">Уровень 3 - Цветущая любовь 🌸</div>
            </div>
            
            <div class="profile-actions">
                <button class="action-button" onclick="shareProfile()">
                    📤 Поделиться профилем
                </button>
                <button class="action-button secondary" onclick="inviteFriends()">
                    👥 Пригласить друзей-пар
                </button>
            </div>
            
            <div class="modal-buttons">
                <button onclick="closeModal()" class="primary-button">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Загружаем статистику
    await loadProfileStats();
    
    // Закрытие по клику вне окна
    modal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// 3. ЗАГРУЗИТЬ СТАТИСТИКУ
async function loadProfileStats() {
    console.log('📊 Загружаю статистику...');
    
    try {
        // Получаем данные из localStorage
        const favorites = JSON.parse(localStorage.getItem('loveDeck_favorites') || '[]');
        const completed = JSON.parse(localStorage.getItem('loveDeck_completed') || '[]');
        
        // Обновляем цифры
        document.getElementById('statTotalCards').textContent = 
            localStorage.getItem('loveDeck_counter') || '0';
        document.getElementById('statFavorites').textContent = favorites.length;
        document.getElementById('statCompleted').textContent = completed.length;
        
        // Показываем достижения
        showAchievements(favorites.length, completed.length);
        
    } catch (error) {
        console.log('Ошибка загрузки статистики:', error);
    }
}

// 4. ПОКАЗАТЬ ДОСТИЖЕНИЯ
function showAchievements(favCount, compCount) {
    const achievementsGrid = document.getElementById('achievementsGrid');
    const achievements = [];
    
    // Базовые достижения
    if (favCount >= 1) achievements.push({ icon: '⭐', title: 'Первое избранное', desc: 'Сохранили первую карточку' });
    if (compCount >= 1) achievements.push({ icon: '✅', title: 'Первый шаг', desc: 'Выполнили первое задание' });
    if (favCount >= 5) achievements.push({ icon: '🏆', title: 'Коллекционер', desc: '5 карточек в избранном' });
    if (compCount >= 10) achievements.push({ icon: '👑', title: 'Эксперт любви', desc: '10 выполненных заданий' });
    
    // Всегда показываем хотя бы одно
    if (achievements.length === 0) {
        achievements.push({ icon: '🌱', title: 'Новичок', desc: 'Сделайте первый шаг!' });
    }
    
    // Рендерим достижения
    achievementsGrid.innerHTML = achievements.map(ach => `
        <div class="achievement-card">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        </div>
    `).join('');
}

// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function closeModal() {
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
}

function shareProfile() {
    const name1 = document.getElementById('userNameInput')?.value || 'Мы';
    const name2 = document.getElementById('partnerNameInput')?.value || 'Партнёр';
    
    const text = `👫 Посмотрите профиль нашей пары в LoveCouple!\n\n${name1} ❤️ ${name2}\n\nИграйте вместе и укрепляйте отношения! 💑\n\nlovecouple.ru`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Наш профиль в LoveCouple',
            text: text,
            url: 'https://lovecouple.ru'
        });
    } else {
        navigator.clipboard.writeText(text);
        alert('📋 Профиль скопирован! Отправьте друзьям.');
    }
}

function inviteFriends() {
    alert('👥 Функция приглашения друзей скоро появится!\n\nВы сможете приглашать другие пары и соревноваться в любви! 🏆');
}

// 6. ЗАПУСК ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена, создаю профиль...');
    
    // Ждём 2 секунды для полной загрузки
    setTimeout(() => {
        createProfileButton();
        
        // Обновляем кнопку входа
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            // Добавляем подсказку
            loginBtn.title = 'Войти для онлайн-режима и синхронизации';
        }
        
        console.log('✅ Профиль пары готов!');
    }, 2000);
});
