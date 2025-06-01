class OrderHandler {
    constructor() {
        this.cart = this.loadCartFromCache();
        this.menuData = null;
        this.initializeOrder();
    }

    async initializeOrder() {
        try {
            await this.loadMenuData();
            this.initializeForm();
        } catch (error) {
            console.error('Error of initialization order:', error);
            this.showErrorMessage('Nie udało się załadować danych menu. Odśwież stronę.');
        }
    }

    loadCartFromCache() {
        try {
            const cartData = localStorage.getItem('cart');
            return cartData ? JSON.parse(cartData) : {};
        } catch (error) {
            console.error('Error cart load:', error);
            return {};
        }
    }

    async loadMenuData() {
        try {
            const [dishesResponse, setsResponse, bakeryResponse] = await Promise.all([
                fetch('../php/resurces.php?action=full_menu'),
                fetch('../php/resurces.php?action=get_sets'),
                fetch('../php/resurces.php?action=get_bakery')
            ]);

            if (!dishesResponse.ok || !setsResponse.ok || !bakeryResponse.ok) {
                throw new Error('Error load menu data');
            }

            const [dishesData, setsData, bakeryData] = await Promise.all([
                dishesResponse.json(),
                setsResponse.json(),
                bakeryResponse.json()
            ]);

            this.menuData = {
                dishes: {},
                sets: {},
                bakery: {}
            };

            // Сохраняем только имя и цену
            if (dishesData.dishes) {
                dishesData.dishes.forEach(dish => {
                    this.menuData.dishes[dish.id] = {
                        name: dish.name,
                        price: parseFloat(dish.price || 0)
                    };
                });
            }

            if (setsData.sets) {
                setsData.sets.forEach(set => {
                    this.menuData.sets[set.id] = {
                        name: set.name,
                        price: parseFloat(set.price || 0)
                    };
                });
            }

            if (bakeryData.bakery) {
                bakeryData.bakery.forEach(bakery => {
                    this.menuData.bakery[bakery.id] = {
                        name: bakery.name,
                        price: parseFloat(bakery.price || 0)
                    };
                });
            }

        } catch (error) {
            console.error('Error load menu data:', error);
            throw error;
        }
    }

    getItemData(type, id) {
        if (!this.menuData) return null;
        const numericId = parseInt(id);

        switch (type) {
            case 'dish':
                return this.menuData.dishes[numericId] || null;
            case 'set':
                return this.menuData.sets[numericId] || null;
            case 'bakery':
                return this.menuData.bakery[numericId] || null;
            default:
                return null;
        }
    }

    initializeForm() {
        const form = document.getElementById('order_form');
        if (!form) return;

        const deliveryTimeInput = document.getElementById('delivery_time');
        const timeRadios = document.querySelectorAll('input[name="time"]');

        // Управление полем времени доставки
        timeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'specific') {
                    deliveryTimeInput.required = true;
                    deliveryTimeInput.disabled = false;

                    const now = new Date();
                    now.setHours(now.getHours() + 1);
                    deliveryTimeInput.min = now.toTimeString().slice(0, 5);
                } else {
                    deliveryTimeInput.required = false;
                    deliveryTimeInput.disabled = true;
                    deliveryTimeInput.value = '';
                }
            });
        });

        // Обработка отправки формы
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    }

    validateForm() {
        const name = document.getElementById('name')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const address = document.getElementById('address')?.value.trim();

        if (!name || name.length < 2) {
            this.showErrorMessage('Wprowadź prawidłowe imię i nazwisko (min. 2 znaki)');
            document.getElementById('name')?.focus();
            return false;
        }

        // Универсальная проверка телефона (не только польские номера)
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
        if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
            this.showErrorMessage('Wprowadź prawidłowy numer telefonu');
            document.getElementById('phone')?.focus();
            return false;
        }

        if (!address || address.length < 5) {
            this.showErrorMessage('Wprowadź prawidłowy adres dostawy (min. 5 znaków)');
            document.getElementById('address')?.focus();
            return false;
        }

        if (Object.keys(this.cart).length === 0) {
            this.showErrorMessage('Koszyk jest pusty');
            return false;
        }

        // Проверка времени доставки
        const timeOption = document.querySelector('input[name="time"]:checked');
        if (timeOption?.value === 'specific') {
            const deliveryTime = document.getElementById('delivery_time')?.value;
            if (!deliveryTime) {
                this.showErrorMessage('Wybierz czas dostawy');
                document.getElementById('delivery_time')?.focus();
                return false;
            }
        }

        return true;
    }

    collectFormData() {
        const form = document.getElementById('order_form');
        const formData = new FormData(form);
        const selectedTimeOption = document.querySelector('input[name="time"]:checked');

        const deliveryTime = selectedTimeOption?.value === 'specific'
            ? formData.get('delivery_time')
            : 'Jak najszybciej';

        // Создаем список товаров с именами и ценами
        const items = [];
        let totalAmount = 0;

        Object.values(this.cart).forEach(item => {
            const itemData = this.getItemData(item.type, item.id);
            if (itemData) {
                const itemTotal = itemData.price * item.quantity;
                items.push({
                    name: itemData.name,
                    price: itemData.price,
                    quantity: item.quantity,
                    total: itemTotal
                });
                totalAmount += itemTotal;
            }
        });

        const now = new Date();

        return {
            order_id: this.generateOrderId(),
            customer_name: formData.get('name').trim(),
            customer_phone: formData.get('phone').trim(),
            delivery_address: formData.get('address').trim(),
            delivery_details: formData.get('order_details')?.trim() || '',
            delivery_time: deliveryTime,
            special_requests: formData.get('special_requests')?.trim() || '',
            payment_method: formData.get('payment_method') || 'cash',
            total_amount: parseFloat(totalAmount.toFixed(2)),
            order_date: now.toISOString(),
            order_time: now.toLocaleString('pl-PL'),
            submission_time: now.toISOString(), // Время отправки для БД
            submission_time_readable: now.toLocaleString('pl-PL'), // Время отправки читаемое
            items: items,
            status: 'pending'
        };
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD${timestamp}${random}`;
    }

    createSMSMessage(orderData) {
        const { customer_name, customer_phone, delivery_address, delivery_details,
            delivery_time, items, total_amount, order_id, submission_time_readable, special_requests } = orderData;

        let message = `🍕 NOWE ZAMÓWIENIE #${order_id}\n`;
        message += `📅 Złożone: ${submission_time_readable}\n\n`;
        message += `👤 ${customer_name}\n`;
        message += `📞 ${customer_phone}\n`;
        message += `📍 ${delivery_address}\n`;

        if (delivery_details) {
            message += `📝 ${delivery_details}\n`;
        }

        const timeText = delivery_time === 'Jak najszybciej' ? 'Jak najszybciej' : `O godzinie ${delivery_time}`;
        message += `⏰ Dostawa: ${timeText}\n`;
        message += `💰 Gotówka\n\n`;

        message += `🛒 ZAMÓWIENIE:\n`;
        items.forEach(item => {
            message += `• ${item.name} x${item.quantity} - ${item.total.toFixed(2)}zł\n`;
        });

        message += `\n💸 RAZEM: ${total_amount.toFixed(2)}zł`;

        if (special_requests) {
            message += `\n📋 Uwagi: ${special_requests}`;
        }

        return message;
    }

    async handleFormSubmit() {
        if (!this.validateForm()) return;

        const submitButton = document.querySelector('.order_submit');
        if (!submitButton) return;

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Przetwarzanie...';

        try {
            const orderData = this.collectFormData();

            await this.sendOrderToServer(orderData);

            this.showSuccessMessage(orderData.order_id);
            this.clearCart();

        } catch (error) {
            console.error('Error order send:', error);
            this.showErrorMessage('Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    async sendOrderToServer(orderData) {
        const response = await fetch('../php/send_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('Błąd podczas wysyłania zamówienia do serwera');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Błąd serwera');
        }
    }

    showSuccessMessage(orderId) {
        const form = document.getElementById('order_form');
        const successMessage = document.createElement('div');
        successMessage.className = 'success_message';
        successMessage.innerHTML = `
            <strong>✅ Zamówienie zostało złożone pomyślnie!</strong><br>
            <strong>Numer zamówienia: #${orderId}</strong><br>
            Skontaktujemy się z Tobą wkrótce w celu potwierdzenia.<br>
            <small>Dziękujemy za wybór naszej restauracji!</small>
        `;
        form.parentNode.insertBefore(successMessage, form);
        form.style.display = 'none';
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }

    showErrorMessage(message) {
        const existingErrors = document.querySelectorAll('.error_message');
        existingErrors.forEach(error => error.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error_message';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #f5c6cb;
            margin-bottom: 20px;
            font-weight: bold;
        `;
        errorDiv.textContent = '❌ ' + message;

        const form = document.getElementById('order_form');
        form.parentNode.insertBefore(errorDiv, form);
        errorDiv.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    clearCart() {
        try {
            localStorage.removeItem('cart');
            this.cart = {};
        } catch (error) {
            console.error('Error remove items:', error);
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('order_form')) {
        window.orderHandler = new OrderHandler();
    }
});

// Тестовая функция
function addTestCart() {
    const testCart = {
        "dish_3": { "id": "3", "type": "dish", "quantity": 1 },
        "set_1": { "id": "1", "type": "set", "quantity": 1 },
        "bakery_3": { "id": "3", "type": "bakery", "quantity": 2 }
    };
    localStorage.setItem('cart', JSON.stringify(testCart));
}