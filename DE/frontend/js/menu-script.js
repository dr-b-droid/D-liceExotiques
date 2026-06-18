// Variables globales
let allMenus = [];
let cart = JSON.parse(localStorage.getItem('delicesCart')) || [];
let userFavorites = [];
let searchTimeout;
let currentSelectedCategory = 'all';
//dropdown menu
const categoryDropdown = document.querySelector('.category-dropdown');
const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
const categoryChevron = document.getElementById('categoryChevron');
const currentCategoryText = document.getElementById('currentCategory');
const categoryMenuItems = document.querySelectorAll('.category-menu-item');
// Système de recherche
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const clearSearchBtn = document.getElementById('clearSearch');
const noSearchResults = document.getElementById('no-search-results');

// Catégories avec leurs titres et icones
const categoryConfig = {
    entrees: { title: 'Entrées ', icon: 'coffee' },
    plats: { title: 'Plats Principaux Signature', icon: 'award' },
    desserts: { title: 'Desserts Gourmands', icon: 'heart' },
    boissons: { title: 'Boissons Artisanales', icon: 'droplet' }
};

// Charger les menus depuis l'API
async function loadMenus() {
    const loadingMsg = document.getElementById('loading-message');
    const errorMsg = document.getElementById('error-message');
    const emptyMsg = document.getElementById('empty-message');
    const container = document.getElementById('menu-container');

    try {
        loadingMsg.classList.remove('hidden');
        errorMsg.classList.add('hidden');
        emptyMsg.classList.add('hidden');
        container.innerHTML = '';

        const response = await window.api.getMenus();
        
        if (response.success && response.menus) {
            allMenus = response.menus;
            
            if (allMenus.length === 0) {
                loadingMsg.classList.add('hidden');
                emptyMsg.classList.remove('hidden');
            } else {
                loadingMsg.classList.add('hidden');
                renderMenus();
            }
        } else {
            throw new Error('Impossible de charger les menus');
        }
    } catch (error) {
        console.error('Error loading menus:', error);
        loadingMsg.classList.add('hidden');
        errorMsg.classList.remove('hidden');
    }

    feather.replace();
}

// Rendre les menus par catégorie
function renderMenus() {
    const container = document.getElementById('menu-container');
    
    // Grouper les menus par catégorie
    const menusByCategory = {
        entrees: allMenus.filter(m => m.category === 'entrees'),
        plats: allMenus.filter(m => m.category === 'plats'),
        desserts: allMenus.filter(m => m.category === 'desserts'),
        boissons: allMenus.filter(m => m.category === 'boissons')
    };

    let html = '';

    // Générer le HTML pour chaque catégorie
    for (const [category, menus] of Object.entries(menusByCategory)) {
        if (menus.length === 0) continue;

        const config = categoryConfig[category];
        html += `
            <div class="menu-category mb-16" data-category="${category}">
                <h2 class="text-3xl md:text-4xl font-serif mb-8 text-gold flex items-center gap-3">
                    <i data-feather="${config.icon}" class="text-gold"></i>
                    ${config.title}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${menus.map(menu => createMenuCard(menu)).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    feather.replace();
}

// Créer une carte de menu
function createMenuCard(menu) {
    const isFavorite = userFavorites.some(f => f.name === menu.name);
    
    return `
        <div class="bg-richbrown/20 border border-gold/20 rounded-xl overflow-hidden hover:border-gold/50 transition-all duration-300 group">
            <div class="relative overflow-hidden h-48">
                ${menu.image ? 
                    `<img src="${menu.image}" alt="${menu.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` :
                    `<div class="w-full h-full bg-gradient-to-br from-gold/20 to-emerald/20 flex items-center justify-center">
                        <i data-feather="image" class="text-gold/30" width="64" height="64"></i>
                    </div>`
                }
                <button onclick='toggleFavorite(${JSON.stringify(menu).replace(/'/g, "&apos;")})' class="favorite-btn absolute top-4 right-4 bg-deepblack/80 hover:bg-deepblack p-2 rounded-full transition-all z-10">
                    <i data-feather="heart" width="20" height="20" class="${isFavorite ? 'text-africanred' : 'text-white/60'}" ${isFavorite ? 'fill="currentColor"' : ''}></i>
                </button>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-serif text-gold">${menu.name}</h3>
                    <span class="text-emerald font-medium text-lg">${menu.price.toFixed(2)} fcfa</span>
                </div>
                <p class="text-white/80 text-sm mb-4">${menu.description}</p>
                <div class="flex gap-2">
                    <button onclick='addToFavoriteQuick(${JSON.stringify(menu).replace(/'/g, "&apos;")})' class="flex-shrink-0 bg-gold/10 hover:bg-gold/20 text-gold p-3 rounded-lg transition-all border border-gold/30" title="Ajouter aux favoris">
                        <i data-feather="heart" width="18" height="18"></i>
                    </button>
                    <button onclick='addToCart(${JSON.stringify(menu).replace(/'/g, "&apos;")})' class="flex-1 bg-gold hover:bg-gold/90 text-deepblack font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                        <i data-feather="plus" width="18" height="18"></i>
                        Ajouter au panier
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Gestion du panier
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="shopping-bag" class="text-gold/30 mx-auto mb-4" width="48" height="48"></i>
                <p class="text-white/60">Votre panier est vide</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="bg-richbrown/20 border border-gold/20 rounded-lg p-4">
                <div class="flex gap-3">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">` :
                        `<div class="w-20 h-20 bg-gold/10 rounded-lg flex items-center justify-center">
                            <i data-feather="image" class="text-gold/30" width="32" height="32"></i>
                        </div>`
                    }
                    <div class="flex-1">
                        <h4 class="text-white font-medium mb-2">${item.name}</h4>
                        <div class="flex justify-between items-center">
                            <span class="text-emerald">${item.price.toFixed(2)} fcfa</span>
                            <div class="flex items-center gap-2">
                                <button onclick='decreaseQuantity("${item.id}")' class="bg-gold/10 hover:bg-gold/20 text-gold w-8 h-8 rounded flex items-center justify-center">
                                    <i data-feather="minus" width="16" height="16"></i>
                                </button>
                                <span class="text-white w-8 text-center">${item.quantity}</span>
                                <button onclick='increaseQuantity("${item.id}")' class="bg-gold/10 hover:bg-gold/20 text-gold w-8 h-8 rounded flex items-center justify-center">
                                    <i data-feather="plus" width="16" height="16"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toFixed(2)} fcfa`;

    feather.replace();
    localStorage.setItem('delicesCart', JSON.stringify(cart));
}

function addToCart(menu) {
    const existingItem = cart.find(item => item.id === menu.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: menu.id,
            name: menu.name,
            price: menu.price,
            image: menu.image,
            quantity: 1
        });
    }
    
    updateCartUI();
    showToast('Ajouté au panier ', 'success');
}

function increaseQuantity(menuId) {
    const item = cart.find(item => item.id === menuId);
    if (item) {
        item.quantity++;
        updateCartUI();
    }
}

function decreaseQuantity(menuId) {
    const item = cart.find(item => item.id === menuId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(i => i.id !== menuId);
        }
        updateCartUI();
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    sidebar.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

async function clearCart() {
    if (await notify.confirm('Etes-vous sur de vouloir vider votre panier ?')) {
        cart = [];
        updateCartUI();
    }
}

async function checkout() {
    if (cart.length === 0) {
        notify.info('Votre panier est vide');
        return;
    }
    
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        if (await notify.confirm('Vous devez être connecté pour passer commande. Voulez-vous vous connecter maintenant ?')) {
            sessionStorage.setItem('pendingCart', JSON.stringify(cart));
            window.location.href = 'auth.html?form=login&redirect=/menu';
        }
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
        })),
        total: total
    };
    
    try {
        const response = await window.api.createOrder(orderData);
        
        if (response.success) {
            cart = [];
            updateCartUI();
            localStorage.removeItem('delicesCart');
            toggleCart();
            showOrderSuccessModal(response.order);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        notify.info('Erreur lors du passage de la commande: ' + error.message);
    }
}

// Gestion des favoris
async function loadUserFavorites() {
    if (window.authManager && window.authManager.isAuthenticated()) {
        try {
            const response = await window.api.getFavorites();
            if (response.success) {
                userFavorites = response.favorites;
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }
}

async function toggleFavorite(menu) {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        if (await notify.confirm('Vous devez être connecté pour ajouter des favoris. Voulez-vous vous connecter maintenant ?')) {
            sessionStorage.setItem('returnToMenu', 'true');
            window.location.href = 'auth.html?form=login&redirect=/menu';
        }
        return;
    }
    
    const isFavorite = userFavorites.some(f => f.name === menu.name);
    
    try {
        if (isFavorite) {
            const favorite = userFavorites.find(f => f.name === menu.name);
            await window.api.removeFavorite(favorite.id);
            userFavorites = userFavorites.filter(f => f.id !== favorite.id);
            showToast('Retiré des favoris', 'info');
        } else {
            const response = await window.api.addFavorite({
                name: menu.name,
                category: menu.category,
                price: menu.price,
                image: menu.image
            });
            
            if (response.success) {
                userFavorites.push(response.favorite);
                showToast('Ajouté aux favoris ', 'success');
            }
        }
        
        renderMenus();
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('Erreur lors de la modification', 'error');
    }
}

async function addToFavoriteQuick(menu) {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        if (await notify.confirm('Vous devez être connecté pour ajouter des favoris. Voulez-vous vous connecter maintenant ?')) {
            sessionStorage.setItem('returnToMenu', 'true');
            window.location.href = 'auth.html?form=login&redirect=/menu';
        }
        return;
    }
    
    try {
        const response = await window.api.addFavorite({
            name: menu.name,
            category: menu.category,
            price: menu.price,
            image: menu.image
        });
        
        if (response.success) {
            userFavorites.push(response.favorite);
            renderMenus();
            showToast('Ajouté aux favoris', 'success');
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
        if (error.message && error.message.includes('déjà dans vos favoris')) {
            showToast('Déjà dans vos favoris', 'info');
        } else {
            showToast('Erreur lors de l\'ajout', 'error');
        }
    }
}

// Afficher un toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-full`;
    
    const colors = {
        success: 'bg-emerald/90 text-white border border-emerald',
        error: 'bg-africanred/90 text-white border border-africanred',
        info: 'bg-gold/90 text-deepblack border border-gold'
    };
    
    toast.classList.add(...colors[type].split(' '));
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-y-full'), 10);
    
    setTimeout(() => {
        toast.classList.add('translate-y-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modale de succès de commande
function showOrderSuccessModal(order) {
    const modal = document.createElement('div');
    modal.id = 'order-success-modal';
    modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-richbrown/90 border-2 border-gold/50 rounded-xl p-8 md:p-12 max-w-lg w-full text-center transform scale-0 transition-transform duration-500">
            <div class="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-feather="check-circle" class="text-gold" width="48" height="48"></i>
            </div>
            <h3 class="text-3xl font-serif text-gold mb-4">Commande Confirmée !</h3>
            <p class="text-white/90 mb-6 text-lg">
                Merci pour votre commande ! Nous préparons vos plats avec soin.
            </p>
            <div class="bg-deepblack/30 border border-gold/20 rounded-lg p-4 mb-6">
                <p class="text-white/70 text-sm mb-2">Numéro de commande</p>
                <p class="text-gold font-bold text-xl">${order.id}</p>
                <p class="text-white/70 text-sm mt-4 mb-2">Total</p>
                <p class="text-gold font-bold text-2xl">${order.total.toFixed(2)}  fcfa</p>
            </div>
            <div class="flex gap-3">
                <button onclick="window.location.href='profile.html?tab=orders'" class="flex-1 bg-gold hover:bg-gold/90 text-deepblack font-medium py-3 px-6 rounded-lg transition-all">
                    Voir ma commande
                </button>
                <button onclick="closeOrderModal()" class="px-6 py-3 bg-deepblack/50 hover:bg-deepblack/70 border border-gold/20 text-white rounded-lg transition-all">
                    Fermer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
    
    setTimeout(() => modal.querySelector('div').classList.add('scale-100'), 10);
}

function closeOrderModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.querySelector('div').classList.remove('scale-100');
        setTimeout(() => modal.remove(), 300);
    }
}

// Fonction de recherche
function performSearch(query) {
    if (!query || query.length < 2) {
        searchResults.classList.add('hidden');
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Filtrer les menus
    const results = allMenus.filter(menu => {
        return menu.name.toLowerCase().includes(lowerQuery) ||
                menu.description.toLowerCase().includes(lowerQuery) ||
                menu.category.toLowerCase().includes(lowerQuery);
    });

    displaySearchResults(results, query);
    filterMenusBySearch(results);
}

// Afficher les résultats de recherche (dropdown compact)
function displaySearchResults(results, query) {
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-result-compact text-center text-white/50 py-4">
                <i data-feather="search" class="mx-auto mb-2" width="20" height="20"></i>
                <p class="text-sm">Aucun résultat trouvé</p>
            </div>
        `;
        searchResults.classList.remove('hidden');
        feather.replace();
        return;
    }

    const html = results.slice(0, 6).map(menu => {
        const highlightedName = highlightText(menu.name, query);
        const categoryName = getCategoryDisplayName(menu.category);
        
        return `
            <div class="search-result-compact fade-in-result" onclick="scrollToMenu('${menu._id || menu.id}')">
                <div class="flex items-center gap-3">
                    ${menu.image ? 
                        `<img src="${menu.image}" alt="${menu.name}" class="w-12 h-12 object-cover rounded-lg flex-shrink-0">` :
                        `<div class="w-12 h-12 bg-gradient-to-br from-gold/20 to-emerald/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i data-feather="image" class="text-gold/30" width="20" height="20"></i>
                        </div>`
                    }
                    <div class="flex-1 min-w-0">
                        <h4 class="text-white font-medium text-sm truncate">${highlightedName}</h4>
                        <p class="text-white/50 text-xs">${categoryName}</p>
                    </div>
                    <div class="text-gold font-medium text-sm whitespace-nowrap">${menu.price} FCFA</div>
                </div>
            </div>
        `;
    }).join('');

    searchResults.innerHTML = html;
    searchResults.classList.remove('hidden');
    feather.replace();
}

// Filtrer les menus affichés en fonction de la recherche
function filterMenusBySearch(results) {
    const container = document.getElementById('menu-container');
    const noResultsMsg = document.getElementById('no-search-results');
    const searchQueryText = document.getElementById('search-query-text');

    if (results.length === 0) {
        container.innerHTML = '';
        searchQueryText.textContent = searchInput.value;
        noResultsMsg.classList.remove('hidden');
        return;
    }

    noResultsMsg.classList.add('hidden');

    // Grouper les résultats par catégorie
    const resultsByCategory = {
        entrees: results.filter(m => m.category === 'entrees'),
        plats: results.filter(m => m.category === 'plats'),
        desserts: results.filter(m => m.category === 'desserts'),
        boissons: results.filter(m => m.category === 'boissons')
    };

    const categoryConfig = {
        entrees: { title: 'Entrées ', icon: 'coffee' },
        plats: { title: 'Plats Principaux Signature', icon: 'award' },
        desserts: { title: 'Desserts Gourmands', icon: 'heart' },
        boissons: { title: 'Boissons Artisanales', icon: 'droplet' }
    };

    let html = '';

    for (const [category, menus] of Object.entries(resultsByCategory)) {
        if (menus.length === 0) continue;

        const config = categoryConfig[category];
        html += `
            <div class="menu-category mb-16" data-category="${category}">
                <h2 class="text-3xl md:text-4xl font-serif mb-8 text-gold flex items-center gap-3">
                    <i data-feather="${config.icon}" class="text-gold"></i>
                    ${config.title}
                    <span class="text-sm text-white/50 font-normal">(${menus.length})</span>
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${menus.map(menu => createMenuCard(menu)).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    feather.replace();
}

// Mettre en surbrillance le texte recherché
function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Obtenir le nom d'affichage de la catégorie
function getCategoryDisplayName(category) {
    const names = {
        entrees: 'Entrées',
        plats: 'Plats Principaux',
        desserts: 'Desserts',
        boissons: 'Boissons'
    };
    return names[category] || category;
}

// Scroller vers un menu spécifique et fermer le dropdown
function scrollToMenu(menuId) {
    // Fermer le dropdown de recherche
    searchResults.classList.add('hidden');
    
    const menuCard = document.querySelector(`[data-menu-id="${menuId}"]`);
    if (menuCard) {
        // Scroll vers la carte
        menuCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Animation
        menuCard.classList.add('animate-bounce-card');
        setTimeout(() => {
            menuCard.classList.remove('animate-bounce-card');
        }, 600);
    }
}

// Effacer la recherche
function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    searchResults.classList.add('hidden');
    noSearchResults.classList.add('hidden');
    
    // Réafficher tous les menus avec le filtre actuel
    if (typeof renderMenus === 'function') {
        renderMenus();
        if (currentSelectedCategory !== 'all') {
            filterCategory(currentSelectedCategory);
        }
    }
}

// Override de la fonction filterCategory pour gérer le dropdown
function filterCategory(category) {
    const categories = document.querySelectorAll('.menu-category');
    
    // Filtrer les catégories
    if (category === 'all') {
        categories.forEach(cat => cat.style.display = 'block');
    } else {
        categories.forEach(cat => {
            if (cat.dataset.category === category) {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        });
    }
}

// Toggle dropdown
categoryDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryDropdown.classList.toggle('active');
    
    // Animer le chevron
    if (categoryDropdown.classList.contains('active')) {
        categoryChevron.style.transform = 'rotate(180deg)';
    } else {
        categoryChevron.style.transform = 'rotate(0deg)';
    }
});

// Sélection d'une catégorie
categoryMenuItems.forEach(item => {
    item.addEventListener('click', () => {
        const category = item.dataset.category;
        const categoryName = item.querySelector('span').textContent;
        
        // Mettre à jour l'UI
        categoryMenuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategoryText.textContent = categoryName;
        
        // Fermer le dropdown
        categoryDropdown.classList.remove('active');
        categoryChevron.style.transform = 'rotate(0deg)';
        
        // Filtrer les menus
        currentSelectedCategory = category;
        filterCategory(category);
    });
});

// Fermer le dropdown si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!categoryDropdown.contains(e.target)) {
        categoryDropdown.classList.remove('active');
        categoryChevron.style.transform = 'rotate(0deg)';
    }
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    // Afficher/Cacher le bouton clear
    if (query.length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
        searchResults.classList.add('hidden');
        noSearchResults.classList.add('hidden');
        // Réafficher tous les menus
        if (typeof renderMenus === 'function') {
            renderMenus();
        }
        return;
    }

    // Debounce pour éviter trop de requêtes
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
});
// Fermer les résultats si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});
// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    await loadMenus();
    await loadUserFavorites();
    updateCartUI();
    // Vérifier s'il y a un panier en attente après la connexion
    const pendingCart = sessionStorage.getItem('pendingCart');
    if (pendingCart) {
        cart = JSON.parse(pendingCart);
        sessionStorage.removeItem('pendingCart');
        updateCartUI();
        toggleCart();
    }

    // Si retour après connexion
    if (sessionStorage.getItem('returnToMenu')) {
        sessionStorage.removeItem('returnToMenu');
        await loadUserFavorites();
        renderMenus();
    }

    feather.replace();
});

// Ecouter les changements d'authentification
document.addEventListener('authStateChanged', async (e) => {
if (e.detail.isAuthenticated) {
    await loadUserFavorites();
    renderMenus();
} else {
    userFavorites = [];
    renderMenus();
}
});