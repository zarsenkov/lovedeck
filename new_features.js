// new_features.js
console.log('✨ New Features загружен!');

// Функция для создания плавающих кнопок
function createFloatingButtons() {
    console.log('Создаём плавающие кнопки...');
    
    // Проверяем, не созданы ли уже кнопки
    if (document.getElementById('floatingNewFeatures')) {
        console.log('Кнопки уже существуют');
        return;
    }
    
    // Создаём контейнер для кнопок
    const floatingContainer = document.createElement('div');
    floatingContainer.id = 'floatingNewFeatures';
    floatingContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        gap: 10px;
        background: rgba(255,255,255,0.95);
        padding: 12px 15px;
        border-radius: 25px;
        box-shadow: 0 4px 25px rgba(0,0,0,0.15);
        border: 2px solid #ffccd5;
        backdrop-filter: blur(10px);
        animation: slideIn 0.5s ease-out;
    `;
    
    // Стиль для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        #floatingNewFeatures button {
            transition: all 0.3s ease;
        }
        
        #floatingNewFeatures button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
    `;
    document.head.appendChild(style);
    
    // Кнопка Пирамиды
    const pyramidBtn = document.createElement('button');
    pyramidBtn.id = 'floatingPyramidBtn';
    pyramidBtn.innerHTML = '🏆 Пирамида';
    pyramidBtn.style.cssText = `
        padding: 10px 18px;
        background: linear-gradient(135deg, #2196F3, #1565c0);
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 15px;
        cursor: pointer;
        font-weight: bold;
        white-space: nowrap;
    `;
    
    // Кнопка Удалённой игры
    const remoteBtn = document.createElement('button');
    remoteBtn.id = 'floatingRemoteBtn';
    remoteBtn.innerHTML = '🎮 Онлайн игра';
    remoteBtn.style.cssText = `
        padding: 10px 18px;
        background: linear-gradient(135deg, #ff6b8b, #ff4d6d);
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 15px;
        cursor: pointer;
        font-weight: bold;
        white-space: nowrap;
    `;
    
    // Обработчики событий
    pyramidBtn.addEventListener('click', function() {
        showPyramidModal();
    });
    
    remoteBtn.addEventListener('click', function() {
        showRemoteModal();
    });
    
    // Добавляем кнопки в контейнер
    floatingContainer.appendChild(pyramidBtn);
    floatingContainer.appendChild(remoteBtn);
    
    // Добавляем на страницу
    document.body.appendChild(floatingContainer);
    
    console.log('✅ Плавающие кнопки созданы!');
}

// Модальное окно Пирамиды
function showPyramidModal() {
    const modalHTML = `
        <div id="pyramidModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
            ">
                <button onclick="document.getElementById('pyramidModal').remove()" 
                        style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; color: #666; cursor: pointer;">
                    ×
                </button>
                
                <h2 style="color: #2196F3; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                    🏆 Пирамида Любви
                </h2>
                
                <div style="margin: 20px 0;">
                    <p><strong>Соревновательный режим для пар!</strong></p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <h4 style="color: #2196F3; margin-top: 0;">🎯 Что будет:</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>8 уровней отношений (от "Знакомства" до "Любви")</li>
                            <li>Глобальный рейтинг пар</li>
                            <li>Еженедельные челленджи с призами</li>
                            <li>Достижения и награды</li>
                            <li>Прогресс вашей пары</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <h4 style="color: #e65100; margin-top: 0;">⏳ Статус:</h4>
                        <p>Эта функция находится в активной разработке.</p>
                        <p>Ожидайте обновления в следующей версии!</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="document.getElementById('pyramidModal').remove()" 
                            style="padding: 12px 30px; background: linear-gradient(135deg, #2196F3, #1565c0); color: white; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;">
                        Понятно, жду!
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Модальное окно Удалённой игры
function showRemoteModal() {
    const modalHTML = `
        <div id="remoteModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
            ">
                <button onclick="document.getElementById('remoteModal').remove()" 
                        style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; color: #666; cursor: pointer;">
                    ×
                </button>
                
                <h2 style="color: #ff6b8b; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                    🎮 Игра на расстоянии
                </h2>
                
                <div style="margin: 20px 0;">
                    <p><strong>Играйте вместе, даже если вы далеко друг от друга!</strong></p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <h4 style="color: #ff6b8b; margin-top: 0;">✨ Возможности:</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Создание совместных игровых сессий</li>
                            <li>Приглашение партнёра по ссылке</li>
                            <li>Синхронизация карт в реальном времени</li>
                            <li>Видите, какие карты открывает партнёр</li>
                            <li>Уведомления о действиях друг друга</li>
                            <li>Общий прогресс и статистика</li>
                        </ul>
                    </div>
                    
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <h4 style="color: #2E7D32; margin-top: 0;">💡 Идеально для:</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Пар на расстоянии (LDR)</li>
                            <li>Свиданий онлайн</li>
                            <li>Игры по видеосвязи</li>
                            <li>Сюрпризов для партнёра</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <h4 style="color: #e65100; margin-top: 0;">⏳ Статус:</h4>
                        <p>Эта функция находится в активной разработке.</p>
                        <p>Ожидайте обновления в следующей версии!</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="document.getElementById('remoteModal').remove()" 
                            style="padding: 12px 30px; background: linear-gradient(135deg, #ff6b8b, #ff4d6d); color: white; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;">
                        Отлично, жду!
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Экспортируем функции в глобальную область видимости
window.createFloatingButtons = createFloatingButtons;
window.showPyramidModal = showPyramidModal;
window.showRemoteModal = showRemoteModal;

// Запускаем создание кнопок при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Ждём немного, чтобы страница полностью загрузилась
    setTimeout(createFloatingButtons, 1000);
});

// Также запускаем при полной загрузке страницы
window.addEventListener('load', function() {
    createFloatingButtons();
});
