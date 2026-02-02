// supabase.js - ПРОСТОЙ РАБОЧИЙ ВАРИАНТ
const SUPABASE_URL = 'https://xlnhuezhbmundhsdqyhu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wBSXXOSvG4zAJAQDy3hPow_nzhGcT9y';

// 1. Проверяем данные
console.log('🔧 Проверка Supabase...');
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ОШИБКА: SUPABASE_URL или SUPABASE_KEY не указаны!');
    alert('Ошибка конфигурации Supabase. Проверь supabase.js');
}

// 2. Создаем клиент
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase клиент создан');
} catch (error) {
    console.error('❌ Ошибка создания клиента:', error);
    return;
}

// 3. Создаем кнопку входа
function createLoginButton() {
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('login-btn');
    if (oldBtn) oldBtn.remove();
    
    // Создаем новую кнопку
    const loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.innerHTML = '👤 Войти';
    loginBtn.title = 'Войти для синхронизации';
    loginBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #ff6b8b;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        z-index: 1000;
        font-size: 14px;
        font-weight: bold;
    `;
    
    // Обработчик клика
    loginBtn.onclick = async function() {
        console.log('🔄 Нажата кнопка входа');
        
        // Проверяем, вошли ли уже
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
            alert(`✅ Уже вошли как: ${session.user.email}`);
            console.log('Текущий пользователь:', session.user);
            return;
        }
        
        // Создаем простую форму входа
        const email = prompt('Введите email для входа:\n(можно любой, даже test@test.com)');
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
            
            alert(`✅ Код отправлен на ${email}\n\nПроверьте почту и перейдите по ссылке из письма.`);
            console.log('✅ Письмо с кодом отправлено');
            
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            alert(`Ошибка: ${error.message}`);
        }
    };
    
    // Добавляем кнопку на страницу
    document.body.appendChild(loginBtn);
    console.log('✅ Кнопка входа создана');
}

// 4. Проверяем, вошли ли уже
async function checkCurrentSession() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
            console.log('✅ Уже вошли как:', session.user.email);
            // Обновляем кнопку
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                btn.style.background = '#4CAF50'; // Зеленый для "вошли"
            }
        } else {
            console.log('ℹ️ Не вошли');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки сессии:', error);
    }
}

// 5. Функция для синхронизации (для app.js)
window.syncCardAction = async function(cardId, cardText, mode, action) {
    console.log(`🔄 syncCardAction вызвана: ${action} карточки ${cardId}`);
    
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Не вошли - сохраняем локально');
            return false;
        }
        
        console.log('✅ Вошли, синхронизируем с облаком...');
        // Здесь будет реальная синхронизация с базой данных
        // Пока просто возвращаем успех
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
        return false;
    }
};

// 6. Запуск всего при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LoveCouple загружен, инициализируем Supabase...');
    
    // Создаем кнопку входа
    createLoginButton();
    
    // Проверяем текущий вход
    checkCurrentSession();
    
    // Слушаем изменения статуса входа
    window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Статус аутентификации изменился:', event);
        
        if (event === 'SIGNED_IN' && session) {
            alert(`🎉 Успешный вход!\nEmail: ${session.user.email}`);
            // Обновляем кнопку
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                btn.style.background = '#4CAF50';
                btn.onclick = () => {
                    alert(`Вы вошли как: ${session.user.email}\n\nЧтобы выйти, откройте консоль (F12) и выполните:\nawait supabase.auth.signOut()`);
                };
            }
        }
        
        if (event === 'SIGNED_OUT') {
            console.log('👋 Вышли из системы');
            // Обновляем кнопку
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = '👤 Войти';
                btn.style.background = '#ff6b8b';
                btn.onclick = async function() {
                    const email = prompt('Введите email для входа:');
                    if (!email) return;
                    await window.supabase.auth.signInWithOtp({ email });
                };
            }
        }
    });
});

console.log('✨ Supabase.js загружен и готов!');
