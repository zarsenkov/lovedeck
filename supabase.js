// supabase.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ
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

// 1. СОЗДАЁМ КЛИЕНТ SUPABASE
try {
    // Проверяем, есть ли библиотека supabase
    if (typeof supabase === 'undefined') {
        console.error('❌ Библиотека supabase не загружена!');
        // Загружаем динамически если нет
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8/dist/umd/supabase.min.js';
        script.onload = initSupabase;
        document.head.appendChild(script);
    } else {
        initSupabase();
    }
} catch (error) {
    console.error('❌ Ошибка инициализации Supabase:', error);
}

function initSupabase() {
    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        console.log('✅ Клиент Supabase создан');
        
        // Запускаем настройку кнопки
        setTimeout(setupLoginButton, 500);
        
        // Проверяем текущую сессию
        checkCurrentSession();
        
    } catch (error) {
        console.error('❌ Ошибка создания клиента Supabase:', error);
    }
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
        loginBtn.style.cssText = `
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
        
        document.body.appendChild(loginBtn);
    } else {
        // Если кнопка уже есть, делаем её кликабельной
        loginBtn.style.cssText = `
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
    
    // Удаляем старые обработчики
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    
    // 2. ДОБАВЛЯЕМ ОБРАБОТЧИК
    newLoginBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('🎯 Кнопка входа нажата!');
        
        if (!window.supabase || !window.supabase.auth) {
            alert('❌ Supabase не загружен! Обновите страницу (Ctrl+F5).');
            return;
        }
        
        // ПРОВЕРЯЕМ СЕССИЮ
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (session && session.user) {
                alert(`✅ Уже вошли как:\n${session.user.email}\n\nНажмите на карточку "Выполнено" для синхронизации.`);
                newLoginBtn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
                newLoginBtn.style.background = '#4CAF50';
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
    });
    
    console.log('✅ Кнопка настроена');
    return newLoginBtn;
}

// 2. ПРОВЕРКА ТЕКУЩЕЙ СЕССИИ
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
                btn.style.background = '#4CAF50';
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

// 3. ФУНКЦИЯ ДЛЯ СОЗДАНИЯ ПРОФИЛЯ ПАРЫ
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

// 4. ФУНКЦИЯ ДЛЯ СИНХРОНИЗАЦИИ КАРТОЧЕК
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
        const { data: couple, error: coupleError } = await window.supabase
            .from('couples')
            .select('id')
            .eq('email', session.user.email)
            .single();
        
        if (coupleError || !couple) {
            console.log('👫 Профиль не найден, создаём...');
            const newCouple = await createOrUpdateCoupleProfile(session.user);
            if (!newCouple) {
                console.error('❌ Не удалось создать профиль пары');
                return false;
            }
            couple = newCouple;
        }
        
        console.log('✅ Профиль пары найден:', couple.id);
        
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

// 5. ФУНКЦИЯ ДЛЯ ОТЛАДКИ
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

// 6. ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница загружена');
    
    // Даём время загрузиться всем скриптам
    setTimeout(() => {
        console.log('✨ Supabase.js готов!');
        
        // Принудительная активация кнопки через 2 секунды
        setTimeout(() => {
            const btn = document.getElementById('login-btn');
            if (btn) {
                console.log('🔄 Принудительно активирую кнопку...');
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
                
                // Добавляем простой обработчик если нет
                if (!btn.onclick) {
                    btn.onclick = () => alert('Кнопка работает! Настройка Supabase...');
                }
            }
        }, 2000);
    }, 500);
});

// 7. СЛУШАТЕЛЬ ИЗМЕНЕНИЙ АУТЕНТИФИКАЦИИ
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
                btn.style.background = '#4CAF50';
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
                btn.style.background = '#ff6b8b';
                btn.title = 'Войти для синхронизации';
            }
        }
    });
}
