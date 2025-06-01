// Функция для добавления товара в корзину
function addToCart(itemId, itemType = 'dish') {
    try {
        // Получаем текущую корзину из localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || {};

        // Создаем ключ для товара (тип_id)
        const itemKey = `${itemType}_${itemId}`;

        // Если товар уже есть в корзине, увеличиваем количество, иначе добавляем с количеством 1
        if (cart[itemKey]) {
            cart[itemKey].quantity += 1;
        } else {
            cart[itemKey] = {
                id: itemId,
                type: itemType,
                quantity: 1
            };
        }

        // Сохраняем обновленную корзину в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        return true;
    } catch (error) {
        console.error('Błąd podczas dodawania do koszyka:', error);
        return false;
    }
}

// Обработчик событий для кнопок "Add to cart"
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('bnt_addTo_cart')) {
            e.preventDefault();
            e.stopPropagation();

            // Находим родительский элемент с ID
            const card = e.target.closest('.card');
            const input = card.querySelector('input[type="radio"]');

            if (input) {
                const inputId = input.id;
                let itemId, itemType;

                // Определяем тип товара и ID по ID input'а
                if (inputId.startsWith('card_')) {
                    itemId = inputId.replace('card_', '');
                    itemType = 'dish';
                } else if (inputId.startsWith('set_card_')) {
                    itemId = inputId.replace('set_card_', '');
                    itemType = 'set';
                } else if (inputId.startsWith('backed_card_')) {
                    itemId = inputId.replace('backed_card_', '');
                    itemType = 'bakery';
                }

                if (itemId && itemType) {
                    addToCart(itemId, itemType);
                }
            }
        }
    });
});