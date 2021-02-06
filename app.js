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
                  <i class="fas fa-shopping-cart">Add to cart</i>
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

                this.showCart();
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

    showCart() {
        cartOverlay.classList.add('js-transparentBckg');
        cartDOM.classList.add('js-showCart');
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
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    products
        .getProducts()
        .then(ourProducts => {
            ui.displayProducts(ourProducts);

            Storage.saveProducts(ourProducts);
        })
        .then(() => {
            ui.getAddToCartButtons();
        });
});
