/**
 * Скрипт для игры "Кто я?" (Funky Pop Style)
 */

let categoriesData = {};
let selectedCategories = [];
let gamePool = [];
let score = 0;
let timer;
let timeLeft;
let currentWordIndex = 0;

// 1. Загрузка категорий из JSON
async function loadCats() {
    try {
        const response = await fetch('categories.json');
        const data = await response.json();
        // Учитываем, что в файле данные лежат в объекте { categories: { ... } }
        categoriesData = data.categories || data;
        
        const list = document.getElementById('category-list');
        list.innerHTML = ''; // Очистка

        Object.keys(categoriesData).forEach(catName => {
            const div = document.createElement('div');
            div.className = 'cat-item';
            
            // Красиво разделяем эмодзи и текст заголовка
            const emojiMatch = catName.match(/[\u{1F300}-\u{1F9FF}]/u);
            const textOnly = catName.replace(/[\u{1F300}-\u{1F9FF}]/u, '').trim();

            div.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 5px;">${emojiMatch ? emojiMatch[0] : '🏷️'}</div>
                <div style="font-size: 11px; line-height: 1.2; font-weight: 700;">${textOnly}</div>
            `;

            div.onclick = () => {
                div.classList.toggle('selected');
                if (selectedCategories.includes(catName)) {
                    selectedCategories = selectedCategories.filter(c => c !== catName);
                } else {
                    selectedCategories.push(catName);
                }
            };
            list.appendChild(div);
        });
    } catch (e) {
        console.error("Ошибка загрузки категорий:", e);
        alert("Не удалось загрузить категории. Проверь файл categories.json");
    }
}

// 2. Инициализация и подготовка пула слов
function startGame() {
    if (selectedCategories.length === 0) {
        alert("Выбери хотя бы одну категорию для расследования!");
        return;
    }
    
    // Собираем все слова из выбранных категорий в один массив
    gamePool = [];
    selectedCategories.forEach(cat => {
        gamePool = [...gamePool, ...categoriesData[cat]];
    });

    // Перемешиваем пул слов (алгоритм Фишера-Йетса)
    for (let i = gamePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gamePool[i], gamePool[j]] = [gamePool[j], gamePool[i]];
    }
    
    score = 0;
    timeLeft = parseInt(document.getElementById('time-input').value) || 60;
    
    toScreen('ready-screen');
    startCountdown();
}

// 3. Обратный отсчет перед началом
function startCountdown() {
    let count = 3;
    const el = document.getElementById('countdown');
    el.innerText = count;

    const interval = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            beginRound();
        } else {
            el.innerText = count;
        }
    }, 1000);
}

// 4. Запуск игрового таймера и процесса
function beginRound() {
    toScreen('game-screen');
    document.getElementById('timer-display').innerText = timeLeft;
    
    renderNextWord();
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-display').innerText = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 5. Показ следующего слова
function renderNextWord() {
    if (gamePool.length === 0) {
        endGame();
        return;
    }
    const word = gamePool.pop();
    document.getElementById('current-word').innerText = word;
}

// 6. Обработка кнопок "Угадал" и "Пропустить"
function nextWord(isCorrect) {
    if (isCorrect) {
        score++;
        // Короткая вибрация на успех
        if (window.navigator.vibrate) window.navigator.vibrate(50);
    } else {
        // Двойная вибрация на пропуск
        if (window.navigator.vibrate) window.navigator.vibrate([50, 50]);
    }
    
    renderNextWord();
}

// 7. Финал игры
function endGame() {
    clearInterval(timer);
    document.getElementById('final-score').innerText = score;
    toScreen('result-screen');
}

// 8. Вспомогательная функция переключения экранов
function toScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

// Запуск загрузки при старте страницы
document.addEventListener('DOMContentLoaded', loadCats);
