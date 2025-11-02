"use strict";
import { fetchProducts } from './functions.js';
import { saveVote, getVotes } from './firebase.js';

// Definir la función flecha renderProducts
const renderProducts = () => {
    // Llamar a fetchProducts con la URL indicada
    fetchProducts('https://data-dawm.github.io/datum/reseller/products.json')
        .then(result => {
            // Verificar si el resultado fue exitoso
            if (result.success) {
                // Obtener el contenedor y limpiar su contenido
                const container = document.getElementById('products-container');
                container.innerHTML = '';

                // Obtener los primeros 6 productos
                const products = result.body.slice(0, 6);

                // Recorrer cada producto y generar la tarjeta
                products.forEach(product => {
                    // Plantilla base de la tarjeta del producto
                    let productHTML = `
                        <div class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                            <img
                                class="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg object-cover transition-transform duration-300 hover:scale-[1.03]"
                                src="[PRODUCT.IMGURL]" alt="[PRODUCT.TITLE]">
                            <h3
                                class="h-6 text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:text-black-600 dark:hover:text-white-400">
                                $[PRODUCT.PRICE]
                            </h3>

                            <div class="h-5 rounded w-full">[PRODUCT.TITLE]</div>
                                <div class="space-y-2">
                                    <a href="[PRODUCT.PRODUCTURL]" target="_blank" rel="noopener noreferrer"
                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full inline-block">
                                        Ver en Amazon
                                    </a>
                                    <div class="hidden"><span class="1">[PRODUCT.CATEGORY_ID]</span></div>
                                </div>
                            </div>
                        </div>`;

                    // Reemplazar los marcadores de posición con los valores del producto
                    productHTML = productHTML.replaceAll('[PRODUCT.IMG_URL]', product.imgUrl);
                    productHTML = productHTML.replaceAll('[PRODUCT.TITLE]', product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title);
                    productHTML = productHTML.replaceAll('[PRODUCT.PRICE]', product.price);
                    productHTML = productHTML.replaceAll('[PRODUCT.URL]', product.productURL);
                    productHTML = productHTML.replaceAll('[PRODUCT.CATEGORY_ID]', product.category_id);

                    // Agregar el producto al contenedor
                    container.innerHTML += productHTML;
                });
            } else {
                // Mostrar alerta con el mensaje de error
                alert('Error: ' + result.message);
            }
        })
        .catch(error => {
            // Capturar errores inesperados de red o JSON
            console.error('Error al obtener los productos:', error);
            alert('Hubo un problema al cargar los productos.');
        });
};

// Llamar a la función renderProducts en una función de autoejecución
(() => {
    renderProducts();
})();

(() => {
    alert("¡Bienvenido a la página!");
    console.log("Mensaje de bienvenida mostrado.");
})();

/**
 * Muestra un mensaje tipo "toast" en la interfaz, 
 * añadiendo la clase CSS correspondiente al elemento con id "toast-interactive".
 * 
 * @function
 * @returns {void}
 */
const showToast = () => {
    const toast = document.getElementById("toast-interactive");
    if (toast) {
        toast.classList.add("md:block");
    }
};

/**
 * Agrega un evento click al elemento con id "demo" que abre un video en una nueva pestaña.
 * 
 * @function
 * @returns {void}
 */
const showVideo = () => {
    const demo = document.getElementById("demo");
    if (demo) {
        demo.addEventListener("click", () => {
            window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
        });
    }
};

const enableForm = () => {
  // Obtener referencia al formulario
  const form = document.getElementById('form_voting');

  // Asegurarse de que el formulario exista en el DOM
  if (!form) {
    console.error('No se encontró el formulario con id "form_voting".');
    return;
  }

  // Agregar listener al evento 'submit'
  form.addEventListener('submit', async (event) => {
    // Evitar comportamiento por defecto del formulario
    event.preventDefault();

    // Obtener valor del elemento select_product
    const selectProduct = document.getElementById('select_product');
    const value = selectProduct?.value;

    if (!value) {
      alert('Por favor seleccione un producto antes de enviar el voto.');
      return;
    }

    try {
    const result = await saveVote(value);

    if (result.status === "success") {
      alert(result.message); // muestra el mensaje correcto
      await displayVotes();  // actualizar la tabla automáticamente
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    alert(`Error al guardar el voto: ${error.message}`);
  }
  });
};

// Función para mostrar los votos en una tabla
const displayVotes = async () => {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  try {
    const result = await getVotes();

    if (!result.success) {
      resultsContainer.innerHTML = `<p>${result.message}</p>`;
      return;
    }

    const votesData = result.data;

    // Contar votos por producto
    const votesCount = {};
    for (const key in votesData) {
      const vote = votesData[key];
      if (votesCount[vote.productID]) {
        votesCount[vote.productID]++;
      } else {
        votesCount[vote.productID] = 1;
      }
    }

    // Crear tabla HTML
    let tableHTML = `
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Total de votos</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const productID in votesCount) {
      tableHTML += `
        <tr>
          <td>${productID}</td>
          <td>${votesCount[productID]}</td>
        </tr>
      `;
    }

    tableHTML += `</tbody></table>`;

    resultsContainer.innerHTML = tableHTML;

  } catch (error) {
    resultsContainer.innerHTML = `<p>Error al obtener los votos: ${error.message}</p>`;
  }
};


(async () => {
  enableForm();
  await displayVotes();
})();


(() => {
    showToast();
    showVideo();
})();
