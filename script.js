// ========================================
// ALIZONE - Main JavaScript
// ========================================


// ================================
// CART DATA
// ================================

let cart = JSON.parse(localStorage.getItem("alizoneCart")) || [];


// ================================
// PAGE LOAD
// ================================

document.addEventListener("DOMContentLoaded", function () {
    updateCart();

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                searchProducts();
            }
        });
    }
});


// ================================
// SEARCH PRODUCTS
// ================================

function searchProducts() {

    const input = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const products = document.querySelectorAll(".product-card");

    if (input === "") {
        products.forEach(function (product) {
            product.style.display = "";
        });

        return;
    }

    let found = false;

    products.forEach(function (product) {

        const title = product
            .querySelector("h3")
            .textContent
            .toLowerCase();

        const category = product
            .querySelector("small")
            .textContent
            .toLowerCase();

        if (
            title.includes(input) ||
            category.includes(input)
        ) {
            product.style.display = "";
            found = true;
        } else {
            product.style.display = "none";
        }
    });

    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });

    if (!found) {
        showMessage("No product found for: " + input);
    }
}


// ================================
// ADD TO CART
// ================================

function addToCart(name, price) {

    const existingProduct = cart.find(
        item => item.name === name
    );

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }

    saveCart();
    updateCart();

    showMessage(
        name + " added to your cart!"
    );
}


// ================================
// REMOVE FROM CART
// ================================

function removeFromCart(index) {

    if (index >= 0 && index < cart.length) {

        cart.splice(index, 1);

        saveCart();
        updateCart();

    }
}


// ================================
// CHANGE QUANTITY
// ================================

function changeQuantity(index, amount) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCart();
}


// ================================
// SAVE CART
// ================================

function saveCart() {

    localStorage.setItem(
        "alizoneCart",
        JSON.stringify(cart)
    );
}


// ================================
// UPDATE CART
// ================================

function updateCart() {

    const cartCount =
        document.getElementById("cartCount");

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");


    // Total quantity

    const totalQuantity = cart.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );


    if (cartCount) {
        cartCount.textContent =
            totalQuantity;
    }


    // Cart empty

    if (!cartItems) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        if (cartTotal) {
            cartTotal.textContent =
                "Rs. 0";
        }

        return;
    }


    let html = "";
    let total = 0;


    cart.forEach(function (item, index) {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;


        html += `
            <div class="cart-item">

                <div>
                    <h4>${item.name}</h4>

                    <p>
                        Rs. ${formatPrice(item.price)}
                    </p>

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        margin-top:8px;
                    ">

                        <button
                            onclick="changeQuantity(${index}, -1)">
                            −
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            onclick="changeQuantity(${index}, 1)">
                            +
                        </button>

                    </div>
                </div>

                <div style="text-align:right">

                    <strong>
                        Rs. ${formatPrice(itemTotal)}
                    </strong>

                    <br>

                    <button
                        onclick="removeFromCart(${index})"
                        style="
                            margin-top:8px;
                            color:#e53935;
                        "
                    >
                        Remove
                    </button>

                </div>

            </div>
        `;
    });


    cartItems.innerHTML = html;


    if (cartTotal) {

        cartTotal.textContent =
            "Rs. " + formatPrice(total);

    }
}


// ================================
// FORMAT PRICE
// ================================

function formatPrice(number) {

    return Number(number).toLocaleString(
        "en-PK"
    );
}


// ================================
// OPEN CART
// ================================

function openCart() {

    const modal =
        document.getElementById("cartModal");

    if (modal) {
        modal.classList.add("active");
    }

    updateCart();
}


// ================================
// CLOSE CART
// ================================

function closeCart() {

    const modal =
        document.getElementById("cartModal");

    if (modal) {
        modal.classList.remove("active");
    }
}


// ================================
// CHECKOUT
// ================================

function checkout() {

    if (cart.length === 0) {

        showMessage(
            "Your cart is empty. Please add a product first."
        );

        return;
    }


    closeCart();


    const modal =
        document.getElementById(
            "checkoutModal"
        );

    if (modal) {
        modal.classList.add("active");
    }
}


// ================================
// CLOSE CHECKOUT
// ================================

function closeCheckout() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );

    if (modal) {
        modal.classList.remove("active");
    }
}


// ================================
// PLACE ORDER
// ================================

function placeOrder(event) {

    event.preventDefault();


    const payment =
        document.getElementById(
            "paymentMethod"
        ).value;


    if (!payment) {

        showMessage(
            "Please select a payment method."
        );

        return;
    }


    let paymentName = "";


    if (payment === "cod") {
        paymentName =
            "Cash on Delivery";
    }

    if (payment === "card") {
        paymentName =
            "Debit / Credit Card";
    }

    if (payment === "bank") {
        paymentName =
            "Bank Transfer";
    }


    const orderNumber =
        "ALI-" +
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    localStorage.setItem(
        "alizoneLastOrder",
        orderNumber
    );


    cart = [];

    saveCart();
    updateCart();

    closeCheckout();


    alert(
        "Order placed successfully!\n\n" +
        "Order Number: " +
        orderNumber +
        "\nPayment: " +
        paymentName +
        "\n\nThank you for shopping with ALIZONE!"
    );
}


// ================================
// SORT PRODUCTS
// ================================

function sortProducts() {

    const select =
        document.getElementById(
            "sortProducts"
        );

    const grid =
        document.getElementById(
            "productGrid"
        );

    if (!select || !grid) {
        return;
    }


    const products =
        Array.from(
            grid.querySelectorAll(
                ".product-card"
            )
        );


    const value =
        select.value;


    if (value === "low") {

        products.sort(function (a, b) {

            return (
                Number(a.dataset.price) -
                Number(b.dataset.price)
            );

        });

    }


    if (value === "high") {

        products.sort(function (a, b) {

            return (
                Number(b.dataset.price) -
                Number(a.dataset.price)
            );

        });

    }


    products.forEach(function (product) {

        grid.appendChild(product);

    });
}


// ================================
// SELLER FORM
// ================================

function openSellerForm() {

    const modal =
        document.getElementById(
            "sellerModal"
        );

    if (modal) {
        modal.classList.add("active");
    }
}


function closeSellerForm() {

    const modal =
        document.getElementById(
            "sellerModal"
        );

    if (modal) {
        modal.classList.remove("active");
    }
}


// ================================
// REGISTER SELLER
// ================================

function registerSeller(event) {

    event.preventDefault();


    const shopName =
        document.getElementById(
            "shopName"
        ).value;


    closeSellerForm();


    alert(
        "Congratulations!\n\n" +
        shopName +
        " seller registration has been submitted.\n\n" +
        "ALIZONE Seller Center will contact you soon."
    );


    event.target.reset();
}


// ================================
// TRACK ORDER
// ================================

function trackOrder() {

    const order =
        localStorage.getItem(
            "alizoneLastOrder"
        );


    if (order) {

        alert(
            "Your latest order:\n\n" +
            "Order Number: " +
            order +
            "\n\n" +
            "Status: Processing\n\n" +
            "This is a demo tracking system."
        );

    } else {

        alert(
            "No order found.\n\n" +
            "Place an order first to track it."
        );

    }
}


// ================================
// NEWSLETTER
// ================================

function subscribeNewsletter(event) {

    event.preventDefault();


    const email =
        document.getElementById(
            "email"
        ).value;


    if (!email) {
        return;
    }


    alert(
        "Thank you!\n\n" +
        email +
        " has been subscribed to ALIZONE deals."
    );


    event.target.reset();
}


// ================================
// GENERAL MESSAGE
// ================================

function showMessage(message) {

    alert(
        message +
        "\n\nThis feature is available in the ALIZONE demo."
    );
}


// ================================
// MOBILE MENU
// ================================

function toggleMenu() {

    const nav =
        document.querySelector(
            ".main-nav"
        );


    if (!nav) {
        return;
    }


    nav.classList.toggle(
        "menu-open"
    );
}


// ================================
// LOGIN
// ================================

function openLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (modal) {
        modal.classList.add("active");
    }
}


function closeLogin() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (modal) {
        modal.classList.remove("active");
    }
}


function loginUser(event) {

    event.preventDefault();


    closeLogin();


    alert(
        "Demo Login Successful!\n\n" +
        "Real user accounts require a backend database."
    );


    event.target.reset();
}


// ================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ================================

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "active"
            );

        }

    }
);


// ================================
// ESC KEY CLOSE MODAL
// ================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal.active"
                )
                .forEach(function (modal) {

                    modal.classList.remove(
                        "active"
                    );

                });

        }

    }
);