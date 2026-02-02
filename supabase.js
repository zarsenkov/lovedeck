// supabase.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
console.log('🚀 Загружаю Supabase.js...');

// ВАШИ ДАННЫЕ
const SUPABASE_URL = 'https://xlnhuezhbmundhsdqyhu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wBSXXOSvG4zAJAQDy3hPow_nzhGcT9y';

// Проверяем данные
console.log('🔍 Проверяю настройки Supabase...');
if (SUPABASE_URL.includes('xlnhuezhbmundhsdqyhu')) {
    console.log('✅ Supabase URL верный');
} else {
    console.error('❌ Неверный URL Supabase');
}

// 1. ПРОВЕРКА БИБЛИОТЕКИ
console.log('📚 Библиотека supabase доступна?', typeof supabase !== 'undefined');

// 2. СОЗДАЁМ КЛИЕНТ
try {
    if (typeof supabase !== 'undefined') {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Клиент Supabase создан');
    } else {
        console.error('❌ Библиотека supabase не загружена!');
        // Заглушка для тестирования
        window.supabase = {
            auth: {
                getSession: () => ({ data: { session: null } }),
                signInWithOtp: () => ({ error: 'Supabase не загружен' })
            }
        };
    }
} catch (error) {
    console.error('❌ Ошибка создания клиента:', error);
}

// ========== КНОПКА ВХОДА ==========

// 1. СОЗДАЁМ/НАХОДИМ КНОПКУ
function setupLoginButton() {
    console.log('🔧 Настраиваю кнопку входа...');
    
    let loginBtn = document.getElementById('login-btn');
    
    if (!loginBtn) {
        console.log('🛠️ Создаю новую кнопку...');
        loginBtn = document.createElement('button');
        loginBtn.id = 'login-btn';
        loginBtn.className = 'floating-button';
        loginBtn.title = 'Войти для синхронизации';
        loginBtn.innerHTML = '👤';
        
        const container = document.querySelector('.floating-buttons');
        if (container) {
            container.appendChild(loginBtn);
        } else {
            loginBtn.style.cssText = `
                position: fixed; top: 20px; right: 20px;
                width: 50px; height: 50px; border-radius: 50%;
                background: #ff6b8b; color: white; border: none;
                font-size: 24px; cursor: pointer; z-index: 1000;
            `;
            document.body.appendChild(loginBtn);
        }
    }
    
    // ДЕЛАЕМ КЛИКАБЕЛЬНОЙ
    loginBtn.style.cursor = 'pointer';
    loginBtn.style.pointerEvents = 'auto';
    loginBtn.style.opacity = '1';
    
    // 2. ДОБАВЛЯЕМ ОБРАБОТЧИК
    loginBtn.onclick = async function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('🔄 Кнопка входа нажата!');
        
        if (!window.supabase || !window.supabase.auth) {
            alert('❌ Supabase не загружен!');
            console.error('Supabase.auth не доступен');
            return;
        }
        
        // ПРОВЕРЯЕМ СЕССИЮ
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (session && session.user) {
                alert(`✅ Уже вошли как:\n${session.user.email}`);
                loginBtn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                loginBtn.style.background = '#4CAF50';
                return;
            }
        } catch (error) {
            console.log('Не вошли:', error.message);
        }
        
        // ЗАПРАШИВАЕМ EMAIL
        const userEmail = prompt(
            '✉️ Введите РЕАЛЬНЫЙ email для входа:\n\n' +
            'Примеры:\n• ваш@gmail.com\n• ваша@mail.ru\n\n' +
            '❌ НЕ используйте: test@test.com',
            'ваш_настоящий_email@gmail.com'
        );
        
        if (!userEmail) return;
        
        // ПРОВЕРКА EMAIL
        if (userEmail.includes('test@test') || userEmail.includes('test@example')) {
            alert('❌ Используйте реальный email!');
            return;
        }
        
        try {
            console.log(`📧 Отправляю код на ${userEmail}...`);
            
            const { error } = await window.supabase.auth.signInWithOtp({
                email: userEmail,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: 'http://lovecouple.ru'
                }
            });
            
            if (error) throw error;
            
            alert(`✅ Проверьте почту:\n${userEmail}\n\nМы отправили ссылку для входа.`);
            
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                alert('⚠️ Слишком много попыток!\nПодождите 30 минут.');
            } else if (error.message.includes('invalid')) {
                alert('❌ Неверный email!');
            } else {
                alert(`Ошибка: ${error.message}`);
            }
        }
    };
    
    console.log('✅ Кнопка настроена');
    return loginBtn;
}

// 3. ФУНКЦИЯ ДЛЯ СИНХРОНИЗАЦИИ
window.syncCardAction = async function(cardId, cardText, mode, action) {
    console.log(`🔄 syncCardAction: ${action} карточки ${cardId}`);
    
    try {
        if (!window.supabase || !window.supabase.auth) {
            console.log('⚠️ Supabase не доступен');
            return false;
        }
        
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Не вошли');
            return false;
        }
        
        console.log('✅ Вошли, можно синхронизировать');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
        return false;
    }
};

// 4. ЗАПУСК
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена');
    
    setTimeout(() => {
        setupLoginButton();
        
        // ПРОВЕРКА СЕССИИ
        if (window.supabase && window.supabase.auth) {
            window.supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    console.log('✅ Уже вошли:', data.session.user.email);
                    const btn = document.getElementById('login-btn');
                    if (btn) {
                        btn.innerHTML = `👤 ${data.session.user.email.split('@')[0]}`;
                        btn.style.background = '#4CAF50';
                    }
                }
            });
        }
    }, 1000);
});

console.log('✨ Supabase.js готов!');
