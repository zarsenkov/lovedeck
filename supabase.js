// supabase.js
// =========== ВАШИ ДАННЫЕ ОТСЮДА ===========
const SUPABASE_URL = 'https://ваш-проект.supabase.co'  // Ваш URL из Supabase
const SUPABASE_KEY = 'ваш-public-key'       // Ваш "Anon key" из Supabase
// ===========================================

// Создаем клиент Supabase
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Текущий пользователь (будет заполняться)
window.currentUser = null;

// ================== ФУНКЦИИ ==================

// 1. Инициализация аутентификации
async function initAuth() {
  console.log('Инициализация аутентификации...');
  
  // Проверяем, есть ли уже сессия
  const { data: { session } } = await window.supabase.auth.getSession();
  
  if (session) {
    // Пользователь уже вошел
    window.currentUser = session.user;
    console.log('Уже вошли как:', session.user.email);
    updateUIForLoggedInUser();
    loadUserData();
  } else {
    // Показываем кнопку входа
    console.log('Не вошли, показываем кнопку входа');
    updateUIForLoggedOutUser();
  }
  
  // Слушаем изменения статуса входа
  window.supabase.auth.onAuthStateChange((event, session) => {
    console.log('Статус аутентификации изменился:', event);
    
    if (event === 'SIGNED_IN' && session) {
      window.currentUser = session.user;
      updateUIForLoggedInUser();
      createCoupleProfile(); // Создаем запись в таблице couples
      loadUserData();
    } else if (event === 'SIGNED_OUT') {
      window.currentUser = null;
      updateUIForLoggedOutUser();
    }
  });
}

// 2. Показать/скрыть модалку входа
function showAuthModal() {
  // Создаем модалку если еще нет
  if (!document.getElementById('auth-modal')) {
    const modalHTML = `
    <div id="auth-modal" style="
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    ">
      <div style="
        background: white; padding: 30px; border-radius: 15px;
        max-width: 400px; width: 90%;
      ">
        <h3 style="margin-top:0;">Вход в LoveDeck</h3>
        <div id="auth-ui-container"></div>
        <button onclick="hideAuthModal()" style="
          margin-top: 20px; width: 100%; padding: 10px;
          background: #eee; border: none; border-radius: 5px;
        ">Закрыть</button>
      </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Инициализируем Auth UI
    window.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          hideAuthModal();
        }
      }
    );
  }
  
  document.getElementById('auth-modal').style.display = 'flex';
}

function hideAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}

// 3. Обновить интерфейс для вошедшего пользователя
function updateUIForLoggedInUser() {
  // Находим или создаем кнопку профиля
  let profileBtn = document.getElementById('profile-btn');
  
  if (!profileBtn) {
    // Создаем кнопку если нет
    profileBtn = document.createElement('button');
    profileBtn.id = 'profile-btn';
    profileBtn.innerHTML = '👤';
    profileBtn.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 100;
      width: 50px; height: 50px; border-radius: 50%;
      background: #ff6b8b; border: none; color: white;
      font-size: 24px; cursor: pointer;
    `;
    profileBtn.onclick = showProfileMenu;
    document.body.appendChild(profileBtn);
  }
  
  // Меняем иконку на аватар если есть
  if (window.currentUser?.user_metadata?.avatar_url) {
    profileBtn.innerHTML = `<img src="${window.currentUser.user_metadata.avatar_url}" 
      style="width:100%; height:100%; border-radius:50%;">`;
  }
}

// 4. Обновить интерфейс для невошедшего пользователя
function updateUIForLoggedOutUser() {
  let loginBtn = document.getElementById('login-btn');
  
  if (!loginBtn) {
    // Создаем кнопку входа
    loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.innerHTML = '👤 Войти для синхронизации';
    loginBtn.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 100;
      padding: 10px 20px; background: #ff6b8b; color: white;
      border: none; border-radius: 25px; cursor: pointer;
      font-size: 14px;
    `;
    loginBtn.onclick = showAuthModal;
    document.body.appendChild(loginBtn);
  }
  
  // Убираем кнопку профиля если есть
  const profileBtn = document.getElementById('profile-btn');
  if (profileBtn) profileBtn.remove();
}

// 5. Синхронизация действия с карточкой (ЭТУ ФУНКЦИЮ ВЫЗЫВАЕТ app.js)
async function syncCardAction(cardId, cardText, mode, action) {
  if (!window.currentUser) {
    console.log('Пользователь не вошел, пропускаем синхронизацию');
    return;
  }
  
  try {
    // Получаем ID пары
    const { data: couple } = await window.supabase
      .from('couples')
      .select('id')
      .eq('email', window.currentUser.email)
      .single();
    
    if (!couple) {
      console.error('Профиль пары не найден');
      return;
    }
    
    // Сохраняем в облако
    const { error } = await window.supabase
      .from('activities')
      .insert({
        couple_id: couple.id,
        card_id: cardId,
        card_text: cardText.substring(0, 255), // Обрезаем длинный текст
        mode: mode,
        completed: action === 'completed',
        liked: action === 'liked',
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Ошибка синхронизации:', error);
      throw error;
    }
    
    console.log(`✅ Успешно синхронизировано в облако (${action})`);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка при синхронизации:', error);
    throw error;
  }
}

// Экспортируем функцию для использования в app.js
window.syncCardAction = syncCardAction;

// ================== ЗАПУСК ==================

// Инициализируем когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.supabase) {
      initAuth();
    } else {
      console.error('Supabase не загрузился');
    }
  }, 1000); // Даем время загрузиться основному коду
});
