// supabase.js - УЛЬТРАСОВМЕСТИМАЯ ВЕРСИЯ
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

// 1. ИНИЦИАЛИЗАЦИЯ SUPABASE
function initSupabase() {
    try {
        // Создаём клиент Supabase
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        
        console.log('✅ Клиент Supabase создан');
        
        // Сразу создаём кнопку
        createLoginButton();
        
        // Проверяем сессию
        checkCurrentSession();
        
    } catch (error) {
        console.error('❌ Ошибка создания клиента Supabase:', error);
    }
}

// 2. ПРОВЕРКА БИБЛИОТЕКИ
if (typeof supabase === 'undefined') {
    console.log('📚 Библиотека supabase не загружена, загружаю...');
    
    // Создаём стили для кнопки СРАЗУ
    addButtonStyles();
    
    // Создаём кнопку СРАЗУ
    setTimeout(createLoginButton, 100);
    
    // Загружаем библиотеку
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8/dist/umd/supabase.min.js';
    script.onload = function() {
        console.log('✅ Библиотека supabase загружена');
        initSupabase();
    };
    script.onerror = function() {
        console.error('❌ Ошибка загрузки библиотеки supabase');
        // Всё равно создаём кнопку
        createLoginButton();
    };
    document.head.appendChild(script);
} else {
    console.log('✅ Библиотека supabase уже загружена');
    addButtonStyles();
    initSupabase();
}

// 3. ДОБАВЛЯЕМ СТИЛИ ДЛЯ КНОПКИ
function addButtonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #login-btn {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 50px !important;
            height: 50px !important;
            border-radius: 50% !important;
            background: #ff6b8b !important;
            color: white !important;
            border: none !important;
            font-size: 24px !important;
            cursor: pointer !important;
            z-index: 1000 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        
        #login-btn:hover {
            background: #ff4d6d !important;
            transform: scale(1.05) !important;
        }
        
        #login-btn.logged-in {
            background: #4CAF50 !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Стили кнопки добавлены');
}

// 4. СОЗДАЁМ КНОПКУ ВХОДА
function createLoginButton() {
    console.log('🔧 Создаю кнопку входа...');
    
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('login-btn');
    if (oldBtn) {
        oldBtn.remove();
    }
    
    // Создаём новую кнопку
    const loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.title = 'Войти для синхронизации';
    loginBtn.innerHTML = '👤';
    
    // Добавляем на страницу
    document.body.appendChild(loginBtn);
    
    // Делаем кнопку видимой
    setTimeout(() => {
        loginBtn.style.display = 'flex';
    }, 100);
    
    // Добавляем обработчик
    loginBtn.onclick = handleLoginClick;
    
    console.log('✅ Кнопка создана');
    return loginBtn;
}

// 5. ОБРАБОТЧИК НАЖАТИЯ КНОПКИ
async function handleLoginClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('🎯 Кнопка входа нажата!');
    
    const loginBtn = document.getElementById('login-btn');
    
    // Проверяем Supabase
    if (!window.supabase || !window.supabase.auth) {
        alert('❌ Supabase не загружен! Обновите страницу (Ctrl+F5).');
        return;
    }
    
    // ПРОВЕРЯЕМ СЕССИЮ
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        
        if (session && session.user) {
            alert(`✅ Уже вошли как:\n${session.user.email}\n\nНажмите на карточку "Выполнено" для синхронизации.`);
            loginBtn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
            loginBtn.className = 'logged-in';
            return;
        }
    } catch (error) {
        console.log('Сессия не активна:', error.message);
    }
    
    // ЗАПРАШИВАЕМ EMAIL
    const userEmail = prompt(
        '✉️ Введите email для входа:\n\n' +
        'На этот email придёт ссылка для входа.\n\n' +
        'Пример: zarsenkov@yandex.ru',
        'zarsenkov@yandex.ru'
    );
    
    if (!userEmail || !userEmail.includes('@')) {
        alert('❌ Введите корректный email!');
        return;
    }
    
    try {
        console.log(`📧 Отправляю код на ${userEmail}...`);
        
        const { error } = await window.supabase.auth.signInWithOtp({
            email: userEmail,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.origin
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
}

// 6. ПРОВЕРКА ТЕКУЩЕЙ СЕССИИ
async function checkCurrentSession() {
    try {
        if (!window.supabase || !window.supabase.auth) {
            console.log('🔄 Supabase ещё не готов, жду...');
            setTimeout(checkCurrentSession, 1000);
            return;
        }
        
        const { data: { session } } = await window.supabase.auth.getSession();
        
        if (session && session.user) {
            console.log('✅ Уже вошли:', session.user.email);
            window.currentUser = session.user;
            
            // Обновляем кнопку
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                btn.className = 'logged-in';
                btn.title = `Вошли как: ${session.user.email}`;
            }
            
            // Автоматически создаём профиль пары
            await createOrUpdateCoupleProfile(session.user);
        } else {
            console.log('ℹ️ Не вошли в систему');
            window.currentUser = null;
        }
        
    } catch (error) {
        console.error('❌ Ошибка проверки сессии:', error);
    }
}

// 7. ФУНКЦИЯ ДЛЯ СОЗДАНИЯ ПРОФИЛЯ ПАРЫ
async function createOrUpdateCoupleProfile(user) {
    try {
        console.log('👫 Создаю/обновляю профиль пары для:', user.email);
        
        // Проверяем, есть ли уже профиль
        const { data: existingCouple } = await window.supabase
            .from('couples')
            .select('*')
            .eq('email', user.email)
            .single();
        
        if (existingCouple) {
            console.log('✅ Профиль пары уже существует:', existingCouple.id);
            return existingCouple;
        }
        
        // Создаём новый профиль
        const { data: newCouple, error } = await window.supabase
            .from('couples')
            .insert({
                email: user.email,
                names: 'Новая пара',
                love_level: 1,
                achievements: [],
                public_ranking: false
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Профиль пары создан:', newCouple.id);
        return newCouple;
        
    } catch (error) {
        console.error('❌ Ошибка создания профиля пары:', error);
        return null;
    }
}

// 8. ФУНКЦИЯ ДЛЯ СИНХРОНИЗАЦИИ КАРТОЧЕК
window.syncCardAction = async function(cardId, cardText, mode, action) {
    console.log(`🔄 syncCardAction: ${action} карточки ${cardId} (${mode})`);
    
    try {
        // 1. ПРОВЕРКА SUPABASE
        if (!window.supabase || !window.supabase.auth) {
            console.log('⚠️ Supabase не доступен - сохраняем локально');
            return false;
        }
        
        // 2. ПРОВЕРКА СЕССИИ
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Не вошли в облако, действие только локально.');
            return false;
        }
        
        console.log('✅ Вошли как:', session.user.email);
        
        // 3. ПОЛУЧАЕМ ПРОФИЛЬ ПАРЫ
        let couple = null;
        
        const { data: coupleData, error: coupleError } = await window.supabase
            .from('couples')
            .select('id')
            .eq('email', session.user.email)
            .single();
        
        if (coupleError || !coupleData) {
            console.log('👫 Профиль не найден, создаём...');
            const newCouple = await createOrUpdateCoupleProfile(session.user);
            if (!newCouple) {
                console.error('❌ Не удалось создать профиль пары');
                return false;
            }
            couple = newCouple;
        } else {
            couple = coupleData;
            console.log('✅ Профиль пары найден:', couple.id);
        }
        
        // 4. СОХРАНЯЕМ ДЕЙСТВИЕ В ACTIVITIES
        console.log('💾 Сохраняю в таблицу activities...');
        
        const { error } = await window.supabase
            .from('activities')
            .insert({
                couple_id: couple.id,
                card_id: cardId,
                card_text: cardText.substring(0, 255),
                mode: mode,
                completed: action === 'completed',
                liked: action === 'liked',
                timestamp: new Date().toISOString()
            });
        
        if (error) {
            console.error('❌ Ошибка сохранения в activities:', error);
            return false;
        }
        
        console.log('✅ Успешно сохранено в Supabase!');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
        return false;
    }
};

// 9. ФУНКЦИЯ ДЛЯ ОТЛАДКИ
window.debugSupabase = async function() {
    console.log('=== ДЕБАГ SUPABASE ===');
    
    // 1. Проверка соединения
    console.log('Supabase:', !!window.supabase);
    console.log('supabase.auth:', !!window.supabase?.auth);
    
    // 2. Проверка сессии
    const { data: { session } } = await window.supabase.auth.getSession();
    console.log('Сессия:', session ? 'Есть' : 'Нет');
    console.log('Пользователь:', session?.user?.email);
    
    // 3. Проверка таблицы couples
    try {
        const { data: couples } = await window.supabase.from('couples').select('*');
        console.log('Записей в couples:', couples?.length || 0);
        if (session?.user?.email) {
            console.log('Ваша запись:', couples?.find(c => c.email === session.user.email));
        }
    } catch (e) {
        console.log('Ошибка couples:', e.message);
    }
    
    // 4. Проверка таблицы activities
    try {
        const { data: activities } = await window.supabase.from('activities').select('*');
        console.log('Записей в activities:', activities?.length || 0);
    } catch (e) {
        console.log('Ошибка activities:', e.message);
    }
    
    console.log('=== ДЕБАГ ЗАВЕРШЕН ===');
};

// 10. ПРИНУДИТЕЛЬНАЯ АКТИВАЦИЯ КНОПКИ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена');
    
    // Убедимся что кнопка создана
    setTimeout(() => {
        const btn = document.getElementById('login-btn');
        if (!btn) {
            console.log('🔄 Кнопка не найдена, создаю принудительно...');
            createLoginButton();
        } else {
            console.log('✅ Кнопка найдена, активирую...');
            btn.style.cssText = `
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                width: 50px !important;
                height: 50px !important;
                border-radius: 50% !important;
                background: #ff6b8b !important;
                color: white !important;
                border: none !important;
                font-size: 24px !important;
                cursor: pointer !important;
                z-index: 1000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            `;
        }
    }, 2000);
});

// 11. СЛУШАТЕЛЬ ИЗМЕНЕНИЙ АУТЕНТИФИКАЦИИ
if (window.supabase && window.supabase.auth) {
    window.supabase.auth.onAuthStateChange((event, session) => {
        console.log(`🎭 Auth state changed: ${event}`);
        
        if (session) {
            console.log('✅ Пользователь вошёл:', session.user.email);
            window.currentUser = session.user;
            
            // Обновляем кнопку
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                btn.className = 'logged-in';
                btn.title = `Вошли как: ${session.user.email}`;
            }
            
            // Создаём профиль
            createOrUpdateCoupleProfile(session.user);
        } else {
            console.log('ℹ️ Пользователь вышел');
            window.currentUser = null;
            
            const btn = document.getElementById('login-btn');
            if (btn) {
                btn.innerHTML = '👤';
                btn.className = '';
                btn.title = 'Войти для синхронизации';
            }
        }
    });
}

console.log('✨ Supabase.js инициализирован!');
