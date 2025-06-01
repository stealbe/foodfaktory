async function loadFullMenu() {
    try {
        const container = document.querySelector('section.menu');
        const slideButtonsContainer = document.querySelector(".slide_buttons");
        if (!container || !slideButtonsContainer) return;

        container.innerHTML = '';
        slideButtonsContainer.innerHTML = '';

        // Проверяем наличие данных в sessionStorage
        let data;
        const cached = sessionStorage.getItem('full_menu');
        if (cached) {
            data = JSON.parse(cached);
        } else {
            const response = await fetch('../php/resurces.php?action=full_menu');
            data = await response.json();
            sessionStorage.setItem('full_menu', JSON.stringify(data));
        }

        const pages = data.pages || [];
        const dishes = data.dishes || [];

        const params = new URLSearchParams(window.location.search);
        const selectedCardId = params.get("card"); // например "card_5"
        const selectedPageIdFromUrl = parseInt(params.get("page"), 10);

        // Если выбран dish, то определяем page через dish
        let selectedPageId = null;
        if (selectedCardId) {
            const selectedDish = dishes.find(dish => `card_${dish.id}` === selectedCardId);
            if (selectedDish) selectedPageId = selectedDish.page_id;
        }
        // Если page явно передан в URL — приоритет
        if (selectedPageIdFromUrl && pages.some(p => p.id === selectedPageIdFromUrl)) {
            selectedPageId = selectedPageIdFromUrl;
        }

        // Убираем дубликаты блюд
        const uniqueDishesMap = new Map();
        dishes.forEach(d => {
            if (!uniqueDishesMap.has(d.id)) {
                uniqueDishesMap.set(d.id, d);
            }
        });
        const uniqueDishes = [...uniqueDishesMap.values()];

        // Если страница выбрана — показываем только её и блюда с этой page_id
        // Если нет — показываем все страницы и блюда
        const pagesToShow = selectedPageId ? pages.filter(p => p.id === selectedPageId) : pages;
        const dishesToShow = selectedPageId
            ? uniqueDishes.filter(dish => dish.page_id === selectedPageId)
            : uniqueDishes;

        // Добавляем span-селектор
        const selection = document.createElement('span');
        selection.className = 'selection';
        slideButtonsContainer.appendChild(selection);

        // Рендерим переключатели страниц
        pages.forEach((page, index) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            const span = document.createElement('span');

            input.type = 'radio';
            input.name = 'value-radio';
            input.value = `value-${page.id}`;
            input.id = `value-${page.id}`;
            // Отмечаем checked по выбранной странице из URL или первой странице
            input.checked = (selectedPageId ? selectedPageId === page.id : index === 0);

            span.textContent = page.name;

            label.appendChild(input);
            label.appendChild(span);
            slideButtonsContainer.appendChild(label);

            input.addEventListener('change', () => {
                // При смене страницы обновляем отображение и URL
                const newPageId = page.id;
                // Обновляем URL параметр page
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('page', newPageId);
                // При смене страницы сбрасываем card
                newUrl.searchParams.delete('card');
                history.replaceState(null, '', newUrl);

                // Показываем выбранную страницу, скрываем остальные
                pages.forEach((p) => {
                    const pg = container.querySelector(`.page_${p.id}`);
                    if (pg) pg.style.display = (p.id === newPageId) ? 'flex' : 'none';
                });

                // Очищаем и заново рендерим блюда для выбранной страницы
                pages.forEach(p => {
                    const pg = container.querySelector(`.page_${p.id}`);
                    if (pg) pg.innerHTML = '';
                });

                uniqueDishes.filter(dish => dish.page_id === newPageId).forEach(dish => {
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
                    const ingredientsList = ingredientsText.split(',').map(i => `<li>${i.trim()}</li>`).join('');
                    const isChecked = selectedCardId === `card_${dish.id}`;
                    const backHref = `./menu.html?page=${dish.page_id}`;

                    const html = `
                    <div class="card reveal">
                        <input type="radio" id="card_${dish.id}" name="menu_card" value="${dish.id}" ${isChecked ? 'checked' : ''} />
                        <label for="card_${dish.id}" class="card_btn">
                            <a class="back_btn" href="${backHref}">← Back</a>
                            <div>${mainImg}${extraImgs}</div>
                            <div class="card_text">
                                <h3>${dish.name}</h3>
                                <p class="gramm">${dish.weight ? `${dish.weight}g` : ''}</p>
                                <p class="price">${dish.price ? `${dish.price} zł` : ''}</p>
                                <p class="ingredients">${ingredientsText}</p>
                            </div>
                            <button class="bnt_addTo_cart">Add to cart</button>
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

                    const targetPage = container.querySelector(`.page_${dish.page_id}`);
                    if (targetPage) targetPage.insertAdjacentHTML('beforeend', html);
                });

                // Вешаем обработчики на новые карты
                container.querySelectorAll('input[name="menu_card"]').forEach(input => {
                    input.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            const cardId = `card_${e.target.value}`;
                            const url = new URL(window.location.href);
                            url.searchParams.set('card', cardId);
                            history.replaceState(null, '', url);
                        }
                    });
                });

                // Обновляем селектор
                const labelEls = slideButtonsContainer.querySelectorAll('label');
                const labelWidth = labelEls[0]?.offsetWidth || 70;
                const selectedIndex = [...pages].findIndex(p => p.id === newPageId);
                selection.style.transform = `translateX(${selectedIndex * labelWidth}px)`;
            });
        });

        // Рендерим страницы
        pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = `page_${page.id}`;
            pageDiv.dataset.title = page.name;
            pageDiv.style.display = (selectedPageId ? selectedPageId === page.id : index === 0) ? 'flex' : 'none';
            container.appendChild(pageDiv);
        });

        // Рендерим блюда для выбранной страницы или для всех страниц (если страница не выбрана)
        dishesToShow.forEach(dish => {
            const mainImg = `<img id="card_main_img" src="${dish.image1}" alt="${dish.name} zdjęcie">`;

            let extraImgs = '';
            if (dish.image2 || dish.image3 || dish.image4) {
                extraImgs += '<div class="img_scroll">';
                if (dish.image2) extraImgs += `<button class="card_img_select" id="card_img_1"><img src="${dish.image2}" alt="${dish.name} zdjęcie"></button>`;
                if (dish.image3) extraImgs += `<button class="card_img_select" id="card_img_2"><img src="${dish.image3}" alt="${dish.name} zdjęcie"></button>`;
                if (dish.image4) extraImgs += `<button class="card_img_select" id="card_img_3"><img src="${dish.image4}" alt="${dish.name} zdjęcie"></button>`;
                extraImgs += '</div>';
            }

            const ingredientsText = dish.ingredients || '';
            const ingredientsList = ingredientsText.split(',').map(i => `<li>${i.trim()}</li>`).join('');
            const isChecked = selectedCardId === `card_${dish.id}`;
            const backHref = `./menu.html?page=${dish.page_id}`; // изменено для кнопки Back

            const html = `
                <div class="card reveal">
                    <input type="radio" id="card_${dish.id}" name="menu_card" value="${dish.id}" ${isChecked ? 'checked' : ''} />
                    <label for="card_${dish.id}" class="card_btn">
                        <a class="back_btn" href="${backHref}">← Back</a>
                        <div>${mainImg}${extraImgs}</div>
                        <div class="card_text">
                            <h3>${dish.name}</h3>
                            <p class="gramm">${dish.weight ? `${dish.weight}g` : ''}</p>
                            <p class="price">${dish.price ? `${dish.price} zł` : ''}</p>
                            <p class="ingredients">${ingredientsText}</p>
                        </div>
                        <p class="bnt_View_more">View more</p>
                        <div class="full_text">
                            <h3>${dish.name}</h3>
                            <p class="gramm">${dish.weight ? `${dish.weight}g` : ''}</p>
                            <p class="price">${dish.price ? `${dish.price} zł` : ''}</p>
                            <h4>Ingredients</h4>
                            <ul>${ingredientsList}</ul>
                            <h4>Offer</h4>
                            <p>${dish.description}</p>
                        </div>
                    </label>
                </div>
            `;

            const targetPage = container.querySelector(`.page_${dish.page_id}`);
            if (targetPage) targetPage.insertAdjacentHTML('beforeend', html);
        });

        // Обработчик для смены карты — обновляет URL
        container.querySelectorAll('input[name="menu_card"]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const cardId = `card_${e.target.value}`;
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('card', cardId);
                    history.replaceState(null, '', newUrl);
                }
            });
        });

        // Устанавливаем позицию селектора при загрузке
        const labelEls = slideButtonsContainer.querySelectorAll('label');
        let selectedIndex = 0;
        if (selectedPageId) {
            selectedIndex = pages.findIndex(p => p.id === selectedPageId);
            if (selectedIndex === -1) selectedIndex = 0;
        }
        const labelWidth = labelEls[0]?.offsetWidth || 70;
        selection.style.transform = `translateX(${selectedIndex * labelWidth}px)`;

    } catch (error) {
        console.error('Error loading full menu:', error);
    }
}


window.addEventListener('DOMContentLoaded', loadFullMenu);
