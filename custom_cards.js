// ============================================
// LOVEDECK - МОИ КАРТОЧКИ (упрощённая версия)
// ============================================

// Получение всех карточек
function getAllCustomCards() {
    try {
        const cards = JSON.parse(localStorage.getItem("loveDeck_customCards") || "[]");
        return cards;
    } catch (error) {
        console.error("Ошибка загрузки карточек:", error);
        return [];
    }
}

// Загрузка и отображение карточек
function loadCustomCards() {
    const allCards = getAllCustomCards();
    const container = document.getElementById("myCardsList");
    
    if (!container) return;
    
    // Если нет карточек
    if (allCards.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                У вас пока нет своих карточек<br>
                Нажмите "+ Своя карточка" в меню, чтобы добавить первую! ✨
            </div>
        `;
        return;
    }
    
    // Отображаем карточки
    let html = "";
    allCards.forEach(card => {
        const modeEmoji = card.mode.includes("🔥") ? "🔥" : 
                         card.mode.includes("⚡") ? "⚡" :
                         card.mode.includes("💖") ? "💖" :
                         card.mode.includes("😄") ? "😄" : "🤔";
        
        const typeEmoji = card.type === "вопросы" ? "💬" :
                         card.type === "действия" ? "🔥" : "🌹";
        
        html += `
            <div class="custom-card-item">
                <div class="custom-card-text">${card.text}</div>
                <div class="custom-card-meta">
                    <div>
                        <span class="custom-card-mode">${modeEmoji} ${card.mode.replace(/[🔥⚡💖😄🤔]/g, '').trim()}</span>
                        <span class="custom-card-type">${typeEmoji} ${card.type === "вопросы" ? "Вопрос" : card.type === "действия" ? "Действие" : "Свидание"}</span>
                    </div>
                    <div class="custom-card-date">${card.date} • ${card.author || "Вы"}</div>
                </div>
                <button class="delete-button" data-id="${card.id}">
                    🗑️
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.querySelectorAll(".delete-button").forEach(btn => {
    btn.addEventListener("click", function () {
        const id = Number(this.dataset.id);
        deleteCustomCard(id);
    });
});
}

// Удаление карточки
function deleteCustomCard(id) {
    if (!confirm("Удалить эту карточку?")) return;
    
    try {
        const allCards = getAllCustomCards();
        const filteredCards = allCards.filter(card => card.id !== id);
        localStorage.setItem("loveDeck_customCards", JSON.stringify(filteredCards));
        loadCustomCards();
        showNotification("🗑️ Карточка удалена");
    } catch (error) {
        console.error("Ошибка удаления:", error);
    }
}

// Создание новой карточки
function saveCustomCard() {
    const text = document.getElementById("customCardText").value.trim();
    const selectedMode = document.querySelector(".mode-option.active")?.dataset.mode;
    const selectedType = document.querySelector(".type-option.active")?.dataset.type;
    
    // Проверки
    if (!text || text.length < 5) {
        alert("Напишите текст карточки (минимум 5 символов)");
        return;
    }
    
    if (!selectedMode || !selectedType) {
        alert("Выберите режим и тип карточки");
        return;
    }
    
    try {
        const customCards = getAllCustomCards();
        const newCard = {
            id: Date.now(),
            text: text,
            mode: selectedMode,
            type: selectedType,
            date: new Date().toLocaleString("ru-RU"),
            author: localStorage.getItem("loveDeck_user") || "Вы"
        };
        
        customCards.push(newCard);
        localStorage.setItem("loveDeck_customCards", JSON.stringify(customCards));
        
        // Закрываем модалку
        const modal = document.getElementById("customCardModal");
        if (modal) modal.classList.remove("active");
        
        document.getElementById("customCardText").value = "";
        if (document.getElementById("customCharCount")) {
            document.getElementById("customCharCount").textContent = "0";
        }
        
        alert("🎉 Карточка добавлена!");
        
        // Если открыто окно "Мои карточки" - обновляем
        const myCardsModal = document.getElementById("myCardsModal");
        if (myCardsModal && myCardsModal.classList.contains("active")) {
            loadCustomCards();
        }
        
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert("Ошибка при сохранении карточки");
    }
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.textContent = message;
    notification.style.background = "#ff4444";
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", function() {
    // Открытие модалки "Мои карточки"
    const myCardsBtn = document.getElementById("myCardsBtn");
    if (myCardsBtn) {
        myCardsBtn.addEventListener("click", function() {
            const modal = document.getElementById("myCardsModal");
            if (modal) {
                modal.classList.add("active");
                loadCustomCards();
            }
        });
    }
    
    // Закрытие модалки "Мои карточки"
    const closeBtn = document.getElementById("closeMyCards");
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            const modal = document.getElementById("myCardsModal");
            if (modal) modal.classList.remove("active");
        });
    }
    
    // Закрытие по клику вне
    const modal = document.getElementById("myCardsModal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === this) this.classList.remove("active");
        });
    }
    
    // Кнопка создания карточки
    const addBtn = document.getElementById("addCustomCardBtn");
    if (addBtn) {
        addBtn.addEventListener("click", function() {
            const modal = document.getElementById("customCardModal");
            if (modal) {
                modal.classList.add("active");
                if (document.getElementById("customCardText")) {
                    document.getElementById("customCardText").focus();
                }
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
    
    // Закрытие формы создания
    const closeCustomCardBtn = document.getElementById("closeCustomCard");
    if (closeCustomCardBtn) {
        closeCustomCardBtn.addEventListener("click", function() {
            const modal = document.getElementById("customCardModal");
            if (modal) modal.classList.remove("active");
        });
    }
    
});


