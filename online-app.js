// LoveDeck - функции для онлайн-режима (упрощённая версия без локальной игры)

const APP_VERSION = '2.0.0';

// Получение случайной карточки
function getRandomQuestion() {
    const questions = [
        { text: "Какое твоё самое яркое детское воспоминание?" },
        { text: "Если бы у тебя была сверхспособность, какая бы это была?" },
        { text: "О чём ты чаще всего мечтаешь перед сном?" },
        { text: "Что для тебя значит настоящая любовь?" },
        { text: "Какой период твоей жизни был самым счастливым?" },
        { text: "Если бы мы могли отправиться в любую точку мира прямо сейчас, куда бы ты выбрал(а)?" },
        { text: "Что тебя больше всего вдохновляет в жизни?" },
        { text: "Какой комплимент ты бы хотел(а) чаще слышать?" },
        { text: "Что для тебя важнее в отношениях: страсть или доверие?" },
        { text: "Если бы ты мог(ла) изменить одну вещь в прошлом, что бы это было?" }
    ];
    return questions[Math.floor(Math.random() * questions.length)];
}

function getRandomAction() {
    const actions = [
        { text: "Готовь ужин вместе под любимую музыку" },
        { text: "Сделайте друг другу массаж" },
        { text: "Потанцуйте медленный танец при свечах" },
        { text: "Напишите друг другу любовные письма" },
        { text: "Создайте совместный плейлист" },
        { text: "Сходите на прогулку, держась за руки" },
        { text: "Сфотографируйте друг друга в любимом ракурсе" },
        { text: "Приготовьте завтрак в постель" },
        { text: "Смотрите на звёзды и делитесь мечтами" },
        { text: "Создайте капсулу времени с вашими воспоминаниями" }
    ];
    return actions[Math.floor(Math.random() * actions.length)];
}

function getRandomDate() {
    const dates = [
        { text: "Пикник в парке с любимыми угощениями" },
        { text: "Вечер кино под пледом с попкорном" },
        { text: "Прогулка по набережной на закате" },
        { text: "Посещение музея или выставки" },
        { text: "Совместный кулинарный мастер-класс" },
        { text: "Выезд на природу с палаткой" },
        { text: "Спа-день дома с масками и ванной" },
        { text: "Настольные игры и горячий шоколад" },
        { text: "Фотопрогулка по городу" },
        { text: "Вечер настольных игр в кафе" }
    ];
    return dates[Math.floor(Math.random() * dates.length)];
}

function getRandomCompliment() {
    const compliments = [
        { text: "Ты делаешь мой мир лучше просто своим присутствием" },
        { text: "Мне так повезло, что ты в моей жизни" },
        { text: "Твоя улыбка - самое красивое, что я видел(а)" },
        { text: "Я восхищаюсь твоей силой и добротой" },
        { text: "С тобой я чувствую себя самым счастливым человеком" },
        { text: "Твой смех - моя любимая мелодия" },
        { text: "Ты вдохновляешь меня становиться лучше" },
        { text: "Мне нравится каждая мелочь в тебе" },
        { text: "Твои глаза полны тепла и мудрости" },
        { text: "Благодарю судьбу за встречу с тобой" }
    ];
    return compliments[Math.floor(Math.random() * compliments.length)];
}

// Service Worker для оффлайн-режима
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('Service Worker зарегистрирован:', registration);
        }).catch(function(error) {
            console.log('Ошибка регистрации Service Worker:', error);
        });
    });
}

// Управление звуком (упрощённая версия)
let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
        soundBtn.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
    }
    localStorage.setItem('loveDeckSound', soundEnabled);
}

// Загрузка настроек
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем настройки звука
    const savedSound = localStorage.getItem('loveDeckSound');
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
    }
    
    // Устанавливаем иконку звука если есть кнопка
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
        soundBtn.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
        soundBtn.onclick = toggleSound;
    }
    
    console.log('🔊 Звук:', soundEnabled ? 'Включен' : 'Выключен');
});

// Проигрывание звука (упрощённо)
function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'card':
                oscillator.frequency.value = 523.25; // C5
                break;
            case 'notification':
                oscillator.frequency.value = 659.25; // E5
                break;
            case 'success':
                oscillator.frequency.value = 783.99; // G5
                break;
            default:
                oscillator.frequency.value = 440.00; // A4
        }
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Аудио не поддерживается:', e);
    }
}
// ========== SERVICE WORKER УВЕДОМЛЕНИЯ ==========

// Проверка обновлений через Service Worker
if ('serviceWorker' in navigator) {
    // Когда SW готов
    navigator.serviceWorker.ready.then(reg => {
        console.log('🔄 Service Worker готов, проверяем обновления...');
        
        // Проверяем обновления
        setTimeout(() => {
            reg.active?.postMessage({ type: 'CHECK_UPDATES' });
        }, 3000); // Ждём 3 секунды после загрузки
        
        // Слушаем сообщения от SW
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('📨 Сообщение от Service Worker:', event.data);
            
            switch (event.data.type) {
                case 'UPDATES_AVAILABLE':
                    console.log('🆕 Доступны обновления:', event.data.files);
                    showUpdateNotification(event.data.files);
                    break;
                    
                case 'NEW_VERSION':
                    console.log(`🎉 Новая версия: ${event.data.version}`);
                    localStorage.setItem('app_version', event.data.version);
                    break;
            }
        });
        
        // Периодическая проверка обновлений (каждые 30 минут)
        setInterval(() => {
            if (navigator.onLine) {
                reg.active?.postMessage({ type: 'CHECK_UPDATES' });
            }
        }, 30 * 60 * 1000); // 30 минут
        
    }).catch(error => {
        console.error('❌ Ошибка Service Worker:', error);
    });
}

// Показать уведомление об обновлении
function showUpdateNotification(files) {
    // Можно добавить уведомление в интерфейс
    const notification = document.getElementById('notification');
    if (notification && files.length > 0) {
        notification.textContent = `Доступно обновление (${files.length} файлов). Обновите страницу.`;
        notification.style.backgroundColor = '#ff9800';
        notification.style.display = 'block';
        
        // Добавляем кнопку обновления
        notification.innerHTML = `
            🔄 Доступно обновление
            <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #333; border: none; border-radius: 5px; cursor: pointer;">
                Обновить
            </button>
        `;
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 10000); // Скрыть через 10 секунд
    }
}

// Проверка версии при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion && savedVersion !== APP_VERSION) {
        console.log(`🆙 Обновление с версии ${savedVersion} до ${APP_VERSION}`);
        showUpdateNotification(['Все файлы']);
    }
});

/**
 * Обновление отображения статистики
 */
function updateStatsDisplay() {
    try {
        if (!window.StorageManager || !window.CardManager) {
            console.log('Модули не загружены для статистики');
            return;
        }
        
        const statsElement = document.getElementById('statsDisplay');
        const statsContent = document.getElementById('statsContent');
        
        if (!statsElement || !statsContent) return;
        
        // Получаем данные
        const profile = window.StorageManager.profile;
        const cardStats = window.CardManager.getStats();
        
        // Форматируем статистику
        statsContent.innerHTML = `
            <div style="display: flex; gap: 20px; justify-content: center; align-items: center; flex-wrap: wrap;">
                <span style="display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-gamepad" style="color: #ff6b9d;"></i>
                    <strong>${profile.stats.gamesPlayed || 0}</strong> игр
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-cards" style="color: #667eea;"></i>
                    <strong>${profile.stats.cardsSent || 0}</strong> карт
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-database" style="color: #764ba2;"></i>
                    <strong>${cardStats.total}</strong> в базе
                </span>
            </div>
        `;
        
        // Показываем блок
        statsElement.style.display = 'flex';
        
    } catch (error) {
        console.warn('Не удалось обновить статистику:', error);
    }
}

// Вызываем обновление статистики через 1 секунду после загрузки
setTimeout(updateStatsDisplay, 1000);

// И обновляем при каждом действии
window.updateStatsDisplay = updateStatsDisplay;

console.log('✅ LoveDeck Online App загружен');
