// ============================================
// LOVEDECK - УПРАВЛЕНИЕ СВОИМИ КАРТОЧКАМИ
// Полная версия
// ============================================

console.log("⚡ custom_cards.js загружен!");

// Переменные для фильтров
let currentFilterMode = "all";
let currentFilterType = "all";
let currentSearchText = "";

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Получение всех карточек
function getAllCustomCards() {
    try {
        const cards = JSON.parse(localStorage.getItem("loveDeck_customCards") || "[]");
        console.log(`📊 Загружено ${cards.length} карточек`);
        return cards;
    } catch (error) {
        console.error("Ошибка загрузки карточек:", error);
        return [];
    }
}

// Загрузка и отображение карточек
function loadCustomCards() {
    console.log("🔄 Загрузка карточек с фильтрами:", {
        mode: currentFilterMode,
        type: currentFilterType,
        search: currentSearchText
    });
    
    const allCards = getAllCustomCards();
    const container = document.getElementById("myCardsList");
    const statsContainer = document.getElementById("customCardsStats");
    
    if (!container) {
        console.error("❌ Не найден контейнер myCardsList!");
        return;
    }
    
    // Если нет карточек
    if (allCards.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                У вас пока нет своих карточек<br>
                Нажмите "+ Своя карточка" в меню, чтобы добавить первую! ✨
            </div>
        `;
        
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Всего</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Вопросов</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Действий</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Свиданий</div>
                </div>
            `;
        }
        return;
    }
    
    // Фильтрация
    let filteredCards = allCards;
    
    if (currentFilterMode !== "all") {
        filteredCards = filteredCards.filter(card => card.mode === currentFilterMode);
    }
    
    if (currentFilterType !== "all") {
        filteredCards = filteredCards.filter(card => card.type === currentFilterType);
    }
    
    if (currentSearchText) {
        const searchLower = currentSearchText.toLowerCase();
        filteredCards = filteredCards.filter(card => 
            card.text.toLowerCase().includes(searchLower) ||
            (card.author && card.author.toLowerCase().includes(searchLower))
        );
    }
    
    // Обновляем статистику
    if (statsContainer) {
        const total = allCards.length;
        const questions = allCards.filter(c => c.type === "вопросы").length;
        const actions = allCards.filter(c => c.type === "действия").length;
        const dates = allCards.filter(c => c.type === "свидания").length;
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Всего</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${questions}</div>
                <div class="stat-label">Вопросов</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${actions}</div>
                <div class="stat-label">Действий</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${dates}</div>
                <div class="stat-label">Свиданий</div>
            </div>
        `;
    }
    
    // Если после фильтрации ничего не осталось
    if (filteredCards.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Карточек не найдено<br>
                Попробуйте изменить фильтры или поисковый запрос
            </div>
        `;
        return;
    }
    
    // Отображаем карточки
    let html = "";
    filteredCards.forEach(card => {
        const modeEmoji = card.mode.includes("🔥") ? "🔥" : 
                         card.mode.includes("⚡") ? "⚡" :
                         card.mode.includes("💖") ? "💖" :
                         card.mode.includes("😄") ? "😄" : "🤔";
        
        const typeEmoji = card.type === "вопросы" ? "💬" :
                         card.type === "действия" ? "🔥" : "🌹";
        
        html += `
            <div class="custom-card-item" data-id="${card.id}">
                <div class="custom-card-text">${card.text}</div>
                <div class="custom-card-meta">
                    <div>
                        <span class="custom-card-mode">${modeEmoji} ${card.mode.replace(/[🔥⚡💖😄🤔]/g, '').trim()}</span>
                        <span class="custom-card-type">${typeEmoji} ${card.type === "вопросы" ? "Вопрос" : card.type === "действия" ? "Действие" : "Свидание"}</span>
                    </div>
                    <div class="custom-card-date">${card.date} • ${card.author || "Вы"}</div>
                </div>
                <div class="custom-card-actions">
                    <button class="action-button delete-button" onclick="window.deleteCustomCard(${card.id})">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`✅ Отображено ${filteredCards.length} карточек`);
}

// Удаление карточки
function deleteCustomCard(id) {
    if (!confirm("Удалить эту карточку?")) return;
    
    try {
        const allCards = getAllCustomCards();
        const filteredCards = allCards.filter(card => card.id !== id);
        localStorage.setItem("loveDeck_customCards", JSON.stringify(filteredCards));
        
        // Обновляем список
        loadCustomCards();
        
        // Уведомление
        showNotification("🗑️ Карточка удалена", "#ff4444");
        
        console.log("✅ Карточка удалена, ID:", id);
    } catch (error) {
        console.error("❌ Ошибка удаления:", error);
        alert("Ошибка при удалении карточки");
    }
}

// Показ уведомления
function showNotification(message, color = "#4CAF50") {
    const notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.textContent = message;
    notification.style.background = color;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ========== СОЗДАНИЕ КАРТОЧЕК ==========

// Инициализация формы создания
function initCustomCardForm() {
    console.log("📝 Инициализация формы создания карточек...");
    
    const addBtn = document.getElementById("addCustomCardBtn");
    if (!addBtn) {
        console.error("❌ Кнопка 'addCustomCardBtn' не найдена!");
        return;
    }
    
    // Открытие формы
    addBtn.addEventListener("click", function() {
        console.log("🎯 Открытие формы создания карточки");
        const modal = document.getElementById("customCardModal");
        if (modal) {
            modal.classList.add("active");
            document.getElementById("customCardText").focus();
        }
    });
    
    // Закрытие формы
    const closeBtn = document.getElementById("closeCustomCard");
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            const modal = document.getElementById("customCardModal");
            if (modal) modal.classList.remove("active");
        });
    }
    
    // Счётчик символов
    const textarea = document.getElementById("customCardText");
    const charCounter = document.getElementById("customCharCount");
    
    if (textarea && charCounter) {
        textarea.addEventListener("input", function() {
            const charCount = this.value.length;
            charCounter.textContent = charCount;
            
            // Меняем цвет при приближении к лимиту
            if (charCount > 280) {
                charCounter.style.color = "#ff4444";
                charCounter.style.fontWeight = "bold";
            } else if (charCount > 250) {
                charCounter.style.color = "#ff8e53";
            } else {
                charCounter.style.color = "#888";
            }
        });
    }
    
    // Выбор режима
    document.querySelectorAll(".mode-option").forEach(option => {
        option.addEventListener("click", function() {
            document.querySelectorAll(".mode-option").forEach(opt => opt.classList.remove("active"));
            this.classList.add("active");
        });
    });
    
    // Выбор типа
    document.querySelectorAll(".type-option").forEach(option => {
        option.addEventListener("click", function() {
            document.querySelectorAll(".type-option").forEach(opt => opt.classList.remove("active"));
            this.classList.add("active");
        });
    });
    
    // Сохранение карточки
    const saveBtn = document.getElementById("saveCustomCard");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveCustomCard);
    }
    
    // Закрытие по клику вне
    const modal = document.getElementById("customCardModal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === this) {
                this.classList.remove("active");
            }
        });
    }
    
    console.log("✅ Форма создания карточек инициализирована!");
}

// Сохранение карточки
function saveCustomCard() {
    const text = document.getElementById("customCardText").value.trim();
    const selectedMode = document.querySelector(".mode-option.active")?.dataset.mode;
    const selectedType = document.querySelector(".type-option.active")?.dataset.type;
    
    console.log("💾 Попытка сохранения карточки:", { text, selectedMode, selectedType });
    
    // Проверки
    if (!text) {
        alert("✏️ Напишите текст карточки!");
        document.getElementById("customCardText").focus();
        return;
    }
    
    if (text.length < 5) {
        alert("📝 Слишком короткий текст. Напишите хотя бы 5 символов!");
        return;
    }
    
    if (!selectedMode || !selectedType) {
        alert("❌ Выберите режим и тип карточки!");
        return;
    }
    
    try {
        // Сохраняем карточку
        const customCards = getAllCustomCards();
        
        const newCard = {
            id: Date.now(), // Уникальный ID
            text: text,
            mode: selectedMode,
            type: selectedType,
            date: new Date().toLocaleString("ru-RU"),
            author: localStorage.getItem("loveDeck_user") || "Вы"
        };
        
        customCards.push(newCard);
        localStorage.setItem("loveDeck_customCards", JSON.stringify(customCards));
        
        console.log("✅ Карточка сохранена:", newCard);
        
        // Анимация сохранения
        showNotification("✨ Карточка сохранена!", "#4CAF50");
        
        // Закрываем модалку и очищаем форму
        setTimeout(() => {
            const modal = document.getElementById("customCardModal");
            if (modal) modal.classList.remove("active");
            
            document.getElementById("customCardText").value = "";
            document.getElementById("customCharCount").textContent = "0";
            
            // Подтверждение
            const modeName = selectedMode.replace(/[🔥⚡💖😄🤔]/g, '').trim();
            alert(`🎉 Карточка добавлена в режим "${modeName}"!`);
            
            // Если открыто окно "Мои карточки" - обновляем его
            const myCardsModal = document.getElementById("myCardsModal");
            if (myCardsModal && myCardsModal.classList.contains("active")) {
                loadCustomCards();
            }
            
        }, 1000);
        
    } catch (error) {
        console.error("❌ Ошибка сохранения:", error);
        alert("Ошибка при сохранении карточки");
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener("DOMContentLoaded", function() {
    console.log("⏳ Инициализация модуля карточек...");
    
    setTimeout(function() {
        console.log("🚀 Запуск инициализации...");
        
        // 1. Форма создания карточек
        initCustomCardForm();
        
        const myCardsBtn = document.getElementById("myCardsBtn");
        if (!myCardsBtn) {
            console.error("❌ Кнопка 'myCardsBtn' не найдена!");
            return;
        }
        
        console.log("✅ Кнопка найдена, добавляю обработчики...");
        
        // Открытие модалки
        myCardsBtn.addEventListener("click", function() {
            console.log("🎯 Открытие 'Мои карточки'");
            const modal = document.getElementById("myCardsModal");
            if (modal) {
                modal.classList.add("active");
                loadCustomCards();
            }
        });
        
        // Закрытие модалки
        const closeBtn = document.getElementById("closeMyCards");
        if (closeBtn) {
            closeBtn.addEventListener("click", function() {
                const modal = document.getElementById("myCardsModal");
                if (modal) modal.classList.remove("active");
            });
        }
        
        // Фильтры по режиму
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilterMode = this.dataset.filter;
                loadCustomCards();
            });
        });
        
        // Фильтры по типу
        document.querySelectorAll('.type-filter').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.type-filter').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilterType = this.dataset.type;
                loadCustomCards();
            });
        });
        
        // Поиск
        const searchInput = document.getElementById("searchCards");
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentSearchText = this.value;
                loadCustomCards();
            });
        }
        
        // Экспорт
        const exportBtn = document.getElementById("exportCards");
        if (exportBtn) {
            exportBtn.addEventListener("click", function() {
                const cards = getAllCustomCards();
                if (cards.length === 0) {
                    alert("Нет карточек для экспорта!");
                    return;
                }
                
                const dataStr = JSON.stringify(cards, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', 'LoveDeck_Мои_карточки.json');
                linkElement.click();
                
                showNotification(`📥 Экспортировано ${cards.length} карточек!`);
            });
        }
        
        // Закрытие по клику вне модалки
        const modal = document.getElementById("myCardsModal");
        if (modal) {
            modal.addEventListener("click", function(e) {
                if (e.target === this) {
                    this.classList.remove("active");
                }
            });
        }
        
        // Делаем функции глобальными
        window.deleteCustomCard = deleteCustomCard;
        
        console.log("✅ Модуль карточек полностью инициализирован!");
        
    }, 500); // Небольшая задержка
});
