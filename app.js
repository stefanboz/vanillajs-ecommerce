const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
let addToCartBtnsDOM = [];

// fetch products
class Products {
    async getProducts() {
        try {
            let result = await fetch('./products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;

                return { title, price, id, image };
            });

            return products;
        } catch (error) {
            console.log(error);
            alert('Error');
        }
    }
}

// display products
class UI {
    displayProducts(products) {
        let result = '';

        products.forEach(product => {
            result += `
            <article class="product">
              <div class="img-container">
                <img
                  src=${product.image}
                  alt=${product.title}
                  class="product-img"
                />
                <button class="add-to-cart-btn" data-id=${product.id}>
                  <i class="fas fa-shopping-cart"></i> Add to cart
                </button>
              </div>
              <h3>${product.title}</h3>
              <h4>$${product.price}</h4>
            </article>
          `;
        });

        productsDOM.innerHTML = result;
    }

    getAddToCartButtons() {
        const addToCartBtns = [
            ...document.querySelectorAll('.add-to-cart-btn'),
        ];

        addToCartBtnsDOM = addToCartBtns;

        addToCartBtns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);

            if (inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
            }

            button.addEventListener('click', event => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                // get product, add it to the cart, save cart to LS, update cart total, display cart items, show the cart
                let cartItem = { ...Storage.getProduct(id), amount: 1 };

                cart = [...cart, cartItem];

                Storage.saveCart(cart);

                this.setCartValues(cart);

                this.addCartItem(cartItem);

                this.toggleCart();
            });
        });
    }

    setCartValues(cart) {
        let tmpTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tmpTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tmpTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const cartItemWrapper = document.createElement('div');
        cartItemWrapper.classList.add('cart-item');
        cartItemWrapper.innerHTML = `
          <img
              src=${item.image}
              alt=${item.title}
          />

          <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>Remove</span>
          </div>

          <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
        `;
        cartContent.appendChild(cartItemWrapper);
    }

    toggleCart() {
        cartOverlay.classList.toggle('js-transparentBckg');
        cartDOM.classList.toggle('js-showCart');
    }

    setupApp() {
        cart = Storage.getCart();

        this.setCartValues(cart);
        this.populateCart(cart);

        cartBtn.addEventListener('click', this.toggleCart);
        closeCartBtn.addEventListener('click', this.toggleCart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        clearCartBtn.addEventListener('click', () => this.clearCart());
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

        this.toggleCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);

        let singleAddToCartButton = this.getSingleAddToCartButton(id);
        singleAddToCartButton.disabled = false;
        singleAddToCartButton.innerHTML = `<i class="fas fa-shopping-cart"></i> Add to cart`;
    }

    getSingleAddToCartButton(id) {
        return addToCartBtnsDOM.find(button => button.dataset.id === id);
    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));

        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart')
            ? JSON.parse(localStorage.getItem('cart'))
            : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    ui.setupApp();

    products
        .getProducts()
        .then(ourProducts => {
            ui.displayProducts(ourProducts);

            Storage.saveProducts(ourProducts);
        })
        .then(() => {
            ui.getAddToCartButtons();
            ui.cartLogic();
        });
});
