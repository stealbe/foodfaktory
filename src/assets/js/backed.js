async function loadBakeryMenu() {
    try {
        const response = await fetch('../php/resurces.php?action=get_bakery');
        const data = await response.json();

        const bakeryItems = data.bakery || [];
        const container = document.querySelector('section.menu');
        const lowbar = document.querySelector('section.lowbar');
        if (!container || !lowbar) return;

        container.innerHTML = '';

        const itemsPerPage = 50;
        const pageCount = Math.ceil(bakeryItems.length / itemsPerPage);

        // Slider if pages>1
        let slideButtonsContainer = lowbar.querySelector('.slide_buttons');
        if (pageCount > 1) {
            if (!slideButtonsContainer) {
                slideButtonsContainer = document.createElement('div');
                slideButtonsContainer.className = 'slide_buttons';
                lowbar.appendChild(slideButtonsContainer);
            }
            slideButtonsContainer.innerHTML = '';
        } else {
            if (slideButtonsContainer) slideButtonsContainer.remove();
            slideButtonsContainer = null;
        }

        // Add pages
        for (let i = 0; i < pageCount; i++) {
            const pageDiv = document.createElement('div');
            pageDiv.className = `page_${i + 1}`;
            pageDiv.dataset.title = `Page ${i + 1}`;
            pageDiv.style.display = i === 0 ? 'block' : 'none';
            container.appendChild(pageDiv);
        }

        bakeryItems.forEach((item, index) => {
            const pageIndex = Math.floor(index / itemsPerPage) + 1;
            const target = container.querySelector(`.page_${pageIndex}`);

            if (!target) return;

            const html = `
                <div class="card reveal">
                    <input type="radio" id="backed_card_${item.id}" name="menu_card" value="${item.id}" />
                    <label for="backed_card_${item.id}" class="card_btn">
                        <a class="back_btn" href="./bakery.html">← Back</a>
                        <div>
                            <img id="card_main_img" src="${item.image1}" alt="${item.name} фото" />
                            ${item.image2 ? `<button class="card_img_select" id="card_img_1"><img src="${item.image2}" alt="${item.name} фото"></button>` : ''}
                            ${item.image3 ? `<button class="card_img_select" id="card_img_2"><img src="${item.image3}" alt="${item.name} фото"></button>` : ''}
                            ${item.image4 ? `<button class="card_img_select" id="card_img_3"><img src="${item.image4}" alt="${item.name} фото"></button>` : ''}
                        </div>
                        <div class="card_text">
                            <h3>${item.name}</h3>
                            <p class="gramm">${item.weight || ''}g</p>
                            <p class="price">${item.price} zł</p>
                            <p class="ingredients">${item.ingredients ? item.ingredients.split(',').map(i => i.trim()).join(', ') : ''}</p>
                        </div>
                        <p class="bnt_View_more">View more</p>
                        <div class="full_text">
                            <h3>${item.name}</h3>
                            <p class="gramm">${item.weight || ''}g</p>
                            <p class="price">${item.price} zł</p>
                            <h4>Ingredients</h4>
                            <ul>
                                ${(item.ingredients ? item.ingredients.split(',').map(i => `<li>${i.trim()}</li>`).join('') : '')}
                            </ul>
                            <h4>Offer</h4>
                            <p>${item.description || ''}</p>
                        </div>
                    </label>
                </div>
            `;

            target.insertAdjacentHTML('beforeend', html);
        });

        // Если есть слайдер — создаём радиокнопки для переключения страниц
        if (slideButtonsContainer) {
            const firstLabel = document.createElement('label');
            firstLabel.style.flex = '1';

            const firstInput = document.createElement('input');
            firstInput.type = 'radio';
            firstInput.name = 'value-radio';
            firstInput.value = 'value-1';
            firstInput.id = 'value-1';
            firstInput.checked = true;

            const firstSpan = document.createElement('span');
            firstSpan.textContent = '1';

            firstLabel.appendChild(firstInput);
            firstLabel.appendChild(firstSpan);
            slideButtonsContainer.appendChild(firstLabel);

            for (let i = 1; i < pageCount; i++) {
                const label = firstLabel.cloneNode(true);
                const input = label.querySelector('input');
                const span = label.querySelector('span');

                input.value = `value-${i + 1}`;
                input.id = `value-${i + 1}`;
                input.checked = false;
                span.textContent = `${i + 1}`;

                slideButtonsContainer.appendChild(label);
            }

            // Добавляем selection
            let selection = slideButtonsContainer.querySelector('.selection');
            if (!selection) {
                selection = document.createElement('span');
                selection.className = 'selection';
                slideButtonsContainer.appendChild(selection);
            }
            const firstLabelWidth = slideButtonsContainer.querySelector('label').offsetWidth;
            selection.style.width = `${firstLabelWidth}px`;
            selection.style.transform = 'translateX(0)';

            // Обработчик смены страницы
            const radios = slideButtonsContainer.querySelectorAll('input[name="value-radio"]');
            radios.forEach((radio, idx) => {
                radio.addEventListener('change', () => {
                    if (!radio.checked) return;

                    for (let i = 0; i < pageCount; i++) {
                        const pg = container.querySelector(`.page_${i + 1}`);
                        if (pg) {
                            pg.style.display = i === idx ? 'block' : 'none';
                        }
                    }

                    const buttonWidth = radios[0].parentElement.offsetWidth;
                    selection.style.transform = `translateX(${buttonWidth * idx}px)`;
                });
            });
        }

    } catch (err) {
        console.error('Ошибка при загрузке bakery:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadBakeryMenu);
