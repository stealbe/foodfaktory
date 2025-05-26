let cachedSets = null;

async function loadSets() {
    try {
        const container = document.querySelector('div.menu');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const selectedSetId = urlParams.get('card');

        // Если данных ещё нет — загружаем
        if (!cachedSets) {
            const response = await fetch('../php/resurces.php?action=get_sets');
            const data = await response.json();
            cachedSets = data.sets || [];
        }

        container.innerHTML = '';

        // Если задан конкретный set
        let setsToRender = cachedSets;
        if (selectedSetId) {
            setsToRender = cachedSets.filter(set => String(set.id) === selectedSetId);
        }

        for (const set of setsToRender) {
            const safe = (v) => v ? v : '';
            const mainImg = `<img id="card_main_img" src="${safe(set.image1)}" alt="${set.name} zdjęcie">`;

            let extraImgs = '';
            if (set.image2 || set.image3 || set.image4) {
                extraImgs += `<div class="img_scroll">`;
                if (set.image2) extraImgs += `<button class="card_img_select" id="card_img_1"><img src="${set.image2}" alt="${set.name} zdjęcie"></button>`;
                if (set.image3) extraImgs += `<button class="card_img_select" id="card_img_2"><img src="${set.image3}" alt="${set.name} zdjęcie"></button>`;
                if (set.image4) extraImgs += `<button class="card_img_select" id="card_img_3"><img src="${set.image4}" alt="${set.name} zdjęcie"></button>`;
                extraImgs += `</div>`;
            }

            // Формируем список ингредиентов (из dishes, bakery, text)
            let ingredientsListHTML = '';
            let ingredientsText = '';
            const ingredientsData = [];

            if (Array.isArray(set.dishes)) {
                set.dishes.forEach(ing => {
                    ingredientsData.push({ id: ing.id, name: ing.name, type: 'dish' });
                });
            }

            if (Array.isArray(set.backery)) {
                set.backery.forEach(ing => {
                    ingredientsData.push({ id: ing.id, name: ing.name, type: 'backery' });
                });
            }

            if (Array.isArray(set.ingredient_text)) {
                set.ingredient_text.forEach(ing => {
                    ingredientsData.push({ name: ing, type: 'text' });
                });
            }

            const listItems = ingredientsData.map(ing => {
                const name = ing.name;
                if (ing.type === 'dish') {
                    return `<li><a href="./menu.html?card=card_${ing.id}">${name}</a></li>`;
                } else if (ing.type === 'backery') {
                    return `<li><a href="./backed.html?item=${ing.id}">${name}</a></li>`;
                } else {
                    return `<li>${name}</li>`;
                }
            });

            ingredientsListHTML = listItems.join('');
            ingredientsText = ingredientsData.map(ing => ing.name).join(', ');

            const html = `
            <div class="card reveal">
                <input type="radio" id="set_card_${set.id}" name="menu_card" value="${set.id}" ${selectedSetId == set.id ? 'checked' : ''} />
                <label for="set_card_${set.id}" class="card_btn" data-set-id="${set.id}">
                    <a class="back_btn" href="./sets.html">← Back</a>
                    <div>
                        ${mainImg}
                        ${extraImgs}
                    </div>
                    <div class="card_text">
                        <h3>${set.name}</h3>
                        <p class="price">${set.price} zł</p>
                        <p>${ingredientsText}</p>
                    </div>
                    <p class="bnt_View_more">View more</p>
                    <div class="full_text">
                        <h3>${set.name}</h3>
                        <p class="price">${set.price} zł</p>
                        <h4>Ingredients</h4>
                        <ul>${ingredientsListHTML}</ul>
                        <h4>Offer</h4>
                        <p>${safe(set.description)}</p>
                    </div>
                </label>
            </div>
            `;

            container.insertAdjacentHTML('beforeend', html);
        }

        // Обновление URL при выборе
        container.addEventListener('change', (e) => {
            if (e.target.name === 'menu_card') {
                const newId = e.target.value;
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('card', newId);
                window.history.replaceState(null, '', newUrl);
            }
        });
    } catch (err) {
        console.error('Ошибка при загрузке сетов:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadSets);
