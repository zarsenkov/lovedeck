<!doctype html>
<html lang="ru">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moments Soft Pastel</title>
  <script src="/_sdk/element_sdk.js"></script>
  <script src="/_sdk/data_sdk.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      height: 100%;
      width: 100%;
    }

    body {
      font-family: 'Quicksand', sans-serif;
      background: linear-gradient(135deg, #fde4f0 0%, #e8d5f2 50%, #d5e8f7 100%);
      color: #6b5b7a;
      overflow: hidden;
    }

    .app-wrapper {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .loading-screen {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #fde4f0 0%, #e8d5f2 50%, #d5e8f7 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      gap: 32px;
    }

    .loading-screen.hidden {
      display: none;
    }

    .loading-emoji {
      font-size: 80px;
      animation: subtleFloat 3s ease-in-out infinite;
    }

    @keyframes subtleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .loading-text {
      font-size: 18px;
      color: #a89aba;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .header {
      padding: 32px 20px;
      text-align: center;
      background: linear-gradient(135deg, #fce9f3 0%, #f2e9fc 100%);
      border-bottom: 1px solid rgba(230, 200, 220, 0.4);
      position: relative;
    }

    .header h1 {
      font-size: 42px;
      font-weight: 700;
      background: linear-gradient(135deg, #ff88cc, #b88fbf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .header-subtitle {
      font-size: 13px;
      color: #c9a8d4;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .screen {
      display: none;
      flex: 1;
      flex-direction: column;
      padding: 24px;
      gap: 16px;
    }

    .screen.active {
      display: flex;
    }

    .screen-names {
      justify-content: center;
      align-items: center;
    }

    .names-card {
      background: linear-gradient(135deg, #fce9f3 0%, #f0e9fc 100%);
      border-radius: 28px;
      padding: 40px 32px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 8px 32px rgba(255, 136, 204, 0.15);
      position: relative;
    }

    .names-title {
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ff88cc, #d97ba8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 1px;
    }

    .names-subtitle {
      font-size: 12px;
      color: #c9a8d4;
      text-align: center;
      margin-bottom: 28px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-label {
      font-size: 11px;
      color: #a89aba;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 10px;
      display: block;
    }

    .input-field {
      width: 100%;
      padding: 14px 18px;
      border: none;
      border-radius: 16px;
      background: linear-gradient(135deg, #fdf5f9 0%, #f5f0fb 100%);
      font-size: 14px;
      font-family: 'Quicksand', sans-serif;
      color: #6b5b7a;
      transition: all 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(255, 136, 204, 0.1);
      border: 1px solid rgba(255, 136, 204, 0.2);
    }

    .input-field::placeholder {
      color: #d4b8e0;
    }

    .input-field:focus {
      outline: none;
      box-shadow: 0 4px 20px rgba(255, 136, 204, 0.2);
      border: 1px solid rgba(255, 136, 204, 0.4);
    }

    .btn-primary {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #ff88cc, #ff99d8);
      color: white;
      border: none;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 24px;
      box-shadow: 0 6px 20px rgba(255, 136, 204, 0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: 'Quicksand', sans-serif;
    }

    .btn-primary:active {
      box-shadow: 0 3px 10px rgba(255, 136, 204, 0.2);
      transform: scale(0.98);
    }

    .screen-categories {
      justify-content: center;
      align-items: center;
    }

    .categories-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      width: 100%;
      max-width: 400px;
    }

    .category-card {
      background: linear-gradient(135deg, #fce9f3 0%, #f8e8fd 100%);
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      box-shadow: 0 6px 18px rgba(255, 136, 204, 0.12);
      position: relative;
    }

    .category-card:nth-child(1) {
      background: linear-gradient(135deg, #ffe8f5 0%, #ffd9f0 100%);
    }

    .category-card:nth-child(2) {
      background: linear-gradient(135deg, #e8f4ff 0%, #d9f0ff 100%);
    }

    .category-card:nth-child(3) {
      background: linear-gradient(135deg, #f3e8ff 0%, #f0d9ff 100%);
    }

    .category-card:nth-child(4) {
      background: linear-gradient(135deg, #e8ffe8 0%, #d9ffd9 100%);
    }

    .category-card:active {
      box-shadow: 0 3px 10px rgba(255, 136, 204, 0.15);
      transform: scale(0.97);
    }

    .category-emoji {
      font-size: 44px;
      margin-bottom: 12px;
    }

    .category-name {
      font-size: 18px;
      font-weight: 700;
      color: #6b5b7a;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .category-desc {
      font-size: 11px;
      color: #a89aba;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .screen-game {
      justify-content: center;
      align-items: center;
      padding: 0;
    }

    .game-header {
      width: 100%;
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #fce9f3 0%, #f2e9fc 100%);
      border-bottom: 1px solid rgba(230, 200, 220, 0.3);
    }

    .game-title {
      font-size: 16px;
      font-weight: 700;
      color: #6b5b7a;
      letter-spacing: 1px;
    }

    .game-back-btn {
      background: linear-gradient(135deg, #ffd9f0 0%, #f0d9ff 100%);
      border: none;
      color: #6b5b7a;
      padding: 10px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      font-family: 'Quicksand', sans-serif;
      transition: all 0.2s ease;
      box-shadow: 0 4px 10px rgba(255, 136, 204, 0.1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .game-back-btn:active {
      box-shadow: 0 2px 5px rgba(255, 136, 204, 0.1);
      transform: scale(0.96);
    }

    .game-container {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 24px;
    }

    .card-stack {
      width: 100%;
      max-width: 360px;
      height: 340px;
      perspective: 1000px;
      position: relative;
    }

    .card {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #fce9f3 0%, #f0e9fc 100%);
      border-radius: 24px;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 12px 32px rgba(255, 136, 204, 0.2);
      border: none;
      animation: cardEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(40px) scale(0.85);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .card-type {
      font-size: 10px;
      background: linear-gradient(135deg, #ffd9f0 0%, #f0d9ff 100%);
      color: #6b5b7a;
      padding: 8px 12px;
      border-radius: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
      box-shadow: 0 3px 8px rgba(255, 136, 204, 0.1);
    }

    .card-favorite-btn {
      background: linear-gradient(135deg, #fce9f3 0%, #f0e9fc 100%);
      border: none;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 10px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(255, 136, 204, 0.1);
      font-weight: 600;
    }

    .card-favorite-btn:active {
      box-shadow: 0 2px 5px rgba(255, 136, 204, 0.1);
      transform: scale(0.92);
    }

    .card-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-text {
      font-size: 17px;
      line-height: 1.8;
      color: #6b5b7a;
      text-align: center;
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      gap: 12px;
      width: 100%;
      margin-top: 16px;
    }

    .btn-card {
      flex: 1;
      padding: 13px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 12px;
      font-family: 'Quicksand', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #ffd9f0 0%, #f0d9ff 100%);
      color: #6b5b7a;
      box-shadow: 0 4px 10px rgba(255, 136, 204, 0.1);
    }

    .btn-card:active:not(:disabled) {
      box-shadow: 0 2px 5px rgba(255, 136, 204, 0.1);
      transform: scale(0.96);
    }

    .btn-card:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .screen-favorites {
      padding: 20px;
    }

    .favorites-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 12px;
    }

    .favorites-title {
      font-size: 26px;
      font-weight: 700;
      background: linear-gradient(135deg, #ff88cc, #d97ba8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 1px;
    }

    .game-back-btn-favorites {
      background: linear-gradient(135deg, #ffd9f0 0%, #f0d9ff 100%);
      border: none;
      color: #6b5b7a;
      padding: 10px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      font-family: 'Quicksand', sans-serif;
      transition: all 0.2s ease;
      box-shadow: 0 4px 10px rgba(255, 136, 204, 0.1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .game-back-btn-favorites:active {
      box-shadow: 0 2px 5px rgba(255, 136, 204, 0.1);
      transform: scale(0.96);
    }

    .favorites-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .favorite-card {
      background: linear-gradient(135deg, #fce9f3 0%, #f8e8fd 100%);
      border-radius: 16px;
      padding: 18px;
      border: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      box-shadow: 0 6px 15px rgba(255, 136, 204, 0.12);
      transition: all 0.2s ease;
    }

    .favorite-card:active {
      box-shadow: 0 3px 8px rgba(255, 136, 204, 0.1);
      transform: scale(0.97);
    }

    .favorite-card-content {
      flex: 1;
    }

    .favorite-card-text {
      font-size: 14px;
      color: #6b5b7a;
      margin-bottom: 6px;
      font-weight: 500;
      line-height: 1.5;
    }

    .favorite-card-category {
      font-size: 10px;
      color: #a89aba;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .favorite-remove-btn {
      background: linear-gradient(135deg, #ffd9f0 0%, #f0d9ff 100%);
      border: none;
      color: #6b5b7a;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      font-family: 'Quicksand', sans-serif;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 10px rgba(255, 136, 204, 0.1);
    }

    .favorite-remove-btn:active {
      box-shadow: 0 2px 5px rgba(255, 136, 204, 0.1);
      transform: scale(0.94);
    }

    .empty-favorites {
      text-align: center;
      color: #a89aba;
      padding: 60px 20px;
      font-size: 15px;
      font-weight: 500;
    }

    .empty-favorites-emoji {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
    }

    .content::-webkit-scrollbar {
      width: 10px;
    }

    .content::-webkit-scrollbar-track {
      background: transparent;
    }

    .content::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #ffd9f0, #f0d9ff);
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(255, 136, 204, 0.2);
    }
  </style>
  <style>body { box-sizing: border-box; }</style>
  <script src="https://cdn.tailwindcss.com/3.4.17" type="text/javascript"></script>
 </head>
 <body>
  <div class="app-wrapper">
   <div class="loading-screen" id="loadingScreen">
    <div class="loading-emoji">
     💭
    </div>
    <div class="loading-text">
     Создаём моменты...
    </div>
   </div>
   <div class="header">
    <h1>MOMENTS</h1>
    <div class="header-subtitle">
     Для вас двоих 💕
    </div>
   </div>
   <div class="content">
    <div class="screen screen-names active" id="namesScreen">
     <div class="names-card">
      <div class="names-title">
       Привет! 👋
      </div>
      <div class="names-subtitle">
       Скажи свои имена
      </div>
      <div class="input-group"><label class="input-label">Твоё имя</label> <input type="text" class="input-field" id="nameInput1" placeholder="Оля">
      </div>
      <div class="input-group"><label class="input-label">Имя партнёра</label> <input type="text" class="input-field" id="nameInput2" placeholder="Женя">
      </div><button class="btn-primary" onclick="startGame()">ПОЕХАЛИ! 🚀</button>
     </div>
    </div>
    <div class="screen screen-categories" id="categoriesScreen">
     <div class="categories-container" id="categoriesContainer"></div>
    </div>
    <div class="screen screen-game" id="gameScreen">
     <div class="game-header">
      <div class="game-title" id="gameTitle"></div><button class="game-back-btn" onclick="goToCategories()">← Назад</button>
     </div>
     <div class="game-container">
      <div class="card-stack" id="cardStack"></div>
      <div class="card-actions" id="cardActions"></div>
     </div>
    </div>
    <div class="screen screen-favorites" id="favoritesScreen">
     <div class="favorites-header">
      <div class="favorites-title">
       💗 Избранное
      </div><button class="game-back-btn-favorites" onclick="goToCategories()">← Назад</button>
     </div>
     <div class="favorites-list" id="favoritesList"></div>
    </div>
   </div>
  </div>
  <script>
    function declineName(name, caseType) {
      if (!name) return name;
      
      name = name.trim();
      const lower = name.toLowerCase();
      const last = lower.slice(-1);

      if (last === 'я') {
        switch (caseType) {
          case 'genitive': return name.slice(0, -1) + 'и';
          case 'dative': return name.slice(0, -1) + 'е';
          case 'instrumental': return name.slice(0, -1) + 'й';
          case 'prepositional': return name.slice(0, -1) + 'е';
          default: return name;
        }
      }

      if (last === 'й' || (last >= 'б' && last <= 'з') || (last >= 'к' && last <= 'н') || last === 'р' || last === 'с' || last === 'т' || last === 'ф' || last === 'х' || last === 'ц' || last === 'ч' || last === 'ш' || last === 'щ') {
        if (lower.endsWith('еня') || lower.endsWith('ня')) {
          switch (caseType) {
            case 'genitive': return name.slice(0, -1) + 'и';
            case 'dative': return name.slice(0, -1) + 'е';
            case 'instrumental': return name.slice(0, -1) + 'й';
            case 'prepositional': return name.slice(0, -1) + 'е';
            default: return name;
          }
        }
        
        switch (caseType) {
          case 'genitive': return name + 'а';
          case 'dative': return name + 'у';
          case 'instrumental': return name + 'ом';
          case 'prepositional': return name + 'е';
          default: return name;
        }
      }

      return name;
    }

    function interpolateText(text, name1, name2) {
      return text
        .replace(/\[1:nom\]/g, name1)
        .replace(/\[1:gen\]/g, declineName(name1, 'genitive'))
        .replace(/\[1:dat\]/g, declineName(name1, 'dative'))
        .replace(/\[1:inst\]/g, declineName(name1, 'instrumental'))
        .replace(/\[1:prep\]/g, declineName(name1, 'prepositional'))
        .replace(/\[2:nom\]/g, name2)
        .replace(/\[2:gen\]/g, declineName(name2, 'genitive'))
        .replace(/\[2:dat\]/g, declineName(name2, 'dative'))
        .replace(/\[2:inst\]/g, declineName(name2, 'instrumental'))
        .replace(/\[2:prep\]/g, declineName(name2, 'prepositional'));
    }

    const CATEGORIES = [
      { id: 'spicy', name: '🔥 18+', emoji: '🔥', description: 'Смелые вопросы' },
      { id: 'fun', name: '😂 Веселые', emoji: '😂', description: 'Вопросы со смехом' },
      { id: 'romantic', name: '💕 Романтичные', emoji: '💕', description: 'Нежные моменты' }
    ];

    const CARDS = {
      spicy: [
        { type: 'question', text: 'Что ты находишь самым сексуальным в [2:prep]?' },
        { type: 'action', text: 'Целуйте друг друга 60 секунд без перерыва' },
        { type: 'question', text: 'Какая твоя самая дерзкая фантазия с [2:inst]?' },
        { type: 'action', text: 'Медленно раздевайте друг друга, называя части тела, которые вам нравятся' },
        { type: 'question', text: 'Когда ты последний раз хотел(а) [2:gen] настолько, что не мог(ла) ждать?' },
        { type: 'action', text: 'Массируйте друг другу спину и шею в течение 3 минут' },
        { type: 'question', text: 'Что ты хочешь попробовать с [2:inst], но стеснялся(ась) сказать?' },
        { type: 'action', text: 'Целуйте шею и ухо [2:gen] в течение 2 минут' },
        { type: 'question', text: 'Какое твоё самое смелое воспоминание с [2:inst]?' },
        { type: 'action', text: 'Танцуйте вместе очень близко, касаясь телами' },
        { type: 'question', text: 'Где бы ты хотел(а) с нами быть прямо сейчас?' },
        { type: 'action', text: 'Смотрите друг другу в глаза 90 секунд, не отводя взгляда' },
        { type: 'question', text: 'Что ты хотел(а) бы услышать от [2:gen] прямо сейчас?' },
        { type: 'action', text: 'Целуйтесь медленно, как будто это первый раз' },
        { type: 'question', text: 'Какое место на теле [2:gen] тебя возбуждает больше всего?' },
        { type: 'action', text: 'Обнимайте друг друга, не думая о времени' },
        { type: 'question', text: 'Что ты хотел(а) бы попробовать, но никогда не просил(а)?' },
        { type: 'action', text: 'Кусайте друг друга нежно — уши, шея, губы' },
        { type: 'question', text: 'Когда ты понял(а), что [2:nom] — это навсегда?' },
        { type: 'action', text: 'Целуйтесь, держась за руки' },
        { type: 'question', text: 'Что ты хочешь услышать о себе от [2:gen]?' },
        { type: 'action', text: 'Легко касайтесь друг друга по всему телу в течение 2 минут' },
        { type: 'question', text: 'Какой самый интимный момент был с [2:inst]?' },
        { type: 'action', text: 'Целуйте руки друг друга медленно' },
        { type: 'question', text: 'О чём ты думаешь, когда смотришь на [2:gen]?' },
        { type: 'action', text: 'Лежите рядом и дышите синхронно' },
        { type: 'question', text: 'Как [2:nom] может тебя удивить?' },
        { type: 'action', text: 'Целуйтесь везде, кроме губ' },
        { type: 'question', text: 'Какая твоя самая смелая мечта с [2:inst]?' },
        { type: 'action', text: 'Обнимайте друг друга спиной к спине' },
        { type: 'question', text: 'Что делает [2:nom] для тебя особенным?' },
        { type: 'action', text: 'Целуйте лицо [2:gen] нежно' },
        { type: 'question', text: 'Что ты хочешь попробовать в ближайшее время?' },
        { type: 'action', text: 'Держите руки и медитируйте вместе' },
        { type: 'question', text: 'Какой момент с [2:inst] был самым горячим?' },
        { type: 'action', text: 'Целуйтесь, обнимая друг друга за шею' },
        { type: 'question', text: 'О чём ты фантазируешь с [2:inst]?' },
        { type: 'action', text: 'Лежите рядом и шепчите друг другу комплименты' },
        { type: 'question', text: 'Как [2:nom] тебя возбуждает?' },
        { type: 'action', text: 'Целуйтесь, касаясь ногами' }
      ],
      fun: [
        { type: 'question', text: 'Если бы [1:nom] был животным, каким?' },
        { type: 'action', text: 'Смешно подражайте друг другу' },
        { type: 'question', text: 'Какой самый неловкий момент в нашей истории?' },
        { type: 'action', text: 'Рассказывайте друг другу анекдоты, пока не начнёте смеяться' },
        { type: 'question', text: 'Если бы мы были персонажами фильма, какого?' },
        { type: 'action', text: 'Танцуйте под музыку как никто не смотрит' },
        { type: 'question', text: 'Какой мой худший привычка, которую ты терпишь?' },
        { type: 'action', text: 'Готовьте завтрак вместе, делая это максимально смешно' },
        { type: 'question', text: 'Какой мой самый смешной момент, который ты помнишь?' },
        { type: 'action', text: 'Пытайтесь повторить смешное видео или танец' },
        { type: 'question', text: 'Если бы [2:nom] был супергероем, какой бы это был силой?' },
        { type: 'action', text: 'Придумайте глупый танец и выполняйте его вместе' },
        { type: 'question', text: 'Какой мой самый раздражающий звук?' },
        { type: 'action', text: 'Делайте смешные фото с фильтрами' },
        { type: 'question', text: 'Если бы мы поменялись местами, что бы изменилось?' },
        { type: 'action', text: 'Придумайте и расскажите смешную историю вместе' },
        { type: 'question', text: 'Какое твоё самое смешное воспоминание со мной?' },
        { type: 'action', text: 'Имитируйте друг друга во время разговора' },
        { type: 'question', text: 'Что я говорю чаще всего, что тебя смешит?' },
        { type: 'action', text: 'Пейте воду смешными гримасами' },
        { type: 'question', text: 'Если бы я был(а) едой, какой бы это была?' },
        { type: 'action', text: 'Играйте в «Угадай кого я изображаю»' },
        { type: 'question', text: 'Какой самый смешной вопрос ты мне когда-либо задавал(а)?' },
        { type: 'action', text: 'Смотрите смешное видео и смейтесь вместе' },
        { type: 'question', text: 'Если бы мы жили в другом времени, когда бы это было?' },
        { type: 'action', text: 'Нарисуйте друг друга с закрытыми глазами' },
        { type: 'question', text: 'Что я не умею делать, но стараюсь?' },
        { type: 'action', text: 'Посмотрите видео с кошками и подражайте им' },
        { type: 'question', text: 'Если бы [2:nom] был преступником, какого рода преступления?' },
        { type: 'action', text: 'Петь дурацкие песни и делать смешные движения' },
        { type: 'question', text: 'Какой самый смешной подарок ты мне хотел(а) подарить?' },
        { type: 'action', text: 'Делайте смешные лица в зеркало друг на друга' },
        { type: 'question', text: 'Если бы я был(а) знаменитостью, какой?' },
        { type: 'action', text: 'Поём дуэт в своих самых смешных голосах' },
        { type: 'question', text: 'Что я делаю, когда думаю, что никто не смотрит?' },
        { type: 'action', text: 'Рассказывайте истории в стиле разных актёров' },
        { type: 'question', text: 'Если бы мы создали свою собственную планету, какой она была бы?' },
        { type: 'action', text: 'Прыгайте как в замедленной съемке' },
        { type: 'question', text: 'Какая самая смешная вещь со мной произошла?' },
        { type: 'action', text: 'Делайте смешные звуки друг другу' }
      ],
      romantic: [
        { type: 'question', text: 'Что ты чувствуешь, когда видишь [2:gen] каждое утро?' },
        { type: 'action', text: 'Держите руки и молчите 3 минуты, просто глядя друг на друга' },
        { type: 'question', text: 'Какой момент с [2:inst] был самым романтичным для тебя?' },
        { type: 'action', text: 'Напишите друг другу короткое любовное письмо и прочитайте вслух' },
        { type: 'question', text: 'Где ты видишь себя и [2:gen] через 10 лет?' },
        { type: 'action', text: 'Танцуйте медленный танец, обнимая друг друга' },
        { type: 'question', text: 'За что ты больше всего благодарен(ьна) [2:dat]?' },
        { type: 'action', text: 'Целуйтесь нежно и медленно, как в первый раз' },
        { type: 'question', text: 'Какой момент нашей истории изменил тебя навсегда?' },
        { type: 'action', text: 'Вместе смотрите закат и держитесь за руки' },
        { type: 'question', text: 'Когда ты понял(а), что я — твоя вторая половина?' },
        { type: 'action', text: 'Вспомните вашу первую встречу и расскажите друг другу о первых впечатлениях' },
        { type: 'question', text: 'Что я делаю, что вам нравится больше всего?' },
        { type: 'action', text: 'Лежите рядом и слушайте музыку' },
        { type: 'question', text: 'Какой мой лучший качество, которое ты полюбил(а) во мне?' },
        { type: 'action', text: 'Погладьте друг друга по волосам и лицу' },
        { type: 'question', text: 'Что ты хочешь сделать со мной в будущем?' },
        { type: 'action', text: 'Обнимайте друг друга, не думая о времени' },
        { type: 'question', text: 'Как я изменил(а) твою жизнь?' },
        { type: 'action', text: 'Целуйте руки друг друга' },
        { type: 'question', text: 'Какой самый милый момент между нами?' },
        { type: 'action', text: 'Пейте чай вместе и рассказывайте друг другу о своих мечтах' },
        { type: 'question', text: 'Что ты хочешь, чтобы я знал(а) о тебе?' },
        { type: 'action', text: 'Медитируйте вместе в покое' },
        { type: 'question', text: 'Какие наши совместные планы на будущее?' },
        { type: 'action', text: 'Целуйте лицо [2:gen] нежно' },
        { type: 'question', text: 'Что делает мой голос специальным для тебя?' },
        { type: 'action', text: 'Лежите рядом и разговаривайте о своих чувствах' },
        { type: 'question', text: 'Как часто ты думаешь обо мне в течение дня?' },
        { type: 'action', text: 'Пойте вместе вашу любимую песню' },
        { type: 'question', text: 'Какой твой любимый запах, который ассоциируется со мной?' },
        { type: 'action', text: 'Делайте друг другу комплименты в течение 5 минут' },
        { type: 'question', text: 'Если бы ты мог(ла) подарить мне что-то, что бы это было?' },
        { type: 'action', text: 'Держите друг друга, не разговаривая' },
        { type: 'question', text: 'Что ты любишь в нашей любви?' },
        { type: 'action', text: 'Смотрите в окно вместе и мечтайте' },
        { type: 'question', text: 'Какой был твой самый лучший день со мной?' },
        { type: 'action', text: 'Фотографируйте друг друга нежно' },
        { type: 'question', text: 'Что ты хотел(а) бы услышать от меня прямо сейчас?' },
        { type: 'action', text: 'Лежите рядом, касаясь лбами' }
      ]
    };

    let currentNames = { name1: '', name2: '' };
    let currentCategory = null;
    let currentCardIndex = 0;
    let allFavorites = [];

    async function initializeApp() {
      setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
      }, 2000);

      const dataHandler = {
        onDataChanged(data) {
          allFavorites = data || [];
          if (document.getElementById('favoritesScreen').classList.contains('active')) {
            renderFavorites();
          }
        }
      };

      await window.dataSdk.init(dataHandler);
      window.elementSdk.init({
        defaultConfig: { app_title: 'MOMENTS' },
        onConfigChange: async () => {},
        mapToCapabilities: () => ({ recolorables: [], borderables: [], fontEditable: undefined, fontSizeable: undefined }),
        mapToEditPanelValues: () => new Map([['app_title', 'MOMENTS']])
      });
    }

    function startGame() {
      const name1 = document.getElementById('nameInput1').value.trim();
      const name2 = document.getElementById('nameInput2').value.trim();

      if (!name1 || !name2) {
        alert('Введите оба имени');
        return;
      }

      currentNames = { name1, name2 };
      document.getElementById('namesScreen').classList.remove('active');
      document.getElementById('categoriesScreen').classList.add('active');
      renderCategories();
    }

    function renderCategories() {
      const container = document.getElementById('categoriesContainer');
      container.innerHTML = '';

      CATEGORIES.forEach((cat, idx) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
          <div class="category-emoji">${cat.emoji}</div>
          <div class="category-name">${cat.name}</div>
          <div class="category-desc">${cat.description}</div>
        `;
        card.addEventListener('click', () => selectCategory(cat.id));
        container.appendChild(card);
      });

      const favCard = document.createElement('div');
      favCard.className = 'category-card';
      favCard.innerHTML = `
        <div class="category-emoji">💗</div>
        <div class="category-name">Избранное</div>
        <div class="category-desc">${allFavorites.length} карточек</div>
      `;
      favCard.addEventListener('click', () => showFavorites());
      container.appendChild(favCard);
    }

    function selectCategory(catId) {
      currentCategory = catId;
      currentCardIndex = 0;
      document.getElementById('categoriesScreen').classList.remove('active');
      document.getElementById('gameScreen').classList.add('active');

      const categoryName = CATEGORIES.find(c => c.id === catId)?.name || 'Категория';
      document.getElementById('gameTitle').textContent = categoryName;
      showCard();
    }

    function showCard() {
      const cards = CARDS[currentCategory];
      if (!cards || cards.length === 0) return;

      const card = cards[currentCardIndex];
      const text = interpolateText(card.text, currentNames.name1, currentNames.name2);
      const cardStack = document.getElementById('cardStack');
      const isBookmarked = allFavorites.some(f => f.card_text === text && f.category === currentCategory);

      cardStack.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-type">${card.type === 'question' ? '❓ Вопрос' : '⚡ Действие'}</div>
            <button class="card-favorite-btn" onclick="toggleFavorite('${card.text.replace(/'/g, "\\'")}', '${currentCategory}', this)" title="Добавить в избранное">
              ${isBookmarked ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="card-content">
            <div class="card-text">${text}</div>
          </div>
        </div>
      `;

      const actionsContainer = document.getElementById('cardActions');
      const prevDisabled = currentCardIndex === 0;
      actionsContainer.innerHTML = `
        <button class="btn-card btn-prev" ${prevDisabled ? 'disabled' : ''} onclick="prevCard()">← Назад</button>
        <button class="btn-card btn-next" onclick="nextCard()">Далее →</button>
      `;
    }

    function nextCard() {
      const cards = CARDS[currentCategory];
      currentCardIndex = (currentCardIndex + 1) % cards.length;
      showCard();
    }

    function prevCard() {
      const cards = CARDS[currentCategory];
      currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
      showCard();
    }

    async function toggleFavorite(cardText, category, btn) {
      const text = interpolateText(cardText, currentNames.name1, currentNames.name2);
      const existing = allFavorites.find(f => f.card_text === text && f.category === category);

      if (existing) {
        await window.dataSdk.delete(existing);
        btn.textContent = '🤍';
      } else {
        await window.dataSdk.create({
          card_id: `${category}-${text.slice(0, 20)}`,
          card_text: text,
          category: category,
          is_favorited: true,
          favorited_at: new Date().toISOString()
        });
        btn.textContent = '❤️';
      }
    }

    function goToCategories() {
      document.getElementById('gameScreen').classList.remove('active');
      document.getElementById('favoritesScreen').classList.remove('active');
      document.getElementById('categoriesScreen').classList.add('active');
      renderCategories();
    }

    function showFavorites() {
      document.getElementById('categoriesScreen').classList.remove('active');
      document.getElementById('favoritesScreen').classList.add('active');
      renderFavorites();
    }

    function renderFavorites() {
      const list = document.getElementById('favoritesList');
      
      if (allFavorites.length === 0) {
        list.innerHTML = '<div class="empty-favorites"><span class="empty-favorites-emoji">💭</span>Здесь ещё нет избранных карточек</div>';
        return;
      }

      list.innerHTML = '';
      allFavorites.forEach(fav => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.dataset.backendId = fav.__backendId;
        card.innerHTML = `
          <div class="favorite-card-content">
            <div class="favorite-card-text">${fav.card_text}</div>
            <div class="favorite-card-category">${fav.category}</div>
          </div>
          <button class="favorite-remove-btn" onclick="removeFavorite('${fav.__backendId}')">✕</button>
        `;
        list.appendChild(card);
      });
    }

    async function removeFavorite(backendId) {
      const fav = allFavorites.find(f => f.__backendId === backendId);
      if (fav) {
        await window.dataSdk.delete(fav);
        const card = document.querySelector(`[data-backend-id="${backendId}"]`);
        if (card) {
          card.style.animation = 'cardEnter 0.3s ease-out reverse';
          setTimeout(() => card.remove(), 300);
        }
      }
    }

    document.getElementById('nameInput2').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') startGame();
    });

    initializeApp();
  </script>
 <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9cd121aae21537de',t:'MTc3MDk1MjIxNC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
</html>