function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || {};
    } catch (error) {
        return {};
    }
}

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
        return false;
    }
}

function removeFromCart(itemId, itemType) {
    try {
        let cart = getCart();
        const itemKey = `${itemType}_${itemId}`;
        delete cart[itemKey];

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        return true;
    } catch (error) {
        return false;
    }
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartUI();
}

let menuCache = null;
let setsCache = null;
let bakeryCache = null;

async function loadMenuData() {
    if (!menuCache) {
        try {
            const response = await fetch('../php/resurces.php?action=full_menu');
            menuCache = response.ok ? await response.json() : { dishes: [] };
        } catch (error) {
            menuCache = { dishes: [] };
        }
    }
    return menuCache;
}

async function loadSetsData() {
    if (!setsCache) {
        try {
            const response = await fetch('../php/resurces.php?action=get_sets');
            setsCache = response.ok ? await response.json() : { sets: [] };
        } catch (error) {
            setsCache = { sets: [] };
        }
    }
    return setsCache;
}

async function loadBakeryData() {
    if (!bakeryCache) {
        try {
            const response = await fetch('../php/resurces.php?action=get_bakery');
            bakeryCache = response.ok ? await response.json() : { bakery: [] };
        } catch (error) {
            bakeryCache = { bakery: [] };
        }
    }
    return bakeryCache;
}

async function getItemData(itemId, itemType) {
    try {
        let item = null;

        if (itemType === 'dish') {
            const data = await loadMenuData();
            item = data.dishes?.find(d => d.id == itemId);
        } else if (itemType === 'set') {
            const data = await loadSetsData();
            item = data.sets?.find(s => s.id == itemId);
        } else if (itemType === 'bakery') {
            const data = await loadBakeryData();
            item = data.bakery?.find(b => b.id == itemId);
        }

        if (!item) return null;

        return {
            name: item.name || 'Неизвестный товар',
            price: parseFloat(item.price) || 0,
            image: item.image1 || '',
            link: `/${itemType}.html?id=${itemId}`
        };
    } catch (error) {
        return null;
    }
}

async function updateCartUI() {
    const cart = getCart();
    const cartContainer = document.querySelector('.cart_positions');
    const totalAmountElement = document.querySelector('.total_amount');

    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    const cartItems = Object.entries(cart);
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Koszyk jest pusty</p><p>Ale nigdy nie jest za późno, żeby to naprawić :)</p>';
        if (totalAmountElement) totalAmountElement.textContent = '0.00 zł';
        return;
    }

    let totalAmount = 0;

    for (const [itemKey, cartItem] of cartItems) {
        const itemData = await getItemData(cartItem.id, cartItem.type);
        if (!itemData) continue;

        const itemTotal = itemData.price * cartItem.quantity;
        totalAmount += itemTotal;

        const imageSrc = itemData.image ?
            (itemData.image.startsWith('http') || itemData.image.startsWith('/') ?
                itemData.image : `/src/assets/pages/${itemData.image}`) :
            '/src/assets/images/not_avalible.webp';

        cartContainer.insertAdjacentHTML('beforeend', `
            <div class="cart_item" data-item-key="${itemKey}">
                <img src="${imageSrc}" alt="${itemData.name}" onerror="this.style.display='none'">
                <div>
                    <div class="item_info">
                        <a class="item_name" href="${itemData.link}">${itemData.name}</a>
                        <p class="item_price">${itemData.price.toFixed(2)} zł</p>
                    </div>
                    <div class="item_contorls">
                        <div class="item_count">
                            <button class="decrease_quantity" data-item-id="${cartItem.id}" data-item-type="${cartItem.type}">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(90)">
                                    <g><path d="M12 21V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g>
                                </svg>
                            </button>
                            <span class="quantity">${cartItem.quantity}</span>
                            <button class="increase_quantity" data-item-id="${cartItem.id}" data-item-type="${cartItem.type}">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12H20M12 4V20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                        <button class="delete_item" data-item-id="${cartItem.id}" data-item-type="${cartItem.type}">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `);
    }

    if (totalAmountElement) {
        totalAmountElement.textContent = `${totalAmount.toFixed(2)} zł`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        if (e.target.closest('.increase_quantity')) {
            const button = e.target.closest('.increase_quantity');
            const itemId = button.getAttribute('data-item-id');
            const itemType = button.getAttribute('data-item-type');
            const currentQuantity = parseInt(button.parentElement.querySelector('.quantity').textContent);
            updateCartItemQuantity(itemId, itemType, currentQuantity + 1);
        }

        if (e.target.closest('.decrease_quantity')) {
            const button = e.target.closest('.decrease_quantity');
            const itemId = button.getAttribute('data-item-id');
            const itemType = button.getAttribute('data-item-type');
            const currentQuantity = parseInt(button.parentElement.querySelector('.quantity').textContent);

            if (currentQuantity > 1) {
                updateCartItemQuantity(itemId, itemType, currentQuantity - 1);
            } else {
                removeFromCart(itemId, itemType);
            }
        }

        if (e.target.closest('.delete_item')) {
            const button = e.target.closest('.delete_item');
            const itemId = button.getAttribute('data-item-id');
            const itemType = button.getAttribute('data-item-type');
            removeFromCart(itemId, itemType);
        }
    });

    if (document.querySelector('.cart')) {
        updateCartUI();
    }
});