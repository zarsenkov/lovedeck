// Соревновательная пирамида для пар
const LovePyramid = {
    levels: [
        { name: "Начало", points: 0, color: "#e3f2fd", cards: 5 },
        { name: "Знакомство", points: 10, color: "#bbdefb", cards: 10 },
        { name: "Симпатия", points: 25, color: "#90caf9", cards: 15 },
        { name: "Привязанность", points: 50, color: "#64b5f6", cards: 20 },
        { name: "Влюблённость", points: 100, color: "#42a5f5", cards: 25 },
        { name: "Гармония", points: 200, color: "#2196f3", cards: 30 },
        { name: "Единство", points: 500, color: "#1e88e5", cards: 40 },
        { name: "Любовь", points: 1000, color: "#1565c0", cards: 50 }
    ],
    
    // Получить уровень пары по очкам
    getLevel: function(points) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (points >= this.levels[i].points) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    },
    
    // Рассчитать очки
    calculatePoints: function(stats) {
        return (stats.opened || 0) * 1 + 
               (stats.liked || 0) * 3 + 
               (stats.completed || 0) * 10;
    },
    
    // Показать пирамиду
    showPyramid: function(userPoints = 0, globalRanking = []) {
        const modalHTML = `
            <div id="pyramid-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    max-width: 800px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <h2 style="color: #ff6b8b; margin: 0;">🏆 Пирамида Любви</h2>
                        <button onclick="document.getElementById('pyramid-modal').remove()" 
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
                            ×
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 40px; flex-wrap: wrap;">
                        <!-- Левая часть: пирамида уровней -->
                        <div style="flex: 1; min-width: 300px;">
                            <h3 style="color: #666; margin-bottom: 20px;">Ваш прогресс</h3>
                            <div style="
                                background: linear-gradient(to bottom, #fff5f7, #fff);
                                padding: 20px;
                                border-radius: 15px;
                                border: 2px solid #ffccd5;
                            ">
                                ${this.renderPyramidLevels(userPoints)}
                            </div>
                        </div>
                        
                        <!-- Правая часть: рейтинг -->
                        <div style="flex: 1; min-width: 300px;">
                            <h3 style="color: #666; margin-bottom: 20px;">Рейтинг пар</h3>
                            <div style="
                                background: linear-gradient(to bottom, #f8f9fa, #fff);
                                padding: 20px;
                                border-radius: 15px;
                                border: 2px solid #e9ecef;
                                max-height: 400px;
                                overflow-y: auto;
                            ">
                                ${this.renderRanking(globalRanking, userPoints)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Статистика пользователя -->
                    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <h4 style="color: #666; margin-top: 0;">Ваша статистика</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            <div style="text-align: center;">
                                <div style="font-size: 32px; color: #ff6b8b;">${userPoints}</div>
                                <div style="color: #888; font-size: 14px;">очков</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 32px; color: #4CAF50;">${this.getLevel(userPoints).name}</div>
                                <div style="color: #888; font-size: 14px;">текущий уровень</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 32px; color: #2196F3;">
                                    ${this.getNextLevelPoints(userPoints)}
                                </div>
                                <div style="color: #888; font-size: 14px;">до след. уровня</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="shareAchievement()" 
                                style="padding: 12px 24px; background: linear-gradient(135deg, #ff6b8b, #ff8e53); 
                                       color: white; border: none; border-radius: 25px; cursor: pointer; 
                                       font-weight: bold; margin: 5px;">
                            📢 Поделиться достижением
                        </button>
                        <button onclick="startPyramidChallenge()" 
                                style="padding: 12px 24px; background: linear-gradient(135deg, #4CAF50, #2E7D32); 
                                       color: white; border: none; border-radius: 25px; cursor: pointer; 
                                       font-weight: bold; margin: 5px;">
                            🎯 Начать челлендж
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    // Рендер уровней пирамиды
    renderPyramidLevels: function(userPoints) {
        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];
            const isUnlocked = userPoints >= level.points;
            const isCurrent = userPoints >= level.points && 
                             (i === this.levels.length - 1 || userPoints < this.levels[i + 1].points);
            
            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    background: ${isUnlocked ? level.color : '#f5f5f5'};
                    border-radius: 10px;
                    border: 2px solid ${isCurrent ? '#ff6b8b' : (isUnlocked ? level.color : '#ddd')};
                    opacity: ${isUnlocked ? 1 : 0.6};
                    transition: all 0.3s;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: ${isUnlocked ? '#ff6b8b' : '#ccc'};
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        margin-right: 15px;
                    ">
                        ${i + 1}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: ${isUnlocked ? '#333' : '#888'}">
                            ${level.name}
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            от ${level.points} очков • ${level.cards} карт
                        </div>
                    </div>
                    ${isCurrent ? '<div style="color: #ff6b8b; font-weight: bold;">★ Текущий</div>' : 
                      isUnlocked ? '<div style="color: #4CAF50;">✓ Открыт</div>' : 
                      '<div style="color: #999;">🔒 Закрыт</div>'}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    // Рендер рейтинга
    renderRanking: function(ranking, userPoints) {
        if (!ranking || ranking.length === 0) {
            return `
                <div style="text-align: center; padding: 40px 20px; color: #888;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🏆</div>
                    <div style="font-size: 18px; margin-bottom: 10px;">Рейтинг пока пуст</div>
                    <div>Будьте первыми!</div>
                </div>
            `;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        
        ranking.slice(0, 10).forEach((couple, index) => {
            const isUser = couple.points === userPoints; // Упрощенная проверка
            
            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    background: ${isUser ? '#fff3cd' : 'white'};
                    border-radius: 8px;
                    border: 1px solid ${isUser ? '#ffd166' : '#eee'};
                    transition: all 0.3s;
                ">
                    <div style="
                        width: 30px;
                        text-align: center;
                        font-weight: bold;
                        color: ${index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] : '#666'};
                    ">
                        ${index + 1}
                    </div>
                    <div style="flex: 1; margin: 0 15px;">
                        <div style="font-weight: bold; color: #333;">
                            ${couple.name || `Пара #${couple.id}`}
                        </div>
                        <div style="font-size: 12px; color: #888;">
                            ${this.getLevel(couple.points).name}
                        </div>
                    </div>
                    <div style="font-weight: bold; color: #ff6b8b;">
                        ${couple.points} очков
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    // Получить очки до следующего уровня
    getNextLevelPoints: function(currentPoints) {
        for (let i = 0; i < this.levels.length; i++) {
            if (currentPoints < this.levels[i].points) {
                return this.levels[i].points - currentPoints;
            }
        }
        return 'Максимум!';
    }
};

// Добавляем кнопку пирамиды
function addPyramidButton() {
    const pyramidBtn = document.createElement('button');
    pyramidBtn.id = 'pyramid-btn';
    pyramidBtn.innerHTML = '🏆 Пирамида';
    pyramidBtn.title = 'Соревновательный режим';
    pyramidBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #2196F3, #1565c0);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    pyramidBtn.onclick = function() {
        // Получаем статистику пользователя
        const stats = DeckManager ? DeckManager.getStats() : { opened: 0, liked: 0, completed: 0 };
        const points = LovePyramid.calculatePoints(stats);
        
        // Загружаем глобальный рейтинг (пока моковые данные)
        const mockRanking = [
            { id: 1, name: "Ромео & Джульетта", points: 1250 },
            { id: 2, name: "Алекс & Мария", points: 890 },
            { id: 3, name: "Сергей & Анна", points: 720 },
            { id: 4, name: "Владимир & Ольга", points: 540 },
            { id: 5, name: "Иван & Елена", points: 430 },
            { id: 6, name: points > 430 ? "Вы" : "Пётр & Светлана", points: Math.max(points, 380) },
            { id: 7, name: "Дмитрий & Наталья", points: 310 },
            { id: 8, name: "Андрей & Виктория", points: 290 },
            { id: 9, name: "Максим & Юлия", points: 210 },
            { id: 10, name: "Артём & Ксения", points: 180 }
        ].sort((a, b) => b.points - a.points);
        
        LovePyramid.showPyramid(points, mockRanking);
    };
    
    pyramidBtn.onmouseenter = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
    };
    
    pyramidBtn.onmouseleave = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
    };
    
    document.body.appendChild(pyramidBtn);
}

// Глобальные функции
window.shareAchievement = function() {
    const stats = DeckManager ? DeckManager.getStats() : { opened: 0, liked: 0, completed: 0 };
    const points = LovePyramid.calculatePoints(stats);
    const level = LovePyramid.getLevel(points);
    
    const shareText = `🏆 Я достиг(ла) уровня "${level.name}" в LoveDeck! 
Набрал(а) ${points} очков любви ❤️
Присоединяйтесь: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Мое достижение в LoveDeck',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Текст достижения скопирован! Вставьте его в соцсети 📋');
        });
    }
};

window.startPyramidChallenge = function() {
    alert('🎯 Челлендж начался! Выполните 5 карточек за 24 часа, чтобы получить двойные очки!');
    // Здесь можно добавить логику челленджа
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    addPyramidButton();
});
