const apiUrl = 'http://localhost:5000/products';

// Fetch and display all products
// function getAllProducts() {
//     axios.get(apiUrl)
//         .then(response => {
//             const products = response.data;
//             const tableBody = document.querySelector('#productsTable tbody');
//             tableBody.innerHTML = '';
//             products.forEach(product => {
//                 const row = `
//                     <tr>
//                         <td>${product.id}</td>
//                         <td>${product.name}</td>
//                         <td>${product.description}</td>
//                         <td>${product.price}</td>
//                         <td>${product.quantity_available}</td>
//                         <td>
//                             <button class="btn btn-info" onclick="editProduct(${product.id})">Edit</button>
//                             <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
//                         </td>
//                     </tr>
//                 `;
//                 tableBody.innerHTML += row;
//             });
//         })
//         .catch(error => console.error('Error fetching products:', error));
// }
const rowsPerPage = 10;
let currentPage = 1;
let products = []; // Store all products fetched from the API

// Fetch all products from the API
function getAllProducts() {
    axios.get(apiUrl)
        .then(response => {
            products = response.data; 
            console.log(products);
            totalPages = Math.ceil(products.length / rowsPerPage);
            renderTable(currentPage);
            renderPagination();
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Render the table for the current page
function renderTable(page) {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '';

    const start = (page - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, products.length);

    for (let i = start; i < end; i++) {
        const product = products[i];
        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.price}</td>
                <td>${product.quantity_available}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    }
}

// Render pagination controls
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item${i === currentPage ? ' active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    setupPagination();
}

// Setup event listeners for pagination
function setupPagination() {
    document.querySelectorAll('#pagination a.page-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = parseInt(this.getAttribute('data-page'));
            renderTable(currentPage);
            renderPagination();
        });
    });
}

// Fetch and display a single product by ID
function getProductById() {
    const productId = document.getElementById('productId').value;
    axios.get(`${apiUrl}/${productId}`)
        .then(response => {
            const product = response.data;
            const productDetail = document.getElementById('productDetail');
            productDetail.innerHTML = `
                <p><strong>ID:</strong> ${product.id}</p>
                <p><strong>Name:</strong> ${product.name}</p>
                <p><strong>Description:</strong> ${product.description}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Quantity:</strong> ${product.quantity_available}</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            document.getElementById('productDetail').innerHTML = '<p class="text-danger">Product not found</p>';
        });
}

// Add a new product
function addProduct(event) {
    event.preventDefault();
    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: document.getElementById('productPrice').value,
        quantity_available: document.getElementById('productQuantity').value
    };
    axios.post(apiUrl, product)
        .then(response => {
            alert('Product added successfully');
            document.getElementById('productForm').reset();
            getAllProducts();
        })
        .catch(error => console.error('Error adding product:', error));
}

// Delete a product by ID
function deleteProduct(productId) {
    axios.delete(`${apiUrl}/${productId}`)
        .then(response => {
            alert('Product deleted successfully');
            getAllProducts();
        })
        .catch(error => console.error('Error deleting product:', error));
}


let currentlyEditingProductId = null;

function editProduct(productId) {
    const editForm = document.getElementById('editProductForm');
    const editBlock = document.getElementById('editBlock');
    if (currentlyEditingProductId === productId && editForm.style.display === 'block') {
        // Hide the form if it's currently visible and the same product is being edited
        editForm.style.display = 'none';
        editBlock.style.display = 'none'
        currentlyEditingProductId = null;
    } else {
        // Fetch product details and show the form
        axios.get(`${apiUrl}/${productId}`)
            .then(response => {
                const product = response.data;
                document.getElementById('editProductId').value = product.id;
                document.getElementById('editProductName').value = product.name;
                document.getElementById('editProductDescription').value = product.description;
                document.getElementById('editProductPrice').value = product.price;
                document.getElementById('editProductQuantity').value = product.quantity_available;
                editBlock.style.display = 'Block'
                editForm.style.display = 'block';
                currentlyEditingProductId = productId;
            })
            .catch(error => console.error('Error fetching product:', error));
    }
}

// Example function to handle form submission
document.getElementById('editProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productId = document.getElementById('editProductId').value;
    const updatedProduct = {
        name: document.getElementById('editProductName').value,
        description: document.getElementById('editProductDescription').value,
        price: document.getElementById('editProductPrice').value,
        quantity_available: document.getElementById('editProductQuantity').value
    };

    axios.put(`${apiUrl}/${productId}`, updatedProduct)
        .then(response => {
            console.log('Product updated:', response.data);
            // Hide the form after update
            document.getElementById('editProductForm').style.display = 'none';
            // Optionally, refresh the product list
            getAllProducts();
        })
        .catch(error => console.error('Error updating product:', error));
});

// Update an existing product
function updateProduct(event) {
    event.preventDefault();
    const productId = document.getElementById('editProductId').value;
    const updatedProduct = {
        name: document.getElementById('editProductName').value,
        description: document.getElementById('editProductDescription').value,
        price: document.getElementById('editProductPrice').value,
        quantity_available: document.getElementById('editProductQuantity').value
    };
    axios.put(`${apiUrl}/${productId}`, updatedProduct)
        .then(response => {
            alert('Product updated successfully');
            document.getElementById('editProductForm').reset();
            document.getElementById('editProductForm').style.display = 'none';
            getAllProducts();
        })
        .catch(error => console.error('Error updating product:', error));
}

// Event listeners
document.getElementById('productForm').addEventListener('submit', addProduct);
document.getElementById('editProductForm').addEventListener('submit', updateProduct);

// Initial load
getAllProducts();
