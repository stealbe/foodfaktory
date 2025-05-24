document.addEventListener("DOMContentLoaded", () => {
    fetch('../../../../assets/php/resurces.php') // php source
        .then(response => response.json())
        .then(data => {
            const section = document.querySelector("section.menu");
            if (!section) return;

            // Pages + cards
            const pages = data.menu_pages;
            const dishes = data.dishes.filter(d => d.filling_type === "menu");

            pages.forEach(page => {
                const pageDiv = document.createElement("div");
                pageDiv.className = `page_${page.id}`;
                pageDiv.dataset.title = page.name;

                const pageDishes = dishes.filter(d => d.menu_page_id == page.id);
                pageDishes.forEach(dish => {
                    const card = document.createElement("div");
                    card.className = "card reveal";
                    card.innerHTML = `
                        <input type="radio" id="card_${dish.id}" name="menu_card" value="${dish.id}" />
                        <label for="card_${dish.id}" class="card_btn">
                            <a class="back_btn" href="./menu.html">← Back</a>
                            <div><img id="card_main_img_${dish.id}" src="${dish.image || '../images/not_avalible.png'}" alt=""></div>
                            <div class="card_text">
                                <h3>${dish.name}</h3>
                                <p class="price">${dish.price} zł</p>
                                <p>${dish.ingredients.join(", ")}</p>
                            </div>
                            <p class="bnt_View_more">View more</p>
                            <div class="full_text">
                                <h3>${dish.name}</h3>
                                <p>${dish.description || "Brak opisu."}</p>
                                <h4>Ingredients</h4>
                                <ul>${dish.ingredients.map(ing => `<li>${ing}</li>`).join("")}</ul>
                            </div>
                        </label>
                    `;
                    pageDiv.appendChild(card);
                });

                section.appendChild(pageDiv);
            });
        })
        .catch(err => {
            console.error("Ошибка загрузки данных:", err);
        });
});
