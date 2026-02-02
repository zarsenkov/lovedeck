// supabase.js
// =========== ВАШИ ДАННЫЕ ОТСЮДА ===========
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co'  // Ваш URL из шага 1.4
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIs...'       // Ваш "Anon key" из шага 1.4
// ===========================================

// Создаем клиент Supabase
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// Текущий пользователь (будет заполняться)
window.currentUser = null

// ================== ФУНКЦИИ ==================

// 1. Инициализация аутентификации
async function initAuth() {
  console.log('Инициализация аутентификации...')
  
  // Проверяем, есть ли уже сессия
  const { data: { session } } = await window.supabase.auth.getSession()
  
  if (session) {
    // Пользователь уже вошел
    window.currentUser = session.user
    console.log('Уже вошли как:', session.user.email)
    updateUIForLoggedInUser()
    loadUserData()
  } else {
    // Показываем кнопку входа
    console.log('Не вошли, показываем кнопку входа')
    updateUIForLoggedOutUser()
  }
  
  // Слушаем изменения статуса входа
  window.supabase.auth.onAuthStateChange((event, session) => {
    console.log('Статус аутентификации изменился:', event)
    
    if (event === 'SIGNED_IN' && session) {
      window.currentUser = session.user
      updateUIForLoggedInUser()
      createCoupleProfile() // Создаем запись в таблице couples
      loadUserData()
    } else if (event === 'SIGNED_OUT') {
      window.currentUser = null
      updateUIForLoggedOutUser()
    }
  })
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
    </div>`
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Инициализируем Auth UI
    const { data: { subscription } } = window.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          hideAuthModal()
        }
      }
    )
  }
  
  document.getElementById('auth-modal').style.display = 'flex'
}

function hideAuthModal() {
  const modal = document.getElementById('auth-modal')
  if (modal) modal.style.display = 'none'
}

// 3. Обновить интерфейс для вошедшего пользователя
function updateUIForLoggedInUser() {
  // Находим или создаем кнопку профиля
  let profileBtn = document.getElementById('profile-btn')
  
  if (!profileBtn) {
    // Создаем кнопку если нет
    profileBtn = document.createElement('button')
    profileBtn.id = 'profile-btn'
    profileBtn.innerHTML = '👤'
    profileBtn.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 100;
      width: 50px; height: 50px; border-radius: 50%;
      background: #ff6b8b; border: none; color: white;
      font-size: 24px; cursor: pointer;
    `
    profileBtn.onclick = showProfileMenu
    document.body.appendChild(profileBtn)
  }
  
  // Меняем иконку на аватар если есть
  if (window.currentUser?.user_metadata?.avatar_url) {
    profileBtn.innerHTML = `<img src="${window.currentUser.user_metadata.avatar_url}" 
      style="width:100%; height:100%; border-radius:50%;">`
  }
}

// 4. Создать профиль пары в таблице couples
async function createCoupleProfile() {
  if (!window.currentUser) return
  
  try {
    // Проверяем, есть ли уже профиль
    const { data: existing } = await window.supabase
      .from('couples')
      .select('id')
      .eq('email', window.currentUser.email)
      .single()
    
    if (existing) {
      console.log('Профиль уже существует')
      return
    }
    
    // Создаем новый профиль
    const { error } = await window.supabase
      .from('couples')
      .insert({
        email: window.currentUser.email,
        names: 'Новая пара',
        love_level: 1,
        achievements: [],
        public_ranking: false
      })
    
    if (error) throw error
    console.log('Профиль пары создан!')
    
  } catch (error) {
    console.error('Ошибка создания профиля:', error)
  }
}

// 5. Загрузить данные пользователя
async function loadUserData() {
  if (!window.currentUser) return
  
  try {
    // Получаем профиль пары
    const { data: couple } = await window.supabase
      .from('couples')
      .select('*')
      .eq('email', window.currentUser.email)
      .single()
    
    if (couple) {
      console.log('Данные пары:', couple)
      // Здесь потом будем показывать уровень, бейджи и т.д.
    }
    
    // Получаем историю активностей
    const { data: activities } = await window.supabase
      .from('activities')
      .select('*')
      .eq('couple_id', couple.id)
      .order('timestamp', { ascending: false })
    
    console.log('История активностей:', activities)
    
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

// 6. Синхронизация действия с карточкой
async function syncCardAction(cardId, cardText, mode, action) {
  // action: 'completed' или 'liked'
  
  if (!window.currentUser) {
    console.log('Не вошли, сохраняем локально')
    // Здесь ваша существующая логика сохранения в localStorage
    return
  }
  
  // Получаем ID пары
  const { data: couple } = await window.supabase
    .from('couples')
    .select('id')
    .eq('email', window.currentUser.email)
    .single()
  
  if (!couple) {
    console.error('Профиль пары не найден')
    return
  }
  
  // Сохраняем в облако
  const { error } = await window.supabase
    .from('activities')
    .insert({
      couple_id: couple.id,
      card_id: cardId,
      card_text: cardText,
      mode: mode,
      completed: action === 'completed',
      liked: action === 'liked',
      timestamp: new Date().toISOString()
    })
  
  if (error) {
    console.error('Ошибка синхронизации:', error)
    // Сохраняем в очередь для повторной попытки
    saveToSyncQueue(cardId, cardText, mode, action)
  } else {
    console.log('Успешно синхронизировано!')
    // Обновляем уровень любви
    updateLoveLevel(couple.id)
  }
}

// 7. Очередь для оффлайн-работы
function saveToSyncQueue(cardId, cardText, mode, action) {
  let queue = JSON.parse(localStorage.getItem('syncQueue') || '[]')
  queue.push({
    cardId, cardText, mode, action,
    timestamp: new Date().toISOString()
  })
  localStorage.setItem('syncQueue', JSON.stringify(queue))
  
  // Показываем уведомление
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('LoveDeck', {
      body: 'Действие сохранено для синхронизации',
      icon: '/icon-192.png'
    })
  }
}

// 8. Профильное меню
function showProfileMenu() {
  // Создаем простое меню
  const menuHTML = `
  <div id="profile-menu" style="
    position: fixed; top: 80px; right: 20px; z-index: 100;
    background: white; border-radius: 10px; padding: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2); min-width: 250px;
  ">
    <h4 style="margin-top:0;">${window.currentUser?.email || 'Пара'}</h4>
    <div id="love-level-display">
      <div style="background:#eee; height:20px; border-radius:10px; overflow:hidden;">
        <div id="level-bar" style="background:linear-gradient(90deg,#ff6b8b,#ff8e53); height:100%; width:30%;"></div>
      </div>
      <p style="margin:5px 0; font-size:14px;">Уровень: <span id="level-text">1</span></p>
    </div>
    <hr>
    <button onclick="showEditProfile()" style="width:100%; padding:10px; margin:5px 0;">✏️ Редактировать профиль</button>
    <button onclick="showHistory()" style="width:100%; padding:10px; margin:5px 0;">📊 История активностей</button>
    <button onclick="window.supabase.auth.signOut()" style="width:100%; padding:10px; margin:5px 0; background:#ff6b8b; color:white;">🚪 Выйти</button>
  </div>`
  
  // Удаляем старое меню если есть
  const oldMenu = document.getElementById('profile-menu')
  if (oldMenu) oldMenu.remove()
  
  document.body.insertAdjacentHTML('beforeend', menuHTML)
  
  // Закрытие по клику вне меню
  setTimeout(() => {
    document.addEventListener('click', closeMenuOnClickOutside)
  }, 100)
}

function closeMenuOnClickOutside(event) {
  const menu = document.getElementById('profile-menu')
  const btn = document.getElementById('profile-btn')
  
  if (menu && !menu.contains(event.target) && !btn.contains(event.target)) {
    menu.remove()
    document.removeEventListener('click', closeMenuOnClickOutside)
  }
}

// ================== ЗАПУСК ==================

// Инициализируем когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initAuth, 1000) // Даем время загрузиться основному коду
})

// Экспортируем функции для использования в app.js
window.syncCardAction = syncCardAction
window.showAuthModal = showAuthModal
window.hideAuthModal = hideAuthModal
