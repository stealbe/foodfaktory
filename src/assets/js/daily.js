let cachedDaily = null;
let dailyCacheTime = 15 * 60 * 1000; // 15 минут
let dailyCacheTimestamp = null;

async function loadDaily() {
    try {
        const topContainer = document.querySelector('.menu_top');
        const bottomContainer = document.querySelector('.menu_bottom');
        if (!topContainer || !bottomContainer) return;

        const now = Date.now();
        if (!cachedDaily || !dailyCacheTimestamp || (now - dailyCacheTimestamp > dailyCacheTime)) {
            const response = await fetch('./src/assets/php/resurces.php?action=get_daily');
            const data = await response.json();
            cachedDaily = data.daily || [];
            dailyCacheTimestamp = now;
        }

        for (const item of cachedDaily) {
            const isDish = !!item.dish_id;
            const isSet = !!item.set_id;
            const name = item.name || '';
            const description = item.description || '';
            const price = item.price || '';
            // Преобразуем путь изображения
            let image = item.image1 || '';
            if (image.startsWith('../images/')) {
                image = image.replace('../images/', './src/assets/images/');
            }
            const altText = `${name} zdjęcie`;

            // Ссылки теперь ./src/assets/pages/...
            const href = isDish
                ? `./src/assets/pages/menu.html?card=card_${item.id}`
                : `./src/assets/pages/sets.html?card=${item.id}`;

            const cardHTML = `
                <a class="card reveal" href="${href}">
                    <img src="${image}" alt="${altText}">
                    <div class="card_text">
                        <h3>${name}</h3>
                        <p class="descrip">${description}</p>
                        <p class="price">${price} zł</p>
                        <p class="bnt_View_more">View</p>
                    </div>
                </a>
            `;

            if (isDish) {
                topContainer.insertAdjacentHTML('beforeend', cardHTML);
            } else if (isSet) {
                bottomContainer.insertAdjacentHTML('beforeend', cardHTML);
            }
        }
    } catch (err) {
        console.error('Ошибка при загрузке daily:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadDaily);
