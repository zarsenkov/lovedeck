// supabase.js - ПРОСТОЙ РАБОЧИЙ ВАРИАНТ
console.log('🚀 Загружаю Supabase.js...');

// ВАШИ ДАННЫЕ
const SUPABASE_URL = 'https://xlnhuezhbmundhsdqyhu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wBSXXOSvG4zAJAQDy3hPow_nzhGcT9y';

// Проверяем данные
if (SUPABASE_URL.includes('xlnhuezhbmundhsdqyhu')) {
    console.log('✅ Supabase URL верный');
} else {
    console.error('❌ Неверный URL Supabase');
}

// Создаём клиент
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Клиент Supabase создан');
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
            document.body.appendChild(loginBtn);
        }
    }
    
    // Делаем кнопку кликабельной
    loginBtn.style.cursor = 'pointer';
    loginBtn.style.pointerEvents = 'auto';
    loginBtn.style.opacity = '1';
    
    // 2. Добавляем обработчик
    loginBtn.onclick = async function() {
        console.log('🔄 Кнопка нажата!');
        
        if (!window.supabase) {
            alert('Supabase не загружен! Проверь консоль.');
            return;
        }
        
        // Проверяем, вошли ли уже
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (session) {
                alert(`✅ Уже вошли как:\n${session.user.email}`);
                loginBtn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                loginBtn.style.background = '#4CAF50';
                return;
            }
        } catch (error) {
            console.log('Не вошли:', error.message);
        }
        
        // Предлагаем войти
        const email = prompt('Введите email для входа:\n(Можно test@test.com)', 'test@test.com');
        if (!email) return;
        
        try {
            console.log(`📧 Отправляю код на ${email}...`);
            
            const { error } = await window.supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: window.location.href
                }
            });
            
            if (error) throw error;
            
            alert(`✅ Проверьте почту ${email}!\n\nМы отправили ссылку для входа.\nОткройте письмо и перейдите по ссылке.`);
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };
    
    console.log('✅ Кнопка настроена');
}

// 3. Функция для синхронизации (для app.js)
window.syncCardAction = async function(cardId, cardText, mode, action) {
    console.log(`🔄 Синхронизация: ${action} карточки ${cardId}`);
    
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Не вошли - сохраняем локально');
            return false;
        }
        
        console.log('✅ Вошли, можно синхронизировать');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        return false;
    }
};

// 4. Запускаем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена');
    
    // Ждём немного
    setTimeout(() => {
        setupLoginButton();
        
        // Проверяем, вошли ли уже
        if (window.supabase) {
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

console.log('✨ Supabase.js загружен!');
