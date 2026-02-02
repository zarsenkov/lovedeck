// supabase.js - ИСПРАВЛЕННАЯ РАБОЧАЯ ВЕРСИЯ
console.log('🚀 Загружаю Supabase.js...');

// ВАШИ ДАННЫЕ
const SUPABASE_URL = 'https://xlnhuezhbmundhsdqyhu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wBSXXOSvG4zAJAQDy3hPow_nzhGcT9y';

// Проверяем данные
console.log('🔍 Проверяю настройки Supabase...');
if (SUPABASE_URL.includes('xlnhuezhbmundhsdqyhu')) {
    console.log('✅ Supabase URL верный:', SUPABASE_URL.substring(0, 30) + '...');
} else {
    console.error('❌ Неверный URL Supabase');
}

// Проверяем загружена ли библиотека Supabase
console.log('📚 Библиотека supabase доступна?', typeof supabase !== 'undefined');

// Создаём клиент
try {
    if (typeof supabase !== 'undefined') {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Клиент Supabase создан');
    } else {
        console.error('❌ ОШИБКА: Библиотека supabase не загружена!');
        console.error('Проверьте что в index.html есть: <script src="supabase.min.js"></script>');
        
        // Создаём заглушку чтобы не было ошибок
        window.supabase = {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null } }),
                signInWithOtp: () => Promise.reject(new Error('Supabase не загружен'))
            }
        };
    }
} catch (error) {
    console.error('❌ Ошибка создания клиента:', error);
}

// ========== ПРОСТАЯ КНОПКА ВХОДА ==========

// 1. Создаём/находим кнопку
function setupLoginButton() {
    console.log('🔧 Настраиваю кнопку входа...');
    
    // Ищем существующую кнопку
    let loginBtn = document.getElementById('login-btn');
    
    if (!loginBtn) {
        console.log('🛠️ Создаю новую кнопку...');
        loginBtn = document.createElement('button');
        loginBtn.id = 'login-btn';
        loginBtn.className = 'floating-button';
        loginBtn.title = 'Войти для синхронизации';
        loginBtn.innerHTML = '👤';
        
        // Добавляем в контейнер
        const container = document.querySelector('.floating-buttons');
        if (container) {
            container.appendChild(loginBtn);
        } else {
            // Если нет контейнера, создаём стиль
            loginBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #ff6b8b;
                color: white;
                border: none;
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            document.body.appendChild(loginBtn);
        }
    }
    
    // Делаем кнопку кликабельной
    loginBtn.style.cursor = 'pointer';
    loginBtn.style.pointerEvents = 'auto';
    loginBtn.style.opacity = '1';
    
    // 2. Добавляем обработчик
    loginBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('🔄 Кнопка входа нажата!');
        
        if (!window.supabase || !window.supabase.auth) {
            alert('Supabase не загружен! Проверьте консоль (F12).');
            console.error('Supabase не инициализирован:', window.supabase);
            return;
        }
        
        // Проверяем, вошли ли уже
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (session && session.user) {
                alert(`✅ Уже вошли как:\n${session.user.email}`);
                loginBtn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                loginBtn.style.background = '#4CAF50';
                return;
            }
        } catch (error) {
            console.log('Не вошли или ошибка сессии:', error.message);
        }
        
        // === ИСПРАВЛЕННЫЙ PROMPT С ПРАВИЛЬНЫМ EMAIL ===
    const email = prompt(
        '✉️ Введите РЕАЛЬНЫЙ email для входа:\n\n' +
        'Рабочие примеры:\n' +
        '• ваш@gmail.com\n' +
        '• ваша_почта@mail.ru\n' +
        '• example@yandex.ru\n\n' +
        '❌ НЕ РАБОТАЕТ:\n' +
        '• test@test.com\n' +
        '• test@example.com\n\n' +
        'Нужен НАСТОЯЩИЙ email!',
        'ваш_настоящий_email@gmail.com' // ← ЗАМЕНИТЕ НА СВОЙ РЕАЛЬНЫЙ EMAIL!
    );
    
    if (!email) return;
    
    // БЫСТРАЯ ПРОВЕРКА EMAIL
    if (email.includes('test@test') || email.includes('test@example')) {
        alert('❌ Ошибка: Supabase не принимает тестовые emails!\n\n' +
              'Используйте ваш реальный email или временный:\n' +
              '1. Зайдите на mailinator.com\n' +
              '2. Придумайте имя (например: lovecouple123)\n' +
              '3. Используйте: lovecouple123@mailinator.com\n' +
              '4. Проверьте почту на mailinator.com');
        return;
    }
    
// === ИСПРАВЛЕННЫЙ PROMPT С ПРАВИЛЬНЫМ EMAIL ===
    const email = prompt(
        '✉️ Введите РЕАЛЬНЫЙ email для входа:\n\n' +
        'Рабочие примеры:\n' +
        '• ваш@gmail.com\n' +
        '• ваша_почта@mail.ru\n' +
        '• example@yandex.ru\n\n' +
        '❌ НЕ РАБОТАЕТ:\n' +
        '• test@test.com\n' +
        '• test@example.com\n\n' +
        'Нужен НАСТОЯЩИЙ email!',
        'ваш_настоящий_email@gmail.com' // ← ЗАМЕНИТЕ НА СВОЙ РЕАЛЬНЫЙ EMAIL!
    );
    
    if (!email) return;
    
    // БЫСТРАЯ ПРОВЕРКА EMAIL
    if (email.includes('test@test') || email.includes('test@example')) {
        alert('❌ Ошибка: Supabase не принимает тестовые emails!\n\n' +
              'Используйте ваш реальный email или временный:\n' +
              '1. Зайдите на mailinator.com\n' +
              '2. Придумайте имя (например: lovecouple123)\n' +
              '3. Используйте: lovecouple123@mailinator.com\n' +
              '4. Проверьте почту на mailinator.com');
        return;
    }
    
    // Проверка формата email
    if (!email.includes('@') || !email.includes('.')) {
        alert('❌ Ошибка: Неверный формат email!\nПример: имя@gmail.com');
        return;
    }
        
        try {
            console.log(`📧 Отправляю код на ${email}...`);
            
const { error } = await window.supabase.auth.signInWithOtp({
    email: email,
    options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://lovecouple.ru'  // ← Ваш домен!
    }
});
            
            if (error) throw error;
            
            alert(`✅ Проверьте почту ${email}!\n\nМы отправили ссылку для входа.\nОткройте письмо и перейдите по ссылке.`);
            
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });
    
    console.log('✅ Кнопка настроена');
    return loginBtn;
}

// 3. Функция для синхронизации (для app.js)
window.syncCardAction = async function(cardId, cardText, mode, action) {
    console.log(`🔄 Синхронизация: ${action} карточки ${cardId}`);
    
    try {
        if (!window.supabase || !window.supabase.auth) {
            console.log('⚠️ Supabase не доступен - сохраняем локально');
            return false;
        }
        
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Не вошли - сохраняем локально');
            return false;
        }
        
        console.log('✅ Вошли, можно синхронизировать');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
        return false;
    }
};

// 4. Проверяем текущий вход
async function checkCurrentSession() {
    try {
        if (!window.supabase || !window.supabase.auth) return;
        
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session && session.user) {
            console.log('✅ Уже вошли как:', session.user.email);
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                btn.style.background = '#4CAF50';
            }
        }
    } catch (error) {
        console.log('ℹ️ Не вошли:', error.message);
    }
}

// 5. Запускаем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена, запускаю настройку...');
    
    // Ждём немного для полной загрузки
    setTimeout(() => {
        const btn = setupLoginButton();
        
        // Проверяем сессию через 2 секунды
        setTimeout(() => {
            checkCurrentSession();
        }, 2000);
        
        // Добавляем визуальный эффект при наведении
        if (btn) {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
                btn.style.transition = 'transform 0.2s';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        }
    }, 500);
});

// Слушаем изменения статуса аутентификации
if (window.supabase && window.supabase.auth) {
    window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Статус аутентификации:', event);
        
        if (event === 'SIGNED_IN' && session) {
            console.log('🎉 Успешный вход!');
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                btn.style.background = '#4CAF50';
            }
        }
        
        if (event === 'SIGNED_OUT') {
            console.log('👋 Вышли из системы');
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = '👤';
                btn.style.background = '#ff6b8b';
            }
        }
    });
}

console.log('✨ Supabase.js полностью загружен и готов!');

// ДЕБАГ: Выводим в глобальную область для тестирования
console.log('🔍 Глобальный supabase:', window.supabase);
