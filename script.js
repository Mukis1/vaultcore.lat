// ========================================
// VaultCore - Client-side JavaScript
// No external dependencies
// ========================================

(function() {
    'use strict';

    // ========================================
    // Cookie Banner Management
    // ========================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const declineCookiesBtn = document.getElementById('decline-cookies');

    // Check if user has already made a cookie choice
    if (cookieBanner) {
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            cookieBanner.style.display = 'block';
        }

        if (acceptCookiesBtn) {
            acceptCookiesBtn.addEventListener('click', function() {
                localStorage.setItem('cookieConsent', 'accepted');
                cookieBanner.style.display = 'none';
            });
        }

        if (declineCookiesBtn) {
            declineCookiesBtn.addEventListener('click', function() {
                localStorage.setItem('cookieConsent', 'declined');
                cookieBanner.style.display = 'none';
            });
        }
    }

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Shopping Cart Management
    // ========================================
    let cart = JSON.parse(localStorage.getItem('vaultcoreCart')) || [];

    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count');
        const totalItems = cart.reduce(function(sum, item) {
            return sum + item.quantity;
        }, 0);
        cartCountElements.forEach(function(el) {
            el.textContent = totalItems;
        });
    }

    function saveCart() {
        localStorage.setItem('vaultcoreCart', JSON.stringify(cart));
        updateCartCount();
    }

    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (!notification) {
            const div = document.createElement('div');
            div.id = 'notification';
            div.className = 'notification';
            document.body.appendChild(div);
        }
        
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.className = 'notification notification-' + (type || 'success') + ' show';
        
        setTimeout(function() {
            notif.className = 'notification';
        }, 3000);
    }

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');

            const existingItem = cart.find(function(item) {
                return item.id === productId;
            });

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            saveCart();
            showNotification('Product added to cart!', 'success');
            
            // Facebook Pixel event
            if (typeof fbq !== 'undefined') {
                fbq('track', 'AddToCart', {
                    content_name: productName,
                    content_ids: [productId],
                    content_type: 'product',
                    value: productPrice,
                    currency: 'USD'
                });
            }
        });
    });

    // Buy Now functionality
    const buyNowButtons = document.querySelectorAll('.buy-now');
    buyNowButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');

            cart = [{
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            }];

            saveCart();
            window.location.href = 'checkout.html';
        });
    });

    // ========================================
    // Cart Page Functionality
    // ========================================
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        function renderCart() {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p><a href="index.html" class="btn-primary">Continue Shopping</a></div>';
                document.getElementById('cart-subtotal').textContent = '$0.00';
                document.getElementById('cart-total').textContent = '$0.00';
                return;
            }

            let html = '';
            let subtotal = 0;

            cart.forEach(function(item) {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                html += '<div class="cart-item" data-id="' + item.id + '">';
                html += '<img src="' + item.image + '" alt="' + item.name + '">';
                html += '<div class="cart-item-details">';
                html += '<h3>' + item.name + '</h3>';
                html += '<p class="cart-item-price">$' + item.price.toFixed(2) + '</p>';
                html += '</div>';
                html += '<div class="cart-item-quantity">';
                html += '<button class="qty-btn minus" data-id="' + item.id + '">-</button>';
                html += '<span>' + item.quantity + '</span>';
                html += '<button class="qty-btn plus" data-id="' + item.id + '">+</button>';
                html += '</div>';
                html += '<div class="cart-item-total">$' + itemTotal.toFixed(2) + '</div>';
                html += '<button class="remove-item" data-id="' + item.id + '"><i class="fas fa-trash"></i></button>';
                html += '</div>';
            });

            cartItemsContainer.innerHTML = html;
            document.getElementById('cart-subtotal').textContent = '$' + subtotal.toFixed(2);
            document.getElementById('cart-total').textContent = '$' + subtotal.toFixed(2);

            attachCartEventListeners();
        }

        function attachCartEventListeners() {
            document.querySelectorAll('.qty-btn.plus').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const item = cart.find(function(i) { return i.id === id; });
                    if (item) {
                        item.quantity += 1;
                        saveCart();
                        renderCart();
                    }
                });
            });

            document.querySelectorAll('.qty-btn.minus').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const item = cart.find(function(i) { return i.id === id; });
                    if (item && item.quantity > 1) {
                        item.quantity -= 1;
                        saveCart();
                        renderCart();
                    }
                });
            });

            document.querySelectorAll('.remove-item').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    cart = cart.filter(function(item) { return item.id !== id; });
                    saveCart();
                    renderCart();
                    showNotification('Item removed from cart', 'info');
                });
            });
        }

        renderCart();
    }

    // ========================================
    // Checkout Page Functionality
    // ========================================
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (checkoutItemsContainer) {
        function renderCheckout() {
            if (cart.length === 0) {
                window.location.href = 'cart.html';
                return;
            }

            let html = '';
            let subtotal = 0;

            cart.forEach(function(item) {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                html += '<div class="checkout-item">';
                html += '<img src="' + item.image + '" alt="' + item.name + '">';
                html += '<div class="checkout-item-info">';
                html += '<h4>' + item.name + '</h4>';
                html += '<p>Quantity: ' + item.quantity + '</p>';
                html += '<p>$' + itemTotal.toFixed(2) + '</p>';
                html += '</div>';
                html += '</div>';
            });

            checkoutItemsContainer.innerHTML = html;
            document.getElementById('checkout-subtotal').textContent = '$' + subtotal.toFixed(2);
            document.getElementById('checkout-total').textContent = '$' + subtotal.toFixed(2);
        }

        renderCheckout();
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const subtotal = cart.reduce(function(sum, item) {
                return sum + (item.price * item.quantity);
            }, 0);

            localStorage.setItem('orderTotal', subtotal.toFixed(2));

            // Clear cart
            cart = [];
            saveCart();

            // Redirect to success page
            window.location.href = 'success.html';
        });
    }

    // ========================================
    // Contact Form Handling
    // ========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formSuccess = document.getElementById('form-success');
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';

            // Reset form
            setTimeout(function() {
                contactForm.reset();
                contactForm.style.display = 'block';
                formSuccess.style.display = 'none';
            }, 5000);
        });
    }

    // ========================================
    // Initialize Cart Count on Page Load
    // ========================================
    updateCartCount();

})();
