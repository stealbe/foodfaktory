// document.addEventListener("DOMContentLoaded", function () {
//     const burgerCheckbox = document.getElementById("burger_checkbox");
//     const main = document.querySelector("main");

//     burgerCheckbox.addEventListener("change", function () {
//         main.style.display = this.checked ? "none" : "";
//     });
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const burgerCheckbox = document.getElementById("burger_checkbox");
//     const footer = document.querySelector("footer");
//     const body = document.querySelector("body");
//     if (!footer || !body) return;

//     burgerCheckbox.addEventListener("change", function () {
//         if (this.checked) {
//             footer.style.display = "none";
//             body.style.justifyContent = "inherit";
//         } else {
//             footer.style.display = "";
//             body.style.justifyContent = "";
//         }
//     });
// });

{ };

// Header resize with scroll ---------------------------
document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector("header");
    let lastScrollY = window.scrollY;

    function isHeaderFixed() {
        return window.getComputedStyle(header).position === "fixed";
    }

    function handleScroll() {
        if (isHeaderFixed()) {
            if (window.scrollY > lastScrollY) {
                header.classList.add("header-small");
            } else if (window.scrollY <= 10) {
                header.classList.remove("header-small");
            }
        }
        lastScrollY = window.scrollY;
    }

    function handleMouseEnter() {
        if (isHeaderFixed()) {
            header.classList.remove("header-small");
        }
    }

    function handleMouseLeave() {
        if (isHeaderFixed() && window.scrollY > 10) {
            header.classList.add("header-small");
        }
    }

    window.addEventListener("scroll", handleScroll);
    header.addEventListener("mouseenter", handleMouseEnter);
    header.addEventListener("mouseleave", handleMouseLeave);
});
//------------------------------------------------------------
// !!!! Cards and Pages logics !!!!
// document.addEventListener("DOMContentLoaded", () => {
//     const pages = document.querySelectorAll("[class^='page_']"); // Collection of all page sections.
//     const cards = document.querySelectorAll(".card"); // Collection of individual content cards.
//     const inputs = document.querySelectorAll(".card input[type='radio']"); // Radio buttons inside cards for selection.
//     const slideButtonsContainer = document.querySelector(".slide_buttons"); // Container for navigation buttons between pages.
//     const backButtons = document.querySelectorAll(".back_btn"); // Buttons to return from a detailed card view.
//     const viewButtons = document.querySelectorAll(".bnt_View_more"); // Buttons to view more details of a card.
//     const imgSelectButtons = document.querySelectorAll(".card_img_select"); // Buttons to select different images for a card.
//     const firstButton = slideButtonsContainer?.querySelector("label"); // Template for creating page navigation buttons.
//     const styleTag = document.createElement("style"); // For injecting dynamic CSS.
//     const navLists = document.querySelectorAll(".left_nav ul"); // Lists within the left navigation menu.
//     const leftNav = document.querySelector(".left_nav"); // The left navigation container.
//     const leftNavBurgerLabel = document.querySelector('label[for="left_nav_burger"]'); // Label to toggle the left navigation (for mobile).
//     let lastPageIndex = 0; // Stores the index of the last viewed page.

//     // Manages the visibility of page navigation buttons based on the number of pages.
//     // Dynamically creates these buttons, linking them to specific pages and updating the left navigation.
//     if (!firstButton || pages.length <= 1) {
//         if (slideButtonsContainer) slideButtonsContainer.style.display = "none";
//     } else {
//         slideButtonsContainer.innerHTML = "";
//         pages.forEach((page, index) => {
//             const newButton = firstButton.cloneNode(true);
//             const input = newButton.querySelector("input");
//             const span = newButton.querySelector("span");
//             if (input) {
//                 input.value = `value-${index + 1}`;
//                 input.id = `value-${index + 1}`;
//                 input.checked = index === 0;
//                 input.addEventListener("change", () => {
//                     showPage(index + 1); // Shows the selected page.
//                     showNavList(index); // Shows the corresponding left navigation list.
//                     lastPageIndex = index; // Updates the last viewed page index.
//                 });
//             }
//             if (span) span.textContent = page.dataset.title;
//             newButton.style.flex = "1";
//             slideButtonsContainer.appendChild(newButton);
//         });
//         // Creates a visual selection indicator for the active page button using dynamic CSS.
//         const selection = document.createElement("span");
//         selection.className = "selection";
//         slideButtonsContainer.appendChild(selection);
//         const selectionWidth = selection.offsetWidth;
//         let dynamicCSS = `.selection { width: ${selectionWidth}px; display: inline-block; }\n`;
//         pages.forEach((page, index) => {
//             const offsetPixels = index * selectionWidth;
//             dynamicCSS += `.slide_buttons label:nth-child(${index + 1
//                 }):has(input:checked)~.selection { transform: translateX(calc(${offsetPixels}px)); }\n`;
//         });
//         styleTag.textContent = dynamicCSS;
//         document.head.appendChild(styleTag);
//     }

//     /**
//      * Shows a specific page by hiding all other pages.
//      * @param {number} value - The number of the page to display (corresponding to its class `page_${value}`).
//      */
//     function showPage(value) {
//         pages.forEach((page) => (page.style.display = "none"));
//         const activePage = document.querySelector(`.page_${value}`);
//         if (activePage) activePage.style.display = "flex";
//     }

//     /**
//      * Shows a specific navigation list in the left menu based on its index.
//      * Hides the entire left navigation if the target list is empty.
//      * @param {number} index - The index of the navigation list to display.
//      */
//     function showNavList(index) {
//         navLists.forEach((list) => (list.style.display = "none"));
//         if (navLists[index]) {
//             if (navLists[index].querySelectorAll("li").length === 0) {
//                 leftNav.classList.add("hide");
//                 leftNavBurgerLabel.classList.add("hide");
//             } else {
//                 leftNav.classList.remove("hide");
//                 leftNavBurgerLabel.classList.remove("hide");
//                 navLists[index].style.display = "block";
//             }
//         }
//     }

//     /**
//      * Updates the visibility of content cards and the page navigation buttons.
//      * When a card's radio button is selected, only that card is visible, and page navigation is hidden.
//      * When no card is selected, all cards are visible, and page navigation is shown (if multiple pages exist).
//      * Also updates the displayed page and left navigation based on the selected card's page.
//      */
//     function updateVisibility() {
//         let selectedCard = null;
//         let selectedPage = null;
//         inputs.forEach((input) => {
//             if (input.checked) {
//                 selectedCard = input.closest(".card");
//                 selectedPage = selectedCard?.closest("[class^='page_']");
//             }
//         });
//         if (selectedCard) {
//             cards.forEach((card) => (card.style.display = card === selectedCard ? "flex" : "none"));
//             if (slideButtonsContainer) slideButtonsContainer.style.display = "none";
//         } else {
//             cards.forEach((card) => (card.style.display = "flex"));
//             if (slideButtonsContainer && pages.length > 1) slideButtonsContainer.style.display = "flex";
//         }
//         if (selectedPage) {
//             const pageIndex = parseInt(selectedPage.className.match(/\d+/)[0]) - 1;
//             showPage(pageIndex + 1);
//             showNavList(pageIndex);
//         } else {
//             showNavList(0);
//         }
//     }

//     inputs.forEach((input) => input.addEventListener("change", updateVisibility));

//     // Handles the "back" button clicks to deselect any active card and show all cards again.
//     backButtons.forEach((button) => {
//         button.addEventListener("click", () => {
//             const activeRadio = document.querySelector(".card input[type='radio']:checked");
//             if (activeRadio) activeRadio.checked = false;
//             updateVisibility(); // Update card and navigation visibility.
//             leftNav.classList.remove("hide"); // Ensure left navigation is visible.
//             leftNavBurgerLabel.classList.remove("hide"); // Ensure left navigation toggle is visible.
//             showNavList(lastPageIndex); // Restore the navigation list of the last viewed page.
//         });
//     });

//     // Allows changing the main image of a card by clicking on smaller image selectors.
//     imgSelectButtons.forEach((button) => {
//         button.addEventListener("click", function () {
//             const activeCard = this.closest(".card");
//             const mainImage = activeCard.querySelector("#card_main_img");
//             const selectedImage = this.querySelector("img").src;
//             mainImage.src = selectedImage;
//         });
//     });

//     // Handles the "view more" button clicks to navigate to a detailed page for a specific card.
//     // Stores the ID of the selected card in local storage.
//     viewButtons.forEach((button) => {
//         button.addEventListener("click", function (event) {
//             event.preventDefault();
//             const card = this.closest(".card");
//             const cardId = card.getAttribute("data-id");
//             const href = this.getAttribute("href");
//             if (!href) return;
//             const pagePath = new URL(href, window.location.origin).pathname;
//             localStorage.setItem("selectedCardId", cardId); // Store card ID for the detailed page.
//             window.location.href = pagePath + "?card=" + cardId; // Navigate to the detailed page with card ID in the URL.
//         });
//     });

//     // On page load, checks if a specific card should be displayed based on URL parameters or local storage.
//     window.addEventListener("load", () => {
//         const urlParams = new URLSearchParams(window.location.search);
//         const selectedCardId = urlParams.get("card") || localStorage.getItem("selectedCardId");
//         if (selectedCardId) {
//             const radioButton = document.getElementById(selectedCardId);
//             if (radioButton) {
//                 radioButton.checked = true;
//                 updateVisibility(); // Show the selected card.
//             }
//             localStorage.removeItem("selectedCardId"); // Clear the stored card ID.
//         } else {
//             updateVisibility(); // Show default view if no card is specified.
//         }
//     });

//     // Handles the browser's back/forward navigation to ensure the correct visibility of cards and navigation.
//     window.addEventListener("pageshow", (event) => {
//         if (event.persisted) {
//             updateVisibility(); // Update visibility on cached page load.
//             showNavList(lastPageIndex); // Restore the navigation list of the last viewed page.
//         }
//     });

//     showPage(1); // Initially display the first page.
//     showNavList(0); // Initially display the first navigation list.
//     updateVisibility(); // Set the initial visibility of cards and navigation.
// });

// document.addEventListener("DOMContentLoaded", () => {
//     const pages = document.querySelectorAll("[class^='page_']");
//     const slideButtonsContainer = document.querySelector(".slide_buttons");
//     // const viewButtons = document.querySelectorAll(".bnt_View_more");
//     // const imgSelectButtons = document.querySelectorAll(".card_img_select"); // Кнопки выбора изображений
//     const firstButton = slideButtonsContainer?.querySelector("label");
//     const styleTag = document.createElement("style");

//     if (!firstButton || pages.length <= 1) {
//         if (slideButtonsContainer) slideButtonsContainer.style.display = "none";
//     } else {
//         slideButtonsContainer.innerHTML = "";
//         pages.forEach((page, index) => {
//             const newButton = firstButton.cloneNode(true);
//             const input = newButton.querySelector("input");
//             const span = newButton.querySelector("span");
//             if (input) {
//                 input.value = `value-${index + 1}`;
//                 input.id = `value-${index + 1}`;
//                 input.checked = index === 0;
//                 input.addEventListener("change", () => {
//                     console.log(`Переключено на страницу ${index + 1}`);
//                 });
//             }
//             if (span) span.textContent = page.dataset.title;
//             newButton.style.flex = "1";
//             slideButtonsContainer.appendChild(newButton);
//         });
//         const selection = document.createElement("span");
//         selection.className = "selection";
//         slideButtonsContainer.appendChild(selection);
//         const selectionWidth = selection.offsetWidth;
//         let dynamicCSS = `.selection { width: ${selectionWidth}px; display: inline-block; }\n`;
//         pages.forEach((page, index) => {
//             const offsetPixels = index * selectionWidth;
//             dynamicCSS += `.slide_buttons label:nth-child(${index + 1
//                 }):has(input:checked)~.selection { transform: translateX(calc(${offsetPixels}px)); }\n`;
//         });
//         styleTag.textContent = dynamicCSS;
//         document.head.appendChild(styleTag);
//     }

//     // // Обработчики для кнопок выбора изображений
//     // imgSelectButtons.forEach((button) => {
//     //     button.addEventListener("click", function () {
//     //         const activeCard = this.closest(".card");
//     //         const mainImage = activeCard.querySelector("#card_main_img");
//     //         const selectedImage = this.querySelector("img").src;
//     //         if (mainImage && selectedImage) {
//     //             mainImage.src = selectedImage;
//     //         }
//     //     });
//     // });

//     window.addEventListener("load", () => {
//         // Получаем параметры из URL
//         const params = new URLSearchParams(window.location.search);
//         const selectedCardId = params.get("card"); // например, "card_1"

//         if (selectedCardId) {
//             const radioButton = document.getElementById(selectedCardId);
//             if (radioButton) {
//                 radioButton.checked = true;
//             } else {
//                 console.log(`Радиокнопка с ID ${selectedCardId} не найдена на этой странице.`);
//             }
//         }
//     });
// });
//------------------------------------------------------------

// document.addEventListener("DOMContentLoaded", function () {
//     const burgerCheckbox = document.querySelector("#burger_checkbox");
//     const navUl = document.querySelector("nav ul");

//     burgerCheckbox.addEventListener("change", function () {
//         if (this.checked) {
//             navUl.style.zIndex = "99";
//             navUl.style.top = "170px";
//             navUl.style.bottom = "0";
//         } else {
//             navUl.style.zIndex = "";
//             navUl.style.top = "";
//             navUl.style.bottom = "";
//         }
//     });
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const elements = document.querySelectorAll(".reveal");

//     const observer = new IntersectionObserver(entries => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add("visible");
//             } else {
//                 entry.target.classList.remove("visible");
//             }
//         });
//     }, { threshold: 0.1 });

//     elements.forEach(element => observer.observe(element));
// });

// document.addEventListener("DOMContentLoaded", function () {
//     const circle_menu = document.querySelector(".naming button");
//     const circle_menu_items = document.querySelectorAll(".naming_list li");
//     const descriptionList = document.querySelector(".naming_description_list");

//     if (circle_menu) {
//         let rotation = 90;

//         circle_menu.style.setProperty("--rotation", `${rotation}deg`);

//         circle_menu_items.forEach(item => {
//             item.style.setProperty("--rotation_img", "90deg");
//         });

//         document.querySelectorAll(".naming_text").forEach(el => el.classList.add("unchecked"));

//         const firstText = document.querySelector('.naming_text[data-id="naming_1"]');
//         if (firstText) firstText.classList.remove("unchecked");

//         descriptionList.style.top = "0";

//         circle_menu.addEventListener("click", function () {
//             rotation += 90;
//             if (rotation > 360) rotation = 90;

//             circle_menu.style.setProperty("--rotation", `${rotation}deg`);

//             circle_menu_items.forEach(item => {
//                 let itemRotation = parseFloat(getComputedStyle(item).getPropertyValue("--rotation_img")) || 0;
//                 item.style.setProperty("--rotation_img", `${itemRotation + 90}deg`);
//             });

//             document.querySelectorAll(".naming_text").forEach(el => el.classList.add("unchecked"));

//             const activeText = document.querySelector(`.naming_text[data-id="naming_${rotation / 90}"]`);
//             if (activeText) activeText.classList.remove("unchecked");

//             if (rotation === 90) {
//                 descriptionList.style.top = "0";
//             }
//             else if (rotation === 180) {
//                 descriptionList.style.top = "calc(110vh / -4)";
//             }
//             else if (rotation === 270) {
//                 descriptionList.style.top = "calc(110vh / -2)";
//             }
//             else if (rotation === 360) {
//                 descriptionList.style.top = "-85vh";
//             }
//         });
//     }
// });