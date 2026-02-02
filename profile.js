// profile.js - Профиль пары (простая версия)
console.log('👫 Загружаю профиль пары...');

// Ждём загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена, настраиваю профиль...');
    
    // Функция показа профиля
    window.showProfile = function() {
        // Получаем имена
        const name1 = document.getElementById('userNameInput')?.value || 'Вы';
        const name2 = document.getElementById('partnerNameInput')?.value || 'Партнёр';
        
        // Создаём красивое окно профиля
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <h2 style="
                    color: #ff4d6d;
                    margin-top: 0;
                    text-align: center;
                ">
                    👫 ${name1} ❤️ ${name2}
                </h2>
                
                <!-- Статистика -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin: 25px 0;
                ">
                    <div style="
                        text-align: center;
                        padding: 20px;
                        border-radius: 15px;
                        background: #fff5f7;
                    ">
                        <div style="font-size: 32px;">🏆</div>
                        <div style="
                            font-size: 28px;
                            font-weight: bold;
                            color: #ff4d6d;
                            margin: 10px 0;
                        ">5</div>
                        <div style="color: #666;">Достижений</div>
                    </div>
                    
                    <div style="
                        text-align: center;
                        padding: 20px;
                        border-radius: 15px;
                        background: #fff5f7;
                    ">
                        <div style="font-size: 32px;">💖</div>
                        <div style="
                            font-size: 28px;
                            font-weight: bold;
                            color: #ff4d6d;
                            margin: 10px 0;
                        ">Уровень 3</div>
                        <div style="color: #666;">Любви</div>
                    </div>
                </div>
                
                <!-- Уровень любви -->
                <div style="margin: 25px 0;">
                    <h4 style="margin-bottom: 10px; color: #333;">💖 Уровень вашей любви</h4>
                    <div style="
                        height: 20px;
                        background: #f0f0f0;
                        border-radius: 10px;
                        overflow: hidden;
                        margin-bottom: 10px;
                    ">
                        <div style="
                            height: 100%;
                            width: 60%;
                            background: linear-gradient(90deg, #ff8e53, #ff4d6d);
                            border-radius: 10px;
                        "></div>
                    </div>
                    <div style="text-align: center; color: #666; font-size: 14px;">
                        Цветущая любовь 🌸
                    </div>
                </div>
                
                <!-- Онлайн-режим -->
                <div style="
                    background: linear-gradient(135deg, #f8f9ff, #fff5f7);
                    padding: 20px;
                    border-radius: 15px;
                    margin: 25px 0;
                    border: 2px solid #ff4d6d;
                ">
                    <h4 style="margin-top: 0; color: #ff4d6d;">🎮 Онлайн-режим (скоро!)</h4>
                    <p style="margin-bottom: 15px;">Приглашайте друзей-пар и играйте вместе!</p>
                    <button onclick="alert('Функция появится в следующем обновлении! 🚀')" style="
                        background: #ff4d6d;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 10px;
                        cursor: pointer;
                        width: 100%;
                        font-size: 16px;
                        font-weight: bold;
                    ">
                        👥 Пригласить друзей-пар
                    </button>
                </div>
                
                <!-- Кнопка закрытия -->
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 15px;
                    border-radius: 10px;
                    cursor: pointer;
                    width: 100%;
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 10px;
                ">
                    👍 Закрыть профиль
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Закрытие по клику вне окна
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });
    };
    
    console.log('✅ Профиль пары готов!');
});
