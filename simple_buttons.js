// simple_buttons.js
console.log('✅ Simple Buttons загружен!');

// Создаём ДВЕ простые кнопки в углу
function createSimpleButtons() {
    console.log('Создаём простые кнопки...');
    
    // Удаляем старые если есть
    const old = document.getElementById('simpleButtons');
    if (old) old.remove();
    
    // Создаём контейнер
    const div = document.createElement('div');
    div.id = 'simpleButtons';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        gap: 10px;
    `;
    
    // Кнопка 1: Пирамида
    const btn1 = document.createElement('button');
    btn1.innerHTML = '🏆';
    btn1.title = 'Пирамида Любви';
    btn1.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2196F3, #1565c0);
        color: white;
        border: none;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
        transition: all 0.3s;
    `;
    btn1.onmouseenter = () => btn1.style.transform = 'scale(1.1)';
    btn1.onmouseleave = () => btn1.style.transform = 'scale(1)';
    btn1.onclick = () => alert('🏆 Пирамида Любви\n\nСоревновательный режим с уровнями!\nСкоро будет!');
    
    // Кнопка 2: Онлайн игра
    const btn2 = document.createElement('button');
    btn2.innerHTML = '🎮';
    btn2.title = 'Играть онлайн';
    btn2.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6b8b, #ff4d6d);
        color: white;
        border: none;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(255, 107, 139, 0.4);
        transition: all 0.3s;
    `;
    btn2.onmouseenter = () => btn2.style.transform = 'scale(1.1)';
    btn2.onmouseleave = () => btn2.style.transform = 'scale(1)';
    btn2.onclick = () => alert('🎮 Игра на расстоянии\n\nИграйте вместе, даже если далеко!\nСкоро будет!');
    
    // Добавляем
    div.appendChild(btn1);
    div.appendChild(btn2);
    document.body.appendChild(div);
    
    console.log('✅ Простые кнопки созданы!');
}

// Запускаем
setTimeout(createSimpleButtons, 1000);
