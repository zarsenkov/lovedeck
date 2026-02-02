// supabase.js - Исправленная версия
console.log('🚀 Загружаю Supabase.js...');

const SUPABASE_URL = 'https://xlnhuezhbmundhsdqyhu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wBSXXOSvG4zAJAQDy3hPow_nzhGcT9y';

if (SUPABASE_URL.includes('xlnhuezhbmundhsdqyhu')) {
    console.log('✅ Supabase URL верный');
} else {
    console.error('❌ Неверный URL Supabase');
}

// Инициализация Supabase
function initSupabase() {
    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        console.log('✅ Клиент Supabase создан');
        addButtonStyles();
        createLoginButton();
        checkCurrentSession();
    } catch (error) {
        console.error('❌ Ошибка создания клиента Supabase:', error);
    }
}

// Загрузка библиотеки Supabase если не загружена
if (typeof supabase === 'undefined') {
    console.log('📚 Библиотека supabase не загружена, загружаю...');
    addButtonStyles();
    setTimeout(createLoginButton, 100);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8/dist/umd/supabase.min.js';
    script.onload = initSupabase;
    script.onerror = () => {
        console.error('❌ Ошибка загрузки библиотеки supabase');
        createLoginButton();
    };
    document.head.appendChild(script);
} else {
    initSupabase();
}

// Стили кнопки
function addButtonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #login-btn {position: fixed; top: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: #ff6b8b; color: white; border: none; font-size: 24px; cursor: pointer; z-index: 1000; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.2);}
        #login-btn:hover {background: #ff4d6d; transform: scale(1.05);}
        #login-btn.logged-in {background: #4CAF50;}
    `;
    document.head.appendChild(style);
}

// Создание кнопки
function createLoginButton() {
    const oldBtn = document.getElementById('login-btn');
    if (oldBtn) oldBtn.remove();

    const loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.title = 'Войти для синхронизации';
    loginBtn.innerHTML = '👤';
    loginBtn.onclick = handleLoginClick;
    document.body.appendChild(loginBtn);
    return loginBtn;
}

// Обработчик кнопки входа
async function handleLoginClick(event) {
    event.preventDefault();
    const loginBtn = document.getElementById('login-btn');
    if (!window.supabase?.auth) {
        alert('❌ Supabase не загружен! Обновите страницу (Ctrl+F5).');
        return;
    }

    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session?.user) {
            loginBtn.innerHTML = `👤 ${session.user.email.split('@')[0]}`;
            loginBtn.className = 'logged-in';
            alert(`✅ Уже вошли как: ${session.user.email}`);
            return;
        }
    } catch {}

    const userEmail = prompt('Введите email для входа:', 'zarsenkov@yandex.ru');
    if (!userEmail?.includes('@')) { alert('❌ Введите корректный email!'); return; }

    try {
        const { error } = await window.supabase.auth.signInWithOtp({
            email: userEmail,
            options: { shouldCreateUser: true, emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        alert(`✅ Проверьте почту: ${userEmail}`);
    } catch (error) {
        console.error(error);
        alert(`Ошибка: ${error.message}`);
    }
}

// Проверка текущей сессии
async function checkCurrentSession() {
    if (!window.supabase?.auth) { setTimeout(checkCurrentSession, 1000); return; }
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        const btn = document.getElementById('login-btn');
        if (session?.user) {
            window.currentUser = session.user;
            if (btn) { btn.innerHTML = `👤 ${session.user.email.split('@')[0]}`; btn.className = 'logged-in'; }
            await createOrUpdateCoupleProfile(session.user);
        } else { window.currentUser = null; }
    } catch (error) { console.error(error); }
}

// Создание или обновление профиля пары
async function createOrUpdateCoupleProfile(user) {
    try {
        const { data, error } = await window.supabase.from('couples').select('*').eq('email', user.email).single();
        if (data) return data;
        const { data: newCouple, error: insertError } = await window.supabase.from('couples').insert({
            email: user.email,
            names: 'Новая пара',
            love_level: 1,
            achievements: [],
            public_ranking: false
        }).select().single();
        if (insertError) throw insertError;
        return newCouple;
    } catch (error) { console.error(error); return null; }
}

// Синхронизация карточки
window.syncCardAction = async function(cardId, cardText, mode, action) {
    if (!window.supabase?.auth) return false;

    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session?.user) return false;

        let couple = null;
        const { data: coupleData } = await window.supabase.from('couples').select('id,cards_completed,cards_liked').eq('email', session.user.email).single();
        if (!coupleData) couple = await createOrUpdateCoupleProfile(session.user);
        else couple = coupleData;

        const { error } = await window.supabase.from('activities').insert({
            couple_id: couple.id,
            card_id: cardId,
            card_text: cardText.substring(0, 255),
            mode: mode,
            completed: action === 'completed',
            liked: action === 'liked',
            timestamp: new Date().toISOString()
        });
        if (error) throw error;

        // Обновляем статистику пары
        const completed = action === 'completed' ? (couple.cards_completed || 0) + 1 : couple.cards_completed || 0;
        const liked = action === 'liked' ? (couple.cards_liked || 0) + 1 : couple.cards_liked || 0;

        await window.supabase.from('couples').update({
            cards_completed: completed,
            cards_liked: liked,
            last_active: new Date().toISOString()
        }).eq('id', couple.id);

        return true;
    } catch (error) {
        console.error('❌ syncCardAction error:', error);
        return false;
    }
};

// Принудительная организация кнопок
function organizeFloatingButtons() {
    const buttons = [
        { id: 'login-btn', icon: '👤', title: 'Войти', color: '#ff6b8b' },
        { id: 'myCardsBtn', icon: '✨', title: 'Мои карточки', color: '#6b8bff' },
        { id: 'profileBtn', icon: '👫', title: 'Профиль пары', color: '#ff8e53' },
        { id: 'favoritesBtn', icon: '⭐', title: 'Избранные', color: '#ffd166' }
    ];
    buttons.forEach((btnObj, i) => {
        let btn = document.getElementById(btnObj.id);
        if (!btn) { btn = document.createElement('button'); btn.id = btnObj.id; btn.innerHTML = btnObj.icon; btn.title = btnObj.title; document.body.appendChild(btn); }
        btn.style.cssText = `position: fixed; right: 20px; top: ${20 + i * 70}px; width: 50px; height: 50px; border-radius: 50%; background: ${btnObj.color}; color: white; border: none; font-size: 24px; cursor: pointer; z-index: 1000; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.2);`;
        btn.onmouseenter = () => { btn.style.transform = 'scale(1.1)'; btn.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; };
        btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)'; };
    });
}

document.addEventListener('DOMContentLoaded', () => setTimeout(organizeFloatingButtons, 1000));

