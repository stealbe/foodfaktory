async function loadFullMenu() {
    try {
        const response = await fetch('../php/resurces.php?action=full_menu');
        const data = await response.json();

        const pages = data.pages || [];
        const dishes = data.dishes || [];

        const container = document.querySelector('section.menu');
        const slideButtonsContainer = document.querySelector(".slide_buttons");

        if (!container || !slideButtonsContainer) return;

        container.innerHTML = '';

        const firstLabel = slideButtonsContainer.querySelector('label');

        if (!firstLabel) {
            console.error('В контейнере .slide_buttons нет ни одного label для клонирования');
            return;
        }

        slideButtonsContainer.querySelectorAll('label:not(:first-child)').forEach(l => l.remove());

        pages.forEach((page, index) => {
            let label;
            if (index === 0) {
                label = firstLabel;
            } else {
                label = firstLabel.cloneNode(true);
                slideButtonsContainer.appendChild(label);
            }

            const input = label.querySelector('input');
            const span = label.querySelector('span');

            if (input) {
                input.value = `value-${index + 1}`;
                input.id = `value-${index + 1}`;
                input.checked = index === 0;
                input.name = 'value-radio';

                input.addEventListener('change', () => {
                    pages.forEach((p, i) => {
                        const pg = container.querySelector(`.page_${p.id}`);
                        if (pg) pg.style.display = (i === index) ? 'block' : 'none';
                    });

                    const buttonWidth = label.offsetWidth;
                    const selection = slideButtonsContainer.querySelector('.selection');
                    if (selection) {
                        selection.style.transform = `translateX(${buttonWidth * index}px)`;
                    }
                });
            }

            if (span) {
                span.textContent = page.name;
            }

            label.style.flex = '1';
        });

        pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = `page_${page.id}`;
            pageDiv.dataset.title = page.name;
            pageDiv.style.display = index === 0 ? 'block' : 'none';
            container.appendChild(pageDiv);
        });

        dishes.forEach(dish => {
            const mainImg = `<img id="card_main_img" src="${dish.image1}" alt="${dish.name} изображение">`;

            let extraImgs = '';
            if (dish.image2 || dish.image3 || dish.image4) {
                extraImgs += '<div class="img_scroll">';
                if (dish.image2) extraImgs += `<button class="card_img_select" id="card_img_1"><img src="${dish.image2}" alt="${dish.name} изображение"></button>`;
                if (dish.image3) extraImgs += `<button class="card_img_select" id="card_img_2"><img src="${dish.image3}" alt="${dish.name} изображение"></button>`;
                if (dish.image4) extraImgs += `<button class="card_img_select" id="card_img_3"><img src="${dish.image4}" alt="${dish.name} изображение"></button>`;
                extraImgs += '</div>';
            }

            const ingredientsText = dish.ingredients || '';
            const ingredientsList = ingredientsText
                .split(',')
                .map(i => `<li>${i.trim()}</li>`)
                .join('');

            const html = `
            <div class="card reveal">
                <input type="radio" id="card_${dish.id}" name="menu_card" value="${dish.id}" />
                <label for="card_${dish.id}" class="card_btn">
                    <a class="back_btn" href="./menu.html">← Back</a>
                    <div>${mainImg}${extraImgs}</div>
                    <div class="card_text">
                        <h3>${dish.name}</h3>
                        <p class="gramm">${dish.weight || ''}</p>
                        <p class="price">${dish.price} zł</p>
                        <p class="ingredients">${ingredientsText}</p>
                    </div>
                    <p class="bnt_View_more">View more</p>
                    <div class="full_text">
                        <h3>${dish.name}</h3>
                        <p class="gramm">${dish.weight || ''}</p>
                        <p class="price">${dish.price} zł</p>
                        <h4>Ingredients</h4>
                        <ul>${ingredientsList}</ul>
                        <h4>Offer</h4>
                        <p>${dish.description}</p>
                    </div>
                </label>
            </div>
            `;

            const target = container.querySelector(`.page_${dish.page_id}`);
            if (target) target.insertAdjacentHTML('beforeend', html);
        });

        let selection = slideButtonsContainer.querySelector('.selection');
        if (!selection) {
            selection = document.createElement('span');
            selection.className = 'selection';
            slideButtonsContainer.appendChild(selection);
        }

        const firstLabelWidth = slideButtonsContainer.querySelector('label').offsetWidth;
        selection.style.width = `${firstLabelWidth}px`;
        selection.style.transform = `translateX(0px)`;

        const radios = slideButtonsContainer.querySelectorAll('input[name="value-radio"]');
        radios.forEach((radio, idx) => {
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                pages.forEach((page, i) => {
                    const pg = container.querySelector(`.page_${page.id}`);
                    if (pg) {
                        if (i === idx) {
                            pg.style.display = 'flex';
                            pg.style.width = '100%';
                            pg.style.alignItems = 'space-evenly';
                            pg.style.justifyContent = 'space-evenly';
                        } else {
                            pg.style.display = 'none';
                        }
                    }
                });
            });
        });

        const checkedRadio = [...radios].find(r => r.checked);
        if (checkedRadio) {
            checkedRadio.dispatchEvent(new Event('change'));
        }

    } catch (err) {
        console.error("Ошибка при загрузке меню:", err);
    }
}

window.addEventListener('DOMContentLoaded', loadFullMenu);
