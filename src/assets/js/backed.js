let cachedBakeryData = null;
const itemsPerPage = 50;

async function loadBakeryMenu() {
    try {
        const referrer = document.referrer;
        // Замените 'index.html' или 'main.html' на имя вашей общей страницы
        const fromMainPage = referrer.includes('index.html') || referrer.includes('main.html');

        const urlParams = new URLSearchParams(window.location.search);
        let currentPage = parseInt(urlParams.get('page')) || 1;
        let selectedItemId = urlParams.get('item');

        let bakeryItems;

        if (fromMainPage) {
            // Если пришли с общей страницы — пытаемся взять данные из sessionStorage
            const cached = sessionStorage.getItem('bakeryData');
            if (cached) {
                bakeryItems = JSON.parse(cached);
            } else {
                // Если кеша нет — делаем запрос и сохраняем
                const response = await fetch('../php/resurces.php?action=get_bakery');
                const data = await response.json();
                bakeryItems = data.bakery || [];
                sessionStorage.setItem('bakeryData', JSON.stringify(bakeryItems));
            }
        } else {
            // Если пришли извне — грузим с сервера заново (без кеша)
            const response = await fetch('../php/resurces.php?action=get_bakery');
            const data = await response.json();
            bakeryItems = data.bakery || [];
        }

        cachedBakeryData = bakeryItems;

        const container = document.querySelector('section.menu');
        const lowbar = document.querySelector('section.lowbar');
        if (!container || !lowbar) return;

        container.innerHTML = '';

        const pageCount = Math.ceil(bakeryItems.length / itemsPerPage);

        // Если есть выбранный item — определяем страницу, на которой он находится
        if (selectedItemId) {
            const selectedIndex = bakeryItems.findIndex(item => String(item.id) === selectedItemId);
            if (selectedIndex !== -1) {
                currentPage = Math.floor(selectedIndex / itemsPerPage) + 1;
            }
        }

        // Создаем только нужную страницу
        const pageDiv = document.createElement('div');
        pageDiv.className = `page page_${currentPage}`;
        pageDiv.dataset.title = `Page ${currentPage}`;
        pageDiv.style.display = 'flex';
        container.appendChild(pageDiv);

        // Добавляем карточки только для текущей страницы
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, bakeryItems.length);

        for (let i = startIndex; i < endIndex; i++) {
            const item = bakeryItems[i];
            const html = `
        <div class="card reveal">
          <input type="radio" id="backed_card_${item.id}" name="menu_card" value="${item.id}" />
          <label for="backed_card_${item.id}" class="card_btn">
            <a class="back_btn" href="./backed.html?page=${currentPage}">← Back</a>
            <div>
              <img id="card_main_img" src="${item.image1 || ''}" alt="${item.name} фото" />
              ${item.image2 ? `<button class="card_img_select" id="card_img_1"><img src="${item.image2}" alt="${item.name} фото"></button>` : ''}
              ${item.image3 ? `<button class="card_img_select" id="card_img_2"><img src="${item.image3}" alt="${item.name} фото"></button>` : ''}
              ${item.image4 ? `<button class="card_img_select" id="card_img_3"><img src="${item.image4}" alt="${item.name} фото"></button>` : ''}
            </div>
            <div class="card_text">
              <h3>${item.name}</h3>
              <p class="gramm">${item.weight ? `${item.weight}g` : ''}</p>
              <p class="price">${item.price ? `${item.price} zł` : ''}</p>
              <p class="ingredients">${item.ingredients ? item.ingredients.split(',').map(i => i.trim()).join(', ') : ''}</p>
            </div>
            <p class="bnt_View_more">View more</p>
            <div class="full_text">
              <h3>${item.name}</h3>
              <p class="gramm">${item.weight ? `${item.weight}g` : ''}</p>
              <p class="price">${item.price ? `${item.price} zł` : ''}</p>
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
            pageDiv.insertAdjacentHTML('beforeend', html);
        }

        // Создаем слайдер пагинации
        let slideButtonsContainer = lowbar.querySelector('.slide_buttons');
        if (pageCount > 1) {
            if (!slideButtonsContainer) {
                slideButtonsContainer = document.createElement('div');
                slideButtonsContainer.className = 'slide_buttons';
                lowbar.appendChild(slideButtonsContainer);
            }
            slideButtonsContainer.innerHTML = '';
            slideButtonsContainer.style.display = 'flex';
            slideButtonsContainer.style.setProperty('--slide_count', pageCount);

            for (let i = 1; i <= pageCount; i++) {
                const label = document.createElement('label');
                label.style.flex = '1';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'value-radio';
                input.value = `value-${i}`;
                input.id = `value-${i}`;
                input.checked = (i === currentPage);

                const span = document.createElement('span');
                span.textContent = `${i}`;

                label.appendChild(input);
                label.appendChild(span);
                slideButtonsContainer.appendChild(label);
            }

            let selection = slideButtonsContainer.querySelector('.selection');
            if (!selection) {
                selection = document.createElement('span');
                selection.className = 'selection';
                slideButtonsContainer.appendChild(selection);
            }

            const firstLabelWidth = slideButtonsContainer.querySelector('label').offsetWidth;
            selection.style.width = `${firstLabelWidth}px`;
            selection.style.transform = `translateX(${firstLabelWidth * (currentPage - 1)}px)`;

            const radios = slideButtonsContainer.querySelectorAll('input[name="value-radio"]');
            radios.forEach((radio, idx) => {
                radio.addEventListener('change', () => {
                    if (!radio.checked) return;

                    // Обновляем страницу и URL
                    const newPage = idx + 1;
                    // Перезагружаем страницу с новым параметром page
                    // Чтобы подгрузить только нужную страницу заново, делаем переход с обновлением URL
                    const url = new URL(window.location);
                    url.searchParams.set('page', newPage);
                    url.searchParams.delete('item'); // сбрасываем выбор карточки при смене страницы
                    window.location.href = url.toString();
                });
            });
        } else {
            if (slideButtonsContainer) {
                slideButtonsContainer.remove();
            }
        }

        // Если есть выбранный item — отметить и прокрутить к нему
        if (selectedItemId) {
            const selectedInput = container.querySelector(`input#backed_card_${selectedItemId}`);
            if (selectedInput) {
                selectedInput.checked = true;
                // Прокрутить карточку в центр экрана плавно
                selectedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Обработчик выбора карточки — обновляет URL с параметром item, но не перезагружает страницу
        const cardsInputs = container.querySelectorAll('input[name="menu_card"]');
        cardsInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (!input.checked) return;
                const selectedId = input.value;

                const newUrl = new URL(window.location);
                newUrl.searchParams.set('item', selectedId);
                newUrl.searchParams.set('page', currentPage);
                history.pushState(null, '', newUrl);
            });
        });

    } catch (err) {
        console.error('Ошибка при загрузке bakery:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadBakeryMenu);
