"use strict";
import { fetchProducts, fetchCategories } from "./functions.js";
import { saveVote, getVotes } from "./firebase.js";

const setupToastClose = () => {
  const toast = document.getElementById("toast-interactive");
  const closeBtn = document.querySelector('[data-dismiss-target="#toast-interactive"]');
  const noAhoraBtn = document.querySelector('a[href="#"]:nth-child(2)');

  if (!toast) return;

  // Cerrar con la X
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.classList.add("hidden");
    });
  }

  // Cerrar con "No ahora"
  if (noAhoraBtn) {
    noAhoraBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toast.classList.add("hidden");
    });
  }
};

const showToast = () => {
  const toast = document.getElementById("toast-interactive");
  if (toast) {
    toast.classList.remove("hidden");
    setupToastClose();
  }
};

const showVideo = () => {
  const demo = document.getElementById("demo");
  if (demo) {
    demo.addEventListener("click", () => {
      window.open("https://www.youtube.com/watch?v=tl6u2NASUzU", "_blank");
    });
  }
};

const renderProducts = () => {
  fetchProducts("https://data-dawm.github.io/datum/reseller/products.json")
    .then(result => {
      if (result.success === true) {
        const container = document.getElementById("products-container");

        if (!container) {
          console.error(' Elemento con ID "products-container" no encontrado');
          return;
        }

        container.innerHTML = "";

        const products = result.body.slice(0, 6);

        products.forEach(product => {
          let productHTML = `
<div class="product-card bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden transition duration-300 border border-neutral-200 dark:border-neutral-700">
  <div class="relative">
    <div class="w-full h-48 bg-gradient-to-br from-brand-pink-100 to-brand-pink-200 dark:from-brand-pink-900 dark:to-brand-pink-800 flex items-center justify-center">
      <i class="fas fa-birthday-cake text-6xl text-brand-pink-500"></i>
    </div>
    <div class="absolute top-4 right-4 bg-brand-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
      $${product.price}
    </div>
  </div>
  <div class="p-5">
    <h3 class="font-bold text-lg mb-2 text-neutral-800 dark:text-white">${product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title}</h3>
    <p class="text-neutral-600 dark:text-neutral-400 mb-4">
      ${product.description || 'Delicioso producto artesanal hecho con ingredientes de calidad.'}
    </p>
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <i class="fas fa-star text-accent-500 mr-1"></i>
        <span class="text-sm text-neutral-600 dark:text-neutral-400">4.8 (${Math.floor(Math.random() * 100) + 50})</span>
      </div>
      <button class="text-sm bg-gradient-to-r from-brand-pink-500 to-brand-pink-600 text-white px-4 py-2 rounded-full font-semibold hover:shadow transition">
        Pedir Ahora
      </button>
    </div>
  </div>
</div>`;

          container.innerHTML += productHTML;
        });
      } else {
        alert(result.error);
      }
    })
    .catch(error => {
      console.error("Error al obtener los productos:", error);
    });
};

const setupCategoryFilter = () => {
  const categorySelect = document.getElementById("categories");

  if (!categorySelect) {
    console.error('Elemento con ID "categories" no encontrado');
    return;
  }

  categorySelect.addEventListener('change', function () {
    const selectedCategory = this.value;
    filterProductsByCategory(selectedCategory);
  });
};

const filterProductsByCategory = (category) => {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');

    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
      // Animación suave
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.opacity = '1';
      }, 50);
    } else {
      card.style.display = 'none';
    }
  });

  // Mostrar mensaje si no hay productos en la categoría
  const visibleProducts = document.querySelectorAll('.product-card[style="display: block"]');
  const productsContainer = document.getElementById('products-container');

  if (visibleProducts.length === 0 && category !== 'all') {
    const noProductsMsg = document.getElementById('no-products-message');
    if (!noProductsMsg) {
      const message = document.createElement('div');
      message.id = 'no-products-message';
      message.className = 'col-span-3 text-center py-8';
      message.innerHTML = `
        <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No hay productos en esta categoría</h3>
        <p class="text-gray-500 dark:text-gray-400">Prueba seleccionando otra categoría</p>
      `;
      productsContainer.appendChild(message);
    }
  } else {
    const noProductsMsg = document.getElementById('no-products-message');
    if (noProductsMsg) {
      noProductsMsg.remove();
    }
  }
};

const renderCategories = async () => {
  try {
    const container = document.getElementById("categories");
    if (!container) {
      console.error('Elemento con ID "categories" no encontrado');
      return;
    }
    console.log("Selector de categorías configurado");
  } catch (error) {
    console.error("Error en renderCategories:", error);
  }
};

const enableForm = () => {
  const form = document.getElementById('form_voting');

  if (!form) {
    console.error('No se encontró el formulario con id "form_voting".');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const selectProduct = document.getElementById('select_product');

    if (!selectProduct) {
      console.error('Elemento con ID "select_product" no encontrado');
      return;
    }

    const value = selectProduct.value;

    if (!value) {
      if (window.showToast) {
        window.showToast('Por favor seleccione un producto antes de enviar el voto.');
      } else {
        alert('Por favor seleccione un producto antes de enviar el voto.');
      }
      return;
    }

    try {
      console.log("Enviando voto para:", value);
      const result = await saveVote(value);

      if (result.status === "success") {
        if (window.showToast) {
          window.showToast(result.message);
        } else {
          alert(result.message);
        }
        await displayVotes();
        selectProduct.value = '';
      } else {
        if (window.showToast) {
          window.showToast(`Error: ${result.message}`);
        } else {
          alert(`Error: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Error en enableForm:", error);
      if (window.showToast) {
        window.showToast(`Error al guardar el voto: ${error.message}`);
      } else {
        alert(`Error al guardar el voto: ${error.message}`);
      }
    }
  });
};

// Función para mostrar los votos
const displayVotes = async () => {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) {
    console.warn('Elemento "results" no encontrado');
    return;
  }

  try {
    console.log("Obteniendo votos de Firebase...");
    const result = await getVotes();

    if (!result.success) {
      resultsContainer.innerHTML = `<p class="text-red-500 text-center">${result.message}</p>`;
      return;
    }

    const votesData = result.data;
    console.log("Votos obtenidos:", votesData);

    if (!votesData || Object.keys(votesData).length === 0) {
      resultsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-300 text-center mt-8">Aún no hay votos registrados</p>';
      return;
    }

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

    let totalVotes = 0;
    Object.values(votesCount).forEach(count => {
      totalVotes += count;
    });

    // Mapeo de IDs de productos a nombres legibles
    const productNames = {
      'torta-chocolate': 'Torta de Chocolate',
      'cupcakes-decorados': 'Cupcakes Decorados',
      'galletas-personalizadas': 'Galletas Personalizadas',
      'chessecake': 'Chessecake de Maracuyá',
      'brownies': 'Brownies',
      'brazo-gitano': 'Brazo Gitano'
    };

    let resultsHTML = '<h3 class="font-bold text-lg mb-4 text-center text-brand-pink-500 dark:text-white">Resultados de la Votación</h3>';

    // Ordenar por número de votos
    const sortedProducts = Object.entries(votesCount).sort((a, b) => b[1] - a[1]);

    sortedProducts.forEach(([productId, count]) => {
      const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
      const productName = productNames[productId] || productId;

      resultsHTML += `
        <div class="mb-4">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${productName}</span>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${count} votos (${percentage}%)</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div class="bg-brand-pink-500 h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

    resultsHTML += `<p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">Total de votos: ${totalVotes}</p>`;
    resultsContainer.innerHTML = resultsHTML;

  } catch (error) {
    console.error("Error en displayVotes:", error);
    resultsContainer.innerHTML = `<p class="text-red-500 text-center">Error al obtener los votos: ${error.message}</p>`;
  }
};

// Inicialización
(async () => {
  try {
    enableForm();
    await displayVotes();
  } catch (error) {
    console.error("Error en la inicialización:", error);
  }
})();

(() => {
  console.log("Inicializando aplicación...");
  showToast();
  showVideo();
  renderProducts();
  renderCategories();
  setupCategoryFilter();
})();