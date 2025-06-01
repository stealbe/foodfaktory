// Функция для получения корзины
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || {};
    } catch (error) {
        console.error('Ошибка при получении корзины:', error);
        return {};
    }
}

// Функция для изменения количества товара
function updateCartItemQuantity(itemId, itemType, newQuantity) {
    try {
        let cart = getCart();
        const itemKey = `${itemType}_${itemId}`;

        if (newQuantity <= 0) {
            delete cart[itemKey];
        } else {
            if (cart[itemKey]) {
                cart[itemKey].quantity = newQuantity;
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        return false;
    }
}

// Функция для удаления товара из корзины
function removeFromCart(itemId, itemType) {
    try {
        let cart = getCart();
        const itemKey = `${itemType}_${itemId}`;
        delete cart[itemKey];

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        return true;
    } catch (error) {
        console.error('Ошибка при удалении из корзины:', error);
        return false;
    }
}

// Функция для очистки корзины
function clearCart() {
    localStorage.removeItem('cart');
    updateCartUI();
}

// Кеш для данных
let menuCache = null;
let setsCache = null;
let bakeryCache = null;

// Функция для загрузки данных с сервера
async function loadMenuData() {
    if (!menuCache) {
        try {
            const response = await fetch('?action=full_menu');
            const data = await response.json();
            menuCache = data;
        } catch (error) {
            console.error('Ошибка загрузки меню:', error);
            return null;
        }
    }
    return menuCache;
}

async function loadSetsData() {
    if (!setsCache) {
        try {
            const response = await fetch('?action=get_sets');
            const data = await response.json();
            setsCache = data;
        } catch (error) {
            console.error('Ошибка загрузки сетов:', error);
            return null;
        }
    }
    return setsCache;
}

async function loadBakeryData() {
    if (!bakeryCache) {
        try {
            const response = await fetch('?action=get_bakery');
            const data = await response.json();
            bakeryCache = data;
        } catch (error) {
            console.error('Ошибка загрузки выпечки:', error);
            return null;
        }
    }
    return bakeryCache;
}

// Функция для получения данных товара
async function getItemData(itemId, itemType) {
    try {
        let itemData = null;

        if (itemType === 'dish') {
            const menuData = await loadMenuData();
            if (menuData && menuData.dishes) {
                const dish = menuData.dishes.find(d => d.id == itemId);
                if (dish) {
                    itemData = {
                        name: dish.name,
                        price: parseFloat(dish.price) || 0,
                        image: dish.image1 || '/default-dish.jpg',
                        link: `/dish.html?id=${itemId}`
                    };
                }
            }
        } else if (itemType === 'set') {
            const setsData = await loadSetsData();
            if (setsData && setsData.sets) {
                const set = setsData.sets.find(s => s.id == itemId);
                if (set) {
                    itemData = {
                        name: set.name,
                        price: parseFloat(set.price) || 0,
                        image: set.image1 || '/default-set.jpg',
                        link: `/set.html?id=${itemId}`
                    };
                }
            }
        } else if (itemType === 'bakery') {
            const bakeryData = await loadBakeryData();
            if (bakeryData && bakeryData.bakery) {
                const bakeryItem = bakeryData.bakery.find(b => b.id == itemId);
                if (bakeryItem) {
                    itemData = {
                        name: bakeryItem.name,
                        price: parseFloat(bakeryItem.price) || 0,
                        image: bakeryItem.image1 || '/default-bakery.jpg',
                        link: `/bakery.html?id=${itemId}`
                    };
                }
            }
        }

        return itemData;
    } catch (error) {
        console.error('Ошибка получения данных товара:', error);
        return null;
    }
}

// Функция для обновления интерфейса корзины
async function updateCartUI() {
    const cart = getCart();
    const cartContainer = document.querySelector('.cart_positions');
    const totalAmountElement = document.querySelector('.total_amount');

    if (!cartContainer) return;

    // Очищаем контейнер
    cartContainer.innerHTML = '';

    let totalAmount = 0;
    const cartItems = Object.entries(cart);

    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста</p>';
        if (totalAmountElement) {
            totalAmountElement.textContent = '0.00 zł';
        }
        return;
    }

    // Генерируем HTML для каждого товара в корзине
    for (const [itemKey, cartItem] of cartItems) {
        const itemData = await getItemData(cartItem.id, cartItem.type);

        if (!itemData) continue;

        const itemTotal = itemData.price * cartItem.quantity;
        totalAmount += itemTotal;

        const cartItemHTML = `
            <div class="cart_item" data-item-key="${itemKey}">
                <img src="${itemData.image}" alt="${itemData.name}">
                <div>
                    <div class="item_info">
                        <a class="item_name" href="${itemData.link}">${itemData.name}</a>
                        <p class="item_price">${itemData.price.toFixed(2)} zł</p>
                    </div>
                    <div class="item_contorls">
                        <div class="item_count">
                            <button class="decrease_quantity" data-item-id="${cartItem.id}" data-item-type="${cartItem.type}">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(90)">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <g id="Interface / Line_Xl">
                                            <path id="Vector" d="M12 21V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke: var(--darkreader-text-000000, #f2f0ed);"></path>
                                        </g>
                                    </g>
                                </svg>
                            </button>
                            <span class="quantity">${cartItem.quantity}</span>
                            <button class="increase_quantity" data-item-id="${cartItem.id}" data-item-type="${cartItem.type}">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path d="M4 12H20M12 4V20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-darkreader-inline-stroke="" style="--darkreader-inline-stroke: var(--darkreader-text-000000, #f2f0ed);"></path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                        <button class="delete_item" data-item-id="${cartItem.id}" data-item-type="${cartItem.type}">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <g id="Interface / Trash_Full">
                                        <path id="Vector" d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    }

    // Обновляем общую сумму
    if (totalAmountElement) {
        totalAmountElement.textContent = `${totalAmount.toFixed(2)} zł`;
    }
}

// Обработчики событий для управления корзиной
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {

        // Обработчик для увеличения количества
        if (e.target.closest('.increase_quantity')) {
            const button = e.target.closest('.increase_quantity');
            const itemId = button.getAttribute('data-item-id');
            const itemType = button.getAttribute('data-item-type');
            const quantitySpan = button.parentElement.querySelector('.quantity');
            const currentQuantity = parseInt(quantitySpan.textContent);

            updateCartItemQuantity(itemId, itemType, currentQuantity + 1);
        }

        // Обработчик для уменьшения количества
        if (e.target.closest('.decrease_quantity')) {
            const button = e.target.closest('.decrease_quantity');
            const itemId = button.getAttribute('data-item-id');
            const itemType = button.getAttribute('data-item-type');
            const quantitySpan = button.parentElement.querySelector('.quantity');
            const currentQuantity = parseInt(quantitySpan.textContent);

            if (currentQuantity > 1) {
                updateCartItemQuantity(itemId, itemType, currentQuantity - 1);
            } else {
                removeFromCart(itemId, itemType);
            }
        }

        // Обработчик для удаления товара
        if (e.target.closest('.delete_item')) {
            const button = e.target.closest('.delete_item');
            const itemId = button.getAttribute('data-item-id');
            const itemType = button.getAttribute('data-item-type');

            removeFromCart(itemId, itemType);
        }
    });

    // Инициализация корзины при загрузке страницы
    if (document.querySelector('.cart')) {
        updateCartUI();
    }
});