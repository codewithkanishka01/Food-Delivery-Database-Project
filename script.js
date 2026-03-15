/** 
 * MULTI-PAGE STATE & SCRIPTING
 */

// Shared State Structure stored in sessionStorage
// - customerName: String
// - cart: Array of {id, name, price, qty}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
        initLoginPage();
    } else if (path === '/menu') {
        initMenuPage();
    } else if (path === '/cart') {
        initCartPage();
    }
});


/** ============================
 *  LOGIN PAGE
 *  ============================ */
function initLoginPage() {
    // Clear out residual old state if someone lands straight on login
    sessionStorage.removeItem('customerName');
    sessionStorage.removeItem('cart');

    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('customerNameInput').value.trim();
            if (nameInput) {
                sessionStorage.setItem('customerName', nameInput);
                sessionStorage.setItem('cart', JSON.stringify([])); // Init empty cart
                window.location.href = '/menu';
            }
        });
    }
}


/** ============================
 *  MENU PAGE
 *  ============================ */
let menuDataCache = [];

function initMenuPage() {
    // 1. Auth check
    const userName = sessionStorage.getItem('customerName');
    if(!userName) {
        window.location.href = '/';
        return;
    }
    
    // 2. Personalize
    document.getElementById('displayUserName').textContent = userName;
    
    // 3. Update Cart Badge
    updateNavBadge();

    // 4. Fetch and render menu
    fetchMenuData();
}

async function fetchMenuData() {
    const loading = document.getElementById('loading');
    const menuGrid = document.getElementById('menuGrid');
    
    try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        menuDataCache = data;
        
        loading.style.display = 'none';
        menuGrid.innerHTML = '';
        
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <div class="menu-img-wrapper">
                    <img src="/static/img/${item.image}" alt="${item.item_name}">
                </div>
                <div class="menu-card-body">
                    <div class="card-header">
                        <div>
                            <h3 class="item-name">${item.item_name}</h3>
                            <p class="restaurant-name"><i class="ph-fill ph-storefront"></i> ${item.rest_name}</p>
                        </div>
                        <span class="price-tag">₹${item.price}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToSessionCart(${item.item_id})">
                        <i class="ph-bold ph-plus"></i> Add to Cart
                    </button>
                </div>
            `;
            menuGrid.appendChild(card);
        });
        
    } catch (err) {
        loading.innerHTML = "<span style='color: var(--danger)'>Failed to load menu. Is server running?</span>";
    }
}

// Ensure function is available globally for inline onclick
window.addToSessionCart = function(itemId) {
    const menuItem = menuDataCache.find(i => i.item_id === itemId);
    if (!menuItem) return;

    let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === itemId);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: menuItem.item_id,
            name: menuItem.item_name,
            price: menuItem.price,
            qty: 1
        });
    }

    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateNavBadge();
    showToast(`Added ${menuItem.item_name} to cart!`);
};


/** ============================
 *  CART PAGE
 *  ============================ */
function initCartPage() {
    // 1. Auth check
    const userName = sessionStorage.getItem('customerName');
    if(!userName) {
        window.location.href = '/';
        return;
    }

    // 2. Render Name
    const summaryNameEl = document.getElementById('summaryName');
    if(summaryNameEl) summaryNameEl.textContent = userName;

    // 3. Render Cart
    renderCartItems();

    // 4. Checkout Logic
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
}

window.updateCartQty = function(id, change) {
    let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    
    sessionStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
};

window.removeCartItem = function(id) {
    let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    cart = cart.filter(i => i.id !== id);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
};

function renderCartItems() {
    let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const container = document.getElementById('cartItemsContainer');
    const summaryDetails = document.getElementById('summaryDetails');
    const grandTotalEl = document.getElementById('grandTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Clean summary items (keep the name row)
    const nameRow = summaryDetails.firstElementChild;
    summaryDetails.innerHTML = '';
    summaryDetails.appendChild(nameRow);

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" id="emptyCartView">
                <i class="ph ph-shopping-cart"></i>
                <p>Your cart is empty.</p>
                <a href="/menu" class="primary-btn mt-4 inline-block">Browse Menu</a>
            </div>
        `;
        grandTotalEl.textContent = '₹0.00';
        if(checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if(checkoutBtn) checkoutBtn.disabled = false;
    container.innerHTML = '';
    let grandTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        // Render Left Panel Item
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">₹${item.price} x ${item.qty}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)"><i class="ph ph-minus"></i></button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)"><i class="ph ph-plus"></i></button>
                <div style="width: 1px; height: 16px; background: var(--card-border); margin: 0 0.5rem;"></div>
                <button class="qty-btn delete-btn" onclick="removeCartItem(${item.id})"><i class="ph-bold ph-trash"></i></button>
            </div>
        `;
        container.appendChild(el);

        // Render Right Summary Item
        const sumRow = document.createElement('div');
        sumRow.className = 'summary-row item-row';
        sumRow.innerHTML = `
            <span>${item.qty}x ${item.name}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
        `;
        summaryDetails.appendChild(sumRow);
    });

    grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
}

async function processCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const userName = sessionStorage.getItem('customerName');

    if(cart.length === 0) return;

    const btnContent = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="ph ph-spinner-gap spin"></i> Processing...';
    checkoutBtn.disabled = true;

    const payload = {
        customerName: userName,
        items: cart.map(i => ({ id: i.id, qty: i.qty }))
    };

    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Clear cart from memory
            sessionStorage.removeItem('cart');
            
            // Show Modal Receipt
            showSuccessModal(data);
        } else {
            showToast(data.error || 'Failed to place order', true);
            checkoutBtn.innerHTML = btnContent;
            checkoutBtn.disabled = false;
        }

    } catch (err) {
        showToast('Network error, please try again.', true);
        checkoutBtn.innerHTML = btnContent;
        checkoutBtn.disabled = false;
    }
}

function showSuccessModal(data) {
    const modal = document.getElementById('successModal');
    document.getElementById('receiptName').textContent = data.customer;
    
    // Build Receipt HTML
    const rItems = document.getElementById('receiptItems');
    rItems.innerHTML = '';
    data.order_summary.forEach(item => {
        const div = document.createElement('div');
        div.className = 'receipt-item';
        div.innerHTML = `
            <span>${item.qty}x ${item.name}</span>
            <span>₹${item.total.toFixed(2)}</span>
        `;
        rItems.appendChild(div);
    });

    document.getElementById('receiptTotal').textContent = `₹${data.grand_total.toFixed(2)}`;
    
    // Bind New Order btn to clear identity and go to root
    document.getElementById('newOrderBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/';
    });

    modal.classList.add('active');
}


/** ============================
 *  GLOBAL UTILITIES
 *  ============================ */
function updateNavBadge() {
    const badge = document.getElementById('cartBadge');
    if(!badge) return;

    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalItems;
}

let toastTimer;
window.showToast = function(msg, isError = false) {
    const toast = document.getElementById('toast');
    if(!toast) return;

    const toastMsg = document.getElementById('toastMsg');
    
    toastMsg.textContent = msg;
    toast.querySelector('i').className = isError ? 'ph-bold ph-warning-circle' : 'ph-bold ph-check-circle';
    toast.style.color = isError ? 'var(--danger)' : 'var(--bg-color)';
    toast.style.background = isError ? '#fee2e2' : 'var(--text-main)';

    toast.classList.add('show');
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};
