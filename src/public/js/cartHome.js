function showModal(productName) {
    const modalBody = document.querySelector('#successModal .modal-body');
    modalBody.textContent = `"${productName}" agregado al carro.`;

    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    setTimeout(() => {
        modal.hide();
    }, 1600);
}

async function addToCart(productId, productName, productPrice) {
    try {

        let parsedProductPrice = parseFloat(productPrice);
        const productData = {
            name: productName,
            price: parsedProductPrice,
            quantity: 1,
        };

        const userId = document.getElementById('userId').value;

        const response = await fetch(`/api/users/${userId}/cart/${productId}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        console.log('🔄 Respuesta recibida:', response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`❌ Error ${response.status}: ${response.statusText} - ${errorText}`);
        }
        showModal(productName);
    } catch (error) {
        console.error('🚨 Error al agregar producto:', error);
        alert('Error al agregar producto. Ver consola para más detalles.');
    }
}

async function showCart() {
    try {
        const userId = document.getElementById('userId').value;
        const cartId = document.getElementById('cartId').value;
        const response = await fetch(`/api/users/${userId}/cart/${cartId}`);

        if (!response.ok) {
            throw new Error(`Error al obtener el carrito: ${response.statusText}`);
        }

        const cartData = await response.json();

        const cartItemsElement = document.getElementById('cartItems');
        const totalPriceElement = document.getElementById('totalPrice');

        cartItemsElement.innerHTML = '';
        console.log(cartData.cartItems, 'CONSOLE PARA VERIFICAR ITEMPRODUCT')

        cartData.cartItems.forEach(item => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            img.src = item.product.imageUrl;
            img.alt = item.name;
            img.style.width = '50px';
            img.style.marginRight = '10px';

            const text = document.createElement('span');
            text.textContent = `${item.name}, Cantidad: ${item.quantity}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '-';
            deleteButton.classList.add('btn', 'btn-danger', 'ms-2');
            deleteButton.onclick = () => removeProductFromCart(item.product._id, item.product.name)

            li.appendChild(img);
            li.appendChild(text);
            li.appendChild(deleteButton)

            cartItemsElement.appendChild(li);
        });

        totalPriceElement.textContent = `$${cartData.totalPrice.toFixed(2)}`;

        const modal = new bootstrap.Modal(document.getElementById('cartModal'));
        modal.show();

    } catch (error) {
        console.error('🚨 Error al obtener el carrito:', error);
        alert('Error al obtener el carrito. Revisa la consola.');
    }
}

async function removeProductFromCart(productId, productName) {
    try {
        const userId = document.getElementById('userId').value;
        const response = await fetch(`/api/users/${userId}/cart/${productId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Error al eliminar el producto ${response.statusText}`)
        }

        const result = await response.json();
        // Actualizar el carrito mostrado
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        cartModal.hide()

        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show()

    } catch (error) {
        console.error('🚨 Error al eliminar el producto del carrito:', error);
        alert('Error al eliminar el producto. Revisa la consola.');
    }
}
