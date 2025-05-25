async function loadSets() {
    try {
        const response = await fetch('../php/resurces.php?action=get_sets');
        const data = await response.json();

        const sets = data.sets || [];
        const container = document.querySelector('div.menu');
        if (!container) return;

        container.innerHTML = '';

        sets.forEach(set => {
            const safe = (v) => v ? v : '';

            const mainImg = `<img id="card_main_img" src="${safe(set.image1)}" alt="${set.name} zdjęcie">`;

            let extraImgs = '';
            if (set.image2 || set.image3 || set.image4) {
                extraImgs += `<div class="img_scroll">`;
                if (set.image2) {
                    extraImgs += `<button class="card_img_select" id="card_img_1"><img src="${set.image2}" alt="${set.name} zdjęcie"></button>`;
                }
                if (set.image3) {
                    extraImgs += `<button class="card_img_select" id="card_img_2"><img src="${set.image3}" alt="${set.name} zdjęcie"></button>`;
                }
                if (set.image4) {
                    extraImgs += `<button class="card_img_select" id="card_img_3"><img src="${set.image4}" alt="${set.name} zdjęcie"></button>`;
                }
                extraImgs += `</div>`;
            }

            const ingredientsArray = (set.ingredients || '').split(',').map(i => i.trim()).filter(Boolean);
            const ingredientsText = ingredientsArray.join(', ');
            const ingredientsList = ingredientsArray.map(i => `<li>${i}</li>`).join('');

            const html = `
            <div class="card reveal">
                <input type="radio" id="set_card_${set.id}" name="menu_card" value="${set.id}" />
                <label for="set_card_${set.id}" class="card_btn">
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
                        <ul>${ingredientsList}</ul>
                        <h4>Offer</h4>
                        <p>${safe(set.description)}</p>
                    </div>
                </label>
            </div>
            `;

            container.insertAdjacentHTML('beforeend', html);
        });

    } catch (err) {
        console.error('Ошибка при загрузке сетов:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadSets);