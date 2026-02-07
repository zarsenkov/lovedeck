document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('cards-container');
    const citySelector = document.getElementById('city-selector');
    const cityTitle = document.getElementById('city-title');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const cityNames = {
        all: "РОССИЯ<span>ПУТЕВОДИТЕЛЬ</span>",
        msk: "МОСКВА<span>ДЕФОЛТ-СИТИ</span>",
        spb: "ПИТЕР<span>КУЛЬТУРНО</span>",
        sochi: "СОЧИ<span>НА ЮГАХ</span>",
        ekb: "ЕКБ<span>УРАЛЬСКИЙ ВАЙБ</span>",
        kazan: "КАЗАНЬ<span>ТРЕТЬЯ СТОЛИЦА</span>"
    };

    function render() {
        container.innerHTML = '';
        const currentCity = citySelector.value;
        const currentCat = [...filterBtns].find(b => b.classList.contains('active')).dataset.cat;

        cityTitle.innerHTML = cityNames[currentCity];

        const filtered = cardsData.filter(item => {
            const cityMatch = currentCity === 'all' || item.city === currentCity;
            const catMatch = currentCat === 'all' || item.category === currentCat;
            return cityMatch && catMatch;
        });

        filtered.forEach((card, index) => {
            const el = document.createElement('div');
            el.className = 'card';
            const randomRotate = (Math.random() * 4 - 2).toFixed(1);
            el.style.setProperty('--r', `${randomRotate}deg`);
            el.style.animationDelay = `${index * 0.1}s`;
            
            el.innerHTML = `
                <div class="card-meta">
                    <span>${card.city.toUpperCase()} // ${card.category.toUpperCase()}</span>
                    <span>ID:${1000 + index}</span>
                </div>
                <h3>${card.title}</h3>
                <p>${card.desc}</p>
                <div class="hint-box">
                    "Заметка: ${card.hint}"
                </div>
            `;
            container.appendChild(el);
        });
    }

    citySelector.addEventListener('change', render);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            render();
        });
    });

    render();
});