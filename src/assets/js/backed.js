let cachedBakeryData = null;
const itemsPerPage = 50;

async function loadBakeryMenu() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let currentPage = parseInt(urlParams.get('page')) || 1;
        let selectedItemId = urlParams.get('item');

        const cached = sessionStorage.getItem('bakeryData');
        if (cached) {
            cachedBakeryData = JSON.parse(cached);
        } else {
            const response = await fetch('../php/resurces.php?action=get_bakery');
            const data = await response.json();
            cachedBakeryData = data.bakery || [];
            sessionStorage.setItem('bakeryData', JSON.stringify(cachedBakeryData));
        }

        const bakeryItems = cachedBakeryData;

        const container = document.querySelector('section.menu');
        const lowbar = document.querySelector('section.lowbar');
        if (!container || !lowbar) return;

        container.innerHTML = '';

        const pageCount = Math.max(1, Math.ceil(bakeryItems.length / itemsPerPage));

        if (selectedItemId) {
            const selectedIndex = bakeryItems.findIndex(item => String(item.id) === selectedItemId);
            if (selectedIndex !== -1) {
                currentPage = Math.floor(selectedIndex / itemsPerPage) + 1;
            }
        }

        for (let page = 1; page <= pageCount; page++) {
            const pageDiv = document.createElement('div');
            pageDiv.className = `page page_${page}`;
            pageDiv.dataset.title = `Page ${page}`;
            pageDiv.style.display = (page === currentPage) ? 'flex' : 'none';
            container.appendChild(pageDiv);

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, bakeryItems.length);

            for (let i = startIndex; i < endIndex; i++) {
                const item = bakeryItems[i];
                const html = `
                  <div class="card reveal">
                    <input type="radio" id="backed_card_${item.id}" name="menu_card" value="${item.id}" />
                    <label for="backed_card_${item.id}" class="card_btn">
                      <a class="back_btn" href="./backed.html?page=${page}">← Back</a>
                      <div>
                        <img id="card_main_img" src="${item.image1 || ''}" alt="${item.name} zdjęcie" />
                        ${item.image2 ? `<button class="card_img_select" id="card_img_1"><img src="${item.image2}" alt="${item.name} zdjęcie"></button>` : ''}
                        ${item.image3 ? `<button class="card_img_select" id="card_img_2"><img src="${item.image3}" alt="${item.name} zdjęcie"></button>` : ''}
                        ${item.image4 ? `<button class="card_img_select" id="card_img_3"><img src="${item.image4}" alt="${item.name} zdjęcie"></button>` : ''}
                      </div>
                      <div class="card_text">
                        <h3>${item.name}</h3>
                        <p class="gramm">${item.weight ? `${item.weight}g` : ''}</p>
                        <p class="price">${item.price ? `${item.price} zł` : ''}</p>
                        <p class="ingredients">${item.ingredients ? item.ingredients.split(',').map(i => i.trim()).join(', ') : ''}</p>
                      </div>
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
                      <button class="bnt_addTo_cart">Add to cart</button>
                    </label>
                  </div>
                `;
                pageDiv.insertAdjacentHTML('beforeend', html);
            }
        }

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
                    const newPage = idx + 1;
                    for (let page = 1; page <= pageCount; page++) {
                        const pageDiv = container.querySelector(`.page_${page}`);
                        if (pageDiv) {
                            pageDiv.style.display = (page === newPage) ? 'flex' : 'none';
                        }
                    }
                    const url = new URL(window.location);
                    url.searchParams.set('page', newPage);
                    url.searchParams.delete('item');
                    history.pushState(null, '', url.toString());
                });
            });
        } else if (slideButtonsContainer) {
            slideButtonsContainer.remove();
        }

        if (selectedItemId) {
            const selectedInput = container.querySelector(`input#backed_card_${selectedItemId}`);
            if (selectedInput) {
                selectedInput.checked = true;
                selectedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

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
