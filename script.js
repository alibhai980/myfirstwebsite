// ========================================
// ALIZONE - Main JavaScript
// ========================================


// ================================
// CART DATA
// ================================

let cart = JSON.parse(localStorage.getItem("alizoneCart")) || [];


// ================================
// Language translations and switcher
const translations = {
  en: {
    welcome: "Welcome to ALIZONE Pakistan",
    seller_center: "Seller Center",
    customer_service: "Customer Service",
    account_greeting: "Hello, Sign in",
    account_status: "Account & Orders",
    cart_label: "Cart",
    nav_home: "Home",
    nav_categories: "Categories",
    nav_deals: "Today's Deals",
    search_placeholder: "Search products on ALIZONE..."
  },
  ur: {
    welcome: "ALIZONE پاکستان میں خوش آمدید",
    seller_center: "سیلر سینٹر",
    customer_service: "کسٹمر سروس",
    account_greeting: "ہیلو، سائن ان",
    account_status: "اکاؤنٹ اور آرڈرز",
    cart_label: "کارٹ",
    nav_home: "ہوم",
    nav_categories: "کیٹیگریز",
    nav_deals: "آج کی ڈیلز",
    search_placeholder: "ALIZONE پر مصنوعات تلاش کریں..."
  },
  ar: {
    welcome: "مرحبًا بكم في ALIZONE باكستان",
    seller_center: "مركز البائع",
    customer_service: "خدمة العملاء",
    account_greeting: "مرحبًا، سجل الدخول",
    account_status: "الحساب والطلبات",
    cart_label: "عربة التسوق",
    nav_home: "الصفحة الرئيسية",
    nav_categories: "الفئات",
    nav_deals: "عروض اليوم",
    search_placeholder: "ابحث عن منتجات في ALIZONE..."
  },
  hi: {},
  bn: {},
  pa: {},
  ps: {},
  fa: {},
  tr: {},
  zh: {}
};

function changeLanguage(lang) {
  if (!translations[lang]) return;
  // Update text content for elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  // Update placeholders for inputs with data-i18n-placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });
  // RTL support for selected languages
  const rtlLangs = ['ur', 'ar', 'fa', 'ps'];
  document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  localStorage.setItem('alizoneLang', lang);
}
// ================================
// PAGE LOAD
// ================================

document.addEventListener("DOMContentLoaded", async function () {
    updateCart();

    // Supabase Auth Initialization
    if (typeof initSupabaseAuth === "function") {
        initSupabaseAuth();
    }
    // Load products for all visitors
    loadProducts();

    // Apply saved language or default to English
    const savedLang = localStorage.getItem('alizoneLang') || 'en';
    const langSelect = document.getElementById('language');
    if (langSelect) { langSelect.value = savedLang; }
    changeLanguage(savedLang);

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

function addToCart(productId, name, price) {
    // Add product to cart with its Supabase ID for later stock update
    const existingProduct = cart.find(
        item => item.id === productId
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showMessage(`${name} added to your cart!`);
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

async function placeOrder(event) {

    event.preventDefault();


    // Collect checkout details
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const city = document.getElementById('custCity').value;
    const payment = document.getElementById('paymentMethod').value;

    // Basic validation
    if (!name || !phone || !address || !city || !payment) {
        showMessage('Please fill all checkout fields.');
        return;
    }
    if (!currentUser) {
        showMessage('You must be signed in to place an order.');
        return;
    }
    if (cart.length === 0) {
        showMessage('Your cart is empty.');
        return;
    }


    // Validate cart items against latest product data (price & stock)
let totalAmount = 0;
const validatedItems = [];
for (const item of cart) {
    const { data, error } = await supabaseClient
        .from('products')
        .select('id, price, stock')
        .eq('id', item.id)
        .single();
    if (error) {
        showMessage(`Unable to validate product ${item.name}.`);
        return;
    }
    if (data.stock < item.quantity) {
        showMessage(`Insufficient stock for ${item.name}. Available: ${data.stock}`);
        return;
    }
    if (Number(data.price) !== Number(item.price)) {
        showMessage(`Price changed for ${item.name}. Please refresh.`);
        return;
    }
    totalAmount += item.price * item.quantity;
    validatedItems.push({
        product_id: data.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        stock: data.stock
    });
}

// Determine payment status and name
let paymentStatus = (payment === "cod") ? "pending" : "unconfirmed";
let paymentName = "";
if (payment === "cod") {
    paymentName = "Cash on Delivery";
} else if (payment === "card") {
    paymentName = "Debit / Credit Card";
} else if (payment === "bank") {
    paymentName = "Bank Transfer";
}

// Generate order number
const orderNumber = `ALI-${Math.floor(100000 + Math.random() * 900000)}`;

// Insert order into Supabase
const { error: orderError } = await supabaseClient.from('orders').insert([
    {
        order_number: orderNumber,
        customer_id: currentUser.id,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        city: city,
        payment_method: payment,
        total_amount: totalAmount,
        items: validatedItems,
        status: 'processing',
        payment_status: paymentStatus
    }
]);
if (orderError) {
    console.error('Order insertion failed:', orderError);
    showMessage('Failed to place order. Please try again.');
    return;
}

// Decrement stock for each product
for (const item of validatedItems) {
    await supabaseClient.from('products')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.product_id);
}

// Store order number and clear cart
localStorage.setItem('alizoneLastOrder', orderNumber);
cart = [];
saveCart();
updateCart();
closeCheckout();

// Show confirmation with payment status
alert(`Order placed successfully!\nOrder Number: ${orderNumber}\nTotal: Rs. ${Number(totalAmount).toLocaleString('en-PK')}\nPayment: ${paymentName}\nPayment Status: ${paymentStatus}`);


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
// SELLER FORM & REGISTRATION (SUPABASE)
// ================================

function openSellerForm() {
    const modal = document.getElementById("sellerModal");
    const alertBox = document.getElementById("sellerAlert");
    if (alertBox) alertBox.style.display = "none";

    // Auto-fill if user is logged in
    if (currentUser) {
        const nameField = document.getElementById("sellerName");
        const emailField = document.getElementById("sellerEmail");
        if (nameField && currentProfile && currentProfile.full_name) {
            nameField.value = currentProfile.full_name;
        }
        if (emailField && currentUser.email) {
            emailField.value = currentUser.email;
        }

        // If user already applied, inform them
        if (currentSellerApp) {
            if (alertBox) {
                alertBox.className = "auth-alert " + (currentSellerApp.status === "approved" ? "success" : "error");
                alertBox.style.display = "block";
                alertBox.innerHTML = `<strong>Aapki Application Status: ${currentSellerApp.status.toUpperCase()}</strong><br>` +
                    (currentSellerApp.status === "pending"
                        ? "Aapki shop <em>" + currentSellerApp.shop_name + "</em> ki application pehle se zair-e-ghor (pending) hai. Hamari team jald tasdeeq karegi."
                        : "Mubarak ho! Aapki shop tasdeeq shuda (approved) hai.");
            }
        }
    } else {
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.innerHTML = "⚠️ <strong>Pehle Sign In Karein:</strong> Seller banne ke liye aapka ALIZONE account hona zaroori hai. <a href='#' onclick='closeSellerForm(); openLogin(); return false;' style='color: #000; text-decoration: underline; font-weight: bold;'>Yahan click karke Sign In / Sign Up karein</a>.";
        }
    }

    if (modal) {
        modal.classList.add("active");
    }
}

function closeSellerForm() {
    const modal = document.getElementById("sellerModal");
    if (modal) {
        modal.classList.remove("active");
    }
    const alertBox = document.getElementById("sellerAlert");
    if (alertBox) alertBox.style.display = "none";
}

async function registerSeller(event) {
    event.preventDefault();

    const alertBox = document.getElementById("sellerAlert");
    const submitBtn = document.getElementById("sellerSubmitBtn");

    if (!supabaseClient) {
        alert("Supabase client initialize nahi hua. supabase-config.js check karein.");
        return;
    }

    // Require logged in user so application is linked to an authenticated account
    if (!currentUser) {
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.innerHTML = "⚠️ Barah-e-karam pehle apna account <a href='#' onclick='closeSellerForm(); openLogin(); return false;'>Sign In / Sign Up</a> karein taake application aapke account se link ho sake.";
        }
        return;
    }

    const shopName = document.getElementById("shopName").value.trim();
    const sellerPhone = document.getElementById("sellerPhone").value.trim();
    const sellerEmail = document.getElementById("sellerEmail").value.trim();
    const sellerCity = document.getElementById("sellerCity").value;
    const sellerAddress = document.getElementById("sellerAddress").value.trim();
    const sellerCategory = document.getElementById("sellerCategory").value;

    if (!shopName || !sellerPhone || !sellerEmail || !sellerCity || !sellerAddress) {
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.textContent = "Barah-e-karam tamam zaroori fields darj karein.";
        }
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting Application...";
        }

        // Insert into Supabase seller_applications table with status strictly 'pending'
        const { data, error } = await supabaseClient
            .from("seller_applications")
            .insert([
                {
                    user_id: currentUser.id,
                    shop_name: shopName,
                    phone: sellerPhone,
                    email: sellerEmail,
                    address: sellerAddress + ", " + sellerCity,
                    category: sellerCategory,
                    status: "pending" // Strictly 'pending', users cannot approve their own application
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        // Success response
        if (alertBox) {
            alertBox.className = "auth-alert success";
            alertBox.style.display = "block";
            alertBox.innerHTML = `🎉 <strong>Mubarak!</strong> Aapki shop <strong>"${shopName}"</strong> ki application Supabase database mein save ho gayi hai.<br>` +
                `<small>Status: <strong>PENDING (Zair-e-Ghor)</strong>. ALIZONE Admin team iski jald tasdeeq karegi.</small>`;
        }

        // Refresh current user seller application state
        currentSellerApp = data && data[0] ? data[0] : { status: "pending", shop_name: shopName };
        updateAccountUI();

        event.target.reset();

    } catch (err) {
        console.error("Seller registration error:", err);
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.textContent = "Ghalti (Error): " + (err.message || "Application save nahi ho saki. Dobara koshish karein.");
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Seller Application";
        }
    }
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


// ========================================================
// REAL SUPABASE AUTHENTICATION & SESSION MANAGEMENT

// -------------------------------------------------
// LOAD PRODUCTS FROM SUPABASE
// -------------------------------------------------
async function loadProducts() {
    if (!supabaseClient) {
        console.warn("Supabase client not initialized – cannot load products.");
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .eq("is_active", true);
        if (error) throw error;
        const grid = document.getElementById("productGrid");
        if (!grid) return;
        // Clear existing static cards
        grid.innerHTML = "";
        data.forEach(p => {
            const priceFormatted = formatPrice(p.price);
            const originalPrice = p.original_price ? `<del>Rs. ${formatPrice(p.original_price)}</del>` : "";
            const discountTag = "";
                const cardHTML = `
                    <div class="product-card" data-price="${p.price}" data-id="${p.id}">
                        <div class="product-image">
                            <img src="${p.image_url || 'laptop.jpg'}" alt="${p.title}" class="product-img" loading="lazy" />
                        </div>
                        <div class="product-info">
                            <small>${p.category}</small>
                            <h3>${p.title}</h3>
                            <div class="rating">⭐${p.rating || 5} <span>(${p.reviews_count || 0})</span></div>
                            <div class="price"><strong>Rs. ${priceFormatted}</strong> ${originalPrice}</div>
                            <button onclick="addToCart('${p.title.replace(/'/g, "\\'")}', ${p.price})">Add to Cart</button>
                        </div>
                    </div>`;
            console.log('Fetched products:', data);
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (err) {
        console.error("Failed to load products from Supabase:", err);
    }
}

// ========================================================

let currentUser = null;
let currentProfile = null;
let currentSellerApp = null;

// Initialize Auth state and session listeners
async function initSupabaseAuth() {
    if (!supabaseClient) {
        console.warn("Supabase client is not ready.");
        return;
    }

    try {
        // 1. Check existing session
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (session && session.user) {
            currentUser = session.user;
            await loadUserProfileAndSellerStatus(session.user);
        } else {
            currentUser = null;
            currentProfile = null;
            currentSellerApp = null;
        }
        updateAccountUI();

        // 2. Listen to real-time auth changes (LOGIN, LOGOUT, TOKEN_REFRESHED)
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log("Supabase Auth Event:", event);
            if (session && session.user) {
                currentUser = session.user;
                await loadUserProfileAndSellerStatus(session.user);
            } else {
                currentUser = null;
                currentProfile = null;
                currentSellerApp = null;
            }
            updateAccountUI();
        });

    } catch (err) {
        console.error("Error initializing Supabase Auth:", err);
    }
}

// Load Profile and Seller Application from Supabase
async function loadUserProfileAndSellerStatus(user) {
    if (!supabaseClient || !user) return;

    try {
        // Fetch Profile
        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        currentProfile = profile;

        // Fetch latest Seller Application
        const { data: applications } = await supabaseClient
            .from("seller_applications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        currentSellerApp = applications && applications.length > 0 ? applications[0] : null;

    } catch (err) {
        console.warn("Could not load user profile or seller status:", err);
    }
}

// Update UI based on logged-in state
function updateAccountUI() {
    const greeting = document.getElementById("accountGreeting");
    const status = document.getElementById("accountStatus");

    if (currentUser) {
        const displayName = (currentProfile && currentProfile.full_name)
            ? currentProfile.full_name.split(" ")[0]
            : (currentUser.email ? currentUser.email.split("@")[0] : "User");

        if (greeting) greeting.textContent = "Hello, " + displayName;
        if (status) {
            const role = (currentProfile && currentProfile.role) ? currentProfile.role.toUpperCase() : "CUSTOMER";
            status.textContent = role === "SELLER" ? "⭐ SELLER" : "MY ACCOUNT";
        }

        // Update Account Modal details
        const accName = document.getElementById("accUserName");
        const accEmail = document.getElementById("accUserEmail");
        const accRole = document.getElementById("accUserRole");
        const accDate = document.getElementById("accUserDate");
        const accSellerText = document.getElementById("accSellerStatusText");
        const accSellerBox = document.getElementById("accSellerStatusBox");

        if (accName) accName.textContent = (currentProfile && currentProfile.full_name) || "Customer";
        if (accEmail) accEmail.textContent = currentUser.email;
        if (accRole) accRole.textContent = ((currentProfile && currentProfile.role) || "customer").toUpperCase();
        if (accDate && currentUser.created_at) {
            accDate.textContent = new Date(currentUser.created_at).toLocaleDateString();
        }

        if (accSellerText && accSellerBox) {
            if (currentSellerApp) {
                if (currentSellerApp.status === "approved") {
                    accSellerBox.style.background = "#def7ec";
                    accSellerBox.style.borderColor = "#84e1bc";
                    accSellerText.style.color = "#03543f";
                    accSellerText.innerHTML = `✅ <strong>Approved Seller:</strong> Shop: <em>${currentSellerApp.shop_name}</em>`;
                } else if (currentSellerApp.status === "pending") {
                    accSellerBox.style.background = "#fff8eb";
                    accSellerBox.style.borderColor = "#ffd591";
                    accSellerText.style.color = "#b7791f";
                    accSellerText.innerHTML = `⏳ <strong>Seller Application: PENDING</strong><br>Shop: <em>${currentSellerApp.shop_name}</em> (Admin review under process).`;
                } else {
                    accSellerBox.style.background = "#fde8e8";
                    accSellerBox.style.borderColor = "#f8b4b4";
                    accSellerText.style.color = "#9b1c1c";
                    accSellerText.innerHTML = `❌ <strong>Seller Application: REJECTED</strong>`;
                }
            } else {
                accSellerBox.style.background = "#f8fafc";
                accSellerBox.style.borderColor = "#e2e8f0";
                accSellerText.style.color = "#475569";
                accSellerText.innerHTML = `ℹ️ Aapne abhi seller banne ke liye apply nahi kiya.`;
            }
        }

    } else {
        if (greeting) greeting.textContent = "Hello, Sign in";
        if (status) status.textContent = "Account & Orders";
    }
}

// Click Header Account Button
function handleAccountClick() {
    if (currentUser) {
        openAccountModal();
    } else {
        openLogin();
    }
}

function openAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) modal.classList.add("active");
}

function closeAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) modal.classList.remove("active");
}

function openLogin() {
    const modal = document.getElementById("loginModal");
    switchAuthTab("signin");
    if (modal) modal.classList.add("active");
}

function closeLogin() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.remove("active");
    const alertBox = document.getElementById("authAlert");
    if (alertBox) alertBox.style.display = "none";
}

// Switch between Sign In, Sign Up, and Forgot Password Tabs
function switchAuthTab(tab) {
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    const forgotForm = document.getElementById("forgotForm");
    const tabSignInBtn = document.getElementById("tabSignInBtn");
    const tabSignUpBtn = document.getElementById("tabSignUpBtn");
    const authTabsContainer = document.getElementById("authTabsContainer");
    const title = document.getElementById("authModalTitle");
    const alertBox = document.getElementById("authAlert");

    if (alertBox) alertBox.style.display = "none";

    if (tab === "signin") {
        if (signInForm) signInForm.style.display = "flex";
        if (signUpForm) signUpForm.style.display = "none";
        if (forgotForm) forgotForm.style.display = "none";
        if (authTabsContainer) authTabsContainer.style.display = "flex";
        if (tabSignInBtn) tabSignInBtn.classList.add("active");
        if (tabSignUpBtn) tabSignUpBtn.classList.remove("active");
        if (title) title.textContent = "ALIZONE Sign In";
    } else if (tab === "signup") {
        if (signInForm) signInForm.style.display = "none";
        if (signUpForm) signUpForm.style.display = "flex";
        if (forgotForm) forgotForm.style.display = "none";
        if (authTabsContainer) authTabsContainer.style.display = "flex";
        if (tabSignInBtn) tabSignInBtn.classList.remove("active");
        if (tabSignUpBtn) tabSignUpBtn.classList.add("active");
        if (title) title.textContent = "Create Account";
    } else if (tab === "forgot") {
        if (signInForm) signInForm.style.display = "none";
        if (signUpForm) signUpForm.style.display = "none";
        if (forgotForm) forgotForm.style.display = "flex";
        if (authTabsContainer) authTabsContainer.style.display = "none";
        if (title) title.textContent = "Reset Password";
    }
}

// 1. Real Customer Sign In
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const alertBox = document.getElementById("authAlert");
    const submitBtn = document.getElementById("signInSubmitBtn");

    if (!supabaseClient) {
        alert("Supabase client initialize nahi hua.");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing In...";
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        if (alertBox) {
            alertBox.className = "auth-alert success";
            alertBox.style.display = "block";
            alertBox.textContent = "✅ Kamiyab Login! Khush aamdeed " + (data.user.email) + ".";
        }

        setTimeout(() => {
            closeLogin();
            event.target.reset();
        }, 800);

    } catch (err) {
        console.error("Login error:", err);
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.textContent = "Login Fail: " + (err.message || "Invalid credentials. Email aur password check karein.");
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign In";
        }
    }
}

// 2. Real Customer Sign Up
async function signupUser(event) {
    event.preventDefault();

    const fullName = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const phone = document.getElementById("signupPhone").value.trim();
    const alertBox = document.getElementById("authAlert");
    const submitBtn = document.getElementById("signUpSubmitBtn");

    if (!supabaseClient) {
        alert("Supabase client initialize nahi hua.");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating Account...";
        }

        // Security: role is always forced to 'customer' by application and Supabase trigger
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    role: "customer"
                }
            }
        });

        if (error) {
            throw error;
        }

        if (alertBox) {
            alertBox.className = "auth-alert success";
            alertBox.style.display = "block";
            if (data.session) {
                alertBox.textContent = "🎉 Account kamiyabi se ban gaya aur aap login ho chuke hain!";
                setTimeout(() => {
                    closeLogin();
                    event.target.reset();
                }, 1000);
            } else {
                alertBox.innerHTML = "🎉 <strong>Account Ban Gaya!</strong><br>Barah-e-karam apna email inbox check karein aur verification link par click karke account confirm karein.";
                event.target.reset();
            }
        }

    } catch (err) {
        console.error("Signup error:", err);
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.textContent = "Signup Ghalti: " + (err.message || "Account create nahi ho saka.");
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
        }
    }
}

// 3. Password Reset
async function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();
    const alertBox = document.getElementById("authAlert");
    const submitBtn = document.getElementById("forgotSubmitBtn");

    if (!supabaseClient) return;

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending Link...";
        }

        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email);
        if (error) throw error;

        if (alertBox) {
            alertBox.className = "auth-alert success";
            alertBox.style.display = "block";
            alertBox.textContent = "📧 Password recovery email bhej di gayi hai. Apna email inbox check karein.";
        }
        event.target.reset();

    } catch (err) {
        console.error("Reset password error:", err);
        if (alertBox) {
            alertBox.className = "auth-alert error";
            alertBox.style.display = "block";
            alertBox.textContent = "Ghalti: " + (err.message || "Email send nahi ho saki.");
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Password Reset Link";
        }
    }
}

// 4. Logout User
async function logoutUser() {
    if (!supabaseClient) return;

    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        currentUser = null;
        currentProfile = null;
        currentSellerApp = null;
        updateAccountUI();
        closeAccountModal();

        alert("Aap kamiyabi se Sign Out ho chuke hain.");
    } catch (err) {
        console.error("Logout error:", err);
        alert("Sign out error: " + (err.message || "Please try again."));
    }
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